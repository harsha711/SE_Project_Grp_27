"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, X, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// Mock data for search results
const mockAllDishes = [
  {
    id: 1,
    name: "Spicy Korean Tacos",
    description: "Kimchi, sriracha mayo, cilantro",
    price: "$12.99",
    category: "Tacos",
    emoji: "🌮",
  },
  {
    id: 2,
    name: "Margherita Pizza",
    description: "Fresh mozzarella, basil, tomato",
    price: "$14.99",
    category: "Pizza",
    emoji: "🍕",
  },
  {
    id: 3,
    name: "Truffle Mac & Cheese",
    description: "Three cheese blend, truffle oil",
    price: "$16.99",
    category: "Pasta",
    emoji: "🧀",
  },
  {
    id: 4,
    name: "Pad Thai Noodles",
    description: "Rice noodles, peanuts, lime",
    price: "$13.99",
    category: "Noodles",
    emoji: "🍜",
  },
  {
    id: 5,
    name: "Caesar Salad",
    description: "Romaine, parmesan, croutons",
    price: "$10.99",
    category: "Salads",
    emoji: "🥗",
  },
  {
    id: 6,
    name: "Chicken Wings",
    description: "Buffalo sauce, blue cheese dip",
    price: "$11.99",
    category: "Appetizers",
    emoji: "🍗",
  },
  {
    id: 7,
    name: "Beef Burger",
    description: "Wagyu beef, aged cheddar, aioli",
    price: "$15.99",
    category: "Burgers",
    emoji: "🍔",
  },
  {
    id: 8,
    name: "Sushi Platter",
    description: "Assorted nigiri and maki rolls",
    price: "$24.99",
    category: "Sushi",
    emoji: "🍣",
  },
];

const categories = [
  "All",
  "Tacos",
  "Pizza",
  "Pasta",
  "Noodles",
  "Salads",
  "Burgers",
  "Sushi",
  "Appetizers",
];

function SmartMenuSearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get("q") || "";

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading state
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory]);

  // Filter results based on search query and category
  const filteredResults = mockAllDishes.filter((dish) => {
    const matchesSearch =
      searchQuery === "" ||
      dish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dish.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || dish.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    // Update URL with new query
    const params = new URLSearchParams();
    if (value) params.set("q", value);
    router.replace(`/search?${params.toString()}`, { scroll: false });
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
          borderColor: "color-mix(in srgb, var(--howl-neutral) 10%, transparent)",
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
              <Search className="h-6 w-6 text-[var(--orange)] ml-2" />
            </motion.div>
          </div>
        </motion.div>

        {/* Filter Chips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.85 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
            <Filter className="h-5 w-5 text-[var(--text-subtle)] flex-shrink-0" />
            {categories.map((category) => (
              <motion.button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-all ${
                  selectedCategory === category
                    ? "bg-[var(--orange)] text-[var(--text)]"
                    : "bg-[var(--bg-card)] text-[var(--text-subtle)] hover:bg-[var(--bg-hover)]"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {category}
              </motion.button>
            ))}
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
          ) : filteredResults.length > 0 ? (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredResults.map((dish, idx) => (
                <motion.div
                  key={dish.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 + idx * 0.05, duration: 0.25 }}
                  className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-6 hover:border-[var(--orange)] transition-all cursor-pointer group"
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-5xl">{dish.emoji}</div>
                    <span className="text-xl font-bold text-[var(--cream)]">
                      {dish.price}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-[var(--text)] mb-2 group-hover:text-[var(--orange)] transition-colors">
                    {dish.name}
                  </h3>
                  <p className="text-sm text-[var(--text-subtle)] mb-4">
                    {dish.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[var(--text-muted)] bg-[var(--bg-hover)] px-3 py-1 rounded-full">
                      {dish.category}
                    </span>
                    <motion.button
                      className="px-4 py-2 rounded-full font-semibold text-sm bg-[var(--orange)] text-[var(--text)] hover:bg-[var(--cream)] hover:text-[var(--bg)] transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Add
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="no-results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center py-20"
            >
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold text-[var(--text)] mb-2">
                No dishes found
              </h3>
              <p className="text-[var(--text-subtle)] mb-6">
                Try adjusting your search or filters
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                }}
                className="px-6 py-3 rounded-full font-semibold bg-[var(--orange)] text-[var(--text)] hover:bg-[var(--cream)] hover:text-[var(--bg)] transition-colors"
              >
                Clear filters
              </button>
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
