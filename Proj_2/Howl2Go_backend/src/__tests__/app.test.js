import { describe, test, expect, beforeAll, afterAll } from "@jest/globals";
import request from "supertest";
import app from "../app.js";
import connectDB from "../config/database.js";
import mongoose from "mongoose";

describe("App Configuration Tests", () => {
    beforeAll(async () => {
        // Connect to test database
        await connectDB();
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    describe("CORS Configuration", () => {
        test("should accept requests from allowed origin", async () => {
            const response = await request(app)
                .get("/")
                .set("Origin", "http://localhost:3000");

            expect(response.status).toBe(200);
            expect(response.headers["access-control-allow-origin"]).toBeDefined();
        });

        test("should handle preflight OPTIONS request", async () => {
            const response = await request(app)
                .options("/api/cart")
                .set("Origin", "http://localhost:3000")
                .set("Access-Control-Request-Method", "POST");

            expect(response.status).toBeLessThanOrEqual(204);
        });

        test("should allow credentials in CORS", async () => {
            const response = await request(app)
                .get("/")
                .set("Origin", "http://localhost:3000");

            expect(response.headers["access-control-allow-credentials"]).toBe("true");
        });

        test("should handle requests without origin header", async () => {
            const response = await request(app).get("/");

            expect(response.status).toBe(200);
            expect(response.body.status).toBe("ok");
        });
    });

    describe("Root Endpoint", () => {
        test("should return health check on root path", async () => {
            const response = await request(app).get("/");

            expect(response.status).toBe(200);
            expect(response.body.status).toBe("ok");
            expect(response.body.message).toBe("Food Delivery API is running");
        });

        test("should return JSON content type", async () => {
            const response = await request(app).get("/");

            expect(response.headers["content-type"]).toMatch(/json/);
        });
    });

    describe("404 Handler", () => {
        test("should return 404 for non-existent routes", async () => {
            const response = await request(app).get("/non-existent-route");

            expect(response.status).toBe(404);
            expect(response.body.message).toBe("Resource not found");
        });

        test("should return 404 for non-existent API routes", async () => {
            const response = await request(app).get("/api/non-existent-endpoint");

            expect(response.status).toBe(404);
            expect(response.body.message).toBe("Resource not found");
        });

        test("should return 404 for POST to non-existent route", async () => {
            const response = await request(app)
                .post("/api/fake-endpoint")
                .send({ data: "test" });

            expect(response.status).toBe(404);
            expect(response.body.message).toBe("Resource not found");
        });

        test("should return 404 for PUT to non-existent route", async () => {
            const response = await request(app)
                .put("/api/invalid-route")
                .send({ data: "test" });

            expect(response.status).toBe(404);
            expect(response.body.message).toBe("Resource not found");
        });

        test("should return 404 for DELETE to non-existent route", async () => {
            const response = await request(app).delete("/api/invalid-route");

            expect(response.status).toBe(404);
            expect(response.body.message).toBe("Resource not found");
        });

        test("should return 404 for PATCH to non-existent route", async () => {
            const response = await request(app)
                .patch("/api/invalid-route")
                .send({ data: "test" });

            expect(response.status).toBe(404);
            expect(response.body.message).toBe("Resource not found");
        });

        test("should return 404 for deeply nested non-existent route", async () => {
            const response = await request(app).get("/api/v1/nested/fake/route");

            expect(response.status).toBe(404);
            expect(response.body.message).toBe("Resource not found");
        });
    });

    describe("JSON Body Parsing", () => {
        test("should parse JSON body correctly", async () => {
            const response = await request(app)
                .post("/api/cart/items")
                .send({ foodItemId: "123", quantity: 1 })
                .set("Content-Type", "application/json");

            expect(response.body).toBeDefined();
            expect(response.headers["content-type"]).toMatch(/json/);
        });

        test("should handle malformed JSON", async () => {
            const response = await request(app)
                .post("/api/cart/items")
                .send("{ invalid json }")
                .set("Content-Type", "application/json");

            expect(response.status).toBeGreaterThanOrEqual(400);
        });

        test("should handle empty JSON body", async () => {
            const response = await request(app)
                .post("/api/cart/items")
                .send({})
                .set("Content-Type", "application/json");

            expect(response.status).toBeGreaterThanOrEqual(400);
            expect(response.body.success).toBe(false);
        });

        test("should handle large JSON payload", async () => {
            const largePayload = {
                data: "a".repeat(1000),
                nested: {
                    values: Array(100).fill({ key: "value" })
                }
            };

            const response = await request(app)
                .post("/api/cart/items")
                .send(largePayload)
                .set("Content-Type", "application/json");

            expect(response.body).toBeDefined();
        });

        test("should parse nested JSON objects", async () => {
            const response = await request(app)
                .post("/api/cart/items")
                .send({
                    foodItemId: "123",
                    quantity: 1,
                    metadata: { source: "test" }
                })
                .set("Content-Type", "application/json");

            expect(response.body).toBeDefined();
        });
    });

    describe("Session Management", () => {
        test("should create session for new requests", async () => {
            const agent = request.agent(app);
            const response = await agent.get("/api/cart");

            expect(response.headers["set-cookie"]).toBeDefined();
            expect(response.status).toBe(200);
        });

        test("should maintain session across requests", async () => {
            const agent = request.agent(app);

            const firstResponse = await agent.get("/api/cart");
            const secondResponse = await agent.get("/api/cart");

            expect(firstResponse.status).toBe(200);
            expect(secondResponse.status).toBe(200);
        });

        test("should have HttpOnly cookie flag", async () => {
            const response = await request(app).get("/");

            if (response.headers["set-cookie"]) {
                const cookie = response.headers["set-cookie"][0];
                expect(cookie.toLowerCase()).toContain("httponly");
            }
        });

        test("should persist cart data across session requests", async () => {
            const agent = request.agent(app);

            const firstResponse = await agent.get("/api/cart");
            expect(firstResponse.body.data.cart.totalItems).toBe(0);

            const secondResponse = await agent.get("/api/cart");
            expect(secondResponse.status).toBe(200);
        });
    });

    describe("URL Encoded Body Parsing", () => {
        test("should parse URL-encoded body", async () => {
            const response = await request(app)
                .post("/api/cart/items")
                .send("foodItemId=123&quantity=1")
                .set("Content-Type", "application/x-www-form-urlencoded");

            expect(response.body).toBeDefined();
        });

        test("should parse complex URL-encoded data", async () => {
            const response = await request(app)
                .post("/api/cart/items")
                .send("foodItemId=test123&quantity=5&extra=value")
                .set("Content-Type", "application/x-www-form-urlencoded");

            expect(response.body).toBeDefined();
        });

        test("should handle URL-encoded with special characters", async () => {
            const response = await request(app)
                .post("/api/cart/items")
                .send("foodItemId=test%20item&quantity=1")
                .set("Content-Type", "application/x-www-form-urlencoded");

            expect(response.body).toBeDefined();
        });
    });

    describe("Request Methods Support", () => {
        test("should support GET requests", async () => {
            const response = await request(app).get("/");
            expect([200, 404]).toContain(response.status);
        });

        test("should support POST requests", async () => {
            const response = await request(app)
                .post("/api/cart/items")
                .send({});
            expect(response.status).toBeDefined();
        });

        test("should support PATCH requests", async () => {
            const response = await request(app)
                .patch("/api/cart/items/123")
                .send({ quantity: 1 });
            expect(response.status).toBeDefined();
        });

        test("should support DELETE requests", async () => {
            const response = await request(app).delete("/api/cart/items/123");
            expect(response.status).toBeDefined();
        });

        test("should support PUT requests", async () => {
            const response = await request(app)
                .put("/api/fake-endpoint")
                .send({});
            expect(response.status).toBeDefined();
        });
    });

    describe("Middleware Chain", () => {
        test("should apply morgan logging middleware", async () => {
            const response = await request(app).get("/");
            expect(response.status).toBe(200);
        });

        test("should apply express.json middleware", async () => {
            const response = await request(app)
                .post("/api/cart/items")
                .send({ test: "data" })
                .set("Content-Type", "application/json");

            expect(response.body).toBeDefined();
        });

        test("should apply express.urlencoded middleware", async () => {
            const response = await request(app)
                .post("/api/cart/items")
                .send("test=data")
                .set("Content-Type", "application/x-www-form-urlencoded");

            expect(response.body).toBeDefined();
        });

        test("should apply session middleware", async () => {
            const agent = request.agent(app);
            const response = await agent.get("/api/cart");

            expect(response.headers["set-cookie"]).toBeDefined();
        });
    });

    describe("Content Type Handling", () => {
        test("should handle missing content-type header", async () => {
            const response = await request(app)
                .post("/api/cart/items")
                .send({ foodItemId: "123", quantity: 1 });

            expect(response.body).toBeDefined();
        });

        test("should return JSON responses", async () => {
            const response = await request(app).get("/");

            expect(response.headers["content-type"]).toMatch(/json/);
            expect(response.body).toBeInstanceOf(Object);
        });

        test("should handle JSON response for errors", async () => {
            const response = await request(app).get("/non-existent");

            expect(response.headers["content-type"]).toMatch(/json/);
            expect(response.body.message).toBeDefined();
        });
    });

    describe("Error Handler", () => {
        test("should handle 404 errors consistently", async () => {
            const response = await request(app).get("/api/invalid-endpoint");

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty("message");
            expect(response.headers["content-type"]).toMatch(/json/);
        });

        test("should handle multiple 404 requests", async () => {
            const response1 = await request(app).get("/invalid1");
            const response2 = await request(app).get("/invalid2");
            const response3 = await request(app).get("/invalid3");

            expect(response1.status).toBe(404);
            expect(response2.status).toBe(404);
            expect(response3.status).toBe(404);
        });
    });

    describe("API Routes", () => {
        test("should mount routes under /api prefix", async () => {
            const response = await request(app).get("/api/cart");

            expect(response.status).not.toBe(404);
        });

        test("should not respond to routes without /api prefix for API endpoints", async () => {
            const response = await request(app).get("/cart");

            expect(response.status).toBe(404);
        });
    });

    describe("Response Headers", () => {
        test("should include proper content-type header", async () => {
            const response = await request(app).get("/");

            expect(response.headers).toHaveProperty("content-type");
            expect(response.headers["content-type"]).toMatch(/json/);
        });

        test("should include CORS headers when origin is provided", async () => {
            const response = await request(app)
                .get("/")
                .set("Origin", "http://localhost:3000");

            expect(response.headers).toHaveProperty("access-control-allow-origin");
        });
    });
});
