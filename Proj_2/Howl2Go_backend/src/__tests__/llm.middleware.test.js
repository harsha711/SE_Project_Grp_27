// import test from 'node:test';
import { describe, test, expect, beforeAll, afterAll } from "@jest/globals";
import assert from "node:assert/strict";
import {
    parseLLMQuery,
    buildMongoQuery,
    validateCriteria,
    applyUserPreferences,
} from "../middleware/llm.middleware.js";

// Mock request and response objects
const mockRequest = (body = {}) => ({
    body,
    parsedCriteria: null,
    mongoQuery: null,
    llmRawResponse: null,
});

const mockResponse = () => {
    const res = {
        statusCode: 200,
        jsonData: null,
    };
    res.status = (code) => {
        res.statusCode = code;
        return res;
    };
    res.json = (data) => {
        res.jsonData = data;
        return res;
    };
    return res;
};

const mockNext = () => {
    let called = false;
    const next = () => {
        called = true;
    };
    next.wasCalled = () => called;
    return next;
};

test("parseLLMQuery - returns 400 when query is missing", async () => {
    const req = mockRequest({});
    const res = mockResponse();
    const next = mockNext();

    await parseLLMQuery(req, res, next);

    assert.equal(res.statusCode, 400);
    assert.equal(res.jsonData.success, false);
    assert.equal(
        res.jsonData.error,
        "Query parameter is required and must be a string"
    );
    assert.equal(next.wasCalled(), false);
});

test("parseLLMQuery - returns 400 when query is not a string", async () => {
    const req = mockRequest({ query: 123 });
    const res = mockResponse();
    const next = mockNext();

    await parseLLMQuery(req, res, next);

    assert.equal(res.statusCode, 400);
    assert.equal(res.jsonData.success, false);
    assert.equal(next.wasCalled(), false);
});

test("parseLLMQuery - returns 400 when query is empty string", async () => {
    const req = mockRequest({ query: "" });
    const res = mockResponse();
    const next = mockNext();

    await parseLLMQuery(req, res, next);

    assert.equal(res.statusCode, 400);
    assert.equal(res.jsonData.success, false);
    assert.equal(next.wasCalled(), false);
});

test("parseLLMQuery - returns 400 when query is null", async () => {
    const req = mockRequest({ query: null });
    const res = mockResponse();
    const next = mockNext();

    await parseLLMQuery(req, res, next);

    assert.equal(res.statusCode, 400);
    assert.equal(res.jsonData.success, false);
    assert.equal(next.wasCalled(), false);
});

test("buildMongoQuery - returns 400 when parsedCriteria is missing", () => {
    const req = mockRequest({});
    const res = mockResponse();
    const next = mockNext();

    buildMongoQuery(req, res, next);

    assert.equal(res.statusCode, 400);
    assert.equal(res.jsonData.success, false);
    assert.equal(res.jsonData.error, "No parsed criteria found");
    assert.equal(next.wasCalled(), false);
});

test("buildMongoQuery - builds query successfully when criteria exists", () => {
    const req = mockRequest({});
    req.parsedCriteria = {
        protein: { min: 30 },
        calories: { max: 500 },
    };
    const res = mockResponse();
    const next = mockNext();

    buildMongoQuery(req, res, next);

    assert.ok(req.mongoQuery);
    assert.deepEqual(req.mongoQuery, {
        protein: { $gte: 30 },
        calories: { $lte: 500 },
    });
    assert.equal(next.wasCalled(), true);
});

test("buildMongoQuery - builds empty query when criteria is empty object", () => {
    const req = mockRequest({});
    req.parsedCriteria = {};
    const res = mockResponse();
    const next = mockNext();

    buildMongoQuery(req, res, next);

    assert.ok(req.mongoQuery);
    assert.deepEqual(req.mongoQuery, {});
    assert.equal(next.wasCalled(), true);
});

test("validateCriteria - returns 400 when criteria is missing", () => {
    const req = mockRequest({});
    const res = mockResponse();
    const next = mockNext();

    validateCriteria(req, res, next);

    assert.equal(res.statusCode, 400);
    assert.equal(res.jsonData.success, false);
    assert.equal(res.jsonData.error, "No nutritional criteria found");
    assert.ok(res.jsonData.message.includes("not contain recognizable food"));
    assert.equal(next.wasCalled(), false);
});

test("validateCriteria - returns 400 when criteria is empty object", () => {
    const req = mockRequest({});
    req.parsedCriteria = {};
    const res = mockResponse();
    const next = mockNext();

    validateCriteria(req, res, next);

    assert.equal(res.statusCode, 400);
    assert.equal(res.jsonData.success, false);
    assert.equal(next.wasCalled(), false);
});

