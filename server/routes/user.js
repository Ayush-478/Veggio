const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');

// Import controllers
const { 
  getCart, 
  addToCart, 
  updateCartItem, 
  removeFromCart, 
  clearCart 
} = require('../controllers/cartController');

const { 
  getCalorieTrackerByDate, 
  getCalorieTrackerByRange, 
  getCalorieSummary, 
  updateCalorieGoal 
} = require('../controllers/calorieTrackerController');

const { 
  getExpenseTrackerByMonth, 
  getExpenseTrackerByRange, 
  getExpenseSummary, 
  updateBudget 
} = require('../controllers/expenseTrackerController');

// Cart routes
router.get('/cart', auth, getCart);
router.post('/cart', auth, addToCart);
router.put('/cart/:itemId', auth, updateCartItem);
router.delete('/cart/:itemId', auth, removeFromCart);
router.delete('/cart', auth, clearCart);

// Calorie tracker routes
router.get('/calorie-tracker/date/:date', auth, getCalorieTrackerByDate);
router.get('/calorie-tracker/range', auth, getCalorieTrackerByRange);
router.get('/calorie-tracker/summary', auth, getCalorieSummary);
router.put('/calorie-tracker/goal', auth, updateCalorieGoal);

// Expense tracker routes
router.get('/expense-tracker/month/:year/:month', auth, getExpenseTrackerByMonth);
router.get('/expense-tracker/range', auth, getExpenseTrackerByRange);
router.get('/expense-tracker/summary', auth, getExpenseSummary);
router.put('/expense-tracker/budget', auth, updateBudget);

module.exports = router; 