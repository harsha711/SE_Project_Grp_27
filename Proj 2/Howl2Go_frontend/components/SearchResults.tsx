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
  filteredResults: FoodItem[];
}

export default function SearchResults({
  isDemoMode,
  isSearchFocused,
  showDemoCards,
  showLiveResults,
  filteredResults,
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
            filter: isSearchFocused ? "blur(4px)" : "blur(0px)",
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

      {/* ========== LIVE MODE: Search Results ========== */}
      {!isDemoMode && showLiveResults && (
        <motion.div
          key="search-results"
          className="overflow-hidden"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        >
          {filteredResults.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResults.map((result, idx) => (
                <ItemCard
                  key={`${result.restaurant}-${result.item}-${idx}`}
                  restaurant={result.restaurant}
                  item={result.item}
                  calories={result.calories}
                  index={idx}
                />
              ))}
            </div>
          ) : (
            <motion.p
              className="text-center text-[var(--howl-neutral)] opacity-60 py-12 text-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              Search something like: &quot;100 calories food&quot;!
            </motion.p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
