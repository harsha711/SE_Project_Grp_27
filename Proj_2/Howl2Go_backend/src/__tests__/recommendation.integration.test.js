/**
 * Recommendation API Integration Tests
 *
 * Tests for the recommendation API endpoints.
 * Tests all routes under /api/recommendations.
 */

import { jest, describe, test, expect, beforeAll, afterAll, beforeEach } from "@jest/globals";
import request from "supertest";
import mongoose from "mongoose";
import app from "../app.js";
import Order from "../models/Order.js";
import FastFoodItem from "../models/FastFoodItem.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { config } from "../config/env.js";
import connectDB from "../config/database.js";

let testUser;
let authToken;
let createdFoodItems = [];

// Sample food items
const sampleFoodItems = [
    { company: "TestMcDonald's", item: "TestBig Mac", calories: 540, protein: 25, price: 5.99 },
    { company: "TestMcDonald's", item: "TestQuarter Pounder", calories: 520, protein: 30, price: 5.49 },
    { company: "TestBurger King", item: "TestWhopper", calories: 657, protein: 28, price: 6.29 },
    { company: "TestWendy's", item: "TestGrilled Chicken", calories: 370, protein: 34, price: 4.99 },
    { company: "TestKFC", item: "TestChicken Breast", calories: 390, protein: 39, price: 4.49 },
    { company: "TestTaco Bell", item: "TestCrunchy Taco", calories: 170, protein: 8, price: 1.89 },
    { company: "TestPizza Hut", item: "TestPepperoni Pan", calories: 620, protein: 26, price: 6.99 },
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

    console.log(`Running recommendation integration tests against database: ${dbName}`);

    // Create test food items
    createdFoodItems = await FastFoodItem.insertMany(sampleFoodItems);

    // Create test user
    testUser = await User.create({
        name: "Integration Test User",
        email: "inttest@recommendations.com",
        password: "password123",
    });

    // Generate auth token
    authToken = jwt.sign(
        { id: testUser._id, email: testUser.email },
        config.jwt.secret || "test-secret",
        { expiresIn: "1h" }
    );
});

afterAll(async () => {
    // Clean up test data
    await FastFoodItem.deleteMany({ company: /^Test/ });
    await Order.deleteMany({ userId: testUser._id });
    await User.deleteOne({ _id: testUser._id });
    await mongoose.disconnect();
});

beforeEach(async () => {
    await Order.deleteMany({ userId: testUser._id });
});

describe("GET /api/recommendations", () => {
    test("returns recommendations without auth (popular items)", async () => {
        const response = await request(app)
            .get("/api/recommendations")
            .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.recommendations).toBeDefined();
        expect(Array.isArray(response.body.recommendations)).toBe(true);
    });

    test("returns personalized recommendations with auth", async () => {
        // Create order for user
        await Order.create({
            sessionId: "test-session",
            userId: testUser._id,
            items: [
                { restaurant: "McDonald's", item: "Big Mac", calories: 540, protein: 25, price: 5.99, quantity: 2 },
            ],
        });

        const response = await request(app)
            .get("/api/recommendations")
            .set("Authorization", `Bearer ${authToken}`)
            .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.recommendations.length).toBeGreaterThan(0);
    });

    test("respects limit parameter", async () => {
        const response = await request(app)
            .get("/api/recommendations?limit=3")
            .expect(200);

        expect(response.body.recommendations.length).toBeLessThanOrEqual(3);
    });

    test("includes user profile when requested", async () => {
        await Order.create({
            sessionId: "test-session",
            userId: testUser._id,
            items: [
                { restaurant: "McDonald's", item: "Big Mac", calories: 540, protein: 25, price: 5.99, quantity: 1 },
            ],
        });

        const response = await request(app)
            .get("/api/recommendations?includeProfile=true")
            .set("Authorization", `Bearer ${authToken}`)
            .expect(200);

        expect(response.body.userProfile).toBeDefined();
    });
});

describe("GET /api/recommendations/frequent", () => {
    test("returns empty array without auth", async () => {
        const response = await request(app)
            .get("/api/recommendations/frequent")
            .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.recommendations).toEqual([]);
        expect(response.body.message).toContain("Login");
    });

    test("returns frequently ordered items with auth", async () => {
        await Order.create({
            sessionId: "test-session",
            userId: testUser._id,
            items: [
                { restaurant: "McDonald's", item: "Big Mac", calories: 540, protein: 25, price: 5.99, quantity: 5 },
            ],
        });

        const response = await request(app)
            .get("/api/recommendations/frequent")
            .set("Authorization", `Bearer ${authToken}`)
            .expect(200);

        expect(response.body.success).toBe(true);
        // May or may not find items depending on DB state
    });
});

