"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import DashboardHero from "@/components/DashboardHero";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import {
  mockDashboardData,
  calculateDailyProgress,
} from "@/lib/mockDashboardData";
import type { MealLog, DailyProgress } from "@/types/user";

export default function Dashboard() {
  const { user, isLoading } = useAuth();
  const [todaysMeals, setTodaysMeals] = useState<MealLog[]>([]);
  const [dailyProgress, setDailyProgress] = useState<DailyProgress>({
    consumed: 0,
    goal: 2000,
    remaining: 2000,
    percentage: 0,
  });

  useEffect(() => {
    // TODO: Replace with real API call to fetch today's meals
    // For now, using mock data as fallback
    if (user) {
      // Simulate API call - in production, this would be:
      // const meals = await fetchTodaysMeals();
      const meals = mockDashboardData.todaysMeals;
      setTodaysMeals(meals);

      // Calculate progress based on fetched meals and user's daily goal
      const goal = user.dailyGoal || 2000;
      const progress = calculateDailyProgress(meals, goal);
      setDailyProgress(progress);
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--howl-bg)] flex items-center justify-center">
        <div className="text-[var(--text)] text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[var(--howl-bg)] flex items-center justify-center">
        <div className="text-[var(--text)] text-xl">
          Please log in to view dashboard
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--howl-bg)]">
      <Header />

      <div className="pt-15 min-h-screen">
        <DashboardHero
          userName={user.name}
          dailyProgress={dailyProgress}
          recentMeals={todaysMeals}
        />
      </div>

      <Footer />
    </div>
  );
}
