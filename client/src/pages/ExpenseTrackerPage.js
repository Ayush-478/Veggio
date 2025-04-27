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
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import {
  Edit,
  Delete,
  Add,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  AttachMoney
} from '@mui/icons-material';
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
  ResponsiveContainer
} from 'recharts';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const CATEGORY_COLORS = {
  breakfast: '#4caf50',
  lunch: '#2196f3',
  dinner: '#9c27b0',
  snack: '#ff9800',
  other: '#f44336'
};

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June', 
  'July', 'August', 'September', 'October', 'November', 'December'
];

const ExpenseTrackerPage = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [expenseData, setExpenseData] = useState({
    summary: null,
    monthlyData: null,
    chartData: {}
  });
  const [dateRange, setDateRange] = useState(() => {
    const date = new Date();
    return {
      month: date.getMonth() + 1,
      year: date.getFullYear(),
      startMonth: date.getMonth() + 1,
      startYear: date.getFullYear(),
      endMonth: date.getMonth() + 1,
      endYear: date.getFullYear()
    };
  });
  const [budgetDialog, setBudgetDialog] = useState({
    open: false,
    budget: 0
  });
  
  useEffect(() => {
    if (isAuthenticated) {
      fetchExpenseData();
    }
  }, [isAuthenticated]);
  
  const fetchExpenseData = async () => {
    try {
      setLoading(true);
      
      // Fetch expense summary
      const summaryRes = await axios.get('/api/users/expense-tracker/summary');
      
      // Fetch current month's expenses
      const currentMonthRes = await axios.get(`/api/users/expense-tracker/month/${dateRange.year}/${dateRange.month}`);
      
      // Fetch expense range data
      const rangeRes = await axios.get(
        `/api/users/expense-tracker/range?startMonth=${dateRange.startMonth}&startYear=${dateRange.startYear}&endMonth=${dateRange.endMonth}&endYear=${dateRange.endYear}`
      );
      
      setExpenseData({
        summary: summaryRes.data,
        monthlyData: currentMonthRes.data,
        chartData: rangeRes.data.chartData
      });
      
      // Update budget dialog value
      setBudgetDialog(prev => ({
        ...prev,
        budget: currentMonthRes.data.budget || 0
      }));
      
      setError(null);
    } catch (err) {
      console.error('Error fetching expense data:', err);
      setError('Failed to load expense tracking data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };
  
  const handleMonthYearChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({ ...prev, [name]: value }));
  };
  
  const handleUpdateMonth = () => {
    fetchExpenseData();
  };
  
  const handleUpdateBudget = async () => {
    try {
      await axios.put('/api/users/expense-tracker/budget', {
        budget: budgetDialog.budget,
        year: dateRange.year,
        month: dateRange.month
      });
      
      setBudgetDialog(prev => ({ ...prev, open: false }));
      fetchExpenseData();
    } catch (err) {
      console.error('Error updating budget:', err);
      setError('Failed to update budget. Please try again.');
    }
  };
  
  // Placeholder data for when API is not available
  const getPlaceholderData = () => {
    const categoryData = [
      { name: 'Breakfast', value: 150, color: CATEGORY_COLORS.breakfast },
      { name: 'Lunch', value: 300, color: CATEGORY_COLORS.lunch },
      { name: 'Dinner', value: 400, color: CATEGORY_COLORS.dinner },
      { name: 'Snack', value: 100, color: CATEGORY_COLORS.snack },
      { name: 'Other', value: 50, color: CATEGORY_COLORS.other }
    ];
    
    const totalExpense = categoryData.reduce((sum, item) => sum + item.value, 0);
    const budget = 1200;
    
    // Generate 6 months of data
    const labels = [];
    const expenses = [];
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      
      labels.push(`${MONTHS[date.getMonth()]} ${date.getFullYear()}`);
      
      // Random expense between 700 and 1300
      expenses.push(Math.floor(Math.random() * 600) + 700);
    }
    
    const monthlyExpenses = [
      { date: '2023-05-15', category: 'breakfast', amount: 45.99, description: 'Morning coffee and pastries' },
      { date: '2023-05-18', category: 'lunch', amount: 78.45, description: 'Lunch with colleagues' },
      { date: '2023-05-20', category: 'dinner', amount: 125.30, description: 'Dinner at Italian restaurant' },
      { date: '2023-05-22', category: 'snack', amount: 25.80, description: 'Afternoon snacks' },
      { date: '2023-05-25', category: 'lunch', amount: 64.25, description: 'Lunch order' }
    ];
    
    return {
      summary: {
        currentMonth: {
          expense: totalExpense,
          budget,
          budgetRemaining: budget - totalExpense,
          budgetPercentUsed: (totalExpense / budget) * 100,
          categoryBreakdown: {
            breakfast: categoryData[0].value,
            lunch: categoryData[1].value,
            dinner: categoryData[2].value,
            snack: categoryData[3].value,
            other: categoryData[4].value
          }
        },
        previousMonth: {
          expense: totalExpense * 0.9
        },
        yearToDate: {
          expense: totalExpense * 6,
          monthlyAverage: totalExpense
        },
        comparison: {
          monthOverMonthChange: 10
        }
      },
      monthlyData: {
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        totalExpense,
        budget,
        savings: budget > totalExpense ? budget - totalExpense : 0,
        expenses: monthlyExpenses,
        categories: {
          breakfast: categoryData[0].value,
          lunch: categoryData[1].value,
          dinner: categoryData[2].value,
          snack: categoryData[3].value,
          other: categoryData[4].value
        }
      },
      chartData: {
        labels,
        expenses,
        categories: {
          breakfast: expenses.map(e => Math.floor(e * 0.15)),
          lunch: expenses.map(e => Math.floor(e * 0.3)),
          dinner: expenses.map(e => Math.floor(e * 0.4)),
          snack: expenses.map(e => Math.floor(e * 0.1)),
          other: expenses.map(e => Math.floor(e * 0.05))
        }
      }
    };
  };
  
  const placeholderData = getPlaceholderData();
  
  const displaySummary = expenseData.summary || placeholderData.summary;
  const displayMonthlyData = expenseData.monthlyData || placeholderData.monthlyData;
  const displayChartData = expenseData.chartData.labels ? expenseData.chartData : placeholderData.chartData;
  
  // Transform data for charts
  const getCategoryData = () => {
    return [
      { name: 'Breakfast', value: displayMonthlyData.categories.breakfast, color: CATEGORY_COLORS.breakfast },
      { name: 'Lunch', value: displayMonthlyData.categories.lunch, color: CATEGORY_COLORS.lunch },
      { name: 'Dinner', value: displayMonthlyData.categories.dinner, color: CATEGORY_COLORS.dinner },
      { name: 'Snack', value: displayMonthlyData.categories.snack, color: CATEGORY_COLORS.snack },
      { name: 'Other', value: displayMonthlyData.categories.other, color: CATEGORY_COLORS.other }
    ];
  };
  
  const getMonthlyExpenseData = () => {
    return displayChartData.labels.map((label, index) => ({
      name: label,
      expense: displayChartData.expenses[index]
    }));
  };
  
  const getCategoryChartData = () => {
    return displayChartData.labels.map((label, index) => ({
      name: label,
      breakfast: displayChartData.categories.breakfast[index],
      lunch: displayChartData.categories.lunch[index],
      dinner: displayChartData.categories.dinner[index],
      snack: displayChartData.categories.snack[index],
      other: displayChartData.categories.other[index]
    }));
  };
  
  if (!isAuthenticated) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="info" sx={{ mb: 2 }}>
          Please log in to view your expense tracker
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
        Expense Tracker
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Month/Year Selector */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel>Month</InputLabel>
              <Select
                name="month"
                value={dateRange.month}
                label="Month"
                onChange={handleMonthYearChange}
              >
                {MONTHS.map((month, index) => (
                  <MenuItem key={index} value={index + 1}>
                    {month}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel>Year</InputLabel>
              <Select
                name="year"
                value={dateRange.year}
                label="Year"
                onChange={handleMonthYearChange}
              >
                {[...Array(5)].map((_, i) => {
                  const year = new Date().getFullYear() - 2 + i;
                  return (
                    <MenuItem key={year} value={year}>
                      {year}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Button 
              variant="contained" 
              onClick={handleUpdateMonth}
              fullWidth
              sx={{ height: '56px' }}
            >
              Update
            </Button>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Button 
              variant="outlined" 
              onClick={() => setBudgetDialog({ ...budgetDialog, open: true })}
              fullWidth
              sx={{ height: '56px' }}
              startIcon={<AttachMoney />}
            >
              Set Budget
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Monthly Summary */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom>
          {MONTHS[displayMonthlyData.month - 1]} {displayMonthlyData.year} Summary
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={4}>
          <Grid item xs={12} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="error.main">
                ${displayMonthlyData.totalExpense.toFixed(2)}
              </Typography>
              <Typography variant="body1">
                Total Expenses
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="primary.main">
                ${displayMonthlyData.budget.toFixed(2)}
              </Typography>
              <Typography variant="body1">
                Budget
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h3" 
                color={
                  displaySummary.currentMonth.budgetRemaining < 0 
                    ? 'error.main' 
                    : 'success.main'
                }
              >
                ${displaySummary.currentMonth.budgetRemaining.toFixed(2)}
              </Typography>
              <Typography variant="body1">
                Remaining
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="info.main">
                {displaySummary.comparison.monthOverMonthChange > 0 ? '+' : ''}
                {displaySummary.comparison.monthOverMonthChange.toFixed(0)}%
              </Typography>
              <Typography variant="body1">
                vs. Last Month
              </Typography>
            </Box>
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 4, height: 300 }}>
          <Typography variant="h6" gutterBottom>
            Expense Breakdown by Category
          </Typography>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={getCategoryData()}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {getCategoryData().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`$${value.toFixed(2)}`, 'Amount']} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Box>
      </Paper>
      
      {/* Expense Tables and Charts */}
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={selectedTab} onChange={handleTabChange}>
            <Tab icon={<BarChartIcon />} label="Monthly Trends" />
            <Tab icon={<PieChartIcon />} label="Category Breakdown" />
            <Tab label="Expense List" />
          </Tabs>
        </Box>
        
        {/* Monthly Trends */}
        {selectedTab === 0 && (
          <Box sx={{ height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={getMonthlyExpenseData()}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis label={{ value: 'Amount ($)', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value) => [`$${value.toFixed(2)}`, 'Expenses']} />
                <Legend />
                <Bar dataKey="expense" name="Total Expenses" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        )}
        
        {/* Category Breakdown */}
        {selectedTab === 1 && (
          <Box sx={{ height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={getCategoryChartData()}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis label={{ value: 'Amount ($)', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value) => [`$${value.toFixed(2)}`, 'Amount']} />
                <Legend />
                <Bar dataKey="breakfast" name="Breakfast" fill={CATEGORY_COLORS.breakfast} />
                <Bar dataKey="lunch" name="Lunch" fill={CATEGORY_COLORS.lunch} />
                <Bar dataKey="dinner" name="Dinner" fill={CATEGORY_COLORS.dinner} />
                <Bar dataKey="snack" name="Snack" fill={CATEGORY_COLORS.snack} />
                <Bar dataKey="other" name="Other" fill={CATEGORY_COLORS.other} />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        )}
        
        {/* Expense List */}
        {selectedTab === 2 && (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell align="right">Amount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {displayMonthlyData.expenses.map((expense, index) => (
                  <TableRow key={index}>
                    <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Chip 
                        label={expense.category} 
                        sx={{ 
                          textTransform: 'capitalize',
                          bgcolor: CATEGORY_COLORS[expense.category],
                          color: 'white'
                        }} 
                      />
                    </TableCell>
                    <TableCell>{expense.description}</TableCell>
                    <TableCell align="right">${expense.amount.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
                {displayMonthlyData.expenses.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      <Typography variant="body1" sx={{ py: 2 }}>
                        No expenses found for this month
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
      
      {/* Budget Dialog */}
      <Dialog open={budgetDialog.open} onClose={() => setBudgetDialog({ ...budgetDialog, open: false })}>
        <DialogTitle>Set Monthly Budget</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Set your budget for {MONTHS[dateRange.month - 1]} {dateRange.year}
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Budget Amount"
            type="number"
            fullWidth
            value={budgetDialog.budget}
            onChange={(e) => setBudgetDialog({ ...budgetDialog, budget: Number(e.target.value) })}
            InputProps={{
              startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBudgetDialog({ ...budgetDialog, open: false })}>Cancel</Button>
          <Button onClick={handleUpdateBudget} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ExpenseTrackerPage; 