// User-related type definitions for dashboard and profile management

import type { FoodItem } from "./food";

export interface DailyProgress {
  consumed: number;
  goal: number;
  remaining: number;
  percentage: number;
}

export interface MealLog {
  id: string;
  timestamp: Date;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  foodItem: FoodItem;
}

export interface UserPreferences {
  dietaryRestrictions: string[];
  favoriteRestaurants: string[];
  maxCalories: number | null;
  minProtein: number | null;
}

export interface UserProfile {
  name: string;
  email: string;
  dailyGoal: number;
  avatar?: string;
  // Role of the user within the system: 'user' | 'staff' | 'admin'
  role?: string;
  preferences?: UserPreferences;
}

export interface DashboardData {
  user: UserProfile;
  todaysMeals: MealLog[];
  dailyProgress: DailyProgress;
}
