import Order from '../models/Order.js';
import mongoose from 'mongoose';

/**
 * Get date filter based on time range
 */
function getDateFilter(timeRange) {
  const now = new Date();
  switch (timeRange) {
    case 'today': {
      const today = new Date(now);
      today.setHours(0, 0, 0, 0);
      return { $gte: today };
    }
    case 'week': {
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      return { $gte: weekAgo };
    }
    case 'month': {
      const monthAgo = new Date(now);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return { $gte: monthAgo };
    }
    case 'year': {
      const yearAgo = new Date(now);
      yearAgo.setFullYear(yearAgo.getFullYear() - 1);
      return { $gte: yearAgo };
    }
    default:
      return {};
  }
}

/**
 * Get restaurant performance analytics
 * Returns revenue, order count, frequency, and nutritional data per restaurant
 */
export async function getRestaurantAnalytics(timeRange = 'all') {
  const dateFilter = getDateFilter(timeRange);
  
  const matchStage = {
    status: 'completed',
    ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter })
  };

  // Aggregate restaurant data
  const restaurantStats = await Order.aggregate([
    { $match: matchStage },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.restaurant',
        totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        totalOrders: { $addToSet: '$_id' }, // Unique orders
        totalItems: { $sum: '$items.quantity' },
        totalCalories: { $sum: { $multiply: ['$items.calories', '$items.quantity'] } },
        totalProtein: { $sum: { $multiply: ['$items.protein', '$items.quantity'] } },
        totalFat: { $sum: { $multiply: ['$items.totalFat', '$items.quantity'] } },
        totalCarbs: { $sum: { $multiply: ['$items.carbohydrates', '$items.quantity'] } },
        averageOrderValue: { $avg: '$total' },
        items: {
          $push: {
            item: '$items.item',
            quantity: '$items.quantity',
            price: '$items.price',
            calories: '$items.calories',
            protein: '$items.protein'
          }
        }
      }
    },
    {
      $project: {
        restaurant: '$_id',
        totalRevenue: { $round: ['$totalRevenue', 2] },
        orderCount: { $size: '$totalOrders' },
        totalItems: 1,
        totalCalories: { $round: ['$totalCalories', 0] },
        totalProtein: { $round: ['$totalProtein', 0] },
        totalFat: { $round: ['$totalFat', 0] },
        totalCarbs: { $round: ['$totalCarbs', 0] },
        averageOrderValue: { $round: ['$averageOrderValue', 2] },
        averageCaloriesPerOrder: {
          $round: [{ $divide: ['$totalCalories', { $size: '$totalOrders' }] }, 0]
        },
        averageProteinPerOrder: {
          $round: [{ $divide: ['$totalProtein', { $size: '$totalOrders' }] }, 0]
        },
        items: 1
      }
    },
    { $sort: { totalRevenue: -1 } }
  ]);

  // Calculate item popularity per restaurant
  const restaurantWithItems = restaurantStats.map(restaurant => {
    const itemMap = new Map();
    
    restaurant.items.forEach(item => {
      const key = item.item;
      if (itemMap.has(key)) {
        const existing = itemMap.get(key);
        existing.quantity += item.quantity;
        existing.revenue += item.price * item.quantity;
        existing.calories += item.calories * item.quantity;
        existing.protein += item.protein * item.quantity;
      } else {
        itemMap.set(key, {
          name: item.item,
          quantity: item.quantity,
          revenue: item.price * item.quantity,
          calories: item.calories * item.quantity,
          protein: item.protein * item.quantity,
          averagePrice: item.price
        });
      }
    });

    const popularItems = Array.from(itemMap.values())
      .map(item => ({
        ...item,
        revenue: Math.round(item.revenue * 100) / 100,
        calories: Math.round(item.calories),
        protein: Math.round(item.protein)
      }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10); // Top 10 items

    return {
      ...restaurant,
      popularItems
    };
  });

  return restaurantWithItems;
}

/**
 * Get overall platform analytics
 */
