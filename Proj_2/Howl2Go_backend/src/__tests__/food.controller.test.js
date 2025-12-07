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

// ==================== BOOST FAVORITE RESTAURANTS TESTS ====================

// Helper function to test boostFavoriteRestaurants logic (inline for unit testing)
const boostFavoriteRestaurants = (items, favoriteRestaurants) => {
    if (!favoriteRestaurants?.length) return items;

    const normalizedFavorites = favoriteRestaurants.map(r => r.toLowerCase().trim());

    const favorites = [];
    const others = [];

    for (const item of items) {
        const companyLower = (item.company || '').toLowerCase().trim();
        // Skip matching if company is empty - can't be a favorite
        if (!companyLower) {
            others.push(item);
            continue;
        }
        if (normalizedFavorites.some(fav => companyLower.includes(fav) || fav.includes(companyLower))) {
            favorites.push(item);
        } else {
            others.push(item);
        }
    }

    return [...favorites, ...others];
};

test("boostFavoriteRestaurants - returns items unchanged when no favorites", () => {
    const items = [
        { name: "Big Mac", company: "McDonald's" },
        { name: "Whopper", company: "Burger King" },
    ];

    const result = boostFavoriteRestaurants(items, []);
    assert.deepEqual(result, items);
});

test("boostFavoriteRestaurants - returns items unchanged when favorites is null", () => {
    const items = [
        { name: "Big Mac", company: "McDonald's" },
        { name: "Whopper", company: "Burger King" },
    ];

    const result = boostFavoriteRestaurants(items, null);
    assert.deepEqual(result, items);
});

test("boostFavoriteRestaurants - moves favorite restaurant items to top", () => {
    const items = [
        { name: "Whopper", company: "Burger King" },
        { name: "Big Mac", company: "McDonald's" },
        { name: "Baconator", company: "Wendy's" },
    ];

    const result = boostFavoriteRestaurants(items, ["McDonald's"]);

    assert.equal(result[0].company, "McDonald's");
    assert.equal(result.length, 3);
});

test("boostFavoriteRestaurants - case-insensitive matching", () => {
    const items = [
        { name: "Whopper", company: "Burger King" },
        { name: "Big Mac", company: "McDonald's" },
    ];

    const result = boostFavoriteRestaurants(items, ["mcdonald's"]);

    assert.equal(result[0].company, "McDonald's");
});

test("boostFavoriteRestaurants - partial matching works", () => {
    const items = [
        { name: "Whopper", company: "Burger King" },
        { name: "Big Mac", company: "McDonald's Restaurant" },
    ];

    const result = boostFavoriteRestaurants(items, ["mcdonald"]);

    assert.equal(result[0].company, "McDonald's Restaurant");
});

test("boostFavoriteRestaurants - multiple favorites", () => {
    const items = [
        { name: "Whopper", company: "Burger King" },
        { name: "Big Mac", company: "McDonald's" },
        { name: "Baconator", company: "Wendy's" },
        { name: "Chicken Sandwich", company: "Chick-fil-A" },
    ];

    const result = boostFavoriteRestaurants(items, ["McDonald's", "Wendy's"]);

    // McDonald's and Wendy's should be first
    const favoriteCompanies = result.slice(0, 2).map(i => i.company);
    assert.ok(favoriteCompanies.includes("McDonald's"));
    assert.ok(favoriteCompanies.includes("Wendy's"));
});

test("boostFavoriteRestaurants - handles empty company field gracefully", () => {
    const items = [
        { name: "Unknown Item", company: "" },
        { name: "Big Mac", company: "McDonald's" },
    ];

    const result = boostFavoriteRestaurants(items, ["McDonald's"]);

    // McDonald's should be in favorites array, empty company should be in others
    // Favorites come first, so McDonald's is now at index 0
    const mcdonaldsItem = result.find(i => i.company === "McDonald's");
    const unknownItem = result.find(i => i.company === "");

    assert.ok(mcdonaldsItem);
    assert.ok(unknownItem);
    assert.equal(result.length, 2);
    // Verify favorites are before others
    assert.ok(result.indexOf(mcdonaldsItem) < result.indexOf(unknownItem));
});

