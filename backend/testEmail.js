require("dotenv").config();
const { sendOTPEmail, generateOTP } = require("./utils/emailService"); // adjust path as needed

(async () => {
  console.log("✅ Starting local email test...");
  console.log("BREVO_API_KEY exists:", !!process.env.BREVO_API_KEY);
  console.log("EMAIL_USER:", process.env.EMAIL_USER);

  const testEmail = "yourgmail@gmail.com"; // Replace with your email to test receiving
  const otp = generateOTP();

  console.log(`Generated OTP: ${otp}`);
  const success = await sendOTPEmail(testEmail, otp);

  if (success) console.log("✅ Test email sent successfully!");
  else console.log("❌ Test email failed!");
})();
