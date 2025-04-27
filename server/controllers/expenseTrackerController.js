const ExpenseTracker = require('../models/ExpenseTracker');

// @desc    Get user's expense tracker for a specific month
// @route   GET /api/expense-tracker/month/:year/:month
// @access  Private
const getExpenseTrackerByMonth = async (req, res) => {
  try {
    const year = parseInt(req.params.year);
    const month = parseInt(req.params.month);
    
    // Validate year and month
    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
      return res.status(400).json({ message: 'Invalid year or month format' });
    }
    
    // Find expense tracker for the specified month
    let expenseTracker = await ExpenseTracker.findOne({
      user: req.user._id,
      year,
      month
    }).populate({
      path: 'expenses.order',
      select: 'items orderStatus'
    });
    
    if (!expenseTracker) {
      // Return empty tracker if none exists
      expenseTracker = {
        year,
        month,
        totalExpense: 0,
        expenses: [],
        budget: 0,
        savings: 0,
        categories: {
          breakfast: 0,
          lunch: 0,
          dinner: 0,
          snack: 0,
          other: 0
        }
      };
    }
    
    res.json(expenseTracker);
  } catch (error) {
    console.error('Get expense tracker error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user's expense tracker for a date range
// @route   GET /api/expense-tracker/range
// @access  Private
const getExpenseTrackerByRange = async (req, res) => {
  try {
    const { startMonth, startYear, endMonth, endYear } = req.query;
    
    // Validate input
    const start = {
      year: parseInt(startYear),
      month: parseInt(startMonth)
    };
    
    const end = {
      year: parseInt(endYear),
      month: parseInt(endMonth)
    };
    
    if (
      isNaN(start.year) || isNaN(start.month) || 
      isNaN(end.year) || isNaN(end.month) || 
      start.month < 1 || start.month > 12 || 
      end.month < 1 || end.month > 12
    ) {
      return res.status(400).json({ message: 'Invalid date format' });
    }
    
    // Create date objects for comparison
    const startDate = new Date(start.year, start.month - 1, 1);
    const endDate = new Date(end.year, end.month, 0); // Last day of end month
    
    // Find all expense trackers in the range
    const expenseTrackers = await ExpenseTracker.find({
      user: req.user._id,
      $or: [
        // Year is between start and end years
        { year: { $gt: start.year, $lt: end.year } },
        // Start year with month >= start month
        { year: start.year, month: { $gte: start.month } },
        // End year with month <= end month
        { year: end.year, month: { $lte: end.month } }
      ]
    }).sort({ year: 1, month: 1 });
    
    // Prepare data for charts
    const chartData = {
      labels: [], // "Month Year" format
      expenses: [],
      categories: {
        breakfast: [],
        lunch: [],
        dinner: [],
        snack: [],
        other: []
      }
    };
    
    // Fill in data for each month in the range
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1;
      
      // Format label as "Month Year"
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const label = `${monthNames[currentMonth - 1]} ${currentYear}`;
      
      // Find tracker for this month
      const tracker = expenseTrackers.find(t => 
        t.year === currentYear && t.month === currentMonth
      );
      
      // Add label to chart data
      chartData.labels.push(label);
      
      if (tracker) {
        // Add expense data
        chartData.expenses.push(tracker.totalExpense);
        
        // Add category data
        chartData.categories.breakfast.push(tracker.categories.breakfast);
        chartData.categories.lunch.push(tracker.categories.lunch);
        chartData.categories.dinner.push(tracker.categories.dinner);
        chartData.categories.snack.push(tracker.categories.snack);
        chartData.categories.other.push(tracker.categories.other);
      } else {
        // Add zeros for missing data
        chartData.expenses.push(0);
        chartData.categories.breakfast.push(0);
        chartData.categories.lunch.push(0);
        chartData.categories.dinner.push(0);
        chartData.categories.snack.push(0);
        chartData.categories.other.push(0);
      }
      
      // Move to next month
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    
    // Calculate total and average expenses
    const totalExpense = expenseTrackers.reduce((sum, tracker) => sum + tracker.totalExpense, 0);
    const avgExpense = expenseTrackers.length > 0 ? totalExpense / expenseTrackers.length : 0;
    
    // Calculate category totals
    const categoryTotals = {
      breakfast: expenseTrackers.reduce((sum, tracker) => sum + tracker.categories.breakfast, 0),
      lunch: expenseTrackers.reduce((sum, tracker) => sum + tracker.categories.lunch, 0),
      dinner: expenseTrackers.reduce((sum, tracker) => sum + tracker.categories.dinner, 0),
      snack: expenseTrackers.reduce((sum, tracker) => sum + tracker.categories.snack, 0),
      other: expenseTrackers.reduce((sum, tracker) => sum + tracker.categories.other, 0)
    };
    
    res.json({
      trackers: expenseTrackers,
      chartData,
      summary: {
        totalExpense,
        avgExpense,
        categoryTotals
      }
    });
  } catch (error) {
    console.error('Get expense tracker range error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user's expense summary
// @route   GET /api/expense-tracker/summary
// @access  Private
const getExpenseSummary = async (req, res) => {
  try {
    // Get current month and year
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();
    
    // Get previous month and year
    let previousMonth = currentMonth - 1;
    let previousYear = currentYear;
    if (previousMonth === 0) {
      previousMonth = 12;
      previousYear = currentYear - 1;
    }
    
    // Find current month's tracker
    const currentMonthTracker = await ExpenseTracker.findOne({
      user: req.user._id,
      year: currentYear,
      month: currentMonth
    });
    
    // Find previous month's tracker
    const previousMonthTracker = await ExpenseTracker.findOne({
      user: req.user._id,
      year: previousYear,
      month: previousMonth
    });
    
    // Get all trackers for the current year
    const yearTrackers = await ExpenseTracker.find({
      user: req.user._id,
      year: currentYear
    });
    
    // Calculate summaries
    const currentMonthExpense = currentMonthTracker ? currentMonthTracker.totalExpense : 0;
    const previousMonthExpense = previousMonthTracker ? previousMonthTracker.totalExpense : 0;
    const yearExpense = yearTrackers.reduce((sum, tracker) => sum + tracker.totalExpense, 0);
    
    // Calculate month-over-month change
    const monthOverMonthChange = previousMonthExpense > 0 
      ? ((currentMonthExpense - previousMonthExpense) / previousMonthExpense) * 100 
      : 0;
    
    // Calculate category breakdown for current month
    const categoryBreakdown = currentMonthTracker 
      ? currentMonthTracker.categories 
      : {
          breakfast: 0,
          lunch: 0,
          dinner: 0,
          snack: 0,
          other: 0
        };
    
    // Calculate daily average for current month
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    const dailyAverage = currentMonthExpense / daysInMonth;
    
    // Calculate monthly average for the year
    const monthsWithData = yearTrackers.length;
    const monthlyAverage = monthsWithData > 0 ? yearExpense / monthsWithData : 0;
    
    // Get budget and savings
    const budget = currentMonthTracker ? currentMonthTracker.budget : 0;
    const savings = currentMonthTracker ? currentMonthTracker.savings : 0;
    
    // Calculate budget status
    const budgetRemaining = budget - currentMonthExpense;
    const budgetPercentUsed = budget > 0 ? (currentMonthExpense / budget) * 100 : 0;
    
    res.json({
      currentMonth: {
        year: currentYear,
        month: currentMonth,
        expense: currentMonthExpense,
        budget,
        budgetRemaining,
        budgetPercentUsed,
        savings,
        categoryBreakdown,
        dailyAverage
      },
      previousMonth: {
        year: previousYear,
        month: previousMonth,
        expense: previousMonthExpense
      },
      yearToDate: {
        expense: yearExpense,
        monthlyAverage
      },
      comparison: {
        monthOverMonthChange
      }
    });
  } catch (error) {
    console.error('Get expense summary error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update user's budget
// @route   PUT /api/expense-tracker/budget
// @access  Private
const updateBudget = async (req, res) => {
  try {
    const { budget, year, month } = req.body;
    
    // Validate budget
    if (budget < 0) {
      return res.status(400).json({ message: 'Budget cannot be negative' });
    }
    
    // Get current month and year if not provided
    const today = new Date();
    const currentYear = year || today.getFullYear();
    const currentMonth = month || today.getMonth() + 1;
    
    // Find or create expense tracker
    let expenseTracker = await ExpenseTracker.findOne({
      user: req.user._id,
      year: currentYear,
      month: currentMonth
    });
    
    if (!expenseTracker) {
      expenseTracker = new ExpenseTracker({
        user: req.user._id,
        year: currentYear,
        month: currentMonth,
        totalExpense: 0,
        expenses: [],
        budget: 0,
        savings: 0,
        categories: {
          breakfast: 0,
          lunch: 0,
          dinner: 0,
          snack: 0,
          other: 0
        }
      });
    }
    
    // Update budget
    expenseTracker.budget = budget;
    
    // Calculate savings
    expenseTracker.savings = budget > expenseTracker.totalExpense 
      ? budget - expenseTracker.totalExpense 
      : 0;
    
    // Save expense tracker
    await expenseTracker.save();
    
    res.json({ 
      message: 'Budget updated', 
      budget, 
      savings: expenseTracker.savings 
    });
  } catch (error) {
    console.error('Update budget error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getExpenseTrackerByMonth,
  getExpenseTrackerByRange,
  getExpenseSummary,
  updateBudget
}; 