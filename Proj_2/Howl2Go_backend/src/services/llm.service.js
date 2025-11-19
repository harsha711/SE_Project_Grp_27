import Groq from "groq-sdk/index.mjs";
import { config } from "../config/env.js";

/**
 * LLM Service for parsing natural language food queries
 * Converts user prompts into structured nutritional criteria
 */

class LLMService {
    constructor() {
        this.client = null;
        this.model = "llama-3.1-8b-instant";
        this.initialized = false;
    }

    /**
     * Initialize the Groq client
     * @throws {Error} if GROQ_API_KEY is not set
     */
    initialize() {
        if (this.initialized) {
            return;
        }

        const apiKey = config.groq.apiKey;
        if (!apiKey) {
            throw new Error(
                "GROQ_API_KEY environment variable is not set. " +
                    "Please set it in your .env file: GROQ_API_KEY=your-key-here"
            );
        }

        this.client = new Groq({ apiKey });
        this.initialized = true;
    }

    /**
     * Build the prompt for the LLM
     * @param {string} userPrompt - The user's natural language query
     * @returns {string} - Formatted prompt for the LLM
     */
    buildPrompt(userPrompt) {
        return `Your goal is to extract nutritional, taste-based, and price information from user prompts in the form of a structured json object.
For example, the user might ask 'I want to eat something that has at least 30g of protein, less than 500 calories, is pretty spicy, and costs under $8.'
The response should be a json object with the following fields:
{
"spice_level": {"min": 3},
"calories": {"max": 500},
"protein": {"min": 30},
"price": {"max": 8},
"item": {"name": "burger"}
}
Respond only with the json object and nothing else. If a field is not mentioned in the prompt, it should be omitted from the response.

IMPORTANT: When the user mentions a specific food item name (like "burger", "Big Mac", "chicken sandwich", "salad", etc.), include it in the response as:
{"item": {"name": "food_name"}}
Items names do not necessarily have to be exact items, they can be generic food types as well (like "chicken", "fried chicken", "taco", "pizza" etc.)

You may include both "min" and "max" if the user specifies a range (for example, "between 400 and 600 calories" → "calories": {"min": 400, "max": 600}).

Assume these default units (convert if necessary):

calories → kcal

fats/protein/carbs/fiber/sugars → grams (g)

sodium/cholesterol → milligrams (mg)

price → USD ($) - extract numeric value only (e.g., "$5" or "5 dollars" → 5)

Here are some examples:
User prompt: "I want a meal with at least 20g of fiber and low sugar."
Response: {"fiber": {"min": 20}, "sugars": {"max": 10}}

User prompt: "Give me a dessert that's not too sweet and has under 300 calories."
Response: {"sugars": {"max": 15}, "calories": {"max": 300}}

User prompt: "Between 400 and 600 calories, high protein, no sugar."
Response: {"calories": {"min": 400, "max": 600}, "protein": {"min": 20}, "sugars": {"max": 0}}

User prompt: "Cheap meal under $5"
Response: {"price": {"max": 5}}

User prompt: "Show me meals between $8 and $12"
Response: {"price": {"min": 8, "max": 12}}

User prompt: "High protein lunch under $10"
Response: {"protein": {"min": 20}, "price": {"max": 10}}

User prompt: "Budget-friendly healthy meal"
Response: {"price": {"max": 7}, "calories": {"max": 600}}

User prompt: "Show me Big Mac nutritional information"
Response: {"item": {"name": "Big Mac"}}

User prompt: "I want a burger with high protein"
Response: {"item": {"name": "burger"}, "protein": {"min": 20}}

User prompt: "Find chicken sandwiches under 400 calories"
Response: {"item": {"name": "chicken sandwich"}, "calories": {"max": 400}}

Sample fields that are available in the database:
company:"McDonald's"
item:"Big N' Tasty with Cheese"
calories:510
caloriesFromFat:250
totalFat:28
saturatedFat:11
transFat:1.5
cholesterol:85
sodium:960
carbs:38
fiber:3
sugars:8
protein:27
weightWatchersPoints:502

Companies:
McDonald's,
Burger King,
Wendy's,
KFC,
Taco Bell,
Pizza Hut

If the user prompt is not related to food or nutrition, respond with an empty json object: {} and nothing else.

Now, here is the user prompt: ${userPrompt}
`;
    }

