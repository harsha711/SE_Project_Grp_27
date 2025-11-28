"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Star } from "lucide-react";
import StarRating from "./StarRating";
import { createReview, updateReview, getItemReviews } from "@/lib/api/review";
import toast from "react-hot-toast";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  foodItemId: string;
  itemName: string;
  restaurant: string;
  reviewId?: string; // For editing existing reviews
  existingReview?: {
    rating: number;
    comment?: string;
  };
  onReviewCreated?: () => void;
  onReviewUpdated?: () => void;
}

export default function ReviewModal({
  isOpen,
  onClose,
  orderId,
  foodItemId,
  itemName,
  restaurant,
  reviewId,
  existingReview,
  onReviewCreated,
  onReviewUpdated,
}: ReviewModalProps) {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [comment, setComment] = useState(existingReview?.comment || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [currentReviewId, setCurrentReviewId] = useState<string | undefined>(reviewId);
  
  // Determine if we're editing - check reviewId prop, state, or existingReview prop
  const isEditing = !!(currentReviewId || reviewId || existingReview);

  // Check for existing review when modal opens (if not already provided)
  useEffect(() => {
    const checkExistingReview = async () => {
      if (isOpen && foodItemId) {
        // If reviewId and existingReview are provided, use them
        if (reviewId && existingReview) {
          setCurrentReviewId(reviewId);
          setRating(existingReview.rating);
          setComment(existingReview.comment || "");
          return;
        }
        
        // Otherwise, check if user has an existing review for this item
        try {
          const data = await getItemReviews(foodItemId, 1, 1, 'recent');
          if (data.userReview) {
            // User has an existing review - set up for edit mode
            setCurrentReviewId(data.userReview._id);
            setRating(data.userReview.rating);
            setComment(data.userReview.comment || "");
          } else {
            // No existing review - new review mode
            setCurrentReviewId(undefined);
            if (!existingReview) {
              setRating(0);
              setComment("");
            }
          }
        } catch (error) {
          // Silently fail - user might not be authenticated or review might not exist
          setCurrentReviewId(undefined);
          if (!existingReview) {
            setRating(0);
            setComment("");
          }
        }
      } else if (isOpen && existingReview) {
        setRating(existingReview.rating);
        setComment(existingReview.comment || "");
      } else if (isOpen && !existingReview) {
        setRating(0);
        setComment("");
      }
    };

    checkExistingReview();
  }, [isOpen, existingReview, reviewId, foodItemId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Determine which review ID to use for update
      let reviewIdToUpdate = currentReviewId || reviewId;
      
      // If we don't have a reviewId yet, check one more time for existing review
      if (!reviewIdToUpdate) {
        try {
          const data = await getItemReviews(foodItemId, 1, 1, 'recent');
          if (data.userReview) {
            reviewIdToUpdate = data.userReview._id;
            setCurrentReviewId(data.userReview._id);
          }
        } catch (error) {
          // Silently fail - will try to create new review
        }
      }
      
      if (reviewIdToUpdate) {
        // Update existing review
        await updateReview(reviewIdToUpdate, rating, comment);
        toast.success("Review updated successfully!");
        
        if (onReviewUpdated) {
          onReviewUpdated();
        }
      } else {
        // Try to create new review, but if it fails with "already reviewed", update instead
        try {
          await createReview(orderId, foodItemId, rating, comment);
          toast.success("Review submitted successfully!");
          
          if (onReviewCreated) {
            onReviewCreated();
          }
        } catch (createError: any) {
          // Check if error is "already reviewed" - catch various error message formats
          const errorMsg = createError.message?.toLowerCase() || "";
          if (errorMsg.includes("already reviewed") || 
              errorMsg.includes("already reviewed this item") ||
              errorMsg.includes("already reviewed this item from this order")) {
            // User already has a review - fetch it and update instead
            try {
              const data = await getItemReviews(foodItemId, 1, 1, 'recent');
              if (data.userReview) {
                // Update the existing review instead
                await updateReview(data.userReview._id, rating, comment);
                toast.success("Review updated successfully!");
                
                if (onReviewUpdated) {
                  onReviewUpdated();
                }
              } else {
                throw createError; // Re-throw if we can't find the review
              }
            } catch (updateError: any) {
              // If update also fails, show the original error
              throw createError;
            }
          } else {
            // Re-throw other errors
            throw createError;
          }
        }
      }
      
      // Dispatch custom event to notify other components
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('reviewSubmitted', {
          detail: { foodItemId, orderId, rating, isUpdate: isEditing }
        }));
      }
      
      setRating(0);
      setComment("");
      onClose();
    } catch (error: any) {
      toast.error(error.message || (isEditing ? "Failed to update review" : "Failed to submit review"));
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
                    {isEditing ? "Edit Your Review" : "Write a Review"}
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
                    {isSubmitting 
                      ? (isEditing ? "Updating..." : "Submitting...") 
                      : (isEditing ? "Update Review" : "Submit Review")}
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

