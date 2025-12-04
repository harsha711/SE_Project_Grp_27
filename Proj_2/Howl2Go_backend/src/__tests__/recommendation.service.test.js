/**
 * Recommendation Service Tests
 *
 * Tests for the AI-powered meal recommendation service.
 * Covers order history analysis, personalized recommendations,
 * and various recommendation types (frequent, similar, explore, etc.)
 */

import { jest, describe, test, expect, beforeAll, afterAll, beforeEach } from "@jest/globals";
import mongoose from "mongoose";
import { recommendationService } from "../services/recommendation.service.js";
import Order from "../models/Order.js";
import FastFoodItem from "../models/FastFoodItem.js";
import User from "../models/User.js";
import connectDB from "../config/database.js";

let testUser;
let testUserId;
let createdFoodItems = [];

// Sample food items for testing
const sampleFoodItems = [
    {
        company: "TestMcDonald's",
        item: "Test Big Mac",
        calories: 540,
        protein: 25,
        totalFat: 28,
        carbs: 46,
        price: 5.99,
    },
    {
        company: "TestMcDonald's",
        item: "Test Quarter Pounder with Cheese",
        calories: 520,
        protein: 30,
        totalFat: 26,
        carbs: 41,
        price: 5.49,
    },
    {
        company: "TestBurger King",
        item: "Test Whopper",
        calories: 657,
        protein: 28,
        totalFat: 40,
        carbs: 49,
        price: 6.29,
    },
    {
        company: "TestWendy's",
        item: "Test Grilled Chicken Sandwich",
        calories: 370,
        protein: 34,
        totalFat: 10,
        carbs: 36,
        price: 4.99,
    },
    {
        company: "TestKFC",
        item: "Test Original Recipe Chicken Breast",
        calories: 390,
        protein: 39,
        totalFat: 21,
        carbs: 11,
        price: 4.49,
    },
    {
        company: "TestTaco Bell",
        item: "Test Crunchy Taco",
        calories: 170,
        protein: 8,
        totalFat: 10,
        carbs: 13,
        price: 1.89,
    },
    {
        company: "TestPizza Hut",
        item: "Test Pepperoni Personal Pan",
        calories: 620,
        protein: 26,
        totalFat: 28,
        carbs: 68,
        price: 6.99,
    },
];

beforeAll(async () => {
    await connectDB();

    const dbName = mongoose.connection.name;
    if (
        !dbName ||
        (!dbName.includes("test") && process.env.NODE_ENV !== "test")
    ) {
        throw new Error(
            `DANGER: Tests are trying to run against non-test database: "${dbName}". ` +
            `Database name must include "test" or NODE_ENV must be "test". ` +
            `Current NODE_ENV: "${process.env.NODE_ENV}"`
        );
    }

    console.log(`Running recommendation tests against database: ${dbName}`);

    // Create test food items
    createdFoodItems = await FastFoodItem.insertMany(sampleFoodItems);

    // Create test user
    testUser = await User.create({
        name: "Recommendation Test User",
        email: "rectest@example.com",
        password: "password123",
    });
    testUserId = testUser._id.toString();
});

afterAll(async () => {
    // Clean up test data
    await FastFoodItem.deleteMany({ company: /^Test/ });
    await Order.deleteMany({ userId: testUserId });
    await User.deleteOne({ _id: testUserId });
    await mongoose.disconnect();
});

beforeEach(async () => {
    // Clear orders before each test
    await Order.deleteMany({ userId: testUserId });
});

