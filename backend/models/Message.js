const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing' }, // Optional: message about a listing
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', MessageSchema); 