import { describe, test, expect, beforeAll, afterAll, beforeEach } from "@jest/globals";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import User from "../models/User.js";
import Order from "../models/Order.js";
import FastFoodItem from "../models/FastFoodItem.js";
import {
  getRestaurantAnalytics,
  getPlatformAnalytics,
  getOrderTrends,
  getTopRestaurants,
} from "../services/adminAnalytics.js";
import connectDB from "../config/database.js";

let testUser;
let testFoodItem1;
let testFoodItem2;

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

  testFoodItem1 = await FastFoodItem.create({
    restaurant: "McDonald's",
    item: "Big Mac",
    calories: 563,
    totalFat: 33,
    protein: 25,
    carbs: 45,
    price: 5.99,
  });

  testFoodItem2 = await FastFoodItem.create({
    restaurant: "Burger King",
    item: "Whopper",
    calories: 660,
    totalFat: 40,
    protein: 28,
    carbs: 49,
    price: 6.99,
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

describe("Admin Analytics Service Tests", () => {
  describe("getRestaurantAnalytics", () => {
    test("should get restaurant analytics", async () => {
      await Order.create({
        userId: testUser._id,
        orderNumber: "ORD-REST-001",
        items: [
          {
            foodItem: testFoodItem1._id,
            restaurant: "McDonald's",
            item: "Big Mac",
            calories: 563,
            protein: 25,
            price: 5.99,
            quantity: 2,
          },
        ],
        subtotal: 11.98,
        tax: 0.96,
        deliveryFee: 0,
        total: 12.94,
        status: "completed",
      });

      const analytics = await getRestaurantAnalytics("all");

      assert.ok(Array.isArray(analytics));
      if (analytics.length > 0) {
        const restaurant = analytics[0];
        assert.ok(restaurant.restaurant);
        assert.ok(typeof restaurant.totalRevenue === "number");
        assert.ok(typeof restaurant.orderCount === "number");
        assert.ok(typeof restaurant.totalCalories === "number");
        assert.ok(typeof restaurant.totalProtein === "number");
        assert.ok(Array.isArray(restaurant.popularItems));
      }
    });

    test("should return empty array when no orders exist", async () => {
      const analytics = await getRestaurantAnalytics("all");

      assert.ok(Array.isArray(analytics));
      assert.equal(analytics.length, 0);
    });

    test("should filter by time range", async () => {
      const oldDate = new Date();
      oldDate.setMonth(oldDate.getMonth() - 2);

      await Order.create({
        userId: testUser._id,
        orderNumber: "ORD-OLD-001",
        items: [
          {
            foodItem: testFoodItem1._id,
            restaurant: "McDonald's",
            item: "Big Mac",
            calories: 563,
            protein: 25,
            price: 5.99,
            quantity: 1,
          },
        ],
        subtotal: 5.99,
        tax: 0.48,
        deliveryFee: 3.99,
        total: 10.46,
        status: "completed",
        createdAt: oldDate,
      });

      const analytics = await getRestaurantAnalytics("month");

      // Should not include the old order
      assert.equal(analytics.length, 0);
    });
  });

  describe("getPlatformAnalytics", () => {
    test("should get platform-wide analytics", async () => {
      await Order.create({
        userId: testUser._id,
        orderNumber: "ORD-PLAT-001",
        items: [
          {
            foodItem: testFoodItem1._id,
            restaurant: "McDonald's",
            item: "Big Mac",
            calories: 563,
            protein: 25,
            price: 5.99,
            quantity: 1,
          },
        ],
        subtotal: 5.99,
        tax: 0.48,
        deliveryFee: 3.99,
        total: 10.46,
        status: "completed",
        nutrition: {
          totalCalories: 563,
          totalProtein: 25,
          totalFat: 33,
          totalCarbohydrates: 45,
        },
      });

      const analytics = await getPlatformAnalytics("all");

      assert.ok(analytics);
      assert.ok(typeof analytics.totalRevenue === "number");
      assert.ok(typeof analytics.totalOrders === "number");
      assert.ok(typeof analytics.totalUsers === "number");
      assert.ok(typeof analytics.averageOrderValue === "number");
    });

    test("should return zero values when no orders exist", async () => {
      const analytics = await getPlatformAnalytics("all");

      assert.equal(analytics.totalRevenue, 0);
      assert.equal(analytics.totalOrders, 0);
      assert.equal(analytics.totalUsers, 0);
    });
  });

  describe("getOrderTrends", () => {
    test("should get order trends", async () => {
      await Order.create({
        userId: testUser._id,
        orderNumber: "ORD-TREND-001",
        items: [
          {
            foodItem: testFoodItem1._id,
            restaurant: "McDonald's",
            item: "Big Mac",
            calories: 563,
            protein: 25,
            price: 5.99,
            quantity: 1,
          },
        ],
        subtotal: 5.99,
        tax: 0.48,
        deliveryFee: 3.99,
        total: 10.46,
        status: "completed",
        nutrition: {
          totalCalories: 563,
          totalProtein: 25,
        },
      });

      const trends = await getOrderTrends("all", "day");

      assert.ok(Array.isArray(trends));
      if (trends.length > 0) {
        const trend = trends[0];
        assert.ok(trend.date);
        assert.ok(typeof trend.revenue === "number");
        assert.ok(typeof trend.orderCount === "number");
      }
    });

    test("should support different groupBy options", async () => {
      await Order.create({
        userId: testUser._id,
        orderNumber: "ORD-TREND-002",
        items: [
          {
            foodItem: testFoodItem1._id,
            restaurant: "McDonald's",
            item: "Big Mac",
            calories: 563,
            protein: 25,
            price: 5.99,
            quantity: 1,
          },
        ],
        subtotal: 5.99,
        tax: 0.48,
        deliveryFee: 3.99,
        total: 10.46,
        status: "completed",
      });

      const trendsDay = await getOrderTrends("all", "day");
      const trendsWeek = await getOrderTrends("all", "week");
      const trendsMonth = await getOrderTrends("all", "month");

      assert.ok(Array.isArray(trendsDay));
      assert.ok(Array.isArray(trendsWeek));
      assert.ok(Array.isArray(trendsMonth));
    });
  });

  describe("getTopRestaurants", () => {
    test("should get top restaurants by revenue", async () => {
      await Order.create({
        userId: testUser._id,
        orderNumber: "ORD-TOP-001",
        items: [
          {
            foodItem: testFoodItem1._id,
            restaurant: "McDonald's",
            item: "Big Mac",
            calories: 563,
            protein: 25,
            price: 5.99,
            quantity: 2,
          },
        ],
        subtotal: 11.98,
        tax: 0.96,
        deliveryFee: 0,
        total: 12.94,
        status: "completed",
      });

      const topRestaurants = await getTopRestaurants("revenue", 10, "all");

      assert.ok(Array.isArray(topRestaurants));
      if (topRestaurants.length > 0) {
        assert.ok(topRestaurants[0].restaurant);
        assert.ok(topRestaurants[0].totalRevenue > 0);
      }
    });

    test("should get top restaurants by orders", async () => {
      await Order.create({
        userId: testUser._id,
        orderNumber: "ORD-TOP-002",
        items: [
          {
            foodItem: testFoodItem1._id,
            restaurant: "McDonald's",
            item: "Big Mac",
            calories: 563,
            protein: 25,
            price: 5.99,
            quantity: 1,
          },
        ],
        subtotal: 5.99,
        tax: 0.48,
        deliveryFee: 3.99,
        total: 10.46,
        status: "completed",
      });

      const topRestaurants = await getTopRestaurants("orders", 10, "all");

      assert.ok(Array.isArray(topRestaurants));
      if (topRestaurants.length > 0) {
        assert.ok(topRestaurants[0].orderCount > 0);
      }
    });

    test("should respect limit parameter", async () => {
      // Create multiple orders for different restaurants
      await Order.create({
        userId: testUser._id,
        orderNumber: "ORD-TOP-003",
        items: [
          {
            foodItem: testFoodItem1._id,
            restaurant: "McDonald's",
            item: "Big Mac",
            calories: 563,
            protein: 25,
            price: 5.99,
            quantity: 1,
          },
        ],
        subtotal: 5.99,
        tax: 0.48,
        deliveryFee: 3.99,
        total: 10.46,
        status: "completed",
      });

      await Order.create({
        userId: testUser._id,
        orderNumber: "ORD-TOP-004",
        items: [
          {
            foodItem: testFoodItem2._id,
            restaurant: "Burger King",
            item: "Whopper",
            calories: 660,
            protein: 28,
            price: 6.99,
            quantity: 1,
          },
        ],
        subtotal: 6.99,
        tax: 0.56,
        deliveryFee: 3.99,
        total: 11.54,
        status: "completed",
      });

      const topRestaurants = await getTopRestaurants("revenue", 1, "all");

      assert.equal(topRestaurants.length, 1);
    });
  });
});

