"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AnimatedHeadline from "./AnimatedHeadline";
import SearchBar from "./SearchBar";
import SearchResults from "./SearchResults";
import { motion, AnimatePresence } from "framer-motion";

// Search recommendations shown in Live Mode
const searchRecommendations: string[] = [
  "100 calorie burger",
  "200 calories pizza",
  "300 calorie salad",
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
    setShowLiveResults(true);
    setIsSearchFocused(true);
  };

  const handleSearchBlur = () => {
    setIsSearchFocused(false);
    if (inputValue === "") {
      setIsDemoMode(true);
      setShowLiveResults(false);
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

  return (
    <section className="relative flex items-center justify-center px-4 sm:px-8 py-16 pb-8 bg-[var(--howl-bg)]">
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

        {/* Demo Mode Cards */}
        <AnimatePresence>
          {showDemoCards && isDemoMode && (
            <motion.div
              key="demoCards"
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 8 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              <SearchResults
                isDemoMode={isDemoMode}
                isSearchFocused={isSearchFocused}
                showDemoCards={showDemoCards}
                showLiveResults={false}
                recommendations={searchRecommendations}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Live Search Results */}
        <AnimatePresence>
          {showLiveResults && !isDemoMode && (
            <motion.div
              key="liveResults"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <SearchResults
                isDemoMode={isDemoMode}
                isSearchFocused={isSearchFocused}
                showDemoCards={false}
                showLiveResults={showLiveResults}
                recommendations={searchRecommendations}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
