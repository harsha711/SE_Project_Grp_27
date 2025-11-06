import express from 'express';
import {
  recommendFood
} from '../controllers/food.controller.js';
import {
  parseLLMQuery,
  buildMongoQuery,
  validateCriteria
} from '../middleware/llm.middleware.js';

const router = express.Router();

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

export default router;
