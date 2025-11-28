"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { MessageSquare, CheckCircle } from "lucide-react";
import type { FoodItem } from "@/types/food";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { getItemReviews } from "@/lib/api/review";
import StarRating from "./StarRating";
import ReviewsSection from "./ReviewsSection";

interface ItemCardProps extends Partial<FoodItem> {
  restaurant: string;
  item: string;
  calories: number;
  index?: number;
  disableAnimation?: boolean;
  variant?: "default" | "compact" | "dashboard";
  onAdd?: (item: FoodItem) => void;
  onShowDescription?: (item: FoodItem) => void;
  price?: number;
  showReviews?: boolean;
}

// Get restaurant logo with flexible matching to handle API name variations
const getRestaurantLogo = (restaurant: string): string => {
  // Normalize restaurant name for matching
  const normalized = restaurant.trim().toLowerCase();

  // Direct mappings with multiple variants
  // if (normalized.includes("mcdonald")) return "/mcdonalds-5.svg";
  // if (normalized.includes("burger king")) return "/burger-king-4.svg";
  // if (normalized.includes("wendy")) return "/wendys-logo-1.svg";
  // if (normalized.includes("kfc") || normalized.includes("kentucky"))
  //   return "/kfc-4.svg";
  // if (normalized.includes("taco bell") || normalized.includes("tacobell"))
  //   return "/taco-bell-1.svg";

  // Fallback to generic fast food icon
  return "/fast-food-svgrepo-com.svg";
};

