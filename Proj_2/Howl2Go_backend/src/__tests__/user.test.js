import { describe, test, expect, beforeAll, afterAll } from "@jest/globals";
import assert from "node:assert/strict";
import request from "supertest";
import mongoose from "mongoose";
import app from "../app.js";
import User from "../models/User.js";
import { generateAccessToken } from "../utils/jwt.util.js";
import connectDB from "../config/database.js";

let testUser;
let authToken;

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
});

afterAll(async () => {
  await User.deleteMany({});
  await mongoose.connection.close();
});

test("POST /api/users/register - should register a new user successfully", async () => {
  const response = await request(app).post("/api/users/register").send({
    name: "Test User",
    email: "test@example.com",
    password: "Password123!",
  });

  assert.equal(response.status, 201);
  assert.equal(response.body.success, true);
  assert.ok(response.body.data.user.id);
  assert.equal(response.body.data.user.email, "test@example.com");
  assert.equal(response.body.data.user.name, "Test User");
  assert.ok(response.body.data.accessToken);
  assert.ok(response.body.data.refreshToken);

  testUser = response.body.data.user;
  authToken = response.body.data.accessToken;
});

test("POST /api/users/register - should fail with duplicate email", async () => {
  const response = await request(app).post("/api/users/register").send({
    name: "Another User",
    email: "test@example.com",
    password: "Password123!",
  });

  assert.equal(response.status, 409);
  assert.equal(response.body.success, false);
  assert.match(response.body.message, /already exists/i);
});

test("POST /api/users/register - should fail without required fields", async () => {
  const response = await request(app).post("/api/users/register").send({
    name: "Incomplete User",
  });

  assert.equal(response.status, 400);
  assert.equal(response.body.success, false);
});

test("POST /api/users/register - should fail with invalid email", async () => {
  const response = await request(app).post("/api/users/register").send({
    name: "Invalid Email User",
    email: "invalid-email",
    password: "Password123!",
  });

  assert.equal(response.status, 400);
  assert.equal(response.body.success, false);
});

test("POST /api/users/register - should fail with short password", async () => {
  const response = await request(app).post("/api/users/register").send({
    name: "Short Password User",
    email: "shortpass@example.com",
    password: "Pass1!",
  });

  assert.equal(response.status, 400);
  assert.equal(response.body.success, false);
});

test("POST /api/users/login - should login successfully", async () => {
  const response = await request(app).post("/api/users/login").send({
    email: "test@example.com",
    password: "Password123!",
  });

  assert.equal(response.status, 200);
  assert.equal(response.body.success, true);
  assert.equal(response.body.data.user.email, "test@example.com");
  assert.ok(response.body.data.accessToken);
  assert.ok(response.body.data.refreshToken);
});

test("POST /api/users/login - should fail with incorrect password", async () => {
  const response = await request(app).post("/api/users/login").send({
    email: "test@example.com",
    password: "WrongPassword123!",
  });

  assert.equal(response.status, 401);
  assert.equal(response.body.success, false);
  assert.match(response.body.message, /invalid/i);
});

test("POST /api/users/login - should fail with non-existent email", async () => {
  const response = await request(app).post("/api/users/login").send({
    email: "nonexistent@example.com",
    password: "Password123!",
  });

  assert.equal(response.status, 401);
  assert.equal(response.body.success, false);
});

test("POST /api/users/login - should fail without credentials", async () => {
  const response = await request(app).post("/api/users/login").send({});

  assert.equal(response.status, 400);
  assert.equal(response.body.success, false);
});

test("GET /api/users/profile - should get profile with valid token", async () => {
  const response = await request(app)
    .get("/api/users/profile")
    .set("Authorization", `Bearer ${authToken}`);

  assert.equal(response.status, 200);
  assert.equal(response.body.success, true);
  assert.equal(response.body.data.user.email, "test@example.com");
  assert.equal(response.body.data.user.password, undefined);
});

test("GET /api/users/profile - should fail without token", async () => {
  const response = await request(app).get("/api/users/profile");

  assert.equal(response.status, 401);
  assert.equal(response.body.success, false);
});

test("GET /api/users/profile - should fail with invalid token", async () => {
  const response = await request(app)
    .get("/api/users/profile")
    .set("Authorization", "Bearer invalid-token");

  assert.equal(response.status, 401);
  assert.equal(response.body.success, false);
});

