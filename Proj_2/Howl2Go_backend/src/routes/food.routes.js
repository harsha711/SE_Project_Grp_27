import express from 'express';
import {
  recommendFood
} from '../controllers/food.controller.js';
import {
  parseLLMQuery,
  buildMongoQuery,
  validateCriteria,
  applyUserPreferences
} from '../middleware/llm.middleware.js';
import { optionalAuth } from '../middleware/auth.middleware.js';

const router = express.Router();

/**
 * @route POST /api/food/recommend
 * @desc Get food recommendations based on natural language preferences
 * @body { query: string, limit?: number }
 * @access Public (but uses user preferences if authenticated)
 *
 * @example
 * POST /api/food/recommend
 * Body: {
 *   "query": "I need a high protein snack",
 *   "limit": 5
 * }
 * Response: {
 *   "success": true,
 *   "criteria": { "protein": { "min": 15 } },
 *   "recommendations": [...],
 *   "count": 5
 * }
 * 
 * When authenticated, user preferences are applied:
 * - maxCalories: Applied as default calorie limit if not specified in query
 * - minProtein: Applied as default protein minimum if not specified in query
 * - favoriteRestaurants: Results from these restaurants are boosted to top
 * - dietaryRestrictions: Reserved for future filtering
 */
router.post('/recommend', optionalAuth, parseLLMQuery, validateCriteria, applyUserPreferences, buildMongoQuery, recommendFood);

export default router;
