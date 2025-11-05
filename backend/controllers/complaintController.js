const Complaint = require("../models/Complaint");

// Create a new complaint
exports.createComplaint = async (req, res) => {
  try {
    const { reportedUser, reportedListing, type, description } = req.body;

    if (!type || !description) {
      return res
        .status(400)
        .json({ message: "Type and description are required" });
    }

    // Create new complaint
    const complaint = new Complaint({
      reportedBy: req.user.id,
      reportedUser,
      reportedListing,
      type,
      description,
    });

    await complaint.save();

    res.status(201).json({
      success: true,
      message: "Report submitted successfully",
      complaint,
    });
  } catch (error) {
    console.error("Error creating complaint:", error);
    res.status(500).json({ message: "Failed to submit report" });
  }
};

// Get all complaints (admin only)
exports.getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate("reportedBy", "name email")
      .populate("reportedUser", "name email")
      .populate("reportedListing", "title");

    res.json(complaints);
  } catch (error) {
    console.error("Error fetching complaints:", error);
    res.status(500).json({ message: "Failed to fetch complaints" });
  }
};

// Update complaint status (admin only)
exports.updateComplaintStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    res.json(complaint);
  } catch (error) {
    console.error("Error updating complaint:", error);
    res.status(500).json({ message: "Failed to update complaint status" });
  }
};
