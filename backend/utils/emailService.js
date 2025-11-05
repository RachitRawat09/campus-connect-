const axios = require("axios");
const crypto = require("crypto");

// Use Resend (https://resend.com) HTTP API in production.
// Set RESEND_API_KEY in environment variables to enable sending.
// DEFAULT_FROM is used when an explicit from address is not provided.
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const DEFAULT_FROM =
  process.env.EMAIL_FROM ||
  process.env.EMAIL_USER ||
  "no-reply@campusconnect.local";

async function sendEmailWithResend({ from = DEFAULT_FROM, to, subject, html }) {
  if (!RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY not configured");
  }

  const payload = { from, to, subject, html };

  return axios.post("https://api.resend.com/emails", payload, {
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
  });
}

// Generate 6-digit OTP
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// Send OTP email
const sendOTPEmail = async (email, otp) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER || "your-email@gmail.com",
      to: email,
      subject: "Campus Connect - Email Verification OTP",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">Campus Connect</h2>
          <h3>Email Verification</h3>
          <p>Thank you for registering with Campus Connect! Please use the following OTP to verify your email address:</p>
          <div style="background-color: #F3F4F6; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #4F46E5; font-size: 32px; margin: 0; letter-spacing: 5px;">${otp}</h1>
          </div>
          <p>This OTP will expire in 10 minutes.</p>
          <p>If you didn't request this verification, please ignore this email.</p>
          <hr style="margin: 20px 0;">
          <p style="color: #6B7280; font-size: 12px;">Campus Connect - Student Marketplace</p>
        </div>
      `,
    };

    if (RESEND_API_KEY) {
      await sendEmailWithResend({
        from: mailOptions.from || DEFAULT_FROM,
        to: mailOptions.to,
        subject: mailOptions.subject,
        html: mailOptions.html,
      });
      return true;
    }
    console.error("RESEND_API_KEY not set; skipping sending OTP email");
    return false;
  } catch (error) {
    console.error("Error sending OTP email:", error?.message || error);
    return false;
  }
};

// Send password reset email
const sendPasswordResetEmail = async (email, resetToken) => {
  try {
    const resetUrl = `${
      process.env.FRONTEND_URL || "http://localhost:3000"
    }/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: process.env.EMAIL_USER || "your-email@gmail.com",
      to: email,
      subject: "Campus Connect - Password Reset",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">Campus Connect</h2>
          <h3>Password Reset Request</h3>
          <p>You requested to reset your password. Click the button below to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Reset Password</a>
          </div>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this password reset, please ignore this email.</p>
          <hr style="margin: 20px 0;">
          <p style="color: #6B7280; font-size: 12px;">Campus Connect - Student Marketplace</p>
        </div>
      `,
    };

    if (RESEND_API_KEY) {
      await sendEmailWithResend({
        from: mailOptions.from || DEFAULT_FROM,
        to: mailOptions.to,
        subject: mailOptions.subject,
        html: mailOptions.html,
      });
      return true;
    }
    console.error(
      "RESEND_API_KEY not set; skipping sending password reset email"
    );
    return false;
  } catch (error) {
    console.error(
      "Error sending password reset email:",
      error?.message || error
    );
    return false;
  }
};

module.exports = {
  generateOTP,
  sendOTPEmail,
  sendPasswordResetEmail,
  // Best-effort email for new chat
  sendNewChatEmail: async (receiverUserId, buyerName) => {
    try {
      const User = require("../models/User");
      const user = await User.findById(receiverUserId);
      if (!user || !user.email) return;
      const mailOptions = {
        from: process.env.EMAIL_USER || "your-email@gmail.com",
        to: user.email,
        subject: "New message request on Campus Connect",
        html: `<p>Hi ${user.name || "there"},</p>
               <p><strong>${buyerName}</strong> just texted you on Campus Connect.</p>
               <p><a href="${
                 process.env.FRONTEND_URL || "http://localhost:5173"
               }/messages" target="_blank">Open messages</a> to view and accept the chat request.</p>`,
      };
      if (RESEND_API_KEY) {
        await sendEmailWithResend({
          from: mailOptions.from || DEFAULT_FROM,
          to: mailOptions.to,
          subject: mailOptions.subject,
          html: mailOptions.html,
        });
      } else {
        // In dev we silently ignore; keep behavior consistent
      }
    } catch (e) {
      // ignore email errors in dev
      console.error("sendNewChatEmail error:", e?.message || e);
    }
  },
  // Send rejection email when item is sold to someone else
  sendRequestRejectedEmail: async (userId, listingTitle, sellerName) => {
    try {
      const User = require("../models/User");
      const user = await User.findById(userId);
      if (!user || !user.email) return;

      const mailOptions = {
        from: process.env.EMAIL_USER || "your-email@gmail.com",
        to: user.email,
        subject: "Request Rejected - Item Sold to Another Buyer",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4F46E5;">Campus Connect</h2>
            <h3 style="color: #DC2626;">Request Rejected</h3>
            <p>Hi ${user.name || "there"},</p>
            <p>We're sorry to inform you that your request for <strong>"${listingTitle}"</strong> has been rejected.</p>
            <p>The item has been sold to another buyer by <strong>${sellerName}</strong>.</p>
            <p>Don't worry! You can continue browsing and find similar items on our marketplace.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${
                process.env.FRONTEND_URL || "http://localhost:5173"
              }/dashboard" 
                 style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Browse More Items
              </a>
            </div>
            <hr style="margin: 20px 0;">
            <p style="color: #6B7280; font-size: 12px;">Campus Connect - Student Marketplace</p>
          </div>
        `,
      };
      if (RESEND_API_KEY) {
        await sendEmailWithResend({
          from: mailOptions.from || DEFAULT_FROM,
          to: mailOptions.to,
          subject: mailOptions.subject,
          html: mailOptions.html,
        });
      } else {
        console.error(
          "RESEND_API_KEY not set; skipping sending rejection email"
        );
      }
    } catch (error) {
      console.error("Error sending rejection email:", error?.message || error);
      // Don't throw - email is best-effort
    }
  },
};
