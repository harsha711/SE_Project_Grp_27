import { Router } from 'express';
import {
  createReview,
  getItemReviews,
  getMyReviews,
  updateReview,
  deleteReview,
  markHelpful
} from '../controllers/review.controller.js';
import { authenticate, optionalAuth } from '../middleware/auth.middleware.js';

const router = Router();

/**
 * @route   POST /api/reviews
 * @desc    Create a review for a food item
 * @access  Private
 */
router.post('/', authenticate, createReview);

/**
 * @route   GET /api/reviews/item/:foodItemId
 * @desc    Get reviews for a specific food item
 * @access  Public
 */
router.get('/item/:foodItemId', optionalAuth, getItemReviews);

/**
 * @route   GET /api/reviews/my-reviews
 * @desc    Get current user's reviews
 * @access  Private
 */
router.get('/my-reviews', authenticate, getMyReviews);

/**
 * @route   PATCH /api/reviews/:reviewId
 * @desc    Update a review
 * @access  Private
 */
router.patch('/:reviewId', authenticate, updateReview);

/**
 * @route   DELETE /api/reviews/:reviewId
 * @desc    Delete a review
 * @access  Private
 */
router.delete('/:reviewId', authenticate, deleteReview);

/**
 * @route   POST /api/reviews/:reviewId/helpful
 * @desc    Mark a review as helpful
 * @access  Private
 */
router.post('/:reviewId/helpful', authenticate, markHelpful);

export default router;

