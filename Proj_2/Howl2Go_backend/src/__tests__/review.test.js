import { describe, test, expect, beforeAll, afterAll, beforeEach } from "@jest/globals";
import assert from "node:assert/strict";
import request from "supertest";
import mongoose from "mongoose";
import app from "../app.js";
import User from "../models/User.js";
import Review from "../models/Review.js";
import FastFoodItem from "../models/FastFoodItem.js";
import { generateAccessToken } from "../utils/jwt.util.js";
import connectDB from "../config/database.js";

let testUser;
let otherUser;
let authToken;
let otherAuthToken;
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
  await Review.deleteMany({});
  await FastFoodItem.deleteMany({});

  // Create test users
  testUser = await User.create({
    name: "Test User",
    email: "test@example.com",
    password: "Password123!",
  });

  otherUser = await User.create({
    name: "Other User",
    email: "other@example.com",
    password: "Password123!",
  });

  authToken = generateAccessToken(testUser._id, testUser.email, testUser.role);
  otherAuthToken = generateAccessToken(otherUser._id, otherUser.email, otherUser.role);

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
});

// Cleanup after tests
afterAll(async () => {
  await User.deleteMany({});
  await Review.deleteMany({});
  await FastFoodItem.deleteMany({});
  await mongoose.connection.close();
});

// Clean up between tests
beforeEach(async () => {
  await Review.deleteMany({});
});

