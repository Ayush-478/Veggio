const mongoose = require('mongoose');

const ChatMessageSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true
  },
  sender: {
    type: String,
    enum: ['user', 'bot'],
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  relatedFoodItems: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FoodItem'
  }],
  intent: {
    type: String,
    enum: ['greeting', 'food_recommendation', 'order_status', 'nutrition_info', 'dietary_question', 'general_query', 'feedback', 'help', 'other'],
    default: 'general_query'
  },
  sessionId: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ChatMessage', ChatMessageSchema); 