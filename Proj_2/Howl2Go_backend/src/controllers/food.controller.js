import FastFoodItem from "../models/FastFoodItem.js";

/**
 * Calculate price based on calories
 * Formula: ~$0.01 per calorie, min $2.00, max $15.00
 *
 * @param {number} calories - Calorie count
 * @returns {number} - Calculated price
 */
const calculatePrice = (calories) => {
    if (!calories || calories <= 0) return 2.0;
    const basePrice = calories * 0.01;
    return Math.min(Math.max(basePrice, 2.0), 15.0);
};

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
        } else if (req.parsedCriteria.price?.max) {
            sortCriteria.calories = 1; // Low price (via low calories) first
        } else if (req.parsedCriteria.price?.min) {
            sortCriteria.calories = -1; // High price (via high calories) first
        }

        const recommendations = await FastFoodItem.find(mongoQuery)
            .sort(sortCriteria)
            // .limit(limit)
            .lean();

        // Add calculated price to each recommendation
        const recommendationsWithPrice = recommendations.map(item => ({
            ...item,
            price: calculatePrice(item.calories)
        }));

        return res.status(200).json({
            success: true,
            query: req.body.query,
            criteria: req.parsedCriteria,
            recommendations: recommendationsWithPrice,
            count: recommendationsWithPrice.length,
            message: `Here are ${recommendationsWithPrice.length} recommendations based on your preferences`,
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