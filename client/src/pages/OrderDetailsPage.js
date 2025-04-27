import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Grid,
  Divider,
  Chip,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Rating
} from '@mui/material';
import {
  ArrowBack,
  AccessTime,
  CheckCircle,
  Cancel,
  LocalShipping,
  Restaurant,
  Home,
  Receipt
} from '@mui/icons-material';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const OrderDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthContext);
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  useEffect(() => {
    if (isAuthenticated) {
      fetchOrder();
    }
  }, [isAuthenticated, id]);
  
  const fetchOrder = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/orders/${id}`);
      setOrder(res.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching order:', err);
      setError('Failed to load order details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCancelOrder = async () => {
    try {
      setSubmitting(true);
      await axios.put(`/api/orders/${id}/cancel`);
      fetchOrder(); // Refresh order data
      setCancelDialogOpen(false);
    } catch (err) {
      console.error('Error cancelling order:', err);
      setError('Failed to cancel order. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleSubmitFeedback = async () => {
    try {
      setSubmitting(true);
      await axios.put(`/api/orders/${id}/feedback`, { rating, feedback });
      fetchOrder(); // Refresh order data
      setFeedbackDialogOpen(false);
    } catch (err) {
      console.error('Error submitting feedback:', err);
      setError('Failed to submit feedback. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Set up order status steps
  const getOrderSteps = () => {
    const steps = [
      { label: 'Order Placed', icon: <Receipt color="primary" /> },
      { label: 'Order Confirmed', icon: <CheckCircle color="primary" /> },
      { label: 'Preparing Your Food', icon: <Restaurant color="primary" /> },
      { label: 'Out for Delivery', icon: <LocalShipping color="primary" /> },
      { label: 'Delivered', icon: <Home color="primary" /> }
    ];
    
    // Determine active step based on order status
    let activeStep = 0;
    if (!order) return { steps, activeStep };
    
    switch (order.orderStatus) {
      case 'placed':
        activeStep = 0;
        break;
      case 'confirmed':
        activeStep = 1;
        break;
      case 'preparing':
        activeStep = 2;
        break;
      case 'out for delivery':
        activeStep = 3;
        break;
      case 'delivered':
        activeStep = 4;
        break;
      case 'cancelled':
        activeStep = -1; // Special case for cancelled orders
        break;
      default:
        activeStep = 0;
    }
    
    return { steps, activeStep };
  };
  
  // Placeholder order for when API is not available
  const placeholderOrder = {
    _id: id,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    totalAmount: 24.98,
    totalCalories: 770,
    orderStatus: 'out for delivery',
    items: [
      {
        foodItem: {
          _id: '101',
          name: 'Veggie Buddha Bowl',
          image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
          price: 12.49,
          nutritionalInfo: { calories: 450 }
        },
        quantity: 2,
        price: 12.49,
        totalPrice: 24.98
      }
    ],
    deliveryAddress: {
      street: '123 Main St',
      city: 'Anytown',
      state: 'CA',
      zipCode: '12345',
      country: 'USA'
    },
    paymentMethod: 'credit card',
    paymentStatus: 'completed',
    deliveryInstructions: 'Please leave at the door',
    estimatedDeliveryTime: new Date(Date.now() + 20 * 60 * 1000).toISOString(), // 20 mins from now
    statusHistory: [
      { status: 'placed', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), note: 'Order placed successfully' },
      { status: 'confirmed', timestamp: new Date(Date.now() - 1.9 * 60 * 60 * 1000).toISOString(), note: 'Order confirmed' },
      { status: 'preparing', timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(), note: 'Preparing your food' },
      { status: 'out for delivery', timestamp: new Date(Date.now() - 0.5 * 60 * 60 * 1000).toISOString(), note: 'Your order is out for delivery' }
    ]
  };
  
  const displayOrder = order || placeholderOrder;
  const { steps, activeStep } = getOrderSteps();
  
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
          onClick={fetchOrder}
          sx={{ mr: 2 }}
        >
          Try Again
        </Button>
        <Button 
          variant="outlined" 
          component={RouterLink} 
          to="/orders"
          startIcon={<ArrowBack />}
        >
          Back to Orders
        </Button>
      </Container>
    );
  }
  
  if (!isAuthenticated) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="info" sx={{ mb: 2 }}>
          Please log in to view order details
        </Alert>
        <Button 
          variant="contained" 
          component={RouterLink} 
          to="/login"
        >
          Login
        </Button>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button 
        startIcon={<ArrowBack />}
        component={RouterLink}
        to="/orders"
        sx={{ mb: 3 }}
      >
        Back to Orders
      </Button>
      
      <Typography variant="h4" component="h1" gutterBottom>
        Order #{displayOrder._id.slice(-6)}
      </Typography>
      
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Placed on {new Date(displayOrder.createdAt).toLocaleString()}
      </Typography>
      
      <Grid container spacing={4}>
        {/* Order Status */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, borderRadius: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Order Status
              </Typography>
              {displayOrder.orderStatus === 'cancelled' ? (
                <Chip 
                  icon={<Cancel />} 
                  label="CANCELLED" 
                  color="error"
                />
              ) : (
                <Chip 
                  icon={displayOrder.orderStatus === 'delivered' ? <CheckCircle /> : <AccessTime />}
                  label={displayOrder.orderStatus.toUpperCase()} 
                  color={displayOrder.orderStatus === 'delivered' ? 'success' : 'primary'} 
                  sx={{ textTransform: 'capitalize' }}
                />
              )}
            </Box>
            
            {displayOrder.orderStatus === 'cancelled' ? (
              <Alert severity="warning" sx={{ my: 2 }}>
                This order was cancelled.
              </Alert>
            ) : (
              <Stepper activeStep={activeStep} orientation="vertical">
                {steps.map((step, index) => (
                  <Step key={index}>
                    <StepLabel 
                      icon={step.icon}
                      optional={
                        displayOrder.statusHistory && 
                        displayOrder.statusHistory[index] && 
                        <Typography variant="caption">
                          {new Date(displayOrder.statusHistory[index].timestamp).toLocaleString()}
                        </Typography>
                      }
                    >
                      {step.label}
                    </StepLabel>
                    <StepContent>
                      <Typography variant="body2" color="text.secondary">
                        {index === 0 && 'Your order has been received and is being processed.'}
                        {index === 1 && 'Your order has been confirmed and will be prepared soon.'}
                        {index === 2 && 'Our chefs are preparing your delicious meal.'}
                        {index === 3 && 'Your food is on the way to your location!'}
                        {index === 4 && 'Your food has been delivered. Enjoy your meal!'}
                      </Typography>
                    </StepContent>
                  </Step>
                ))}
              </Stepper>
            )}
            
            {['placed', 'confirmed'].includes(displayOrder.orderStatus) && (
              <Box sx={{ mt: 3 }}>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => setCancelDialogOpen(true)}
                  startIcon={<Cancel />}
                >
                  Cancel Order
                </Button>
              </Box>
            )}
            
            {displayOrder.orderStatus === 'delivered' && !displayOrder.feedback && (
              <Box sx={{ mt: 3 }}>
                <Button
                  variant="contained"
                  onClick={() => setFeedbackDialogOpen(true)}
                >
                  Rate Your Order
                </Button>
              </Box>
            )}
            
            {displayOrder.feedback && (
              <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 2 }}>
                <Typography variant="subtitle1">Your Feedback</Typography>
                <Rating value={displayOrder.rating} readOnly precision={0.5} />
                <Typography variant="body2">{displayOrder.feedback}</Typography>
              </Box>
            )}
          </Paper>
          
          {/* Order Items */}
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              Order Items
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <List>
              {displayOrder.items.map((item, index) => (
                <ListItem key={index} sx={{ py: 2 }}>
                  <Box 
                    component="img" 
                    src={item.foodItem.image} 
                    alt={item.foodItem.name}
                    sx={{ width: 70, height: 70, borderRadius: 1, mr: 2, objectFit: 'cover' }}
                  />
                  <ListItemText
                    primary={item.foodItem.name}
                    secondary={
                      <>
                        <Typography component="span" variant="body2">
                          ${item.price.toFixed(2)} x {item.quantity}
                        </Typography>
                        <br />
                        <Chip 
                          label={`${item.foodItem.nutritionalInfo.calories * item.quantity} cal`} 
                          size="small" 
                          color="primary" 
                          variant="outlined"
                          sx={{ mt: 1 }}
                        />
                      </>
                    }
                  />
                  <Typography variant="body1" sx={{ fontWeight: 'bold', minWidth: 80, textAlign: 'right' }}>
                    ${item.totalPrice.toFixed(2)}
                  </Typography>
                </ListItem>
              ))}
            </List>
            
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography>Subtotal:</Typography>
              <Typography>${(displayOrder.totalAmount - 4.99).toFixed(2)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography>Delivery Fee:</Typography>
              <Typography>$2.99</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography>Tax:</Typography>
              <Typography>$2.00</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Typography variant="h6">Total:</Typography>
              <Typography variant="h6">${displayOrder.totalAmount.toFixed(2)}</Typography>
            </Box>
            <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
              Total Calories: {displayOrder.totalCalories} kcal
            </Typography>
          </Paper>
        </Grid>
        
        {/* Order Details */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Delivery Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Typography variant="subtitle1">Delivery Address</Typography>
            <Typography variant="body2">
              {displayOrder.deliveryAddress.street}
            </Typography>
            <Typography variant="body2">
              {displayOrder.deliveryAddress.city}, {displayOrder.deliveryAddress.state} {displayOrder.deliveryAddress.zipCode}
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              {displayOrder.deliveryAddress.country}
            </Typography>
            
            {displayOrder.deliveryInstructions && (
              <>
                <Typography variant="subtitle1">Delivery Instructions</Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  {displayOrder.deliveryInstructions}
                </Typography>
              </>
            )}
            
            {displayOrder.estimatedDeliveryTime && ['preparing', 'out for delivery'].includes(displayOrder.orderStatus) && (
              <>
                <Typography variant="subtitle1">Estimated Delivery Time</Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  {new Date(displayOrder.estimatedDeliveryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Typography>
              </>
            )}
            
            {displayOrder.actualDeliveryTime && displayOrder.orderStatus === 'delivered' && (
              <>
                <Typography variant="subtitle1">Delivered At</Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  {new Date(displayOrder.actualDeliveryTime).toLocaleString()}
                </Typography>
              </>
            )}
          </Paper>
          
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              Payment Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Typography variant="subtitle1">Payment Method</Typography>
            <Typography variant="body2" sx={{ mb: 2, textTransform: 'capitalize' }}>
              {displayOrder.paymentMethod}
            </Typography>
            
            <Typography variant="subtitle1">Payment Status</Typography>
            <Chip 
              label={displayOrder.paymentStatus.toUpperCase()} 
              color={displayOrder.paymentStatus === 'completed' ? 'success' : 'warning'} 
              size="small"
              sx={{ textTransform: 'capitalize', mb: 2 }}
            />
            
            {displayOrder.orderNotes && (
              <>
                <Typography variant="subtitle1">Order Notes</Typography>
                <Typography variant="body2">
                  {displayOrder.orderNotes}
                </Typography>
              </>
            )}
          </Paper>
        </Grid>
      </Grid>
      
      {/* Cancel Order Dialog */}
      <Dialog
        open={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
      >
        <DialogTitle>Cancel Order?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to cancel this order? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)}>No, Keep Order</Button>
          <Button 
            onClick={handleCancelOrder} 
            color="error" 
            autoFocus
            disabled={submitting}
          >
            {submitting ? 'Cancelling...' : 'Yes, Cancel Order'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Feedback Dialog */}
      <Dialog
        open={feedbackDialogOpen}
        onClose={() => setFeedbackDialogOpen(false)}
      >
        <DialogTitle>Rate Your Order</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
            <Typography component="legend">Rating</Typography>
            <Rating
              name="rating"
              value={rating}
              precision={0.5}
              onChange={(_, newValue) => {
                setRating(newValue);
              }}
              size="large"
            />
          </Box>
          <TextField
            autoFocus
            margin="dense"
            label="Feedback"
            fullWidth
            variant="outlined"
            multiline
            rows={4}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFeedbackDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleSubmitFeedback} 
            variant="contained"
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default OrderDetailsPage; 