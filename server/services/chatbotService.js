const FoodItem = require('../models/FoodItem');
const Order = require('../models/Order');
const User = require('../models/User');
const CalorieTracker = require('../models/CalorieTracker');

// Intent recognition patterns
const intents = {
  greeting: [
    /^hi$/i, /^hello$/i, /^hey$/i, /^howdy$/i, /^greetings$/i,
    /^good morning$/i, /^good afternoon$/i, /^good evening$/i,
    /^hi there$/i, /^hello there$/i, /^hey there$/i
  ],
  food_recommendation: [
    /recommend/i, /suggestion/i, /what should i eat/i, /what can i eat/i,
    /what's good/i, /whats good/i, /popular/i, /best seller/i,
    /special/i, /chef's choice/i, /chefs choice/i, /signature/i,
    /healthy option/i, /diet/i, /low calorie/i, /high protein/i,
    /vegetarian/i, /vegan/i, /gluten free/i
  ],
  order_status: [
    /where is my order/i, /order status/i, /track order/i, /delivery status/i,
    /when will my order arrive/i, /how long/i, /eta/i, /estimated time/i,
    /order arrived/i, /order delivered/i, /order delayed/i
  ],
  nutrition_info: [
    /calorie/i, /nutrition/i, /protein/i, /carb/i, /fat/i,
    /how many calories/i, /nutritional information/i, /healthy/i,
    /diet/i, /macro/i, /vitamin/i, /mineral/i, /sodium/i, /sugar/i
  ],
  dietary_question: [
    /allergy/i, /allergic/i, /intolerance/i, /vegetarian/i, /vegan/i,
    /gluten free/i, /dairy free/i, /nut free/i, /soy free/i,
    /keto/i, /paleo/i, /low carb/i, /low fat/i, /low sodium/i
  ],
  help: [
    /help/i, /assist/i, /support/i, /guide/i, /how to/i,
    /how do i/i, /what can you do/i, /what do you do/i
  ],
  feedback: [
    /feedback/i, /review/i, /rate/i, /rating/i, /comment/i,
    /complain/i, /complaint/i, /suggest/i, /suggestion/i
  ]
};

// Detect intent from user message
const detectIntent = (message) => {
  for (const [intent, patterns] of Object.entries(intents)) {
    for (const pattern of patterns) {
      if (pattern.test(message)) {
        return intent;
      }
    }
  }
  return 'general_query';
};

// Process user message and generate response
const processMessage = async (message, userId, sessionId) => {
  try {
    // Detect intent
    const intent = detectIntent(message);
    
    // Get user information
    const user = await User.findById(userId);
    
    // Generate response based on intent
    switch (intent) {
      case 'greeting':
        return handleGreeting(user);
      
      case 'food_recommendation':
        return await handleFoodRecommendation(message, user);
      
      case 'order_status':
        return await handleOrderStatus(user);
      
      case 'nutrition_info':
        return await handleNutritionInfo(message, user);
      
      case 'dietary_question':
        return await handleDietaryQuestion(message, user);
      
      case 'help':
        return handleHelp();
      
      case 'feedback':
        return handleFeedback();
      
      default:
        return await handleGeneralQuery(message, user);
    }
  } catch (error) {
    console.error('Chatbot service error:', error);
    return {
      text: "I'm sorry, I encountered an error processing your request. Please try again later.",
      intent: 'error'
    };
  }
};

// Handle greeting intent
const handleGreeting = (user) => {
  const greetings = [
    `Hello ${user.name}! How can I help you today?`,
    `Hi there ${user.name}! What can I do for you?`,
    `Hey ${user.name}! How can I assist you with your food order today?`,
    `Greetings ${user.name}! I'm ChefBot, your personal food assistant. How may I help you?`
  ];
  
  const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
  
  return {
    text: randomGreeting,
    intent: 'greeting'
  };
};

