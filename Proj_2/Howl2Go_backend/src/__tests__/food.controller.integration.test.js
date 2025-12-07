/**
 * Integration tests for food.controller with mocked database
 * These tests cover the recommendFood function and its dependencies
 */
import { describe, test, expect, jest, beforeEach } from "@jest/globals";
import assert from "node:assert/strict";

// Mock FastFoodItem model before importing
const mockFind = jest.fn();
const mockSort = jest.fn();
const mockLean = jest.fn();

jest.unstable_mockModule("../models/FastFoodItem.js", () => ({
    default: {
        find: mockFind,
    },
}));

// Import controller after mocking
const { recommendFood } = await import("../controllers/food.controller.js");

// Mock request and response objects
const mockRequest = (
    body = {},
    parsedCriteria = {},
    mongoQuery = {},
    options = {}
) => ({
    body,
    parsedCriteria,
    mongoQuery,
    favoriteRestaurants: options.favoriteRestaurants || undefined,
    preferencesApplied: options.preferencesApplied || false,
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

beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mock chain
    mockLean.mockResolvedValue([]);
    mockSort.mockReturnValue({ lean: mockLean });
    mockFind.mockReturnValue({ sort: mockSort });
});

// ==================== RECOMMEND FOOD TESTS ====================

test("recommendFood - returns empty recommendations for no matches", async () => {
    mockLean.mockResolvedValue([]);

    const req = mockRequest(
        { query: "high protein" },
        { protein: { min: 100 } }, // Very high, no matches
        { protein: { $gte: 100 } }
    );
    const res = mockResponse();

    await recommendFood(req, res);

    assert.equal(res.statusCode, 200);
    assert.equal(res.jsonData.success, true);
    assert.equal(res.jsonData.recommendations.length, 0);
    assert.equal(res.jsonData.count, 0);
});

test("recommendFood - returns recommendations with calculated prices", async () => {
    mockLean.mockResolvedValue([
        { name: "Big Mac", company: "McDonald's", calories: 500, protein: 25 },
        { name: "Whopper", company: "Burger King", calories: 650, protein: 28 },
    ]);

    const req = mockRequest(
        { query: "high protein" },
        { protein: { min: 20 } },
        { protein: { $gte: 20 } }
    );
    const res = mockResponse();

    await recommendFood(req, res);

    assert.equal(res.statusCode, 200);
    assert.equal(res.jsonData.success, true);
    assert.equal(res.jsonData.recommendations.length, 2);
    // Check prices are calculated (500 * 0.01 = $5.00, 650 * 0.01 = $6.50)
    assert.equal(res.jsonData.recommendations[0].price, 5.0);
    assert.equal(res.jsonData.recommendations[1].price, 6.5);
});

test("recommendFood - sorts by protein descending for high protein queries", async () => {
    mockLean.mockResolvedValue([
        { name: "Protein Bowl", company: "Test", calories: 400, protein: 45 },
    ]);

    const req = mockRequest(
        { query: "high protein" },
        { protein: { min: 30 } },
        { protein: { $gte: 30 } }
    );
    const res = mockResponse();

    await recommendFood(req, res);

    expect(mockSort).toHaveBeenCalledWith({ protein: -1 });
});

test("recommendFood - sorts by calories ascending for low calorie queries", async () => {
    mockLean.mockResolvedValue([
        { name: "Salad", company: "Test", calories: 200, protein: 10 },
    ]);

    const req = mockRequest(
        { query: "low calorie" },
        { calories: { max: 300 } },
        { calories: { $lte: 300 } }
    );
    const res = mockResponse();

    await recommendFood(req, res);

    expect(mockSort).toHaveBeenCalledWith({ calories: 1 });
});

test("recommendFood - sorts by fat ascending for low fat queries", async () => {
    mockLean.mockResolvedValue([
        { name: "Grilled Chicken", company: "Test", calories: 300, totalFat: 8 },
    ]);

    const req = mockRequest(
        { query: "low fat" },
        { totalFat: { max: 10 } },
        { totalFat: { $lte: 10 } }
    );
    const res = mockResponse();

    await recommendFood(req, res);

    expect(mockSort).toHaveBeenCalledWith({ totalFat: 1 });
});