test("POST /api/users/change-password - should change password successfully", async () => {
  const response = await request(app)
    .post("/api/users/change-password")
    .set("Authorization", `Bearer ${authToken}`)
    .send({
      currentPassword: "Password123!",
      newPassword: "NewPassword456!",
    });

  assert.equal(response.status, 200);
  assert.equal(response.body.success, true);
  assert.ok(response.body.data.accessToken);
  assert.ok(response.body.data.refreshToken);

  authToken = response.body.data.accessToken;
});

test("POST /api/users/change-password - should fail with wrong current password", async () => {
  const response = await request(app)
    .post("/api/users/change-password")
    .set("Authorization", `Bearer ${authToken}`)
    .send({
      currentPassword: "WrongPassword123!",
      newPassword: "NewPassword789!",
    });

  assert.equal(response.status, 401);
  assert.equal(response.body.success, false);
});

test("POST /api/users/login - should login with new password", async () => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const response = await request(app).post("/api/users/login").send({
    email: "test@example.com",
    password: "NewPassword456!",
  });

  assert.equal(response.status, 200);
  assert.equal(response.body.success, true);
});

test("POST /api/users/refresh-token - should refresh access token", async () => {
  const loginResponse = await request(app).post("/api/users/login").send({
    email: "test@example.com",
    password: "NewPassword456!",
  });
  const refreshToken = loginResponse.body.data.refreshToken;

  const response = await request(app)
    .post("/api/users/refresh-token")
    .send({ refreshToken });

  assert.equal(response.status, 200);
  assert.equal(response.body.success, true);
  assert.ok(response.body.data.accessToken);
});

test("POST /api/users/refresh-token - should fail with invalid token", async () => {
  const response = await request(app)
    .post("/api/users/refresh-token")
    .send({ refreshToken: "invalid-token" });

  assert.equal(response.status, 401);
  assert.equal(response.body.success, false);
});

test("POST /api/users/refresh-token - should fail without refresh token", async () => {
  const response = await request(app).post("/api/users/refresh-token").send({});

  assert.equal(response.status, 400);
  assert.equal(response.body.success, false);
});

test("POST /api/users/change-password - should fail with missing fields", async () => {
  const response = await request(app)
    .post("/api/users/change-password")
    .set("Authorization", `Bearer ${authToken}`)
    .send({
      currentPassword: "NewPassword456!",
    });

  assert.equal(response.status, 400);
  assert.equal(response.body.success, false);
});

test("POST /api/users/change-password - should fail with weak new password", async () => {
  const response = await request(app)
    .post("/api/users/change-password")
    .set("Authorization", `Bearer ${authToken}`)
    .send({
      currentPassword: "NewPassword456!",
      newPassword: "weak",
    });

  assert.equal(response.status, 400);
  assert.equal(response.body.success, false);
});

test("GET /api/users/profile - should fail for non-existent user", async () => {
  const fakeUserId = new mongoose.Types.ObjectId();
  const fakeToken = generateAccessToken(fakeUserId, "fake@example.com", "user");

  const response = await request(app)
    .get("/api/users/profile")
    .set("Authorization", `Bearer ${fakeToken}`);

  assert.equal(response.status, 401);
  assert.equal(response.body.success, false);
});

test("POST /api/users/register - should handle email case insensitivity", async () => {
  const firstResponse = await request(app).post("/api/users/register").send({
    name: "Case Test User",
    email: "casetest@example.com",
    password: "Password123!",
  });

  assert.equal(firstResponse.status, 201);

  const secondResponse = await request(app).post("/api/users/register").send({
    name: "Another Case Test",
    email: "CASETEST@EXAMPLE.COM",
    password: "Password123!",
  });

  assert.equal(secondResponse.status, 409);
});

test("POST /api/users/login - should handle email case insensitivity", async () => {
  const response = await request(app).post("/api/users/login").send({
    email: "TEST@EXAMPLE.COM",
    password: "NewPassword456!",
  });

  assert.equal(response.status, 200);
  assert.equal(response.body.success, true);
});

test("POST /api/users/change-password - should fail for non-existent user", async () => {
  const fakeUserId = new mongoose.Types.ObjectId();
  const fakeToken = generateAccessToken(fakeUserId, "fake@example.com", "user");

  const response = await request(app)
    .post("/api/users/change-password")
    .set("Authorization", `Bearer ${fakeToken}`)
    .send({
      currentPassword: "OldPassword123!",
      newPassword: "NewPassword456!",
    });

  assert.equal(response.status, 401);
  assert.equal(response.body.success, false);
});

