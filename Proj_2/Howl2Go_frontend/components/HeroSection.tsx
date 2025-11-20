"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AnimatedHeadline from "./AnimatedHeadline";
import SearchBar from "./SearchBar";
import SearchResults from "./SearchResults";
import { motion, AnimatePresence } from "framer-motion";

// Search recommendations shown in Live Mode
const searchRecommendations: string[] = [
  "Show me meals between $8 and $12",
  "meal with less than 600 calories and over 30g of protein",
  "high protein salad",
];

interface HeroSectionProps {
  onSearchFocusChange?: (focused: boolean) => void;
}

export default function HeroSection({ onSearchFocusChange }: HeroSectionProps) {
  const router = useRouter();

  // Demo Mode vs Live Search Mode
  const [isDemoMode, setIsDemoMode] = useState(true);

  // Demo typing animation
  const [demoStep, setDemoStep] = useState(0);
  const [typedText, setTypedText] = useState("");
  const [showDemoCards, setShowDemoCards] = useState(false);

  // Live search state
  const [inputValue, setInputValue] = useState("");
  const [showLiveResults, setShowLiveResults] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const cravings = ["spicy ramen", "cheesy pizza", "healthy salad"];
  const currentCraving = cravings[demoStep % cravings.length];

  useEffect(() => {
    onSearchFocusChange?.(isSearchFocused);
  }, [isSearchFocused, onSearchFocusChange]);

  // Screen reader accessibility
  useEffect(() => {
    if (isSearchFocused && !isDemoMode) {
      const announcement = document.createElement("div");
      announcement.setAttribute("role", "status");
      announcement.setAttribute("aria-live", "polite");
      announcement.className = "sr-only";
      announcement.textContent =
        "Search activated. Type your query and press Enter to search.";
      document.body.appendChild(announcement);

      return () => {
        document.body.removeChild(announcement);
      };
    }
  }, [isSearchFocused, isDemoMode]);

  // Typewriter loop for demo mode
  useEffect(() => {
    if (!isDemoMode) return;

    setShowDemoCards(false);
    setTypedText("");
    let charIndex = 0;

    const typingInterval = setInterval(() => {
      if (charIndex <= currentCraving.length) {
        setTypedText(currentCraving.slice(0, charIndex));
        charIndex++;
      } else {
        clearInterval(typingInterval);
        setTimeout(() => setShowDemoCards(true), 450);
        setTimeout(() => {
          setDemoStep((prev) => prev + 1);
        }, 3500);
      }
    }, 100);

    return () => clearInterval(typingInterval);
  }, [demoStep, currentCraving, isDemoMode]);

  const handleSearchFocus = () => {
    setIsDemoMode(false);
    setShowDemoCards(false); // Hide demo cards when switching to live mode
    setShowLiveResults(true);
    setIsSearchFocused(true);
  };

  const handleSearchBlur = () => {
    setIsSearchFocused(false);
    if (inputValue === "") {
      setShowLiveResults(false);
      setIsDemoMode(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim()) {
      const query = encodeURIComponent(inputValue.trim());
      router.push(`/search?q=${query}`);
    } else if (e.key === "Escape") {
      if (inputValue === "") {
        setIsDemoMode(true);
        setShowLiveResults(false);
        setIsSearchFocused(false);
      }
    }
  };

  const handleRecommendationClick = (recommendation: string) => {
    // Navigate to search page with the recommendation
    const query = encodeURIComponent(recommendation);
    router.push(`/search?q=${query}`);
  };

  return (
    <section className="relative flex items-center justify-center px-4 sm:px-8 pt-8 pb-4 bg-[var(--howl-bg)] w-full">
      <div className="w-full max-w-4xl mx-auto">
        {/* Headline */}
        <AnimatedHeadline isSearchFocused={isSearchFocused} />

        {/* Search Bar */}
        <SearchBar
          isDemoMode={isDemoMode}
          isSearchFocused={isSearchFocused}
          inputValue={inputValue}
          typedText={typedText}
          onInputChange={setInputValue}
          onKeyDown={handleKeyDown}
          onSearchFocus={handleSearchFocus}
          onSearchBlur={handleSearchBlur}
        />

        {/* Fixed container for animations - prevents layout shift */}
        <div className="min-h-[240px] mt-8">
          {/* Demo Mode Cards */}
          <AnimatePresence mode="wait">
            {showDemoCards && isDemoMode && (
              <motion.div
                key="demoCards"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
              >
                <SearchResults
                  isDemoMode={isDemoMode}
                  isSearchFocused={isSearchFocused}
                  showDemoCards={showDemoCards}
                  showLiveResults={false}
                  recommendations={searchRecommendations}
                  onRecommendationClick={handleRecommendationClick}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Live Search Results */}
          <AnimatePresence mode="wait">
            {showLiveResults && !isDemoMode && (
              <motion.div
                key="liveResults"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <SearchResults
                  isDemoMode={isDemoMode}
                  isSearchFocused={isSearchFocused}
                  showDemoCards={false}
                  showLiveResults={showLiveResults}
                  recommendations={searchRecommendations}
                  onRecommendationClick={handleRecommendationClick}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