// Handle food recommendation intent
const handleFoodRecommendation = async (message, user) => {
  // Extract dietary preferences from message or user profile
  const isVegetarian = message.includes('vegetarian') || user.dietaryPreferences.includes('vegetarian');
  const isVegan = message.includes('vegan') || user.dietaryPreferences.includes('vegan');
  const isGlutenFree = message.includes('gluten free') || user.dietaryPreferences.includes('gluten-free');
  
  // Extract food categories from message
  const categories = [];
  if (message.includes('breakfast')) categories.push('breakfast');
  if (message.includes('lunch')) categories.push('lunch');
  if (message.includes('dinner')) categories.push('dinner');
  if (message.includes('appetizer')) categories.push('appetizer');
  if (message.includes('main course')) categories.push('main course');
  if (message.includes('dessert')) categories.push('dessert');
  if (message.includes('beverage')) categories.push('beverage');
  if (message.includes('snack')) categories.push('snack');
  
  // Build query
  const query = { isAvailable: true };
  
  if (isVegetarian) query.isVegetarian = true;
  if (isVegan) query.isVegan = true;
  if (isGlutenFree) query.isGlutenFree = true;
  
  if (categories.length > 0) {
    query.category = { $in: categories };
  }
  
  // Check for specific nutritional requirements
  if (message.includes('low calorie') || message.includes('diet')) {
    query['nutritionalInfo.calories'] = { $lt: 500 };
  }
  
  if (message.includes('high protein')) {
    query['nutritionalInfo.protein'] = { $gt: 20 };
  }
  
  // Get recommendations
  let recommendations;
  
  if (message.includes('popular') || message.includes('best seller')) {
    recommendations = await FoodItem.find({
      ...query,
      isPopular: true
    }).limit(5);
  } else if (message.includes('special') || message.includes('chef')) {
    recommendations = await FoodItem.find({
      ...query,
      isRecommended: true
    }).limit(5);
  } else {
    recommendations = await FoodItem.find(query)
      .sort({ averageRating: -1 })
      .limit(5);
  }
  
  // Generate response
  let responseText;
  
  if (recommendations.length === 0) {
    responseText = "I'm sorry, I couldn't find any food items matching your criteria. Would you like me to suggest something else?";
  } else {
    const recommendationNames = recommendations.map(item => item.name).join(', ');
    
    responseText = `Based on your preferences, I recommend: ${recommendationNames}. Would you like more details about any of these items?`;
  }
  
  return {
    text: responseText,
    relatedFoodItems: recommendations.map(item => item._id),
    intent: 'food_recommendation'
  };
};

// Handle order status intent
const handleOrderStatus = async (user) => {
  // Get user's recent orders
  const recentOrders = await Order.find({ user: user._id })
    .sort({ createdAt: -1 })
    .limit(1);
  
  if (recentOrders.length === 0) {
    return {
      text: "I don't see any recent orders for you. Would you like to place a new order?",
      intent: 'order_status'
    };
  }
  
  const latestOrder = recentOrders[0];
  const orderStatus = latestOrder.orderStatus;
  
  let responseText;
  
  switch (orderStatus) {
    case 'placed':
      responseText = `Your order #${latestOrder._id.toString().slice(-6)} has been placed and is waiting for confirmation from the restaurant.`;
      break;
    case 'confirmed':
      responseText = `Your order #${latestOrder._id.toString().slice(-6)} has been confirmed and the restaurant is preparing your food.`;
      break;
    case 'preparing':
      responseText = `Your order #${latestOrder._id.toString().slice(-6)} is being prepared by our chefs. It should be ready for delivery soon.`;
      break;
    case 'out for delivery':
      responseText = `Your order #${latestOrder._id.toString().slice(-6)} is out for delivery! It should arrive at your location shortly.`;
      break;
    case 'delivered':
      responseText = `Your order #${latestOrder._id.toString().slice(-6)} has been delivered. Enjoy your meal! Would you like to provide feedback?`;
      break;
    case 'cancelled':
      responseText = `Your order #${latestOrder._id.toString().slice(-6)} was cancelled. Would you like to place a new order?`;
      break;
    default:
      responseText = `Your order #${latestOrder._id.toString().slice(-6)} status is: ${orderStatus}.`;
  }
  
  // Add estimated delivery time if available
  if (latestOrder.estimatedDeliveryTime && ['confirmed', 'preparing', 'out for delivery'].includes(orderStatus)) {
    const estimatedTime = new Date(latestOrder.estimatedDeliveryTime);
    responseText += ` Estimated delivery time: ${estimatedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`;
  }
  
  return {
    text: responseText,
    intent: 'order_status'
  };
};