test("validateCriteria - calls next when criteria has values", () => {
    const req = mockRequest({});
    req.parsedCriteria = { protein: { min: 30 } };
    const res = mockResponse();
    const next = mockNext();

    validateCriteria(req, res, next);

    assert.equal(next.wasCalled(), true);
    assert.equal(res.statusCode, 200); // No status change
});

test("validateCriteria - calls next when criteria has multiple values", () => {
    const req = mockRequest({});
    req.parsedCriteria = {
        protein: { min: 30 },
        calories: { max: 500 },
        carbs: { max: 30 },
    };
    const res = mockResponse();
    const next = mockNext();

    validateCriteria(req, res, next);

    assert.equal(next.wasCalled(), true);
});

// ==================== APPLY USER PREFERENCES TESTS ====================

test("applyUserPreferences - calls next without user", () => {
    const req = mockRequest({});
    req.parsedCriteria = { protein: { min: 20 } };
    const res = mockResponse();
    const next = mockNext();

    applyUserPreferences(req, res, next);

    assert.equal(next.wasCalled(), true);
    // Criteria should be unchanged
    assert.deepEqual(req.parsedCriteria, { protein: { min: 20 } });
});

test("applyUserPreferences - calls next without user preferences", () => {
    const req = mockRequest({});
    req.user = { id: "123" }; // User exists but no preferences
    req.parsedCriteria = { protein: { min: 20 } };
    const res = mockResponse();
    const next = mockNext();

    applyUserPreferences(req, res, next);

    assert.equal(next.wasCalled(), true);
    assert.deepEqual(req.parsedCriteria, { protein: { min: 20 } });
});

test("applyUserPreferences - applies maxCalories when not in query", () => {
    const req = mockRequest({});
    req.user = {
        id: "123",
        preferences: {
            maxCalories: 600,
            minProtein: null,
            favoriteRestaurants: [],
            dietaryRestrictions: [],
        },
    };
    req.parsedCriteria = { protein: { min: 20 } };
    const res = mockResponse();
    const next = mockNext();

    applyUserPreferences(req, res, next);

    assert.equal(next.wasCalled(), true);
    assert.equal(req.parsedCriteria.calories.max, 600);
    assert.equal(req.parsedCriteria.protein.min, 20);
    assert.equal(req.preferencesApplied, true);
});

test("applyUserPreferences - does not override query calories", () => {
    const req = mockRequest({});
    req.user = {
        id: "123",
        preferences: {
            maxCalories: 600,
            minProtein: null,
            favoriteRestaurants: [],
            dietaryRestrictions: [],
        },
    };
    req.parsedCriteria = { calories: { max: 400 } }; // Query specifies calories
    const res = mockResponse();
    const next = mockNext();

    applyUserPreferences(req, res, next);

    assert.equal(next.wasCalled(), true);
    // Query value should be preserved, not overridden
    assert.equal(req.parsedCriteria.calories.max, 400);
});

test("applyUserPreferences - applies minProtein when not in query", () => {
    const req = mockRequest({});
    req.user = {
        id: "123",
        preferences: {
            maxCalories: null,
            minProtein: 25,
            favoriteRestaurants: [],
            dietaryRestrictions: [],
        },
    };
    req.parsedCriteria = { calories: { max: 500 } };
    const res = mockResponse();
    const next = mockNext();

    applyUserPreferences(req, res, next);

    assert.equal(next.wasCalled(), true);
    assert.equal(req.parsedCriteria.protein.min, 25);
    assert.equal(req.parsedCriteria.calories.max, 500);
});

test("applyUserPreferences - does not override query protein", () => {
    const req = mockRequest({});
    req.user = {
        id: "123",
        preferences: {
            maxCalories: null,
            minProtein: 25,
            favoriteRestaurants: [],
            dietaryRestrictions: [],
        },
    };
    req.parsedCriteria = { protein: { min: 30 } };
    const res = mockResponse();
    const next = mockNext();

    applyUserPreferences(req, res, next);

    assert.equal(next.wasCalled(), true);
    // Query value should be preserved
    assert.equal(req.parsedCriteria.protein.min, 30);
});

test("applyUserPreferences - stores favoriteRestaurants on request", () => {
    const req = mockRequest({});
    req.user = {
        id: "123",
        preferences: {
            maxCalories: null,
            minProtein: null,
            favoriteRestaurants: ["McDonald's", "Wendy's"],
            dietaryRestrictions: [],
        },
    };
    req.parsedCriteria = { protein: { min: 20 } };
    const res = mockResponse();
    const next = mockNext();

    applyUserPreferences(req, res, next);

    assert.equal(next.wasCalled(), true);
    assert.deepEqual(req.favoriteRestaurants, ["McDonald's", "Wendy's"]);
});

