"use client";

import { motion, AnimatePresence } from "framer-motion";

// Mock dish data for demo mode
const demoDishes = [
  { id: 1, name: "Spicy Ramen Bowl", emoji: "🍜" },
  { id: 2, name: "Cheesy Pizza", emoji: "🍕" },
  { id: 3, name: "Fresh Salad", emoji: "🥗" },
];

interface SearchResult {
  id: number;
  name: string;
  description: string;
  price: string;
}

interface SearchResultsProps {
  isDemoMode: boolean;
  isSearchFocused: boolean;
  showDemoCards: boolean;
  showLiveResults: boolean;
  filteredResults: SearchResult[];
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
            <motion.div
              key={dish.id}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{
                opacity: isSearchFocused ? 0.4 : 1,
                y: 0,
                scale: 1,
              }}
              transition={{
                delay: idx * 0.1,
                duration: 0.4,
                ease: "easeOut",
              }}
              className="rounded-2xl p-6 bg-[var(--howl-surface)] border border-[color-mix(in_srgb,var(--howl-primary)_15%,transparent)] text-center"
            >
              <div className="text-6xl mb-4">{dish.emoji}</div>
              <p className="text-[var(--howl-neutral)] font-medium">
                {dish.name}
              </p>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* ========== LIVE MODE: Search Results ========== */}
      {!isDemoMode && showLiveResults && (
        <motion.div
          key="search-results"
          className="space-y-4 overflow-hidden"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        >
          {/* {filteredResults.length > 0 ? (
            filteredResults.map((result, idx) => (
              <motion.div
                key={result.id}
                className="p-5 rounded-xl bg-[var(--howl-surface)] border border-[color-mix(in_srgb,var(--howl-primary)_10%,transparent)] hover:border-[var(--howl-secondary)] transition-all cursor-pointer group"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: idx * 0.05, duration: 0.25 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-[var(--howl-neutral)] group-hover:text-[var(--howl-secondary)] transition-colors">
                      {result.name}
                    </h4>
                    <p className="text-sm text-[var(--howl-neutral)] opacity-70 mt-1">
                      {result.description}
                    </p>
                  </div>
                  <span className="text-xl font-bold text-[var(--howl-secondary)] ml-4">
                    {result.price}
                  </span>
                </div>
              </motion.div>
            ))
          ) : ( */}
          <motion.p
            className="text-center text-[var(--howl-neutral)] opacity-60 py-12 text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            Search something like: "100 calories food"!
          </motion.p>
          {/* )} */}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
