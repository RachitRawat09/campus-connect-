const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  college: {
    type: String,
    required: true,
  },
  studentIdImage: {
    type: String, // URL to uploaded student ID image
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  otp: {
    type: String,
    default: null,
  },
  otpExpiresAt: {
    type: Date,
    default: null,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  averageRating: {
    type: Number,
    default: 0,
  },
  numReviews: {
    type: Number,
    default: 0,
  },
 
  plan: {
    type: String,
    enum: ['free', 'premium'],
    default: 'free',
  },
  listingsThisPeriod: {
    type: Number,
    default: 0,
  },
  planExpiresAt: {
    type: Date,
  },
  resetPasswordToken: {
    type: String,
    default: null,
  },
  resetPasswordExpires: {
    type: Date,
    default: null,
  },

}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema); 