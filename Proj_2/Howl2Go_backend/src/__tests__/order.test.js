import { describe, test, expect, beforeAll, afterAll, beforeEach } from "@jest/globals";
import assert from "node:assert/strict";
import request from "supertest";
import mongoose from "mongoose";
import app from "../app.js";
import User from "../models/User.js";
import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import FastFoodItem from "../models/FastFoodItem.js";
import { generateAccessToken } from "../utils/jwt.util.js";
import connectDB from "../config/database.js";

let testUser;
let adminUser;
let authToken;
let adminToken;
let testFoodItem;
let testCart;

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
  await Cart.deleteMany({});
  await FastFoodItem.deleteMany({});

  // Create test user
  testUser = await User.create({
    name: "Test User",
    email: "test@example.com",
    password: "Password123!",
  });

  // Create admin user
  adminUser = await User.create({
    name: "Admin User",
    email: "admin@example.com",
    password: "Password123!",
    role: "admin",
  });

  authToken = generateAccessToken(testUser._id, testUser.email, testUser.role);
  adminToken = generateAccessToken(adminUser._id, adminUser.email, adminUser.role);

  // Create test food item
  testFoodItem = await FastFoodItem.create({
    restaurant: "Test Restaurant",
    item: "Test Burger",
    calories: 500,
    totalFat: 25,
    protein: 30,
    carbs: 40,
    price: 9.99,
  });

  // Create test cart
  testCart = await Cart.create({
    userId: testUser._id,
    sessionId: "test-session",
    items: [
      {
        foodItem: testFoodItem._id,
        restaurant: "Test Restaurant",
        item: "Test Burger",
        calories: 500,
        protein: 30,
        price: 9.99,
        quantity: 2,
      },
    ],
    totalPrice: 19.98,
  });
});

// Cleanup after tests
afterAll(async () => {
  await User.deleteMany({});
  await Order.deleteMany({});
  await Cart.deleteMany({});
  await FastFoodItem.deleteMany({});
  await mongoose.connection.close();
});

// Clean up between tests
beforeEach(async () => {
  await Order.deleteMany({});
});

describe("Order API Tests", () => {
  describe("POST /api/orders - Create Order", () => {
    test("should create an order from cart successfully", async () => {
      const response = await request(app)
        .post("/api/orders")
        .set("Authorization", `Bearer ${authToken}`)
        .send();

      assert.equal(response.status, 201);
      assert.equal(response.body.success, true);
      assert.ok(response.body.data.order);
      assert.ok(response.body.data.order.orderNumber);
      assert.equal(response.body.data.order.items.length, 1);
      assert.equal(response.body.data.order.items[0].restaurant, "Test Restaurant");
      assert.equal(response.body.data.order.items[0].item, "Test Burger");
      assert.ok(response.body.data.order.total > 0);
    });

    test("should return 401 if not authenticated", async () => {
      const response = await request(app).post("/api/orders").send();

      assert.equal(response.status, 401);
    });

    test("should return 400 if cart is empty", async () => {
      // Clear the cart
      await Cart.findOneAndUpdate(
        { userId: testUser._id },
        { items: [], totalPrice: 0 }
      );

      const response = await request(app)
        .post("/api/orders")
        .set("Authorization", `Bearer ${authToken}`)
        .send();

      assert.equal(response.status, 400);
      assert.equal(response.body.success, false);
      assert.ok(response.body.message.includes("empty"));
    });

    test("should generate unique order numbers", async () => {
      // Create another cart
      await Cart.findOneAndUpdate(
        { userId: testUser._id },
        {
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
          totalPrice: 9.99,
        }
      );

      const response1 = await request(app)
        .post("/api/orders")
        .set("Authorization", `Bearer ${authToken}`)
        .send();

      // Create another cart for second order
      await Cart.findOneAndUpdate(
        { userId: testUser._id },
        {
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
          totalPrice: 9.99,
        }
      );

      const response2 = await request(app)
        .post("/api/orders")
        .set("Authorization", `Bearer ${authToken}`)
        .send();

      assert.notEqual(
        response1.body.data.order.orderNumber,
        response2.body.data.order.orderNumber
      );
    });
  });

  describe("GET /api/orders - Get Order History", () => {
    test("should get user's order history", async () => {
      // Create a test order
      const order = await Order.create({
        userId: testUser._id,
        orderNumber: "ORD-TEST-001",
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
      });

      const response = await request(app)
        .get("/api/orders")
        .set("Authorization", `Bearer ${authToken}`)
        .query({ page: 1, limit: 10 });

      assert.equal(response.status, 200);
      assert.equal(response.body.success, true);
      assert.ok(response.body.data.orders);
      assert.ok(Array.isArray(response.body.data.orders));
      assert.ok(response.body.data.orders.length > 0);
    });

    test("should return 401 if not authenticated", async () => {
      const response = await request(app).get("/api/orders");

      assert.equal(response.status, 401);
    });

    test("should support pagination", async () => {
      // Create multiple orders
      for (let i = 0; i < 5; i++) {
        await Order.create({
          userId: testUser._id,
          orderNumber: `ORD-TEST-${i}`,
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
        });
      }

      const response = await request(app)
        .get("/api/orders")
        .set("Authorization", `Bearer ${authToken}`)
        .query({ page: 1, limit: 2 });

      assert.equal(response.status, 200);
      assert.equal(response.body.data.orders.length, 2);
      assert.equal(response.body.data.pagination.page, 1);
      assert.equal(response.body.data.pagination.limit, 2);
    });
  });

  describe("GET /api/orders/insights - Get Order Insights", () => {
    test("should get order insights for user", async () => {
      // Create test orders
      await Order.create({
        userId: testUser._id,
        orderNumber: "ORD-INSIGHT-001",
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

      const response = await request(app)
        .get("/api/orders/insights")
        .set("Authorization", `Bearer ${authToken}`)
        .query({ timeRange: "all" });

      assert.equal(response.status, 200);
      assert.equal(response.body.success, true);
      assert.ok(response.body.data.patterns);
      assert.ok(response.body.data.trends);
      assert.ok(response.body.data.recommendations);
    });

    test("should return 401 if not authenticated", async () => {
      const response = await request(app).get("/api/orders/insights");

      assert.equal(response.status, 401);
    });
  });

  describe("GET /api/orders/:orderId - Get Order Details", () => {
    test("should get specific order details", async () => {
      const order = await Order.create({
        userId: testUser._id,
        orderNumber: "ORD-DETAIL-001",
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
      });

      const response = await request(app)
        .get(`/api/orders/${order._id}`)
        .set("Authorization", `Bearer ${authToken}`);

      assert.equal(response.status, 200);
      assert.equal(response.body.success, true);
      assert.equal(response.body.data.order._id.toString(), order._id.toString());
    });

    test("should return 404 for non-existent order", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/orders/${fakeId}`)
        .set("Authorization", `Bearer ${authToken}`);

      assert.equal(response.status, 404);
    });

    test("should return 403 if user tries to access another user's order", async () => {
      const otherUser = await User.create({
        name: "Other User",
        email: "other@example.com",
        password: "Password123!",
      });

      const order = await Order.create({
        userId: otherUser._id,
        orderNumber: "ORD-OTHER-001",
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
      });

      const response = await request(app)
        .get(`/api/orders/${order._id}`)
        .set("Authorization", `Bearer ${authToken}`);

      assert.equal(response.status, 403);
    });
  });
});

