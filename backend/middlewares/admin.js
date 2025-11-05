module.exports = (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    if (!req.user.isAdmin) return res.status(403).json({ message: 'Admin access required' });
    next();
  } catch (_) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
};



