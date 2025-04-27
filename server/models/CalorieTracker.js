const mongoose = require('mongoose');

const CalorieTrackerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  totalCalories: {
    type: Number,
    default: 0
  },
  calorieGoal: {
    type: Number,
    default: 2000
  },
  meals: [{
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    },
    foodItems: [{
      foodItem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FoodItem'
      },
      quantity: {
        type: Number,
        required: true
      },
      calories: {
        type: Number,
        required: true
      }
    }],
    mealType: {
      type: String,
      enum: ['breakfast', 'lunch', 'dinner', 'snack'],
      required: true
    },
    totalCalories: {
      type: Number,
      required: true
    },
    time: {
      type: Date,
      default: Date.now
    }
  }],
  nutritionSummary: {
    protein: { type: Number, default: 0 },
    carbohydrates: { type: Number, default: 0 },
    fat: { type: Number, default: 0 },
    fiber: { type: Number, default: 0 },
    sugar: { type: Number, default: 0 },
    sodium: { type: Number, default: 0 },
    vitamins: {
      vitaminA: { type: Number, default: 0 },
      vitaminC: { type: Number, default: 0 },
      vitaminD: { type: Number, default: 0 },
      vitaminE: { type: Number, default: 0 },
      vitaminK: { type: Number, default: 0 },
      thiamin: { type: Number, default: 0 },
      riboflavin: { type: Number, default: 0 },
      niacin: { type: Number, default: 0 },
      vitaminB6: { type: Number, default: 0 },
      folate: { type: Number, default: 0 },
      vitaminB12: { type: Number, default: 0 }
    },
    minerals: {
      calcium: { type: Number, default: 0 },
      iron: { type: Number, default: 0 },
      magnesium: { type: Number, default: 0 },
      phosphorus: { type: Number, default: 0 },
      potassium: { type: Number, default: 0 },
      zinc: { type: Number, default: 0 }
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('CalorieTracker', CalorieTrackerSchema); 