import { describe, test, expect, beforeAll, afterAll, beforeEach } from "@jest/globals";
import assert from "node:assert/strict";
import request from "supertest";
import mongoose from "mongoose";
import app from "../app.js";
import User from "../models/User.js";
import Bug from "../models/Bug.js";
import { generateAccessToken } from "../utils/jwt.util.js";
import connectDB from "../config/database.js";

let testUser;
let adminUser;
let authToken;
let adminToken;

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
  await Bug.deleteMany({});

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
});

// Cleanup after tests
afterAll(async () => {
  await User.deleteMany({});
  await Bug.deleteMany({});
  await mongoose.connection.close();
});

// Clean up between tests
beforeEach(async () => {
  await Bug.deleteMany({});
});

describe("Bug Report API Tests", () => {
  describe("POST /api/bugs - Submit Bug Report", () => {
    test("should submit a bug report successfully (authenticated)", async () => {
      const response = await request(app)
        .post("/api/bugs")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "Test Bug",
          description: "This is a test bug description",
          severity: "Medium",
          assignedTo: "Anandteertha",
        });

      assert.equal(response.status, 201);
      assert.equal(response.body.success, true);
      assert.ok(response.body.data.bugReport);
      assert.equal(response.body.data.bugReport.title, "Test Bug");
      assert.equal(response.body.data.bugReport.status, "Open");
      assert.equal(response.body.data.bugReport.reporterId.toString(), testUser._id.toString());
    });

    test("should submit a bug report anonymously (not authenticated)", async () => {
      const response = await request(app)
        .post("/api/bugs")
        .send({
          title: "Anonymous Bug",
          description: "This is an anonymous bug report",
          severity: "Low",
          reporterEmail: "anonymous@example.com",
          reporterName: "Anonymous User",
        });

      assert.equal(response.status, 201);
      assert.equal(response.body.success, true);
      assert.ok(response.body.data.bugReport);
      assert.equal(response.body.data.bugReport.reporterName, "Anonymous User");
      assert.equal(response.body.data.bugReport.reporterId, null);
    });

    test("should return 400 if title is missing", async () => {
      const response = await request(app)
        .post("/api/bugs")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          description: "Missing title",
        });

      assert.equal(response.status, 400);
    });

    test("should return 400 if description is missing", async () => {
      const response = await request(app)
        .post("/api/bugs")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "Missing description",
        });

      assert.equal(response.status, 400);
    });

    test("should validate severity enum", async () => {
      const response = await request(app)
        .post("/api/bugs")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "Test Bug",
          description: "Test description",
          severity: "Invalid",
        });

      assert.equal(response.status, 400);
    });

    test("should validate assignedTo enum", async () => {
      const response = await request(app)
        .post("/api/bugs")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "Test Bug",
          description: "Test description",
          assignedTo: "InvalidDeveloper",
        });

      assert.equal(response.status, 400);
    });
  });

  describe("GET /api/bugs - Get Bug Reports (Admin Only)", () => {
    test("should get all bug reports as admin", async () => {
      // Create some bug reports
      await Bug.create({
        title: "Bug 1",
        description: "Description 1",
        severity: "High",
        reporterId: testUser._id,
      });

      await Bug.create({
        title: "Bug 2",
        description: "Description 2",
        severity: "Medium",
      });

      const response = await request(app)
        .get("/api/bugs")
        .set("Authorization", `Bearer ${adminToken}`);

      assert.equal(response.status, 200);
      assert.equal(response.body.success, true);
      assert.ok(response.body.data.bugReports);
      assert.ok(Array.isArray(response.body.data.bugReports));
      assert.ok(response.body.data.bugReports.length >= 2);
    });

    test("should return 403 if non-admin tries to access", async () => {
      const response = await request(app)
        .get("/api/bugs")
        .set("Authorization", `Bearer ${authToken}`);

      assert.equal(response.status, 403);
      assert.equal(response.body.success, false);
      assert.ok(response.body.message.includes("Admin"));
    });

    test("should return 401 if not authenticated", async () => {
      const response = await request(app).get("/api/bugs");

      assert.equal(response.status, 401);
    });
  });
});