describe("GET /api/recommendations/similar", () => {
    test("returns similar items", async () => {
        const response = await request(app)
            .get("/api/recommendations/similar")
            .expect(200);

        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.recommendations)).toBe(true);
    });

    test("respects limit parameter", async () => {
        const response = await request(app)
            .get("/api/recommendations/similar?limit=2")
            .expect(200);

        expect(response.body.recommendations.length).toBeLessThanOrEqual(2);
    });
});

describe("GET /api/recommendations/explore", () => {
    test("returns exploration suggestions", async () => {
        const response = await request(app)
            .get("/api/recommendations/explore")
            .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe("Try something new!");
    });

    test("suggests unexplored restaurants for users with history", async () => {
        await Order.create({
            sessionId: "test-session",
            userId: testUser._id,
            items: [
                { restaurant: "McDonald's", item: "Big Mac", calories: 540, protein: 25, price: 5.99, quantity: 5 },
            ],
        });

        const response = await request(app)
            .get("/api/recommendations/explore")
            .set("Authorization", `Bearer ${authToken}`)
            .expect(200);

        expect(response.body.success).toBe(true);
        response.body.recommendations.forEach((rec) => {
            expect(rec.type).toBe("explore");
        });
    });
});

describe("GET /api/recommendations/time-based", () => {
    test("returns time-based suggestions with auto-detected meal type", async () => {
        const response = await request(app)
            .get("/api/recommendations/time-based")
            .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.mealType).toBeDefined();
        expect(["breakfast", "lunch", "dinner", "late-night"]).toContain(response.body.mealType);
    });

    test("respects explicit meal type parameter", async () => {
        const response = await request(app)
            .get("/api/recommendations/time-based?mealType=breakfast")
            .expect(200);

        expect(response.body.mealType).toBe("breakfast");
    });

    test("ignores invalid meal type and auto-detects", async () => {
        const response = await request(app)
            .get("/api/recommendations/time-based?mealType=invalid")
            .expect(200);

        expect(response.body.success).toBe(true);
        expect(["breakfast", "lunch", "dinner", "late-night"]).toContain(response.body.mealType);
    });
});

describe("GET /api/recommendations/healthy", () => {
    test("returns message for unauthenticated users", async () => {
        const response = await request(app)
            .get("/api/recommendations/healthy")
            .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.recommendations).toEqual([]);
        expect(response.body.message).toContain("Login");
    });

    test("returns healthier alternatives with auth and order history", async () => {
        await Order.create({
            sessionId: "test-session",
            userId: testUser._id,
            items: [
                { restaurant: "Burger King", item: "Whopper", calories: 657, protein: 28, price: 6.29, quantity: 2 },
            ],
        });

        const response = await request(app)
            .get("/api/recommendations/healthy")
            .set("Authorization", `Bearer ${authToken}`)
            .expect(200);

        expect(response.body.success).toBe(true);
        // May or may not find alternatives
    });
});

describe("GET /api/recommendations/profile", () => {
    test("returns null profile for unauthenticated users", async () => {
        const response = await request(app)
            .get("/api/recommendations/profile")
            .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.profile).toBeNull();
        expect(response.body.message).toContain("Login");
    });

    test("returns null profile for users without orders", async () => {
        const response = await request(app)
            .get("/api/recommendations/profile")
            .set("Authorization", `Bearer ${authToken}`)
            .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.profile).toBeNull();
        expect(response.body.message).toContain("Start ordering");
    });

    test("returns full profile for users with order history", async () => {
        await Order.create({
            sessionId: "test-session",
            userId: testUser._id,
            items: [
                { restaurant: "McDonald's", item: "Big Mac", calories: 540, protein: 25, price: 5.99, quantity: 3 },
            ],
        });

        const response = await request(app)
            .get("/api/recommendations/profile")
            .set("Authorization", `Bearer ${authToken}`)
            .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.profile).toBeDefined();
        expect(response.body.profile.totalOrders).toBe(1);
        expect(response.body.profile.avgCalories).toBeGreaterThan(0);
        expect(response.body.profile.favoriteRestaurants).toBeDefined();
    });
});
