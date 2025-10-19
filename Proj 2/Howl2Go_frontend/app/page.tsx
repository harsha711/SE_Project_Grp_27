"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, Search, Filter, ChevronLeft, ChevronRight } from "lucide-react";

// Mock dish data for demo mode
const demoDishes = [
  { id: 1, name: "Spicy Ramen Bowl", emoji: "🍜" },
  { id: 2, name: "Cheesy Pizza", emoji: "🍕" },
  { id: 3, name: "Fresh Salad", emoji: "🥗" },
];

// Mock search results for live mode
const mockSearchResults = [
  {
    id: 1,
    name: "Spicy Korean Tacos",
    description: "Kimchi, sriracha mayo, cilantro",
    price: "$12.99",
  },
  {
    id: 2,
    name: "Margherita Pizza",
    description: "Fresh mozzarella, basil, tomato",
    price: "$14.99",
  },
  {
    id: 3,
    name: "Truffle Mac & Cheese",
    description: "Three cheese blend, truffle oil",
    price: "$16.99",
  },
  {
    id: 4,
    name: "Pad Thai Noodles",
    description: "Rice noodles, peanuts, lime",
    price: "$13.99",
  },
];

export default function Home() {
  const carouselRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (carouselRef.current) {
      const scrollAmount = 300;
      carouselRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="min-h-screen bg-[var(--howl-bg)]">
      {/* Header / Navigation */}
      <header
        className="absolute top-0 left-0 right-0 z-50 border-b backdrop-blur-sm"
        style={{
          borderColor:
            "color-mix(in srgb, var(--howl-neutral) 10%, transparent)",
          backgroundColor:
            "color-mix(in srgb, var(--howl-bg) 95%, transparent)",
        }}
      >
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          {/* Left Side */}
          <div className="flex items-center gap-4">
            <button
              className="p-2 transition-colors rounded-lg hover:bg-[color-mix(in_srgb,var(--howl-primary)_10%,transparent)]"
              aria-label="Menu"
            >
              <Menu className="h-6 w-6 text-[var(--howl-neutral)]" />
            </button>
            <Image
              src="/next.svg"
              alt="Howl2Go Logo"
              width={120}
              height={30}
              priority
              className="invert"
            />
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-6">
            <Link
              href="/about"
              className="hidden sm:inline-block font-medium transition-colors hover:opacity-70 text-[var(--howl-neutral)]"
            >
              About
            </Link>
            <Link
              href="/login"
              className="hidden sm:inline-block font-medium transition-colors hover:opacity-70 text-[var(--howl-neutral)]"
            >
              Sign In
            </Link>
            <Link
              href="/dashboard"
              className="px-5 py-2 font-semibold rounded-full transition-all hover:scale-105 hover:shadow-md bg-[var(--howl-secondary)] text-[var(--howl-bg)]"
            >
              Dashboard
            </Link>
          </div>
        </nav>
      </header>

      {/* Integrated Full-Screen Hero Section */}
      <div className="pt-15 min-h-screen">
        <IntegratedHeroSection />
      </div>

      {/* Frequently Bought Section */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:py-20">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold mb-3 text-[var(--howl-neutral)]">
              Frequently Bought
            </h2>
            <div className="h-1 w-20 bg-[var(--howl-primary)] rounded-full"></div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => scroll("left")}
              className="p-2 rounded-full border-2 transition-all hover:scale-110 border-[var(--howl-primary)] text-[var(--howl-primary)] hover:bg-[color-mix(in_srgb,var(--howl-primary)_10%,transparent)]"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="p-2 rounded-full border-2 transition-all hover:scale-110 border-[var(--howl-primary)] text-[var(--howl-primary)] hover:bg-[color-mix(in_srgb,var(--howl-primary)_10%,transparent)]"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div
          ref={carouselRef}
          className="flex gap-8 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((item) => (
            <div key={item} className="flex-none">
              <DishCard index={item} />
            </div>
          ))}
        </div>
      </section>

      {/* Footer spacing */}
      <div className="h-8"></div>
    </div>
  );
}

