import {
  getRestaurantAnalytics,
  getPlatformAnalytics,
  getOrderTrends,
  getTopRestaurants
} from '../services/adminAnalytics.js';

/**
 * Get restaurant analytics
 * GET /api/admin/analytics/restaurants
 */
export const getRestaurantAnalyticsController = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const { timeRange = 'all' } = req.query;
    const analytics = await getRestaurantAnalytics(timeRange);

    res.status(200).json({
      success: true,
      data: {
        restaurants: analytics,
        timeRange
      }
    });
  } catch (error) {
    console.error('Error fetching restaurant analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch restaurant analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get platform-wide analytics
 * GET /api/admin/analytics/platform
 */
export const getPlatformAnalyticsController = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const { timeRange = 'all' } = req.query;
    const analytics = await getPlatformAnalytics(timeRange);

    res.status(200).json({
      success: true,
      data: {
        platform: analytics,
        timeRange
      }
    });
  } catch (error) {
    console.error('Error fetching platform analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch platform analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get order trends
 * GET /api/admin/analytics/trends
 */
export const getOrderTrendsController = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const { timeRange = 'month', groupBy = 'day' } = req.query;
    const trends = await getOrderTrends(timeRange, groupBy);

    res.status(200).json({
      success: true,
      data: {
        trends,
        timeRange,
        groupBy
      }
    });
  } catch (error) {
    console.error('Error fetching order trends:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order trends',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get top restaurants
 * GET /api/admin/analytics/top-restaurants
 */
export const getTopRestaurantsController = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const { metric = 'revenue', limit = 10, timeRange = 'all' } = req.query;
    const topRestaurants = await getTopRestaurants(metric, parseInt(limit), timeRange);

    res.status(200).json({
      success: true,
      data: {
        restaurants: topRestaurants,
        metric,
        timeRange
      }
    });
  } catch (error) {
    console.error('Error fetching top restaurants:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch top restaurants',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get comprehensive admin dashboard data
 * GET /api/admin/analytics/dashboard
 */
export const getAdminDashboardController = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const { timeRange = 'all' } = req.query;

    // Fetch all analytics in parallel
    const [platform, restaurants, trends, topByRevenue, topByOrders] = await Promise.all([
      getPlatformAnalytics(timeRange),
      getRestaurantAnalytics(timeRange),
      getOrderTrends(timeRange, 'day'),
      getTopRestaurants('revenue', 5, timeRange),
      getTopRestaurants('orders', 5, timeRange)
    ]);

    res.status(200).json({
      success: true,
      data: {
        platform,
        restaurants,
        trends,
        topByRevenue,
        topByOrders,
        timeRange
      }
    });
  } catch (error) {
    console.error('Error fetching admin dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin dashboard',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

