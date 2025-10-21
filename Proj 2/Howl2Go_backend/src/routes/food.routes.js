import express from 'express';
import {
  parseQuery,
  searchFood,
  recommendFood,
  getFoodStats
} from '../controllers/food.controller.js';
import {
  parseLLMQuery,
  buildMongoQuery,
  validateCriteria
} from '../middleware/llm.middleware.js';

const router = express.Router();

/**
 * @route POST /api/food/parse
 * @desc Parse natural language query into structured criteria
 * @body { query: string }
 * @access Public
 *
 * @example
 * POST /api/food/parse
 * Body: { "query": "I want a high protein meal with low carbs" }
 * Response: {
 *   "success": true,
 *   "query": "I want a high protein meal with low carbs",
 *   "criteria": { "protein": { "min": 20 }, "carbs": { "max": 30 } }
 * }
 */
router.post('/parse', parseLLMQuery, parseQuery);

/**
 * @route POST /api/food/search
 * @desc Search for food items based on natural language query
 * @body { query: string, limit?: number, page?: number }
 * @access Public
 *
 * @example
 * POST /api/food/search
 * Body: {
 *   "query": "I want something with at least 30g of protein and less than 500 calories",
 *   "limit": 10,
 *   "page": 1
 * }
 * Response: {
 *   "success": true,
 *   "criteria": { "protein": { "min": 30 }, "calories": { "max": 500 } },
 *   "results": [...],
 *   "pagination": { "total": 45, "page": 1, "limit": 10, "pages": 5 }
 * }
 */
router.post('/search', parseLLMQuery, validateCriteria, buildMongoQuery, searchFood);

/**
 * @route POST /api/food/recommend
 * @desc Get food recommendations based on natural language preferences
 * @body { query: string, limit?: number }
 * @access Public
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
 */
router.post('/recommend', parseLLMQuery, validateCriteria, buildMongoQuery, recommendFood);

/**
 * @route POST /api/food/stats
 * @desc Get statistics about food items matching criteria
 * @body { query: string }
 * @access Public
 *
 * @example
 * POST /api/food/stats
 * Body: { "query": "low calorie desserts" }
 * Response: {
 *   "success": true,
 *   "criteria": { "calories": { "max": 300 } },
 *   "stats": {
 *     "count": 15,
 *     "averages": { "calories": 245, "protein": 5, "fat": 8, "carbs": 35 },
 *     "ranges": { ... }
 *   }
 * }
 */
router.post('/stats', parseLLMQuery, validateCriteria, buildMongoQuery, getFoodStats);

export default router;
