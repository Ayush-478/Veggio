const Cart = require('../models/Cart');
const FoodItem = require('../models/FoodItem');

// Helper function to calculate cart totals
const calculateCartTotals = async (cart) => {
  let totalAmount = 0;
  let totalCalories = 0;
  const nutritionSummary = {
    protein: 0,
    carbohydrates: 0,
    fat: 0,
    fiber: 0,
    sugar: 0,
    sodium: 0
  };
  
  // Populate food items
  await cart.populate('items.foodItem');
  
  // Calculate totals
  for (const item of cart.items) {
    const foodItem = item.foodItem;
    const quantity = item.quantity;
    
    // Calculate price with discount
    const discountedPrice = foodItem.price * (1 - foodItem.discount / 100);
    totalAmount += discountedPrice * quantity;
    
    // Calculate nutritional info
    totalCalories += foodItem.nutritionalInfo.calories * quantity;
    nutritionSummary.protein += foodItem.nutritionalInfo.protein * quantity;
    nutritionSummary.carbohydrates += foodItem.nutritionalInfo.carbohydrates * quantity;
    nutritionSummary.fat += foodItem.nutritionalInfo.fat * quantity;
    nutritionSummary.fiber += foodItem.nutritionalInfo.fiber * quantity;
    nutritionSummary.sugar += foodItem.nutritionalInfo.sugar * quantity;
    nutritionSummary.sodium += foodItem.nutritionalInfo.sodium * quantity;
  }
  
  // Update cart totals
  cart.totalAmount = totalAmount;
  cart.totalCalories = totalCalories;
  cart.nutritionSummary = nutritionSummary;
  
  return cart;
};

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate('items.foodItem');
    
    if (!cart) {
      // Create a new cart if one doesn't exist
      cart = new Cart({
        user: req.user._id,
        items: [],
        totalAmount: 0,
        totalCalories: 0
      });
      await cart.save();
    }
    
    res.json(cart);
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
const addToCart = async (req, res) => {
  try {
    const { foodItemId, quantity } = req.body;
    
    // Validate food item exists
    const foodItem = await FoodItem.findById(foodItemId);
    if (!foodItem) {
      return res.status(404).json({ message: 'Food item not found' });
    }
    
    // Check if food item is available
    if (!foodItem.isAvailable) {
      return res.status(400).json({ message: 'Food item is not available' });
    }
    
    // Find user's cart
    let cart = await Cart.findOne({ user: req.user._id });
    
    if (!cart) {
      // Create a new cart if one doesn't exist
      cart = new Cart({
        user: req.user._id,
        items: [],
        totalAmount: 0,
        totalCalories: 0
      });
    }
    
    // Check if item already exists in cart
    const itemIndex = cart.items.findIndex(item => item.foodItem.toString() === foodItemId);
    
    if (itemIndex > -1) {
      // Update quantity if item exists
      cart.items[itemIndex].quantity += quantity;
    } else {
      // Add new item to cart
      cart.items.push({
        foodItem: foodItemId,
        quantity
      });
    }
    
    // Calculate cart totals
    cart = await calculateCartTotals(cart);
    
    // Save cart
    await cart.save();
    
    res.status(201).json(cart);
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/:itemId
// @access  Private
const updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const itemId = req.params.itemId;
    
    // Find user's cart
    let cart = await Cart.findOne({ user: req.user._id });
    
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    
    // Find item in cart
    const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);
    
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }
    
    // Update quantity or remove item if quantity is 0
    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = quantity;
    }
    
    // Calculate cart totals
    cart = await calculateCartTotals(cart);
    
    // Save cart
    await cart.save();
    
    res.json(cart);
  } catch (error) {
    console.error('Update cart item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:itemId
// @access  Private
const removeFromCart = async (req, res) => {
  try {
    const itemId = req.params.itemId;
    
    // Find user's cart
    let cart = await Cart.findOne({ user: req.user._id });
    
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    
    // Find item in cart
    const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);
    
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }
    
    // Remove item from cart
    cart.items.splice(itemIndex, 1);
    
    // Calculate cart totals
    cart = await calculateCartTotals(cart);
    
    // Save cart
    await cart.save();
    
    res.json(cart);
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
const clearCart = async (req, res) => {
  try {
    // Find user's cart
    let cart = await Cart.findOne({ user: req.user._id });
    
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    
    // Clear cart items
    cart.items = [];
    cart.totalAmount = 0;
    cart.totalCalories = 0;
    cart.nutritionSummary = {
      protein: 0,
      carbohydrates: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0
    };
    
    // Save cart
    await cart.save();
    
    res.json({ message: 'Cart cleared' });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
}; 