import {
    describe,
    test,
    expect,
    beforeAll,
    afterAll,
    afterEach,
} from "@jest/globals";
import assert from "node:assert/strict";
import request from "supertest";
import mongoose from "mongoose";
import app from "../app.js";
import connectDB from "../config/database.js";
import FastFoodItem from "../models/FastFoodItem.js";
import { llmService } from "../services/llm.service.js";

const TEST_COMPANY = "Integration Test Kitchen";
const SEED_ITEMS = [
    {
        company: TEST_COMPANY,
        item: "Power Protein Bowl",
        calories: 480,
        protein: 42,
        carbs: 48,
    },
    {
        company: TEST_COMPANY,
        item: "Lean Chicken Salad",
        calories: 340,
        protein: 28,
        carbs: 24,
    },
    {
        company: TEST_COMPANY,
        item: "Fresh Quinoa Wrap",
        calories: 260,
        protein: 18,
        carbs: 36,
    },
    {
        company: "Outside Vendor",
        item: "Classic Cheeseburger",
        calories: 640,
        protein: 26,
        carbs: 52,
    },
];

const llmResponses = new Map();
let originalParseQuery;

const setMockedLlmResponse = (prompt, criteria) => {
    llmResponses.set(prompt, criteria);
};

beforeAll(async () => {
    originalParseQuery = llmService.parseQuery;

    llmService.parseQuery = async (prompt) => {
        if (!prompt || typeof prompt !== "string") {
            throw new Error("User prompt must be a non-empty string");
        }

        if (!llmResponses.has(prompt)) {
            throw new Error(
                `No mocked LLM response configured for prompt: ${prompt}`
            );
        }

        const criteria = llmResponses.get(prompt);

        return {
            success: true,
            criteria,
            rawResponse: JSON.stringify(criteria),
        };
    };

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
    await FastFoodItem.deleteMany({
        company: { $in: [TEST_COMPANY, "Outside Vendor"] },
    });
    await FastFoodItem.insertMany(SEED_ITEMS);
});

afterEach(() => {
    llmResponses.clear();
});

afterAll(async () => {
    llmService.parseQuery = originalParseQuery;
    await FastFoodItem.deleteMany({
        company: { $in: [TEST_COMPANY, "Outside Vendor"] },
    });
    await mongoose.connection.close();
});

test("POST /api/food/recommend sorts recommendations by protein when criteria requests high protein", async () => {
    const prompt =
        "Recommend protein focused dishes from Integration Test Kitchen";
    const criteria = {
        company: { name: TEST_COMPANY },
        protein: { min: 20 },
    };

    setMockedLlmResponse(prompt, criteria);

    const response = await request(app)
        .post("/api/food/recommend")
        .send({ query: prompt });

    assert.equal(response.status, 200);
    assert.equal(response.body.success, true);
    assert.equal(response.body.query, prompt);
    assert.equal(response.body.count, 2);
    assert.equal(response.body.recommendations.length, 2);
    assert.equal(response.body.recommendations[0].item, "Power Protein Bowl");
    assert.equal(response.body.recommendations[1].item, "Lean Chicken Salad");
    assert.ok(
        response.body.recommendations[0].protein >=
            response.body.recommendations[1].protein
    );
});

describe("Food Recommendation Error Handling", () => {
    test("POST /api/food/recommend - should handle missing query", async () => {
        const response = await request(app)
            .post("/api/food/recommend")
            .send({});

        assert.equal(response.status, 400);
        assert.equal(response.body.success, false);
    });

    test("POST /api/food/recommend - should handle empty query string", async () => {
        const response = await request(app)
            .post("/api/food/recommend")
            .send({ query: "" });

        assert.equal(response.status, 400);
        assert.equal(response.body.success, false);
    });

    test("POST /api/food/recommend - should handle null query", async () => {
        const response = await request(app)
            .post("/api/food/recommend")
            .send({ query: null });

        assert.equal(response.status, 400);
        assert.equal(response.body.success, false);
    });

    test("POST /api/food/recommend - should handle non-string query", async () => {
        const response = await request(app)
            .post("/api/food/recommend")
            .send({ query: 123 });

        assert.equal(response.status, 400);
        assert.equal(response.body.success, false);
    });

    test("POST /api/food/recommend - should handle query with no nutritional criteria", async () => {
        const prompt = "Tell me a joke";
        setMockedLlmResponse(prompt, {});

        const response = await request(app)
            .post("/api/food/recommend")
            .send({ query: prompt });

        assert.equal(response.status, 400);
        assert.equal(response.body.success, false);
    });

    

   

    test("POST /api/food/recommend - should return empty results when no matches", async () => {
        const prompt = "Find meals with 1000g protein";
        const criteria = { protein: { min: 1000 } };
        setMockedLlmResponse(prompt, criteria);

        const response = await request(app)
            .post("/api/food/recommend")
            .send({ query: prompt });
        


        assert.equal(response.status, 200);
        assert.equal(response.body.success, true);
        assert.equal(response.body.count, 0);
        assert.equal(response.body.recommendations.length, 0);
    });
});

describe("Food Recommendation Sorting Logic", () => {
    test("POST /api/food/recommend - should sort by calories (low to high) when querying low calorie", async () => {
        const prompt = "Low calorie options from Integration Test Kitchen";
        const criteria = {
            company: { name: TEST_COMPANY },
            calories: { max: 400 },
        };
        setMockedLlmResponse(prompt, criteria);

        const response = await request(app)
            .post("/api/food/recommend")
            .send({ query: prompt });

        assert.equal(response.status, 200);
        assert.equal(response.body.recommendations.length, 2);
        // Should be sorted by calories ascending
        assert.ok(
            response.body.recommendations[0].calories <=
                response.body.recommendations[1].calories
        );
    });
});
describe("Food Recommendation with Multiple Criteria", () => {
    test("POST /api/food/recommend - should handle multiple nutritional criteria", async () => {
        const prompt =
            "High protein, low calorie meals from Integration Test Kitchen";
        const criteria = {
            company: { name: TEST_COMPANY },
            protein: { min: 25 },
            calories: { max: 400 },
        };
        setMockedLlmResponse(prompt, criteria);

        const response = await request(app)
            .post("/api/food/recommend")
            .send({ query: prompt });

        assert.equal(response.status, 200);
        assert.equal(response.body.success, true);
        // Should find items matching both criteria
        response.body.recommendations.forEach((item) => {
            assert.ok(item.protein >= 25);
            assert.ok(item.calories <= 400);
        });
    });

    test("POST /api/food/recommend - should handle carb range criteria", async () => {
        const prompt = "Moderate carb meals from Integration Test Kitchen";
        const criteria = {
            company: { name: TEST_COMPANY },
            carbs: { min: 30, max: 50 },
        };
        setMockedLlmResponse(prompt, criteria);

        const response = await request(app)
            .post("/api/food/recommend")
            .send({ query: prompt });

        assert.equal(response.status, 200);
        assert.equal(response.body.success, true);
        response.body.recommendations.forEach((item) => {
            assert.ok(item.carbs >= 30);
            assert.ok(item.carbs <= 50);
        });
    });
});
