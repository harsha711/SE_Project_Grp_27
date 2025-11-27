"use client";

import { Star } from "lucide-react";
import { motion } from "framer-motion";

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: number;
  showNumber?: boolean;
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  className?: string;
}

export default function StarRating({
  rating,
  maxRating = 5,
  size = 16,
  showNumber = false,
  interactive = false,
  onRatingChange,
  className = "",
}: StarRatingProps) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = maxRating - fullStars - (hasHalfStar ? 1 : 0);

  const handleStarClick = (index: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(index + 1);
    }
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div className="flex items-center gap-0.5">
        {[...Array(fullStars)].map((_, i) => (
          <motion.div
            key={`full-${i}`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => handleStarClick(i)}
            className={interactive ? "cursor-pointer" : ""}
          >
            <Star
              size={size}
              className="fill-[var(--orange)] text-[var(--orange)]"
            />
          </motion.div>
        ))}
        {hasHalfStar && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: fullStars * 0.05 }}
            onClick={() => handleStarClick(fullStars)}
            className={interactive ? "cursor-pointer" : ""}
          >
            <Star
              size={size}
              className="fill-[var(--orange)]/50 text-[var(--orange)]"
            />
          </motion.div>
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <motion.div
            key={`empty-${i}`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: (fullStars + (hasHalfStar ? 1 : 0) + i) * 0.05 }}
            onClick={() => handleStarClick(fullStars + (hasHalfStar ? 1 : 0) + i)}
            className={interactive ? "cursor-pointer" : ""}
          >
            <Star
              size={size}
              className="text-[var(--text-subtle)] fill-none"
            />
          </motion.div>
        ))}
      </div>
      {showNumber && (
        <span className="text-sm font-medium text-[var(--text)] ml-1">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}

