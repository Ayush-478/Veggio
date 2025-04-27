import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Stepper,
  Step,
  StepLabel,
  RadioGroup,
  Radio,
  FormControlLabel,
  CircularProgress,
  Alert,
  Chip
} from '@mui/material';
import {
  Home,
  Payment,
  Receipt,
  CheckCircleOutline,
  ArrowBack,
  ArrowForward
} from '@mui/icons-material';
import axios from 'axios';
import CartContext from '../context/CartContext';
import AuthContext from '../context/AuthContext';

const steps = ['Delivery Address', 'Payment Method', 'Review Order'];

const CheckoutPage = () => {
  const { cart, loading: cartLoading, error: cartError, clearCart } = useContext(CartContext);
  const { user, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [activeStep, setActiveStep] = useState(0);
  const [orderData, setOrderData] = useState({
    deliveryAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'USA'
    },
    paymentMethod: 'credit card',
    deliveryInstructions: '',
    orderNotes: ''
  });
  const [cartSummary, setCartSummary] = useState({
    totalItems: 0,
    subtotal: 0,
    tax: 0,
    deliveryFee: 0,
    totalAmount: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderResult, setOrderResult] = useState(null);
  
  useEffect(() => {
    // Redirect if not authenticated
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    // Redirect if cart is empty
    if (cart && (!cart.items || cart.items.length === 0) && !orderComplete) {
      navigate('/cart');
      return;
    }
    
    // Pre-fill user address if available
    if (user && user.address) {
      setOrderData(prev => ({
        ...prev,
        deliveryAddress: {
          street: user.address.street || '',
          city: user.address.city || '',
          state: user.address.state || '',
          zipCode: user.address.zipCode || '',
          country: user.address.country || 'USA'
        }
      }));
    }
    
    // Calculate order summary
    if (cart) {
      const totalItems = cart.items?.reduce((total, item) => total + item.quantity, 0) || 0;
      const subtotal = cart.totalAmount || 0;
      const tax = subtotal * 0.08; // 8% tax
      const deliveryFee = subtotal < 20 ? 2 : 0; // $2 delivery fee for orders under $20
      const totalAmount = subtotal + tax + deliveryFee;
      
      setCartSummary({ totalItems, subtotal, tax, deliveryFee, totalAmount });
    }
  }, [isAuthenticated, navigate, user, cart, orderComplete]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setOrderData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setOrderData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      handlePlaceOrder();
    } else {
      setActiveStep(prevStep => prevStep + 1);
    }
  };
  
  const handleBack = () => {
    setActiveStep(prevStep => prevStep - 1);
  };
  
  const handlePlaceOrder = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Submit order to API
      const response = await axios.post('/api/orders', orderData);
      
      // Clear cart after successful order
      await clearCart();
      
      // Set order complete
      setOrderComplete(true);
      setOrderResult(response.data);
      
      // Reset stepper
      setActiveStep(0);
    } catch (err) {
      console.error('Error placing order:', err);
      setError(err.response?.data?.message || 'There was an error placing your order. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const isAddressComplete = () => {
    const { street, city, state, zipCode } = orderData.deliveryAddress;
    return street && city && state && zipCode;
  };
  
  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Delivery Address
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Street Address"
                  name="deliveryAddress.street"
                  value={orderData.deliveryAddress.street}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="City"
                  name="deliveryAddress.city"
                  value={orderData.deliveryAddress.city}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="State/Province"
                  name="deliveryAddress.state"
                  value={orderData.deliveryAddress.state}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="ZIP / Postal code"
                  name="deliveryAddress.zipCode"
                  value={orderData.deliveryAddress.zipCode}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Country</InputLabel>
                  <Select
                    name="deliveryAddress.country"
                    value={orderData.deliveryAddress.country}
                    label="Country"
                    onChange={handleChange}
                  >
                    <MenuItem value="USA">United States</MenuItem>
                    <MenuItem value="Canada">Canada</MenuItem>
                    <MenuItem value="UK">United Kingdom</MenuItem>
                    <MenuItem value="Australia">Australia</MenuItem>
                    <MenuItem value="India">India</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Delivery Instructions (optional)"
                  name="deliveryInstructions"
                  value={orderData.deliveryInstructions}
                  onChange={handleChange}
                  multiline
                  rows={2}
                  placeholder="E.g., Ring the doorbell, leave at the door, etc."
                />
              </Grid>
            </Grid>
          </Box>
        );
      
      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Payment Method
            </Typography>
            <RadioGroup
              name="paymentMethod"
              value={orderData.paymentMethod}
              onChange={handleChange}
            >
              <FormControlLabel
                value="credit card"
                control={<Radio />}
                label="Credit Card"
              />
              <FormControlLabel
                value="debit card"
                control={<Radio />}
                label="Debit Card"
              />
              <FormControlLabel
                value="cash on delivery"
                control={<Radio />}
                label="Cash on Delivery"
              />
            </RadioGroup>
            
            {orderData.paymentMethod !== 'cash on delivery' && (
              <Alert severity="info" sx={{ mt: 2 }}>
                Note: This is a demo app. No actual payment will be processed.
              </Alert>
            )}
            
            <Box sx={{ mt: 3 }}>
              <TextField
                fullWidth
                label="Additional Notes (optional)"
                name="orderNotes"
                value={orderData.orderNotes}
                onChange={handleChange}
                multiline
                rows={2}
                placeholder="Any special requests or information about your order"
              />
            </Box>
          </Box>
        );
      
      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Order Summary
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1">Delivery Address</Typography>
                <Typography variant="body2">
                  {orderData.deliveryAddress.street}
                </Typography>
                <Typography variant="body2">
                  {orderData.deliveryAddress.city}, {orderData.deliveryAddress.state} {orderData.deliveryAddress.zipCode}
                </Typography>
                <Typography variant="body2">
                  {orderData.deliveryAddress.country}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1">Payment Method</Typography>
                <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                  {orderData.paymentMethod}
                </Typography>
              </Grid>
              
              {orderData.deliveryInstructions && (
                <Grid item xs={12}>
                  <Typography variant="subtitle1">Delivery Instructions</Typography>
                  <Typography variant="body2">
                    {orderData.deliveryInstructions}
                  </Typography>
                </Grid>
              )}
              
              {orderData.orderNotes && (
                <Grid item xs={12}>
                  <Typography variant="subtitle1">Order Notes</Typography>
                  <Typography variant="body2">
                    {orderData.orderNotes}
                  </Typography>
                </Grid>
              )}
            </Grid>
            
            <Divider sx={{ my: 3 }} />
            
            <Typography variant="h6" gutterBottom>
              Items
            </Typography>
            
            {cart && cart.items && cart.items.map((item) => {
              const foodItem = item.foodItem;
              return (
                <Box key={item._id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box
                      component="img"
                      src={foodItem.image}
                      alt={foodItem.name}
                      sx={{ width: 40, height: 40, borderRadius: 1, mr: 2, objectFit: 'cover' }}
                    />
                    <Box>
                      <Typography variant="body1">
                        {foodItem.name} x {item.quantity}
                      </Typography>
                      <Chip 
                        label={`${foodItem.nutritionalInfo.calories} cal`} 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                      />
                    </Box>
                  </Box>
                  <Typography variant="body1">
                    ${(foodItem.price * item.quantity).toFixed(2)}
                  </Typography>
                </Box>
              );
            })}
            
            <Divider sx={{ my: 3 }} />
            
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Subtotal</Typography>
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
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <Typography variant="h6">Total</Typography>
                <Typography variant="h6" color="primary.main">
                  ${cartSummary.totalAmount.toFixed(2)}
                </Typography>
              </Box>
              
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1">
                  Total Calories: {cart?.totalCalories || 0} kcal
                </Typography>
              </Box>
            </Box>
          </Box>
        );
      
      default:
        return 'Unknown step';
    }
  };
  
  if (cartLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (cartError) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {cartError}
        </Alert>
        <Button 
          variant="contained" 
          onClick={() => navigate('/cart')}
        >
          Back to Cart
        </Button>
      </Container>
    );
  }
  
  if (orderComplete) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
          <CheckCircleOutline sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            Order Placed Successfully!
          </Typography>
          <Typography variant="body1" paragraph>
            Thank you for your order. Your order number is #{orderResult?._id?.slice(-6)}.
          </Typography>
          <Typography variant="body1" paragraph>
            You will receive a confirmation email shortly.
          </Typography>
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button
              variant="contained"
              onClick={() => navigate('/orders')}
              startIcon={<Receipt />}
            >
              View Orders
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/menu')}
            >
              Continue Shopping
            </Button>
          </Box>
        </Paper>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Checkout
      </Typography>
      
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}
            
            {getStepContent(activeStep)}
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                startIcon={<ArrowBack />}
              >
                Back
              </Button>
              <Button
                variant="contained"
                onClick={handleNext}
                endIcon={activeStep === steps.length - 1 ? undefined : <ArrowForward />}
                disabled={
                  (activeStep === 0 && !isAddressComplete()) || 
                  loading
                }
              >
                {activeStep === steps.length - 1 ? (
                  loading ? 'Placing Order...' : 'Place Order'
                ) : (
                  'Continue'
                )}
              </Button>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              Order Summary
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Items ({cartSummary.totalItems})</Typography>
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
            </Box>
            
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6">Total</Typography>
              <Typography variant="h6" color="primary.main">
                ${cartSummary.totalAmount.toFixed(2)}
              </Typography>
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Nutrition Summary
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Calories</Typography>
                <Typography variant="body2">{cart?.totalCalories || 0} kcal</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Protein</Typography>
                <Typography variant="body2">{cart?.nutritionSummary?.protein || 0}g</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Carbs</Typography>
                <Typography variant="body2">{cart?.nutritionSummary?.carbohydrates || 0}g</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Fat</Typography>
                <Typography variant="body2">{cart?.nutritionSummary?.fat || 0}g</Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CheckoutPage; 