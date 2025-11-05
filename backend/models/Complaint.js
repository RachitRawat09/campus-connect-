const mongoose = require('mongoose');

const ComplaintSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing' },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ['open', 'resolved', 'dismissed'], default: 'open' }
}, { timestamps: true });

module.exports = mongoose.model('Complaint', ComplaintSchema);



