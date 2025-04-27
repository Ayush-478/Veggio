import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Divider,
  Paper,
  Stack,
  Chip,
} from '@mui/material';
import {
  LocalDining,
  MonitorWeight,
  AccountBalanceWallet,
  Chat,
} from '@mui/icons-material';
import axios from 'axios';

const HomePage = () => {
  const [popularItems, setPopularItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchPopularItems = async () => {
      try {
        const res = await axios.get('https://veggio.onrender.com/api/food?sort=popular&limit=4');
        setPopularItems(res.data.slice(0, 4)); // Ensure we only get 4 items
      } catch (error) {
        console.error('Error fetching popular items:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPopularItems();
  }, []);
  
  // Placeholder data for when API is not available
  const placeholderItems = [
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
    },
    {
      _id: '4',
      name: 'Avocado Toast',
      description: 'Whole grain toast topped with smashed avocado, cherry tomatoes, and microgreens.',
      price: 7.99,
      image: 'https://images.unsplash.com/photo-1588137378633-dea1336ce1e2?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      nutritionalInfo: { calories: 290 },
      isVegetarian: true,
      category: 'breakfast'
    }
  ];
  
  const displayItems = popularItems.length > 0 ? popularItems : placeholderItems;
  
  return (
    <>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: 8,
          mb: 6,
          borderRadius: { xs: 0, md: '0 0 50px 50px' },
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography
                variant="h2"
                component="h1"
                gutterBottom
                sx={{ fontWeight: 700 }}
              >
                Healthy Food for a Healthy Life
              </Typography>
              <Typography variant="h5" paragraph sx={{ mb: 4 }}>
                Order fresh, nutritious meals delivered to your doorstep. Track your calories and expenses with our smart tools.
              </Typography>
              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  color="secondary"
                  size="large"
                  component={RouterLink}
                  to="/menu"
                  sx={{ borderRadius: 8, px: 4 }}
                >
                  Explore Menu
                </Button>
                <Button
                  variant="outlined"
                  color="inherit"
                  size="large"
                  component={RouterLink}
                  to="/chat"
                  sx={{ borderRadius: 8, px: 4 }}
                >
                  Ask ChefBot
                </Button>
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                component="img"
                src="https://images.unsplash.com/photo-1498837167922-ddd27525d352?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
                alt="Healthy Food"
                sx={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: 4,
                  boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>
      
      {/* Features Section */}
      <Container maxWidth="lg" sx={{ mb: 8 }}>
        <Typography
          variant="h3"
          component="h2"
          align="center"
          gutterBottom
          sx={{ mb: 6 }}
        >
          Why Choose VeggIO?
        </Typography>
        
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                borderRadius: 4,
                transition: 'transform 0.3s',
                '&:hover': {
                  transform: 'translateY(-8px)',
                },
              }}
            >
              <LocalDining
                sx={{ fontSize: 60, color: 'primary.main', mb: 2 }}
              />
              <Typography variant="h5" component="h3" gutterBottom>
                Healthy Menu
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Nutritious and delicious meals prepared with fresh ingredients.
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                borderRadius: 4,
                transition: 'transform 0.3s',
                '&:hover': {
                  transform: 'translateY(-8px)',
                },
              }}
            >
              <MonitorWeight
                sx={{ fontSize: 60, color: 'primary.main', mb: 2 }}
              />
              <Typography variant="h5" component="h3" gutterBottom>
                Calorie Tracker
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Monitor your daily calorie intake with detailed nutritional information.
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                borderRadius: 4,
                transition: 'transform 0.3s',
                '&:hover': {
                  transform: 'translateY(-8px)',
                },
              }}
            >
              <AccountBalanceWallet
                sx={{ fontSize: 60, color: 'primary.main', mb: 2 }}
              />
              <Typography variant="h5" component="h3" gutterBottom>
                Expense Tracker
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Keep track of your food expenses and manage your budget effectively.
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                borderRadius: 4,
                transition: 'transform 0.3s',
                '&:hover': {
                  transform: 'translateY(-8px)',
                },
              }}
            >
              <Chat sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" component="h3" gutterBottom>
                ChefBot Assistant
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Get personalized food recommendations and answers to your questions.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>
      
      {/* Popular Items Section */}
      <Box sx={{ bgcolor: 'grey.50', py: 8 }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            component="h2"
            align="center"
            gutterBottom
            sx={{ mb: 1 }}
          >
            Popular Items
          </Typography>
          <Typography
            variant="h6"
            align="center"
            color="text.secondary"
            paragraph
            sx={{ mb: 6 }}
          >
            Our customers' favorite healthy choices
          </Typography>
          
          <Grid container spacing={4}>
            {displayItems.map((item) => (
              <Grid item key={item._id} xs={12} sm={6} md={3}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 4,
                    transition: 'transform 0.3s',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                    },
                  }}
                >
                  <CardMedia
                    component="img"
                    height="200"
                    image={item.image}
                    alt={item.name}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h5" component="h3">
                      {item.name}
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                      <Chip
                        label={`${item.nutritionalInfo.calories} cal`}
                        size="small"
                        color="primary"
                      />
                      {item.isVegetarian && (
                        <Chip label="Vegetarian" size="small" color="success" />
                      )}
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      {item.description}
                    </Typography>
                  </CardContent>
                  <Divider />
                  <CardActions sx={{ justifyContent: 'space-between', px: 2 }}>
                    <Typography variant="h6" color="primary.main">
                      ${item.price.toFixed(2)}
                    </Typography>
                    <Button
                      size="small"
                      component={RouterLink}
                      to={`/menu/${item._id}`}
                    >
                      View Details
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
          
          <Box sx={{ textAlign: 'center', mt: 6 }}>
            <Button
              variant="contained"
              size="large"
              component={RouterLink}
              to="/menu"
              sx={{ borderRadius: 8, px: 4 }}
            >
              View Full Menu
            </Button>
          </Box>
        </Container>
      </Box>
      
      {/* CTA Section */}
      <Box sx={{ py: 8 }}>
        <Container maxWidth="md">
          <Paper
            sx={{
              p: { xs: 4, md: 6 },
              borderRadius: 4,
              backgroundImage: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)',
              color: 'white',
              textAlign: 'center',
            }}
          >
            <Typography variant="h3" component="h2" gutterBottom>
              Ready to eat healthy?
            </Typography>
            <Typography variant="h6" paragraph sx={{ mb: 4 }}>
              Start your journey to a healthier lifestyle today with VeggIO's nutritious meals.
            </Typography>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              justifyContent="center"
            >
              <Button
                variant="contained"
                color="secondary"
                size="large"
                component={RouterLink}
                to="/register"
                sx={{ borderRadius: 8, px: 4 }}
              >
                Sign Up Now
              </Button>
              <Button
                variant="outlined"
                color="inherit"
                size="large"
                component={RouterLink}
                to="/menu"
                sx={{ borderRadius: 8, px: 4 }}
              >
                Explore Menu
              </Button>
            </Stack>
          </Paper>
        </Container>
      </Box>
    </>
  );
};

export default HomePage; 