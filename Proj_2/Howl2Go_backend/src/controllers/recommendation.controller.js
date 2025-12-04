/**
 * Recommendation Controller
 *
 * Handles HTTP requests for AI-powered meal recommendations.
 * Provides personalized food suggestions based on user order history.
 *
 * Endpoints:
 * - GET /api/recommendations - Get personalized recommendations
 * - GET /api/recommendations/frequent - Get frequently ordered items
 * - GET /api/recommendations/similar - Get similar items to user preferences
 * - GET /api/recommendations/explore - Get exploration suggestions
 * - GET /api/recommendations/time-based - Get time-appropriate suggestions
 * - GET /api/recommendations/healthy - Get healthier alternatives
 *
 * @author AI Meal Suggestions Feature
 */

import { recommendationService } from "../services/recommendation.service.js";

/**
 * Get personalized AI recommendations
 * GET /api/recommendations
 */
export const getPersonalizedRecommendations = async (req, res) => {
    try {
        const userId = req.user?.id || null;
        const { limit = 8, includeProfile = true } = req.query;

        const result = await recommendationService.getPersonalizedRecommendations(
            userId,
            {
                limit: Math.min(parseInt(limit) || 8, 20),
                includeProfile: includeProfile !== "false"
            }
        );

        res.status(200).json(result);
    } catch (error) {
        console.error("Error getting personalized recommendations:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get recommendations",
            error: process.env.NODE_ENV === "development" ? error.message : undefined
        });
    }
};

/**
 * Get frequently ordered items
 * GET /api/recommendations/frequent
 */
export const getFrequentlyOrdered = async (req, res) => {
    try {
        const userId = req.user?.id || null;
        const { limit = 5 } = req.query;

        if (!userId) {
            return res.status(200).json({
                success: true,
                recommendations: [],
                message: "Login to see your frequently ordered items"
            });
        }

        const items = await recommendationService.getFrequentItems(
            userId,
            Math.min(parseInt(limit) || 5, 10)
        );

        res.status(200).json({
            success: true,
            recommendations: items,
            count: items.length,
            message: items.length > 0
                ? "Your favorite items"
                : "Start ordering to build your favorites!"
        });
    } catch (error) {
        console.error("Error getting frequent items:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get frequent items",
            error: process.env.NODE_ENV === "development" ? error.message : undefined
        });
    }
};

/**
 * Get items similar to user preferences
 * GET /api/recommendations/similar
 */
export const getSimilarItems = async (req, res) => {
    try {
        const userId = req.user?.id || null;
        const { limit = 5 } = req.query;

        const items = await recommendationService.getSimilarItems(
            userId,
            Math.min(parseInt(limit) || 5, 10)
        );

        res.status(200).json({
            success: true,
            recommendations: items,
            count: items.length,
            message: userId
                ? "Items matching your taste"
                : "Popular items you might like"
        });
    } catch (error) {
        console.error("Error getting similar items:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get similar items",
            error: process.env.NODE_ENV === "development" ? error.message : undefined
        });
    }
};

/**
 * Get exploration suggestions (try something new)
 * GET /api/recommendations/explore
 */
export const getExplorationSuggestions = async (req, res) => {
    try {
        const userId = req.user?.id || null;
        const { limit = 3 } = req.query;

        const items = await recommendationService.getExplorationSuggestions(
            userId,
            Math.min(parseInt(limit) || 3, 6)
        );

        res.status(200).json({
            success: true,
            recommendations: items,
            count: items.length,
            message: "Try something new!"
        });
    } catch (error) {
        console.error("Error getting exploration suggestions:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get exploration suggestions",
            error: process.env.NODE_ENV === "development" ? error.message : undefined
        });
    }
};

/**
 * Get time-based suggestions
 * GET /api/recommendations/time-based
 */
export const getTimeBasedSuggestions = async (req, res) => {
    try {
        const userId = req.user?.id || null;
        const { mealType = null, limit = 3 } = req.query;

        const validMealTypes = ["breakfast", "lunch", "dinner", "late-night"];
        const meal = validMealTypes.includes(mealType) ? mealType : null;

        const items = await recommendationService.getTimeBasedSuggestions(
            userId,
            meal,
            Math.min(parseInt(limit) || 3, 6)
        );

        // Determine current meal type for response
        let currentMealType = meal;
        if (!currentMealType) {
            const hour = new Date().getHours();
            if (hour >= 5 && hour < 11) currentMealType = "breakfast";
            else if (hour >= 11 && hour < 15) currentMealType = "lunch";
            else if (hour >= 15 && hour < 21) currentMealType = "dinner";
            else currentMealType = "late-night";
        }

        res.status(200).json({
            success: true,
            recommendations: items,
            count: items.length,
            mealType: currentMealType,
            message: `Perfect for ${currentMealType}`
        });
    } catch (error) {
        console.error("Error getting time-based suggestions:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get time-based suggestions",
            error: process.env.NODE_ENV === "development" ? error.message : undefined
        });
    }
};

/**
 * Get healthier alternatives to frequently ordered items
 * GET /api/recommendations/healthy
 */
export const getHealthierAlternatives = async (req, res) => {
    try {
        const userId = req.user?.id || null;
        const { limit = 3 } = req.query;

        if (!userId) {
            return res.status(200).json({
                success: true,
                recommendations: [],
                message: "Login to see healthier alternatives to your favorites"
            });
        }

        const items = await recommendationService.getHealthierAlternatives(
            userId,
            Math.min(parseInt(limit) || 3, 6)
        );

        res.status(200).json({
            success: true,
            recommendations: items,
            count: items.length,
            message: items.length > 0
                ? "Healthier swaps for your favorites"
                : "Your current choices are already healthy!"
        });
    } catch (error) {
        console.error("Error getting healthier alternatives:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get healthier alternatives",
            error: process.env.NODE_ENV === "development" ? error.message : undefined
        });
    }
};

/**
 * Get user's order history profile/stats
 * GET /api/recommendations/profile
 */
export const getUserProfile = async (req, res) => {
    try {
        const userId = req.user?.id || null;

        if (!userId) {
            return res.status(200).json({
                success: true,
                profile: null,
                message: "Login to see your ordering profile"
            });
        }

        const profile = await recommendationService.analyzeOrderHistory(userId);

        if (!profile) {
            return res.status(200).json({
                success: true,
                profile: null,
                message: "Start ordering to build your profile!"
            });
        }

        res.status(200).json({
            success: true,
            profile: {
                totalOrders: profile.totalOrders,
                totalItemsOrdered: profile.totalItemsOrdered,
                favoriteRestaurants: profile.frequentRestaurants,
                frequentItems: profile.frequentItems.slice(0, 5),
                avgCalories: profile.avgCalories,
                avgProtein: profile.avgProtein,
                avgPrice: profile.avgPrice,
                dietaryPreference: profile.dietaryPreference,
                orderTimePatterns: profile.orderTimePatterns,
                lastOrderDate: profile.lastOrderDate
            },
            message: "Your ordering profile"
        });
    } catch (error) {
        console.error("Error getting user profile:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get user profile",
            error: process.env.NODE_ENV === "development" ? error.message : undefined
        });
    }
};
