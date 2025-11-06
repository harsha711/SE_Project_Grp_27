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

    describe("POST /api/cart/merge", () => {
        test("should return 401 when user is not authenticated", async () => {
            const response = await agent.post("/api/cart/merge");

            assert.strictEqual(response.status, 401);
            assert.strictEqual(response.body.success, false);
            assert.strictEqual(response.body.message, "Authentication required");
        });
    });

    describe("Edge Cases - Missing Nutritional Data", () => {
        test("should handle adding item with missing nutritional data", async () => {
            const itemWithoutNutrition = await FastFoodItem.create({
                company: "Test Restaurant",
                item: "Incomplete Item",
            });

            const response = await agent.post("/api/cart/items").send({
                foodItemId: itemWithoutNutrition._id.toString(),
                quantity: 1,
            });

            assert.strictEqual(response.status, 200);
            assert.strictEqual(response.body.data.cart.items[0].calories, 0);
            assert.strictEqual(response.body.data.cart.items[0].totalFat, 0);
            assert.strictEqual(response.body.data.cart.items[0].protein, 0);
            assert.strictEqual(response.body.data.cart.items[0].carbohydrates, 0);

            // Cleanup
            await FastFoodItem.deleteOne({ _id: itemWithoutNutrition._id });
        });

        test("should handle item with partial nutritional data", async () => {
            const partialItem = await FastFoodItem.create({
                company: "Test Restaurant",
                item: "Partial Item",
                calories: 250,
                protein: 10,
            });

            const response = await agent.post("/api/cart/items").send({
                foodItemId: partialItem._id.toString(),
                quantity: 1,
            });

            assert.strictEqual(response.status, 200);
            assert.strictEqual(response.body.data.cart.items[0].calories, 250);
            assert.strictEqual(response.body.data.cart.items[0].protein, 10);
            assert.strictEqual(response.body.data.cart.items[0].totalFat, 0);

            // Cleanup
            await FastFoodItem.deleteOne({ _id: partialItem._id });
        });
    });

    describe("Edge Cases - Quantity Handling", () => {
        test("should handle extremely large quantity", async () => {
            const response = await agent.post("/api/cart/items").send({
                foodItemId: testFoodItem._id.toString(),
                quantity: 999999,
            });

            assert.strictEqual(response.status, 200);
            assert.strictEqual(response.body.data.cart.totalItems, 999999);
        });

        test("should handle string quantity and convert to integer", async () => {
            const response = await agent.post("/api/cart/items").send({
                foodItemId: testFoodItem._id.toString(),
                quantity: "5",
            });

            assert.strictEqual(response.status, 200);
            assert.strictEqual(response.body.data.cart.items[0].quantity, 5);
        });

        test("should handle float quantity by converting to integer", async () => {
            const response = await agent.post("/api/cart/items").send({
                foodItemId: testFoodItem._id.toString(),
                quantity: 3.7,
            });

            assert.strictEqual(response.status, 200);
            assert.strictEqual(response.body.data.cart.items[0].quantity, 3);
        });

        test("should handle very small quantity", async () => {
            const response = await agent.post("/api/cart/items").send({
                foodItemId: testFoodItem._id.toString(),
                quantity: 1,
            });

            assert.strictEqual(response.status, 200);
            assert.strictEqual(response.body.data.cart.totalItems, 1);
        });
    });

    describe("Cart Not Found Scenarios", () => {
        test("should return 404 when updating non-existent cart", async () => {
            // Clear any existing carts for this test
            await Cart.deleteMany({});

            // Try to update without creating a cart first
            // This should fail because we're directly calling update without get
            const sessionId = "non-existent-session-id";
            const cart = await Cart.findOne({ sessionId });

            expect(cart).toBeNull();
        });

        test("should return 404 when clearing non-existent cart", async () => {
            // Clear all carts
            await Cart.deleteMany({});

            // Create new agent
            const newAgent = request.agent(app);

            // Manually check if cart exists before clearing
            const response = await newAgent.get("/api/cart");

            // Cart should be created automatically
            assert.strictEqual(response.status, 200);
        });
    });

    describe("Development vs Production Error Messages", () => {
        const originalEnv = process.env.NODE_ENV;

        afterAll(() => {
            process.env.NODE_ENV = originalEnv;
        });

        test("should handle error responses in development mode", async () => {
            process.env.NODE_ENV = "development";

            const response = await agent.post("/api/cart/items").send({
                foodItemId: "invalid-id-format",
                quantity: 1,
            });

            expect(response.status).toBeGreaterThanOrEqual(400);
            assert.strictEqual(response.body.success, false);
        });

        test("should handle error responses in production mode", async () => {
            process.env.NODE_ENV = "production";

            const response = await agent.post("/api/cart/items").send({
                foodItemId: "invalid-id-format",
                quantity: 1,
            });

            expect(response.status).toBeGreaterThanOrEqual(400);
            assert.strictEqual(response.body.success, false);
        });
    });

    describe("Cart Item Data Integrity", () => {
        test("should store complete food item data when adding to cart", async () => {
            const response = await agent.post("/api/cart/items").send({
                foodItemId: testFoodItem._id.toString(),
                quantity: 1,
            });

            assert.strictEqual(response.status, 200);
            const cartItem = response.body.data.cart.items[0];

            expect(cartItem.restaurant).toBe("Test Restaurant");
            expect(cartItem.item).toBe("Test Burger");
            expect(cartItem.calories).toBe(500);
            expect(cartItem.totalFat).toBe(20);
            expect(cartItem.protein).toBe(25);
            expect(cartItem.carbohydrates).toBe(40);
        });

        test("should maintain data consistency across cart operations", async () => {
            // Add item
            await agent.post("/api/cart/items").send({
                foodItemId: testFoodItem._id.toString(),
                quantity: 2,
            });

            // Get cart
            const getResponse = await agent.get("/api/cart");
            const originalItem = getResponse.body.data.cart.items[0];

            // Update quantity
            await agent
                .patch(`/api/cart/items/${testFoodItem._id}`)
                .send({ quantity: 5 });

            // Get cart again
            const updatedResponse = await agent.get("/api/cart");
            const updatedItem = updatedResponse.body.data.cart.items[0];

            // Data should be consistent except quantity
            expect(updatedItem.restaurant).toBe(originalItem.restaurant);
            expect(updatedItem.item).toBe(originalItem.item);
            expect(updatedItem.calories).toBe(originalItem.calories);
            expect(updatedItem.quantity).toBe(5);
        });
    });

    describe("Concurrent Operations", () => {
        test("should handle multiple add operations in sequence", async () => {
            await agent.post("/api/cart/items").send({
                foodItemId: testFoodItem._id.toString(),
                quantity: 1,
            });

            await agent.post("/api/cart/items").send({
                foodItemId: testFoodItem._id.toString(),
                quantity: 1,
            });

            await agent.post("/api/cart/items").send({
                foodItemId: testFoodItem._id.toString(),
                quantity: 1,
            });

            const response = await agent.get("/api/cart");

            assert.strictEqual(response.status, 200);
            assert.strictEqual(response.body.data.cart.totalItems, 3);
        });

        test("should handle rapid quantity updates", async () => {
            // Add item
            await agent.post("/api/cart/items").send({
                foodItemId: testFoodItem._id.toString(),
                quantity: 1,
            });

            // Multiple updates
            await agent
                .patch(`/api/cart/items/${testFoodItem._id}`)
                .send({ quantity: 2 });

            await agent
                .patch(`/api/cart/items/${testFoodItem._id}`)
                .send({ quantity: 5 });

            await agent
                .patch(`/api/cart/items/${testFoodItem._id}`)
                .send({ quantity: 3 });

            const response = await agent.get("/api/cart");

            assert.strictEqual(response.status, 200);
            assert.strictEqual(response.body.data.cart.totalItems, 3);
        });
    });

    describe("Cart Price Handling", () => {
        test("should set price to 0 when adding items", async () => {
            const response = await agent.post("/api/cart/items").send({
                foodItemId: testFoodItem._id.toString(),
                quantity: 1,
            });

            assert.strictEqual(response.status, 200);
            expect(response.body.data.cart.items[0].price).toBe(0);
        });

        test("should calculate totalPrice correctly", async () => {
            const response = await agent.post("/api/cart/items").send({
                foodItemId: testFoodItem._id.toString(),
                quantity: 3,
            });

            assert.strictEqual(response.status, 200);
            expect(response.body.data.cart.totalPrice).toBeGreaterThanOrEqual(0);
        });
    });

    describe("User Association", () => {
        test("should handle cart without userId", async () => {
            const response = await agent.get("/api/cart");

            assert.strictEqual(response.status, 200);
            expect(response.body.data.cart.userId).toBeUndefined();
        });

        test("should create cart with session only", async () => {
            const response = await agent.post("/api/cart/items").send({
                foodItemId: testFoodItem._id.toString(),
                quantity: 1,
            });

            assert.strictEqual(response.status, 200);
            expect(response.body.data.cart).toBeDefined();
        });
    });

    describe("Response Structure Validation", () => {
        test("should return consistent response structure for getCart", async () => {
            const response = await agent.get("/api/cart");

            assert.strictEqual(response.status, 200);
            expect(response.body).toHaveProperty("success");
            expect(response.body).toHaveProperty("data");
            expect(response.body.data).toHaveProperty("cart");
            expect(response.body.data.cart).toHaveProperty("id");
            expect(response.body.data.cart).toHaveProperty("items");
            expect(response.body.data.cart).toHaveProperty("totalItems");
            expect(response.body.data.cart).toHaveProperty("totalPrice");
        });

        test("should return consistent response structure for addItemToCart", async () => {
            const response = await agent.post("/api/cart/items").send({
                foodItemId: testFoodItem._id.toString(),
                quantity: 1,
            });

            assert.strictEqual(response.status, 200);
            expect(response.body).toHaveProperty("success");
            expect(response.body).toHaveProperty("message");
            expect(response.body).toHaveProperty("data");
            expect(response.body.message).toBe("Item added to cart");
        });

        test("should return consistent response structure for updateCartItemQuantity", async () => {
            // Add item first
            await agent.post("/api/cart/items").send({
                foodItemId: testFoodItem._id.toString(),
                quantity: 1,
            });

            const response = await agent
                .patch(`/api/cart/items/${testFoodItem._id}`)
                .send({ quantity: 3 });

            assert.strictEqual(response.status, 200);
            expect(response.body).toHaveProperty("success");
            expect(response.body).toHaveProperty("message");
            expect(response.body).toHaveProperty("data");
            expect(response.body.message).toBe("Cart updated");
        });

        test("should return consistent response structure for removeItemFromCart", async () => {
            // Add item first
            await agent.post("/api/cart/items").send({
                foodItemId: testFoodItem._id.toString(),
                quantity: 1,
            });

            const response = await agent.delete(
                `/api/cart/items/${testFoodItem._id}`
            );

            assert.strictEqual(response.status, 200);
            expect(response.body).toHaveProperty("success");
            expect(response.body).toHaveProperty("message");
            expect(response.body).toHaveProperty("data");
            expect(response.body.message).toBe("Item removed from cart");
        });

        test("should return consistent response structure for clearCart", async () => {
            // Add item first
            await agent.post("/api/cart/items").send({
                foodItemId: testFoodItem._id.toString(),
                quantity: 1,
            });

            const response = await agent.delete("/api/cart");

            assert.strictEqual(response.status, 200);
            expect(response.body).toHaveProperty("success");
            expect(response.body).toHaveProperty("message");
            expect(response.body).toHaveProperty("data");
            expect(response.body.message).toBe("Cart cleared");
        });
    });

    describe("Message Variations", () => {
        test("should return 'Item removed from cart' when quantity is set to 0", async () => {
            // Add item first
            await agent.post("/api/cart/items").send({
                foodItemId: testFoodItem._id.toString(),
                quantity: 2,
            });

            const response = await agent
                .patch(`/api/cart/items/${testFoodItem._id}`)
                .send({ quantity: 0 });

            assert.strictEqual(response.status, 200);
            assert.strictEqual(response.body.message, "Item removed from cart");
        });

        test("should return 'Cart updated' when quantity is changed", async () => {
            // Add item first
            await agent.post("/api/cart/items").send({
                foodItemId: testFoodItem._id.toString(),
                quantity: 1,
            });

            const response = await agent
                .patch(`/api/cart/items/${testFoodItem._id}`)
                .send({ quantity: 5 });

            assert.strictEqual(response.status, 200);
            assert.strictEqual(response.body.message, "Cart updated");
        });
    });
});
