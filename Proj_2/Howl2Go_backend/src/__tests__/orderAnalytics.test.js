import { describe, test, expect, beforeAll, afterAll, beforeEach } from "@jest/globals";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import User from "../models/User.js";
import Order from "../models/Order.js";
import FastFoodItem from "../models/FastFoodItem.js";
import {
  analyzeNutritionPatterns,
  trackDietaryTrends,
  generatePersonalizedRecommendations,
} from "../services/orderAnalytics.js";
import connectDB from "../config/database.js";

let testUser;
let testFoodItem;

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

  console.log(`Running tests against database: ${dbName}`);
  
  await User.deleteMany({});
  await Order.deleteMany({});
  await FastFoodItem.deleteMany({});

  testUser = await User.create({
    name: "Test User",
    email: "test@example.com",
    password: "Password123!",
  });

  testFoodItem = await FastFoodItem.create({
    restaurant: "Test Restaurant",
    item: "Test Burger",
    calories: 500,
    totalFat: 25,
    protein: 30,
    carbs: 40,
    price: 9.99,
  });
});

afterAll(async () => {
  await User.deleteMany({});
  await Order.deleteMany({});
  await FastFoodItem.deleteMany({});
  await mongoose.connection.close();
});

beforeEach(async () => {
  await Order.deleteMany({});
});

describe("Order Analytics Service Tests", () => {
  describe("analyzeNutritionPatterns", () => {
    test("should analyze nutrition patterns from orders", async () => {
      await Order.create({
        userId: testUser._id,
        orderNumber: "ORD-ANALYTICS-001",
        items: [
          {
            foodItem: testFoodItem._id,
            restaurant: "Test Restaurant",
            item: "Test Burger",
            calories: 500,
            protein: 30,
            price: 9.99,
            quantity: 1,
          },
        ],
        subtotal: 9.99,
        tax: 0.80,
        deliveryFee: 3.99,
        total: 14.78,
        status: "completed",
        nutrition: {
          totalCalories: 500,
          totalProtein: 30,
          totalFat: 25,
          totalCarbohydrates: 40,
        },
      });

      const patterns = await analyzeNutritionPatterns(testUser._id, "all");

      assert.ok(patterns);
      assert.equal(patterns.averageCalories, 500);
      assert.equal(patterns.averageProtein, 30);
      assert.ok(Array.isArray(patterns.mostOrderedRestaurants));
      assert.ok(Array.isArray(patterns.mostOrderedItems));
    });

    test("should return empty patterns when no orders exist", async () => {
      const patterns = await analyzeNutritionPatterns(testUser._id, "all");

      assert.equal(patterns.averageCalories, 0);
      assert.equal(patterns.averageProtein, 0);
      assert.equal(patterns.mostOrderedRestaurants.length, 0);
      assert.equal(patterns.mostOrderedItems.length, 0);
    });

    test("should filter by time range", async () => {
      const oldDate = new Date();
      oldDate.setMonth(oldDate.getMonth() - 2);

      await Order.create({
        userId: testUser._id,
        orderNumber: "ORD-OLD-001",
        items: [
          {
            foodItem: testFoodItem._id,
            restaurant: "Test Restaurant",
            item: "Test Burger",
            calories: 500,
            protein: 30,
            price: 9.99,
            quantity: 1,
          },
        ],
        subtotal: 9.99,
        tax: 0.80,
        deliveryFee: 3.99,
        total: 14.78,
        status: "completed",
        nutrition: {
          totalCalories: 500,
          totalProtein: 30,
        },
        createdAt: oldDate,
      });

      const patterns = await analyzeNutritionPatterns(testUser._id, "month");

      // Should not include the old order
      assert.equal(patterns.averageCalories, 0);
    });
  });

  describe("trackDietaryTrends", () => {
    test("should track dietary trends", async () => {
      await Order.create({
        userId: testUser._id,
        orderNumber: "ORD-TREND-001",
        items: [
          {
            foodItem: testFoodItem._id,
            restaurant: "Test Restaurant",
            item: "Test Burger",
            calories: 500,
            protein: 30,
            price: 9.99,
            quantity: 1,
          },
        ],
        subtotal: 9.99,
        tax: 0.80,
        deliveryFee: 3.99,
        total: 14.78,
        status: "completed",
        nutrition: {
          totalCalories: 500,
          totalProtein: 30,
          totalFat: 25,
          totalCarbohydrates: 40,
        },
      });

      const trends = await trackDietaryTrends(testUser._id, "all");

      assert.ok(trends);
      assert.ok(Array.isArray(trends.insights));
    });

    test("should return empty trends when no orders exist", async () => {
      const trends = await trackDietaryTrends(testUser._id, "all");

      assert.ok(trends);
      assert.equal(trends.insights.length, 0);
    });
  });

  describe("generatePersonalizedRecommendations", () => {
    test("should generate recommendations based on order history", async () => {
      await Order.create({
        userId: testUser._id,
        orderNumber: "ORD-REC-001",
        items: [
          {
            foodItem: testFoodItem._id,
            restaurant: "Test Restaurant",
            item: "Test Burger",
            calories: 500,
            protein: 30,
            price: 9.99,
            quantity: 1,
          },
        ],
        subtotal: 9.99,
        tax: 0.80,
        deliveryFee: 3.99,
        total: 14.78,
        status: "completed",
        nutrition: {
          totalCalories: 500,
          totalProtein: 30,
        },
      });

      const recommendations = await generatePersonalizedRecommendations(testUser._id);

      assert.ok(recommendations);
      assert.ok(Array.isArray(recommendations));
    });

    test("should return empty recommendations when no orders exist", async () => {
      const recommendations = await generatePersonalizedRecommendations(testUser._id);

      assert.ok(Array.isArray(recommendations));
    });
  });
});

