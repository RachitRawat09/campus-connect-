const express = require('express');
const router = express.Router();
const listingController = require('../controllers/listingController');
const upload = require('../middlewares/upload');
const { uploadToCloudinary } = require('../utils/cloudinary');
const fs = require('fs');
const authMiddleware = require('../middlewares/auth');

// Create listing (protected)
// router.post('/', authMiddleware, listingController.createListing);
router.post('/', listingController.createListing); // For now, no auth

// Get all listings
router.get('/', listingController.getListings);

// Get single listing
router.get('/:id', listingController.getListingById);

// Update listing (protected)
// router.put('/:id', authMiddleware, listingController.updateListing);
router.put('/:id', listingController.updateListing); // For now, no auth

// Delete listing (protected)
router.delete('/:id', authMiddleware, listingController.deleteListing);

// Mark listing as sold (protected)
router.put('/:id/sold', authMiddleware, listingController.markAsSold);

// Image upload endpoint
router.post('/upload-image', upload.single('image'), async (req, res) => {
  try {
    console.log('FILE RECEIVED:', req.file); // 🔍 Check if file is received

    const result = await uploadToCloudinary(req.file.path, 'listings');
    fs.unlinkSync(req.file.path);
    res.json({ imageUrl: result.secure_url });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Image upload failed' });
  }
});
router.post('/upload-test', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file received' });
  }
  res.json({
    message: 'File received successfully!',
    file: req.file
  });
});

// Multi image upload (max 4)
router.post('/upload-images', upload.array('images', 4), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files received' });
    }
    const uploaded = [];
    for (const file of req.files) {
      const result = await uploadToCloudinary(file.path, 'listings');
      fs.unlinkSync(file.path);
      uploaded.push(result.secure_url);
    }
    res.json({ imageUrls: uploaded });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Image upload failed' });
  }
});

// Get all unique categories
router.get('/categories', listingController.getCategories);
// Get all unique departments
router.get('/departments', listingController.getDepartments);

// Get all purchases for a user (protected)
router.get('/purchases', authMiddleware, listingController.getPurchasesByUser);

// Reviews
router.post('/:id/reviews', authMiddleware, listingController.addReview);
router.get('/:id/reviews', listingController.getReviews);

// Plans disabled: routes removed

module.exports = router; 