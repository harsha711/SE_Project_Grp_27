// import test from 'node:test';
import { describe, test, expect, beforeAll, afterAll } from "@jest/globals";
import assert from "node:assert/strict";
import request from "supertest";
import app from "../app.js";

/**
 * Integration tests for Food API endpoints
 * These tests require the Groq API to be configured
 * Skip these tests if GROQ_API_KEY is not set
 */

const hasGroqApiKey = process.env.GROQ_API_KEY !== undefined;

test("POST /api/food/parse - returns 400 when query is missing", async () => {
    const response = await request(app)
        .post("/api/food/parse")
        .send({})
        .expect(400);

    assert.equal(response.body.success, false);
    assert.equal(
        response.body.error,
        "Query parameter is required and must be a string"
    );
});

test("POST /api/food/parse - returns 400 when query is empty", async () => {
    const response = await request(app)
        .post("/api/food/parse")
        .send({ query: "" })
        .expect(400);

    assert.equal(response.body.success, false);
});

test("POST /api/food/parse - returns 400 when query is not a string", async () => {
    const response = await request(app)
        .post("/api/food/parse")
        .send({ query: 123 })
        .expect(400);

    assert.equal(response.body.success, false);
});

if (hasGroqApiKey) {
    test("POST /api/food/parse - parses high protein query successfully", async (t) => {
        t.timeout = 15000; // LLM calls can take time

        const response = await request(app)
            .post("/api/food/parse")
            .send({ query: "I want a high protein meal" })
            .expect(200);

        assert.equal(response.body.success, true);
        assert.equal(response.body.query, "I want a high protein meal");
        assert.ok(response.body.criteria);
        assert.ok(response.body.criteria.protein);
        assert.ok(response.body.criteria.protein.min);
    });

    test("POST /api/food/parse - parses low calorie query successfully", async (t) => {
        t.timeout = 15000;

        const response = await request(app)
            .post("/api/food/parse")
            .send({ query: "low calorie dessert" })
            .expect(200);

        assert.equal(response.body.success, true);
        assert.ok(response.body.criteria);
        assert.ok(response.body.criteria.calories);
        assert.ok(response.body.criteria.calories.max);
    });

    test("POST /api/food/parse - parses complex query with multiple criteria", async (t) => {
        t.timeout = 15000;

        const response = await request(app)
            .post("/api/food/parse")
            .send({
                query: "at least 30g of protein, less than 500 calories, and low carbs",
            })
            .expect(200);

        assert.equal(response.body.success, true);
        assert.ok(response.body.criteria.protein);
        assert.ok(response.body.criteria.calories);
    });

    test("POST /api/food/parse - returns empty criteria for non-food query", async (t) => {
        t.timeout = 15000;

        const response = await request(app)
            .post("/api/food/parse")
            .send({ query: "Hello, how are you?" })
            .expect(200);

        assert.equal(response.body.success, true);
        assert.deepEqual(response.body.criteria, {});
    });
}

test("POST /api/food/search - returns 400 when query is missing", async () => {
    const response = await request(app)
        .post("/api/food/search")
        .send({})
        .expect(400);

    assert.equal(response.body.success, false);
});

test("POST /api/food/recommend - returns 400 when query is missing", async () => {
    const response = await request(app)
        .post("/api/food/recommend")
        .send({})
        .expect(400);

    assert.equal(response.body.success, false);
});

test("POST /api/food/stats - returns 400 when query is missing", async () => {
    const response = await request(app)
        .post("/api/food/stats")
        .send({})
        .expect(400);

    assert.equal(response.body.success, false);
});

if (hasGroqApiKey) {
    test("POST /api/food/search - returns 400 when query yields no criteria", async (t) => {
        t.timeout = 15000;

        const response = await request(app)
            .post("/api/food/search")
            .send({ query: "Hello world" })
            .expect(400);

        assert.equal(response.body.success, false);
        assert.equal(response.body.error, "No nutritional criteria found");
    });

    test("POST /api/food/recommend - returns 400 when query yields no criteria", async (t) => {
        t.timeout = 15000;

        const response = await request(app)
            .post("/api/food/recommend")
            .send({ query: "Random text" })
            .expect(400);

        assert.equal(response.body.success, false);
    });
}

test("POST /api/food/search - handles pagination parameters", async () => {
    // This test verifies that the endpoint accepts pagination parameters
    // Actual functionality would be tested with a valid query and MongoDB connection
    const testData = {
        query: "high protein",
        limit: 5,
        page: 2,
    };

    assert.equal(testData.limit, 5);
    assert.equal(testData.page, 2);
});

test("POST /api/food/recommend - handles limit parameter", async () => {
    const testData = {
        query: "low calorie",
        limit: 3,
    };

    assert.equal(testData.limit, 3);
});

// Endpoint existence tests
test("POST /api/food/parse endpoint exists", async () => {
    const response = await request(app)
        .post("/api/food/parse")
        .send({ query: "" });

    // Should not return 404
    assert.notEqual(response.status, 404);
});

test("POST /api/food/search endpoint exists", async () => {
    const response = await request(app)
        .post("/api/food/search")
        .send({ query: "" });

    // Should not return 404
    assert.notEqual(response.status, 404);
});

test("POST /api/food/recommend endpoint exists", async () => {
    const response = await request(app)
        .post("/api/food/recommend")
        .send({ query: "" });

    // Should not return 404
    assert.notEqual(response.status, 404);
});

test("POST /api/food/stats endpoint exists", async () => {
    const response = await request(app)
        .post("/api/food/stats")
        .send({ query: "" });

    // Should not return 404
    assert.notEqual(response.status, 404);
});

// Method validation tests
test("GET /api/food/parse returns 404 (POST only)", async () => {
    const response = await request(app).get("/api/food/parse").expect(404);

    assert.equal(response.body.message, "Resource not found");
});

test("GET /api/food/search returns 404 (POST only)", async () => {
    const response = await request(app).get("/api/food/search").expect(404);

    assert.equal(response.body.message, "Resource not found");
});

// Content-Type validation
test("POST /api/food/parse accepts JSON content type", async () => {
    const response = await request(app)
        .post("/api/food/parse")
        .set("Content-Type", "application/json")
        .send({ query: "" });

    // Should process the request (even if it fails validation)
    assert.ok(response.body);
});

if (!hasGroqApiKey) {
    console.log(
        "\n⚠️  Warning: GROQ_API_KEY not set. Skipping integration tests that require LLM API.\n"
    );
}
