"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import type { FoodItem } from "@/types/food";

interface ItemCardProps extends Partial<FoodItem> {
  restaurant: string;
  item: string;
  calories: number;
  index?: number;
  disableAnimation?: boolean;
}

// Get restaurant logo with flexible matching to handle API name variations
const getRestaurantLogo = (restaurant: string): string => {
  // Normalize restaurant name for matching
  const normalized = restaurant.trim().toLowerCase();

  // Direct mappings with multiple variants
  if (normalized.includes("mcdonald")) return "/mcdonalds-5.svg";
  if (normalized.includes("burger king")) return "/burger-king-4.svg";
  if (normalized.includes("wendy")) return "/wendys-logo-1.svg";
  if (normalized.includes("kfc") || normalized.includes("kentucky")) return "/kfc-4.svg";
  if (normalized.includes("taco bell") || normalized.includes("tacobell")) return "/taco-bell-1.svg";

  // Fallback to generic fast food icon
  return "/fast-food-svgrepo-com.svg";
};

export default function ItemCard({
  restaurant,
  item,
  calories,
  index = 0,
  disableAnimation = false,
}: ItemCardProps) {
  return (
    <motion.div
      initial={disableAnimation ? false : { opacity: 0, y: 20 }}
      animate={disableAnimation ? false : { opacity: 1, y: 0 }}
      transition={disableAnimation ? undefined : { delay: index * 0.05, duration: 0.25 }}
      className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-6 hover:border-[var(--orange)] transition-all cursor-pointer group"
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      {/* Header: Restaurant Logo and Price */}
      <div className="flex items-start justify-between mb-4">
        <div className="w-16 h-16 relative flex items-center justify-center">
          <Image
            src={getRestaurantLogo(restaurant)}
            alt={`${restaurant} logo`}
            width={64}
            height={64}
            className="object-contain"
          />
        </div>
        <span className="text-xl font-bold text-[var(--cream)]">
          $--.--
        </span>
      </div>

      {/* Item Name */}
      <h3 className="text-lg font-semibold text-[var(--text)] mb-2 group-hover:text-[var(--orange)] transition-colors">
        {item}
      </h3>

      {/* Restaurant Name */}
      <p className="text-sm text-[var(--text-subtle)] mb-3">
        {restaurant}
      </p>

      {/* Nutrition Info */}
      <div className="mb-4">
        <div className="inline-flex items-center gap-2 bg-[var(--bg-hover)] px-3 py-1.5 rounded-full">
          <svg
            className="w-4 h-4 text-[var(--orange)]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
          <span className="text-xs font-medium text-[var(--text)]">
            {calories} cal
          </span>
        </div>
      </div>

      {/* Footer: Category and Add Button */}
      <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]">
        <span className="text-xs text-[var(--text-muted)] bg-[var(--bg-hover)] px-3 py-1 rounded-full">
          Fast Food
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
  );
}
