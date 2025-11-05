// backend/middlewares/auth.js
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    console.log('Auth Middleware - Headers:', req.headers);
    
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('Auth Middleware - No Bearer token found');
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const token = authHeader.split(' ')[1];
    console.log('Auth Middleware - Token received:', token.substring(0, 20) + '...');

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Auth Middleware - Decoded token:', decoded);
      req.user = decoded;
      next();
    } catch (jwtError) {
      console.error('Auth Middleware - JWT Verification Error:', jwtError);
      return res.status(401).json({ message: 'Token is not valid', error: jwtError.message });
    }
  } catch (err) {
    console.error('Auth Middleware - Unexpected Error:', err);
    res.status(500).json({ message: 'Auth middleware error', error: err.message });
  }
};