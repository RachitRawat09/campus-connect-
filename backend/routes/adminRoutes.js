const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middlewares/auth');
const admin = require('../middlewares/admin');

// All routes are auth + admin protected
router.get('/stats', auth, admin, adminController.getStats);
router.get('/users', auth, admin, adminController.getUsers);
router.get('/users/:id', auth, admin, adminController.getUserById);
router.get('/listings', auth, admin, adminController.getListings);
router.get('/complaints', auth, admin, adminController.getComplaints);

module.exports = router;



