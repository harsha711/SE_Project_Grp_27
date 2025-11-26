import Order from '../models/Order.js';

/**
 * Analyze nutrition patterns from user's order history
 */
export async function analyzeNutritionPatterns(userId, timeRange = 'all') {
  const dateFilter = getDateFilter(timeRange);
  
  const orders = await Order.find({
    userId,
    createdAt: dateFilter,
    status: 'completed'
  }).lean();

  if (orders.length === 0) {
    return {
      averageCalories: 0,
      averageProtein: 0,
      averageFat: 0,
      averageCarbs: 0,
      mostOrderedRestaurants: [],
      mostOrderedItems: [],
      nutritionDistribution: {}
    };
  }

  // Calculate averages
  const totals = orders.reduce((acc, order) => {
    acc.calories += order.nutrition.totalCalories;
    acc.protein += order.nutrition.totalProtein;
    acc.fat += order.nutrition.totalFat;
    acc.carbs += order.nutrition.totalCarbohydrates;
    return acc;
  }, { calories: 0, protein: 0, fat: 0, carbs: 0 });

  const orderCount = orders.length;
  const averages = {
    averageCalories: Math.round(totals.calories / orderCount),
    averageProtein: Math.round(totals.protein / orderCount),
    averageFat: Math.round(totals.fat / orderCount),
    averageCarbs: Math.round(totals.carbs / orderCount)
  };

  // Most ordered restaurants
  const restaurantCounts = {};
  const itemCounts = {};
  
  orders.forEach(order => {
    order.items.forEach(item => {
      // Count restaurants
      restaurantCounts[item.restaurant] = (restaurantCounts[item.restaurant] || 0) + item.quantity;
      
      // Count items
      const itemKey = `${item.restaurant} - ${item.item}`;
      itemCounts[itemKey] = (itemCounts[itemKey] || 0) + item.quantity;
    });
  });

  const mostOrderedRestaurants = Object.entries(restaurantCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const mostOrderedItems = Object.entries(itemCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Nutrition distribution (calories, protein, fat, carbs)
  const nutritionDistribution = {
    calories: {
      low: orders.filter(o => o.nutrition.totalCalories < 500).length,
      medium: orders.filter(o => o.nutrition.totalCalories >= 500 && o.nutrition.totalCalories < 1000).length,
      high: orders.filter(o => o.nutrition.totalCalories >= 1000).length
    },
    protein: {
      low: orders.filter(o => o.nutrition.totalProtein < 30).length,
      medium: orders.filter(o => o.nutrition.totalProtein >= 30 && o.nutrition.totalProtein < 50).length,
      high: orders.filter(o => o.nutrition.totalProtein >= 50).length
    }
  };

  return {
    ...averages,
    mostOrderedRestaurants,
    mostOrderedItems,
    nutritionDistribution,
    totalOrders: orderCount
  };
}

/**
 * Track dietary trends over time
 */
export async function trackDietaryTrends(userId, period = 'month') {
  const now = new Date();
  let startDate;
  let groupBy;

  switch (period) {
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      groupBy = 'day';
      break;
    case 'month':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      groupBy = 'day';
      break;
    case 'year':
      startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      groupBy = 'week';
      break;
    default:
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      groupBy = 'day';
  }

  const orders = await Order.find({
    userId,
    createdAt: { $gte: startDate },
    status: 'completed'
  }).sort({ createdAt: 1 }).lean();

  if (orders.length === 0) {
    return {
      trends: [],
      insights: []
    };
  }

  // Group orders by time period
  const grouped = {};
  orders.forEach(order => {
    const date = new Date(order.createdAt);
    let key;
    
    if (groupBy === 'day') {
      key = date.toISOString().split('T')[0];
    } else if (groupBy === 'week') {
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      key = weekStart.toISOString().split('T')[0];
    }
    
    if (!grouped[key]) {
      grouped[key] = {
        date: key,
        calories: 0,
        protein: 0,
        fat: 0,
        carbs: 0,
        orderCount: 0
      };
    }
    
    grouped[key].calories += order.nutrition.totalCalories;
    grouped[key].protein += order.nutrition.totalProtein;
    grouped[key].fat += order.nutrition.totalFat;
    grouped[key].carbs += order.nutrition.totalCarbohydrates;
    grouped[key].orderCount += 1;
  });

  const trends = Object.values(grouped).sort((a, b) => 
    new Date(a.date) - new Date(b.date)
  );

  // Calculate insights
  const insights = [];
  
  if (trends.length >= 2) {
    const recent = trends.slice(-7); // Last 7 periods
    const previous = trends.slice(-14, -7); // Previous 7 periods
    
    if (previous.length > 0) {
      const recentAvgCalories = recent.reduce((sum, t) => sum + t.calories, 0) / recent.length;
      const previousAvgCalories = previous.reduce((sum, t) => sum + t.calories, 0) / previous.length;
      
      if (recentAvgCalories < previousAvgCalories * 0.9) {
        insights.push({
          type: 'improvement',
          message: `You've reduced your average calorie intake by ${Math.round((1 - recentAvgCalories / previousAvgCalories) * 100)}% compared to the previous period!`,
          metric: 'calories'
        });
      } else if (recentAvgCalories > previousAvgCalories * 1.1) {
        insights.push({
          type: 'warning',
          message: `Your average calorie intake has increased by ${Math.round((recentAvgCalories / previousAvgCalories - 1) * 100)}% compared to the previous period.`,
          metric: 'calories'
        });
      }

      const recentAvgProtein = recent.reduce((sum, t) => sum + t.protein, 0) / recent.length;
      const previousAvgProtein = previous.reduce((sum, t) => sum + t.protein, 0) / previous.length;
      
      if (recentAvgProtein > previousAvgProtein * 1.1) {
        insights.push({
          type: 'improvement',
          message: `Great! Your protein intake has increased by ${Math.round((recentAvgProtein / previousAvgProtein - 1) * 100)}%!`,
          metric: 'protein'
        });
      }
    }
  }

  return {
    trends,
    insights,
    period
  };
}

/**
 * Generate personalized recommendations based on ordering habits
 */
export async function generatePersonalizedRecommendations(userId) {
  const patterns = await analyzeNutritionPatterns(userId, 'month');
  const trends = await trackDietaryTrends(userId, 'month');

  const recommendations = [];

  // Calorie recommendations
  if (patterns.averageCalories > 1200) {
    recommendations.push({
      type: 'calorie_reduction',
      priority: 'high',
      message: 'Your average order contains high calories. Consider adding lower-calorie options to balance your meals.',
      suggestion: 'Try searching for "under 500 calories" or "low calorie" options.'
    });
  } else if (patterns.averageCalories < 400) {
    recommendations.push({
      type: 'calorie_increase',
      priority: 'medium',
      message: 'Your orders are quite low in calories. Make sure you\'re getting enough energy!',
      suggestion: 'Consider adding nutrient-dense items to your orders.'
    });
  }

  // Protein recommendations
  if (patterns.averageProtein < 25) {
    recommendations.push({
      type: 'protein_increase',
      priority: 'high',
      message: 'Your orders are low in protein. Protein helps with satiety and muscle maintenance.',
      suggestion: 'Try searching for "high protein" or "at least 30g protein" options.'
    });
  }

  // Restaurant diversity
  if (patterns.mostOrderedRestaurants.length > 0 && 
      patterns.mostOrderedRestaurants[0].count > patterns.totalOrders * 0.5) {
    recommendations.push({
      type: 'diversity',
      priority: 'low',
      message: `You order from ${patterns.mostOrderedRestaurants[0].name} frequently. Try exploring other restaurants for variety!`,
      suggestion: 'Browse different restaurants to discover new healthy options.'
    });
  }

  // Trend-based recommendations
  if (trends.insights.length > 0) {
    trends.insights.forEach(insight => {
      if (insight.type === 'warning') {
        recommendations.push({
          type: 'trend_warning',
          priority: 'medium',
          message: insight.message,
          suggestion: 'Consider making small adjustments to your ordering habits.'
        });
      }
    });
  }

  // Balanced meal recommendation
  if (patterns.averageProtein > 30 && patterns.averageCalories < 800) {
    recommendations.push({
      type: 'balanced_meal',
      priority: 'low',
      message: 'Great job maintaining a balanced diet! Your orders show good protein and calorie balance.',
      suggestion: 'Keep up the good work!'
    });
  }

  return {
    recommendations: recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }),
    patterns,
    trends
  };
}

/**
 * Helper function to get date filter based on time range
 */
function getDateFilter(timeRange) {
  const now = new Date();
  
  switch (timeRange) {
    case 'week':
      return { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) };
    case 'month':
      return { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) };
    case 'year':
      return { $gte: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000) };
    default:
      return {}; // All time
  }
}

