// import test from 'node:test';
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
let adminToken;
let adminUser;

// Setup before tests
test.before(async () => {
    await connectDB();
    await User.deleteMany({});

    // Create admin user for admin tests
    adminUser = await User.create({
        name: "Admin User",
        email: "admin@example.com",
        password: "AdminPass123!",
        role: "admin",
    });
    adminToken = generateAccessToken(adminUser._id, adminUser.email, "admin");
});

// Cleanup after tests
test.after(async () => {
    await User.deleteMany({});
    await mongoose.connection.close();
});

// Registration Tests
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

// Login Tests
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

// Profile Tests
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

// Update Profile Tests
test("PATCH /api/users/profile - should update profile successfully", async () => {
    const response = await request(app)
        .patch("/api/users/profile")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
            name: "Updated Test User",
            preferences: {
                dietaryRestrictions: ["vegetarian"],
                maxCalories: 2000,
            },
        });

    assert.equal(response.status, 200);
    assert.equal(response.body.success, true);
    assert.equal(response.body.data.user.name, "Updated Test User");
    assert.deepEqual(response.body.data.user.preferences.dietaryRestrictions, [
        "vegetarian",
    ]);
    assert.equal(response.body.data.user.preferences.maxCalories, 2000);
});

test("PATCH /api/users/profile - should not update email", async () => {
    await request(app)
        .patch("/api/users/profile")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
            email: "newemail@example.com",
        });

    const user = await User.findOne({ email: "test@example.com" });
    assert.ok(user);
    assert.equal(user.email, "test@example.com");
});

// Password Change Tests
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
    const response = await request(app).post("/api/users/login").send({
        email: "test@example.com",
        password: "NewPassword456!",
    });

    assert.equal(response.status, 200);
    assert.equal(response.body.success, true);
});

// Refresh Token Tests
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

// Admin - Get All Users
test("GET /api/users - should get all users as admin", async () => {
    const response = await request(app)
        .get("/api/users")
        .set("Authorization", `Bearer ${adminToken}`);

    assert.equal(response.status, 200);
    assert.equal(response.body.success, true);
    assert.ok(Array.isArray(response.body.data.users));
    assert.ok(response.body.data.users.length > 0);
    assert.ok(response.body.data.pagination);
});

test("GET /api/users - should fail as regular user", async () => {
    const response = await request(app)
        .get("/api/users")
        .set("Authorization", `Bearer ${authToken}`);

    assert.equal(response.status, 403);
    assert.equal(response.body.success, false);
});

test("GET /api/users?role=admin - should filter users by role", async () => {
    const response = await request(app)
        .get("/api/users?role=admin")
        .set("Authorization", `Bearer ${adminToken}`);

    assert.equal(response.status, 200);
    assert.ok(response.body.data.users.every((u) => u.role === "admin"));
});

// Admin - Get User by ID
test("GET /api/users/:id - should get user by ID as admin", async () => {
    const response = await request(app)
        .get(`/api/users/${testUser.id}`)
        .set("Authorization", `Bearer ${adminToken}`);

    assert.equal(response.status, 200);
    assert.equal(response.body.success, true);
    assert.equal(response.body.data.user.email, "test@example.com");
});

test("GET /api/users/:id - should fail as regular user", async () => {
    const response = await request(app)
        .get(`/api/users/${testUser.id}`)
        .set("Authorization", `Bearer ${authToken}`);

    assert.equal(response.status, 403);
    assert.equal(response.body.success, false);
});

// Admin - Update User by ID
test("PATCH /api/users/:id - should update user as admin", async () => {
    const response = await request(app)
        .patch(`/api/users/${testUser.id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
            name: "Admin Updated Name",
        });

    assert.equal(response.status, 200);
    assert.equal(response.body.success, true);
    assert.equal(response.body.data.user.name, "Admin Updated Name");
});

test("PATCH /api/users/:id - should fail as regular user", async () => {
    const response = await request(app)
        .patch(`/api/users/${testUser.id}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
            name: "Unauthorized Update",
        });

    assert.equal(response.status, 403);
    assert.equal(response.body.success, false);
});

// Account Deactivation
test("DELETE /api/users/profile - should deactivate account", async () => {
    const registerResponse = await request(app)
        .post("/api/users/register")
        .send({
            name: "Temp User",
            email: "temp@example.com",
            password: "TempPass123!",
        });
    const tempToken = registerResponse.body.data.accessToken;

    const response = await request(app)
        .delete("/api/users/profile")
        .set("Authorization", `Bearer ${tempToken}`);

    assert.equal(response.status, 200);
    assert.equal(response.body.success, true);

    const user = await User.findOne({ email: "temp@example.com" });
    assert.equal(user.isActive, false);
});

test("POST /api/users/login - should fail with deactivated account", async () => {
    const response = await request(app).post("/api/users/login").send({
        email: "temp@example.com",
        password: "TempPass123!",
    });

    assert.equal(response.status, 401);
    assert.equal(response.body.success, false);
    assert.match(response.body.message, /deactivated/i);
});

// Admin - Delete User by ID
test("DELETE /api/users/:id - should fail as regular user", async () => {
    const response = await request(app)
        .delete(`/api/users/${testUser.id}`)
        .set("Authorization", `Bearer ${authToken}`);

    assert.equal(response.status, 403);
    assert.equal(response.body.success, false);
});

test("DELETE /api/users/:id - should delete user as admin", async () => {
    const response = await request(app)
        .delete(`/api/users/${testUser.id}`)
        .set("Authorization", `Bearer ${adminToken}`);

    assert.equal(response.status, 200);
    assert.equal(response.body.success, true);

    const user = await User.findById(testUser.id);
    assert.equal(user, null);
});
