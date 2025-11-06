require("dotenv").config(); // make sure this is at the very top

console.log("✅ ENV DEBUG:");
console.log("BREVO_API_KEY exists:", !!process.env.BREVO_API_KEY);
console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_FROM:", process.env.EMAIL_FROM);

const SibApiV3Sdk = require("sib-api-v3-sdk");
const crypto = require("crypto");

// ================================
// Brevo (Sendinblue) Configuration
// ================================
const BREVO_API_KEY = process.env.BREVO_API_KEY;
const DEFAULT_FROM_EMAIL =
  "campusconnect1125@gmail.com";
const DEFAULT_FROM_NAME = "Campus Connect";

const brevoClient = SibApiV3Sdk.ApiClient.instance;
brevoClient.authentications["api-key"].apiKey = BREVO_API_KEY;
const emailApi = new SibApiV3Sdk.TransactionalEmailsApi();

// ================================
// Send Email via Brevo
// ================================
async function sendEmailWithBrevo({
  fromEmail = DEFAULT_FROM_EMAIL,
  fromName = DEFAULT_FROM_NAME,
  to,
  subject,
  html,
}) {
  if (!BREVO_API_KEY) throw new Error("BREVO_API_KEY not configured");
  if (!fromEmail || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(fromEmail)) {
    console.error(
      "❌ EMAIL ERROR: Sender email is missing or invalid. Set EMAIL_FROM or EMAIL_USER in your .env to a valid, verified Brevo sender email."
    );
    return false;
  }

  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail({
    sender: { email: fromEmail, name: fromName },
    to: [{ email: to }],
    subject,
    htmlContent: html,
  });

  try {
    const response = await emailApi.sendTransacEmail(sendSmtpEmail);
    console.log(`✅ Email sent successfully to ${to}`);
    return true;
  } catch (error) {
    console.error(
      "❌ Error sending email via Brevo:",
      error?.response?.body || error?.message || error
    );
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

  return await sendEmailWithBrevo({
    fromEmail: DEFAULT_FROM_EMAIL,
    fromName: DEFAULT_FROM_NAME,
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

  return await sendEmailWithBrevo({
    fromEmail: DEFAULT_FROM_EMAIL,
    fromName: DEFAULT_FROM_NAME,
    to: email,
    subject: "Campus Connect - Password Reset",
    html,
  });
};

// ================================
// Export All
// ================================
module.exports = {
  generateOTP,
  sendOTPEmail,
  sendPasswordResetEmail,
};
