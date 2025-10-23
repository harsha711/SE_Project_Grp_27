"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AnimatedHeadline from "./AnimatedHeadline";
import SearchBar from "./SearchBar";
import SearchResults from "./SearchResults";

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

interface HeroSectionProps {
  onSearchFocusChange: (focused: boolean) => void;
}

export default function HeroSection({ onSearchFocusChange }: HeroSectionProps) {
  const router = useRouter();

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

  // Typewriter effect that cycles through different food cravings
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
        setTimeout(() => setShowDemoCards(true), 300);
        setTimeout(() => {
          setDemoStep((prev) => prev + 1);
        }, 3500);
      }
    }, 100);

    return () => clearInterval(typingInterval);
  }, [demoStep, currentCraving, isDemoMode]);

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

  // Filter search results based on user query
  const filteredResults = mockSearchResults.filter((result) =>
    result.name.toLowerCase().includes(inputValue.toLowerCase())
  );

  return (
    <section className="relative flex items-center justify-center px-4 sm:px-8 py-16 pb-8 bg-[var(--howl-bg)]">
      <div className="w-full max-w-4xl mx-auto">
        {/* Animated Headline */}
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

        {/* Search Results */}
        <SearchResults
          isDemoMode={isDemoMode}
          isSearchFocused={isSearchFocused}
          showDemoCards={showDemoCards}
          showLiveResults={showLiveResults}
          filteredResults={filteredResults}
        />
      </div>
    </section>
  );
}
