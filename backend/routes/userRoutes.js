const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/auth');

// Get user profile
router.get('/profile', authMiddleware, userController.getProfile);

// Update user profile
router.put('/profile', authMiddleware, userController.updateProfile);

// Get all users (for chat selection)
router.get('/all', authMiddleware, userController.getAllUsers);

module.exports = router; 