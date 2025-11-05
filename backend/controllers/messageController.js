const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const Listing = require('../models/Listing');
const User = require('../models/User');
const { sendNewChatEmail, sendRequestRejectedEmail } = require('../utils/emailService');

// Initiate a conversation request (sends default message, sets status=pending)
exports.initiateConversation = async (req, res) => {
  try {
    const { receiver, listing } = req.body;
    if (!receiver) return res.status(400).json({ message: 'Receiver required' });

    // find or create conversation
    let convo = await Conversation.findOne({
      participants: { $all: [req.user.id, receiver] },
      listing: listing || null,
    });

    if (!convo) {
      convo = await Conversation.create({
        participants: [req.user.id, receiver],
        listing: listing || null,
        status: 'pending',
        initiatedBy: req.user.id,
      });
    }

    // default message
    const content = `Hi! I'm interested in your listing. Is it still available?`;
    const message = await Message.create({ sender: req.user.id, receiver, content, listing });
    convo.lastMessageAt = new Date();
    await convo.save();

    // email notification (best-effort)
    try { await sendNewChatEmail(receiver, req.user.name || 'A student'); } catch (_) {}

    res.status(201).json({ conversation: convo, message });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Accept conversation
exports.acceptConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const convo = await Conversation.findById(conversationId);
    if (!convo) return res.status(404).json({ message: 'Conversation not found' });
    if (!convo.participants.map(String).includes(req.user.id)) {
      return res.status(403).json({ message: 'Not a participant' });
    }
    convo.status = 'accepted';
    await convo.save();
    res.json(convo);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Send a message (only if accepted or self-initiated pending first message)
exports.sendMessage = async (req, res) => {
  try {
    const { receiver, content, listing, conversationId } = req.body;
    if (!receiver && !conversationId) return res.status(400).json({ message: 'receiver or conversationId required' });

    let convo = conversationId
      ? await Conversation.findById(conversationId)
      : await Conversation.findOne({ participants: { $all: [req.user.id, receiver] }, listing: listing || null });

    if (!convo) return res.status(403).json({ message: 'Conversation not found' });
    if (!convo.participants.map(String).includes(req.user.id)) {
      return res.status(403).json({ message: 'Not a participant' });
    }
    if (convo.status !== 'accepted') {
      return res.status(403).json({ message: 'Conversation not accepted yet' });
    }

    const message = await Message.create({ sender: req.user.id, receiver: receiver || convo.participants.find(id => String(id) !== req.user.id), content, listing: listing || convo.listing });
    convo.lastMessageAt = new Date();
    await convo.save();
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get messages between two users (optionally filtered by listing)
exports.getMessages = async (req, res) => {
  try {
    const { userId, listingId } = req.query;
    const filter = {
      $or: [
        { sender: req.user.id, receiver: userId },
        { sender: userId, receiver: req.user.id }
      ]
    };
    if (listingId) filter.listing = listingId;
    const messages = await Message.find(filter).sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
}; 

// List conversations for the current user (exclude rejected ones)
exports.getConversations = async (req, res) => {
  try {
    const convos = await Conversation.find({ 
      participants: req.user.id,
      status: { $ne: 'rejected' } // Exclude rejected conversations
    })
      .populate('participants', 'name email')
      .populate('listing', 'title price category seller isSold')
      .populate('initiatedBy', 'name email')
      .sort({ lastMessageAt: -1 });
    res.json(convos);
  } catch (err) {
    console.error('Error fetching conversations:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Initiate sale - Seller requests buyer confirmation
exports.initiateSale = async (req, res) => {
  try {
    const { conversationId } = req.body;
    
    const convo = await Conversation.findById(conversationId);
    if (!convo) return res.status(404).json({ message: 'Conversation not found' });
    
    if (!convo.listing) return res.status(400).json({ message: 'No listing in this conversation' });
    
    const listing = await Listing.findById(convo.listing);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    
    // Check if user is the seller
    if (String(listing.seller) !== String(req.user.id)) {
      return res.status(403).json({ message: 'Only the seller can initiate sale' });
    }
    
    // Check if already sold
    if (listing.isSold) {
      return res.status(400).json({ message: 'Item is already sold' });
    }
    
    // Get buyer (other participant)
    const buyer = convo.participants.find(p => String(p) !== String(req.user.id));
    if (!buyer) return res.status(400).json({ message: 'Buyer not found' });
    
    // Update conversation sale status
    convo.saleStatus = 'pending_confirmation';
    convo.saleRequestedAt = new Date();
    await convo.save();
    
    // Send notification message to buyer
    const notificationMessage = await Message.create({
      sender: req.user.id,
      receiver: buyer,
      content: `${req.user.name || 'Seller'} wants to complete the sale. Please confirm to finalize the purchase.`,
      listing: convo.listing
    });
    
    convo.lastMessageAt = new Date();
    await convo.save();
    
    res.json({ 
      message: 'Sale request sent to buyer', 
      conversation: convo,
      notificationMessage 
    });
  } catch (err) {
    console.error('Error initiating sale:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Confirm sale - Buyer confirms the purchase
exports.confirmSale = async (req, res) => {
  try {
    const { conversationId } = req.body;
    
    const convo = await Conversation.findById(conversationId);
    if (!convo) return res.status(404).json({ message: 'Conversation not found' });
    
    if (!convo.listing) return res.status(400).json({ message: 'No listing in this conversation' });
    
    const listing = await Listing.findById(convo.listing);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    
    // Check if sale was requested
    if (convo.saleStatus !== 'pending_confirmation') {
      return res.status(400).json({ message: 'No sale request pending' });
    }
    
    // Check if current user is the buyer (not the seller)
    if (String(listing.seller) === String(req.user.id)) {
      return res.status(403).json({ message: 'Seller cannot confirm their own sale' });
    }
    
    // Check if user is a participant
    if (!convo.participants.map(String).includes(req.user.id)) {
      return res.status(403).json({ message: 'Not a participant in this conversation' });
    }
    
    // Mark listing as sold and set buyer
    listing.isSold = true;
    listing.buyer = req.user.id;
    await listing.save();
    
    // Verify the buyer was saved correctly
    const updatedListing = await Listing.findById(convo.listing);
    console.log('Listing after sale confirmation:', {
      listingId: updatedListing._id,
      isSold: updatedListing.isSold,
      buyer: updatedListing.buyer,
      buyerId: req.user.id
    });
    
    // Update conversation sale status
    convo.saleStatus = 'confirmed';
    convo.saleConfirmedAt = new Date();
    convo.buyerRated = false;
    await convo.save();
    
    // Find and reject all other pending/accepted conversations for the same listing
    const otherConversations = await Conversation.find({
      listing: convo.listing,
      _id: { $ne: convo._id }, // Exclude the current conversation
      status: { $in: ['pending', 'accepted'] } // Only reject pending/accepted ones
    }).populate('participants', 'name email');
    
    console.log(`Found ${otherConversations.length} other conversations to reject for listing ${convo.listing}`);
    
    // Get seller info for email
    const seller = await User.findById(listing.seller);
    const sellerName = seller?.name || 'Seller';
    
    // Reject all other conversations and send emails
    for (const otherConvo of otherConversations) {
      // Find the buyer (participant who is not the seller)
      const buyer = otherConvo.participants.find(p => 
        String(p._id) !== String(listing.seller)
      );
      
      if (buyer) {
        // Update conversation status to rejected
        otherConvo.status = 'rejected';
        otherConvo.saleStatus = 'none'; // Reset sale status
        await otherConvo.save();
        
        // Send rejection email (best-effort, don't block on errors)
        try {
          await sendRequestRejectedEmail(buyer._id, listing.title, sellerName);
        } catch (emailErr) {
          console.error(`Failed to send rejection email to ${buyer.email}:`, emailErr);
        }
        
        // Send rejection message in the conversation
        try {
          await Message.create({
            sender: listing.seller,
            receiver: buyer._id,
            content: `Sorry, this item "${listing.title}" has been sold to another buyer. Your request has been rejected.`,
            listing: convo.listing
          });
          otherConvo.lastMessageAt = new Date();
          await otherConvo.save();
        } catch (msgErr) {
          console.error('Failed to send rejection message:', msgErr);
        }
        
        console.log(`Rejected conversation ${otherConvo._id} for buyer ${buyer.name || buyer.email}`);
      }
    }
    
    // Send confirmation message
    const sellerParticipant = convo.participants.find(p => String(p) !== String(req.user.id));
    const confirmationMessage = await Message.create({
      sender: req.user.id,
      receiver: sellerParticipant,
      content: `${req.user.name || 'Buyer'} confirmed the purchase. Sale completed!`,
      listing: convo.listing
    });
    
    convo.lastMessageAt = new Date();
    await convo.save();
    
    res.json({ 
      message: 'Sale confirmed successfully', 
      listing,
      conversation: convo,
      confirmationMessage,
      rejectedConversations: otherConversations.length
    });
  } catch (err) {
    console.error('Error confirming sale:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Buyer rates the seller for a confirmed sale (per conversation)
exports.rateConversationSeller = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { rating } = req.body;
    const numeric = Number(rating);
    if (!numeric || numeric < 1 || numeric > 5) return res.status(400).json({ message: 'Rating 1-5 required' });

    const convo = await Conversation.findById(conversationId);
    if (!convo) return res.status(404).json({ message: 'Conversation not found' });
    if (convo.saleStatus !== 'confirmed') return res.status(400).json({ message: 'Sale not confirmed' });
    if (convo.buyerRated) return res.status(400).json({ message: 'Already rated' });
    // Identify buyer: not the seller
    const listing = await Listing.findById(convo.listing);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    const sellerId = String(listing.seller);
    const isBuyerParticipant = convo.participants.map(String).includes(req.user.id) && String(req.user.id) !== sellerId;
    if (!isBuyerParticipant) return res.status(403).json({ message: 'Only buyer can rate' });

    // Update seller aggregate rating
    const User = require('../models/User');
    const seller = await User.findById(sellerId);
    if (!seller) return res.status(404).json({ message: 'Seller not found' });
    const total = (seller.averageRating || 0) * (seller.numReviews || 0) + numeric;
    const count = (seller.numReviews || 0) + 1;
    seller.averageRating = total / count;
    seller.numReviews = count;
    await seller.save();

    convo.buyerRated = true;
    await convo.save();

    res.json({ message: 'Rating recorded', averageRating: seller.averageRating, numReviews: seller.numReviews });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};