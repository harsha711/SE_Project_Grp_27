"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import DishCard from "./DishCard";

interface FrequentlyBoughtSectionProps {
  isSearchFocused: boolean;
}

export default function FrequentlyBoughtSection({ isSearchFocused }: FrequentlyBoughtSectionProps) {
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
  );
}
