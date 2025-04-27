import React, { useState, useEffect, useContext } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Divider,
  Chip,
  Button,
  Grid,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Card,
  CardContent,
  Tab,
  Tabs
} from '@mui/material';
import {
  ArrowForward,
  AccessTime,
  LocalShipping,
  CheckCircle,
  Cancel,
  Receipt
} from '@mui/icons-material';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const getStatusIcon = (status) => {
  switch (status) {
    case 'placed':
      return <AccessTime color="info" />;
    case 'confirmed':
      return <AccessTime color="primary" />;
    case 'preparing':
      return <AccessTime color="secondary" />;
    case 'out for delivery':
      return <LocalShipping color="primary" />;
    case 'delivered':
      return <CheckCircle color="success" />;
    case 'cancelled':
      return <Cancel color="error" />;
    default:
      return <AccessTime />;
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case 'placed':
      return 'info';
    case 'confirmed':
      return 'primary';
    case 'preparing':
      return 'secondary';
    case 'out for delivery':
      return 'primary';
    case 'delivered':
      return 'success';
    case 'cancelled':
      return 'error';
    default:
      return 'default';
  }
};

const OrdersPage = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  
  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated]);
  
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get('https://veggio.onrender.com/api/orders');
      setOrders(res.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load orders. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Filter orders based on tab
  const filteredOrders = orders.filter(order => {
    if (tabValue === 0) return true; // All orders
    if (tabValue === 1) return ['placed', 'confirmed', 'preparing', 'out for delivery'].includes(order.orderStatus); // Active
    if (tabValue === 2) return order.orderStatus === 'delivered'; // Completed
    if (tabValue === 3) return order.orderStatus === 'cancelled'; // Cancelled
    return true;
  });
  
  // Generate placeholder orders if no real orders exist
  const placeholderOrders = [
    {
      _id: '1',
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
          },
          quantity: 2,
          price: 12.49,
          totalPrice: 24.98
        }
      ],
      estimatedDeliveryTime: new Date(Date.now() + 20 * 60 * 1000).toISOString(), // 20 mins from now
    },
    {
      _id: '2',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      totalAmount: 18.99,
      totalCalories: 620,
      orderStatus: 'delivered',
      items: [
        {
          foodItem: {
            _id: '102',
            name: 'Mediterranean Salad',
            image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
          },
          quantity: 1,
          price: 9.99,
          totalPrice: 9.99
        },
        {
          foodItem: {
            _id: '103',
            name: 'Berry Smoothie',
            image: 'https://images.unsplash.com/photo-1577805947697-89e18249d767?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
          },
          quantity: 1,
          price: 8.99,
          totalPrice: 8.99
        }
      ],
      actualDeliveryTime: new Date(Date.now() - 46 * 60 * 60 * 1000).toISOString(), // 46 hours ago
    }
  ];
  
  const displayOrders = orders.length > 0 ? filteredOrders : placeholderOrders;
  
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
          onClick={fetchOrders}
        >
          Try Again
        </Button>
      </Container>
    );
  }
  
  if (!isAuthenticated) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="info" sx={{ mb: 2 }}>
          Please log in to view your orders
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
      <Typography variant="h3" component="h1" gutterBottom>
        My Orders
      </Typography>
      
      <Paper sx={{ mb: 4, borderRadius: 2 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="All Orders" />
          <Tab label="Active" />
          <Tab label="Completed" />
          <Tab label="Cancelled" />
        </Tabs>
      </Paper>
      
      {displayOrders.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
          <Receipt sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            No orders found
          </Typography>
          <Typography variant="body1" paragraph color="text.secondary">
            You haven't placed any orders yet.
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
      ) : (
        <Grid container spacing={3}>
          {displayOrders.map((order) => (
            <Grid item xs={12} key={order._id}>
              <Card sx={{ borderRadius: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Order #{order._id.slice(-6)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(order.createdAt).toLocaleString()}
                      </Typography>
                    </Box>
                    <Chip
                      icon={getStatusIcon(order.orderStatus)}
                      label={order.orderStatus.toUpperCase()}
                      color={getStatusColor(order.orderStatus)}
                      sx={{ textTransform: 'capitalize' }}
                    />
                  </Box>
                  
                  <Divider sx={{ mb: 2 }} />
                  
                  <List disablePadding>
                    {order.items.map((item, index) => (
                      <ListItem key={index} disablePadding sx={{ py: 1 }}>
                        <Box 
                          component="img" 
                          src={item.foodItem.image} 
                          alt={item.foodItem.name}
                          sx={{ width: 50, height: 50, borderRadius: 1, mr: 2, objectFit: 'cover' }}
                        />
                        <ListItemText
                          primary={item.foodItem.name}
                          secondary={`Quantity: ${item.quantity}`}
                        />
                        <ListItemSecondaryAction>
                          <Typography variant="body2">
                            ${item.totalPrice.toFixed(2)}
                          </Typography>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="body2">
                        Total Amount: <strong>${order.totalAmount.toFixed(2)}</strong>
                      </Typography>
                      <Typography variant="body2">
                        Total Calories: <strong>{order.totalCalories} kcal</strong>
                      </Typography>
                    </Box>
                    <Button
                      variant="outlined"
                      endIcon={<ArrowForward />}
                      component={RouterLink}
                      to={`/orders/${order._id}`}
                    >
                      View Details
                    </Button>
                  </Box>
                  
                  {/* Estimated delivery time for active orders */}
                  {['confirmed', 'preparing', 'out for delivery'].includes(order.orderStatus) && order.estimatedDeliveryTime && (
                    <Box sx={{ mt: 2, p: 1, bgcolor: 'info.light', borderRadius: 1 }}>
                      <Typography variant="body2">
                        Estimated Delivery: {new Date(order.estimatedDeliveryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default OrdersPage; 