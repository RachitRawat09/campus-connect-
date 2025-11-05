const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Register
router.post('/register', authController.register);
// Login
router.post('/login', authController.login);
// Verify OTP
router.post('/verify-otp', authController.verifyOTP);
// Resend OTP
router.post('/resend-otp', authController.resendOTP);
// Forgot password
router.post('/forgot-password', authController.forgotPassword);
// Reset password
router.post('/reset-password', authController.resetPassword);

module.exports = router; 