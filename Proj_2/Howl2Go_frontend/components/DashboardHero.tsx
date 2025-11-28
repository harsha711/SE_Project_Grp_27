"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import PersonalizedGreeting from "./PersonalizedGreeting";
import SearchBar from "./SearchBar";
import DailyProgressRing from "./DailyProgressRing";
import RecentMealsSection from "./RecentMealsSection";
import type { DailyProgress, MealLog } from "@/types/user";

interface DashboardHeroProps {
  userName: string;
  dailyProgress: DailyProgress;
  recentMeals: MealLog[];
}

export default function DashboardHero({
  userName,
  dailyProgress,
  recentMeals,
}: DashboardHeroProps) {
  const router = useRouter();
  const [inputValue, setInputValue] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const handleSearchFocus = () => {
    setIsSearchFocused(true);
  };

  const handleSearchBlur = () => {
    setIsSearchFocused(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim()) {
      const query = encodeURIComponent(inputValue.trim());
      router.push(`/search?q=${query}&source=dashboard`);
    } else if (e.key === "Escape") {
      setIsSearchFocused(false);
      setInputValue("");
    }
  };

  const handleProgressRingClick = () => {
    // Smooth scroll to recent meals section
    const recentMealsSection = document.getElementById("recent-meals");
    if (recentMealsSection) {
      recentMealsSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section className="relative flex items-center justify-center px-4 sm:px-8 py-16 pb-8 bg-[var(--howl-bg)]">
      <div className="w-full max-w-4xl mx-auto">
        {/* Personalized Greeting */}
        <PersonalizedGreeting
          userName={userName}
          // isSearchFocused={isSearchFocused}
        />

        {/* Quick Actions - Orders Link */}
        <div className="flex justify-center mb-4">
          <Link
            href="/orders"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all hover:scale-105 hover:shadow-md bg-[var(--howl-secondary)]/10 hover:bg-[var(--howl-secondary)]/20 text-[var(--howl-secondary)] border border-[var(--howl-secondary)]/30"
          >
            <ShoppingBag className="h-4 w-4" />
            View Orders
          </Link>
        </div>

        {/* Search Bar - Same as homepage */}
        <SearchBar
          isDemoMode={false}
          isSearchFocused={isSearchFocused}
          inputValue={inputValue}
          typedText=""
          onInputChange={setInputValue}
          onKeyDown={handleKeyDown}
          onSearchFocus={handleSearchFocus}
          onSearchBlur={handleSearchBlur}
        />

        {/* Daily Progress Ring - Centered below search */}
        <div
          className={`flex justify-center mt-8 transition-all duration-500 ${
            isSearchFocused
              ? "opacity-0 blur-sm scale-95"
              : "opacity-100 blur-0 scale-100"
          }`}
        >
          <DailyProgressRing
            dailyProgress={dailyProgress}
            size="large"
            onClick={handleProgressRingClick}
          />
        </div>

        {/* Recent Meals Section */}
        <div id="recent-meals">
          <RecentMealsSection
            meals={recentMeals}
            isVisible={!isSearchFocused}
          />
        </div>
      </div>
    </section>
  );
}
