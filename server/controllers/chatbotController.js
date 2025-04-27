const ChatMessage = require('../models/ChatMessage');
const chatbotService = require('../services/chatbotService');

// @desc    Get chat history
// @route   GET /api/chatbot/history
// @access  Private
const getChatHistory = async (req, res) => {
  try {
    const { sessionId } = req.query;
    
    // Find chat messages for the user and session
    const messages = await ChatMessage.find({
      user: req.user._id,
      ...(sessionId && { sessionId })
    })
    .sort({ timestamp: 1 })
    .populate({
      path: 'relatedFoodItems',
      select: 'name image price category isVegetarian isVegan nutritionalInfo.calories'
    });
    
    res.json(messages);
  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Send message to chatbot
// @route   POST /api/chatbot/message
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    
    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }
    
    // Create a new session ID if not provided
    const chatSessionId = sessionId || `session_${Date.now()}_${req.user._id}`;
    
    // Save user message
    const userMessage = new ChatMessage({
      user: req.user._id,
      message,
      sender: 'user',
      sessionId: chatSessionId
    });
    
    await userMessage.save();
    
    // Process message with chatbot service
    const botResponse = await chatbotService.processMessage(message, req.user._id, chatSessionId);
    
    // Save bot response
    const botMessage = new ChatMessage({
      user: req.user._id,
      message: botResponse.text,
      sender: 'bot',
      relatedFoodItems: botResponse.relatedFoodItems || [],
      intent: botResponse.intent || 'general_query',
      sessionId: chatSessionId
    });
    
    await botMessage.save();
    
    res.json({
      userMessage,
      botMessage,
      sessionId: chatSessionId
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Clear chat history
// @route   DELETE /api/chatbot/history
// @access  Private
const clearChatHistory = async (req, res) => {
  try {
    const { sessionId } = req.query;
    
    if (sessionId) {
      // Delete messages for specific session
      await ChatMessage.deleteMany({
        user: req.user._id,
        sessionId
      });
    } else {
      // Delete all messages for user
      await ChatMessage.deleteMany({
        user: req.user._id
      });
    }
    
    res.json({ message: 'Chat history cleared' });
  } catch (error) {
    console.error('Clear chat history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getChatHistory,
  sendMessage,
  clearChatHistory
}; 