/**
 * Recommendation Service
 *
 * Provides AI-powered personalized food recommendations based on user order history.
 * Analyzes ordering patterns, preferences, and uses LLM to generate intelligent suggestions.
 *
 * Features:
 * - Analyze order history patterns (frequent restaurants, avg calories, protein preference)
 * - Generate personalized recommendations using Groq LLM
 * - Time-based suggestions (breakfast/lunch/dinner)
 * - "Try something new" exploration suggestions
 * - Similar item recommendations
 *
 * @author AI Meal Suggestions Feature
 */

import Groq from "groq-sdk/index.mjs";
import { config } from "../config/env.js";
import Order from "../models/Order.js";
import FastFoodItem from "../models/FastFoodItem.js";

class RecommendationService {
    constructor() {
        this.client = null;
        this.model = "llama-3.1-8b-instant";
        this.initialized = false;
    }

    /**
     * Initialize the Groq client
     */
    initialize() {
        if (this.initialized) return;

        const apiKey = config.groq?.apiKey;
        if (!apiKey) {
            console.warn("GROQ_API_KEY not set - AI recommendations will use fallback logic");
            return;
        }

        this.client = new Groq({ apiKey });
        this.initialized = true;
    }

    /**
     * Analyze user's order history and extract patterns
     * @param {string} userId - User's MongoDB ObjectId
     * @returns {Promise<Object>} - User profile with ordering patterns
     */
    async analyzeOrderHistory(userId) {
        if (!userId) {
            return null;
        }

        const orders = await Order.find({ userId })
            .sort({ createdAt: -1 })
            .limit(50) // Analyze last 50 orders
            .lean();

        if (!orders || orders.length === 0) {
            return null;
        }

        // Extract all items from orders
        const allItems = orders.flatMap(order => order.items || []);

        if (allItems.length === 0) {
            return null;
        }

        // Calculate restaurant frequencies
        const restaurantCounts = {};
        allItems.forEach(item => {
            const restaurant = item.restaurant || item.snapshot?.company || "Unknown";
            restaurantCounts[restaurant] = (restaurantCounts[restaurant] || 0) + (item.quantity || 1);
        });

        const totalItems = Object.values(restaurantCounts).reduce((sum, count) => sum + count, 0);
        const frequentRestaurants = Object.entries(restaurantCounts)
            .map(([name, count]) => ({
                name,
                count,
                percentage: Math.round((count / totalItems) * 100)
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        // Calculate nutritional averages
        let totalCalories = 0;
        let totalProtein = 0;
        let totalPrice = 0;
        let itemCount = 0;

        allItems.forEach(item => {
            const qty = item.quantity || 1;
            totalCalories += (item.calories || item.snapshot?.calories || 0) * qty;
            totalProtein += (item.protein || item.snapshot?.protein || 0) * qty;
            totalPrice += (item.price || item.snapshot?.price || 0) * qty;
            itemCount += qty;
        });

        const avgCalories = itemCount > 0 ? Math.round(totalCalories / itemCount) : 0;
        const avgProtein = itemCount > 0 ? Math.round(totalProtein / itemCount) : 0;
        const avgPrice = itemCount > 0 ? Math.round((totalPrice / itemCount) * 100) / 100 : 0;

        // Extract frequently ordered items
        const itemCounts = {};
        allItems.forEach(item => {
            const itemName = item.item || item.snapshot?.item || "Unknown";
            const key = `${item.restaurant || item.snapshot?.company}:${itemName}`;
            itemCounts[key] = (itemCounts[key] || 0) + (item.quantity || 1);
        });

        const frequentItems = Object.entries(itemCounts)
            .map(([key, count]) => {
                const [restaurant, itemName] = key.split(":");
                return { restaurant, item: itemName, count };
            })
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

        // Determine dietary preference
        let dietaryPreference = "balanced";
        if (avgProtein >= 25) dietaryPreference = "high-protein";
        else if (avgCalories <= 400) dietaryPreference = "low-calorie";
        else if (avgCalories >= 700) dietaryPreference = "hearty";

        // Get order times for time-based patterns
        const orderTimes = orders.map(order => {
            const date = new Date(order.createdAt);
            return date.getHours();
        });

        const timeCounts = { morning: 0, afternoon: 0, evening: 0, night: 0 };
        orderTimes.forEach(hour => {
            if (hour >= 5 && hour < 11) timeCounts.morning++;
            else if (hour >= 11 && hour < 15) timeCounts.afternoon++;
            else if (hour >= 15 && hour < 21) timeCounts.evening++;
            else timeCounts.night++;
        });

        return {
            userId,
            totalOrders: orders.length,
            totalItemsOrdered: itemCount,
            frequentRestaurants,
            frequentItems,
            avgCalories,
            avgProtein,
            avgPrice,
            dietaryPreference,
            orderTimePatterns: timeCounts,
            lastOrderDate: orders[0]?.createdAt || null,
            allRestaurantsOrdered: [...new Set(Object.keys(restaurantCounts))]
        };
    }

    /**
     * Get frequently ordered items for a user
     * @param {string} userId - User's MongoDB ObjectId
     * @param {number} limit - Number of items to return
     * @returns {Promise<Array>} - Array of frequently ordered items with full details
     */
    async getFrequentItems(userId, limit = 5) {
        const profile = await this.analyzeOrderHistory(userId);

        if (!profile || !profile.frequentItems || profile.frequentItems.length === 0) {
            return [];
        }

        // Get full item details from database
        const frequentItemDetails = [];

        for (const freqItem of profile.frequentItems.slice(0, limit)) {
            const item = await FastFoodItem.findOne({
                company: { $regex: new RegExp(freqItem.restaurant, 'i') },
                item: { $regex: new RegExp(freqItem.item, 'i') }
            }).lean();

            if (item) {
                frequentItemDetails.push({
                    item,
                    orderCount: freqItem.count,
                    reason: `You've ordered this ${freqItem.count} time${freqItem.count > 1 ? 's' : ''} - one of your favorites!`,
                    type: "frequent",
                    confidence: Math.min(95, 70 + freqItem.count * 5)
                });
            }
        }

        return frequentItemDetails;
    }

    /**
     * Get items similar to user's preferences
     * @param {string} userId - User's MongoDB ObjectId
     * @param {number} limit - Number of items to return
     * @returns {Promise<Array>} - Array of similar items
     */
    async getSimilarItems(userId, limit = 5) {
        const profile = await this.analyzeOrderHistory(userId);

        if (!profile) {
            return this.getPopularItems(limit);
        }

        // Build query based on user preferences
        const query = {};

        // Match user's calorie range (±20%)
        if (profile.avgCalories > 0) {
            query.calories = {
                $gte: Math.round(profile.avgCalories * 0.8),
                $lte: Math.round(profile.avgCalories * 1.2)
            };
        }

        // Match protein preference for high-protein users
        if (profile.dietaryPreference === "high-protein" && profile.avgProtein > 0) {
            query.protein = { $gte: Math.round(profile.avgProtein * 0.8) };
        }

        // Exclude items they've already ordered frequently
        const orderedItemNames = profile.frequentItems.map(fi => fi.item);
        if (orderedItemNames.length > 0) {
            query.item = { $nin: orderedItemNames.map(name => new RegExp(name, 'i')) };
        }

        const items = await FastFoodItem.find(query)
            .limit(limit * 2)
            .lean();

        // Score and sort items
        const scoredItems = items.map(item => {
            let score = 50;

            // Bonus for matching favorite restaurants
            const isFavoriteRestaurant = profile.frequentRestaurants
                .some(fr => fr.name.toLowerCase() === item.company?.toLowerCase());
            if (isFavoriteRestaurant) score += 20;

            // Bonus for similar nutritional profile
            if (item.protein >= profile.avgProtein) score += 10;
            if (Math.abs(item.calories - profile.avgCalories) <= 100) score += 15;

            return { item, score };
        });

        scoredItems.sort((a, b) => b.score - a.score);

        return scoredItems.slice(0, limit).map(({ item, score }) => ({
            item,
            reason: this.generateSimilarReason(item, profile),
            type: "similar",
            confidence: Math.min(90, score)
        }));
    }

    /**
     * Generate reason text for similar item recommendation
     */
    generateSimilarReason(item, profile) {
        const reasons = [];

        const isFavoriteRestaurant = profile.frequentRestaurants
            .some(fr => fr.name.toLowerCase() === item.company?.toLowerCase());

        if (isFavoriteRestaurant) {
            reasons.push(`from ${item.company}, one of your favorite spots`);
        }

        if (item.protein >= profile.avgProtein && profile.dietaryPreference === "high-protein") {
            reasons.push(`${item.protein}g protein matches your high-protein preference`);
        }

        if (Math.abs(item.calories - profile.avgCalories) <= 50) {
            reasons.push(`similar calorie count to your usual orders`);
        }

        if (reasons.length === 0) {
            reasons.push("matches your taste profile");
        }

        return `Suggested because it's ${reasons.join(" and ")}`;
    }

    /**
     * Get exploration suggestions (items from restaurants user hasn't tried)
     * @param {string} userId - User's MongoDB ObjectId
     * @param {number} limit - Number of items to return
     * @returns {Promise<Array>} - Array of exploration items
     */
    async getExplorationSuggestions(userId, limit = 3) {
        const profile = await this.analyzeOrderHistory(userId);

        // All available restaurants
        const allRestaurants = ["McDonald's", "Burger King", "Wendy's", "KFC", "Taco Bell", "Pizza Hut"];

        // Find restaurants user hasn't tried or rarely orders from
        let unexploredRestaurants = allRestaurants;

        if (profile && profile.allRestaurantsOrdered) {
            unexploredRestaurants = allRestaurants.filter(
                r => !profile.allRestaurantsOrdered.some(
                    ordered => ordered.toLowerCase() === r.toLowerCase()
                )
            );
        }

        // If user has tried all restaurants, suggest from least-ordered ones
        if (unexploredRestaurants.length === 0 && profile) {
            const orderedByFrequency = profile.frequentRestaurants.map(fr => fr.name);
            unexploredRestaurants = allRestaurants.filter(
                r => !orderedByFrequency.slice(0, 3).includes(r)
            );
        }

        // Get highly-rated items from unexplored restaurants
        const query = {};
        if (unexploredRestaurants.length > 0) {
            query.company = { $in: unexploredRestaurants };
        }

        // Match user's nutritional preferences if available
        if (profile) {
            if (profile.avgCalories > 0) {
                query.calories = {
                    $gte: Math.round(profile.avgCalories * 0.7),
                    $lte: Math.round(profile.avgCalories * 1.3)
                };
            }
        }

        // Get items with good protein content (generally popular)
        const items = await FastFoodItem.find(query)
            .sort({ protein: -1 })
            .limit(limit * 3)
            .lean();

        // Shuffle and pick diverse items
        const shuffled = items.sort(() => 0.5 - Math.random());
        const diverse = [];
        const seenRestaurants = new Set();

        for (const item of shuffled) {
            if (!seenRestaurants.has(item.company) && diverse.length < limit) {
                diverse.push(item);
                seenRestaurants.add(item.company);
            }
        }

        return diverse.map(item => ({
            item,
            reason: `Try something new! ${profile?.allRestaurantsOrdered?.includes(item.company)
                ? `You rarely order from ${item.company}`
                : `You haven't explored ${item.company} yet`}`,
            type: "explore",
            confidence: 60 + Math.floor(Math.random() * 15)
        }));
    }

    /**
     * Get time-based suggestions
     * @param {string} userId - User's MongoDB ObjectId
     * @param {string} mealType - Optional: 'breakfast', 'lunch', 'dinner', or auto-detect
     * @returns {Promise<Array>} - Array of time-appropriate items
     */
    async getTimeBasedSuggestions(userId, mealType = null, limit = 3) {
        // Auto-detect meal type based on current time
        if (!mealType) {
            const hour = new Date().getHours();
            if (hour >= 5 && hour < 11) mealType = "breakfast";
            else if (hour >= 11 && hour < 15) mealType = "lunch";
            else if (hour >= 15 && hour < 21) mealType = "dinner";
            else mealType = "late-night";
        }

        const profile = await this.analyzeOrderHistory(userId);

        // Define meal type criteria
        const mealCriteria = {
            breakfast: {
                keywords: ["breakfast", "egg", "pancake", "muffin", "hash brown", "morning"],
                maxCalories: 600,
                message: "Perfect for your morning"
            },
            lunch: {
                keywords: ["sandwich", "wrap", "salad", "burger", "combo"],
                minCalories: 400,
                maxCalories: 800,
                message: "Great for lunch"
            },
            dinner: {
                keywords: ["meal", "combo", "dinner", "family"],
                minCalories: 500,
                message: "Satisfying dinner option"
            },
            "late-night": {
                keywords: ["snack", "fries", "nuggets", "small"],
                maxCalories: 500,
                message: "Perfect late-night snack"
            }
        };

        const criteria = mealCriteria[mealType] || mealCriteria.lunch;

        // Build query
        const query = {};

        if (criteria.minCalories) {
            query.calories = { ...query.calories, $gte: criteria.minCalories };
        }
        if (criteria.maxCalories) {
            query.calories = { ...query.calories, $lte: criteria.maxCalories };
        }

        // Prefer user's favorite restaurants if available
        if (profile && profile.frequentRestaurants.length > 0) {
            const topRestaurants = profile.frequentRestaurants.slice(0, 3).map(r => r.name);
            query.company = { $in: topRestaurants };
        }

        let items = await FastFoodItem.find(query)
            .limit(limit * 3)
            .lean();

        // If not enough items, remove restaurant filter
        if (items.length < limit) {
            delete query.company;
            items = await FastFoodItem.find(query)
                .limit(limit * 3)
                .lean();
        }

        // Filter by keywords in item name
        const keywordMatches = items.filter(item =>
            criteria.keywords.some(kw =>
                item.item?.toLowerCase().includes(kw.toLowerCase())
            )
        );

        const finalItems = keywordMatches.length >= limit
            ? keywordMatches.slice(0, limit)
            : [...keywordMatches, ...items.filter(i => !keywordMatches.includes(i))].slice(0, limit);

        return finalItems.map(item => ({
            item,
            reason: `${criteria.message} - ${item.calories} calories`,
            type: "time-based",
            mealType,
            confidence: 70 + Math.floor(Math.random() * 20)
        }));
    }

    /**
     * Get healthier alternatives to user's frequent items
     * @param {string} userId - User's MongoDB ObjectId
     * @param {number} limit - Number of alternatives to return
     * @returns {Promise<Array>} - Array of healthier alternatives
     */
    async getHealthierAlternatives(userId, limit = 3) {
        const profile = await this.analyzeOrderHistory(userId);

        if (!profile || profile.frequentItems.length === 0) {
            return [];
        }

        const alternatives = [];

        for (const freqItem of profile.frequentItems.slice(0, limit)) {
            // Find the original item
            const original = await FastFoodItem.findOne({
                company: { $regex: new RegExp(freqItem.restaurant, 'i') },
                item: { $regex: new RegExp(freqItem.item, 'i') }
            }).lean();

            if (!original) continue;

            // Find healthier alternative (lower calories, similar or higher protein)
            const alternative = await FastFoodItem.findOne({
                calories: { $lt: original.calories * 0.85, $gte: original.calories * 0.5 },
                protein: { $gte: original.protein * 0.8 },
                _id: { $ne: original._id }
            })
                .sort({ protein: -1 })
                .lean();

            if (alternative) {
                const caloriesSaved = original.calories - alternative.calories;
                alternatives.push({
                    item: alternative,
                    originalItem: original,
                    reason: `Healthier alternative to ${original.item} - save ${caloriesSaved} calories with ${alternative.protein}g protein`,
                    type: "healthy-alt",
                    confidence: 75 + Math.floor(Math.random() * 15),
                    caloriesSaved
                });
            }
        }

        return alternatives;
    }

    /**
     * Generate AI-powered personalized recommendations using LLM
     * @param {string} userId - User's MongoDB ObjectId
     * @param {number} limit - Number of recommendations
     * @returns {Promise<Array>} - Array of AI-generated recommendations
     */
    async generateAIRecommendations(userId, limit = 5) {
        this.initialize();

        const profile = await this.analyzeOrderHistory(userId);

        // If no LLM client or no profile, fall back to rule-based recommendations
        if (!this.client || !profile) {
            return this.getFallbackRecommendations(userId, limit);
        }

        try {
            const prompt = this.buildRecommendationPrompt(profile);

            const response = await this.client.chat.completions.create({
                model: this.model,
                messages: [
                    {
                        role: "system",
                        content: "You are a helpful food recommendation assistant. Based on user ordering patterns, suggest food items they would enjoy. Respond only with valid JSON."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 800
            });

            const content = response.choices[0].message.content;

            // Parse LLM response
            let suggestions;
            try {
                suggestions = JSON.parse(content);
            } catch {
                console.error("Failed to parse LLM recommendation response:", content);
                return this.getFallbackRecommendations(userId, limit);
            }

            // Convert LLM suggestions to actual database items
            return this.resolveSuggestionsToItems(suggestions, profile, limit);

        } catch (error) {
            console.error("LLM Recommendation Error:", error);
            return this.getFallbackRecommendations(userId, limit);
        }
    }

    /**
     * Build the LLM prompt for personalized recommendations
     */
    buildRecommendationPrompt(profile) {
        const currentHour = new Date().getHours();
        let timeOfDay = "afternoon";
        if (currentHour >= 5 && currentHour < 11) timeOfDay = "morning";
        else if (currentHour >= 11 && currentHour < 15) timeOfDay = "lunch time";
        else if (currentHour >= 15 && currentHour < 21) timeOfDay = "evening";
        else timeOfDay = "late night";

        return `Based on this user's ordering history, suggest 5 food items they would enjoy.

User Profile:
- Total orders: ${profile.totalOrders}
- Favorite restaurants: ${profile.frequentRestaurants.map(r => `${r.name} (${r.percentage}%)`).join(", ")}
- Frequently ordered items: ${profile.frequentItems.slice(0, 5).map(i => i.item).join(", ")}
- Average calories per item: ${profile.avgCalories}
- Average protein per item: ${profile.avgProtein}g
- Dietary preference: ${profile.dietaryPreference}
- Current time: ${timeOfDay}

Available restaurants: McDonald's, Burger King, Wendy's, KFC, Taco Bell, Pizza Hut

Respond with a JSON array of 5 suggestions:
[
  {
    "restaurant": "Restaurant Name",
    "itemKeywords": ["keyword1", "keyword2"],
    "reason": "Brief explanation",
    "type": "frequent|similar|explore|healthy-alt|time-based"
  }
]

Mix of suggestions:
- 2 items similar to their favorites
- 1 healthier alternative
- 1 from a restaurant they rarely visit
- 1 time-appropriate item for ${timeOfDay}`;
    }

    /**
     * Resolve LLM suggestions to actual database items
     */
    async resolveSuggestionsToItems(suggestions, profile, limit) {
        const results = [];

        if (!Array.isArray(suggestions)) {
            return this.getFallbackRecommendations(profile.userId, limit);
        }

        for (const suggestion of suggestions.slice(0, limit)) {
            try {
                const query = { company: { $regex: new RegExp(suggestion.restaurant, 'i') } };

                // Search for items matching keywords
                if (suggestion.itemKeywords && suggestion.itemKeywords.length > 0) {
                    const keywordRegex = suggestion.itemKeywords
                        .map(kw => `(?=.*${kw})`)
                        .join("");
                    query.item = { $regex: new RegExp(keywordRegex, 'i') };
                }

                let item = await FastFoodItem.findOne(query).lean();

                // Fallback: search without keyword constraints
                if (!item) {
                    delete query.item;
                    const items = await FastFoodItem.find(query).limit(5).lean();
                    item = items[Math.floor(Math.random() * items.length)];
                }

                if (item) {
                    results.push({
                        item,
                        reason: suggestion.reason || "Recommended for you",
                        type: suggestion.type || "similar",
                        confidence: 70 + Math.floor(Math.random() * 20)
                    });
                }
            } catch (error) {
                console.error("Error resolving suggestion:", error);
            }
        }

        return results;
    }

    /**
     * Fallback recommendations when LLM is unavailable
     */
    async getFallbackRecommendations(userId, limit = 5) {
        const recommendations = [];

        // Get mix of different recommendation types
        const frequent = await this.getFrequentItems(userId, 2);
        const similar = await this.getSimilarItems(userId, 2);
        const explore = await this.getExplorationSuggestions(userId, 1);

        recommendations.push(...frequent, ...similar, ...explore);

        // If still not enough, add popular items
        if (recommendations.length < limit) {
            const popular = await this.getPopularItems(limit - recommendations.length);
            recommendations.push(...popular);
        }

        return recommendations.slice(0, limit);
    }

    /**
     * Get popular items (fallback for new users)
     */
    async getPopularItems(limit = 5) {
        const items = await FastFoodItem.find({
            protein: { $gte: 15 },
            calories: { $lte: 800 }
        })
            .sort({ protein: -1 })
            .limit(limit)
            .lean();

        return items.map(item => ({
            item,
            reason: "Popular choice with great nutritional value",
            type: "popular",
            confidence: 65
        }));
    }

    /**
     * Get comprehensive personalized recommendations
     * Main entry point for the recommendation API
     * @param {string} userId - User's MongoDB ObjectId
     * @param {Object} options - Options for recommendations
     * @returns {Promise<Object>} - Complete recommendation response
     */
    async getPersonalizedRecommendations(userId, options = {}) {
        const { limit = 8, includeProfile = true } = options;

        const profile = await this.analyzeOrderHistory(userId);

        // For new users with no history
        if (!profile) {
            const popular = await this.getPopularItems(limit);
            return {
                success: true,
                isNewUser: true,
                recommendations: popular,
                message: "Welcome! Here are some popular items to get you started.",
                userProfile: null
            };
        }

        // Get diverse recommendations
        const [aiRecommendations, healthyAlts, timeBased] = await Promise.all([
            this.generateAIRecommendations(userId, Math.ceil(limit * 0.5)),
            this.getHealthierAlternatives(userId, 2),
            this.getTimeBasedSuggestions(userId, null, 2)
        ]);

        // Combine and deduplicate
        const allRecommendations = [...aiRecommendations, ...healthyAlts, ...timeBased];
        const seen = new Set();
        const uniqueRecommendations = allRecommendations.filter(rec => {
            const key = rec.item?._id?.toString() || rec.item?.item;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        }).slice(0, limit);

        return {
            success: true,
            isNewUser: false,
            recommendations: uniqueRecommendations,
            message: `Personalized picks based on your ${profile.totalOrders} orders`,
            userProfile: includeProfile ? {
                totalOrders: profile.totalOrders,
                favoriteRestaurant: profile.frequentRestaurants[0]?.name || null,
                avgCaloriesPerItem: profile.avgCalories,
                avgProteinPerItem: profile.avgProtein,
                dietaryPreference: profile.dietaryPreference,
                topItems: profile.frequentItems.slice(0, 3).map(i => i.item)
            } : null
        };
    }
}

// Export singleton instance
export const recommendationService = new RecommendationService();
