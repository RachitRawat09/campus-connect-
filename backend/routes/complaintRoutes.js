const express = require("express");
const router = express.Router();
const { auth } = require("../middlewares/auth");
const { admin } = require("../middlewares/admin");
const {
  createComplaint,
  getAllComplaints,
  updateComplaintStatus,
} = require("../controllers/complaintController");

// Create a new complaint (requires authentication)
router.post("/", auth, createComplaint);

// Get all complaints (admin only)
router.get("/", auth, admin, getAllComplaints);

// Update complaint status (admin only)
router.patch("/:id/status", auth, admin, updateComplaintStatus);

module.exports = router;
