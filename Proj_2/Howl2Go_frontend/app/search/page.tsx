"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import type { FoodItem } from "@/types/food";
import ItemCard from "@/components/ItemCard";

// API Response Types
interface ApiRecommendation {
  company?: string;
  restaurant?: string;
  item?: string;
  calories?: number;
  caloriesFromFat?: number | null;
  totalFat?: number | null;
  saturatedFat?: number | null;
  transFat?: number | null;
  cholesterol?: number | null;
  sodium?: number | null;
  carbs?: number | null;
  fiber?: number | null;
  sugars?: number | null;
  protein?: number | null;
  weightWatchersPoints?: number | null;
  price?: number;
}

interface ApiResponse {
  recommendations?: ApiRecommendation[];
  results?: ApiRecommendation[];
  [key: string]: unknown;
}

type ApiData = ApiResponse | ApiRecommendation[] | ApiRecommendation;

function SmartMenuSearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get("q") || "";

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [isLoading, setIsLoading] = useState(false);
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [sortMetric, setSortMetric] = useState<
    | "relevance"
    | "proteinPerDollar"
    | "caloriesWithinBudget"
    | "priceLow"
    | "priceHigh"
  >("relevance");
  const [budget, setBudget] = useState<number | "">("");
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedRestaurants, setSelectedRestaurants] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Auto-submit when page loads with initial query from main page
  useEffect(() => {
    if (initialQuery && !foodItems.length && !isLoading && !error) {
      // Trigger search automatically
      const submitSearch = async () => {
        setHasSearched(true);
        setIsLoading(true);
        setError(null);
        setFoodItems([]);

        try {
          const response = await fetch("/api/food/recommend", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ query: initialQuery }),
          });

          if (!response.ok) {
            if (response.status === 400) {
              setError(
                "Invalid search query. Try something like '100 calories food' or 'burger under 300 calories'"
              );
            } else if (response.status === 500) {
              setError("Server error. Please try again later.");
            } else {
              setError(`Error: ${response.status}. Please try again.`);
            }
            return;
          }

          const data = await response.json();
          await parseAndSetFoodItems(data);
        } catch (error) {
          console.error("Error fetching recommendations:", error);
          setError(
            "Unable to connect to server. Please check your connection and try again."
          );
        } finally {
          setIsLoading(false);
        }
      };

      submitSearch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Helper function to parse API response
  const parseAndSetFoodItems = async (data: ApiData) => {
    console.log("API Response:", data);

    let items: FoodItem[] = [];

    // Format 1: API returns recommendations array (ACTUAL FORMAT)
    if (
      !Array.isArray(data) &&
      "recommendations" in data &&
      Array.isArray(data.recommendations)
    ) {
      items = data.recommendations.map((item) => ({
        restaurant: item.company || "Unknown", // Map company -> restaurant
        item: item.item || "Unknown Item",
        calories: item.calories || 0,
        caloriesFromFat: item.caloriesFromFat || null,
        totalFat: item.totalFat || null,
        saturatedFat: item.saturatedFat || null,
        transFat: item.transFat || null,
        cholesterol: item.cholesterol || null,
        sodium: item.sodium || null,
        carbs: item.carbs || null,
        fiber: item.fiber || null,
        sugars: item.sugars || null,
        protein: item.protein || null,
        weightWatchersPoints: item.weightWatchersPoints || null,
        price: item.price,
      }));
    } else if (Array.isArray(data)) {
      // Format 2: Array of items
      items = data.map((item) => ({
        restaurant: item.company || item.restaurant || "Unknown",
        item: item.item || "Unknown Item",
        calories: item.calories || 0,
        caloriesFromFat: item.caloriesFromFat || null,
        totalFat: item.totalFat || null,
        saturatedFat: item.saturatedFat || null,
        transFat: item.transFat || null,
        cholesterol: item.cholesterol || null,
        sodium: item.sodium || null,
        carbs: item.carbs || null,
        fiber: item.fiber || null,
        sugars: item.sugars || null,
        protein: item.protein || null,
        weightWatchersPoints: item.weightWatchersPoints || null,
        price: item.price,
      }));
    } else if (
      !Array.isArray(data) &&
      "results" in data &&
      Array.isArray(data.results)
    ) {
      // Format 3: Wrapped in results
      items = data.results.map((item) => ({
        restaurant: item.company || item.restaurant || "Unknown",
        item: item.item || "Unknown Item",
        calories: item.calories || 0,
        caloriesFromFat: item.caloriesFromFat || null,
        totalFat: item.totalFat || null,
        saturatedFat: item.saturatedFat || null,
        transFat: item.transFat || null,
        cholesterol: item.cholesterol || null,
        sodium: item.sodium || null,
        carbs: item.carbs || null,
        fiber: item.fiber || null,
        sugars: item.sugars || null,
        protein: item.protein || null,
        weightWatchersPoints: item.weightWatchersPoints || null,
        price: item.price,
      }));
    } else if (!Array.isArray(data) && "restaurant" in data && "item" in data) {
      // Format 4: Single item
      items = [data as FoodItem];
    } else if (
      typeof data === "object" &&
      data !== null &&
      !Array.isArray(data)
    ) {
      // Format 5: Object with restaurant names as keys
      const extractValue = (val: unknown): number | null => {
        if (typeof val === "number") return val;
        if (typeof val === "object" && val !== null) {
          const obj = val as { max?: number; value?: number; min?: number };
          return obj.max || obj.value || obj.min || null;
        }
        return null;
      };

      items = Object.entries(data).map(
        ([restaurant, itemData]: [string, ApiRecommendation]) => {
          return {
            restaurant,
            item: itemData.item || "Unknown Item",
            calories: extractValue(itemData.calories) || 0,
            caloriesFromFat: extractValue(itemData.caloriesFromFat),
            totalFat: extractValue(itemData.totalFat),
            saturatedFat: extractValue(itemData.saturatedFat),
            transFat: extractValue(itemData.transFat),
            cholesterol: extractValue(itemData.cholesterol),
            sodium: extractValue(itemData.sodium),
            carbs: extractValue(itemData.carbs),
            fiber: extractValue(itemData.fiber),
            sugars: extractValue(itemData.sugars),
            protein: extractValue(itemData.protein),
            weightWatchersPoints: extractValue(itemData.weightWatchersPoints),
            price: itemData.price,
          };
        }
      );
    } else {
      setError("Unexpected response format from server.");
      return;
    }

    if (items.length === 0) {
      setError("No results found. Try a different search.");
      return;
    }

    setFoodItems(items);
    console.log("Parsed food items:", items);
  };

  // Handle search form submission
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setHasSearched(true);

    // ✅ Update URL only when pressing Enter / submitting
    const params = new URLSearchParams();
    params.set("q", searchQuery);
    router.replace(`/search?${params.toString()}`, { scroll: false });

    setIsLoading(true);
    setError(null);
    setFoodItems([]);

    try {
      const response = await fetch("/api/food/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery }),
      });

      if (!response.ok) {
        if (response.status === 400) {
          setError(
            "Invalid search query. Try something like '100 calories food' or 'burger under 300 calories'"
          );
        } else if (response.status === 500) {
          setError("Server error. Please try again later.");
        } else {
          setError(`Error: ${response.status}. Please try again.`);
        }
        return;
      }

      const data = await response.json();
      await parseAndSetFoodItems(data);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      setError(
        "Unable to connect to server. Please check your connection and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Helper: estimate price when API doesn't provide one (same heuristic as CartContext)
  function estimatePrice(calories: number | undefined | null): number {
    const c = calories || 0;
    const basePrice = c * 0.01;
    return Math.min(Math.max(basePrice, 2.0), 15.0);
  }

  // Compute displayed items based on selected metric and budget
  const displayedItems = (() => {
    if (!foodItems || foodItems.length === 0) return foodItems;

    // Clone to avoid mutating state
    let items = [...foodItems];

    // Apply restaurant filter (multi-select chips)
    if (selectedRestaurants && selectedRestaurants.length > 0) {
      items = items.filter((it) => selectedRestaurants.includes(it.restaurant));
    }

    if (sortMetric === "proteinPerDollar") {
      return items
        .map((it) => {
          const price =
            typeof it.price === "number" && it.price > 0
              ? it.price
              : estimatePrice(it.calories);
          const protein = it.protein ?? 0;
          const metric = price > 0 ? protein / price : 0;
          return { item: it, metric };
        })
        .sort((a, b) => b.metric - a.metric)
        .map((x) => x.item);
    }

    if (sortMetric === "priceLow") {
      return items.sort((a, b) => {
        const pa =
          typeof a.price === "number" && a.price > 0
            ? a.price
            : estimatePrice(a.calories);
        const pb =
          typeof b.price === "number" && b.price > 0
            ? b.price
            : estimatePrice(b.calories);
        return pa - pb;
      });
    }

    if (sortMetric === "priceHigh") {
      return items.sort((a, b) => {
        const pa =
          typeof a.price === "number" && a.price > 0
            ? a.price
            : estimatePrice(a.calories);
        const pb =
          typeof b.price === "number" && b.price > 0
            ? b.price
            : estimatePrice(b.calories);
        return pb - pa;
      });
    }

    if (sortMetric === "caloriesWithinBudget") {
      // If no budget specified, fallback to relevance
      if (!budget || Number(budget) <= 0) return items;

      return items
        .filter((it) => {
          const price =
            typeof it.price === "number" && it.price > 0
              ? it.price
              : estimatePrice(it.calories);
          return price <= Number(budget);
        })
        .sort((a, b) => (b.calories || 0) - (a.calories || 0));
    }

    // Default: return as-is (relevance from backend)
    return items;
  })();

  const handleSearchChange = (value: string) => {
    // Just update the state while typing
    setSearchQuery(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Navigation Bar */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.8 }}
        className="sticky top-0 z-40 border-b backdrop-blur-sm"
        style={{
          borderColor:
            "color-mix(in srgb, var(--howl-neutral) 10%, transparent)",
          backgroundColor: "color-mix(in srgb, var(--bg) 95%, transparent)",
        }}
      >
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="p-2 transition-colors rounded-lg hover:bg-[var(--bg-hover)] flex items-center gap-2 text-[var(--text)]"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="hidden sm:inline text-sm font-medium">Back</span>
            </Link>
            <Link href="/">
              <Image
                src="/Howl2go_orange_logo_transparent.png"
                alt="Howl2Go Logo"
                width={50}
                height={16}
                priority
              />
            </Link>
          </div>
          <Link
            href="/dashboard"
            className="px-4 py-2 font-semibold rounded-full transition-all hover:scale-105 bg-[var(--orange)] text-[var(--text)] text-sm"
          >
            Dashboard
          </Link>
        </nav>
      </motion.header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Hero Search Bar - Shared Element */}
        <motion.div
          layoutId="hero-search-bar"
          className="mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="w-full max-w-3xl mx-auto">
            <form
              onSubmit={handleSearch}
              className="outline-none focus:outline-none"
            >
              <motion.div
                className="w-full px-6 py-4 rounded-2xl border-2 flex items-center bg-[var(--bg-card)] focus-within:outline-none"
                style={{
                  borderColor: "var(--orange)",
                  boxShadow: "0 8px 24px rgba(198, 107, 77, 0.25)",
                }}
              >
                <input
                  type="text"
                  placeholder="Search for any craving..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  autoFocus
                  aria-label="Search for food"
                  className="flex-1 bg-transparent outline-none focus:outline-none focus:ring-0 focus-visible:outline-none border-0 text-[var(--text)] placeholder:text-[var(--text-muted)] text-lg sm:text-xl"
                />
                <div className="flex items-center gap-2">
                  <AnimatePresence>
                    {searchQuery.trim().length > 0 && (
                      <motion.span
                        initial={{ opacity: 0, scale: 0.8, x: -10 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.8, x: -10 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="text-sm font-medium text-[var(--text-subtle)] flex items-center gap-1"
                      >
                        <span className="hidden sm:inline">Press</span>
                        <kbd className="px-2 py-0.5 text-xs bg-[var(--bg-hover)] border border-[var(--border)] rounded">
                          ↵
                        </kbd>
                      </motion.span>
                    )}
                  </AnimatePresence>
                  <button
                    type="submit"
                    className="bg-transparent border-0 p-0 cursor-pointer outline-none focus:outline-none focus-visible:outline-none"
                  >
                    <Search className="h-6 w-6 text-[var(--orange)] ml-2" />
                  </button>
                </div>
              </motion.div>
            </form>
          </div>
        </motion.div>

        {/* Results Section */}
        {/* Controls: advanced filtering / metrics */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-[var(--text-subtle)]">
              <span className="font-medium text-[var(--text)]">Sort:</span>
              <select
                value={sortMetric}
                onChange={(e) => setSortMetric(e.target.value as any)}
                className="rounded-md border px-3 py-2 bg-[var(--bg-card)] text-[var(--text)]"
              >
                <option value="relevance">Relevance (default)</option>
                <option value="priceLow">Price: low → high</option>
                <option value="priceHigh">Price: high → low</option>
                <option value="proteinPerDollar">
                  Highest protein-per-dollar
                </option>
                <option value="caloriesWithinBudget">
                  Most calories within budget
                </option>
              </select>
            </label>

            {/* Restaurant / Brand filter chips */}
            <div className="flex flex-wrap gap-2">
              {Array.from(new Set(foodItems.map((f) => f.restaurant)))
                .sort()
                .map((restaurant) => {
                  const selected = selectedRestaurants.includes(restaurant);
                  return (
                    <button
                      key={restaurant}
                      onClick={() => {
                        setSelectedRestaurants((prev) =>
                          prev.includes(restaurant)
                            ? prev.filter((r) => r !== restaurant)
                            : [...prev, restaurant]
                        );
                      }}
                      className={`text-sm px-3 py-1.5 rounded-full border transition-all ${
                        selected
                          ? "bg-[var(--orange)] text-[var(--text)]"
                          : "bg-[var(--bg-card)] text-[var(--text-subtle)]"
                      }`}
                    >
                      {restaurant}
                    </button>
                  );
                })}
              {foodItems.length > 0 && (
                <button
                  onClick={() => setSelectedRestaurants([])}
                  className="text-sm px-3 py-1.5 rounded-full border bg-[var(--bg-card)] text-[var(--text-subtle)]"
                >
                  Clear
                </button>
              )}
            </div>

            {sortMetric === "caloriesWithinBudget" && (
              <label className="flex items-center gap-2 text-sm text-[var(--text-subtle)]">
                <span className="font-medium text-[var(--text)]">Budget:</span>
                <input
                  type="number"
                  min={0}
                  value={budget as any}
                  onChange={(e) =>
                    setBudget(
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                  placeholder="Max $"
                  className="w-28 rounded-md border px-3 py-2 bg-[var(--bg-card)] text-[var(--text)]"
                />
              </label>
            )}

            <div className="ml-auto text-sm text-[var(--text-subtle)]">
              {displayedItems.length}
              {displayedItems.length !== foodItems.length && (
                <span className="text-[var(--text-subtle)]">
                  {" "}
                  of {foodItems.length}
                </span>
              )}{" "}
              results
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="bg-[var(--bg-card)] rounded-xl p-6 animate-pulse"
                >
                  <div className="h-16 bg-[var(--bg-hover)] rounded mb-4"></div>
                  <div className="h-4 bg-[var(--bg-hover)] rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-[var(--bg-hover)] rounded w-full"></div>
                </div>
              ))}
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center py-20"
            >
              <div className="text-6xl mb-4">⚠️</div>
              <h3 className="text-2xl font-bold text-[var(--text)] mb-2">
                Oops! Something went wrong
              </h3>
              <p className="text-[var(--text-subtle)] mb-6 max-w-md mx-auto">
                {error}
              </p>
              <button
                onClick={() => setError(null)}
                className="px-6 py-3 rounded-full font-semibold bg-[var(--orange)] text-[var(--text)] hover:bg-[var(--cream)] hover:text-[var(--bg)] transition-colors"
              >
                Try Again
              </button>
            </motion.div>
          ) : displayedItems.length > 0 ? (
            <div
              key="results"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {displayedItems.map((item, idx) => (
                <div
                  key={`${item.restaurant}-${item.item}-${idx}`}
                  className="opacity-0 animate-[fadeInUp_0.5s_ease-out_forwards]"
                  style={{
                    animationDelay: `${idx * 100}ms`,
                  }}
                >
                  {(() => {
                    // Compute metric for display
                    const price =
                      typeof item.price === "number" && item.price > 0
                        ? item.price
                        : estimatePrice(item.calories);
                    if (sortMetric === "proteinPerDollar") {
                      const protein = item.protein ?? 0;
                      const metric =
                        price > 0 ? +(protein / price).toFixed(2) : 0;
                      return (
                        <ItemCard
                          {...item}
                          disableAnimation={true}
                          variant="default"
                          computedMetric={metric}
                          metricLabel="g/$"
                        />
                      );
                    }

                    if (sortMetric === "caloriesWithinBudget") {
                      return (
                        <ItemCard
                          {...item}
                          disableAnimation={true}
                          variant="default"
                        />
                      );
                    }

                    return (
                      <ItemCard
                        {...item}
                        disableAnimation={true}
                        variant="default"
                      />
                    );
                  })()}
                </div>
              ))}
              <style jsx>{`
                @keyframes fadeInUp {
                  from {
                    opacity: 0;
                    transform: translateY(20px);
                  }
                  to {
                    opacity: 1;
                    transform: translateY(0);
                  }
                }
              `}</style>
            </div>
          ) : hasSearched ? (
            <motion.div
              key="no-results"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center py-20"
            >
              <div className="text-6xl mb-4">😕</div>
              <h3 className="text-2xl font-bold text-[var(--text)] mb-2">
                No results found
              </h3>
              <p className="text-[var(--text-subtle)] mb-4">
                We couldn't find any items matching your search. Try different
                terms or broaden your filters.
              </p>
              <button
                onClick={() => {
                  setHasSearched(false);
                  setSearchQuery("");
                  setFoodItems([]);
                  router.push("/search");
                }}
                className="px-6 py-3 rounded-full font-semibold bg-[var(--orange)] text-[var(--text)] hover:bg-[var(--cream)] hover:text-[var(--bg)] transition-colors"
              >
                Clear Search
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-20"
            >
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold text-[var(--text)] mb-2">
                Start Your Search
              </h3>
              <p className="text-[var(--text-subtle)]">
                Try searching for something like &quot;100 calories food&quot;
                or &quot;burger under 300 calories&quot;
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default function SmartMenuSearch() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
          <div className="text-[var(--text)]">Loading...</div>
        </div>
      }
    >
      <SmartMenuSearchContent />
    </Suspense>
  );
}
