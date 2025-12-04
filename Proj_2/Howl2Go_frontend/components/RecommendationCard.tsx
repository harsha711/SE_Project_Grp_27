"use client";

/**
 * RecommendationCard Component
 *
 * Displays a single food recommendation with reasoning and confidence.
 * Shows special badges for different recommendation types.
 */

import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
    Heart,
    TrendingUp,
    Compass,
    Leaf,
    Clock,
    Star,
    Sparkles,
    ShoppingCart,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import type { Recommendation } from "@/types/recommendation";
import type { FoodItem } from "@/types/food";

interface RecommendationCardProps {
    recommendation: Recommendation;
    index?: number;
    disableAnimation?: boolean;
}

// Get icon based on recommendation type
const getTypeIcon = (type: Recommendation["type"]) => {
    switch (type) {
        case "frequent":
            return <Heart className="h-4 w-4" />;
        case "similar":
            return <TrendingUp className="h-4 w-4" />;
        case "explore":
            return <Compass className="h-4 w-4" />;
        case "healthy-alt":
            return <Leaf className="h-4 w-4" />;
        case "time-based":
            return <Clock className="h-4 w-4" />;
        case "popular":
            return <Star className="h-4 w-4" />;
        default:
            return <Sparkles className="h-4 w-4" />;
    }
};

// Get badge color based on type
const getTypeColor = (type: Recommendation["type"]) => {
    switch (type) {
        case "frequent":
            return "bg-pink-500/20 text-pink-400 border-pink-500/30";
        case "similar":
            return "bg-blue-500/20 text-blue-400 border-blue-500/30";
        case "explore":
            return "bg-purple-500/20 text-purple-400 border-purple-500/30";
        case "healthy-alt":
            return "bg-green-500/20 text-green-400 border-green-500/30";
        case "time-based":
            return "bg-amber-500/20 text-amber-400 border-amber-500/30";
        case "popular":
            return "bg-orange-500/20 text-orange-400 border-orange-500/30";
        default:
            return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
};

// Get type label
const getTypeLabel = (type: Recommendation["type"]) => {
    switch (type) {
        case "frequent":
            return "Your Favorite";
        case "similar":
            return "You'll Love";
        case "explore":
            return "Try New";
        case "healthy-alt":
            return "Healthier";
        case "time-based":
            return "Right Now";
        case "popular":
            return "Popular";
        default:
            return "Suggested";
    }
};

export default function RecommendationCard({
    recommendation,
    index = 0,
    disableAnimation = false,
}: RecommendationCardProps) {
    const [isHovered, setIsHovered] = useState(false);
    const router = useRouter();
    const { isAuthenticated } = useAuth();
    const { addToCart } = useCart();

    const { item, reason, type, confidence, caloriesSaved } = recommendation;

    // Normalize item data (handle both 'company' and 'restaurant' fields)
    const restaurant = item.restaurant || item.company || "Unknown";
    const itemName = item.item || "Unknown Item";
    const calories = item.calories || 0;
    const protein = item.protein || 0;
    const price = item.price || 0;

    const handleAddToCart = () => {
        if (!isAuthenticated) {
            const currentPath =
                typeof window !== "undefined"
                    ? window.location.pathname + window.location.search
                    : "";
            router.push(`/login?returnUrl=${encodeURIComponent(currentPath)}`);
            return;
        }

        const foodItem: FoodItem = {
            ...item,
            restaurant,
            item: itemName,
            calories,
            protein,
            price,
        };

        addToCart(foodItem);
        toast.success(`Added ${itemName} to cart!`, {
            duration: 2000,
            icon: "🛒",
        });
    };

    return (
        <motion.div
            initial={disableAnimation ? false : { opacity: 0, y: 20 }}
            animate={disableAnimation ? false : { opacity: 1, y: 0 }}
            transition={
                disableAnimation ? undefined : { delay: index * 0.08, duration: 0.3 }
            }
            className="relative bg-[var(--bg-card)] border border-[var(--border)] rounded-xl overflow-hidden hover:border-[var(--orange)] transition-all group min-w-[280px] max-w-[320px]"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
        >
            {/* Type Badge */}
            <div className="absolute top-3 left-3 z-10">
                <div
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getTypeColor(type)}`}
                >
                    {getTypeIcon(type)}
                    <span>{getTypeLabel(type)}</span>
                </div>
            </div>

            {/* Confidence Indicator */}
            <div className="absolute top-3 right-3 z-10">
                <div className="bg-[var(--bg-hover)] px-2 py-1 rounded-full text-xs text-[var(--text-subtle)]">
                    {confidence}% match
                </div>
            </div>

            {/* Card Content */}
            <div className="p-5 pt-12">
                {/* Restaurant & Item */}
                <div className="mb-3">
                    <p className="text-xs text-[var(--text-subtle)] mb-1">{restaurant}</p>
                    <h3 className="text-lg font-semibold text-[var(--text)] group-hover:text-[var(--orange)] transition-colors line-clamp-2">
                        {itemName}
                    </h3>
                </div>

                {/* Reason */}
                <p className="text-sm text-[var(--text-subtle)] mb-4 line-clamp-2 min-h-[40px]">
                    {reason}
                </p>

                {/* Calories Saved Badge (for healthy alternatives) */}
                {caloriesSaved && caloriesSaved > 0 && (
                    <div className="mb-3">
                        <span className="inline-flex items-center gap-1 bg-green-500/10 text-green-400 px-2 py-1 rounded-full text-xs">
                            <Leaf className="h-3 w-3" />
                            Save {caloriesSaved} calories
                        </span>
                    </div>
                )}

                {/* Nutrition Info */}
                <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-[var(--orange)]" />
                        <span className="text-sm text-[var(--text)]">{calories} cal</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-blue-400" />
                        <span className="text-sm text-[var(--text)]">{protein}g protein</span>
                    </div>
                </div>

                {/* Price & Add to Cart */}
                <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]">
                    <span className="text-xl font-bold text-[var(--cream)]">
                        ${price.toFixed(2)}
                    </span>
                    <motion.button
                        onClick={handleAddToCart}
                        className="flex items-center gap-2 bg-[var(--orange)] hover:bg-[var(--orange-dark)] text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
                        whileTap={{ scale: 0.95 }}
                    >
                        <ShoppingCart className="h-4 w-4" />
                        Add
                    </motion.button>
                </div>
            </div>
        </motion.div>
    );
}
