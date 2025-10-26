import Groq from "groq-sdk";
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
        return `Your goal is to extract nutritional and taste-based information from user prompts in the form of a structured json object.
For example, the user might ask 'I want to eat something that has at least 30g of protein, less than 500 calories, and is pretty spicy.'
The response should be a json object with the following fields:
{
"spice_level": {"min": 3},
"calories": {"max": 500},
"protein": {"min": 30},
"item": {"name": "burger"}
}
Respond only with the json object and nothing else. If a field is not mentioned in the prompt, it should be omitted from the response.

IMPORTANT: When the user mentions a specific food item name (like "burger", "Big Mac", "chicken sandwich", "salad", etc.), include it in the response as:
{"item": {"name": "food_name"}}

You may include both "min" and "max" if the user specifies a range (for example, "between 400 and 600 calories" → "calories": {"min": 400, "max": 600}).

Assume these default units (convert if necessary):

calories → kcal

fats/protein/carbs/fiber/sugars → grams (g)

sodium/cholesterol → milligrams (mg)

Here are some examples:
User prompt: "I want a meal with at least 20g of fiber and low sugar."
Response: {"fiber": {"min": 20}, "sugar": {"max": 10}}

User prompt: "Give me a dessert that's not too sweet and has under 300 calories."
Response: {"sugar": {"max": 15}, "calories": {"max": 300}}

User prompt: "Between 400 and 600 calories, high protein, no sugar."
Response: {"calories": {"min": 400, "max": 600}, "protein": {"min": 20}, "sugar": {"max": 0}}

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
     * Convert LLM criteria to MongoDB query
     * @param {Object} criteria - Parsed criteria from LLM
     * @returns {Object} - MongoDB query object
     */
    buildMongoQuery(criteria) {
        const query = {};

        // Map of criteria fields to database fields
        const fieldMapping = {
            company: "company",
            item: "item",
            calories: "calories",
            protein: "protein",
            fat: "total_fat",
            carbs: "total_carb",
            fiber: "fiber",
            sugar: "sugar",
            sodium: "sodium",
            cholesterol: "cholesterol",
            saturated_fat: "sat_fat",
            trans_fat: "trans_fat",
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