test("recommendFood - sorts by calories for low price queries", async () => {
    mockLean.mockResolvedValue([
        { name: "Value Menu Item", company: "Test", calories: 250 },
    ]);

    const req = mockRequest(
        { query: "cheap food" },
        { price: { max: 5 } },
        { calories: { $lte: 500 } }
    );
    const res = mockResponse();

    await recommendFood(req, res);

    expect(mockSort).toHaveBeenCalledWith({ calories: 1 });
});

test("recommendFood - sorts by calories descending for high price queries", async () => {
    mockLean.mockResolvedValue([
        { name: "Premium Burger", company: "Test", calories: 1200 },
    ]);

    const req = mockRequest(
        { query: "expensive food" },
        { price: { min: 10 } },
        { calories: { $gte: 1000 } }
    );
    const res = mockResponse();

    await recommendFood(req, res);

    expect(mockSort).toHaveBeenCalledWith({ calories: -1 });
});

test("recommendFood - boosts favorite restaurants to top", async () => {
    mockLean.mockResolvedValue([
        { name: "Whopper", company: "Burger King", calories: 650 },
        { name: "Big Mac", company: "McDonald's", calories: 500 },
        { name: "Baconator", company: "Wendy's", calories: 900 },
    ]);

    const req = mockRequest(
        { query: "burger" },
        { protein: { min: 15 } },
        { protein: { $gte: 15 } },
        { favoriteRestaurants: ["McDonald's"], preferencesApplied: true }
    );
    const res = mockResponse();

    await recommendFood(req, res);

    assert.equal(res.statusCode, 200);
    // McDonald's should be first
    assert.equal(res.jsonData.recommendations[0].company, "McDonald's");
    assert.equal(res.jsonData.preferencesApplied, true);
});

test("recommendFood - returns preferencesApplied flag when true", async () => {
    mockLean.mockResolvedValue([
        { name: "Test Item", company: "Test", calories: 400 },
    ]);

    const req = mockRequest(
        { query: "test" },
        { protein: { min: 20 } },
        { protein: { $gte: 20 } },
        { preferencesApplied: true }
    );
    const res = mockResponse();

    await recommendFood(req, res);

    assert.equal(res.jsonData.preferencesApplied, true);
});

test("recommendFood - returns preferencesApplied flag as false when not set", async () => {
    mockLean.mockResolvedValue([
        { name: "Test Item", company: "Test", calories: 400 },
    ]);

    const req = mockRequest(
        { query: "test" },
        { protein: { min: 20 } },
        { protein: { $gte: 20 } }
    );
    const res = mockResponse();

    await recommendFood(req, res);

    assert.equal(res.jsonData.preferencesApplied, false);
});

test("recommendFood - includes query and criteria in response", async () => {
    mockLean.mockResolvedValue([]);

    const req = mockRequest(
        { query: "healthy meal" },
        { protein: { min: 20 }, calories: { max: 500 } },
        { protein: { $gte: 20 }, calories: { $lte: 500 } }
    );
    const res = mockResponse();

    await recommendFood(req, res);

    assert.equal(res.jsonData.query, "healthy meal");
    assert.deepEqual(res.jsonData.criteria, { protein: { min: 20 }, calories: { max: 500 } });
});

test("recommendFood - handles database error", async () => {
    mockSort.mockReturnValue({
        lean: jest.fn().mockRejectedValue(new Error("Database connection failed")),
    });

    const req = mockRequest(
        { query: "test" },
        { protein: { min: 20 } },
        { protein: { $gte: 20 } }
    );
    const res = mockResponse();

    await recommendFood(req, res);

    assert.equal(res.statusCode, 500);
    assert.equal(res.jsonData.success, false);
    assert.ok(res.jsonData.error.includes("Failed to get recommendations"));
});

test("recommendFood - calculates minimum price for low calorie items", async () => {
    mockLean.mockResolvedValue([
        { name: "Side Salad", company: "Test", calories: 50 }, // 50 * 0.01 = $0.50, but min is $2.00
    ]);

    const req = mockRequest(
        { query: "low calorie" },
        { calories: { max: 100 } },
        { calories: { $lte: 100 } }
    );
    const res = mockResponse();

    await recommendFood(req, res);

    assert.equal(res.jsonData.recommendations[0].price, 2.0);
});

