const FoodItem = require('../models/FoodItem');

// @desc    Get all food items
// @route   GET /api/food
// @access  Public
const getFoodItems = async (req, res) => {
  try {
    const { category, isVegetarian, isVegan, isGlutenFree, search, minPrice, maxPrice, sort } = req.query;
    
    // Build query
    const query = {};
    
    // Filter by category
    if (category) {
      query.category = category;
    }
    
    // Filter by dietary preferences
    if (isVegetarian === 'true') {
      query.isVegetarian = true;
    }
    
    if (isVegan === 'true') {
      query.isVegan = true;
    }
    
    if (isGlutenFree === 'true') {
      query.isGlutenFree = true;
    }
    
    // Filter by price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    
    // Search by name or description
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Only show available items
    query.isAvailable = true;
    
    // Build sort options
    let sortOptions = {};
    if (sort) {
      switch (sort) {
        case 'price-asc':
          sortOptions = { price: 1 };
          break;
        case 'price-desc':
          sortOptions = { price: -1 };
          break;
        case 'rating-desc':
          sortOptions = { averageRating: -1 };
          break;
        case 'popular':
          sortOptions = { isPopular: -1, averageRating: -1 };
          break;
        default:
          sortOptions = { createdAt: -1 };
      }
    } else {
      sortOptions = { createdAt: -1 };
    }
    
    const foodItems = await FoodItem.find(query).sort(sortOptions);
    
    res.json(foodItems);
  } catch (error) {
    console.error('Get food items error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get food item by ID
// @route   GET /api/food/:id
// @access  Public
const getFoodItemById = async (req, res) => {
  try {
    const foodItem = await FoodItem.findById(req.params.id);
    
    if (foodItem) {
      res.json(foodItem);
    } else {
      res.status(404).json({ message: 'Food item not found' });
    }
  } catch (error) {
    console.error('Get food item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create a food item
// @route   POST /api/food
// @access  Private/Admin
const createFoodItem = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      image,
      category,
      isVegetarian,
      isVegan,
      isGlutenFree,
      nutritionalInfo,
      ingredients,
      preparationTime,
      spicyLevel
    } = req.body;
    
    const foodItem = new FoodItem({
      name,
      description,
      price,
      image,
      category,
      isVegetarian,
      isVegan,
      isGlutenFree,
      nutritionalInfo,
      ingredients,
      preparationTime,
      spicyLevel
    });
    
    const createdFoodItem = await foodItem.save();
    
    res.status(201).json(createdFoodItem);
  } catch (error) {
    console.error('Create food item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update a food item
// @route   PUT /api/food/:id
// @access  Private/Admin
const updateFoodItem = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      image,
      category,
      isVegetarian,
      isVegan,
      isGlutenFree,
      nutritionalInfo,
      ingredients,
      preparationTime,
      spicyLevel,
      isAvailable,
      isPopular,
      isRecommended,
      discount
    } = req.body;
    
    const foodItem = await FoodItem.findById(req.params.id);
    
    if (foodItem) {
      foodItem.name = name || foodItem.name;
      foodItem.description = description || foodItem.description;
      foodItem.price = price || foodItem.price;
      foodItem.image = image || foodItem.image;
      foodItem.category = category || foodItem.category;
      foodItem.isVegetarian = isVegetarian !== undefined ? isVegetarian : foodItem.isVegetarian;
      foodItem.isVegan = isVegan !== undefined ? isVegan : foodItem.isVegan;
      foodItem.isGlutenFree = isGlutenFree !== undefined ? isGlutenFree : foodItem.isGlutenFree;
      foodItem.nutritionalInfo = nutritionalInfo || foodItem.nutritionalInfo;
      foodItem.ingredients = ingredients || foodItem.ingredients;
      foodItem.preparationTime = preparationTime || foodItem.preparationTime;
      foodItem.spicyLevel = spicyLevel !== undefined ? spicyLevel : foodItem.spicyLevel;
      foodItem.isAvailable = isAvailable !== undefined ? isAvailable : foodItem.isAvailable;
      foodItem.isPopular = isPopular !== undefined ? isPopular : foodItem.isPopular;
      foodItem.isRecommended = isRecommended !== undefined ? isRecommended : foodItem.isRecommended;
      foodItem.discount = discount !== undefined ? discount : foodItem.discount;
      
      const updatedFoodItem = await foodItem.save();
      res.json(updatedFoodItem);
    } else {
      res.status(404).json({ message: 'Food item not found' });
    }
  } catch (error) {
    console.error('Update food item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a food item
// @route   DELETE /api/food/:id
// @access  Private/Admin
const deleteFoodItem = async (req, res) => {
  try {
    const foodItem = await FoodItem.findById(req.params.id);
    
    if (foodItem) {
      await foodItem.remove();
      res.json({ message: 'Food item removed' });
    } else {
      res.status(404).json({ message: 'Food item not found' });
    }
  } catch (error) {
    console.error('Delete food item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add a review to a food item
// @route   POST /api/food/:id/reviews
// @access  Private
const addFoodItemReview = async (req, res) => {
  try {
    const { rating, review } = req.body;
    
    const foodItem = await FoodItem.findById(req.params.id);
    
    if (foodItem) {
      // Check if user already reviewed this item
      const alreadyReviewed = foodItem.ratings.find(
        r => r.userId.toString() === req.user._id.toString()
      );
      
      if (alreadyReviewed) {
        return res.status(400).json({ message: 'Food item already reviewed' });
      }
      
      const newReview = {
        userId: req.user._id,
        rating: Number(rating),
        review,
        date: Date.now()
      };
      
      foodItem.ratings.push(newReview);
      
      // Calculate average rating
      const totalRating = foodItem.ratings.reduce((sum, item) => sum + item.rating, 0);
      foodItem.averageRating = totalRating / foodItem.ratings.length;
      
      await foodItem.save();
      res.status(201).json({ message: 'Review added' });
    } else {
      res.status(404).json({ message: 'Food item not found' });
    }
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get food recommendations based on user preferences
// @route   GET /api/food/recommendations
// @access  Private
const getFoodRecommendations = async (req, res) => {
  try {
    const user = req.user;
    
    // Build query based on user preferences
    const query = { isAvailable: true };
    
    if (user.dietaryPreferences.includes('vegetarian')) {
      query.isVegetarian = true;
    }
    
    if (user.dietaryPreferences.includes('vegan')) {
      query.isVegan = true;
    }
    
    if (user.dietaryPreferences.includes('gluten-free')) {
      query.isGlutenFree = true;
    }
    
    // Exclude items user is allergic to
    if (user.allergies && user.allergies.length > 0) {
      query.ingredients = { $nin: user.allergies };
    }
    
    // Get recommended items
    const recommendedItems = await FoodItem.find({
      ...query,
      isRecommended: true
    }).limit(5);
    
    // Get popular items
    const popularItems = await FoodItem.find({
      ...query,
      isPopular: true
    }).limit(5);
    
    // Get highly rated items
    const highlyRatedItems = await FoodItem.find(query)
      .sort({ averageRating: -1 })
      .limit(5);
    
    res.json({
      recommended: recommendedItems,
      popular: popularItems,
      highlyRated: highlyRatedItems
    });
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getFoodItems,
  getFoodItemById,
  createFoodItem,
  updateFoodItem,
  deleteFoodItem,
  addFoodItemReview,
  getFoodRecommendations
}; 