import FastFoodItem from "../models/FastFoodItem.js";

/**
 * Parse natural language query and return structured criteria
 * Uses LLM middleware to parse the query
 *
 * @route POST /api/food/parse
 * @body { query: string } - Natural language food query
 * @returns { success: boolean, query: string, criteria: object }
 */
export const parseQuery = async (req, res) => {
    try {
        // Criteria is already parsed by middleware
        return res.status(200).json({
            success: true,
            query: req.body.query,
            criteria: req.parsedCriteria,
            message: "Query parsed successfully",
        });
    } catch (error) {
        console.error("Parse Query Error:", error);
        return res.status(500).json({
            success: false,
            error: "Failed to parse query",
            message: error.message,
        });
    }
};

/**
 * Search for food items based on natural language query
 * Uses LLM to parse query, then searches MongoDB
 *
 * @route POST /api/food/search
 * @body { query: string, limit?: number, page?: number } - Natural language food query with pagination
 * @returns { success: boolean, query: string, criteria: object, results: array, pagination: object }
 */
export const searchFood = async (req, res) => {
    try {
        // Get pagination parameters
        const limit = parseInt(req.body.limit) || 10;
        const page = parseInt(req.body.page) || 1;
        const skip = (page - 1) * limit;

        // MongoDB query is already built by middleware
        const mongoQuery = req.mongoQuery || {};

        // Execute the search
        const results = await FastFoodItem.find(mongoQuery)
            .limit(limit)
            .skip(skip)
            .lean();

        // Get total count for pagination
        const total = await FastFoodItem.countDocuments(mongoQuery);

        return res.status(200).json({
            success: true,
            query: req.body.query,
            criteria: req.parsedCriteria,
            results: results,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit),
            },
            message: `Found ${results.length} items matching your criteria`,
        });
    } catch (error) {
        console.error("Search Food Error:", error);
        return res.status(500).json({
            success: false,
            error: "Failed to search food items",
            message: error.message,
        });
    }
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
        } else if (req.parsedCriteria.fat?.max) {
            sortCriteria.total_fat = 1; // Low fat first
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

/**
 * Get statistics about available food items matching criteria
 *
 * @route POST /api/food/stats
 * @body { query: string } - Natural language food query
 * @returns { success: boolean, criteria: object, stats: object }
 */
export const getFoodStats = async (req, res) => {
    try {
        const mongoQuery = req.mongoQuery || {};

        // Get items matching criteria
        const items = await FastFoodItem.find(mongoQuery).lean();

        if (items.length === 0) {
            return res.status(200).json({
                success: true,
                query: req.body.query,
                criteria: req.parsedCriteria,
                stats: {
                    count: 0,
                    message: "No items found matching your criteria",
                },
            });
        }

        // Calculate statistics
        const stats = {
            count: items.length,
            averages: {
                calories: Math.round(
                    items.reduce((sum, item) => sum + (item.calories || 0), 0) /
                        items.length
                ),
                protein: Math.round(
                    items.reduce((sum, item) => sum + (item.protein || 0), 0) /
                        items.length
                ),
                fat: Math.round(
                    items.reduce(
                        (sum, item) => sum + (item.total_fat || 0),
                        0
                    ) / items.length
                ),
                carbs: Math.round(
                    items.reduce(
                        (sum, item) => sum + (item.total_carb || 0),
                        0
                    ) / items.length
                ),
            },
            ranges: {
                calories: {
                    min: Math.min(...items.map((item) => item.calories || 0)),
                    max: Math.max(...items.map((item) => item.calories || 0)),
                },
                protein: {
                    min: Math.min(...items.map((item) => item.protein || 0)),
                    max: Math.max(...items.map((item) => item.protein || 0)),
                },
            },
        };

        return res.status(200).json({
            success: true,
            query: req.body.query,
            criteria: req.parsedCriteria,
            stats: stats,
            message: `Statistics for ${items.length} items matching your criteria`,
        });
    } catch (error) {
        console.error("Get Food Stats Error:", error);
        return res.status(500).json({
            success: false,
            error: "Failed to get statistics",
            message: error.message,
        });
    }
};
