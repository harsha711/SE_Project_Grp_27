"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Plus, Utensils } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import type { MealLog } from "@/types/user";

interface RecentMealsSectionProps {
  meals: MealLog[];
  isVisible: boolean;
}

// Get restaurant logo helper
const getRestaurantLogo = (restaurant: string): string => {
  const normalized = restaurant.trim().toLowerCase();
  if (normalized.includes("mcdonald")) return "/mcdonalds-5.svg";
  if (normalized.includes("burger king")) return "/burger-king-4.svg";
  if (normalized.includes("wendy")) return "/wendys-logo-1.svg";
  if (normalized.includes("kfc") || normalized.includes("kentucky"))
    return "/kfc-4.svg";
  if (normalized.includes("taco bell") || normalized.includes("tacobell"))
    return "/taco-bell-1.svg";
  if (normalized.includes("starbucks")) return "/fast-food-svgrepo-com.svg";
  if (normalized.includes("chipotle")) return "/fast-food-svgrepo-com.svg";
  return "/fast-food-svgrepo-com.svg";
};

// Get meal type icon and label
const getMealTypeInfo = (mealType: MealLog["mealType"]) => {
  const mealTypes = {
    breakfast: { label: "Breakfast", icon: "🌅" },
    lunch: { label: "Lunch", icon: "🌞" },
    dinner: { label: "Dinner", icon: "🌙" },
    snack: { label: "Snack", icon: "🍎" },
  };
  return mealTypes[mealType];
};

export default function RecentMealsSection({
  meals,
  isVisible,
}: RecentMealsSectionProps) {
  // Group meals by type
  const groupedMeals = meals.reduce(
    (acc, meal) => {
      if (!acc[meal.mealType]) {
        acc[meal.mealType] = [];
      }
      acc[meal.mealType].push(meal);
      return acc;
    },
    {} as Record<MealLog["mealType"], MealLog[]>
  );

  const mealTypes: MealLog["mealType"][] = [
    "breakfast",
    "lunch",
    "dinner",
    "snack",
  ];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-full mt-8"
        >
          {/* Section Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-[var(--text)] flex items-center gap-2">
              <Utensils className="h-6 w-6 text-[var(--orange)]" />
              Today&apos;s Log
            </h2>
            <Link
              href="/history"
              className="text-sm font-medium text-[var(--orange)] hover:text-[var(--cream)] transition-colors"
            >
              View All →
            </Link>
          </div>

          {/* Empty State */}
          {meals.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center py-12 bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl"
            >
              <div className="text-5xl mb-4">🍽️</div>
              <h3 className="text-xl font-semibold text-[var(--text)] mb-2">
                No meals logged yet
              </h3>
              <p className="text-[var(--text-subtle)] mb-6">
                Start tracking your nutrition by searching above
              </p>
              <Link
                href="/search?source=dashboard"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold bg-[var(--orange)] text-[var(--text)] hover:bg-[var(--cream)] hover:text-[var(--bg)] transition-colors"
              >
                <Plus className="h-5 w-5" />
                Add Your First Meal
              </Link>
            </motion.div>
          ) : (
            /* Meal Groups */
            <div className="space-y-6">
              {mealTypes.map((mealType) => {
                const mealsOfType = groupedMeals[mealType] || [];
                if (mealsOfType.length === 0) return null;

                const { label, icon } = getMealTypeInfo(mealType);
                const totalCalories = mealsOfType.reduce(
                  (sum, meal) => sum + meal.foodItem.calories,
                  0
                );

                return (
                  <motion.div
                    key={mealType}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-5 hover:border-[var(--orange)] transition-colors"
                  >
                    {/* Meal type header */}
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-[var(--text)] flex items-center gap-2">
                        <span>{icon}</span>
                        {label}
                      </h3>
                      <span className="text-sm font-medium text-[var(--cream)] bg-[var(--bg-hover)] px-3 py-1 rounded-full">
                        {totalCalories} cal
                      </span>
                    </div>

                    {/* Meal items */}
                    <div className="space-y-3">
                      {mealsOfType.map((meal, index) => (
                        <motion.div
                          key={meal.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-center gap-4 p-3 bg-[var(--bg-hover)] rounded-lg hover:bg-[var(--border)] transition-colors group cursor-pointer"
                        >
                          {/* Restaurant logo */}
                          <div className="w-12 h-12 flex-shrink-0 relative">
                            <Image
                              src={getRestaurantLogo(meal.foodItem.restaurant)}
                              alt={meal.foodItem.restaurant}
                              width={48}
                              height={48}
                              className="object-contain"
                            />
                          </div>

                          {/* Item details */}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-[var(--text)] truncate group-hover:text-[var(--orange)] transition-colors">
                              {meal.foodItem.item}
                            </h4>
                            <p className="text-xs text-[var(--text-subtle)] truncate">
                              {meal.foodItem.restaurant}
                            </p>
                          </div>

                          {/* Calories */}
                          <div className="flex-shrink-0">
                            <div className="inline-flex items-center gap-1.5 bg-[var(--bg-card)] px-2.5 py-1 rounded-full">
                              <svg
                                className="w-3 h-3 text-[var(--orange)]"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M13 10V3L4 14h7v7l9-11h-7z"
                                />
                              </svg>
                              <span className="text-xs font-medium text-[var(--text)]">
                                {meal.foodItem.calories}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                );
              })}

              {/* Add More Food Button */}
              <Link
                href="/search?source=dashboard"
                className="flex items-center justify-center gap-2 w-full py-4 bg-[var(--bg-card)] border-2 border-dashed border-[var(--border)] rounded-xl text-[var(--text-subtle)] hover:border-[var(--orange)] hover:text-[var(--orange)] transition-all group"
              >
                <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
                <span className="font-medium">Add Food</span>
              </Link>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
