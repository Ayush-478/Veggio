import React, { useContext, useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardMedia,
  CardContent,
  IconButton,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Chip
} from '@mui/material';
import {
  Add,
  Remove,
  DeleteOutline,
  ShoppingCart,
  NavigateNext,
  InfoOutlined
} from '@mui/icons-material';
import CartContext from '../context/CartContext';
import AuthContext from '../context/AuthContext';

const CartPage = () => {
  const { cart, loading, error, updateCartItem, removeFromCart, clearCart } = useContext(CartContext);
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [cartSummary, setCartSummary] = useState({
    totalItems: 0,
    subtotal: 0,
    tax: 0,
    deliveryFee: 0,
    totalAmount: 0
  });
  
  useEffect(() => {
    if (cart) {
      // Calculate summary
      const totalItems = cart.items.reduce((total, item) => total + item.quantity, 0);
      const subtotal = cart.totalAmount || 0;
      const tax = subtotal * 0.08; // 8% tax
      const deliveryFee = subtotal < 20 ? 2 : 0; // $2 delivery fee for orders under $20
      const totalAmount = subtotal + tax + deliveryFee;
      
      setCartSummary({ totalItems, subtotal, tax, deliveryFee, totalAmount });
    }
  }, [cart]);
  
  const handleUpdateQuantity = async (itemId, currentQuantity, change) => {
    try {
      const newQuantity = currentQuantity + change;
      if (newQuantity <= 0) {
        await removeFromCart(itemId);
      } else {
        await updateCartItem(itemId, newQuantity);
      }
    } catch (err) {
      console.error('Error updating cart item:', err);
    }
  };
  
  const handleRemoveItem = async (itemId) => {
    try {
      await removeFromCart(itemId);
    } catch (err) {
      console.error('Error removing cart item:', err);
    }
  };
  
  const handleClearCart = async () => {
    try {
      await clearCart();
      setConfirmDialogOpen(false);
    } catch (err) {
      console.error('Error clearing cart:', err);
    }
  };
  
  const handleOpenConfirmDialog = () => {
    setConfirmDialogOpen(true);
  };
  
  const handleCloseConfirmDialog = () => {
    setConfirmDialogOpen(false);
  };
  
  const handleCheckout = () => {
    navigate('/checkout');
  };
  
  if (!isAuthenticated) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="info" sx={{ mb: 2 }}>
          Please log in to view your cart
        </Alert>
        <Button 
          variant="contained" 
          component={RouterLink} 
          to="/login"
          startIcon={<ShoppingCart />}
        >
          Login to View Cart
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
  
  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button 
          variant="contained" 
          component={RouterLink} 
          to="/menu"
        >
          Browse Menu
        </Button>
      </Container>
    );
  }
  
  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
          <ShoppingCart sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            Your cart is empty
          </Typography>
          <Typography variant="body1" paragraph color="text.secondary">
            Add some delicious and healthy food items to your cart.
          </Typography>
          <Button 
            variant="contained" 
            component={RouterLink} 
            to="/menu"
            size="large"
          >
            Browse Menu
          </Button>
        </Paper>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        Your Cart
      </Typography>
      
      <Grid container spacing={4}>
        {/* Cart Items */}
        <Grid item xs={12} md={8}>
          <TableContainer component={Paper} sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <Table>
              <TableHead sx={{ bgcolor: 'primary.main' }}>
                <TableRow>
                  <TableCell sx={{ color: 'white' }}>Item</TableCell>
                  <TableCell align="center" sx={{ color: 'white' }}>Price</TableCell>
                  <TableCell align="center" sx={{ color: 'white' }}>Quantity</TableCell>
                  <TableCell align="right" sx={{ color: 'white' }}>Total</TableCell>
                  <TableCell align="right" sx={{ color: 'white' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cart.items.map((item) => {
                  const foodItem = item.foodItem;
                  // Calculate discounted price
                  const price = foodItem.price * (1 - (foodItem.discount || 0) / 100);
                  const totalPrice = price * item.quantity;
                  
                  return (
                    <TableRow key={item._id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {foodItem.image && (
                            <Box
                              component="img"
                              src={foodItem.image}
                              alt={foodItem.name}
                              sx={{ width: 60, height: 60, borderRadius: 1, mr: 2, objectFit: 'cover' }}
                            />
                          )}
                          <Box>
                            <Typography variant="subtitle1">{foodItem.name}</Typography>
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                              <Chip 
                                label={`${foodItem.nutritionalInfo.calories} cal`} 
                                size="small" 
                                color="primary" 
                                variant="outlined"
                              />
                              {foodItem.isVegetarian && (
                                <Chip label="Veg" size="small" color="success" variant="outlined" />
                              )}
                            </Box>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell align="center">${price.toFixed(2)}</TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <IconButton 
                            size="small"
                            onClick={() => handleUpdateQuantity(item._id, item.quantity, -1)}
                          >
                            <Remove fontSize="small" />
                          </IconButton>
                          <Typography sx={{ mx: 1 }}>{item.quantity}</Typography>
                          <IconButton 
                            size="small"
                            onClick={() => handleUpdateQuantity(item._id, item.quantity, 1)}
                          >
                            <Add fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                      <TableCell align="right">${totalPrice.toFixed(2)}</TableCell>
                      <TableCell align="right">
                        <IconButton 
                          color="error"
                          onClick={() => handleRemoveItem(item._id)}
                        >
                          <DeleteOutline />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
            <Button
              variant="outlined"
              color="error"
              onClick={handleOpenConfirmDialog}
              disabled={!cart.items || cart.items.length === 0}
            >
              Clear Cart
            </Button>
            <Button
              variant="outlined"
              component={RouterLink}
              to="/menu"
              startIcon={<ShoppingCart />}
            >
              Continue Shopping
            </Button>
          </Box>
        </Grid>
        
        {/* Order Summary */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h5" gutterBottom>
              Order Summary
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Subtotal ({cartSummary.totalItems} items)</Typography>
                <Typography>${cartSummary.subtotal.toFixed(2)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Tax (8%)</Typography>
                <Typography>${cartSummary.tax.toFixed(2)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Delivery Fee</Typography>
                <Typography>
                  {cartSummary.deliveryFee > 0 
                    ? `$${cartSummary.deliveryFee.toFixed(2)}`
                    : 'Free'}
                </Typography>
              </Box>
              
              {cartSummary.deliveryFee > 0 && (
                <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: 'info.light', p: 1, borderRadius: 1, mt: 1 }}>
                  <InfoOutlined sx={{ mr: 1, fontSize: 16 }} />
                  <Typography variant="body2">
                    Add ${(20 - cartSummary.subtotal).toFixed(2)} more for free delivery
                  </Typography>
                </Box>
              )}
            </Box>
            
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6">Total</Typography>
              <Typography variant="h6" color="primary.main">
                ${cartSummary.totalAmount.toFixed(2)}
              </Typography>
            </Box>
            
            {/* Nutrition Summary */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Nutrition Summary
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Calories</Typography>
                <Typography variant="body2">{cart.totalCalories || 0} kcal</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Protein</Typography>
                <Typography variant="body2">{cart.nutritionSummary?.protein || 0}g</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Carbs</Typography>
                <Typography variant="body2">{cart.nutritionSummary?.carbohydrates || 0}g</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Fat</Typography>
                <Typography variant="body2">{cart.nutritionSummary?.fat || 0}g</Typography>
              </Box>
            </Box>
            
            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={handleCheckout}
              endIcon={<NavigateNext />}
              disabled={!cart.items || cart.items.length === 0}
              sx={{ borderRadius: 8 }}
            >
              Proceed to Checkout
            </Button>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Confirm clear cart dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={handleCloseConfirmDialog}
      >
        <DialogTitle>Clear Cart?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to remove all items from your cart? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleClearCart} color="error">
            Clear Cart
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CartPage; 