import { Router } from 'express';
import {
  createOrder,
  getOrderHistory,
  getOrderById,
  getOrderInsights
} from '../controllers/order.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

/**
 * @route   POST /api/orders
 * @desc    Create order from cart
 * @access  Private
 */
router.post('/', authenticate, createOrder);

/**
 * @route   GET /api/orders
 * @desc    Get user's order history
 * @access  Private
 */
router.get('/', authenticate, getOrderHistory);

/**
 * @route   GET /api/orders/insights
 * @desc    Get order insights and analytics
 * @access  Private
 */
router.get('/insights', authenticate, getOrderInsights);

/**
 * @route   GET /api/orders/:orderId
 * @desc    Get single order by ID
 * @access  Private
 */
router.get('/:orderId', authenticate, getOrderById);

export default router;

