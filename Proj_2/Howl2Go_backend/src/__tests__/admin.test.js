import { describe, test, expect, beforeAll, afterAll } from "@jest/globals";
import assert from "node:assert/strict";
import request from "supertest";
import mongoose from "mongoose";
import app from "../app.js";
import User from "../models/User.js";
import { generateAccessToken } from "../utils/jwt.util.js";
import connectDB from "../config/database.js";

let agent;
let adminUser;
let adminToken;
let normalUser;
let normalToken;

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

  await User.deleteMany({});

  adminUser = await User.create({
    name: "AdminTester",
    email: "admintest@example.com",
    password: "Password123!",
    role: "admin",
  });
  adminToken = generateAccessToken(adminUser._id, adminUser.email, "admin");

  normalUser = await User.create({
    name: "NormalUser",
    email: "normal@example.com",
    password: "Password123!",
    role: "user",
  });
  normalToken = generateAccessToken(normalUser._id, normalUser.email, "user");

  agent = request.agent(app);
});

afterAll(async () => {
  await User.deleteMany({});
  await mongoose.connection.close();
});

test("GET /api/admin/users - admin can list users", async () => {
  const res = await agent
    .get("/api/admin/users")
    .set("Authorization", `Bearer ${adminToken}`);
  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.ok(Array.isArray(res.body.data.users));
  const emails = res.body.data.users.map((u) => u.email);
  assert.ok(emails.includes("admintest@example.com"));
  assert.ok(emails.includes("normal@example.com"));
});

test("GET /api/admin/users - non-admin is forbidden", async () => {
  const res = await agent
    .get("/api/admin/users")
    .set("Authorization", `Bearer ${normalToken}`);
  assert.equal(res.status, 403);
  assert.equal(res.body.success, false);
});

test("POST /api/admin/users/staff - admin can create staff", async () => {
  const payload = {
    name: "Staff One",
    email: "staff1@example.com",
    password: "Password123!",
  };
  const res = await agent
    .post("/api/admin/users/staff")
    .set("Authorization", `Bearer ${adminToken}`)
    .send(payload);
  assert.equal(res.status, 201);
  assert.equal(res.body.success, true);
  assert.equal(res.body.data.user.email, "staff1@example.com");
  assert.equal(res.body.data.user.role, "staff");
});

test("POST /api/admin/users/staff - missing fields returns 400", async () => {
  const res = await agent
    .post("/api/admin/users/staff")
    .set("Authorization", `Bearer ${adminToken}`)
    .send({ email: "no-name@example.com" });
  assert.equal(res.status, 400);
  assert.equal(res.body.success, false);
});

test("POST /api/admin/users/staff - duplicate email returns 409", async () => {
  const payload = {
    name: "Dup",
    email: "staff1@example.com",
    password: "Password123!",
  };
  const res = await agent
    .post("/api/admin/users/staff")
    .set("Authorization", `Bearer ${adminToken}`)
    .send(payload);
  assert.equal(res.status, 409);
  assert.equal(res.body.success, false);
});

test("PATCH /api/admin/users/:id - admin can update user but cannot escalate to admin", async () => {
  const user = await User.create({
    name: "ToUpdate",
    email: "toupdate@example.com",
    password: "Password123!",
    role: "user",
  });
  const res = await agent
    .patch(`/api/admin/users/${user._id}`)
    .set("Authorization", `Bearer ${adminToken}`)
    .send({ name: "Updated", role: "admin" });

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.equal(res.body.data.user.name, "Updated");
  assert.notEqual(res.body.data.user.role, "admin");
});

test("PATCH /api/admin/users/:id - non-existent returns 404", async () => {
  const fakeId = new mongoose.Types.ObjectId();
  const res = await agent
    .patch(`/api/admin/users/${fakeId}`)
    .set("Authorization", `Bearer ${adminToken}`)
    .send({ name: "NoOne" });
  assert.equal(res.status, 404);
  assert.equal(res.body.success, false);
});

test("DELETE /api/admin/users/:id - admin can deactivate user", async () => {
  const user = await User.create({
    name: "ToDelete",
    email: "todelete@example.com",
    password: "Password123!",
    role: "user",
  });
  const res = await agent
    .delete(`/api/admin/users/${user._id}`)
    .set("Authorization", `Bearer ${adminToken}`);
  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);

  const reloaded = await User.findById(user._id);
  assert.ok(reloaded);
  assert.equal(reloaded.isActive, false);
});

test("DELETE /api/admin/users/:id - non-existent returns 404", async () => {
  const fakeId = new mongoose.Types.ObjectId();
  const res = await agent
    .delete(`/api/admin/users/${fakeId}`)
    .set("Authorization", `Bearer ${adminToken}`);
  assert.equal(res.status, 404);
  assert.equal(res.body.success, false);
});
