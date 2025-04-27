const Order = require('../models/Order');
const Cart = require('../models/Cart');
const FoodItem = require('../models/FoodItem');
const CalorieTracker = require('../models/CalorieTracker');
const ExpenseTracker = require('../models/ExpenseTracker');

// @desc    Create a new order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
  try {
    const {
      deliveryAddress,
      paymentMethod,
      deliveryInstructions,
      orderNotes
    } = req.body;
    
    // Get user's cart
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.foodItem');
    
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }
    
    // Create order items from cart
    const orderItems = cart.items.map(item => {
      const discountedPrice = item.foodItem.price * (1 - item.foodItem.discount / 100);
      return {
        foodItem: item.foodItem._id,
        quantity: item.quantity,
        price: discountedPrice,
        totalPrice: discountedPrice * item.quantity
      };
    });
    
    // Calculate total amount
    const totalAmount = orderItems.reduce((sum, item) => sum + item.totalPrice, 0);
    
    // Calculate delivery fee (example: $2 for orders under $20, free for orders over $20)
    const deliveryFee = totalAmount < 20 ? 2 : 0;
    
    // Calculate tax (example: 8% tax)
    const taxRate = 0.08;
    const taxAmount = totalAmount * taxRate;
    
    // Calculate total calories and nutrition summary
    const totalCalories = cart.totalCalories;
    const nutritionSummary = cart.nutritionSummary;
    
    // Create new order
    const order = new Order({
      user: req.user._id,
      items: orderItems,
      totalAmount: totalAmount + deliveryFee + taxAmount,
      totalCalories,
      nutritionSummary,
      deliveryAddress,
      paymentMethod,
      paymentStatus: paymentMethod === 'cash on delivery' ? 'pending' : 'completed',
      orderStatus: 'placed',
      deliveryInstructions,
      orderNotes,
      taxAmount,
      deliveryFee,
      estimatedDeliveryTime: new Date(Date.now() + 45 * 60000) // 45 minutes from now
    });
    
    // Add initial status to history
    order.statusHistory.push({
      status: 'placed',
      timestamp: new Date(),
      note: 'Order placed successfully'
    });
    
    // Save order
    const createdOrder = await order.save();
    
    // Update calorie tracker
    await updateCalorieTracker(req.user._id, createdOrder);
    
    // Update expense tracker
    await updateExpenseTracker(req.user._id, createdOrder);
    
    // Clear cart after order is placed
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
    await cart.save();
    
    res.status(201).json(createdOrder);
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Helper function to update calorie tracker
const updateCalorieTracker = async (userId, order) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Find or create calorie tracker for today
    let calorieTracker = await CalorieTracker.findOne({
      user: userId,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    });
    
    if (!calorieTracker) {
      calorieTracker = new CalorieTracker({
        user: userId,
        date: today,
        totalCalories: 0,
        meals: []
      });
    }
    
    // Determine meal type based on time of day
    const currentHour = new Date().getHours();
    let mealType = 'snack';
    
    if (currentHour >= 5 && currentHour < 11) {
      mealType = 'breakfast';
    } else if (currentHour >= 11 && currentHour < 16) {
      mealType = 'lunch';
    } else if (currentHour >= 16 && currentHour < 22) {
      mealType = 'dinner';
    }
    
    // Create meal entry
    const mealEntry = {
      order: order._id,
      foodItems: [],
      mealType,
      totalCalories: order.totalCalories,
      time: new Date()
    };
    
    // Add food items to meal
    for (const item of order.items) {
      const foodItem = await FoodItem.findById(item.foodItem);
      
      mealEntry.foodItems.push({
        foodItem: item.foodItem,
        quantity: item.quantity,
        calories: foodItem.nutritionalInfo.calories * item.quantity
      });
    }
    
    // Add meal to tracker
    calorieTracker.meals.push(mealEntry);
    
    // Update total calories
    calorieTracker.totalCalories += order.totalCalories;
    
    // Update nutrition summary
    for (const nutrient in order.nutritionSummary) {
      if (nutrient !== 'vitamins' && nutrient !== 'minerals') {
        calorieTracker.nutritionSummary[nutrient] += order.nutritionSummary[nutrient];
      }
    }
    
    // Save calorie tracker
    await calorieTracker.save();
  } catch (error) {
    console.error('Update calorie tracker error:', error);
  }
};

