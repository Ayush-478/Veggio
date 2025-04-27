import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardMedia, 
  CardContent, 
  CardActions, 
  Button, 
  Chip, 
  Box, 
  TextField, 
  InputAdornment, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Divider,
  CircularProgress,
  Alert
} from '@mui/material';
import { Search, FilterList } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import axios from 'axios';

const MenuPage = () => {
  const [foodItems, setFoodItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    minPrice: '',
    maxPrice: '',
    sort: 'createdAt-desc'
  });

  useEffect(() => {
    const fetchFoodItems = async () => {
      try {
        setLoading(true);
        
        // Build query string from filters
        const queryParams = new URLSearchParams();
        if (filters.search) queryParams.append('search', filters.search);
        if (filters.category) queryParams.append('category', filters.category);
        if (filters.isVegetarian) queryParams.append('isVegetarian', filters.isVegetarian);
        if (filters.isVegan) queryParams.append('isVegan', filters.isVegan);
        if (filters.isGlutenFree) queryParams.append('isGlutenFree', filters.isGlutenFree);
        if (filters.minPrice) queryParams.append('minPrice', filters.minPrice);
        if (filters.maxPrice) queryParams.append('maxPrice', filters.maxPrice);
        if (filters.sort) queryParams.append('sort', filters.sort);
        
        const res = await axios.get(`/api/food?${queryParams.toString()}`);
        setFoodItems(res.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching food items:', err);
        setError('Failed to load menu items. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchFoodItems();
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFilters(prev => ({ ...prev, [name]: checked }));
  };

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

  const displayItems = foodItems.length > 0 ? foodItems : placeholderItems;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center">
        Our Menu
      </Typography>
      
      {/* Filters */}
      <Box sx={{ mb: 4, p: 2, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 1 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              name="search"
              label="Search"
              value={filters.search}
              onChange={handleFilterChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                name="category"
                value={filters.category}
                label="Category"
                onChange={handleFilterChange}
              >
                <MenuItem value="">All Categories</MenuItem>
                <MenuItem value="appetizer">Appetizers</MenuItem>
                <MenuItem value="main course">Main Courses</MenuItem>
                <MenuItem value="dessert">Desserts</MenuItem>
                <MenuItem value="beverage">Beverages</MenuItem>
                <MenuItem value="breakfast">Breakfast</MenuItem>
                <MenuItem value="lunch">Lunch</MenuItem>
                <MenuItem value="dinner">Dinner</MenuItem>
                <MenuItem value="snack">Snacks</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Sort By</InputLabel>
              <Select
                name="sort"
                value={filters.sort}
                label="Sort By"
                onChange={handleFilterChange}
              >
                <MenuItem value="price-asc">Price: Low to High</MenuItem>
                <MenuItem value="price-desc">Price: High to Low</MenuItem>
                <MenuItem value="rating-desc">Highest Rated</MenuItem>
                <MenuItem value="popular">Most Popular</MenuItem>
                <MenuItem value="createdAt-desc">Newest</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={2}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip 
                label="Vegetarian" 
                color={filters.isVegetarian ? "primary" : "default"}
                onClick={() => setFilters(prev => ({ ...prev, isVegetarian: !prev.isVegetarian }))}
                clickable
              />
              <Chip 
                label="Vegan" 
                color={filters.isVegan ? "primary" : "default"}
                onClick={() => setFilters(prev => ({ ...prev, isVegan: !prev.isVegan }))}
                clickable
              />
            </Box>
          </Grid>
        </Grid>
      </Box>
      
      {/* Error message */}
      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}
      
      {/* Loading indicator */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        /* Food items grid */
        <Grid container spacing={4}>
          {displayItems.map((item) => (
            <Grid item key={item._id} xs={12} sm={6} md={4} lg={3}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'transform 0.3s',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                  },
                  borderRadius: 2,
                  overflow: 'hidden',
                }}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={item.image}
                  alt={item.name}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h5" component="h2">
                    {item.name}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Chip 
                      label={`${item.nutritionalInfo.calories} cal`} 
                      size="small" 
                      color="primary"
                    />
                    {item.isVegetarian && (
                      <Chip label="Vegetarian" size="small" color="success" />
                    )}
                    {item.isVegan && (
                      <Chip label="Vegan" size="small" color="success" />
                    )}
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {item.description}
                  </Typography>
                </CardContent>
                <Divider />
                <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
                  <Typography variant="h6" color="primary.main">
                    ${item.price.toFixed(2)}
                  </Typography>
                  <Button 
                    variant="contained" 
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
      )}
      
      {/* No results message */}
      {!loading && displayItems.length === 0 && (
        <Box sx={{ textAlign: 'center', my: 4 }}>
          <Typography variant="h6">
            No food items found matching your criteria.
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => setFilters({
              search: '',
              category: '',
              isVegetarian: false,
              isVegan: false,
              isGlutenFree: false,
              minPrice: '',
              maxPrice: '',
              sort: 'createdAt-desc'
            })}
            sx={{ mt: 2 }}
          >
            Clear Filters
          </Button>
        </Box>
      )}
    </Container>
  );
};

export default MenuPage; 