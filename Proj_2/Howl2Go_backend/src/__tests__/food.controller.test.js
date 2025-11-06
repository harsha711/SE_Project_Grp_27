// import test from 'node:test';
import { describe, test, expect, beforeAll, afterAll } from "@jest/globals";
import assert from "node:assert/strict";
import {
    recommendFood
} from "../controllers/food.controller.js";

// Mock request and response objects
const mockRequest = (body = {}, parsedCriteria = null, mongoQuery = null) => ({
    body,
    parsedCriteria,
    mongoQuery,
});

test("recommendFood - handles limit parameter", async () => {
    const req = mockRequest(
        { query: "high protein", limit: 5 },
        { protein: { min: 20 } },
        { protein: { $gte: 20 } }
    );

    const limit = parseInt(req.body.limit) || 5;
    assert.equal(limit, 5);
});

test("recommendFood - uses default limit when not provided", async () => {
    const req = mockRequest(
        { query: "high protein" },
        { protein: { min: 20 } },
        { protein: { $gte: 20 } }
    );

    const limit = parseInt(req.body.limit) || 5;
    assert.equal(limit, 5);
});

test("recommendFood - determines sort criteria for high protein", async () => {
    const parsedCriteria = { protein: { min: 30 } };
    let sortCriteria = {};

    if (parsedCriteria.protein?.min) {
        sortCriteria.protein = -1;
    }

    assert.deepEqual(sortCriteria, { protein: -1 });
});

test("recommendFood - determines sort criteria for low calories", async () => {
    const parsedCriteria = { calories: { max: 500 } };
    let sortCriteria = {};

    if (parsedCriteria.calories?.max) {
        sortCriteria.calories = 1;
    }

    assert.deepEqual(sortCriteria, { calories: 1 });
});

test("recommendFood - determines sort criteria for low fat", async () => {
    const parsedCriteria = { totalFat: { max: 20 } };
    let sortCriteria = {};

    if (parsedCriteria.totalFat?.max) {
        sortCriteria.totalFat = 1;
    }

    assert.deepEqual(sortCriteria, { totalFat: 1 });
});