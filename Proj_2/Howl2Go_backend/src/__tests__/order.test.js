import { describe, test, expect, beforeAll, afterAll } from "@jest/globals";
import assert from "node:assert/strict";
import request from "supertest";
import mongoose from "mongoose";
import app from "../app.js";
import Order from "../models/Order.js";
import User from "../models/User.js";
import Counter from "../models/Counter.js";
import Cart from "../models/Cart.js";
import { generateAccessToken } from "../utils/jwt.util.js";
import connectDB from "../config/database.js";

let agent;
let guestOrderId;
let userOrderId;
let testUser;
let testUserToken;
let adminUser;
let adminToken;
let sessionId;

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

  // Clean collections used by these tests
  await Order.deleteMany({});
  await Counter.deleteMany({});
  await Cart.deleteMany({});
  await User.deleteMany({});

  agent = request.agent(app);
  // create a session and capture session id from the cookie for cart tests
  const sessionRes = await agent.get("/api/orders/me");
  const setCookie = sessionRes.headers["set-cookie"] || [];
  if (setCookie.length > 0) {
    const firstCookie = setCookie[0].split(";")[0];
    const parts = firstCookie.split("=");
    const raw = parts.slice(1).join("=");
    try {
      const decoded = decodeURIComponent(raw);
      if (decoded.startsWith("s:")) {
        sessionId = decoded.substring(2).split(".")[0];
      } else {
        sessionId = decoded.split(".")[0];
      }
    } catch (e) {
      sessionId = raw;
    }
  }
});

afterAll(async () => {
  await Order.deleteMany({});
  await Counter.deleteMany({});
  await Cart.deleteMany({});
  await User.deleteMany({});
  await mongoose.connection.close();
});

test("POST /api/orders - should fail with no items", async () => {
  const response = await agent.post("/api/orders").send({});
  assert.equal(response.status, 400);
  assert.equal(response.body.success, false);
});

test("POST /api/orders - should create order with items for guest", async () => {
  const items = [
    {
      _id: new mongoose.Types.ObjectId(),
      restaurant: "Testaurant",
      item: "Test Burger",
      calories: 500,
      price: 6.5,
      quantity: 2,
    },
  ];

  const response = await agent.post("/api/orders").send({ items });
  assert.equal(response.status, 201);
  assert.equal(response.body.success, true);
  const order = response.body.data.order;
  assert.ok(order._id);
  assert.equal(order.items.length, 1);
  assert.equal(order.totalItems, 2);
  assert.equal(order.totalPrice, 13);
  assert.ok(typeof order.orderNumber === "number");

  guestOrderId = order._id;
});

test("POST /api/orders - should create order from cart and clear cart", async () => {
  const FastFoodItem = (await import("../models/FastFoodItem.js")).default;
  const item = await FastFoodItem.create({
    company: "CF",
    item: "CartItem",
    price: 4,
    calories: 200,
  });

  if (!sessionId) {
    throw new Error("Could not determine test session id from cookie");
  }

  await Cart.create({
    sessionId,
    items: [
      {
        foodItem: item._id,
        restaurant: item.company,
        item: item.item,
        calories: item.calories,
        price: item.price,
        quantity: 3,
      },
    ],
  });

  const response = await agent.post("/api/orders").send({});
  assert.equal(response.status, 201);
  assert.equal(response.body.success, true);

  const cart = await Cart.findOne({ sessionId });
  assert.ok(cart);
  assert.equal(cart.items.length, 0);
});

test("GET /api/orders/me - guest should retrieve their orders", async () => {
  const response = await agent.get("/api/orders/me");
  assert.equal(response.status, 200);
  assert.equal(response.body.success, true);
  assert.ok(Array.isArray(response.body.data.orders));
  assert.ok(response.body.data.orders.length >= 1);
});

test("POST /api/orders - should create order for authenticated user", async () => {
  testUser = await User.create({
    name: "Order Tester",
    email: "ordertest@example.com",
    password: "Password123!",
  });

  testUserToken = generateAccessToken(testUser._id, testUser.email, "user");

  const items = [
    {
      snapshot: {
        restaurant: "Authaurant",
        item: "Auth Pizza",
        price: 8,
      },
      quantity: 1,
    },
  ];

  const response = await agent
    .post("/api/orders")
    .set("Authorization", `Bearer ${testUserToken}`)
    .send({ items });

  assert.equal(response.status, 201);
  assert.equal(response.body.success, true);
  const order = response.body.data.order;
  assert.ok(order._id);
  assert.equal(order.items.length, 1);
  assert.equal(order.userId, testUser._id.toString());

  userOrderId = order._id;
});

