"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Star, TrendingUp, Filter } from "lucide-react";
import ReviewCard from "./ReviewCard";
import StarRating from "./StarRating";
import { getItemReviews, type ReviewStats } from "@/lib/api/review";
import type { Review } from "@/lib/api/review";

interface ReviewsSectionProps {
  foodItemId: string;
  itemName: string;
}

export default function ReviewsSection({
  foodItemId,
  itemName,
}: ReviewsSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<'recent' | 'oldest' | 'highest' | 'lowest' | 'helpful'>('recent');
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 0,
    limit: 10,
  });

  useEffect(() => {
    loadReviews();
  }, [foodItemId, page, sort]);

  const loadReviews = async () => {
    try {
      setIsLoading(true);
      const data = await getItemReviews(foodItemId, page, 10, sort);
      setReviews(data.reviews);
      setStats(data.stats);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Failed to load reviews:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRatingPercentage = (rating: number) => {
    if (!stats || stats.totalReviews === 0) return 0;
    return Math.round((stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution] / stats.totalReviews) * 100);
  };

  if (isLoading && reviews.length === 0) {
    return (
      <div className="rounded-xl p-6 border" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-card)" }}>
        <div className="animate-pulse">Loading reviews...</div>
      </div>
    );
  }

  if (!stats || stats.totalReviews === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl p-8 border text-center"
        style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-card)" }}
      >
        <MessageSquare size={48} className="mx-auto mb-4 text-[var(--text-subtle)]" />
        <h3 className="text-lg font-semibold text-[var(--text)] mb-2">
          No Reviews Yet
        </h3>
        <p className="text-sm text-[var(--text-subtle)]">
          Be the first to review {itemName}!
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl p-6 border"
        style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-card)" }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Overall Rating */}
          <div>
            <div className="flex items-center gap-4 mb-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-[var(--orange)] mb-1">
                  {stats.averageRating.toFixed(1)}
                </div>
                <StarRating rating={stats.averageRating} size={20} />
                <p className="text-sm text-[var(--text-subtle)] mt-2">
                  {stats.totalReviews} {stats.totalReviews === 1 ? "review" : "reviews"}
                </p>
              </div>
            </div>
          </div>

          {/* Rating Distribution */}
          <div>
            <h4 className="text-sm font-semibold text-[var(--text)] mb-3">
              Rating Distribution
            </h4>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => {
                const percentage = getRatingPercentage(rating);
                return (
                  <div key={rating} className="flex items-center gap-2">
                    <span className="text-xs text-[var(--text-subtle)] w-8">
                      {rating}★
                    </span>
                    <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: "var(--bg-hover)" }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ delay: rating * 0.1 }}
                        className="h-full bg-gradient-to-r from-[var(--orange)] to-[var(--cream)]"
                      />
                    </div>
                    <span className="text-xs text-[var(--text-subtle)] w-10 text-right">
                      {percentage}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Sort & Filter */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[var(--text)] flex items-center gap-2">
          <MessageSquare size={20} className="text-[var(--orange)]" />
          Reviews ({stats.totalReviews})
        </h3>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-[var(--text-subtle)]" />
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value as typeof sort);
              setPage(1);
            }}
            className="px-3 py-1.5 rounded-lg text-sm border focus:outline-none focus:ring-2 focus:ring-[var(--orange)]/50 transition-all"
            style={{
              backgroundColor: "var(--bg-hover)",
              borderColor: "var(--border)",
              color: "var(--text)",
            }}
          >
            <option value="recent">Most Recent</option>
            <option value="oldest">Oldest First</option>
            <option value="highest">Highest Rated</option>
            <option value="lowest">Lowest Rated</option>
            <option value="helpful">Most Helpful</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review, idx) => (
          <ReviewCard
            key={review._id}
            review={review}
            showActions={true}
          />
        ))}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            style={{ borderColor: "var(--border)", color: "var(--text)" }}
          >
            Previous
          </button>
          <span className="text-sm text-[var(--text-subtle)] px-4">
            Page {page} of {pagination.pages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
            disabled={page === pagination.pages}
            className="px-4 py-2 rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            style={{ borderColor: "var(--border)", color: "var(--text)" }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