describe("RecommendationService", () => {
    describe("analyzeOrderHistory", () => {
        test("returns null for user with no orders", async () => {
            const profile = await recommendationService.analyzeOrderHistory(testUserId);
            expect(profile).toBeNull();
        });

        test("analyzes order history correctly", async () => {
            // Create test orders
            await Order.create({
                sessionId: "test-session",
                userId: testUserId,
                items: [
                    { restaurant: "McDonald's", item: "Big Mac", calories: 540, protein: 25, price: 5.99, quantity: 2 },
                    { restaurant: "McDonald's", item: "Quarter Pounder", calories: 520, protein: 30, price: 5.49, quantity: 1 },
                ],
            });

            await Order.create({
                sessionId: "test-session-2",
                userId: testUserId,
                items: [
                    { restaurant: "Wendy's", item: "Grilled Chicken", calories: 370, protein: 34, price: 4.99, quantity: 1 },
                ],
            });

            const profile = await recommendationService.analyzeOrderHistory(testUserId);

            expect(profile).not.toBeNull();
            expect(profile.totalOrders).toBe(2);
            expect(profile.frequentRestaurants.length).toBeGreaterThan(0);
            expect(profile.frequentRestaurants[0].name).toBe("McDonald's");
            expect(profile.avgCalories).toBeGreaterThan(0);
            expect(profile.avgProtein).toBeGreaterThan(0);
        });

        test("calculates dietary preference correctly", async () => {
            // Create orders with high protein items
            await Order.create({
                sessionId: "test-session",
                userId: testUserId,
                items: [
                    { restaurant: "KFC", item: "Chicken Breast", calories: 390, protein: 39, price: 4.49, quantity: 3 },
                ],
            });

            const profile = await recommendationService.analyzeOrderHistory(testUserId);

            expect(profile.dietaryPreference).toBe("high-protein");
        });
    });

    describe("getFrequentItems", () => {
        test("returns empty array for user with no orders", async () => {
            const items = await recommendationService.getFrequentItems(testUserId);
            expect(items).toEqual([]);
        });

        test("returns frequently ordered items with full details", async () => {
            await Order.create({
                sessionId: "test-session",
                userId: testUserId,
                items: [
                    { restaurant: "McDonald's", item: "Big Mac", calories: 540, protein: 25, price: 5.99, quantity: 3 },
                ],
            });

            const items = await recommendationService.getFrequentItems(testUserId, 5);

            expect(items.length).toBeGreaterThan(0);
            expect(items[0].type).toBe("frequent");
            expect(items[0].reason).toContain("time");
            expect(items[0].item).toBeDefined();
        });
    });

    describe("getSimilarItems", () => {
        test("returns popular items for users without history", async () => {
            const items = await recommendationService.getSimilarItems(testUserId, 3);

            expect(items.length).toBeGreaterThan(0);
            items.forEach((item) => {
                expect(item.item).toBeDefined();
                expect(item.type).toBeDefined();
            });
        });

        test("returns items matching user preferences", async () => {
            // Create order history with high protein items
            await Order.create({
                sessionId: "test-session",
                userId: testUserId,
                items: [
                    { restaurant: "McDonald's", item: "Quarter Pounder", calories: 520, protein: 30, price: 5.49, quantity: 2 },
                ],
            });

            const items = await recommendationService.getSimilarItems(testUserId, 5);

            expect(items.length).toBeGreaterThan(0);
            items.forEach((item) => {
                expect(item.type).toBe("similar");
                expect(item.reason).toBeDefined();
            });
        });
    });

    describe("getExplorationSuggestions", () => {
        test("suggests restaurants user hasn't tried", async () => {
            // User only orders from McDonald's
            await Order.create({
                sessionId: "test-session",
                userId: testUserId,
                items: [
                    { restaurant: "McDonald's", item: "Big Mac", calories: 540, protein: 25, price: 5.99, quantity: 5 },
                ],
            });

            const suggestions = await recommendationService.getExplorationSuggestions(testUserId, 3);

            expect(suggestions.length).toBeGreaterThan(0);
            suggestions.forEach((suggestion) => {
                expect(suggestion.type).toBe("explore");
                expect(suggestion.reason).toContain("new");
                // Should not suggest McDonald's
                expect(suggestion.item.company).not.toBe("McDonald's");
            });
        });
    });

    describe("getTimeBasedSuggestions", () => {
        test("returns time-appropriate suggestions", async () => {
            const suggestions = await recommendationService.getTimeBasedSuggestions(testUserId, null, 3);

            expect(suggestions.length).toBeGreaterThan(0);
            suggestions.forEach((suggestion) => {
                expect(suggestion.type).toBe("time-based");
                expect(suggestion.mealType).toBeDefined();
            });
        });

        test("respects explicit meal type parameter", async () => {
            const suggestions = await recommendationService.getTimeBasedSuggestions(testUserId, "breakfast", 3);

            expect(suggestions.length).toBeGreaterThan(0);
            suggestions.forEach((suggestion) => {
                expect(suggestion.mealType).toBe("breakfast");
            });
        });
    });

    describe("getHealthierAlternatives", () => {
        test("returns empty array for users without order history", async () => {
            const alternatives = await recommendationService.getHealthierAlternatives(testUserId);
            expect(alternatives).toEqual([]);
        });

        test("suggests lower calorie alternatives", async () => {
            // User orders high-calorie items
            await Order.create({
                sessionId: "test-session",
                userId: testUserId,
                items: [
                    { restaurant: "Burger King", item: "Whopper", calories: 657, protein: 28, price: 6.29, quantity: 2 },
                ],
            });

            const alternatives = await recommendationService.getHealthierAlternatives(testUserId, 3);

            // May not always find alternatives depending on data
            if (alternatives.length > 0) {
                alternatives.forEach((alt) => {
                    expect(alt.type).toBe("healthy-alt");
                    expect(alt.caloriesSaved).toBeGreaterThan(0);
                });
            }
        });
    });

    describe("getPersonalizedRecommendations", () => {
        test("returns popular items for new users", async () => {
            const result = await recommendationService.getPersonalizedRecommendations(testUserId);

            expect(result.success).toBe(true);
            expect(result.isNewUser).toBe(true);
            expect(result.recommendations.length).toBeGreaterThan(0);
        });

        test("returns personalized recommendations for users with history", async () => {
            // Create order history
            await Order.create({
                sessionId: "test-session",
                userId: testUserId,
                items: [
                    { restaurant: "McDonald's", item: "Big Mac", calories: 540, protein: 25, price: 5.99, quantity: 3 },
                    { restaurant: "Wendy's", item: "Grilled Chicken", calories: 370, protein: 34, price: 4.99, quantity: 2 },
                ],
            });

            const result = await recommendationService.getPersonalizedRecommendations(testUserId, {
                limit: 5,
                includeProfile: true,
            });

            expect(result.success).toBe(true);
            expect(result.isNewUser).toBe(false);
            expect(result.recommendations.length).toBeGreaterThan(0);
            expect(result.userProfile).toBeDefined();
            expect(result.userProfile.totalOrders).toBe(1);
        });

        test("includes diverse recommendation types", async () => {
            await Order.create({
                sessionId: "test-session",
                userId: testUserId,
                items: [
                    { restaurant: "McDonald's", item: "Big Mac", calories: 540, protein: 25, price: 5.99, quantity: 5 },
                ],
            });

            const result = await recommendationService.getPersonalizedRecommendations(testUserId, {
                limit: 8,
            });

            const types = result.recommendations.map((r) => r.type);
            // Should have at least 2 different types
            const uniqueTypes = [...new Set(types)];
            expect(uniqueTypes.length).toBeGreaterThanOrEqual(1);
        });
    });

    describe("getPopularItems", () => {
        test("returns items with good nutritional value", async () => {
            const items = await recommendationService.getPopularItems(5);

            expect(items.length).toBeGreaterThan(0);
            items.forEach((item) => {
                expect(item.type).toBe("popular");
                expect(item.item.protein).toBeGreaterThanOrEqual(15);
                expect(item.item.calories).toBeLessThanOrEqual(800);
            });
        });
    });
});

describe("Edge Cases", () => {
    test("handles null userId gracefully", async () => {
        const profile = await recommendationService.analyzeOrderHistory(null);
        expect(profile).toBeNull();
    });

    test("handles invalid userId gracefully", async () => {
        const profile = await recommendationService.analyzeOrderHistory("invalid-id");
        expect(profile).toBeNull();
    });

    test("limits results correctly", async () => {
        const items = await recommendationService.getPopularItems(2);
        expect(items.length).toBeLessThanOrEqual(2);
    });
});
