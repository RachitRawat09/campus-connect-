const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { generateOTP, sendOTPEmail, sendPasswordResetEmail } = require('../utils/emailService');

// Register a new user
exports.register = async (req, res) => {
  try {
    const { name, email, password, college, studentIdImage } = req.body;
    
    // Validate college email - support various college domains
    const collegeEmailDomains = [
      '.edu', '.edu.in', '.ac.in', '.ac.uk', '.edu.au', '.edu.ca', 
      '.edu.sg', '.edu.my', '.edu.ph', '.edu.nz', '.edu.za',
      '.university', '.college', '.institute', '.ac.za', '.edu.pk',
      '.edu.bd', '.edu.lk', '.edu.np', '.edu.bt', '.edu.mv'
    ];
    
    const isValidCollegeEmail = collegeEmailDomains.some(domain => 
      email.toLowerCase().endsWith(domain.toLowerCase())
    );
    
    if (!isValidCollegeEmail) {
      return res.status(400).json({ 
        message: 'Please use a valid college/university email address (.edu, .ac.in, .edu.in, etc.)' 
      });
    }
    
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      college,
      studentIdImage: studentIdImage || '',
      otp,
      otpExpiresAt,
      isVerified: false
    });

    // Send OTP email (temporarily disabled for testing)
    try {
      const emailSent = await sendOTPEmail(email, otp);
      if (!emailSent) {
        console.log('Email service not configured, but user created successfully');
        // For now, we'll allow registration even if email fails
        // In production, you should set up proper email credentials
      }
    } catch (emailError) {
      console.log('Email service error:', emailError.message);
      // Continue with registration even if email fails
    }
    
    res.status(201).json({ 
      message: 'User registered successfully! OTP sent to your email (if email service is configured).',
      userId: user._id,
      email: user.email,
      otp: otp // Temporarily include OTP in response for testing
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    // Check if user is verified
    if (!user.isVerified) {
      return res.status(400).json({ message: 'Please verify your email before logging in' });
    }

    // Sign token with string id to keep token payload consistent
    const token = jwt.sign({ id: user._id.toString(), isAdmin: user.isAdmin }, process.env.JWT_SECRET, { expiresIn: '7d' });
    // Return a single canonical id field (use `id`) to avoid duplication
    res.json({
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Verify OTP
exports.verifyOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body;
    
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.isVerified) {
      return res.status(400).json({ message: 'User already verified' });
    }

    if (!user.otp || !user.otpExpiresAt) {
      return res.status(400).json({ message: 'No OTP found. Please request a new one.' });
    }

    if (user.otpExpiresAt < new Date()) {
      return res.status(400).json({ message: 'OTP expired. Please request a new one.' });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Verify user
    user.isVerified = true;
    user.otp = null;
    user.otpExpiresAt = null;
    await user.save();

    res.json({ message: 'Email verified successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Resend OTP
exports.resendOTP = async (req, res) => {
  try {
    const { userId } = req.body;
    
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.isVerified) {
      return res.status(400).json({ message: 'User already verified' });
    }

    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.otp = otp;
    user.otpExpiresAt = otpExpiresAt;
    await user.save();

    // Send OTP email
    const emailSent = await sendOTPEmail(user.email, otp);
    if (!emailSent) {
      return res.status(500).json({ message: 'Failed to send verification email' });
    }

    res.json({ message: 'OTP sent successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Forgot password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    // Send reset email
    const emailSent = await sendPasswordResetEmail(email, resetToken);
    if (!emailSent) {
      return res.status(500).json({ message: 'Failed to send reset email' });
    }

    res.json({ message: 'Password reset email sent' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Reset password
exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
}; 