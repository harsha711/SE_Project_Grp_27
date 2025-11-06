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
    await User.deleteMany({});
});

// Cleanup after tests
afterAll(async () => {
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
    // Delay to ensure password change is persisted to database
    await new Promise((resolve) => setTimeout(resolve, 500));

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

test("POST /api/users/refresh-token - should fail without refresh token", async () => {
    const response = await request(app)
        .post("/api/users/refresh-token")
        .send({});

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

    assert.equal(response.status, 404);
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

    assert.equal(response.status, 404);
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

// Account Deactivation