// Handle nutrition info intent
const handleNutritionInfo = async (message, user) => {
  // Check if asking about a specific food item
  const foodItemMatch = message.match(/calories in (.+?)[\?\.]/i) || 
                        message.match(/nutrition for (.+?)[\?\.]/i) ||
                        message.match(/how many calories in (.+?)[\?\.]/i);
  
  if (foodItemMatch) {
    const foodItemName = foodItemMatch[1].trim();
    
    // Search for food item
    const foodItems = await FoodItem.find({
      name: { $regex: foodItemName, $options: 'i' }
    });
    
    if (foodItems.length === 0) {
      return {
        text: `I'm sorry, I couldn't find nutritional information for "${foodItemName}". Would you like to know about a different item?`,
        intent: 'nutrition_info'
      };
    }
    
    const foodItem = foodItems[0];
    const nutrition = foodItem.nutritionalInfo;
    
    const responseText = `${foodItem.name} contains ${nutrition.calories} calories, ${nutrition.protein}g protein, ${nutrition.carbohydrates}g carbs, and ${nutrition.fat}g fat per serving. Would you like more detailed nutritional information?`;
    
    return {
      text: responseText,
      relatedFoodItems: [foodItem._id],
      intent: 'nutrition_info'
    };
  }
  
  // Check if asking about daily calorie intake
  if (message.includes('daily') || message.includes('today') || message.includes('consumed')) {
    // Get today's calorie tracker
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const calorieTracker = await CalorieTracker.findOne({
      user: user._id,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    });
    
    if (!calorieTracker || calorieTracker.totalCalories === 0) {
      return {
        text: "You haven't consumed any calories from our restaurant today. Would you like me to recommend something?",
        intent: 'nutrition_info'
      };
    }
    
    const calorieGoal = user.calorieGoal || 2000;
    const percentOfGoal = Math.round((calorieTracker.totalCalories / calorieGoal) * 100);
    
    const responseText = `Today you've consumed ${calorieTracker.totalCalories} calories from our restaurant, which is ${percentOfGoal}% of your daily goal (${calorieGoal} calories). This includes ${calorieTracker.nutritionSummary.protein}g protein, ${calorieTracker.nutritionSummary.carbohydrates}g carbs, and ${calorieTracker.nutritionSummary.fat}g fat.`;
    
    return {
      text: responseText,
      intent: 'nutrition_info'
    };
  }
  
  // General nutrition info
  return {
    text: "I can provide nutritional information for any item on our menu. Just ask about a specific dish, or check your daily calorie intake by asking 'How many calories have I consumed today?'",
    intent: 'nutrition_info'
  };
};

// Handle dietary question intent
const handleDietaryQuestion = async (message, user) => {
  // Check for specific dietary restrictions
  if (message.includes('vegetarian')) {
    const vegetarianItems = await FoodItem.find({ isVegetarian: true, isAvailable: true })
      .limit(5);
    
    if (vegetarianItems.length === 0) {
      return {
        text: "I'm sorry, we don't currently have any vegetarian options available. Please check back later as our menu changes regularly.",
        intent: 'dietary_question'
      };
    }
    
    const itemNames = vegetarianItems.map(item => item.name).join(', ');
    
    return {
      text: `Yes, we have several vegetarian options including: ${itemNames}. Would you like more details about any of these items?`,
      relatedFoodItems: vegetarianItems.map(item => item._id),
      intent: 'dietary_question'
    };
  }
  
  if (message.includes('vegan')) {
    const veganItems = await FoodItem.find({ isVegan: true, isAvailable: true })
      .limit(5);
    
    if (veganItems.length === 0) {
      return {
        text: "I'm sorry, we don't currently have any vegan options available. Please check back later as our menu changes regularly.",
        intent: 'dietary_question'
      };
    }
    
    const itemNames = veganItems.map(item => item.name).join(', ');
    
    return {
      text: `Yes, we have several vegan options including: ${itemNames}. Would you like more details about any of these items?`,
      relatedFoodItems: veganItems.map(item => item._id),
      intent: 'dietary_question'
    };
  }
  
  if (message.includes('gluten free') || message.includes('gluten-free')) {
    const glutenFreeItems = await FoodItem.find({ isGlutenFree: true, isAvailable: true })
      .limit(5);
    
    if (glutenFreeItems.length === 0) {
      return {
        text: "I'm sorry, we don't currently have any gluten-free options available. Please check back later as our menu changes regularly.",
        intent: 'dietary_question'
      };
    }
    
    const itemNames = glutenFreeItems.map(item => item.name).join(', ');
    
    return {
      text: `Yes, we have several gluten-free options including: ${itemNames}. Would you like more details about any of these items?`,
      relatedFoodItems: glutenFreeItems.map(item => item._id),
      intent: 'dietary_question'
    };
  }
  
  // Check for allergy information
  if (message.includes('allergy') || message.includes('allergic')) {
    // Extract potential allergen
    const allergyMatch = message.match(/allergic to (.+?)[\?\.]/i) || 
                         message.match(/allergy to (.+?)[\?\.]/i);
    
    if (allergyMatch) {
      const allergen = allergyMatch[1].trim().toLowerCase();
      
      // Find food items that don't contain the allergen
      const safeItems = await FoodItem.find({
        ingredients: { $not: { $regex: allergen, $options: 'i' } },
        isAvailable: true
      }).limit(5);
      
      if (safeItems.length === 0) {
        return {
          text: `I'm sorry, I couldn't find items that are guaranteed to be free from ${allergen}. Please consult with our staff for more detailed allergen information.`,
          intent: 'dietary_question'
        };
      }
      
      const itemNames = safeItems.map(item => item.name).join(', ');
      
      return {
        text: `Based on our ingredient information, these items should be free from ${allergen}: ${itemNames}. However, please note that cross-contamination is possible in our kitchen. Would you like more details about any of these items?`,
        relatedFoodItems: safeItems.map(item => item._id),
        intent: 'dietary_question'
      };
    }
    
    return {
      text: "If you have food allergies, please let me know what you're allergic to, and I can suggest items that don't contain those ingredients. However, please note that cross-contamination is possible in our kitchen.",
      intent: 'dietary_question'
    };
  }
  
  // General dietary information
  return {
    text: "I can help you find food items that match your dietary preferences. We offer vegetarian, vegan, and gluten-free options. You can also ask about specific allergens or nutritional requirements.",
    intent: 'dietary_question'
  };
};

