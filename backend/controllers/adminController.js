const User = require('../models/User');
const Listing = require('../models/Listing');
const Complaint = require('../models/Complaint');

exports.getStats = async (req, res) => {
  try {
    const [totalUsers, totalListings, reportedCount] = await Promise.all([
      User.countDocuments({}),
      Listing.countDocuments({}),
      Complaint.countDocuments({ status: 'open' })
    ]);
    res.json({ totalUsers, totalListings, reportedItems: reportedCount });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const { limit = 10, search = '' } = req.query;
    const q = search.trim();
    const filter = q ? { $or: [
      { name: { $regex: q, $options: 'i' } },
      { email: { $regex: q, $options: 'i' } }
    ] } : {};
    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit, 10));
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getListings = async (req, res) => {
  try {
    const { search = '', page = 1, pageSize = 20 } = req.query;
    const q = search.trim();
    const filter = q ? { $or: [
      { title: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } }
    ] } : {};
    const skip = (parseInt(page, 10) - 1) * parseInt(pageSize, 10);
    const [items, total] = await Promise.all([
      Listing.find(filter)
        .populate('seller', 'name email')
        .populate('buyer', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(pageSize, 10)),
      Listing.countDocuments(filter)
    ]);
    res.json({ items, total, page: parseInt(page, 10) });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getComplaints = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const complaints = await Complaint.find(filter)
      .populate('user', 'name email')
      .populate('listing', 'title price')
      .sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};



