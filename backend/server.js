require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// Middleware
const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:5173", // Your local development URL
  "https://campus-connect-gndec.vercel.app", // Your deployed frontend URL
  "https://campus-connect-gndec.onrender.com", // Add any other deployment URLs
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) === -1) {
        var msg =
          "The CORS policy for this site does not allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

// Import routes (to be added)
const userRoutes = require("./routes/userRoutes");
app.use("/api/users", userRoutes);

const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

const listingRoutes = require("./routes/listingRoutes");
app.use("/api/listings", listingRoutes);

const messageRoutes = require("./routes/messageRoutes");
app.use("/api/messages", messageRoutes);

const adminRoutes = require("./routes/adminRoutes");
app.use("/api/admin", adminRoutes);

// Admin bootstrap: create admin user from env if not exists
const bcrypt = require("bcryptjs");
const User = require("./models/User");
async function ensureAdmin() {
  try {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    const name = process.env.ADMIN_NAME || "Administrator";
    const college = process.env.ADMIN_COLLEGE || "Admin College";
    if (!email || !password) {
      console.warn(
        "ADMIN_EMAIL or ADMIN_PASSWORD not set; skipping admin bootstrap"
      );
      return;
    }
    let user = await User.findOne({ email });
    if (!user) {
      const hashed = await bcrypt.hash(password, 10);
      user = await User.create({
        name,
        email,
        password: hashed,
        college,
        isAdmin: true,
        isVerified: true,
      });
    } else if (!user.isAdmin) {
      user.isAdmin = true;
      await user.save();
      console.log("Existing user promoted to admin:", email);
    } else {
      console.log("Admin user already present:", email);
    }
  } catch (e) {
    console.error("Failed to ensure admin user:", e.message);
  }
}

// Error handling middleware (to be added)

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected");
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

connectDB();

// After DB connects, ensure admin exists
ensureAdmin();

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
