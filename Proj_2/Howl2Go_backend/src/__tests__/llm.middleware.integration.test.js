/**
 * Integration tests for llm.middleware with mocked LLM service
 * These tests cover the success paths that require LLM service interaction
 */
import { describe, test, expect, jest, beforeEach } from "@jest/globals";
import assert from "node:assert/strict";

// Mock the LLM service before importing the middleware
const mockParseQuery = jest.fn();
const mockBuildMongoQuery = jest.fn();

jest.unstable_mockModule("../services/llm.service.js", () => ({
    llmService: {
        parseQuery: mockParseQuery,
        buildMongoQuery: mockBuildMongoQuery,
    },
}));

// Import middleware after mocking
const { parseLLMQuery, buildMongoQuery } = await import(
    "../middleware/llm.middleware.js"
);

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

beforeEach(() => {
    jest.clearAllMocks();
});

// ==================== PARSE LLM QUERY SUCCESS TESTS ====================

test("parseLLMQuery - successfully parses query and attaches criteria", async () => {
    mockParseQuery.mockResolvedValue({
        criteria: { protein: { min: 30 }, calories: { max: 500 } },
        rawResponse: "Parsed: high protein, low calorie",
    });

    const req = mockRequest({ query: "high protein low calorie food" });
    const res = mockResponse();
    const next = mockNext();

    await parseLLMQuery(req, res, next);

    assert.equal(next.wasCalled(), true);
    assert.deepEqual(req.parsedCriteria, { protein: { min: 30 }, calories: { max: 500 } });
    assert.equal(req.llmRawResponse, "Parsed: high protein, low calorie");
});

test("parseLLMQuery - handles complex criteria from LLM", async () => {
    mockParseQuery.mockResolvedValue({
        criteria: {
            protein: { min: 25 },
            calories: { max: 600 },
            totalFat: { max: 20 },
            carbs: { max: 50 },
        },
        rawResponse: "Complex query parsed",
    });

    const req = mockRequest({ query: "healthy meal under 600 calories with high protein" });
    const res = mockResponse();
    const next = mockNext();

    await parseLLMQuery(req, res, next);

    assert.equal(next.wasCalled(), true);
    assert.equal(req.parsedCriteria.protein.min, 25);
    assert.equal(req.parsedCriteria.calories.max, 600);
    assert.equal(req.parsedCriteria.totalFat.max, 20);
    assert.equal(req.parsedCriteria.carbs.max, 50);
});

test("parseLLMQuery - handles empty criteria from LLM", async () => {
    mockParseQuery.mockResolvedValue({
        criteria: {},
        rawResponse: "No criteria found",
    });

    const req = mockRequest({ query: "just something random" });
    const res = mockResponse();
    const next = mockNext();

    await parseLLMQuery(req, res, next);

    assert.equal(next.wasCalled(), true);
    assert.deepEqual(req.parsedCriteria, {});
});

test("parseLLMQuery - returns 500 on LLM service error", async () => {
    mockParseQuery.mockRejectedValue(new Error("LLM service unavailable"));

    const req = mockRequest({ query: "valid query" });
    const res = mockResponse();
    const next = mockNext();

    await parseLLMQuery(req, res, next);

    assert.equal(res.statusCode, 500);
    assert.equal(res.jsonData.success, false);
    assert.equal(res.jsonData.error, "Failed to parse query");
    assert.equal(next.wasCalled(), false);
});

test("parseLLMQuery - passes correct query to LLM service", async () => {
    mockParseQuery.mockResolvedValue({
        criteria: { protein: { min: 20 } },
        rawResponse: "OK",
    });

    const req = mockRequest({ query: "I want high protein food" });
    const res = mockResponse();
    const next = mockNext();

    await parseLLMQuery(req, res, next);

    expect(mockParseQuery).toHaveBeenCalledWith("I want high protein food");
    expect(mockParseQuery).toHaveBeenCalledTimes(1);
});

// ==================== BUILD MONGO QUERY ERROR TESTS ====================

test("buildMongoQuery - returns 500 when buildMongoQuery throws", () => {
    mockBuildMongoQuery.mockImplementation(() => {
        throw new Error("Failed to build query");
    });

    const req = mockRequest({});
    req.parsedCriteria = { protein: { min: 30 } };
    const res = mockResponse();
    const next = mockNext();

    buildMongoQuery(req, res, next);

    assert.equal(res.statusCode, 500);
    assert.equal(res.jsonData.success, false);
    assert.equal(res.jsonData.error, "Failed to build database query");
    assert.equal(next.wasCalled(), false);
});

test("buildMongoQuery - successfully builds query and attaches to request", () => {
    mockBuildMongoQuery.mockReturnValue({
        protein: { $gte: 30 },
        calories: { $lte: 500 },
    });

    const req = mockRequest({});
    req.parsedCriteria = { protein: { min: 30 }, calories: { max: 500 } };
    const res = mockResponse();
    const next = mockNext();

    buildMongoQuery(req, res, next);

    assert.equal(next.wasCalled(), true);
    assert.deepEqual(req.mongoQuery, {
        protein: { $gte: 30 },
        calories: { $lte: 500 },
    });
});

test("buildMongoQuery - handles price criteria", () => {
    mockBuildMongoQuery.mockReturnValue({
        calories: { $lte: 500 }, // Price is based on calories
    });

    const req = mockRequest({});
    req.parsedCriteria = { price: { max: 10 } };
    const res = mockResponse();
    const next = mockNext();

    buildMongoQuery(req, res, next);

    assert.equal(next.wasCalled(), true);
    assert.ok(req.mongoQuery);
});

test("buildMongoQuery - handles complex criteria", () => {
    mockBuildMongoQuery.mockReturnValue({
        protein: { $gte: 20 },
        calories: { $lte: 600 },
        totalFat: { $lte: 15 },
        sodium: { $lte: 1000 },
    });

    const req = mockRequest({});
    req.parsedCriteria = {
        protein: { min: 20 },
        calories: { max: 600 },
        totalFat: { max: 15 },
        sodium: { max: 1000 },
    };
    const res = mockResponse();
    const next = mockNext();

    buildMongoQuery(req, res, next);

    assert.equal(next.wasCalled(), true);
    assert.deepEqual(req.mongoQuery, {
        protein: { $gte: 20 },
        calories: { $lte: 600 },
        totalFat: { $lte: 15 },
        sodium: { $lte: 1000 },
    });
});
