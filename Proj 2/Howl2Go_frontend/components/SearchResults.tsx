"use client";

import { motion, AnimatePresence } from "framer-motion";
import ItemCard from "./ItemCard";
import type { FoodItem } from "@/types/food";

// Realistic demo data matching actual API structure
const demoDishes: FoodItem[] = [
  {
    restaurant: "McDonald's",
    item: "Big Mac",
    calories: 550,
    caloriesFromFat: null,
    totalFat: null,
    saturatedFat: null,
    transFat: null,
    cholesterol: null,
    sodium: null,
    carbs: null,
    fiber: null,
    sugars: null,
    protein: null,
    weightWatchersPoints: null,
  },
  {
    restaurant: "Taco Bell",
    item: "Crunchy Taco",
    calories: 170,
    caloriesFromFat: null,
    totalFat: null,
    saturatedFat: null,
    transFat: null,
    cholesterol: null,
    sodium: null,
    carbs: null,
    fiber: null,
    sugars: null,
    protein: null,
    weightWatchersPoints: null,
  },
  {
    restaurant: "KFC",
    item: "Chicken Breast",
    calories: 390,
    caloriesFromFat: null,
    totalFat: null,
    saturatedFat: null,
    transFat: null,
    cholesterol: null,
    sodium: null,
    carbs: null,
    fiber: null,
    sugars: null,
    protein: null,
    weightWatchersPoints: null,
  },
];

interface SearchResultsProps {
  isDemoMode: boolean;
  isSearchFocused: boolean;
  showDemoCards: boolean;
  showLiveResults: boolean;
  recommendations: string[];
}

export default function SearchResults({
  isDemoMode,
  isSearchFocused,
  showDemoCards,
  showLiveResults,
  recommendations,
}: SearchResultsProps) {
  return (
    <AnimatePresence mode="wait">
      {/* ========== DEMO MODE: Animated Dish Preview Cards ========== */}
      {isDemoMode && showDemoCards && (
        <motion.div
          key="demo-cards"
          className="grid grid-cols-1 sm:grid-cols-3 gap-6 overflow-hidden"
          initial={{ height: 0, opacity: 0 }}
          animate={{
            height: "auto",
            opacity: isSearchFocused ? 0.4 : 1,
            filter: isSearchFocused ? "blur(2px)" : "blur(0px)",
          }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        >
          {demoDishes.map((dish, idx) => (
            <div key={`${dish.restaurant}-${dish.item}-${idx}`}>
              <ItemCard
                restaurant={dish.restaurant}
                item={dish.item}
                calories={dish.calories}
                index={idx}
              />
            </div>
          ))}
        </motion.div>
      )}

      {/* ========== LIVE MODE: Search Recommendations ========== */}
      {!isDemoMode && showLiveResults && (
        <motion.div
          key="search-recommendations"
          className="overflow-hidden"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        >
          {/* Header */}
          <motion.h3
            className="text-xl font-semibold text-[var(--text)] mb-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          >
            Try searching for:
          </motion.h3>

          {/* Recommendations List - Simple Text */}
          <motion.ul
            className="space-y-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            {recommendations.map((suggestion, idx) => (
              <motion.li
                key={`suggestion-${idx}`}
                className="text-lg text-[var(--text)] bg-[var(--bg-card)] border border-[var(--border)] rounded-lg px-5 py-3 hover:border-[var(--orange)] hover:bg-[var(--bg-hover)] transition-all cursor-pointer"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * idx, duration: 0.2 }}
                whileHover={{ x: 4 }}
              >
                {suggestion}
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
