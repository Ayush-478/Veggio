import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  CircularProgress,
  Alert,
  Tabs,
  Tab
} from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const CalorieTrackerPage = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days ago
    endDate: new Date().toISOString().split('T')[0] // today
  });
  const [calorieData, setCalorieData] = useState({
    summary: null,
    dailyData: [],
    chartData: {}
  });
  
  useEffect(() => {
    if (isAuthenticated) {
      fetchCalorieData();
    }
  }, [isAuthenticated]);
  
  const fetchCalorieData = async () => {
    try {
      setLoading(true);
      
      // Fetch calorie summary
      const summaryRes = await axios.get('https://veggio.onrender.com/api/users/calorie-tracker/summary');
      
      // Fetch calorie range data
      const rangeRes = await axios.get(`https://veggio.onrender.com/api/users/calorie-tracker/range?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`);
      
      setCalorieData({
        summary: summaryRes.data,
        dailyData: rangeRes.data.trackers,
        chartData: rangeRes.data.chartData
      });
      
      setError(null);
    } catch (err) {
      console.error('Error fetching calorie data:', err);
      setError('Failed to load calorie tracking data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };
  
  const handleDateRangeChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({ ...prev, [name]: value }));
  };
  
  const handleUpdateDateRange = () => {
    fetchCalorieData();
  };
  
  // Calculate nutrient percentages for the pie chart
  const getNutrientData = () => {
    if (!calorieData.summary) return [];
    
    const { protein, carbohydrates, fat } = calorieData.summary.today.nutrition;
    
    return [
      { name: 'Protein', value: protein },
      { name: 'Carbs', value: carbohydrates },
      { name: 'Fat', value: fat }
    ];
  };
  
  // Placeholder data for charts when API is not available
  const getPlaceholderChartData = () => {
    const dates = [];
    const calories = [];
    const calorieGoal = [];
    const protein = [];
    const carbs = [];
    const fat = [];
    
    // Generate 7 days of data
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
      
      // Random calorie values between 1500 and 2500
      const calValue = Math.floor(Math.random() * 1000) + 1500;
      calories.push(calValue);
      calorieGoal.push(2000);
      
      // Macronutrients (roughly 20% protein, 50% carbs, 30% fat)
      protein.push(Math.round(calValue * 0.2 / 4)); // 4 calories per gram of protein
      carbs.push(Math.round(calValue * 0.5 / 4));  // 4 calories per gram of carbs
      fat.push(Math.round(calValue * 0.3 / 9));    // 9 calories per gram of fat
    }
    
    // Format for charts
    const calorieChartData = dates.map((date, index) => ({
      date,
      calories: calories[index],
      goal: calorieGoal[index]
    }));
    
    const macroChartData = dates.map((date, index) => ({
      date,
      protein: protein[index],
      carbs: carbs[index],
      fat: fat[index]
    }));
    
    return {
      dates,
      calorieChartData,
      macroChartData,
      nutrientData: [
        { name: 'Protein', value: protein[protein.length - 1] },
        { name: 'Carbs', value: carbs[carbs.length - 1] },
        { name: 'Fat', value: fat[fat.length - 1] }
      ],
      todaySummary: {
        calories: calories[calories.length - 1],
        calorieGoal: 2000,
        percentOfGoal: Math.round((calories[calories.length - 1] / 2000) * 100)
      }
    };
  };
  
  const placeholderData = getPlaceholderChartData();
  
  const displayCalorieChartData = calorieData.chartData.dates ? 
    calorieData.chartData.dates.map((date, i) => ({
      date,
      calories: calorieData.chartData.calories[i],
      goal: calorieData.chartData.calorieGoal
    })) : 
    placeholderData.calorieChartData;
  
  const displayMacroChartData = calorieData.chartData.dates ? 
    calorieData.chartData.dates.map((date, i) => ({
      date,
      protein: calorieData.chartData.nutritionData.protein[i],
      carbs: calorieData.chartData.nutritionData.carbohydrates[i],
      fat: calorieData.chartData.nutritionData.fat[i]
    })) : 
    placeholderData.macroChartData;
  
  const displayNutrientData = calorieData.summary ? 
    getNutrientData() : 
    placeholderData.nutrientData;
  
  const displayTodaySummary = calorieData.summary ? 
    {
      calories: calorieData.summary.today.calories,
      calorieGoal: calorieData.summary.calorieGoal,
      percentOfGoal: calorieData.summary.today.percentOfGoal
    } : 
    placeholderData.todaySummary;
  
  if (!isAuthenticated) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="info" sx={{ mb: 2 }}>
          Please log in to view your calorie tracker
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
      <Typography variant="h3" component="h1" gutterBottom>
        Calorie Tracker
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Date Range Selector */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Start Date"
              type="date"
              name="startDate"
              value={dateRange.startDate}
              onChange={handleDateRangeChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="End Date"
              type="date"
              name="endDate"
              value={dateRange.endDate}
              onChange={handleDateRangeChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button 
              variant="contained" 
              onClick={handleUpdateDateRange}
              fullWidth
              sx={{ height: '56px' }}
            >
              Update
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Today's Summary */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom>
          Today's Summary
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="primary">
                {displayTodaySummary.calories}
              </Typography>
              <Typography variant="body1">
                Calories consumed
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="primary">
                {displayTodaySummary.calorieGoal}
              </Typography>
              <Typography variant="body1">
                Calorie goal
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h3" 
                color={
                  displayTodaySummary.percentOfGoal > 100 
                    ? 'error.main' 
                    : displayTodaySummary.percentOfGoal > 90 
                      ? 'warning.main' 
                      : 'success.main'
                }
              >
                {displayTodaySummary.percentOfGoal}%
              </Typography>
              <Typography variant="body1">
                Of daily goal
              </Typography>
            </Box>
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 4, height: 300 }}>
          <Typography variant="h6" gutterBottom>
            Today's Macronutrient Breakdown
          </Typography>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={displayNutrientData}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {displayNutrientData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value}g`, 'Amount']} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Box>
      </Paper>
      
      {/* Charts */}
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={selectedTab} onChange={handleTabChange}>
            <Tab label="Calories Over Time" />
            <Tab label="Macronutrients Over Time" />
          </Tabs>
        </Box>
        
        {selectedTab === 0 && (
          <Box sx={{ height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={displayCalorieChartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="calories" 
                  name="Calories Consumed" 
                  stroke="#8884d8" 
                  activeDot={{ r: 8 }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="goal" 
                  name="Calorie Goal" 
                  stroke="#82ca9d" 
                  strokeDasharray="5 5" 
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        )}
        
        {selectedTab === 1 && (
          <Box sx={{ height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={displayMacroChartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis label={{ value: 'Grams', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="protein" name="Protein" fill="#8884d8" />
                <Bar dataKey="carbs" name="Carbohydrates" fill="#82ca9d" />
                <Bar dataKey="fat" name="Fat" fill="#ffc658" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default CalorieTrackerPage; 