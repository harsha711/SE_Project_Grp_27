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

export interface UserProfile {
  name: string;
  email: string;
  dailyGoal: number;
  avatar?: string;
}

export interface DashboardData {
  user: UserProfile;
  todaysMeals: MealLog[];
  dailyProgress: DailyProgress;
}