test("recommendFood - caps price at maximum for high calorie items", async () => {
    mockLean.mockResolvedValue([
        { name: "Monster Burger", company: "Test", calories: 2500 }, // 2500 * 0.01 = $25, but max is $15
    ]);

    const req = mockRequest(
        { query: "big meal" },
        { calories: { min: 2000 } },
        { calories: { $gte: 2000 } }
    );
    const res = mockResponse();

    await recommendFood(req, res);

    assert.equal(res.jsonData.recommendations[0].price, 15.0);
});

test("recommendFood - handles items with zero calories", async () => {
    mockLean.mockResolvedValue([
        { name: "Diet Water", company: "Test", calories: 0 },
    ]);

    const req = mockRequest({ query: "zero calorie" }, {}, {});
    const res = mockResponse();

    await recommendFood(req, res);

    assert.equal(res.jsonData.recommendations[0].price, 2.0);
});

test("recommendFood - handles empty mongoQuery", async () => {
    mockLean.mockResolvedValue([
        { name: "Random Item", company: "Test", calories: 400 },
    ]);

    const req = mockRequest({ query: "anything" }, {}, undefined);
    req.mongoQuery = undefined;
    const res = mockResponse();

    await recommendFood(req, res);

    assert.equal(res.statusCode, 200);
    expect(mockFind).toHaveBeenCalledWith({});
});

test("recommendFood - boosts multiple favorite restaurants", async () => {
    mockLean.mockResolvedValue([
        { name: "Item 1", company: "Other", calories: 400 },
        { name: "Item 2", company: "McDonald's", calories: 500 },
        { name: "Item 3", company: "Wendy's", calories: 600 },
        { name: "Item 4", company: "Another", calories: 700 },
    ]);

    const req = mockRequest(
        { query: "food" },
        {},
        {},
        { favoriteRestaurants: ["McDonald's", "Wendy's"] }
    );
    const res = mockResponse();

    await recommendFood(req, res);

    // First two should be favorites
    const firstTwo = res.jsonData.recommendations.slice(0, 2).map((r) => r.company);
    assert.ok(firstTwo.includes("McDonald's"));
    assert.ok(firstTwo.includes("Wendy's"));
});

test("recommendFood - handles items without company field", async () => {
    mockLean.mockResolvedValue([
        { name: "Unknown", calories: 400 }, // No company field
        { name: "Big Mac", company: "McDonald's", calories: 500 },
    ]);

    const req = mockRequest(
        { query: "food" },
        {},
        {},
        { favoriteRestaurants: ["McDonald's"] }
    );
    const res = mockResponse();

    await recommendFood(req, res);

    // McDonald's should be boosted to first
    assert.equal(res.jsonData.recommendations[0].company, "McDonald's");
});

test("recommendFood - returns correct message in response", async () => {
    mockLean.mockResolvedValue([
        { name: "Item 1", company: "Test", calories: 400 },
        { name: "Item 2", company: "Test", calories: 500 },
    ]);

    const req = mockRequest({ query: "test" }, {}, {});
    const res = mockResponse();

    await recommendFood(req, res);

    assert.ok(res.jsonData.message.includes("2 recommendations"));
});

test("recommendFood - uses empty sort criteria when no specific preferences", async () => {
    mockLean.mockResolvedValue([
        { name: "Item", company: "Test", calories: 400 },
    ]);

    const req = mockRequest(
        { query: "general food" },
        { sodium: { max: 1000 } }, // No protein min, calories max, fat max, or price
        { sodium: { $lte: 1000 } }
    );
    const res = mockResponse();

    await recommendFood(req, res);

    expect(mockSort).toHaveBeenCalledWith({});
});

test("recommendFood - does not boost when favoriteRestaurants is empty array", async () => {
    mockLean.mockResolvedValue([
        { name: "Item 1", company: "CompanyA", calories: 400 },
        { name: "Item 2", company: "CompanyB", calories: 500 },
    ]);

    const req = mockRequest(
        { query: "food" },
        {},
        {},
        { favoriteRestaurants: [] } // Empty array
    );
    const res = mockResponse();

    await recommendFood(req, res);

    // Order should be unchanged (no boosting)
    assert.equal(res.jsonData.recommendations[0].company, "CompanyA");
    assert.equal(res.jsonData.recommendations[1].company, "CompanyB");
});
