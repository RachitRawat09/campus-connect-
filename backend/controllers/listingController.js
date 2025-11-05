const Listing = require('../models/Listing');
const User = require('../models/User');
const mongoose = require('mongoose');
// const Plan = require('../models/Plan');

// Create a new listing
exports.createListing = async (req, res) => {
  try {
    const { title, description, category, price, image, images = [], department, seller } = req.body;
    // Fetch seller
    const user = await User.findById(seller);
    if (!user) return res.status(404).json({ message: 'Seller not found' });

    // Subscription plans disabled – no quota checks

    // Create listing
    const listing = new Listing({
      title,
      description,
      category,
      price,
      image: image || '',
      images: Array.isArray(images) ? images.slice(0, 4) : [],
      seller: user._id,
      department,
    });
    await listing.save();
    // No quota tracking while plans are disabled
    res.status(201).json(listing);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all listings
exports.getListings = async (req, res) => {
  try {
    const { category, department, search, seller } = req.query;
    let filter = {};
    if (category) filter.category = category;
    if (department) filter.department = department;
    if (seller) filter.seller = seller;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    const listings = await Listing.find(filter)
      .populate('seller', 'name email averageRating numReviews')
      .populate('buyer', 'name email');
    res.json(listings);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get a single listing by ID
exports.getListingById = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id)
      .populate('seller', 'name email averageRating numReviews')
      .populate('buyer', 'name email');
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    res.json(listing);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update a listing
exports.updateListing = async (req, res) => {
  try {
    const listing = await Listing.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    res.json(listing);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a listing
exports.deleteListing = async (req, res) => {
  try {
    // First find the listing to check ownership and get image URLs
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Verify ownership
    if (listing.seller.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the seller can delete this listing' });
    }

    // Check if the listing is sold
    if (listing.isSold) {
      return res.status(400).json({ message: 'Cannot delete a sold listing' });
    }

    // Delete from database
    await Listing.findByIdAndDelete(req.params.id);

    // Clean up images from Cloudinary if they exist
    try {
      const { deleteFromCloudinary } = require('../utils/cloudinary');
      const allImages = [listing.image, ...(listing.images || [])].filter(Boolean);
      
      for (const imageUrl of allImages) {
        if (imageUrl && imageUrl.includes('cloudinary.com')) {
          const publicId = imageUrl.split('/').slice(-1)[0].split('.')[0];
          await deleteFromCloudinary(publicId);
        }
      }
    } catch (cloudinaryErr) {
      console.error('Error deleting images from Cloudinary:', cloudinaryErr);
      // Continue with the response even if image deletion fails
    }

    res.json({ message: 'Listing and associated images deleted successfully' });
  } catch (err) {
    console.error('Error deleting listing:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get all unique categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Listing.distinct('category', { category: { $exists: true, $ne: null, $ne: '' } });
    res.json(categories);
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get all unique departments
exports.getDepartments = async (req, res) => {
  try {
    const departments = await Listing.distinct('department', { department: { $exists: true, $ne: null, $ne: '' } });
    res.json(departments);
  } catch (err) {
    console.error('Error fetching departments:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get all purchases for a user
exports.getPurchasesByUser = async (req, res) => {
  console.log("req.user value:", req.user);
  try {
    // Get userId from query or auth token
    const userId = req.query.userId || req.user?.id || req.user?._id;
    
    // Validate user ID
    if (!userId) {
      return res.status(400).json({ message: 'User ID required' });
    }
    
    // Get authenticated user's ID (supporting both id and _id)
    const authenticatedUserId = req.user?.id || req.user?._id;
    
    if (!authenticatedUserId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Find listings where user is the buyer AND item is sold
    const query = {
      buyer: userId,
      isSold: true
    };
    
    let purchases;
    try {
      purchases = await Listing.find(query)
        .populate({
          path: 'seller',
          select: 'name email averageRating',
          options: { lean: true }
        })
        .populate({
          path: 'buyer',
          select: 'name email',
          options: { lean: true }
        })
        .sort({ updatedAt: -1 })
        .lean();
      
      console.log('13. Successfully fetched purchases:', {
        count: purchases.length,
        firstItem: purchases[0] ? {
          _id: purchases[0]._id,
          title: purchases[0].title,
          buyer: purchases[0].buyer?._id,
          seller: purchases[0].seller?._id
        } : null
      });
    } catch (dbError) {
      console.error('13. Database Error:', dbError);
      throw dbError;
    }
    
    console.log('14. Transforming results...');
    const transformedPurchases = purchases.map(purchase => {
      try {
        return {
          ...purchase,
          _id: purchase._id.toString(),
          seller: purchase.seller ? {
            ...purchase.seller,
            _id: purchase.seller._id.toString()
          } : null,
          buyer: purchase.buyer ? {
            ...purchase.buyer,
            _id: purchase.buyer._id.toString()
          } : null
        };
      } catch (transformError) {
        console.error('Transform error for purchase:', purchase._id, transformError);
        return purchase;
      }
    });
    
    console.log('15. Sending response with', transformedPurchases.length, 'purchases');
    res.json(transformedPurchases);
  } catch (err) {
    console.error('Error in getPurchasesByUser:', err);
    res.status(500).json({ 
      message: 'Error fetching purchases',
      error: err.message
    });
  }
};

// Add a review to a listing
exports.addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    // Prevent duplicate reviews by the same user
    if (listing.reviews.some(r => r.reviewer.toString() === req.user.id)) {
      return res.status(400).json({ message: 'You have already reviewed this listing.' });
    }
    const review = {
      reviewer: req.user.id,
      rating,
      comment,
    };
    listing.reviews.push(review);
    await listing.save();
    res.status(201).json({ message: 'Review added', reviews: listing.reviews });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all reviews for a listing
exports.getReviews = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id).populate('reviews.reviewer', 'name email');
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    res.json(listing.reviews);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Plans disabled – return static free plan info
exports.getUserPlanInfo = async (req, res) => {
  return res.json({
    plan: 'free',
    listingsThisPeriod: 0,
    planExpiresAt: null,
    planInfo: { name: 'free', listingLimit: Infinity, price: 0, durationDays: null },
    expired: false
  });
};

// Plans disabled – return empty list
exports.getPlans = async (req, res) => {
  return res.json([]);
};

// Plans disabled – acknowledge without changes
exports.subscribePlan = async (req, res) => {
  return res.json({ message: 'Plans disabled in test mode', plan: 'free', planExpiresAt: null });
};

// Mark listing as sold
exports.markAsSold = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });

    // Check if user is the seller
    if (listing.seller.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the seller can mark item as sold' });
    }

    listing.isSold = true;
    listing.buyer = req.body.buyerId || null; // Optional: specify buyer
    await listing.save();

    res.json({ message: 'Item marked as sold', listing });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
}; 