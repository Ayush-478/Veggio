const express = require('express');
const router = express.Router();
const { 
  getFoodItems, 
  getFoodItemById, 
  createFoodItem, 
  updateFoodItem, 
  deleteFoodItem, 
  addFoodItemReview,
  getFoodRecommendations
} = require('../controllers/foodController');
const { auth, admin } = require('../middleware/auth');

// @route   GET /api/food
// @desc    Get all food items
// @access  Public
router.get('/', getFoodItems);

// @route   GET /api/food/recommendations
// @desc    Get food recommendations based on user preferences
// @access  Private
router.get('/recommendations', auth, getFoodRecommendations);

// @route   GET /api/food/:id
// @desc    Get food item by ID
// @access  Public
router.get('/:id', getFoodItemById);

// @route   POST /api/food
// @desc    Create a food item
// @access  Private/Admin
router.post('/', auth, admin, createFoodItem);

// @route   PUT /api/food/:id
// @desc    Update a food item
// @access  Private/Admin
router.put('/:id', auth, admin, updateFoodItem);

// @route   DELETE /api/food/:id
// @desc    Delete a food item
// @access  Private/Admin
router.delete('/:id', auth, admin, deleteFoodItem);

// @route   POST /api/food/:id/reviews
// @desc    Add a review to a food item
// @access  Private
router.post('/:id/reviews', auth, addFoodItemReview);

module.exports = router; 