// Handle help intent
const handleHelp = () => {
  return {
    text: "I'm ChefBot, your personal food assistant! Here's how I can help you:\n\n" +
          "• Recommend food items based on your preferences\n" +
          "• Provide nutritional information about menu items\n" +
          "• Track your order status\n" +
          "• Answer questions about dietary restrictions and allergies\n" +
          "• Help you track your calorie intake\n\n" +
          "Just ask me anything about our food, and I'll do my best to assist you!",
    intent: 'help'
  };
};

// Handle feedback intent
const handleFeedback = () => {
  return {
    text: "We value your feedback! You can rate your order and provide comments after delivery through the 'Orders' section. If you have specific suggestions or concerns, please let us know, and we'll make sure to address them.",
    intent: 'feedback'
  };
};

// Handle general query intent
const handleGeneralQuery = async (message, user) => {
  // Check if message contains food item names
  const foodItems = await FoodItem.find({ isAvailable: true });
  
  const matchedItems = foodItems.filter(item => 
    message.toLowerCase().includes(item.name.toLowerCase())
  );
  
  if (matchedItems.length > 0) {
    const item = matchedItems[0];
    
    return {
      text: `${item.name} is ${item.description}. It costs $${item.price.toFixed(2)} and contains ${item.nutritionalInfo.calories} calories. Would you like to add it to your cart?`,
      relatedFoodItems: [item._id],
      intent: 'general_query'
    };
  }
  
  // Check if asking about menu
  if (message.includes('menu') || message.includes('what do you have') || message.includes('what do you offer')) {
    const categories = ['appetizer', 'main course', 'dessert', 'beverage'];
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    
    const categoryItems = await FoodItem.find({ 
      category: randomCategory,
      isAvailable: true 
    }).limit(5);
    
    if (categoryItems.length === 0) {
      return {
        text: "We offer a variety of appetizers, main courses, desserts, and beverages. Would you like me to recommend something specific?",
        intent: 'general_query'
      };
    }
    
    const itemNames = categoryItems.map(item => item.name).join(', ');
    
    return {
      text: `We have a wide selection of items on our menu. Some of our ${randomCategory}s include: ${itemNames}. Would you like to see more categories or get details about any of these items?`,
      relatedFoodItems: categoryItems.map(item => item._id),
      intent: 'general_query'
    };
  }
  
  // Default response
  return {
    text: "I'm not sure I understand. You can ask me about our menu, get food recommendations, check your order status, or inquire about nutritional information. How can I help you today?",
    intent: 'general_query'
  };
};

module.exports = {
  processMessage
}; 