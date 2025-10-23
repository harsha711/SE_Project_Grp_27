"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import type { FoodItem } from "@/types/food";
import ItemCard from "@/components/ItemCard";

function SmartMenuSearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get("q") || "";

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [isLoading, setIsLoading] = useState(false);
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Auto-submit when page loads with initial query from main page
  useEffect(() => {
    if (initialQuery && !foodItems.length && !isLoading && !error) {
      // Trigger search automatically
      const submitSearch = async () => {
        setIsLoading(true);
        setError(null);
        setFoodItems([]);

        try {
          const response = await fetch(
            "http://localhost:4000/api/food/recommend",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ query: initialQuery }),
            }
          );

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
  const parseAndSetFoodItems = async (data: any) => {
    console.log("API Response:", data);

    let items: FoodItem[] = [];

    // Format 1: API returns recommendations array (ACTUAL FORMAT)
    if (data.recommendations && Array.isArray(data.recommendations)) {
      items = data.recommendations.map((item: any) => ({
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
      }));
    } else if (Array.isArray(data)) {
      // Format 2: Array of items
      items = data.map((item: any) => ({
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
      }));
    } else if (data.results && Array.isArray(data.results)) {
      // Format 3: Wrapped in results
      items = data.results.map((item: any) => ({
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
      }));
    } else if (data.restaurant && data.item) {
      // Format 4: Single item
      items = [data];
    } else if (typeof data === "object" && data !== null) {
      // Format 5: Object with restaurant names as keys
      const extractValue = (val: any): number | null => {
        if (typeof val === "number") return val;
        if (typeof val === "object" && val !== null) {
          return val.max || val.value || val.min || null;
        }
        return null;
      };

      items = Object.entries(data).map(
        ([restaurant, itemData]: [string, any]) => ({
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
        })
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

    // ✅ Update URL only when pressing Enter / submitting
    const params = new URLSearchParams();
    params.set("q", searchQuery);
    router.replace(`/search?${params.toString()}`, { scroll: false });

    setIsLoading(true);
    setError(null);
    setFoodItems([]);

    try {
      const response = await fetch("http://localhost:4000/api/food/recommend", {
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
            <form onSubmit={handleSearch}>
              <motion.div
                className="w-full px-6 py-4 rounded-2xl border-2 flex items-center bg-[var(--bg-card)]"
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
                  className="flex-1 bg-transparent outline-none focus:outline-none focus:ring-0 border-0 text-[var(--text)] placeholder:text-[var(--text-muted)] text-lg sm:text-xl"
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
                    className="bg-transparent border-0 p-0 cursor-pointer"
                  >
                    <Search className="h-6 w-6 text-[var(--orange)] ml-2" />
                  </button>
                </div>
              </motion.div>
            </form>
          </div>
        </motion.div>

        {/* Results Section */}
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
          ) : foodItems.length > 0 ? (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {foodItems.map((item, idx) => (
                <ItemCard
                  key={`${item.restaurant}-${item.item}-${idx}`}
                  restaurant={item.restaurant}
                  item={item.item}
                  calories={item.calories}
                  index={idx}
                />
              ))}
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
