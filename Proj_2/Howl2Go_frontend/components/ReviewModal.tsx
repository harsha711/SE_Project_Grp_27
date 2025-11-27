"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Star } from "lucide-react";
import StarRating from "./StarRating";
import { createReview } from "@/lib/api/review";
import toast from "react-hot-toast";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  foodItemId: string;
  itemName: string;
  restaurant: string;
  onReviewCreated?: () => void;
}

export default function ReviewModal({
  isOpen,
  onClose,
  orderId,
  foodItemId,
  itemName,
  restaurant,
  onReviewCreated,
}: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    try {
      setIsSubmitting(true);
      await createReview(orderId, foodItemId, rating, comment);
      toast.success("Review submitted successfully!");
      setRating(0);
      setComment("");
      onClose();
      if (onReviewCreated) {
        onReviewCreated();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStarHover = (star: number) => {
    setHoveredStar(star);
  };

  const handleStarClick = (star: number) => {
    setRating(star);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="w-full max-w-md rounded-2xl p-6 border shadow-2xl"
              style={{
                backgroundColor: "var(--bg-card)",
                borderColor: "var(--border)",
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-[var(--text)]">
                    Write a Review
                  </h2>
                  <p className="text-sm text-[var(--text-subtle)] mt-1">
                    {itemName} from {restaurant}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-[var(--bg-hover)] transition-colors"
                >
                  <X size={20} className="text-[var(--text-subtle)]" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Rating */}
                <div>
                  <label className="block text-sm font-medium text-[var(--text)] mb-3">
                    Rating *
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onMouseEnter={() => handleStarHover(star)}
                        onMouseLeave={() => setHoveredStar(0)}
                        onClick={() => handleStarClick(star)}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          size={32}
                          className={`${
                            star <= (hoveredStar || rating)
                              ? "fill-[var(--orange)] text-[var(--orange)]"
                              : "text-[var(--text-subtle)] fill-none"
                          } transition-colors`}
                        />
                      </button>
                    ))}
                    {rating > 0 && (
                      <span className="ml-2 text-sm text-[var(--text-subtle)]">
                        {rating === 1
                          ? "Poor"
                          : rating === 2
                          ? "Fair"
                          : rating === 3
                          ? "Good"
                          : rating === 4
                          ? "Very Good"
                          : "Excellent"}
                      </span>
                    )}
                  </div>
                </div>

                {/* Comment */}
                <div>
                  <label
                    htmlFor="comment"
                    className="block text-sm font-medium text-[var(--text)] mb-2"
                  >
                    Your Review (Optional)
                  </label>
                  <textarea
                    id="comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your experience with this item..."
                    rows={4}
                    maxLength={1000}
                    className="w-full px-4 py-3 rounded-lg border resize-none focus:outline-none focus:ring-2 focus:ring-[var(--orange)]/50 transition-all"
                    style={{
                      backgroundColor: "var(--bg-hover)",
                      borderColor: "var(--border)",
                      color: "var(--text)",
                    }}
                  />
                  <p className="text-xs text-[var(--text-subtle)] mt-1 text-right">
                    {comment.length}/1000
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-2.5 rounded-lg font-medium border transition-colors"
                    style={{
                      borderColor: "var(--border)",
                      color: "var(--text)",
                      backgroundColor: "transparent",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={rating === 0 || isSubmitting}
                    className="flex-1 px-4 py-2.5 rounded-lg font-medium bg-[var(--orange)] text-[var(--bg)] hover:bg-[var(--cream)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Review"}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

