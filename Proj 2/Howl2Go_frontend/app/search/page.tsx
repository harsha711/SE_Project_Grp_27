"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ArrowLeft } from "lucide-react";
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

function SmartMenuSearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get("q") || "";

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [isLoading, setIsLoading] = useState(false);
  const [apiData, setApiData] = useState(null);

  // Handle search form submission
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!searchQuery.trim()) return;

    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:4000/api/food/recommend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: searchQuery }),
      });

      const data = await response.json();
      console.log("API Response:", data);
      setApiData(data);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    } finally {
      setIsLoading(false);
    }
  };

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
                <button type="submit" className="bg-transparent border-0 p-0 cursor-pointer">
                  <Search className="h-6 w-6 text-[var(--orange)] ml-2" />
                </button>
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
          ) : apiData ? (
            <motion.div
              key="api-data"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-[var(--bg-card)] border border-[var(--orange)] rounded-xl p-6"
            >
              <h2 className="text-2xl font-bold text-[var(--orange)] mb-4">API Response:</h2>
              <pre className="text-[var(--text)] whitespace-pre-wrap overflow-auto max-h-[600px] bg-[var(--bg-hover)] p-4 rounded-lg">
                {JSON.stringify(apiData, null, 2)}
              </pre>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {mockAllDishes.map((dish, idx) => (
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
