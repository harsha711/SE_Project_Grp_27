import { describe, test, expect, beforeEach, jest } from "@jest/globals";
import assert from "node:assert/strict";

// Mock User model
const mockUser = {
    preferences: {
        dietaryRestrictions: ["Vegetarian"],
        favoriteRestaurants: ["McDonald's"],
        maxCalories: 600,
        minProtein: 25,
    },
    save: jest.fn().mockResolvedValue(true),
};

// Create mock implementations
const mockFindById = jest.fn();

// Mock the User model
jest.unstable_mockModule("../models/User.js", () => ({
    default: {
        findById: mockFindById,
    },
}));

// Import after mocking
const { getPreferences, updatePreferences } = await import(
    "../controllers/user.controller.js"
);

// Mock request and response objects
const mockRequest = (body = {}, user = null) => ({
    body,
    user,
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
});

// ==================== GET PREFERENCES TESTS ====================

test("getPreferences - returns user preferences successfully", async () => {
    mockFindById.mockResolvedValue(mockUser);

    const req = mockRequest({}, { id: "user123" });
    const res = mockResponse();

    await getPreferences(req, res);

    assert.equal(res.statusCode, 200);
    assert.equal(res.jsonData.success, true);
    assert.deepEqual(res.jsonData.data.preferences, mockUser.preferences);
});

test("getPreferences - returns 404 when user not found", async () => {
    mockFindById.mockResolvedValue(null);

    const req = mockRequest({}, { id: "nonexistent" });
    const res = mockResponse();

    await getPreferences(req, res);

    assert.equal(res.statusCode, 404);
    assert.equal(res.jsonData.success, false);
    assert.ok(res.jsonData.message.includes("User not found"));
});

test("getPreferences - returns default preferences when user has none", async () => {
    mockFindById.mockResolvedValue({ preferences: null });

    const req = mockRequest({}, { id: "user123" });
    const res = mockResponse();

    await getPreferences(req, res);

    assert.equal(res.statusCode, 200);
    assert.equal(res.jsonData.success, true);
    assert.deepEqual(res.jsonData.data.preferences, {
        dietaryRestrictions: [],
        favoriteRestaurants: [],
        maxCalories: null,
        minProtein: null,
    });
});

test("getPreferences - returns 500 on database error", async () => {
    mockFindById.mockRejectedValue(new Error("Database error"));

    const req = mockRequest({}, { id: "user123" });
    const res = mockResponse();

    await getPreferences(req, res);

    assert.equal(res.statusCode, 500);
    assert.equal(res.jsonData.success, false);
    assert.ok(res.jsonData.message.includes("Failed to retrieve preferences"));
});

// ==================== UPDATE PREFERENCES TESTS ====================

test("updatePreferences - updates all preferences", async () => {
    const userWithSave = {
        preferences: {
            dietaryRestrictions: [],
            favoriteRestaurants: [],
            maxCalories: null,
            minProtein: null,
        },
        save: jest.fn().mockResolvedValue(true),
    };
    mockFindById.mockResolvedValue(userWithSave);

    const req = mockRequest(
        {
            dietaryRestrictions: ["Vegan"],
            favoriteRestaurants: ["Wendy's"],
            maxCalories: 800,
            minProtein: 30,
        },
        { id: "user123" }
    );
    const res = mockResponse();

    await updatePreferences(req, res);

    assert.equal(res.statusCode, 200);
    assert.equal(res.jsonData.success, true);
    assert.equal(userWithSave.preferences.maxCalories, 800);
    assert.equal(userWithSave.preferences.minProtein, 30);
    assert.deepEqual(userWithSave.preferences.dietaryRestrictions, ["Vegan"]);
    assert.deepEqual(userWithSave.preferences.favoriteRestaurants, ["Wendy's"]);
});

test("updatePreferences - updates only maxCalories", async () => {
    const userWithSave = {
        preferences: {
            dietaryRestrictions: ["Vegetarian"],
            favoriteRestaurants: ["McDonald's"],
            maxCalories: 500,
            minProtein: 20,
        },
        save: jest.fn().mockResolvedValue(true),
    };
    mockFindById.mockResolvedValue(userWithSave);

    const req = mockRequest({ maxCalories: 700 }, { id: "user123" });
    const res = mockResponse();

    await updatePreferences(req, res);

    assert.equal(res.statusCode, 200);
    assert.equal(userWithSave.preferences.maxCalories, 700);
    // Others should remain unchanged
    assert.equal(userWithSave.preferences.minProtein, 20);
    assert.deepEqual(userWithSave.preferences.dietaryRestrictions, ["Vegetarian"]);
});

test("updatePreferences - updates only minProtein", async () => {
    const userWithSave = {
        preferences: {
            dietaryRestrictions: [],
            favoriteRestaurants: [],
            maxCalories: 600,
            minProtein: 15,
        },
        save: jest.fn().mockResolvedValue(true),
    };
    mockFindById.mockResolvedValue(userWithSave);

    const req = mockRequest({ minProtein: 35 }, { id: "user123" });
    const res = mockResponse();

    await updatePreferences(req, res);

    assert.equal(res.statusCode, 200);
    assert.equal(userWithSave.preferences.minProtein, 35);
    assert.equal(userWithSave.preferences.maxCalories, 600);
});

