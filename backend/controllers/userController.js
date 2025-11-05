const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Add rating to a seller (aggregate averageRating and numReviews)
exports.rateSeller = async (req, res) => {
  try {
    const { sellerId } = req.params;
    const { rating } = req.body;
    const numeric = Number(rating);
    if (!sellerId || !numeric || numeric < 1 || numeric > 5) {
      return res.status(400).json({ message: 'Valid rating (1-5) required' });
    }
    const seller = await User.findById(sellerId);
    if (!seller) return res.status(404).json({ message: 'Seller not found' });
    const total = (seller.averageRating || 0) * (seller.numReviews || 0) + numeric;
    const count = (seller.numReviews || 0) + 1;
    seller.averageRating = total / count;
    seller.numReviews = count;
    await seller.save();
    res.json({ message: 'Rating submitted', averageRating: seller.averageRating, numReviews: seller.numReviews });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const updates = { ...req.body };
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, select: '-password' }
    );
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all users (for chat selection)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user.id } }).select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
}; 