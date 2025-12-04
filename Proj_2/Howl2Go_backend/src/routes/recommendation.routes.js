/**
 * Recommendation Routes
 *
 * API routes for AI-powered meal recommendations.
 * All routes support optional authentication - logged-in users get personalized
 * recommendations based on order history, while guests get popular items.
 *
 * Routes:
 * - GET /api/recommendations - Main personalized recommendations
 * - GET /api/recommendations/frequent - Frequently ordered items
 * - GET /api/recommendations/similar - Similar to user preferences
 * - GET /api/recommendations/explore - Try something new
 * - GET /api/recommendations/time-based - Time-appropriate suggestions
 * - GET /api/recommendations/healthy - Healthier alternatives
 * - GET /api/recommendations/profile - User ordering profile/stats
 *
 * @author AI Meal Suggestions Feature
 */

import { Router } from "express";
import { optionalAuth } from "../middleware/auth.middleware.js";
import {
    getPersonalizedRecommendations,
    getFrequentlyOrdered,
    getSimilarItems,
    getExplorationSuggestions,
    getTimeBasedSuggestions,
    getHealthierAlternatives,
    getUserProfile
} from "../controllers/recommendation.controller.js";

const router = Router();

/**
 * @route   GET /api/recommendations
 * @desc    Get personalized AI recommendations
 * @access  Public (enhanced for authenticated users)
 * @query   limit - Number of recommendations (default: 8, max: 20)
 * @query   includeProfile - Include user profile in response (default: true)
 */
router.get("/", optionalAuth, getPersonalizedRecommendations);

/**
 * @route   GET /api/recommendations/frequent
 * @desc    Get user's frequently ordered items
 * @access  Public (requires auth for personalized results)
 * @query   limit - Number of items (default: 5, max: 10)
 */
router.get("/frequent", optionalAuth, getFrequentlyOrdered);

/**
 * @route   GET /api/recommendations/similar
 * @desc    Get items similar to user's preferences
 * @access  Public (enhanced for authenticated users)
 * @query   limit - Number of items (default: 5, max: 10)
 */
router.get("/similar", optionalAuth, getSimilarItems);

/**
 * @route   GET /api/recommendations/explore
 * @desc    Get exploration suggestions (restaurants user hasn't tried)
 * @access  Public (enhanced for authenticated users)
 * @query   limit - Number of suggestions (default: 3, max: 6)
 */
router.get("/explore", optionalAuth, getExplorationSuggestions);

/**
 * @route   GET /api/recommendations/time-based
 * @desc    Get time-appropriate meal suggestions
 * @access  Public (enhanced for authenticated users)
 * @query   mealType - Optional: breakfast, lunch, dinner, late-night (auto-detected if not provided)
 * @query   limit - Number of suggestions (default: 3, max: 6)
 */
router.get("/time-based", optionalAuth, getTimeBasedSuggestions);

/**
 * @route   GET /api/recommendations/healthy
 * @desc    Get healthier alternatives to frequently ordered items
 * @access  Public (requires auth for personalized results)
 * @query   limit - Number of alternatives (default: 3, max: 6)
 */
router.get("/healthy", optionalAuth, getHealthierAlternatives);

/**
 * @route   GET /api/recommendations/profile
 * @desc    Get user's ordering profile and stats
 * @access  Public (requires auth for profile data)
 */
router.get("/profile", optionalAuth, getUserProfile);

export default router;
