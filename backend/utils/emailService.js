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
const DEFAULT_FROM =
  process.env.EMAIL_FROM ||
  process.env.EMAIL_USER ||
  "no-reply@campusconnect.local";

const brevoClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = brevoClient.authentications["api-key"];
apiKey.apiKey = BREVO_API_KEY;
const emailApi = new SibApiV3Sdk.TransactionalEmailsApi();

// ================================
// Send Email via Brevo
// ================================
async function sendEmailWithBrevo({ from = DEFAULT_FROM, to, subject, html }) {
  if (!BREVO_API_KEY) {
    throw new Error("BREVO_API_KEY not configured");
  }

  const senderEmail =
    typeof from === "string"
      ? { email: from, name: "Campus Connect" }
      : from;

  const sendSmtpEmail = {
    sender: senderEmail,
    to: [{ email: to }],
    subject,
    htmlContent: html,
  };

  try {
    await emailApi.sendTransacEmail(sendSmtpEmail);
    console.log(`✅ Email sent successfully to ${to}`);
  } catch (error) {
    console.error("❌ Error sending email via Brevo:", error.message);
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
  try {
    const html = `
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
    `;

    if (BREVO_API_KEY) {
      await sendEmailWithBrevo({
        from: DEFAULT_FROM,
        to: email,
        subject: "Campus Connect - Email Verification OTP",
        html,
      });
      return true;
    }

    console.error("BREVO_API_KEY not set; skipping sending OTP email");
    return false;
  } catch (error) {
    console.error("Error sending OTP email:", error?.message || error);
    return false;
  }
};

// ================================
// Send Password Reset Email
// ================================
const sendPasswordResetEmail = async (email, resetToken) => {
  try {
    const resetUrl = `${
      process.env.FRONTEND_URL || "http://localhost:5173"
    }/reset-password?token=${resetToken}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">Campus Connect</h2>
        <h3>Password Reset Request</h3>
        <p>You requested to reset your password. Click the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Reset Password</a>
        </div>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this password reset, please ignore this email.</p>
        <hr style="margin: 20px 0;">
        <p style="color: #6B7280; font-size: 12px;">Campus Connect - Student Marketplace</p>
      </div>
    `;

    if (BREVO_API_KEY) {
      await sendEmailWithBrevo({
        from: DEFAULT_FROM,
        to: email,
        subject: "Campus Connect - Password Reset",
        html,
      });
      return true;
    }

    console.error("BREVO_API_KEY not set; skipping sending reset email");
    return false;
  } catch (error) {
    console.error("Error sending password reset email:", error?.message || error);
    return false;
  }
};

// ================================
// Export All
// ================================
module.exports = {
  generateOTP,
  sendOTPEmail,
  sendPasswordResetEmail,
};
