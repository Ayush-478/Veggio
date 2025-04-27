import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Typography,
  Box,
  Button,
  Chip,
  Divider,
  Paper,
  Rating,
  TextField,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Snackbar
} from '@mui/material';
import {
  Add,
  Remove,
  ShoppingCart,
  ArrowBack,
  LocalDining,
  EmojiNature,
  GrassOutlined,
  GrainOutlined,
  Whatshot,
  Timer
} from '@mui/icons-material';
import axios from 'axios';
import CartContext from '../context/CartContext';
import AuthContext from '../context/AuthContext';

const FoodItemPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);
  const { isAuthenticated } = useContext(AuthContext);
  
  const [foodItem, setFoodItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  useEffect(() => {
    const fetchFoodItem = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`https://veggio.onrender.com/api/food/${id}`);
        setFoodItem(res.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching food item:', err);
        setError('Failed to load food item details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchFoodItem();
  }, [id]);
  
  const handleQuantityChange = (value) => {
    if (value < 1) return;
    setQuantity(value);
  };
  
  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      setSnackbar({
        open: true,
        message: 'Please log in to add items to your cart',
        severity: 'warning'
      });
      return;
    }
    
    try {
      await addToCart(id, quantity);
      setSnackbar({
        open: true,
        message: 'Item added to cart successfully!',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error adding to cart:', err);
      setSnackbar({
        open: true,
        message: 'Failed to add item to cart. Please try again.',
        severity: 'error'
      });
    }
  };
  
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      setSnackbar({
        open: true,
        message: 'Please log in to submit a review',
        severity: 'warning'
      });
      return;
    }
    
    if (!reviewText.trim()) {
      setReviewError('Please enter a review');
      return;
    }
    
    try {
      setSubmittingReview(true);
      setReviewError(null);
      
      await axios.post(`https://veggio.onrender.com/api/food/${id}/reviews`, {
        rating: reviewRating,
        review: reviewText
      });
      
      // Refresh food item to show the new review
      const res = await axios.get(`https://veggio.onrender.com/api/food/${id}`);
      setFoodItem(res.data);
      
      // Reset form
      setReviewText('');
      setReviewRating(5);
      
      setSnackbar({
        open: true,
        message: 'Review submitted successfully!',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error submitting review:', err);
      setReviewError('Failed to submit review. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };
  
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };
  
  // Placeholder data for when API is not available
  const placeholderItem = {
    _id: id,
    name: 'Veggie Buddha Bowl',
    description: 'A nutritious bowl with quinoa, roasted vegetables, avocado, and tahini dressing. Packed with protein and essential nutrients for a balanced meal.',
    price: 12.99,
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
    nutritionalInfo: {
      calories: 450,
      protein: 15,
      carbohydrates: 65,
      fat: 12,
      fiber: 8,
      sugar: 6,
      sodium: 380
    },
    ingredients: [
      'Quinoa',
      'Roasted sweet potatoes',
      'Avocado',
      'Chickpeas',
      'Kale',
      'Cherry tomatoes',
      'Red cabbage',
      'Tahini dressing',
      'Sesame seeds'
    ],
    isVegetarian: true,
    isVegan: true,
    isGlutenFree: true,
    category: 'main course',
    preparationTime: 25,
    spicyLevel: 1,
    ratings: [
      {
        userId: '1',
        rating: 5,
        review: 'Absolutely delicious and filling! The tahini dressing is perfect.',
        date: new Date().toISOString()
      },
      {
        userId: '2',
        rating: 4,
        review: 'Great flavors and very nutritious. Would order again!',
        date: new Date().toISOString()
      }
    ],
    averageRating: 4.5
  };
  
  const displayItem = foodItem || placeholderItem;
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/menu')}
        >
          Back to Menu
        </Button>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate('/menu')}
        sx={{ mb: 4 }}
      >
        Back to Menu
      </Button>
      
      <Grid container spacing={4}>
        {/* Food Item Image */}
        <Grid item xs={12} md={6}>
          <Box
            component="img"
            src={displayItem.image}
            alt={displayItem.name}
            sx={{
              width: '100%',
              height: 'auto',
              borderRadius: 2,
              boxShadow: 3,
              mb: { xs: 2, md: 0 }
            }}
          />
        </Grid>
        
        {/* Food Item Details */}
        <Grid item xs={12} md={6}>
          <Typography variant="h3" component="h1" gutterBottom>
            {displayItem.name}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Rating value={displayItem.averageRating} precision={0.5} readOnly />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
              ({displayItem.ratings?.length || 0} reviews)
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            {displayItem.isVegetarian && (
              <Chip icon={<LocalDining />} label="Vegetarian" color="success" />
            )}
            {displayItem.isVegan && (
              <Chip icon={<EmojiNature />} label="Vegan" color="success" />
            )}
            {displayItem.isGlutenFree && (
              <Chip icon={<GrainOutlined />} label="Gluten Free" color="info" />
            )}
            <Chip 
              icon={<Whatshot />} 
              label={`Spicy Level: ${displayItem.spicyLevel}/5`} 
              color={displayItem.spicyLevel > 3 ? "error" : "default"} 
            />
            <Chip 
              icon={<Timer />} 
              label={`${displayItem.preparationTime} min`} 
            />
          </Box>
          
          <Typography variant="h4" color="primary.main" gutterBottom>
            ${displayItem.price.toFixed(2)}
          </Typography>
          
          <Typography variant="body1" paragraph>
            {displayItem.description}
          </Typography>
          
          <Divider sx={{ my: 2 }} />
          
          {/* Add to Cart Section */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <IconButton 
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={quantity <= 1}
            >
              <Remove />
            </IconButton>
            <Typography sx={{ mx: 2 }}>{quantity}</Typography>
            <IconButton onClick={() => handleQuantityChange(quantity + 1)}>
              <Add />
            </IconButton>
            <Button
              variant="contained"
              startIcon={<ShoppingCart />}
              onClick={handleAddToCart}
              sx={{ ml: 2, borderRadius: 8, px: 3 }}
            >
              Add to Cart
            </Button>
          </Box>
        </Grid>
      </Grid>
      
      {/* Nutritional Information */}
      <Grid container spacing={4} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h5" gutterBottom>
              Nutritional Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body1" fontWeight="bold">
                  Calories:
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {displayItem.nutritionalInfo.calories} kcal
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1" fontWeight="bold">
                  Protein:
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {displayItem.nutritionalInfo.protein}g
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1" fontWeight="bold">
                  Carbohydrates:
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {displayItem.nutritionalInfo.carbohydrates}g
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1" fontWeight="bold">
                  Fat:
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {displayItem.nutritionalInfo.fat}g
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1" fontWeight="bold">
                  Fiber:
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {displayItem.nutritionalInfo.fiber}g
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1" fontWeight="bold">
                  Sugar:
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {displayItem.nutritionalInfo.sugar}g
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1" fontWeight="bold">
                  Sodium:
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {displayItem.nutritionalInfo.sodium}mg
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        {/* Ingredients */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h5" gutterBottom>
              Ingredients
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <List>
              {displayItem.ingredients.map((ingredient, index) => (
                <ListItem key={index} disablePadding>
                  <ListItemIcon sx={{ minWidth: 32 }}>•</ListItemIcon>
                  <ListItemText primary={ingredient} />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Reviews Section */}
      <Box sx={{ mt: 6 }}>
        <Typography variant="h4" gutterBottom>
          Reviews
        </Typography>
        <Divider sx={{ mb: 4 }} />
        
        {/* Review Form */}
        <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            Write a Review
          </Typography>
          
          <Box component="form" onSubmit={handleSubmitReview}>
            <Rating
              name="rating"
              value={reviewRating}
              onChange={(_, newValue) => setReviewRating(newValue)}
              precision={0.5}
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Your Review"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              error={!!reviewError}
              helperText={reviewError}
              sx={{ mb: 2 }}
            />
            
            <Button
              type="submit"
              variant="contained"
              disabled={submittingReview || !isAuthenticated}
            >
              {submittingReview ? 'Submitting...' : 'Submit Review'}
            </Button>
            
            {!isAuthenticated && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Please log in to submit a review
              </Typography>
            )}
          </Box>
        </Paper>
        
        {/* Reviews List */}
        {displayItem.ratings && displayItem.ratings.length > 0 ? (
          displayItem.ratings.map((review, index) => (
            <Card key={index} sx={{ mb: 2, borderRadius: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Rating value={review.rating} precision={0.5} readOnly size="small" />
                  <Typography variant="body2" color="text.secondary">
                    {new Date(review.date).toLocaleDateString()}
                  </Typography>
                </Box>
                <Typography variant="body1">{review.review}</Typography>
              </CardContent>
            </Card>
          ))
        ) : (
          <Typography variant="body1" color="text.secondary">
            No reviews yet. Be the first to review this item!
          </Typography>
        )}
      </Box>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={snackbar.message}
      />
    </Container>
  );
};

export default FoodItemPage; 