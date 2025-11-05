const mongoose = require('mongoose');

const ListingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  image: {
    type: String, // legacy single image URL
  },
  images: {
    type: [String], // up to 4 image URLs
    default: [],
    validate: [arr => arr.length <= 4, 'You can upload up to 4 images']
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  department: {
    type: String,
  },
  isSold: {
    type: Boolean,
    default: false,
  },
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  reviews: [
    {
      reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      rating: { type: Number, required: true, min: 1, max: 5 },
      comment: { type: String },
      createdAt: { type: Date, default: Date.now }
    }
  ],
}, { timestamps: true });

module.exports = mongoose.model('Listing', ListingSchema); 