test("applyUserPreferences - stores dietaryRestrictions on request", () => {
    const req = mockRequest({});
    req.user = {
        id: "123",
        preferences: {
            maxCalories: null,
            minProtein: null,
            favoriteRestaurants: [],
            dietaryRestrictions: ["Vegetarian", "Low-Sodium"],
        },
    };
    req.parsedCriteria = { protein: { min: 20 } };
    const res = mockResponse();
    const next = mockNext();

    applyUserPreferences(req, res, next);

    assert.equal(next.wasCalled(), true);
    assert.deepEqual(req.dietaryRestrictions, ["Vegetarian", "Low-Sodium"]);
});

test("applyUserPreferences - applies all preferences together", () => {
    const req = mockRequest({});
    req.user = {
        id: "123",
        preferences: {
            maxCalories: 700,
            minProtein: 20,
            favoriteRestaurants: ["KFC"],
            dietaryRestrictions: ["Halal"],
        },
    };
    req.parsedCriteria = { carbs: { max: 50 } };
    const res = mockResponse();
    const next = mockNext();

    applyUserPreferences(req, res, next);

    assert.equal(next.wasCalled(), true);
    assert.equal(req.parsedCriteria.calories.max, 700);
    assert.equal(req.parsedCriteria.protein.min, 20);
    assert.equal(req.parsedCriteria.carbs.max, 50);
    assert.deepEqual(req.favoriteRestaurants, ["KFC"]);
    assert.deepEqual(req.dietaryRestrictions, ["Halal"]);
    assert.equal(req.preferencesApplied, true);
});

test("applyUserPreferences - initializes empty parsedCriteria when undefined", () => {
    const req = mockRequest({});
    req.user = {
        id: "123",
        preferences: {
            maxCalories: 500,
            minProtein: 15,
            favoriteRestaurants: [],
            dietaryRestrictions: [],
        },
    };
    req.parsedCriteria = undefined; // No parsed criteria yet
    const res = mockResponse();
    const next = mockNext();

    applyUserPreferences(req, res, next);

    assert.equal(next.wasCalled(), true);
    assert.equal(req.parsedCriteria.calories.max, 500);
    assert.equal(req.parsedCriteria.protein.min, 15);
});

test("applyUserPreferences - handles error gracefully and continues", () => {
    const req = mockRequest({});
    // Create an object that throws when accessed
    req.user = {
        id: "123",
        get preferences() {
            throw new Error("Simulated error");
        },
    };
    req.parsedCriteria = { protein: { min: 20 } };
    const res = mockResponse();
    const next = mockNext();

    // Should not throw, just log and call next
    applyUserPreferences(req, res, next);

    assert.equal(next.wasCalled(), true);
});

test("applyUserPreferences - does not set favoriteRestaurants when empty array", () => {
    const req = mockRequest({});
    req.user = {
        id: "123",
        preferences: {
            maxCalories: null,
            minProtein: null,
            favoriteRestaurants: [],
            dietaryRestrictions: [],
        },
    };
    req.parsedCriteria = { protein: { min: 20 } };
    const res = mockResponse();
    const next = mockNext();

    applyUserPreferences(req, res, next);

    assert.equal(next.wasCalled(), true);
    assert.equal(req.favoriteRestaurants, undefined);
    assert.equal(req.dietaryRestrictions, undefined);
});

test("applyUserPreferences - initializes calories object when adding max", () => {
    const req = mockRequest({});
    req.user = {
        id: "123",
        preferences: {
            maxCalories: 800,
            minProtein: null,
            favoriteRestaurants: [],
            dietaryRestrictions: [],
        },
    };
    req.parsedCriteria = { protein: { min: 30 } }; // No calories object
    const res = mockResponse();
    const next = mockNext();

    applyUserPreferences(req, res, next);

    assert.equal(next.wasCalled(), true);
    assert.ok(req.parsedCriteria.calories);
    assert.equal(req.parsedCriteria.calories.max, 800);
});

test("applyUserPreferences - initializes protein object when adding min", () => {
    const req = mockRequest({});
    req.user = {
        id: "123",
        preferences: {
            maxCalories: null,
            minProtein: 30,
            favoriteRestaurants: [],
            dietaryRestrictions: [],
        },
    };
    req.parsedCriteria = { calories: { max: 600 } }; // No protein object
    const res = mockResponse();
    const next = mockNext();

    applyUserPreferences(req, res, next);

    assert.equal(next.wasCalled(), true);
    assert.ok(req.parsedCriteria.protein);
    assert.equal(req.parsedCriteria.protein.min, 30);
});
