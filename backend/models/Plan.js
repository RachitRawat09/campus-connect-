const mongoose = require('mongoose');

const PlanSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  price: { type: Number, required: true }, // 0 for free plan
  listingLimit: { type: Number, required: true },
  durationDays: { type: Number }, // e.g., 30 for monthly, can be null for free
  description: { type: String },
});

module.exports = mongoose.model('Plan', PlanSchema); 