import { describe, test, expect, beforeAll, afterAll, beforeEach } from "@jest/globals";
import assert from "node:assert";
import request from "supertest";
import app from "../app.js";
import Cart from "../models/Cart.js";
import FastFoodItem from "../models/FastFoodItem.js";
import connectDB from "../config/database.js";
import mongoose from "mongoose";

describe("Cart API Tests", () => {
    let agent;
    let testFoodItem;

    beforeAll(async () => {
        // Connect to test database
        await connectDB();

        // SAFETY CHECK: Prevent running tests against production database
        const dbName = mongoose.connection.name;
        if (!dbName || (!dbName.includes('test') && process.env.NODE_ENV !== 'test')) {
            throw new Error(
                `DANGER: Tests are trying to run against non-test database: "${dbName}". ` +
                `Database name must include "test" or NODE_ENV must be "test". ` +
                `Current NODE_ENV: "${process.env.NODE_ENV}"`
            );
        }

        console.log(`Running tests against database: ${dbName}`);

        // Create a test food item
        testFoodItem = await FastFoodItem.create({
            company: "Test Restaurant",
            item: "Test Burger",
            calories: 500,
            totalFat: 20,
            protein: 25,
            carbs: 40,
        });
    });

    afterAll(async () => {
        // Clean up test data
        await FastFoodItem.deleteMany({ company: "Test Restaurant" });
        await Cart.deleteMany({});
        await mongoose.connection.close();
    });

    beforeEach(() => {
        // Create a new agent for each test to maintain session
        agent = request.agent(app);
    });

    describe("GET /api/cart", () => {
        test("should return empty cart for new session", async () => {
            const response = await agent.get("/api/cart");

            assert.strictEqual(response.status, 200);
            assert.strictEqual(response.body.success, true);
            assert.strictEqual(response.body.data.cart.totalItems, 0);
            assert.strictEqual(response.body.data.cart.totalPrice, 0);
            assert.strictEqual(response.body.data.cart.items.length, 0);
        });
    });

    describe("POST /api/cart/items", () => {
        test("should add item to cart", async () => {
            const response = await agent.post("/api/cart/items").send({
                foodItemId: testFoodItem._id.toString(),
                quantity: 2,
            });

            assert.strictEqual(response.status, 200);
            assert.strictEqual(response.body.success, true);
            assert.strictEqual(response.body.data.cart.totalItems, 2);
            assert.strictEqual(response.body.data.cart.items.length, 1);
            assert.strictEqual(response.body.data.cart.items[0].quantity, 2);
        });

        test("should increase quantity when adding same item twice", async () => {
            // Add item first time
            await agent.post("/api/cart/items").send({
                foodItemId: testFoodItem._id.toString(),
                quantity: 1,
            });

            // Add same item again
            const response = await agent.post("/api/cart/items").send({
                foodItemId: testFoodItem._id.toString(),
                quantity: 2,
            });

            assert.strictEqual(response.status, 200);
            assert.strictEqual(response.body.data.cart.totalItems, 3);
            assert.strictEqual(response.body.data.cart.items[0].quantity, 3);
        });

        test("should return 400 if foodItemId is missing", async () => {
            const response = await agent
                .post("/api/cart/items")
                .send({ quantity: 1 });

            assert.strictEqual(response.status, 400);
            assert.strictEqual(response.body.success, false);
        });

        test("should return 404 if food item does not exist", async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const response = await agent.post("/api/cart/items").send({
                foodItemId: fakeId.toString(),
                quantity: 1,
            });

            assert.strictEqual(response.status, 404);
            assert.strictEqual(response.body.success, false);
        });
    });

    describe("PATCH /api/cart/items/:foodItemId", () => {
        test("should update item quantity", async () => {
            // Add item first
            await agent.post("/api/cart/items").send({
                foodItemId: testFoodItem._id.toString(),
                quantity: 1,
            });

            // Update quantity
            const response = await agent
                .patch(`/api/cart/items/${testFoodItem._id}`)
                .send({ quantity: 5 });

            assert.strictEqual(response.status, 200);
            assert.strictEqual(response.body.data.cart.totalItems, 5);
            assert.strictEqual(response.body.data.cart.items[0].quantity, 5);
        });

        test("should remove item when quantity is 0", async () => {
            // Add item first
            await agent.post("/api/cart/items").send({
                foodItemId: testFoodItem._id.toString(),
                quantity: 2,
            });

            // Set quantity to 0
            const response = await agent
                .patch(`/api/cart/items/${testFoodItem._id}`)
                .send({ quantity: 0 });

            assert.strictEqual(response.status, 200);
            assert.strictEqual(response.body.data.cart.totalItems, 0);
            assert.strictEqual(response.body.data.cart.items.length, 0);
        });
    });

    describe("DELETE /api/cart/items/:foodItemId", () => {
        test("should remove item from cart", async () => {
            // Add item first
            await agent.post("/api/cart/items").send({
                foodItemId: testFoodItem._id.toString(),
                quantity: 3,
            });

            // Remove item
            const response = await agent.delete(
                `/api/cart/items/${testFoodItem._id}`
            );

            assert.strictEqual(response.status, 200);
            assert.strictEqual(response.body.data.cart.totalItems, 0);
            assert.strictEqual(response.body.data.cart.items.length, 0);
        });
    });

    describe("DELETE /api/cart", () => {
        test("should clear entire cart", async () => {
            // Add item first
            await agent.post("/api/cart/items").send({
                foodItemId: testFoodItem._id.toString(),
                quantity: 5,
            });

            // Clear cart
            const response = await agent.delete("/api/cart");

            assert.strictEqual(response.status, 200);
            assert.strictEqual(response.body.data.cart.totalItems, 0);
            assert.strictEqual(response.body.data.cart.items.length, 0);
        });
    });

    describe("Session persistence", () => {
        test("should maintain cart across multiple requests", async () => {
            // Add first item
            await agent.post("/api/cart/items").send({
                foodItemId: testFoodItem._id.toString(),
                quantity: 2,
            });

            // Get cart in separate request
            const response = await agent.get("/api/cart");

            assert.strictEqual(response.status, 200);
            assert.strictEqual(response.body.data.cart.totalItems, 2);
            assert.strictEqual(response.body.data.cart.items.length, 1);
        });
    });

    describe("Error Handling Tests", () => {
        test("POST /api/cart/items - should handle invalid foodItemId format", async () => {
            const response = await agent.post("/api/cart/items").send({
                foodItemId: "invalid-id-format",
                quantity: 1,
            });

            expect(response.status).toBeGreaterThanOrEqual(400);
            assert.strictEqual(response.body.success, false);
        });

        test("POST /api/cart/items - should handle missing quantity", async () => {
            const response = await agent.post("/api/cart/items").send({
                foodItemId: testFoodItem._id.toString(),
            });

            expect(response.status).toBeGreaterThanOrEqual(400);
            assert.strictEqual(response.body.success, false);
        });

        test("POST /api/cart/items - should handle negative quantity", async () => {
            const response = await agent.post("/api/cart/items").send({
                foodItemId: testFoodItem._id.toString(),
                quantity: -1,
            });

            expect(response.status).toBeGreaterThanOrEqual(400);
            assert.strictEqual(response.body.success, false);
        });

        test("POST /api/cart/items - should handle zero quantity", async () => {
            const response = await agent.post("/api/cart/items").send({
                foodItemId: testFoodItem._id.toString(),
                quantity: 0,
            });

            expect(response.status).toBeGreaterThanOrEqual(400);
            assert.strictEqual(response.body.success, false);
        });

        test("PATCH /api/cart/items/:id - should handle invalid item ID", async () => {
            const response = await agent
                .patch("/api/cart/items/invalid-id")
                .send({ quantity: 5 });

            expect(response.status).toBeGreaterThanOrEqual(400);
            assert.strictEqual(response.body.success, false);
        });

        test("PATCH /api/cart/items/:id - should handle non-existent item", async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const response = await agent
                .patch(`/api/cart/items/${fakeId}`)
                .send({ quantity: 5 });

            expect(response.status).toBeGreaterThanOrEqual(400);
            assert.strictEqual(response.body.success, false);
        });

        test("PATCH /api/cart/items/:id - should handle negative quantity update", async () => {
            // Add item first
            await agent.post("/api/cart/items").send({
                foodItemId: testFoodItem._id.toString(),
                quantity: 2,
            });

            const response = await agent
                .patch(`/api/cart/items/${testFoodItem._id}`)
                .send({ quantity: -5 });

            expect(response.status).toBeGreaterThanOrEqual(400);
            assert.strictEqual(response.body.success, false);
        });

        test("DELETE /api/cart/items/:id - should handle invalid item ID", async () => {
            const response = await agent.delete("/api/cart/items/invalid-id");

            expect(response.status).toBeGreaterThanOrEqual(400);
            assert.strictEqual(response.body.success, false);
        });

        test("DELETE /api/cart/items/:id - should handle non-existent item", async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const response = await agent.delete(`/api/cart/items/${fakeId}`);

            expect(response.status).toBeGreaterThanOrEqual(400);
            assert.strictEqual(response.body.success, false);
        });
    });

    describe("Cart Calculations", () => {
        test("should calculate total price correctly", async () => {
            // Add items
            await agent.post("/api/cart/items").send({
                foodItemId: testFoodItem._id.toString(),
                quantity: 2,
            });

            const response = await agent.get("/api/cart");

            assert.strictEqual(response.status, 200);
            expect(response.body.data.cart.totalPrice).toBeGreaterThan(0);
            assert.strictEqual(response.body.data.cart.totalItems, 2);
        });

        test("should calculate total calories correctly", async () => {
            await agent.post("/api/cart/items").send({
                foodItemId: testFoodItem._id.toString(),
                quantity: 2,
            });

            const response = await agent.get("/api/cart");

            assert.strictEqual(response.status, 200);
            expect(response.body.data.cart.totalCalories).toBe(testFoodItem.calories * 2);
        });

        test("should recalculate totals when quantity changes", async () => {
            // Add item
            await agent.post("/api/cart/items").send({
                foodItemId: testFoodItem._id.toString(),
                quantity: 1,
            });

            const initialResponse = await agent.get("/api/cart");
            const initialTotal = initialResponse.body.data.cart.totalItems;

            // Update quantity
            await agent
                .patch(`/api/cart/items/${testFoodItem._id}`)
                .send({ quantity: 3 });

            const updatedResponse = await agent.get("/api/cart");
            const updatedTotal = updatedResponse.body.data.cart.totalItems;

            assert.strictEqual(initialTotal, 1);
            assert.strictEqual(updatedTotal, 3);
        });
    });

    describe("Multiple Items", () => {
        let secondFoodItem;

        beforeAll(async () => {
            secondFoodItem = await FastFoodItem.create({
                company: "Test Restaurant",
                item: "Test Fries",
                calories: 300,
                totalFat: 15,
                protein: 5,
                carbs: 35,
            });
        });

        test("should handle multiple different items in cart", async () => {
            // Add first item
            await agent.post("/api/cart/items").send({
                foodItemId: testFoodItem._id.toString(),
                quantity: 2,
            });

            // Add second item
            await agent.post("/api/cart/items").send({
                foodItemId: secondFoodItem._id.toString(),
                quantity: 1,
            });

            const response = await agent.get("/api/cart");

            assert.strictEqual(response.status, 200);
            assert.strictEqual(response.body.data.cart.items.length, 2);
            assert.strictEqual(response.body.data.cart.totalItems, 3);
        });

        test("should remove specific item without affecting others", async () => {
            // Add two items
            await agent.post("/api/cart/items").send({
                foodItemId: testFoodItem._id.toString(),
                quantity: 2,
            });
            await agent.post("/api/cart/items").send({
                foodItemId: secondFoodItem._id.toString(),
                quantity: 1,
            });

            // Remove first item
            await agent.delete(`/api/cart/items/${testFoodItem._id}`);

            const response = await agent.get("/api/cart");

            assert.strictEqual(response.status, 200);
            assert.strictEqual(response.body.data.cart.items.length, 1);
            assert.strictEqual(response.body.data.cart.totalItems, 1);
            assert.strictEqual(
                response.body.data.cart.items[0].foodItem.toString(),
                secondFoodItem._id.toString()
            );
        });
    });
});
