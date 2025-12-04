/**
 * Recommendation types for AI-powered meal suggestions
 */

import type { FoodItem } from "./food";

/**
 * A single recommendation with reasoning
 */
export interface Recommendation {
    item: FoodItem & {
        _id?: string;
        company?: string;
    };
    reason: string;
    type: "frequent" | "similar" | "explore" | "healthy-alt" | "time-based" | "popular";
    confidence: number;
    orderCount?: number;
    originalItem?: FoodItem;
    caloriesSaved?: number;
    mealType?: string;
}

/**
 * User's ordering profile and preferences
 */
export interface UserProfile {
    totalOrders: number;
    favoriteRestaurant: string | null;
    avgCaloriesPerItem: number;
    avgProteinPerItem?: number;
    dietaryPreference: "balanced" | "high-protein" | "low-calorie" | "hearty";
    topItems?: string[];
}

/**
 * Response from the recommendations API
 */
export interface RecommendationsResponse {
    success: boolean;
    recommendations: Recommendation[];
    count?: number;
    message: string;
    isNewUser?: boolean;
    userProfile?: UserProfile | null;
    mealType?: string;
}

/**
 * Response from the user profile API
 */
export interface UserProfileResponse {
    success: boolean;
    profile: {
        totalOrders: number;
        totalItemsOrdered: number;
        favoriteRestaurants: Array<{
            name: string;
            count: number;
            percentage: number;
        }>;
        frequentItems: Array<{
            restaurant: string;
            item: string;
            count: number;
        }>;
        avgCalories: number;
        avgProtein: number;
        avgPrice: number;
        dietaryPreference: string;
        orderTimePatterns: {
            morning: number;
            afternoon: number;
            evening: number;
            night: number;
        };
        lastOrderDate: string | null;
    } | null;
    message: string;
}
