"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  const [isSearchFocused, setIsSearchFocused] = useState(false);

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
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 sm:px-6 lg:px-8">
          {/* Left Side */}
          <div className="flex items-center gap-4">
            <button
              className="p-2 transition-colors rounded-lg hover:bg-[color-mix(in_srgb,var(--howl-primary)_10%,transparent)]"
              aria-label="Menu"
            >
              <Menu className="h-6 w-6 text-[var(--howl-neutral)]" />
            </button>
            <Link href="/">
              <Image
                src="/Howl2go_orange_logo_transparent.png"
                alt="Howl2Go Logo"
                width={60}
                height={20}
                priority
              />
            </Link>
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
              Log In
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
        <IntegratedHeroSection onSearchFocusChange={setIsSearchFocused} />
      </div>

      {/* Frequently Bought Section */}
      <motion.section
        className="mx-auto max-w-7xl px-4 py-12 sm:py-20"
        animate={{
          opacity: isSearchFocused ? 0.5 : 1,
          filter: isSearchFocused ? "blur(2px)" : "blur(0px)",
        }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
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
      </motion.section>

      {/* Footer spacing */}
      <div className="h-8"></div>
    </div>
  );
}

// Integrated Hero Section - "Show, Don't Tell"
function IntegratedHeroSection({
  onSearchFocusChange,
}: {
  onSearchFocusChange: (focused: boolean) => void;
}) {
  const router = useRouter();

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
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const cravings = ["spicy ramen", "cheesy pizza", "healthy salad"];
  const currentCraving = cravings[demoStep % cravings.length];

  // Notify parent component of search focus state changes
  useEffect(() => {
    onSearchFocusChange(isSearchFocused);
  }, [isSearchFocused, onSearchFocusChange]);

  // Screen reader announcements
  useEffect(() => {
    if (isSearchFocused && !isDemoMode) {
      // Announce to screen readers that search is now active
      const announcement = document.createElement("div");
      announcement.setAttribute("role", "status");
      announcement.setAttribute("aria-live", "polite");
      announcement.className = "sr-only";
      announcement.textContent = "Search activated. Type your query and press Enter to search.";
      document.body.appendChild(announcement);

      return () => {
        document.body.removeChild(announcement);
      };
    }
  }, [isSearchFocused, isDemoMode]);

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
    setIsSearchFocused(true);
  };

  // Returns to Demo Mode if user abandons search (only if search is empty)
  const handleSearchBlur = () => {
    setIsSearchFocused(false);
    if (inputValue === "") {
      setIsDemoMode(true);
      setShowLiveResults(false);
    }
  };

  // Handle Enter key press to navigate to search page
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim()) {
      // Navigate to search page with hero transition
      const query = encodeURIComponent(inputValue.trim());
      router.push(`/search?q=${query}`);
    } else if (e.key === "Escape") {
      // Allow user to exit typing state with Escape key
      if (inputValue === "") {
        setIsDemoMode(true);
        setShowLiveResults(false);
        setIsSearchFocused(false);
      }
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
          initial="hidden"
          animate={
            isSearchFocused
              ? {
                  opacity: 0.3,
                  scale: 0.95,
                  filter: "blur(2px)",
                }
              : "visible"
          }
          variants={headlineContainerVariants}
          transition={{ duration: 0.3, ease: "easeOut" }}
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
          {/* Search Bar - Hero Element with Shared Layout ID */}
          <div className="mb-8">
            <motion.div
              layoutId="hero-search-bar"
              className="w-full px-6 py-5 text-xl sm:text-2xl rounded-full border-2 flex items-center min-h-[70px] relative focus-within:outline-none"
              style={{
                backgroundColor: isDemoMode
                  ? "var(--search-bar-bg-demo)"
                  : "var(--search-bar-bg-live)",
                outline: "none",
              }}
              initial={{ borderColor: "var(--search-bar-border)" }}
              animate={{
                borderColor: isSearchFocused
                  ? "var(--orange)"
                  : "var(--search-bar-border)",
                boxShadow: isSearchFocused
                  ? "0 8px 24px rgba(198, 107, 77, 0.25)"
                  : "0 0 0 0 transparent",
                scale: isSearchFocused ? 1.02 : 1,
              }}
              transition={{
                borderColor: {
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                },
                boxShadow: { duration: 0.25, ease: "easeOut" },
                scale: { duration: 0.15, ease: "easeOut" },
                layout: {
                  duration: 0.6,
                  ease: [0.4, 0, 0.2, 1],
                },
              }}
              whileHover={{
                boxShadow: isSearchFocused
                  ? "0 8px 24px rgba(198, 107, 77, 0.25)"
                  : "0 0 0 2px var(--search-bar-hover-glow)",
              }}
            >
              {/* Always-present search input - focusable in both demo and live modes */}
              <input
                type="text"
                placeholder={isDemoMode ? "" : "Search for any craving..."}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                // ENTER LIVE MODE: Triggered when user directly focuses on the search input
                // This provides precise control - only clicking/tabbing into the input activates Live Mode
                onFocus={handleSearchFocus}
                // EXIT LIVE MODE (CONDITIONAL): Triggered when user clicks/tabs away from input
                // Returns to Demo Mode ONLY if the input is empty. If user has typed text,
                // component stays in Live Mode to preserve their search and prevent jarring animation restart
                onBlur={handleSearchBlur}
                autoFocus={!isDemoMode}
                aria-label="Search for food"
                className="flex-1 bg-transparent outline-none focus:outline-none focus:ring-0 border-0 focus:border-0 text-[var(--search-bar-text)] placeholder:text-[var(--search-bar-placeholder)] relative z-10"
                style={{
                  color: isDemoMode ? "transparent" : "var(--search-bar-text)",
                  caretColor: isDemoMode
                    ? "transparent"
                    : "var(--search-bar-cursor)",
                  boxShadow: "none",
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

              {/* Search icon in Live Mode with Enter CTA */}
              {!isDemoMode && (
                <div className="flex items-center gap-2 ml-2 relative z-10">
                  <motion.div
                    animate={{
                      color: isSearchFocused
                        ? "var(--orange)"
                        : "var(--howl-secondary)",
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <Search className="h-6 w-6" />
                  </motion.div>
                  <AnimatePresence>
                    {isSearchFocused && inputValue.trim().length > 0 && (
                      <motion.span
                        initial={{ opacity: 0, scale: 0.8, x: -10 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.8, x: -10 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="text-sm font-medium text-[var(--cream)] flex items-center gap-1"
                      >
                        <span className="hidden sm:inline">Press</span>
                        <kbd className="px-2 py-0.5 text-xs bg-[var(--bg-hover)] border border-[var(--border)] rounded">
                          ↵
                        </kbd>
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>

            {/* CTA Text Below Search Bar (Alternative/Additional Option) */}
            <AnimatePresence>
              {isSearchFocused && inputValue.trim().length > 1 && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 0.7, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="text-center text-sm text-[var(--cream)] mt-3"
                >
                  Press Enter to find your craving
                </motion.p>
              )}
            </AnimatePresence>
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
