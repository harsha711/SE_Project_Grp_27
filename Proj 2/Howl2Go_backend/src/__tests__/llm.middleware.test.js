// import test from 'node:test';
import { describe, test, expect, beforeAll, afterAll } from "@jest/globals";
import assert from "node:assert/strict";
import {
    parseLLMQuery,
    buildMongoQuery,
    validateCriteria,
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