export default function ItemCard({
  restaurant,
  price,
  item,
  calories,
  index = 0,
  disableAnimation = false,
  variant = "default",
  onAdd,
  onShowDescription,
  showReviews = false,
  ...restProps
}: ItemCardProps) {
  const [showDescription, setShowDescription] = useState(false);
  const [showReviewsSection, setShowReviewsSection] = useState(false);
  const [rating, setRating] = useState<number | null>(null);
  const [reviewCount, setReviewCount] = useState(0);
  const [userReview, setUserReview] = useState<{ rating: number; _id: string } | null>(null);
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const { addToCart } = useCart();

  // Fetch rating and user's review if foodItem has _id
  useEffect(() => {
    if (restProps._id && showReviews) {
      getItemReviews(restProps._id, 1, 1, 'recent')
        .then((data) => {
          if (data.stats) {
            setRating(data.stats.averageRating);
            setReviewCount(data.stats.totalReviews);
          }
          // Set user's review if available
          if (data.userReview) {
            setUserReview({
              rating: data.userReview.rating,
              _id: data.userReview._id
            });
          } else {
            setUserReview(null);
          }
        })
        .catch(() => {
          // Silently fail - ratings are optional
        });
    }
  }, [restProps._id, showReviews, isAuthenticated]);

  // Listen for review submission events (from order page or elsewhere)
  useEffect(() => {
    if (!restProps._id || !showReviews) return;

    const handleReviewSubmitted = (event: CustomEvent) => {
      // Refresh if this item matches the reviewed item
      if (event.detail?.foodItemId === restProps._id) {
        getItemReviews(restProps._id, 1, 1, 'recent')
          .then((data) => {
            if (data.stats) {
              setRating(data.stats.averageRating);
              setReviewCount(data.stats.totalReviews);
            }
            if (data.userReview) {
              setUserReview({
                rating: data.userReview.rating,
                _id: data.userReview._id
              });
            } else {
              setUserReview(null);
            }
          })
          .catch(() => {
            // Silently fail
          });
      }
    };

    window.addEventListener('reviewSubmitted' as any, handleReviewSubmitted);
    return () => {
      window.removeEventListener('reviewSubmitted' as any, handleReviewSubmitted);
    };
  }, [restProps._id, showReviews]);

  // Construct foodItem ensuring _id is included
  const foodItem: FoodItem = {
    restaurant,
    item,
    calories,
    ...restProps,
    // Ensure _id is included if available in restProps
    _id: restProps._id || (restProps as any).id || undefined,
  };

  const handleAdd = () => {
    if (onAdd) {
      onAdd(foodItem);
      return;
    }

    // Check authentication for all variants except custom onAdd
    if (!isAuthenticated) {
      // Redirect to login with return URL
      const currentPath =
        typeof window !== "undefined"
          ? window.location.pathname + window.location.search
          : "";
      router.push(`/login?returnUrl=${encodeURIComponent(currentPath)}`);
      return;
    }

    if (variant === "dashboard") {
      // Dashboard variant: add to today's log
      // TODO: Call API to add to meal log
      console.log("Added to today's log:", foodItem);
      toast.success(`Added ${item} to today's log!`, {
        duration: 3000,
      });
      // In production: await addMealToLog(foodItem, selectedMealType)
    } else {
      // Default behavior: add to cart
      // Check if _id exists before adding
      if (!foodItem._id) {
        toast.error("Unable to add item: missing item ID. Please try searching again.");
        console.error("Cannot add item to cart: missing _id", foodItem);
        return;
      }
      
      // Add to cart - CartContext will handle success/error toasts
      addToCart(foodItem).catch((error) => {
        // Error toast is already shown in CartContext, just log here
        console.error("Failed to add to cart:", error);
      });
    }
  };

  const handleShowDescription = () => {
    if (onShowDescription) {
      onShowDescription(foodItem);
    } else {
      // Default behavior: toggle description
      setShowDescription(!showDescription);
    }
  };

  return (
    <motion.div
      initial={disableAnimation ? false : { opacity: 0, y: 20 }}
      animate={disableAnimation ? false : { opacity: 1, y: 0 }}
      transition={
        disableAnimation ? undefined : { delay: index * 0.05, duration: 0.25 }
      }
      className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-6 hover:border-[var(--orange)] transition-all group"
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
          ${typeof price === "number" ? price.toFixed(2) : "—"}
        </span>
      </div>

      {/* Item Name */}
      <h3 className="text-lg font-semibold text-[var(--text)] mb-2 group-hover:text-[var(--orange)] transition-colors">
        {item}
      </h3>

      {/* Restaurant Name */}
      <p className="text-sm text-[var(--text-subtle)] mb-3">{restaurant}</p>

      {/* Rating and User Review Status */}
      {showReviews && restProps._id && (
        <div className="mb-3 space-y-2">
          {/* Average Rating */}
          {rating !== null && (
            <div className="flex items-center gap-2">
              <StarRating rating={rating} size={14} showNumber={false} />
              <span className="text-xs text-[var(--text-subtle)]">
                {rating.toFixed(1)} ({reviewCount} {reviewCount === 1 ? "review" : "reviews"})
              </span>
              <button
                onClick={() => setShowReviewsSection(!showReviewsSection)}
                className="ml-auto text-xs text-[var(--orange)] hover:text-[var(--cream)] transition-colors flex items-center gap-1"
              >
                <MessageSquare size={12} />
                Reviews
              </button>
            </div>
          )}
          
          {/* User's Review Badge */}
          {isAuthenticated && userReview && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-[var(--orange)]/20 to-[var(--cream)]/20 border border-[var(--orange)]/30"
            >
              <CheckCircle size={14} className="text-[var(--orange)] flex-shrink-0" />
              <span className="text-xs font-medium text-[var(--text)]">
                You rated this
              </span>
              <StarRating rating={userReview.rating} size={12} showNumber={false} />
              <span className="text-xs font-semibold text-[var(--orange)]">
                {userReview.rating}/5
              </span>
            </motion.div>
          )}
        </div>
      )}

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

      {/* Description Section (Collapsible) */}
      {showDescription && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-4 p-3 bg-[var(--bg-hover)] rounded-lg text-sm text-[var(--text-subtle)]"
        >
          <h4 className="font-semibold text-[var(--text)] mb-2">
            Nutrition Details:
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {restProps.totalFat !== undefined &&
              restProps.totalFat !== null && (
                <div>Total Fat: {restProps.totalFat}g</div>
              )}
            {restProps.protein !== undefined && restProps.protein !== null && (
              <div>Protein: {restProps.protein}g</div>
            )}
            {restProps.carbs !== undefined && restProps.carbs !== null && (
              <div>Carbs: {restProps.carbs}g</div>
            )}
            {restProps.sodium !== undefined && restProps.sodium !== null && (
              <div>Sodium: {restProps.sodium}mg</div>
            )}
            {restProps.sugars !== undefined && restProps.sugars !== null && (
              <div>Sugars: {restProps.sugars}g</div>
            )}
            {restProps.fiber !== undefined && restProps.fiber !== null && (
              <div>Fiber: {restProps.fiber}g</div>
            )}
          </div>
        </motion.div>
      )}

      {/* Reviews Section */}
      {showReviewsSection && restProps._id && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-4 pt-4 border-t"
          style={{ borderColor: "var(--border)" }}
        >
          <ReviewsSection foodItemId={restProps._id} itemName={item} />
        </motion.div>
      )}

      {/* Footer: Buttons */}
      <div className="flex items-center gap-2 pt-3 border-t border-[var(--border)]">
        <motion.button
          onClick={handleShowDescription}
          className="flex-1 px-4 py-2 rounded-full font-semibold text-sm bg-[var(--bg-hover)] text-[var(--text)] hover:bg-[var(--border)] transition-colors border border-[var(--border)]"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {showDescription ? "Hide" : "Details"}
        </motion.button>
        <motion.button
          onClick={handleAdd}
          className="flex-1 px-4 py-2 rounded-full font-semibold text-sm bg-[var(--orange)] text-[var(--text)] hover:bg-[var(--cream)] hover:text-[var(--bg)] transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {variant === "dashboard" ? "Add to Today" : "Add"}
        </motion.button>
      </div>
    </motion.div>
  );
}