// Integrated Hero Section - "Show, Don't Tell"
function IntegratedHeroSection() {
  // ========== STATE MANAGEMENT ==========
  // Core state for switching between Demonstration Mode and Live Mode
  const [isDemoMode, setIsDemoMode] = useState(true);

  // Demo mode states
  const [demoStep, setDemoStep] = useState(0);
  const [typedText, setTypedText] = useState("");
  const [showDemoCards, setShowDemoCards] = useState(false);

  // Live mode states
  const [inputValue, setInputValue] = useState("");
  const [showLiveResults, setShowLiveResults] = useState(false);

  const cravings = ["spicy ramen", "cheesy pizza", "healthy salad"];
  const currentCraving = cravings[demoStep % cravings.length];

  // ========== DEMONSTRATION MODE ANIMATION ==========
  // Typewriter effect that cycles through different food cravings
  useEffect(() => {
    if (!isDemoMode) return; // Stop animation when in Live Mode

    setShowDemoCards(false);
    setTypedText("");
    let charIndex = 0;

    const typingInterval = setInterval(() => {
      if (charIndex <= currentCraving.length) {
        setTypedText(currentCraving.slice(0, charIndex));
        charIndex++;
      } else {
        clearInterval(typingInterval);
        // Show demo cards after typing completes
        setTimeout(() => setShowDemoCards(true), 300);
        // Move to next craving after 3.5 seconds
        setTimeout(() => {
          setDemoStep((prev) => prev + 1);
        }, 3500);
      }
    }, 100);

    return () => clearInterval(typingInterval);
  }, [demoStep, currentCraving, isDemoMode]);

  // ========== MODE TRANSITION HANDLERS ==========
  // Switches from Demo Mode to Live Mode when user focuses on search
  const handleSearchFocus = () => {
    setIsDemoMode(false);
    setShowLiveResults(true);
  };

  // Returns to Demo Mode if user abandons search (only if search is empty)
  const handleSearchBlur = () => {
    if (inputValue === "") {
      setIsDemoMode(true);
      setShowLiveResults(false);
    }
  };

  // Filter search results based on user query
  const filteredResults = mockSearchResults.filter((result) =>
    result.name.toLowerCase().includes(inputValue.toLowerCase())
  );

  // ========== ANIMATION VARIANTS ==========
  const headlineContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const wordVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  const words = ["Crave", "it.", "Find", "it.", "Instantly."];

  return (
    <section className="relative flex items-center justify-center px-4 sm:px-8 py-16 pb-8 bg-[var(--howl-bg)]">
      <div className="w-full max-w-4xl mx-auto">
        {/* ========== ANIMATED HEADLINE ========== */}
        <motion.h1
          className="text-center text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-12 text-[var(--howl-neutral)]"
          variants={headlineContainerVariants}
          initial="hidden"
          animate="visible"
        >
          {words.map((word, index) => (
            <motion.span
              key={index}
              variants={wordVariants}
              className="inline-block mr-3"
            >
              {word === "Instantly." ? (
                <span className="relative">
                  {word}
                  <motion.svg
                    className="absolute -bottom-2 left-0 w-full"
                    height="8"
                    viewBox="0 0 200 8"
                    fill="none"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 1, ease: "easeInOut" }}
                  >
                    <motion.path
                      d="M2 5C60 2 140 2 198 5"
                      stroke="var(--howl-primary)"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </motion.svg>
                </span>
              ) : (
                word
              )}
            </motion.span>
          ))}
        </motion.h1>

        {/* ========== INTERACTIVE SEARCH COMPONENT ========== */}
        <div className="w-full">
          {/* Search Bar */}
          <div className="mb-8">
            <motion.div
              className="w-full px-6 py-5 text-xl sm:text-2xl rounded-full border-2 flex items-center min-h-[70px] transition-all duration-300 relative"
              style={{
                backgroundColor: isDemoMode
                  ? "var(--howl-surface-elevated)"
                  : "var(--howl-surface)",
              }}
              animate={{
                borderColor: isDemoMode
                  ? "var(--howl-surface-elevated)"
                  : "var(--howl-secondary)",
                boxShadow: isDemoMode
                  ? "none"
                  : "0 0 0 3px color-mix(in srgb, var(--howl-secondary) 20%, transparent)",
              }}
            >
              {/* Always-present search input - focusable in both demo and live modes */}
              <input
                type="text"
                placeholder={isDemoMode ? "" : "Search for any craving..."}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                // ENTER LIVE MODE: Triggered when user directly focuses on the search input
                // This provides precise control - only clicking/tabbing into the input activates Live Mode
                onFocus={handleSearchFocus}
                // EXIT LIVE MODE (CONDITIONAL): Triggered when user clicks/tabs away from input
                // Returns to Demo Mode ONLY if the input is empty. If user has typed text,
                // component stays in Live Mode to preserve their search and prevent jarring animation restart
                onBlur={handleSearchBlur}
                autoFocus={!isDemoMode}
                className="flex-1 bg-transparent outline-none text-[var(--howl-neutral)] placeholder:text-[color-mix(in_srgb,var(--howl-neutral)_50%,transparent)] relative z-10"
                style={{
                  color: isDemoMode ? "transparent" : "var(--howl-neutral)",
                  caretColor: isDemoMode
                    ? "transparent"
                    : "var(--howl-neutral)",
                }}
              />

              {/* Demo Mode: Typewriter text overlay (positioned absolutely, doesn't block input) */}
              {isDemoMode && (
                <div className="absolute inset-0 flex items-center px-6 pointer-events-none select-none">
                  <span className="text-[var(--howl-neutral)]">
                    {typedText}
                  </span>
                  <span className="w-0.5 h-7 animate-pulse bg-[var(--howl-primary)] ml-1"></span>
                </div>
              )}

              {/* Search icon in Live Mode */}
              {!isDemoMode && (
                <Search className="h-6 w-6 text-[var(--howl-secondary)] ml-2 relative z-10" />
              )}
            </motion.div>
          </div>

          {/* ========== RESULTS CONTAINER ========== */}
          {/* DYNAMIC HEIGHT ANIMATION: Results containers use height animations to smoothly push
              content below (like "Frequently Bought" section) when appearing. This eliminates
              the awkward empty space during demo mode while maintaining smooth transitions. */}
          <AnimatePresence mode="wait">
            {/* ========== DEMO MODE: Animated Dish Preview Cards ========== */}
            {isDemoMode && showDemoCards && (
              <motion.div
                key="demo-cards"
                className="grid grid-cols-1 sm:grid-cols-3 gap-6 overflow-hidden"
                // HEIGHT ANIMATION: Smoothly expands from 0 to natural height, pushing content below
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
              >
                {demoDishes.map((dish) => (
                  <div
                    key={dish.id}
                    className="rounded-2xl p-6 bg-[var(--howl-surface)] border border-[color-mix(in_srgb,var(--howl-primary)_15%,transparent)] text-center"
                  >
                    <div className="text-6xl mb-4">{dish.emoji}</div>
                    <p className="text-[var(--howl-neutral)] font-medium">
                      {dish.name}
                    </p>
                  </div>
                ))}
              </motion.div>
            )}

            {/* ========== LIVE MODE: Search Results ========== */}
            {!isDemoMode && showLiveResults && (
              <motion.div
                key="search-results"
                className="space-y-4 overflow-hidden"
                // HEIGHT ANIMATION: Smoothly expands from 0 to natural height, pushing content below
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
              >
                {filteredResults.length > 0 ? (
                  filteredResults.map((result, idx) => (
                    <motion.div
                      key={result.id}
                      className="p-5 rounded-xl bg-[var(--howl-surface)] border border-[color-mix(in_srgb,var(--howl-primary)_10%,transparent)] hover:border-[var(--howl-secondary)] transition-all cursor-pointer group"
                      // PERFORMANCE: Simple opacity fade-in with slight delay for stagger effect
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
                ) : (
                  <motion.p
                    className="text-center text-[var(--howl-neutral)] opacity-60 py-12 text-lg"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    No dishes found. Try another search!
                  </motion.p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

// Enhanced Dish Card Component with Premium Design
function DishCard({ index }: { index: number }) {
  const dishes = [
    {
      name: "Spicy Korean Tacos",
      description: "Kimchi, sriracha mayo, cilantro",
    },
    {
      name: "Truffle Mac & Cheese",
      description: "Three cheese blend, truffle oil",
    },
    {
      name: "Margherita Pizza",
      description: "Fresh mozzarella, basil, tomato",
    },
    { name: "Pad Thai Noodles", description: "Rice noodles, peanuts, lime" },
    { name: "Caesar Salad", description: "Romaine, parmesan, croutons" },
    { name: "Chicken Wings", description: "Buffalo sauce, blue cheese dip" },
    { name: "Beef Burger", description: "Wagyu beef, aged cheddar, aioli" },
    { name: "Sushi Platter", description: "Assorted nigiri and maki rolls" },
    { name: "Falafel Wrap", description: "Chickpea fritters, tahini sauce" },
    {
      name: "Chocolate Lava Cake",
      description: "Molten center, vanilla ice cream",
    },
  ];

  const dish = dishes[(index - 1) % dishes.length];

  return (
    <motion.div
      className="group rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border w-full sm:w-[280px] bg-[var(--howl-surface-elevated)] border-[color-mix(in_srgb,var(--howl-primary)_10%,transparent)] hover:border-[var(--howl-secondary)]"
      whileHover={{
        y: -8,
        transition: { duration: 0.3, ease: "easeOut" },
      }}
    >
      <div className="w-full h-48 relative bg-[var(--howl-secondary)] overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-30 group-hover:scale-110 transition-transform duration-500">
          {index % 3 === 0 ? "🍕" : index % 3 === 1 ? "🍜" : "🌮"}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--howl-bg)]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      </div>
      <div className="p-5">
        <h3 className="text-xl font-semibold mb-2 group-hover:text-[var(--howl-primary)] transition-colors duration-300 text-[var(--howl-neutral)]">
          {dish.name}
        </h3>
        <p className="text-sm mb-4 text-[var(--howl-neutral)] opacity-80 leading-relaxed">
          {dish.description}
        </p>
        <div className="flex items-center justify-between pt-3 border-t border-[color-mix(in_srgb,var(--howl-neutral)_10%,transparent)]">
          <span className="text-2xl font-bold text-[var(--howl-secondary)]">
            ${(8 + index * 2).toFixed(2)}
          </span>
          <motion.button
            className="px-5 py-2.5 rounded-full font-semibold text-sm transition-all bg-[var(--howl-primary)] text-[var(--howl-bg)] hover:bg-[var(--howl-secondary)] hover:text-[var(--howl-bg)]"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Add
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
