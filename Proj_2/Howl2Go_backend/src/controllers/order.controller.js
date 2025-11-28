import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import FastFoodItem from '../models/FastFoodItem.js';
import {
  analyzeNutritionPatterns,
  trackDietaryTrends,
  generatePersonalizedRecommendations
} from '../services/orderAnalytics.js';

/**
 * Create order from cart
 * POST /api/orders
 */
export const createOrder = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const sessionId = req.session.id;
    const userId = req.user.id;

    // Get cart
    const cart = await Cart.findOne({ sessionId });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }

    // Calculate totals
    const subtotal = cart.totalPrice;
    const tax = subtotal * 0.08; // 8% tax
    const deliveryFee = subtotal > 30 ? 0 : 3.99;
    const total = subtotal + tax + deliveryFee;

    // Populate cart items with full food item data
    const populatedCart = await Cart.findById(cart._id).populate('items.foodItem');
    
    // Create order from cart items with full nutrition data
    const orderItems = await Promise.all(
      populatedCart.items.map(async (item) => {
        // Get full nutrition data from FastFoodItem if available
        let fullNutrition = {};
        if (item.foodItem && typeof item.foodItem === 'object') {
          const foodItem = await FastFoodItem.findById(item.foodItem._id).lean();
          if (foodItem) {
            fullNutrition = {
              calories: foodItem.calories || item.calories || 0,
              totalFat: foodItem.totalFat || item.totalFat || null,
              saturatedFat: foodItem.saturatedFat || null,
              transFat: foodItem.transFat || null,
              protein: foodItem.protein || item.protein || null,
              carbohydrates: foodItem.carbs || item.carbohydrates || null,
              fiber: foodItem.fiber || null,
              sugars: foodItem.sugars || null,
              sodium: foodItem.sodium || null,
              cholesterol: foodItem.cholesterol || null,
            };
          }
        }
        
        return {
          foodItem: item.foodItem._id || item.foodItem,
          restaurant: item.restaurant,
          item: item.item,
          calories: fullNutrition.calories || item.calories || 0,
          totalFat: fullNutrition.totalFat || item.totalFat || null,
          saturatedFat: fullNutrition.saturatedFat || null,
          transFat: fullNutrition.transFat || null,
          protein: fullNutrition.protein || item.protein || null,
          carbohydrates: fullNutrition.carbohydrates || item.carbohydrates || null,
          fiber: fullNutrition.fiber || null,
          sugars: fullNutrition.sugars || null,
          sodium: fullNutrition.sodium || null,
          cholesterol: fullNutrition.cholesterol || null,
          price: item.price,
          quantity: item.quantity
        };
      })
    );

    // Generate unique order number
    let orderNumber;
    let isUnique = false;
    
    while (!isUnique) {
      const timestamp = Date.now().toString(36).toUpperCase();
      const random = Math.random().toString(36).substring(2, 8).toUpperCase();
      orderNumber = `ORD-${timestamp}-${random}`;
      
      // Check if this orderNumber already exists
      const existingOrder = await Order.findOne({ orderNumber });
      if (!existingOrder) {
        isUnique = true;
      }
    }

    // Create order
    const order = await Order.create({
      userId,
      orderNumber,
      items: orderItems,
      subtotal,
      tax,
      deliveryFee,
      total,
      status: 'completed'
    });

    // Clear cart after order is created
    await cart.clearCart();

    // Populate food items for response
    const populatedOrder = await Order.findById(order._id)
      .populate('items.foodItem')
      .lean();

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: {
        order: populatedOrder
      }
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get user's order history
 * GET /api/orders
 */
export const getOrderHistory = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const userId = req.user.id;
    const { limit = 20, page = 1, timeRange = 'all' } = req.query;

    // Ensure userId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    // Build query
    const query = {
      userId: new mongoose.Types.ObjectId(userId),
      status: 'completed'
    };

    // Build date filter if needed
    if (timeRange !== 'all') {
      const now = new Date();
      switch (timeRange) {
        case 'week':
          query.createdAt = { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) };
          break;
        case 'month':
          query.createdAt = { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) };
          break;
        case 'year':
          query.createdAt = { $gte: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000) };
          break;
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const orders = await Order.find(query)
      .populate('items.foodItem')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .lean();

    const total = await Order.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        orders,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching order history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order history',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get single order by ID
 * GET /api/orders/:orderId
 */
export const getOrderById = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const { orderId } = req.params;
    const userId = req.user.id;

    const order = await Order.findOne({
      _id: orderId,
      userId
    })
      .populate('items.foodItem')
      .lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        order
      }
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get order insights and analytics
 * GET /api/orders/insights
 */
export const getOrderInsights = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const userId = req.user.id;
    const { timeRange = 'all', period = 'month' } = req.query;

    // Get nutrition patterns
    const patterns = await analyzeNutritionPatterns(userId, timeRange);

    // Get dietary trends
    const trends = await trackDietaryTrends(userId, period);

    // Get personalized recommendations
    const recommendations = await generatePersonalizedRecommendations(userId);

    res.status(200).json({
      success: true,
      data: {
        patterns,
        trends,
        recommendations: recommendations.recommendations
      }
    });
  } catch (error) {
    console.error('Error fetching order insights:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order insights',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