    /**
     * Parse natural language query into structured criteria
     * @param {string} userPrompt - The user's natural language query
     * @returns {Promise<Object>} - Parsed nutritional criteria as JSON object
     * @throws {Error} if API call fails or response is invalid
     */
    async parseQuery(userPrompt) {
        this.initialize();

        if (!userPrompt || typeof userPrompt !== "string") {
            throw new Error("User prompt must be a non-empty string");
        }

        try {
            const response = await this.client.chat.completions.create({
                model: this.model,
                messages: [
                    {
                        role: "system",
                        content:
                            "You are a helpful assistant that extracts nutritional requirements from natural language and outputs only valid JSON.",
                    },
                    {
                        role: "user",
                        content: this.buildPrompt(userPrompt),
                    },
                ],
                temperature: 0.1,
                max_tokens: 500,
            });

            const content = response.choices[0].message.content;

            // Parse the JSON response
            let parsedCriteria;
            try {
                parsedCriteria = JSON.parse(content);
            } catch (parseError) {
                throw new Error(
                    `Failed to parse LLM response as JSON: ${content}`
                );
            }

            return {
                success: true,
                criteria: parsedCriteria,
                rawResponse: content,
            };
        } catch (error) {
            console.error("LLM Service Error:", error);
            throw new Error(`Failed to parse query: ${error.message}`);
        }
    }

    /**
     * Convert price to calorie range (since price is calculated from calories)
     * Formula: price = calories * 0.01, min $2.00, max $15.00
     * @param {number} price - Price constraint
     * @returns {number} - Equivalent calorie value
     */
    priceToCalories(price) {
        // Reverse the formula: calories = price / 0.01
        return price / 0.01;
    }

    /**
     * Convert LLM criteria to MongoDB query
     * @param {Object} criteria - Parsed criteria from LLM
     * @returns {Object} - MongoDB query object
     */
    buildMongoQuery(criteria) {
        const query = {};

        // Handle price separately since it's calculated from calories
        if (criteria.price) {
            const priceConstraint = criteria.price;
            const calorieConstraint = {};

            if (priceConstraint.min !== undefined) {
                // Min price → Min calories
                // But account for the $2 minimum price (200 calories)
                const minCalories = Math.max(this.priceToCalories(priceConstraint.min), 200);
                calorieConstraint.$gte = minCalories;
            }
            
            if (priceConstraint.max !== undefined) {
                // Max price → Max calories
                // But account for the $15 maximum price (1500 calories)
                const maxCalories = Math.min(this.priceToCalories(priceConstraint.max), 1500);
                calorieConstraint.$lte = maxCalories;
            }

            // Merge with existing calorie constraints if any
            if (criteria.calories) {
                const existingCalories = criteria.calories;
                if (existingCalories.min !== undefined) {
                    calorieConstraint.$gte = Math.max(
                        calorieConstraint.$gte || 0,
                        existingCalories.min
                    );
                }
                if (existingCalories.max !== undefined) {
                    calorieConstraint.$lte = Math.min(
                        calorieConstraint.$lte || Infinity,
                        existingCalories.max
                    );
                }
            }

            if (Object.keys(calorieConstraint).length > 0) {
                query.calories = calorieConstraint;
            }
        }

        // Map of criteria fields to database fields (excluding price and calories)
        const fieldMapping = {
            company: "company",
            item: "item",
            calories: "calories",
            protein: "protein",
            totalFat: "totalFat",
            carbs: "carbs",
            fiber: "fiber",
            sugars: "sugars",
            sodium: "sodium",
            cholesterol: "cholesterol",
            saturatedFat: "saturatedFat",
            transFat: "transFat",
            caloriesFromFat: "caloriesFromFat",
        };

        for (const [criteriaField, dbField] of Object.entries(fieldMapping)) {
            if (criteria[criteriaField]) {
                // Handle text-based fields (company and item) with regex search
                if (criteriaField === "company" || criteriaField === "item") {
                    const constraint = criteria[criteriaField];
                    // If it has a 'name' property, do a case-insensitive regex search
                    if (constraint.name) {
                        query[dbField] = {
                            $regex: constraint.name,
                            $options: "i", // case-insensitive
                        };
                    }
                    continue;
                }
                
                // Skip calories if already handled by price conversion
                if (criteriaField === "calories" && criteria.price) {
                    continue;
                }
                
                const constraint = criteria[criteriaField];

                if (
                    constraint.min !== undefined &&
                    constraint.max !== undefined
                ) {
                    query[dbField] = {
                        $gte: constraint.min,
                        $lte: constraint.max,
                    };
                } else if (constraint.min !== undefined) {
                    query[dbField] = { $gte: constraint.min };
                } else if (constraint.max !== undefined) {
                    query[dbField] = { $lte: constraint.max };
                }
            }
        }

        return query;
    }
}

// Export singleton instance
export const llmService = new LLMService();
