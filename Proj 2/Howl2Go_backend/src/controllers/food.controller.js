import FastFoodItem from "../models/FastFoodItem.js";

/**
 * Get food recommendations based on natural language preferences
 * Similar to search but with sorting and better recommendations
 *
 * @route POST /api/food/recommend
 * @body { query: string, limit?: number } - Natural language food query
 * @returns { success: boolean, query: string, criteria: object, recommendations: array }
 */
export const recommendFood = async (req, res) => {
    try {
        // const limit = parseInt(req.body.limit) || 5;
        const mongoQuery = req.mongoQuery || {};

        // Get recommendations with some intelligence
        // For example, if they want high protein, sort by protein descending
        let sortCriteria = {};

        if (req.parsedCriteria.protein?.min) {
            sortCriteria.protein = -1; // High protein first
        } else if (req.parsedCriteria.calories?.max) {
            sortCriteria.calories = 1; // Low calories first
        } else if (req.parsedCriteria.totalFat?.max) {
            sortCriteria.totalFat = 1; // Low fat first
        }

        const recommendations = await FastFoodItem.find(mongoQuery)
            .sort(sortCriteria)
            // .limit(limit)
            .lean();

        return res.status(200).json({
            success: true,
            query: req.body.query,
            criteria: req.parsedCriteria,
            recommendations: recommendations,
            count: recommendations.length,
            message: `Here are ${recommendations.length} recommendations based on your preferences`,
        });
    } catch (error) {
        console.error("Recommend Food Error:", error);
        return res.status(500).json({
            success: false,
            error: "Failed to get recommendations",
            message: error.message,
        });
    }
};