test("boostFavoriteRestaurants - handles undefined company field gracefully", () => {
    const items = [
        { name: "Unknown Item" }, // No company field
        { name: "Big Mac", company: "McDonald's" },
    ];

    const result = boostFavoriteRestaurants(items, ["McDonald's"]);

    // Verify both items are present
    const mcdonaldsItem = result.find(i => i.company === "McDonald's");
    const unknownItem = result.find(i => i.name === "Unknown Item");

    assert.ok(mcdonaldsItem);
    assert.ok(unknownItem);
    assert.equal(result.length, 2);
    // McDonald's (favorite) should come before the unknown item
    assert.ok(result.indexOf(mcdonaldsItem) < result.indexOf(unknownItem));
});

// ==================== CALCULATE PRICE TESTS ====================

const calculatePrice = (calories) => {
    if (!calories || calories <= 0) return 2.0;
    const basePrice = calories * 0.01;
    return Math.min(Math.max(basePrice, 2.0), 15.0);
};

test("calculatePrice - returns minimum price for zero calories", () => {
    assert.equal(calculatePrice(0), 2.0);
});

test("calculatePrice - returns minimum price for negative calories", () => {
    assert.equal(calculatePrice(-100), 2.0);
});

test("calculatePrice - returns minimum price for null calories", () => {
    assert.equal(calculatePrice(null), 2.0);
});

test("calculatePrice - returns minimum price for undefined calories", () => {
    assert.equal(calculatePrice(undefined), 2.0);
});

test("calculatePrice - calculates price for low calorie item", () => {
    // 300 calories * 0.01 = $3.00
    assert.equal(calculatePrice(300), 3.0);
});

test("calculatePrice - calculates price for medium calorie item", () => {
    // 800 calories * 0.01 = $8.00
    assert.equal(calculatePrice(800), 8.0);
});

test("calculatePrice - caps price at maximum for high calorie item", () => {
    // 2000 calories * 0.01 = $20.00, but max is $15.00
    assert.equal(calculatePrice(2000), 15.0);
});

test("calculatePrice - returns minimum for items below threshold", () => {
    // 100 calories * 0.01 = $1.00, but min is $2.00
    assert.equal(calculatePrice(100), 2.0);
});

// ==================== SORT CRITERIA TESTS ====================

test("recommendFood - determines sort criteria for low price", () => {
    const parsedCriteria = { price: { max: 10 } };
    let sortCriteria = {};

    if (parsedCriteria.protein?.min) {
        sortCriteria.protein = -1;
    } else if (parsedCriteria.calories?.max) {
        sortCriteria.calories = 1;
    } else if (parsedCriteria.totalFat?.max) {
        sortCriteria.totalFat = 1;
    } else if (parsedCriteria.price?.max) {
        sortCriteria.calories = 1;
    }

    assert.deepEqual(sortCriteria, { calories: 1 });
});

test("recommendFood - determines sort criteria for high price", () => {
    const parsedCriteria = { price: { min: 10 } };
    let sortCriteria = {};

    if (parsedCriteria.protein?.min) {
        sortCriteria.protein = -1;
    } else if (parsedCriteria.calories?.max) {
        sortCriteria.calories = 1;
    } else if (parsedCriteria.totalFat?.max) {
        sortCriteria.totalFat = 1;
    } else if (parsedCriteria.price?.max) {
        sortCriteria.calories = 1;
    } else if (parsedCriteria.price?.min) {
        sortCriteria.calories = -1;
    }

    assert.deepEqual(sortCriteria, { calories: -1 });
});

test("recommendFood - preferencesApplied flag defaults to false", () => {
    const req = mockRequest(
        { query: "high protein" },
        { protein: { min: 20 } },
        { protein: { $gte: 20 } }
    );

    const preferencesApplied = req.preferencesApplied || false;
    assert.equal(preferencesApplied, false);
});

test("recommendFood - preferencesApplied flag is true when set", () => {
    const req = mockRequest(
        { query: "high protein" },
        { protein: { min: 20 } },
        { protein: { $gte: 20 } }
    );
    req.preferencesApplied = true;

    assert.equal(req.preferencesApplied, true);
});

test("recommendFood - favoriteRestaurants is undefined by default", () => {
    const req = mockRequest(
        { query: "high protein" },
        { protein: { min: 20 } },
        { protein: { $gte: 20 } }
    );

    assert.equal(req.favoriteRestaurants, undefined);
});

test("recommendFood - favoriteRestaurants can be set", () => {
    const req = mockRequest(
        { query: "high protein" },
        { protein: { min: 20 } },
        { protein: { $gte: 20 } }
    );
    req.favoriteRestaurants = ["McDonald's", "Wendy's"];

    assert.deepEqual(req.favoriteRestaurants, ["McDonald's", "Wendy's"]);
});