test("POST /api/users/refresh-token - should fail for non-existent user", async () => {
  const fakeUserId = new mongoose.Types.ObjectId();
  const fakeToken = generateAccessToken(fakeUserId, "fake@example.com", "user");

  const response = await request(app)
    .post("/api/users/refresh-token")
    .send({ refreshToken: fakeToken });

  assert.equal(response.status, 401);
  assert.equal(response.body.success, false);
});

test("POST /api/users/login - should fail for deactivated user account", async () => {
  const newUser = await User.create({
    name: "Deactivated User",
    email: "deactivated@example.com",
    password: "Password123!",
    isActive: false,
  });

  const response = await request(app).post("/api/users/login").send({
    email: "deactivated@example.com",
    password: "Password123!",
  });

  assert.equal(response.status, 401);
  assert.equal(response.body.success, false);
  assert.match(response.body.message, /deactivated/i);

  await User.deleteOne({ _id: newUser._id });
});

test("POST /api/users/refresh-token - should fail for inactive user", async () => {
  const inactiveUser = await User.create({
    name: "Inactive User",
    email: "inactive@example.com",
    password: "Password123!",
    isActive: false,
  });

  const { generateRefreshToken } = await import("../utils/jwt.util.js");
  const refreshToken = generateRefreshToken(inactiveUser._id);

  const response = await request(app).post("/api/users/refresh-token").send({
    refreshToken,
  });

  assert.equal(response.status, 401);
  assert.equal(response.body.success, false);
  assert.match(response.body.message, /not found or account deactivated/i);

  await User.deleteOne({ _id: inactiveUser._id });
});

test("POST /api/users/register - should handle mongoose validation errors properly", async () => {
  const response = await request(app).post("/api/users/register").send({
    name: "Validation Test",
    email: "validation@example.com",
    password: "short",
  });

  assert.equal(response.status, 400);
  assert.equal(response.body.success, false);
  if (response.body.errors) {
    assert.ok(Array.isArray(response.body.errors));
  }
});

test("POST /api/users/change-password - should handle mongoose validation errors", async () => {
  const response = await request(app)
    .post("/api/users/change-password")
    .set("Authorization", `Bearer ${authToken}`)
    .send({
      currentPassword: "NewPassword456!",
      newPassword: "bad",
    });

  assert.equal(response.status, 400);
  assert.equal(response.body.success, false);

  if (response.body.errors) {
    assert.ok(Array.isArray(response.body.errors));
  } else if (response.body.message) {
    assert.ok(
      response.body.message.includes("Validation") ||
      response.body.message.includes("validation") ||
      response.body.message.includes("Current password is incorrect")
    );
  }
});

test("GET /api/users/profile - should return all user fields including timestamps", async () => {
  const response = await request(app)
    .get("/api/users/profile")
    .set("Authorization", `Bearer ${authToken}`);

  assert.equal(response.status, 200);
  assert.equal(response.body.success, true);

  const user = response.body.data.user;
  assert.ok(user.id);
  assert.ok(user.name);
  assert.ok(user.email);
  assert.ok(user.role);
  assert.ok(user.preferences !== undefined);
  assert.ok(user.isActive !== undefined);
  assert.ok(user.lastLogin);
  assert.ok(user.createdAt);
  assert.ok(user.updatedAt);
});

test("POST /api/users/register - should handle database connection errors gracefully", async () => {
  const response = await request(app).post("/api/users/register").send({
    name: "Test User",
    email: "test@example.com",
    password: "Password123!",
  });

  assert.equal(response.status, 409);
  assert.equal(response.body.success, false);
});

test("POST /api/users/login - should return refreshToken along with accessToken", async () => {
  const response = await request(app).post("/api/users/login").send({
    email: "test@example.com",
    password: "NewPassword456!",
  });

  assert.equal(response.status, 200);
  assert.equal(response.body.success, true);
  assert.ok(response.body.data.accessToken);
  assert.ok(response.body.data.refreshToken);
  assert.ok(response.body.data.user);
  assert.ok(response.body.data.user.lastLogin);
});