test("updatePreferences - updates only dietaryRestrictions", async () => {
    const userWithSave = {
        preferences: {
            dietaryRestrictions: [],
            favoriteRestaurants: [],
            maxCalories: null,
            minProtein: null,
        },
        save: jest.fn().mockResolvedValue(true),
    };
    mockFindById.mockResolvedValue(userWithSave);

    const req = mockRequest(
        { dietaryRestrictions: ["Gluten-Free", "Low-Sodium"] },
        { id: "user123" }
    );
    const res = mockResponse();

    await updatePreferences(req, res);

    assert.equal(res.statusCode, 200);
    assert.deepEqual(userWithSave.preferences.dietaryRestrictions, [
        "Gluten-Free",
        "Low-Sodium",
    ]);
});

test("updatePreferences - updates only favoriteRestaurants", async () => {
    const userWithSave = {
        preferences: {
            dietaryRestrictions: [],
            favoriteRestaurants: [],
            maxCalories: null,
            minProtein: null,
        },
        save: jest.fn().mockResolvedValue(true),
    };
    mockFindById.mockResolvedValue(userWithSave);

    const req = mockRequest(
        { favoriteRestaurants: ["KFC", "Taco Bell"] },
        { id: "user123" }
    );
    const res = mockResponse();

    await updatePreferences(req, res);

    assert.equal(res.statusCode, 200);
    assert.deepEqual(userWithSave.preferences.favoriteRestaurants, [
        "KFC",
        "Taco Bell",
    ]);
});

test("updatePreferences - returns 404 when user not found", async () => {
    mockFindById.mockResolvedValue(null);

    const req = mockRequest({ maxCalories: 600 }, { id: "nonexistent" });
    const res = mockResponse();

    await updatePreferences(req, res);

    assert.equal(res.statusCode, 404);
    assert.equal(res.jsonData.success, false);
    assert.ok(res.jsonData.message.includes("User not found"));
});

test("updatePreferences - returns 500 on database error", async () => {
    mockFindById.mockRejectedValue(new Error("Database error"));

    const req = mockRequest({ maxCalories: 600 }, { id: "user123" });
    const res = mockResponse();

    await updatePreferences(req, res);

    assert.equal(res.statusCode, 500);
    assert.equal(res.jsonData.success, false);
    assert.ok(res.jsonData.message.includes("Failed to update preferences"));
});

test("updatePreferences - handles validation error", async () => {
    const validationError = new Error("Validation failed");
    validationError.name = "ValidationError";
    validationError.errors = {
        maxCalories: { message: "maxCalories must be a number" },
    };

    const userWithSave = {
        preferences: {
            dietaryRestrictions: [],
            favoriteRestaurants: [],
            maxCalories: null,
            minProtein: null,
        },
        save: jest.fn().mockRejectedValue(validationError),
    };
    mockFindById.mockResolvedValue(userWithSave);

    const req = mockRequest({ maxCalories: "invalid" }, { id: "user123" });
    const res = mockResponse();

    await updatePreferences(req, res);

    assert.equal(res.statusCode, 400);
    assert.equal(res.jsonData.success, false);
    assert.ok(res.jsonData.message.includes("Validation failed"));
});

test("updatePreferences - allows setting values to null", async () => {
    const userWithSave = {
        preferences: {
            dietaryRestrictions: ["Vegetarian"],
            favoriteRestaurants: ["McDonald's"],
            maxCalories: 600,
            minProtein: 25,
        },
        save: jest.fn().mockResolvedValue(true),
    };
    mockFindById.mockResolvedValue(userWithSave);

    const req = mockRequest(
        { maxCalories: null, minProtein: null },
        { id: "user123" }
    );
    const res = mockResponse();

    await updatePreferences(req, res);

    assert.equal(res.statusCode, 200);
    assert.equal(userWithSave.preferences.maxCalories, null);
    assert.equal(userWithSave.preferences.minProtein, null);
});

test("updatePreferences - allows clearing arrays", async () => {
    const userWithSave = {
        preferences: {
            dietaryRestrictions: ["Vegetarian"],
            favoriteRestaurants: ["McDonald's"],
            maxCalories: 600,
            minProtein: 25,
        },
        save: jest.fn().mockResolvedValue(true),
    };
    mockFindById.mockResolvedValue(userWithSave);

    const req = mockRequest(
        { dietaryRestrictions: [], favoriteRestaurants: [] },
        { id: "user123" }
    );
    const res = mockResponse();

    await updatePreferences(req, res);

    assert.equal(res.statusCode, 200);
    assert.deepEqual(userWithSave.preferences.dietaryRestrictions, []);
    assert.deepEqual(userWithSave.preferences.favoriteRestaurants, []);
});
