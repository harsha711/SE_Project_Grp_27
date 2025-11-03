import { Router } from 'express';
import {
  getCart,
  addItemToCart,
  updateCartItemQuantity,
  removeItemFromCart,
  clearCart,
  mergeCart
} from '../controllers/cart.controller.js';
import { optionalAuth, authenticate } from '../middleware/auth.middleware.js';

const router = Router();

/**
 * @route   GET /api/cart
 * @desc    Get current cart (works for both authenticated and guest users)
 * @access  Public
 */
router.get('/', optionalAuth, getCart);

/**
 * @route   POST /api/cart/items
 * @desc    Add item to cart
 * @access  Public
 */
router.post('/items', optionalAuth, addItemToCart);

/**
 * @route   PATCH /api/cart/items/:foodItemId
 * @desc    Update item quantity in cart
 * @access  Public
 */
router.patch('/items/:foodItemId', optionalAuth, updateCartItemQuantity);

/**
 * @route   DELETE /api/cart/items/:foodItemId
 * @desc    Remove item from cart
 * @access  Public
 */
router.delete('/items/:foodItemId', optionalAuth, removeItemFromCart);

/**
 * @route   DELETE /api/cart
 * @desc    Clear entire cart
 * @access  Public
 */
router.delete('/', optionalAuth, clearCart);

/**
 * @route   POST /api/cart/merge
 * @desc    Merge guest cart with user cart on login
 * @access  Private (requires authentication)
 */
router.post('/merge', authenticate, mergeCart);

export default router;
