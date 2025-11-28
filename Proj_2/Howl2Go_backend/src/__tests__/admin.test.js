import { describe, test, expect, beforeAll, afterAll, beforeEach } from "@jest/globals";
import assert from "node:assert/strict";
import request from "supertest";
import mongoose from "mongoose";
import app from "../app.js";
import User from "../models/User.js";
import Order from "../models/Order.js";
import FastFoodItem from "../models/FastFoodItem.js";
import { generateAccessToken } from "../utils/jwt.util.js";
import connectDB from "../config/database.js";

let adminUser;
let regularUser;
let adminToken;
let regularToken;
let testFoodItem;

// Setup before tests
beforeAll(async () => {
  await connectDB();

  // SAFETY CHECK: Prevent running tests against production database
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
  
  // Clean up
  await User.deleteMany({});
  await Order.deleteMany({});
  await FastFoodItem.deleteMany({});

  // Create admin user
  adminUser = await User.create({
    name: "Admin User",
    email: "admin@example.com",
    password: "Password123!",
    role: "admin",
  });

  // Create regular user
  regularUser = await User.create({
    name: "Regular User",
    email: "user@example.com",
    password: "Password123!",
    role: "user",
  });

  adminToken = generateAccessToken(adminUser._id, adminUser.email, adminUser.role);
  regularToken = generateAccessToken(regularUser._id, regularUser.email, regularUser.role);

  // Create test food item
  testFoodItem = await FastFoodItem.create({
    restaurant: "McDonald's",
    item: "Big Mac",
    calories: 563,
    totalFat: 33,
    protein: 25,
    carbs: 45,
    price: 5.99,
  });
});

// Cleanup after tests
afterAll(async () => {
  await User.deleteMany({});
  await Order.deleteMany({});
  await FastFoodItem.deleteMany({});
  await mongoose.connection.close();
});

// Clean up between tests
beforeEach(async () => {
  await Order.deleteMany({});
});

describe("Admin Analytics API Tests", () => {
  describe("GET /api/admin/analytics/dashboard - Get Dashboard Data", () => {
    beforeEach(async () => {
      // Create test orders
      await Order.create({
        userId: regularUser._id,
        orderNumber: "ORD-001",
        items: [
          {
            foodItem: testFoodItem._id,
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
        nutrition: {
          totalCalories: 1126,
          totalProtein: 50,
          totalFat: 66,
          totalCarbohydrates: 90,
        },
      });
    });

    test("should get dashboard data as admin", async () => {
      const response = await request(app)
        .get("/api/admin/analytics/dashboard")
        .set("Authorization", `Bearer ${adminToken}`)
        .query({ timeRange: "all" });

      assert.equal(response.status, 200);
      assert.equal(response.body.success, true);
      assert.ok(response.body.data.platform);
      assert.ok(response.body.data.restaurants);
      assert.ok(response.body.data.trends);
      assert.ok(response.body.data.topByRevenue);
      assert.ok(response.body.data.topByOrders);
    });

    test("should return 403 if non-admin tries to access", async () => {
      const response = await request(app)
        .get("/api/admin/analytics/dashboard")
        .set("Authorization", `Bearer ${regularToken}`);

      assert.equal(response.status, 403);
      assert.equal(response.body.success, false);
      assert.ok(response.body.message.includes("Admin"));
    });

    test("should return 401 if not authenticated", async () => {
      const response = await request(app).get("/api/admin/analytics/dashboard");

      assert.equal(response.status, 401);
    });
  });

  describe("GET /api/admin/analytics/restaurants - Get Restaurant Analytics", () => {
    beforeEach(async () => {
      await Order.create({
        userId: regularUser._id,
        orderNumber: "ORD-REST-001",
        items: [
          {
            foodItem: testFoodItem._id,
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
    });

    test("should get restaurant analytics as admin", async () => {
      const response = await request(app)
        .get("/api/admin/analytics/restaurants")
        .set("Authorization", `Bearer ${adminToken}`)
        .query({ timeRange: "all" });

      assert.equal(response.status, 200);
      assert.equal(response.body.success, true);
      assert.ok(response.body.data.restaurants);
      assert.ok(Array.isArray(response.body.data.restaurants));
      if (response.body.data.restaurants.length > 0) {
        const restaurant = response.body.data.restaurants[0];
        assert.ok(restaurant.restaurant);
        assert.ok(typeof restaurant.totalRevenue === "number");
        assert.ok(typeof restaurant.orderCount === "number");
      }
    });

    test("should support time range filtering", async () => {
      const response = await request(app)
        .get("/api/admin/analytics/restaurants")
        .set("Authorization", `Bearer ${adminToken}`)
        .query({ timeRange: "month" });

      assert.equal(response.status, 200);
      assert.equal(response.body.data.timeRange, "month");
    });
  });

  describe("GET /api/admin/analytics/platform - Get Platform Analytics", () => {
    beforeEach(async () => {
      await Order.create({
        userId: regularUser._id,
        orderNumber: "ORD-PLAT-001",
        items: [
          {
            foodItem: testFoodItem._id,
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
    });

    test("should get platform analytics as admin", async () => {
      const response = await request(app)
        .get("/api/admin/analytics/platform")
        .set("Authorization", `Bearer ${adminToken}`)
        .query({ timeRange: "all" });

      assert.equal(response.status, 200);
      assert.equal(response.body.success, true);
      assert.ok(response.body.data.platform);
      assert.ok(typeof response.body.data.platform.totalRevenue === "number");
      assert.ok(typeof response.body.data.platform.totalOrders === "number");
      assert.ok(typeof response.body.data.platform.totalUsers === "number");
    });
  });

  describe("GET /api/admin/analytics/trends - Get Order Trends", () => {
    beforeEach(async () => {
      // Create orders with different dates
      const now = new Date();
      await Order.create({
        userId: regularUser._id,
        orderNumber: "ORD-TREND-001",
        items: [
          {
            foodItem: testFoodItem._id,
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
        createdAt: now,
      });
    });

    test("should get order trends as admin", async () => {
      const response = await request(app)
        .get("/api/admin/analytics/trends")
        .set("Authorization", `Bearer ${adminToken}`)
        .query({ timeRange: "all", groupBy: "day" });

      assert.equal(response.status, 200);
      assert.equal(response.body.success, true);
      assert.ok(response.body.data.trends);
      assert.ok(Array.isArray(response.body.data.trends));
    });
  });

  describe("GET /api/admin/analytics/top-restaurants - Get Top Restaurants", () => {
    beforeEach(async () => {
      await Order.create({
        userId: regularUser._id,
        orderNumber: "ORD-TOP-001",
        items: [
          {
            foodItem: testFoodItem._id,
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
    });

    test("should get top restaurants by revenue as admin", async () => {
      const response = await request(app)
        .get("/api/admin/analytics/top-restaurants")
        .set("Authorization", `Bearer ${adminToken}`)
        .query({ metric: "revenue", limit: 10, timeRange: "all" });

      assert.equal(response.status, 200);
      assert.equal(response.body.success, true);
      assert.ok(response.body.data.restaurants);
      assert.ok(Array.isArray(response.body.data.restaurants));
    });

    test("should get top restaurants by orders as admin", async () => {
      const response = await request(app)
        .get("/api/admin/analytics/top-restaurants")
        .set("Authorization", `Bearer ${adminToken}`)
        .query({ metric: "orders", limit: 10, timeRange: "all" });

      assert.equal(response.status, 200);
      assert.equal(response.body.success, true);
      assert.ok(response.body.data.restaurants);
    });
  });
});

