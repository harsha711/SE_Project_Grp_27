"use client";

import { motion } from "framer-motion";
import { ThumbsUp, CheckCircle, MoreVertical } from "lucide-react";
import { useState } from "react";
import StarRating from "./StarRating";
import type { Review } from "@/lib/api/review";
import { markReviewHelpful } from "@/lib/api/review";
import { useAuth } from "@/context/AuthContext";

interface ReviewCardProps {
  review: Review;
  onHelpful?: (reviewId: string, helpful: number) => void;
  showActions?: boolean;
}

export default function ReviewCard({
  review,
  onHelpful,
  showActions = true,
}: ReviewCardProps) {
  const { isAuthenticated, user } = useAuth();
  const [isHelpful, setIsHelpful] = useState(
    isAuthenticated && review.helpfulUsers.includes(user?.id || "")
  );
  const [helpfulCount, setHelpfulCount] = useState(review.helpful);
  const [isMarking, setIsMarking] = useState(false);

  const handleHelpful = async () => {
    if (!isAuthenticated) return;

    try {
      setIsMarking(true);
      const newCount = await markReviewHelpful(review._id);
      setHelpfulCount(newCount);
      setIsHelpful(!isHelpful);
      if (onHelpful) {
        onHelpful(review._id, newCount);
      }
    } catch (error) {
      console.error("Failed to mark review as helpful:", error);
    } finally {
      setIsMarking(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl p-4 border transition-all hover:border-[var(--orange)]/30"
      style={{
        borderColor: "var(--border)",
        backgroundColor: "var(--bg-card)",
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3 flex-1">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--orange)] to-[var(--cream)] flex items-center justify-center text-[var(--bg)] font-bold text-sm">
            {review.userId.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-[var(--text)] text-sm">
                {review.userId.name}
              </span>
              {review.isVerified && (
                <CheckCircle
                  size={14}
                  className="text-green-500 fill-green-500"
                  title="Verified Purchase"
                />
              )}
            </div>
            <div className="flex items-center gap-2">
              <StarRating rating={review.rating} size={14} />
              <span className="text-xs text-[var(--text-subtle)]">
                {formatDate(review.createdAt)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {review.comment && (
        <p className="text-sm text-[var(--text)] mb-3 leading-relaxed">
          {review.comment}
        </p>
      )}

      {showActions && (
        <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: "var(--border)" }}>
          <button
            onClick={handleHelpful}
            disabled={isMarking || !isAuthenticated}
            className={`flex items-center gap-1.5 text-xs transition-colors ${
              isHelpful
                ? "text-[var(--orange)]"
                : "text-[var(--text-subtle)] hover:text-[var(--orange)]"
            } ${!isAuthenticated ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          >
            <ThumbsUp size={14} className={isHelpful ? "fill-current" : ""} />
            <span>Helpful ({helpfulCount})</span>
          </button>
        </div>
      )}
    </motion.div>
  );
}

