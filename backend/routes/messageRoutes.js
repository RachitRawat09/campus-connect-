const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const authMiddleware = require('../middlewares/auth');

// Initiate conversation (default message, pending status) and notify via email
router.post('/initiate', authMiddleware, messageController.initiateConversation);

// Accept conversation
router.post('/conversations/:conversationId/accept', authMiddleware, messageController.acceptConversation);

// List conversations
router.get('/conversations', authMiddleware, messageController.getConversations);

// Send a message (only accepted conversations)
router.post('/', authMiddleware, messageController.sendMessage);

// Get messages between two users (optionally filtered by listing)
router.get('/', authMiddleware, messageController.getMessages);

// Initiate sale (seller requests buyer confirmation)
router.post('/initiate-sale', authMiddleware, messageController.initiateSale);

// Confirm sale (buyer confirms the purchase)
router.post('/confirm-sale', authMiddleware, messageController.confirmSale);

// Rate seller after confirmed sale (buyer only)
router.post('/conversations/:conversationId/rate', authMiddleware, messageController.rateConversationSeller);

module.exports = router;