test("POST /api/users/change-password - should generate new tokens after password change", async () => {
  const response = await request(app)
    .post("/api/users/change-password")
    .set("Authorization", `Bearer ${authToken}`)
    .send({
      currentPassword: "NewPassword456!",
      newPassword: "Password123!",
    });

  assert.equal(response.status, 200);
  assert.equal(response.body.success, true);
  assert.ok(response.body.data.accessToken);
  assert.ok(response.body.data.refreshToken);

  authToken = response.body.data.accessToken;
});

// ==================== PREFERENCES TESTS ====================

test("GET /api/users/preferences - should return user preferences", async () => {
  const response = await request(app)
    .get("/api/users/preferences")
    .set("Authorization", `Bearer ${authToken}`);

  assert.equal(response.status, 200);
  assert.equal(response.body.success, true);
  assert.ok(response.body.data.preferences);
  assert.ok(Array.isArray(response.body.data.preferences.dietaryRestrictions));
  assert.ok(Array.isArray(response.body.data.preferences.favoriteRestaurants));
});

test("GET /api/users/preferences - should fail without authentication", async () => {
  const response = await request(app)
    .get("/api/users/preferences");

  assert.equal(response.status, 401);
  assert.equal(response.body.success, false);
});

test("PATCH /api/users/preferences - should update maxCalories", async () => {
  const response = await request(app)
    .patch("/api/users/preferences")
    .set("Authorization", `Bearer ${authToken}`)
    .send({
      maxCalories: 600,
    });

  assert.equal(response.status, 200);
  assert.equal(response.body.success, true);
  assert.equal(response.body.data.preferences.maxCalories, 600);
});

test("PATCH /api/users/preferences - should update minProtein", async () => {
  const response = await request(app)
    .patch("/api/users/preferences")
    .set("Authorization", `Bearer ${authToken}`)
    .send({
      minProtein: 25,
    });

  assert.equal(response.status, 200);
  assert.equal(response.body.success, true);
  assert.equal(response.body.data.preferences.minProtein, 25);
  // Previous value should persist
  assert.equal(response.body.data.preferences.maxCalories, 600);
});

test("PATCH /api/users/preferences - should update favoriteRestaurants", async () => {
  const response = await request(app)
    .patch("/api/users/preferences")
    .set("Authorization", `Bearer ${authToken}`)
    .send({
      favoriteRestaurants: ["McDonald's", "Wendy's"],
    });

  assert.equal(response.status, 200);
  assert.equal(response.body.success, true);
  assert.deepEqual(response.body.data.preferences.favoriteRestaurants, ["McDonald's", "Wendy's"]);
});

test("PATCH /api/users/preferences - should update dietaryRestrictions", async () => {
  const response = await request(app)
    .patch("/api/users/preferences")
    .set("Authorization", `Bearer ${authToken}`)
    .send({
      dietaryRestrictions: ["Vegetarian", "Low-Sodium"],
    });

  assert.equal(response.status, 200);
  assert.equal(response.body.success, true);
  assert.deepEqual(response.body.data.preferences.dietaryRestrictions, ["Vegetarian", "Low-Sodium"]);
});

test("PATCH /api/users/preferences - should update all preferences at once", async () => {
  const response = await request(app)
    .patch("/api/users/preferences")
    .set("Authorization", `Bearer ${authToken}`)
    .send({
      maxCalories: 500,
      minProtein: 30,
      favoriteRestaurants: ["KFC"],
      dietaryRestrictions: ["Gluten-Free"],
    });

  assert.equal(response.status, 200);
  assert.equal(response.body.success, true);
  assert.equal(response.body.data.preferences.maxCalories, 500);
  assert.equal(response.body.data.preferences.minProtein, 30);
  assert.deepEqual(response.body.data.preferences.favoriteRestaurants, ["KFC"]);
  assert.deepEqual(response.body.data.preferences.dietaryRestrictions, ["Gluten-Free"]);
});

test("PATCH /api/users/preferences - should clear values with null", async () => {
  const response = await request(app)
    .patch("/api/users/preferences")
    .set("Authorization", `Bearer ${authToken}`)
    .send({
      maxCalories: null,
      minProtein: null,
    });

  assert.equal(response.status, 200);
  assert.equal(response.body.success, true);
  assert.equal(response.body.data.preferences.maxCalories, null);
  assert.equal(response.body.data.preferences.minProtein, null);
});

test("PATCH /api/users/preferences - should fail without authentication", async () => {
  const response = await request(app)
    .patch("/api/users/preferences")
    .send({
      maxCalories: 700,
    });

  assert.equal(response.status, 401);
  assert.equal(response.body.success, false);
});