export async function getPlatformAnalytics(timeRange = 'all') {
  const dateFilter = getDateFilter(timeRange);
  
  const matchStage = {
    status: 'completed',
    ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter })
  };

  const stats = await Order.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$total' },
        totalOrders: { $sum: 1 },
        totalUsers: { $addToSet: '$userId' },
        averageOrderValue: { $avg: '$total' },
        totalCalories: { $sum: '$nutrition.totalCalories' },
        totalProtein: { $sum: '$nutrition.totalProtein' },
        totalFat: { $sum: '$nutrition.totalFat' },
        totalCarbs: { $sum: '$nutrition.totalCarbohydrates' }
      }
    },
    {
      $project: {
        totalRevenue: { $round: ['$totalRevenue', 2] },
        totalOrders: 1,
        totalUsers: { $size: '$totalUsers' },
        averageOrderValue: { $round: ['$averageOrderValue', 2] },
        totalCalories: { $round: ['$totalCalories', 0] },
        totalProtein: { $round: ['$totalProtein', 0] },
        totalFat: { $round: ['$totalFat', 0] },
        totalCarbs: { $round: ['$totalCarbs', 0] },
        averageCaloriesPerOrder: {
          $round: [{ $divide: ['$totalCalories', '$totalOrders'] }, 0]
        },
        averageProteinPerOrder: {
          $round: [{ $divide: ['$totalProtein', '$totalOrders'] }, 0]
        }
      }
    }
  ]);

  return stats[0] || {
    totalRevenue: 0,
    totalOrders: 0,
    totalUsers: 0,
    averageOrderValue: 0,
    totalCalories: 0,
    totalProtein: 0,
    totalFat: 0,
    totalCarbs: 0,
    averageCaloriesPerOrder: 0,
    averageProteinPerOrder: 0
  };
}

/**
 * Get order trends over time
 */
export async function getOrderTrends(timeRange = 'month', groupBy = 'day') {
  const dateFilter = getDateFilter(timeRange);
  
  const matchStage = {
    status: 'completed',
    ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter })
  };

  let dateFormat;
  switch (groupBy) {
    case 'hour':
      dateFormat = { $dateToString: { format: '%Y-%m-%d %H:00', date: '$createdAt' } };
      break;
    case 'day':
      dateFormat = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
      break;
    case 'week':
      dateFormat = { $dateToString: { format: '%Y-W%V', date: '$createdAt' } };
      break;
    case 'month':
      dateFormat = { $dateToString: { format: '%Y-%m', date: '$createdAt' } };
      break;
    default:
      dateFormat = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
  }

  const trends = await Order.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: dateFormat,
        revenue: { $sum: '$total' },
        orderCount: { $sum: 1 },
        averageOrderValue: { $avg: '$total' },
        totalCalories: { $sum: '$nutrition.totalCalories' },
        totalProtein: { $sum: '$nutrition.totalProtein' }
      }
    },
    {
      $project: {
        date: '$_id',
        revenue: { $round: ['$revenue', 2] },
        orderCount: 1,
        averageOrderValue: { $round: ['$averageOrderValue', 2] },
        totalCalories: { $round: ['$totalCalories', 0] },
        totalProtein: { $round: ['$totalProtein', 0] }
      }
    },
    { $sort: { date: 1 } }
  ]);

  return trends;
}

/**
 * Get top performing restaurants by various metrics
 */
export async function getTopRestaurants(metric = 'revenue', limit = 10, timeRange = 'all') {
  const restaurantStats = await getRestaurantAnalytics(timeRange);
  
  let sorted = [...restaurantStats];
  
  switch (metric) {
    case 'revenue':
      sorted.sort((a, b) => b.totalRevenue - a.totalRevenue);
      break;
    case 'orders':
      sorted.sort((a, b) => b.orderCount - a.orderCount);
      break;
    case 'items':
      sorted.sort((a, b) => b.totalItems - a.totalItems);
      break;
    case 'calories':
      sorted.sort((a, b) => b.totalCalories - a.totalCalories);
      break;
    case 'protein':
      sorted.sort((a, b) => b.totalProtein - a.totalProtein);
      break;
    default:
      sorted.sort((a, b) => b.totalRevenue - a.totalRevenue);
  }

  return sorted.slice(0, limit);
}

