const CalorieTracker = require('../models/CalorieTracker');
const User = require('../models/User');

// @desc    Get user's calorie tracker for a specific date
// @route   GET /api/calorie-tracker/date/:date
// @access  Private
const getCalorieTrackerByDate = async (req, res) => {
  try {
    const dateParam = req.params.date;
    const date = new Date(dateParam);
    date.setHours(0, 0, 0, 0);
    
    // Validate date
    if (isNaN(date.getTime())) {
      return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD' });
    }
    
    // Find calorie tracker for the specified date
    const calorieTracker = await CalorieTracker.findOne({
      user: req.user._id,
      date: {
        $gte: date,
        $lt: new Date(date.getTime() + 24 * 60 * 60 * 1000)
      }
    }).populate({
      path: 'meals.foodItems.foodItem',
      select: 'name image category nutritionalInfo'
    });
    
    if (!calorieTracker) {
      // Return empty tracker if none exists
      return res.json({
        date: date,
        totalCalories: 0,
        calorieGoal: req.user.calorieGoal,
        meals: [],
        nutritionSummary: {
          protein: 0,
          carbohydrates: 0,
          fat: 0,
          fiber: 0,
          sugar: 0,
          sodium: 0
        }
      });
    }
    
    res.json(calorieTracker);
  } catch (error) {
    console.error('Get calorie tracker error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user's calorie tracker for a date range
// @route   GET /api/calorie-tracker/range
// @access  Private
const getCalorieTrackerByRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Validate dates
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD' });
    }
    
    // Find calorie trackers for the specified date range
    const calorieTrackers = await CalorieTracker.find({
      user: req.user._id,
      date: {
        $gte: start,
        $lte: end
      }
    }).sort({ date: 1 });
    
    // Get user's calorie goal
    const user = await User.findById(req.user._id);
    const calorieGoal = user.calorieGoal;
    
    // Prepare data for chart
    const chartData = {
      dates: [],
      calories: [],
      calorieGoal: calorieGoal,
      nutritionData: {
        protein: [],
        carbohydrates: [],
        fat: []
      },
      mealTypeData: {
        breakfast: [],
        lunch: [],
        dinner: [],
        snack: []
      }
    };
    
    // Fill in data for each day in the range
    let currentDate = new Date(start);
    while (currentDate <= end) {
      const formattedDate = currentDate.toISOString().split('T')[0];
      
      // Find tracker for this date
      const tracker = calorieTrackers.find(t => 
        t.date.toISOString().split('T')[0] === formattedDate
      );
      
      // Add date to chart data
      chartData.dates.push(formattedDate);
      
      if (tracker) {
        // Add calorie data
        chartData.calories.push(tracker.totalCalories);
        
        // Add nutrition data
        chartData.nutritionData.protein.push(tracker.nutritionSummary.protein);
        chartData.nutritionData.carbohydrates.push(tracker.nutritionSummary.carbohydrates);
        chartData.nutritionData.fat.push(tracker.nutritionSummary.fat);
        
        // Calculate meal type data
        const mealTypes = { breakfast: 0, lunch: 0, dinner: 0, snack: 0 };
        
        tracker.meals.forEach(meal => {
          mealTypes[meal.mealType] += meal.totalCalories;
        });
        
        chartData.mealTypeData.breakfast.push(mealTypes.breakfast);
        chartData.mealTypeData.lunch.push(mealTypes.lunch);
        chartData.mealTypeData.dinner.push(mealTypes.dinner);
        chartData.mealTypeData.snack.push(mealTypes.snack);
      } else {
        // Add zeros for missing data
        chartData.calories.push(0);
        chartData.nutritionData.protein.push(0);
        chartData.nutritionData.carbohydrates.push(0);
        chartData.nutritionData.fat.push(0);
        chartData.mealTypeData.breakfast.push(0);
        chartData.mealTypeData.lunch.push(0);
        chartData.mealTypeData.dinner.push(0);
        chartData.mealTypeData.snack.push(0);
      }
      
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    res.json({
      trackers: calorieTrackers,
      chartData
    });
  } catch (error) {
    console.error('Get calorie tracker range error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user's calorie summary
// @route   GET /api/calorie-tracker/summary
// @access  Private
const getCalorieSummary = async (req, res) => {
  try {
    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get yesterday's date
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Get start of week (Sunday)
    const startOfWeek = new Date(today);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    
    // Get start of month
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    // Find today's tracker
    const todayTracker = await CalorieTracker.findOne({
      user: req.user._id,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    });
    
    // Find yesterday's tracker
    const yesterdayTracker = await CalorieTracker.findOne({
      user: req.user._id,
      date: {
        $gte: yesterday,
        $lt: today
      }
    });
    
    // Find this week's trackers
    const weekTrackers = await CalorieTracker.find({
      user: req.user._id,
      date: {
        $gte: startOfWeek,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    });
    
    // Find this month's trackers
    const monthTrackers = await CalorieTracker.find({
      user: req.user._id,
      date: {
        $gte: startOfMonth,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    });
    
    // Get user's calorie goal
    const user = await User.findById(req.user._id);
    const calorieGoal = user.calorieGoal;
    
    // Calculate summaries
    const todayCalories = todayTracker ? todayTracker.totalCalories : 0;
    const yesterdayCalories = yesterdayTracker ? yesterdayTracker.totalCalories : 0;
    
    const weekCalories = weekTrackers.reduce((sum, tracker) => sum + tracker.totalCalories, 0);
    const weekAvgCalories = weekTrackers.length > 0 ? weekCalories / weekTrackers.length : 0;
    
    const monthCalories = monthTrackers.reduce((sum, tracker) => sum + tracker.totalCalories, 0);
    const monthAvgCalories = monthTrackers.length > 0 ? monthCalories / monthTrackers.length : 0;
    
    // Calculate nutrition summaries
    const todayNutrition = todayTracker ? todayTracker.nutritionSummary : {
      protein: 0,
      carbohydrates: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0
    };
    
    // Calculate week nutrition averages
    const weekNutrition = {
      protein: 0,
      carbohydrates: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0
    };
    
    weekTrackers.forEach(tracker => {
      weekNutrition.protein += tracker.nutritionSummary.protein;
      weekNutrition.carbohydrates += tracker.nutritionSummary.carbohydrates;
      weekNutrition.fat += tracker.nutritionSummary.fat;
      weekNutrition.fiber += tracker.nutritionSummary.fiber;
      weekNutrition.sugar += tracker.nutritionSummary.sugar;
      weekNutrition.sodium += tracker.nutritionSummary.sodium;
    });
    
    if (weekTrackers.length > 0) {
      weekNutrition.protein /= weekTrackers.length;
      weekNutrition.carbohydrates /= weekTrackers.length;
      weekNutrition.fat /= weekTrackers.length;
      weekNutrition.fiber /= weekTrackers.length;
      weekNutrition.sugar /= weekTrackers.length;
      weekNutrition.sodium /= weekTrackers.length;
    }
    
    // Calculate month nutrition averages
    const monthNutrition = {
      protein: 0,
      carbohydrates: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0
    };
    
    monthTrackers.forEach(tracker => {
      monthNutrition.protein += tracker.nutritionSummary.protein;
      monthNutrition.carbohydrates += tracker.nutritionSummary.carbohydrates;
      monthNutrition.fat += tracker.nutritionSummary.fat;
      monthNutrition.fiber += tracker.nutritionSummary.fiber;
      monthNutrition.sugar += tracker.nutritionSummary.sugar;
      monthNutrition.sodium += tracker.nutritionSummary.sodium;
    });
    
    if (monthTrackers.length > 0) {
      monthNutrition.protein /= monthTrackers.length;
      monthNutrition.carbohydrates /= monthTrackers.length;
      monthNutrition.fat /= monthTrackers.length;
      monthNutrition.fiber /= monthTrackers.length;
      monthNutrition.sugar /= monthTrackers.length;
      monthNutrition.sodium /= monthTrackers.length;
    }
    
    res.json({
      calorieGoal,
      today: {
        date: today.toISOString().split('T')[0],
        calories: todayCalories,
        percentOfGoal: (todayCalories / calorieGoal) * 100,
        nutrition: todayNutrition
      },
      yesterday: {
        date: yesterday.toISOString().split('T')[0],
        calories: yesterdayCalories,
        percentOfGoal: (yesterdayCalories / calorieGoal) * 100
      },
      week: {
        totalCalories: weekCalories,
        avgCalories: weekAvgCalories,
        avgPercentOfGoal: (weekAvgCalories / calorieGoal) * 100,
        nutrition: weekNutrition
      },
      month: {
        totalCalories: monthCalories,
        avgCalories: monthAvgCalories,
        avgPercentOfGoal: (monthAvgCalories / calorieGoal) * 100,
        nutrition: monthNutrition
      }
    });
  } catch (error) {
    console.error('Get calorie summary error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update user's calorie goal
// @route   PUT /api/calorie-tracker/goal
// @access  Private
const updateCalorieGoal = async (req, res) => {
  try {
    const { calorieGoal } = req.body;
    
    // Validate calorie goal
    if (!calorieGoal || calorieGoal < 500 || calorieGoal > 10000) {
      return res.status(400).json({ message: 'Calorie goal must be between 500 and 10000' });
    }
    
    // Update user's calorie goal
    const user = await User.findById(req.user._id);
    user.calorieGoal = calorieGoal;
    await user.save();
    
    res.json({ message: 'Calorie goal updated', calorieGoal });
  } catch (error) {
    console.error('Update calorie goal error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getCalorieTrackerByDate,
  getCalorieTrackerByRange,
  getCalorieSummary,
  updateCalorieGoal
}; 