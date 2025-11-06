// Mock data for dashboard - will be replaced with real API calls

import type { DashboardData } from "@/types/user";

export const mockDashboardData: DashboardData = {
  user: {
    name: "Sarah",
    email: "sarah@example.com",
    dailyGoal: 2000,
  },
  todaysMeals: [
    {
      id: "1",
      timestamp: new Date("2025-11-05T08:30:00"),
      mealType: "breakfast",
      foodItem: {
        restaurant: "Starbucks",
        item: "Egg White & Roasted Red Pepper Bites",
        calories: 170,
        protein: 13,
        carbs: 13,
        totalFat: 7,
        saturatedFat: 4,
        transFat: 0,
        cholesterol: 10,
        sodium: 450,
        fiber: 1,
        sugars: 3,
        caloriesFromFat: 63,
        weightWatchersPoints: 5,
      },
    },
    {
      id: "2",
      timestamp: new Date("2025-11-05T08:35:00"),
      mealType: "breakfast",
      foodItem: {
        restaurant: "Starbucks",
        item: "Grande Caffè Latte",
        calories: 190,
        protein: 13,
        carbs: 19,
        totalFat: 7,
        saturatedFat: 4.5,
        transFat: 0,
        cholesterol: 25,
        sodium: 170,
        fiber: 0,
        sugars: 18,
        caloriesFromFat: 63,
        weightWatchersPoints: 5,
      },
    },
    {
      id: "3",
      timestamp: new Date("2025-11-05T12:45:00"),
      mealType: "lunch",
      foodItem: {
        restaurant: "Chipotle",
        item: "Chicken Bowl",
        calories: 630,
        protein: 41,
        carbs: 67,
        totalFat: 21,
        saturatedFat: 8,
        transFat: 0,
        cholesterol: 125,
        sodium: 1420,
        fiber: 12,
        sugars: 4,
        caloriesFromFat: 189,
        weightWatchersPoints: 17,
      },
    },
    {
      id: "4",
      timestamp: new Date("2025-11-05T15:20:00"),
      mealType: "snack",
      foodItem: {
        restaurant: "Starbucks",
        item: "Blueberry Muffin",
        calories: 380,
        protein: 5,
        carbs: 56,
        totalFat: 16,
        saturatedFat: 2,
        transFat: 0,
        cholesterol: 55,
        sodium: 360,
        fiber: 2,
        sugars: 29,
        caloriesFromFat: 144,
        weightWatchersPoints: 11,
      },
    },
  ],
  dailyProgress: {
    consumed: 1370,
    goal: 2000,
    remaining: 630,
    percentage: 68.5,
  },
};

// Helper function to calculate daily progress from meals
export function calculateDailyProgress(
  meals: DashboardData["todaysMeals"],
  dailyGoal: number
): DashboardData["dailyProgress"] {
  const consumed = meals.reduce(
    (total, meal) => total + meal.foodItem.calories,
    0
  );
  const remaining = dailyGoal - consumed;
  const percentage = (consumed / dailyGoal) * 100;

  return {
    consumed,
    goal: dailyGoal,
    remaining,
    percentage: Math.min(percentage, 100), // Cap at 100%
  };
}
