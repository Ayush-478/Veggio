import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  IconButton,
  Divider,
  Avatar,
  Grid,
  CircularProgress,
  Alert,
  Chip,
  List,
  ListItem,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Tooltip
} from '@mui/material';
import {
  Send,
  Restaurant,
  Delete,
  LocalDining,
  Info,
  ShoppingCart,
  FreeBreakfast,
  Fastfood,
  DinnerDining,
  EmojiNature,
  LocalCafe
} from '@mui/icons-material';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import CartContext from '../context/CartContext';

const ChatbotPage = () => {
  const { isAuthenticated, user } = useContext(AuthContext);
  const { addToCart } = useContext(CartContext);
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [sessionId, setSessionId] = useState('');
  const [foodSuggestions, setFoodSuggestions] = useState([]);
  
  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  useEffect(() => {
    if (isAuthenticated) {
      fetchChatHistory();
      
      // Generate a session ID if none exists
      if (!sessionId) {
        setSessionId(`session_${Date.now()}_${user._id}`);
      }
    }
  }, [isAuthenticated]);
  
  const fetchChatHistory = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/chatbot/history');
      
      if (res.data && res.data.length > 0) {
        setMessages(res.data);
        // Get session ID from the most recent message
        setSessionId(res.data[0].sessionId);
      } else {
        // Add welcome message if no history
        setMessages([
          {
            _id: 'welcome',
            sender: 'bot',
            message: "Hello! I'm ChefBot, your personal food assistant. How can I help you today? You can ask me about our menu, get food recommendations, or ask about nutritional information.",
            timestamp: new Date().toISOString()
          }
        ]);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching chat history:', err);
      setError('Failed to load chat history. Please try again later.');
      
      // Add welcome message if error
      setMessages([
        {
          _id: 'welcome',
          sender: 'bot',
          message: "Hello! I'm ChefBot, your personal food assistant. How can I help you today? You can ask me about our menu, get food recommendations, or ask about nutritional information.",
          timestamp: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    const userMessage = {
      _id: `temp_${Date.now()}`,
      sender: 'user',
      message: input,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setSending(true);
    
    try {
      const res = await axios.post('/api/chatbot/message', {
        message: input,
        sessionId
      });
      
      const { botMessage } = res.data;
      
      setMessages(prev => [
        ...prev.filter(msg => msg._id !== userMessage._id),
        res.data.userMessage,
        botMessage
      ]);
      
      // Check if bot response has food suggestions
      if (botMessage.relatedFoodItems && botMessage.relatedFoodItems.length > 0) {
        // Fetch food items details
        const foodItemsRes = await Promise.all(
          botMessage.relatedFoodItems.map(id => axios.get(`/api/food/${id}`))
        );
        
        setFoodSuggestions(foodItemsRes.map(res => res.data));
      } else {
        setFoodSuggestions([]);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
      
      // Remove the temp message and add error message
      setMessages(prev => [
        ...prev.filter(msg => msg._id !== userMessage._id),
        userMessage,
        {
          _id: `error_${Date.now()}`,
          sender: 'bot',
          message: "I'm sorry, I'm having trouble connecting to the server. Please try again later.",
          timestamp: new Date().toISOString()
        }
      ]);
    } finally {
      setSending(false);
    }
  };
  
  const handleClearChat = async () => {
    try {
      await axios.delete('/api/chatbot/history');
      
      // Generate new session ID
      const newSessionId = `session_${Date.now()}_${user._id}`;
      setSessionId(newSessionId);
      
      // Add welcome message
      setMessages([
        {
          _id: 'welcome',
          sender: 'bot',
          message: "Hello! I'm ChefBot, your personal food assistant. How can I help you today? You can ask me about our menu, get food recommendations, or ask about nutritional information.",
          timestamp: new Date().toISOString()
        }
      ]);
      
      setFoodSuggestions([]);
      setError(null);
    } catch (err) {
      console.error('Error clearing chat history:', err);
      setError('Failed to clear chat history. Please try again.');
    }
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const handleAddToCart = async (foodItem) => {
    try {
      await addToCart(foodItem._id, 1);
      
      // Add a message from the bot acknowledging the item was added
      const botMessage = {
        _id: `cart_${Date.now()}`,
        sender: 'bot',
        message: `I've added ${foodItem.name} to your cart. Would you like anything else?`,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      console.error('Error adding to cart:', err);
      setError('Failed to add item to cart. Please try again.');
    }
  };
  
  const getChatSuggestions = () => [
    "What's on the menu today?",
    "Can you recommend something healthy?",
    "What vegetarian options do you have?",
    "How many calories are in a salad?",
    "I'm looking for high protein meals",
    "What's your most popular dish?"
  ];
  
  // Placeholder food items when API is not available
  const placeholderFoodItems = [
    {
      _id: '1',
      name: 'Veggie Buddha Bowl',
      description: 'A nutritious bowl with quinoa, roasted vegetables, avocado, and tahini dressing.',
      price: 12.99,
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      nutritionalInfo: { calories: 450 },
      isVegetarian: true,
      category: 'main course'
    },
    {
      _id: '2',
      name: 'Mediterranean Salad',
      description: 'Fresh salad with mixed greens, feta cheese, olives, tomatoes, and balsamic dressing.',
      price: 9.99,
      image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      nutritionalInfo: { calories: 320 },
      isVegetarian: true,
      category: 'appetizer'
    },
    {
      _id: '3',
      name: 'Berry Smoothie Bowl',
      description: 'Refreshing smoothie bowl with mixed berries, banana, granola, and chia seeds.',
      price: 8.99,
      image: 'https://images.unsplash.com/photo-1577805947697-89e18249d767?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      nutritionalInfo: { calories: 380 },
      isVegetarian: true,
      category: 'breakfast'
    }
  ];
  
  const displayFoodSuggestions = foodSuggestions.length > 0 ? foodSuggestions : placeholderFoodItems;
  
  // Get category icon
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'breakfast':
        return <FreeBreakfast />;
      case 'appetizer':
        return <LocalCafe />;
      case 'main course':
        return <DinnerDining />;
      case 'dessert':
        return <Fastfood />;
      default:
        return <LocalDining />;
    }
  };
  
  if (!isAuthenticated) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="info" sx={{ mb: 2 }}>
          Please log in to chat with ChefBot
        </Alert>
        <Button 
          variant="contained" 
          onClick={() => navigate('/login')}
        >
          Login
        </Button>
      </Container>
    );
  }
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar
              sx={{ bgcolor: 'primary.main', mr: 2 }}
            >
              <Restaurant />
            </Avatar>
            <Typography variant="h4" component="h1">
              ChefBot
            </Typography>
            <Box sx={{ flexGrow: 1 }} />
            <Tooltip title="Clear chat history">
              <IconButton 
                onClick={handleClearChat}
                color="primary"
              >
                <Delete />
              </IconButton>
            </Tooltip>
          </Box>
          
          {/* Chat Messages */}
          <Paper 
            sx={{ 
              height: 500, 
              mb: 2, 
              p: 2, 
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 2
            }}
          >
            {messages.map((message, index) => (
              <Box
                key={message._id || index}
                sx={{
                  display: 'flex',
                  flexDirection: message.sender === 'user' ? 'row-reverse' : 'row',
                  mb: 2
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: message.sender === 'user' ? 'secondary.main' : 'primary.main',
                    mx: 1
                  }}
                >
                  {message.sender === 'user' ? user?.name?.charAt(0)?.toUpperCase() || 'U' : <Restaurant />}
                </Avatar>
                <Paper
                  sx={{
                    p: 2,
                    maxWidth: '80%',
                    borderRadius: 2,
                    bgcolor: message.sender === 'user' ? 'secondary.light' : 'primary.light',
                    color: message.sender === 'user' ? 'secondary.contrastText' : 'primary.contrastText'
                  }}
                >
                  <Typography variant="body1">{message.message}</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Typography>
                </Paper>
              </Box>
            ))}
            {sending && (
              <Box sx={{ display: 'flex', alignItems: 'center', alignSelf: 'flex-start', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main', mx: 1 }}>
                  <Restaurant />
                </Avatar>
                <Paper sx={{ p: 2, borderRadius: 2, bgcolor: 'primary.light' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CircularProgress size={20} />
                    <Typography variant="body1" sx={{ ml: 2 }}>
                      Thinking...
                    </Typography>
                  </Box>
                </Paper>
              </Box>
            )}
            <div ref={messagesEndRef} />
          </Paper>
          
          {/* Input Area */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TextField
              fullWidth
              placeholder="Ask ChefBot..."
              variant="outlined"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={sending}
              sx={{ mr: 1 }}
            />
            <Button
              variant="contained"
              endIcon={<Send />}
              onClick={handleSendMessage}
              disabled={sending || !input.trim()}
            >
              Send
            </Button>
          </Box>
          
          {/* Quick Suggestions */}
          <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {getChatSuggestions().map((suggestion, index) => (
              <Chip
                key={index}
                label={suggestion}
                onClick={() => {
                  setInput(suggestion);
                }}
                sx={{ mb: 1 }}
              />
            ))}
          </Box>
        </Grid>
        
        {/* Food Suggestions */}
        <Grid item xs={12} md={4}>
          <Typography variant="h6" gutterBottom>
            Suggested for You
          </Typography>
          <Box sx={{ overflowY: 'auto', maxHeight: 600 }}>
            {displayFoodSuggestions.map((item) => (
              <Card key={item._id} sx={{ mb: 2, borderRadius: 2 }}>
                <CardMedia
                  component="img"
                  height="140"
                  image={item.image}
                  alt={item.name}
                />
                <CardContent>
                  <Typography variant="h6">{item.name}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Chip 
                      icon={<Info />} 
                      label={`${item.nutritionalInfo.calories} cal`} 
                      size="small" 
                      color="primary" 
                      sx={{ mr: 1 }}
                    />
                    {item.isVegetarian && (
                      <Chip icon={<EmojiNature />} label="Veg" size="small" color="success" />
                    )}
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {item.description.substring(0, 100)}{item.description.length > 100 ? '...' : ''}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'space-between' }}>
                  <Typography variant="h6" color="primary.main">
                    ${item.price.toFixed(2)}
                  </Typography>
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<ShoppingCart />}
                    onClick={() => handleAddToCart(item)}
                  >
                    Add to Cart
                  </Button>
                </CardActions>
              </Card>
            ))}
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ChatbotPage; 