test("GET /api/orders - should require admin/staff access", async () => {
  const response = await agent
    .get("/api/orders")
    .set("Authorization", `Bearer ${testUserToken}`);

  assert.equal(response.status, 403);
  assert.equal(response.body.success, false);
});

test("GET /api/orders - admin should list all orders", async () => {
  adminUser = await User.create({
    name: "Admin",
    email: "admin@example.com",
    password: "Password123!",
    role: "admin",
  });

  adminToken = generateAccessToken(adminUser._id, adminUser.email, "admin");

  const response = await agent
    .get("/api/orders")
    .set("Authorization", `Bearer ${adminToken}`);

  assert.equal(response.status, 200);
  assert.equal(response.body.success, true);
  assert.ok(Array.isArray(response.body.data.orders));
  assert.ok(response.body.data.orders.length >= 2);
});

test("PATCH /api/orders/:id/status - invalid status fails", async () => {
  const response = await agent
    .patch(`/api/orders/${userOrderId}/status`)
    .set("Authorization", `Bearer ${adminToken}`)
    .send({ status: "not_a_status" });

  assert.equal(response.status, 400);
  assert.equal(response.body.success, false);
});

test("PATCH /api/orders/:id/status - admin updates status", async () => {
  const response = await agent
    .patch(`/api/orders/${userOrderId}/status`)
    .set("Authorization", `Bearer ${adminToken}`)
    .send({ status: "ready" });

  assert.equal(response.status, 200);
  assert.equal(response.body.success, true);
  assert.equal(response.body.data.order.status, "ready");
});

test("PATCH /api/orders/:id/status - non-existent order returns 404", async () => {
  const fakeId = new mongoose.Types.ObjectId();
  const response = await agent
    .patch(`/api/orders/${fakeId}/status`)
    .set("Authorization", `Bearer ${adminToken}`)
    .send({ status: "ready" });

  assert.equal(response.status, 404);
  assert.equal(response.body.success, false);
});

test("PATCH /api/orders/:id/pickup - cannot pickup unless 'ready'", async () => {
  const resp = await agent
    .post("/api/orders")
    .set("Authorization", `Bearer ${testUserToken}`)
    .send({
      items: [{ snapshot: { item: "PendingItem", price: 2 }, quantity: 1 }],
    });
  const pendingOrderId = resp.body.data.order._id;

  const pickupResp = await agent
    .patch(`/api/orders/${pendingOrderId}/pickup`)
    .set("Authorization", `Bearer ${testUserToken}`)
    .send();

  assert.equal(pickupResp.status, 400);
  assert.equal(pickupResp.body.success, false);
});

test("GET /api/orders/me - authenticated user receives only their orders", async () => {
  const response = await agent
    .get("/api/orders/me")
    .set("Authorization", `Bearer ${testUserToken}`);

  assert.equal(response.status, 200);
  assert.equal(response.body.success, true);
  const orders = response.body.data.orders;
  assert.ok(orders.every((o) => o.userId === testUser._id.toString()));
});

test("PATCH /api/orders/:id/pickup - user marks own order complete when ready", async () => {
  const readyResp = await agent
    .patch(`/api/orders/${userOrderId}/status`)
    .set("Authorization", `Bearer ${adminToken}`)
    .send({ status: "ready" });
  assert.equal(readyResp.status, 200);

  const pickupResp = await agent
    .patch(`/api/orders/${userOrderId}/pickup`)
    .set("Authorization", `Bearer ${testUserToken}`)
    .send();

  assert.equal(pickupResp.status, 200);
  assert.equal(pickupResp.body.success, true);
  assert.equal(pickupResp.body.data.order.status, "complete");
});

test("PATCH /api/orders/:id/pickup - non-owner cannot mark complete", async () => {
  const other = await User.create({
    name: "Other",
    email: "other@example.com",
    password: "Password123!",
  });
  const otherToken = generateAccessToken(other._id, other.email, "user");

  const resp = await agent
    .post("/api/orders")
    .set("Authorization", `Bearer ${testUserToken}`)
    .send({ items: [{ snapshot: { item: "ToPick", price: 1 }, quantity: 1 }] });
  const newOrderId = resp.body.data.order._id;

  await agent
    .patch(`/api/orders/${newOrderId}/status`)
    .set("Authorization", `Bearer ${adminToken}`)
    .send({ status: "ready" });

  const pickupResp = await agent
    .patch(`/api/orders/${newOrderId}/pickup`)
    .set("Authorization", `Bearer ${otherToken}`)
    .send();

  assert.equal(pickupResp.status, 403);
  assert.equal(pickupResp.body.success, false);
});