describe("Review API Tests", () => {
  describe("POST /api/reviews - Create Review", () => {
    test("should create a review successfully", async () => {
      const response = await request(app)
        .post("/api/reviews")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          foodItemId: testFoodItem._id.toString(),
          rating: 5,
          comment: "Great burger!",
        });

      assert.equal(response.status, 201);
      assert.equal(response.body.success, true);
      assert.ok(response.body.data.review);
      assert.equal(response.body.data.review.rating, 5);
      assert.equal(response.body.data.review.comment, "Great burger!");
      assert.equal(response.body.data.review.userId.toString(), testUser._id.toString());
    });

    test("should return 400 if rating is missing", async () => {
      const response = await request(app)
        .post("/api/reviews")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          foodItemId: testFoodItem._id.toString(),
          comment: "Great burger!",
        });

      assert.equal(response.status, 400);
      assert.equal(response.body.success, false);
    });

    test("should return 400 if foodItemId is missing", async () => {
      const response = await request(app)
        .post("/api/reviews")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          rating: 5,
          comment: "Great burger!",
        });

      assert.equal(response.status, 400);
      assert.equal(response.body.success, false);
    });

    test("should return 404 if food item doesn't exist", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .post("/api/reviews")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          foodItemId: fakeId.toString(),
          rating: 5,
        });

      assert.equal(response.status, 404);
    });

    test("should return 409 if user already reviewed the item", async () => {
      // Create first review
      await Review.create({
        userId: testUser._id,
        foodItemId: testFoodItem._id,
        rating: 5,
        comment: "First review",
      });

      // Try to create another review
      const response = await request(app)
        .post("/api/reviews")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          foodItemId: testFoodItem._id.toString(),
          rating: 4,
          comment: "Second review",
        });

      assert.equal(response.status, 409);
      assert.equal(response.body.success, false);
    });

    test("should return 401 if not authenticated", async () => {
      const response = await request(app).post("/api/reviews").send({
        foodItemId: testFoodItem._id.toString(),
        rating: 5,
      });

      assert.equal(response.status, 401);
    });

    test("should validate rating range (1-5)", async () => {
      const response = await request(app)
        .post("/api/reviews")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          foodItemId: testFoodItem._id.toString(),
          rating: 6,
        });

      assert.equal(response.status, 400);
    });
  });

  describe("GET /api/reviews/food/:foodItemId - Get Reviews for Food Item", () => {
    test("should get reviews for a food item", async () => {
      // Create reviews
      await Review.create({
        userId: testUser._id,
        foodItemId: testFoodItem._id,
        rating: 5,
        comment: "Great!",
      });

      await Review.create({
        userId: otherUser._id,
        foodItemId: testFoodItem._id,
        rating: 4,
        comment: "Good!",
      });

      const response = await request(app).get(
        `/api/reviews/food/${testFoodItem._id}`
      );

      assert.equal(response.status, 200);
      assert.equal(response.body.success, true);
      assert.ok(response.body.data.reviews);
      assert.equal(response.body.data.reviews.length, 2);
      assert.ok(response.body.data.stats);
      assert.equal(response.body.data.stats.totalReviews, 2);
      assert.equal(response.body.data.stats.averageRating, 4.5);
    });

    test("should return empty reviews if none exist", async () => {
      const newFoodItem = await FastFoodItem.create({
        restaurant: "New Restaurant",
        item: "New Item",
        calories: 300,
        price: 5.99,
      });

      const response = await request(app).get(
        `/api/reviews/food/${newFoodItem._id}`
      );

      assert.equal(response.status, 200);
      assert.equal(response.body.data.reviews.length, 0);
      assert.equal(response.body.data.stats.totalReviews, 0);
    });
  });

  describe("PATCH /api/reviews/:reviewId - Update Review", () => {
    test("should update own review successfully", async () => {
      const review = await Review.create({
        userId: testUser._id,
        foodItemId: testFoodItem._id,
        rating: 3,
        comment: "Old comment",
      });

      const response = await request(app)
        .patch(`/api/reviews/${review._id}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          rating: 5,
          comment: "Updated comment",
        });

      assert.equal(response.status, 200);
      assert.equal(response.body.success, true);
      assert.equal(response.body.data.review.rating, 5);
      assert.equal(response.body.data.review.comment, "Updated comment");
    });

    test("should return 403 if trying to update another user's review", async () => {
      const review = await Review.create({
        userId: otherUser._id,
        foodItemId: testFoodItem._id,
        rating: 3,
        comment: "Other user's review",
      });

      const response = await request(app)
        .patch(`/api/reviews/${review._id}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          rating: 5,
        });

      assert.equal(response.status, 403);
    });

    test("should return 404 if review doesn't exist", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .patch(`/api/reviews/${fakeId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          rating: 5,
        });

      assert.equal(response.status, 404);
    });
  });

  describe("DELETE /api/reviews/:reviewId - Delete Review", () => {
    test("should delete own review successfully", async () => {
      const review = await Review.create({
        userId: testUser._id,
        foodItemId: testFoodItem._id,
        rating: 3,
        comment: "To be deleted",
      });

      const response = await request(app)
        .delete(`/api/reviews/${review._id}`)
        .set("Authorization", `Bearer ${authToken}`);

      assert.equal(response.status, 200);
      assert.equal(response.body.success, true);

      // Verify it's deleted
      const deletedReview = await Review.findById(review._id);
      assert.equal(deletedReview, null);
    });

    test("should return 403 if trying to delete another user's review", async () => {
      const review = await Review.create({
        userId: otherUser._id,
        foodItemId: testFoodItem._id,
        rating: 3,
        comment: "Other user's review",
      });

      const response = await request(app)
        .delete(`/api/reviews/${review._id}`)
        .set("Authorization", `Bearer ${authToken}`);

      assert.equal(response.status, 403);
    });
  });

  describe("PATCH /api/reviews/:reviewId/helpful - Mark Review Helpful", () => {
    test("should mark review as helpful", async () => {
      const review = await Review.create({
        userId: otherUser._id,
        foodItemId: testFoodItem._id,
        rating: 5,
        comment: "Helpful review",
      });

      const response = await request(app)
        .patch(`/api/reviews/${review._id}/helpful`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ helpful: true });

      assert.equal(response.status, 200);
      assert.equal(response.body.success, true);
      assert.ok(response.body.data.review.helpfulVotes >= 0);
    });
  });
});

