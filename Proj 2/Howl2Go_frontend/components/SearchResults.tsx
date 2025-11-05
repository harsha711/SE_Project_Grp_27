"use client";

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
  onRecommendationClick?: (recommendation: string) => void;
}

export default function SearchResults({
  isDemoMode,
  isSearchFocused,
  showDemoCards,
  showLiveResults,
  recommendations,
  onRecommendationClick,
}: SearchResultsProps) {
  return (
    <>
      {/* ========== DEMO MODE: Animated Dish Preview Cards ========== */}
      {isDemoMode && showDemoCards && (
        <div
          key="demo-cards"
          className="grid grid-cols-1 sm:grid-cols-3 gap-6"
        >
          {demoDishes.map((dish, idx) => (
            <div
              key={`${dish.restaurant}-${dish.item}-${idx}`}
              className={`transition-all duration-500 ease-out ${
                isSearchFocused
                  ? 'opacity-0 blur-sm translate-y-4'
                  : 'opacity-100 blur-0 translate-y-0'
              }`}
              style={{
                transitionDelay: isSearchFocused
                  ? `${idx * 100}ms`
                  : `${(demoDishes.length - idx - 1) * 100}ms`,
              }}
            >
              <ItemCard
                restaurant={dish.restaurant}
                item={dish.item}
                calories={dish.calories}
                disableAnimation={true}
              />
            </div>
          ))}
        </div>
      )}

      {/* ========== LIVE MODE: Search Recommendations ========== */}
      {!isDemoMode && showLiveResults && (
        <div key="search-recommendations">
          {/* Header */}
          <h3 className="text-xl font-semibold text-[var(--text)] mb-4 opacity-0 animate-[fadeInDown_0.4s_ease-out_forwards]">
            Try searching for:
          </h3>

          {/* Recommendations List - Clickable */}
          <ul className="space-y-3">
            {recommendations.map((suggestion, idx) => (
              <li
                key={`suggestion-${idx}`}
                onClick={() => onRecommendationClick?.(suggestion)}
                className="text-lg text-[var(--text)] bg-[var(--bg-card)] border border-[var(--border)] rounded-lg px-5 py-3 hover:border-[var(--orange)] hover:bg-[var(--bg-hover)] hover:translate-x-1 transition-all cursor-pointer opacity-0 animate-[slideInLeft_0.3s_ease-out_forwards]"
                style={{
                  animationDelay: `${idx * 50}ms`,
                }}
              >
                {suggestion}
              </li>
            ))}
          </ul>
          <style jsx>{`
            @keyframes fadeInDown {
              from {
                opacity: 0;
                transform: translateY(-10px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
            @keyframes slideInLeft {
              from {
                opacity: 0;
                transform: translateX(-20px);
              }
              to {
                opacity: 1;
                transform: translateX(0);
              }
            }
          `}</style>
        </div>
      )}
    </>
  );
}
