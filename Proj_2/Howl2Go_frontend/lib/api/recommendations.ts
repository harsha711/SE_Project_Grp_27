/**
 * Recommendations API client
 *
 * Functions to fetch AI-powered meal recommendations from the backend.
 */

import type { RecommendationsResponse, UserProfileResponse } from "@/types/recommendation";

const API_BASE = "/api/proxy";

/**
 * Helper to make API requests through the proxy
 */
async function fetchFromAPI<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_BASE}?path=${encodeURIComponent(endpoint)}`, {
        method: "GET",
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
    }

    return response.json();
}

/**
 * Get personalized AI recommendations
 * @param limit - Number of recommendations (default: 8)
 * @param includeProfile - Include user profile in response
 */
export async function getPersonalizedRecommendations(
    limit = 8,
    includeProfile = true
): Promise<RecommendationsResponse> {
    return fetchFromAPI<RecommendationsResponse>(
        `/api/recommendations?limit=${limit}&includeProfile=${includeProfile}`
    );
}

/**
 * Get frequently ordered items
 * @param limit - Number of items (default: 5)
 */
export async function getFrequentlyOrdered(limit = 5): Promise<RecommendationsResponse> {
    return fetchFromAPI<RecommendationsResponse>(
        `/api/recommendations/frequent?limit=${limit}`
    );
}

/**
 * Get items similar to user preferences
 * @param limit - Number of items (default: 5)
 */
export async function getSimilarItems(limit = 5): Promise<RecommendationsResponse> {
    return fetchFromAPI<RecommendationsResponse>(
        `/api/recommendations/similar?limit=${limit}`
    );
}

/**
 * Get exploration suggestions (try something new)
 * @param limit - Number of suggestions (default: 3)
 */
export async function getExplorationSuggestions(limit = 3): Promise<RecommendationsResponse> {
    return fetchFromAPI<RecommendationsResponse>(
        `/api/recommendations/explore?limit=${limit}`
    );
}

/**
 * Get time-based meal suggestions
 * @param mealType - Optional: breakfast, lunch, dinner, late-night
 * @param limit - Number of suggestions (default: 3)
 */
export async function getTimeBasedSuggestions(
    mealType?: string,
    limit = 3
): Promise<RecommendationsResponse> {
    const params = new URLSearchParams({ limit: String(limit) });
    if (mealType) {
        params.set("mealType", mealType);
    }
    return fetchFromAPI<RecommendationsResponse>(
        `/api/recommendations/time-based?${params.toString()}`
    );
}

/**
 * Get healthier alternatives to frequently ordered items
 * @param limit - Number of alternatives (default: 3)
 */
export async function getHealthierAlternatives(limit = 3): Promise<RecommendationsResponse> {
    return fetchFromAPI<RecommendationsResponse>(
        `/api/recommendations/healthy?limit=${limit}`
    );
}

/**
 * Get user's ordering profile and stats
 */
export async function getUserOrderingProfile(): Promise<UserProfileResponse> {
    return fetchFromAPI<UserProfileResponse>("/api/recommendations/profile");
}
