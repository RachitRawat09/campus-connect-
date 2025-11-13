require("dotenv").config(); // Must be at the very top
const nodemailer = require("nodemailer");
const crypto = require("crypto");

console.log("✅ EMAIL CONFIG DEBUG:");
console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS exists:", !!process.env.EMAIL_PASS);
console.log("EMAIL_HOST:", process.env.EMAIL_HOST);
console.log("EMAIL_PORT:", process.env.EMAIL_PORT);

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const EMAIL_HOST = process.env.EMAIL_HOST || "smtp.gmail.com";
const EMAIL_PORT = parseInt(process.env.EMAIL_PORT || "587");
const DEFAULT_FROM_NAME = process.env.EMAIL_FROM_NAME || "Campus Connect";

// Validate email config
if (!EMAIL_USER || !EMAIL_PASS) {
  throw new Error(
    "❌ EMAIL_USER and EMAIL_PASS are required in .env. Please set them for nodemailer."
  );
}

// Create nodemailer transporter
const transporter = nodemailer.createTransport({
  host: EMAIL_HOST,
  port: EMAIL_PORT,
  secure: EMAIL_PORT === 465, // true for 465, false for other ports
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

// Test transporter connection on startup
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ SMTP connection error:", error.message);
  } else {
    console.log("✅ SMTP transporter ready");
  }
});

async function sendEmailWithNodemailer({
  fromEmail = EMAIL_USER,
  fromName = DEFAULT_FROM_NAME,
  to,
  subject,
  html,
}) {
  console.log(`📤 Attempting to send email via nodemailer:
  From: ${fromEmail} (${fromName})
  To: ${to}
  Subject: ${subject}`);

  try {
    const mailOptions = {
      from: `"${fromName}" <${fromEmail}>`,
      to,
      subject,
      html,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(
      `✅ Email sent successfully to ${to}. Message ID: ${result.messageId}`
    );
    return true;
  } catch (error) {
    console.error("❌ Error sending email via nodemailer:");
    console.error(error?.message || error);
    return false;
  }
}

// ================================
// OTP Generator
// ================================
const generateOTP = () => crypto.randomInt(100000, 999999).toString();

// ================================
// Send OTP Email
// ================================
const sendOTPEmail = async (email, otp) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4F46E5;">Campus Connect</h2>
      <h3>Email Verification</h3>
      <p>Thank you for registering! Use this OTP to verify your email:</p>
      <div style="background-color: #F3F4F6; padding: 20px; text-align: center; margin: 20px 0;">
        <h1 style="color: #4F46E5; font-size: 32px; margin: 0; letter-spacing: 5px;">${otp}</h1>
      </div>
      <p>This OTP will expire in 10 minutes.</p>
      <hr style="margin: 20px 0;">
      <p style="color: #6B7280; font-size: 12px;">Campus Connect - Student Marketplace</p>
    </div>
  `;

  return await sendEmailWithNodemailer({
    to: email,
    subject: "Campus Connect - Email Verification OTP",
    html,
  });
};

// ================================
// Send Password Reset Email
// ================================
const sendPasswordResetEmail = async (email, resetToken) => {
  const resetUrl = `${
    process.env.FRONTEND_URL || "http://localhost:5173"
  }/reset-password?token=${resetToken}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4F46E5;">Campus Connect</h2>
      <h3>Password Reset Request</h3>
      <p>Click the button below to reset your password:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Reset Password</a>
      </div>
      <p>This link will expire in 1 hour.</p>
      <hr style="margin: 20px 0;">
      <p style="color: #6B7280; font-size: 12px;">Campus Connect - Student Marketplace</p>
    </div>
  `;

  return await sendEmailWithNodemailer({
    to: email,
    subject: "Campus Connect - Password Reset",
    html,
  });
};

// ================================
// Exports
// ================================
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
      const html = `<p>Hi ${user.name || "there"},</p>
             <p><strong>${buyerName}</strong> just texted you on Campus Connect.</p>
             <p><a href="${
               process.env.FRONTEND_URL || "http://localhost:5173"
             }/messages" target="_blank">Open messages</a> to view and accept the chat request.</p>`;
      await sendEmailWithNodemailer({
        to: user.email,
        subject: "New message request on Campus Connect",
        html,
      });
    } catch (e) {
      console.error("sendNewChatEmail error:", e?.message || e);
    }
  },
  // Send rejection email when item is sold to someone else
  sendRequestRejectedEmail: async (userId, listingTitle, sellerName) => {
    try {
      const User = require("../models/User");
      const user = await User.findById(userId);
      if (!user || !user.email) return;

      const html = `
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
      `;
      await sendEmailWithNodemailer({
        to: user.email,
        subject: "Request Rejected - Item Sold to Another Buyer",
        html,
      });
    } catch (error) {
      console.error("Error sending rejection email:", error?.message || error);
    }
  },
};
