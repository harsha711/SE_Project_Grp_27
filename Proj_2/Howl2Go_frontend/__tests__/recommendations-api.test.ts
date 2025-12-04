/**
 * Recommendations API Tests
 *
 * Tests for the recommendations API client functions.
 */

import {
    getPersonalizedRecommendations,
    getFrequentlyOrdered,
    getSimilarItems,
    getExplorationSuggestions,
    getTimeBasedSuggestions,
    getHealthierAlternatives,
    getUserOrderingProfile,
} from "@/lib/api/recommendations";

// Mock fetch globally
global.fetch = jest.fn();

const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe("Recommendations API", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("getPersonalizedRecommendations", () => {
        it("fetches recommendations with default parameters", async () => {
            const mockResponse = {
                success: true,
                message: "OK",
                recommendations: [],
            };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockResponse),
            } as Response);

            const result = await getPersonalizedRecommendations();

            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining("/api/recommendations?limit=8&includeProfile=true"),
                expect.objectContaining({
                    method: "GET",
                    credentials: "include",
                })
            );
            expect(result).toEqual(mockResponse);
        });

        it("fetches recommendations with custom parameters", async () => {
            const mockResponse = {
                success: true,
                message: "OK",
                recommendations: [],
            };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockResponse),
            } as Response);

            await getPersonalizedRecommendations(10, false);

            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining("/api/recommendations?limit=10&includeProfile=false"),
                expect.any(Object)
            );
        });

        it("throws error on API failure", async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 500,
            } as Response);

            await expect(getPersonalizedRecommendations()).rejects.toThrow(
                "API request failed: 500"
            );
        });
    });

    describe("getFrequentlyOrdered", () => {
        it("fetches frequent items", async () => {
            const mockResponse = {
                success: true,
                message: "OK",
                recommendations: [],
            };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockResponse),
            } as Response);

            const result = await getFrequentlyOrdered(3);

            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining("/api/recommendations/frequent?limit=3"),
                expect.any(Object)
            );
            expect(result).toEqual(mockResponse);
        });
    });

    describe("getSimilarItems", () => {
        it("fetches similar items with limit", async () => {
            const mockResponse = {
                success: true,
                message: "OK",
                recommendations: [],
            };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockResponse),
            } as Response);

            const result = await getSimilarItems(5);

            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining("/api/recommendations/similar?limit=5"),
                expect.any(Object)
            );
            expect(result).toEqual(mockResponse);
        });
    });

    describe("getExplorationSuggestions", () => {
        it("fetches exploration suggestions", async () => {
            const mockResponse = {
                success: true,
                message: "OK",
                recommendations: [],
            };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockResponse),
            } as Response);

            const result = await getExplorationSuggestions(5);

            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining("/api/recommendations/explore?limit=5"),
                expect.any(Object)
            );
            expect(result).toEqual(mockResponse);
        });
    });

    describe("getTimeBasedSuggestions", () => {
        it("fetches time-based suggestions", async () => {
            const mockResponse = {
                success: true,
                message: "OK",
                recommendations: [],
                mealType: "lunch",
            };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockResponse),
            } as Response);

            const result = await getTimeBasedSuggestions();

            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining("/api/recommendations/time-based"),
                expect.any(Object)
            );
            expect(result).toEqual(mockResponse);
        });
    });

    describe("getHealthierAlternatives", () => {
        it("fetches healthier alternatives", async () => {
            const mockResponse = {
                success: true,
                message: "OK",
                recommendations: [],
            };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockResponse),
            } as Response);

            const result = await getHealthierAlternatives();

            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining("/api/recommendations/healthy"),
                expect.any(Object)
            );
            expect(result).toEqual(mockResponse);
        });
    });

    describe("getUserOrderingProfile", () => {
        it("fetches user profile", async () => {
            const mockResponse = {
                success: true,
                profile: {
                    totalOrders: 10,
                    totalItemsOrdered: 25,
                    favoriteRestaurants: [],
                    frequentItems: [],
                    nutritionAverages: {},
                    orderPatterns: {},
                    memberSince: "2024-01-01",
                },
            };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockResponse),
            } as Response);

            const result = await getUserOrderingProfile();

            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining("/api/recommendations/profile"),
                expect.any(Object)
            );
            expect(result).toEqual(mockResponse);
        });
    });
});