// Helper function to update expense tracker
const updateExpenseTracker = async (userId, order) => {
  try {
    const today = new Date();
    const month = today.getMonth() + 1; // JavaScript months are 0-indexed
    const year = today.getFullYear();
    
    // Find or create expense tracker for current month
    let expenseTracker = await ExpenseTracker.findOne({
      user: userId,
      month,
      year
    });
    
    if (!expenseTracker) {
      expenseTracker = new ExpenseTracker({
        user: userId,
        month,
        year,
        totalExpense: 0,
        expenses: [],
        categories: {
          breakfast: 0,
          lunch: 0,
          dinner: 0,
          snack: 0,
          other: 0
        }
      });
    }
    
    // Determine category based on time of day
    const currentHour = new Date().getHours();
    let category = 'other';
    
    if (currentHour >= 5 && currentHour < 11) {
      category = 'breakfast';
    } else if (currentHour >= 11 && currentHour < 16) {
      category = 'lunch';
    } else if (currentHour >= 16 && currentHour < 22) {
      category = 'dinner';
    } else {
      category = 'snack';
    }
    
    // Create expense entry
    const expenseEntry = {
      order: order._id,
      amount: order.totalAmount,
      date: new Date(),
      category,
      description: `Food order - ${order.items.length} items`
    };
    
    // Add expense to tracker
    expenseTracker.expenses.push(expenseEntry);
    
    // Update total expense
    expenseTracker.totalExpense += order.totalAmount;
    
    // Update category totals
    expenseTracker.categories[category] += order.totalAmount;
    
    // Save expense tracker
    await expenseTracker.save();
  } catch (error) {
    console.error('Update expense tracker error:', error);
  }
};

// @desc    Get all user orders
// @route   GET /api/orders
// @access  Private
const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate('items.foodItem');
    
    res.json(orders);
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.foodItem');
    
    if (order && order.user.toString() === req.user._id.toString()) {
      res.json(order);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Update order status
    order.orderStatus = status;
    
    // Add status to history
    order.statusHistory.push({
      status,
      timestamp: new Date(),
      note: note || `Order ${status}`
    });
    
    // If order is delivered, update actual delivery time
    if (status === 'delivered') {
      order.actualDeliveryTime = new Date();
    }
    
    // Save order
    const updatedOrder = await order.save();
    
    res.json(updatedOrder);
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Check if order belongs to user
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    // Check if order can be cancelled (only if it's not delivered or cancelled)
    if (['delivered', 'cancelled'].includes(order.orderStatus)) {
      return res.status(400).json({ message: `Order cannot be cancelled as it is already ${order.orderStatus}` });
    }
    
    // Update order status
    order.orderStatus = 'cancelled';
    
    // Add status to history
    order.statusHistory.push({
      status: 'cancelled',
      timestamp: new Date(),
      note: 'Order cancelled by user'
    });
    
    // Save order
    const updatedOrder = await order.save();
    
    res.json(updatedOrder);
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add order feedback
// @route   PUT /api/orders/:id/feedback
// @access  Private
const addOrderFeedback = async (req, res) => {
  try {
    const { rating, feedback } = req.body;
    
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Check if order belongs to user
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    // Check if order is delivered
    if (order.orderStatus !== 'delivered') {
      return res.status(400).json({ message: 'Can only add feedback to delivered orders' });
    }
    
    // Update order with feedback
    order.rating = rating;
    order.feedback = feedback;
    
    // Save order
    const updatedOrder = await order.save();
    
    res.json(updatedOrder);
  } catch (error) {
    console.error('Add feedback error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  addOrderFeedback
}; 