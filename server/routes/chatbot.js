const express = require('express');
const router = express.Router();
const { 
  getChatHistory, 
  sendMessage, 
  clearChatHistory 
} = require('../controllers/chatbotController');
const { auth } = require('../middleware/auth');

// @route   GET /api/chatbot/history
// @desc    Get chat history
// @access  Private
router.get('/history', auth, getChatHistory);

// @route   POST /api/chatbot/message
// @desc    Send message to chatbot
// @access  Private
router.post('/message', auth, sendMessage);

// @route   DELETE /api/chatbot/history
// @desc    Clear chat history
// @access  Private
router.delete('/history', auth, clearChatHistory);

module.exports = router; 