const mongoose = require('mongoose');

const ConversationSchema = new mongoose.Schema(
  {
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
    listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing' },
    status: { type: String, enum: ['pending', 'accepted', 'blocked', 'rejected'], default: 'pending' },
    initiatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    lastMessageAt: { type: Date, default: Date.now },
    saleStatus: { 
      type: String, 
      enum: ['none', 'pending_confirmation', 'confirmed'], 
      default: 'none' 
    },
    saleRequestedAt: { type: Date },
    saleConfirmedAt: { type: Date },
    buyerRated: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Conversation', ConversationSchema);




