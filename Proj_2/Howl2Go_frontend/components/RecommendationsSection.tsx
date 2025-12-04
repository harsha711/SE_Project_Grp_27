"use client";

/**
 * RecommendationsSection Component
 *
 * A section that displays AI-powered personalized meal recommendations.
 * Shows a carousel of recommendation cards with different types of suggestions.
 */

import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Sparkles, RefreshCw } from "lucide-react";
import RecommendationCard from "./RecommendationCard";
import { getPersonalizedRecommendations } from "@/lib/api/recommendations";
import type { Recommendation, UserProfile } from "@/types/recommendation";

interface RecommendationsSectionProps {
    /** Whether the search is focused (to blur section) */
    isSearchFocused?: boolean;
    /** Title for the section */
    title?: string;
    /** Whether to show user profile summary */
    showProfile?: boolean;
    /** Maximum number of recommendations to show */
    limit?: number;
}

export default function RecommendationsSection({
    isSearchFocused = false,
    title = "Recommended for You",
    showProfile = false,
    limit = 8,
}: RecommendationsSectionProps) {
    const carouselRef = useRef<HTMLDivElement>(null);
    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isNewUser, setIsNewUser] = useState(false);

    const fetchRecommendations = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await getPersonalizedRecommendations(limit, showProfile);

            if (response.success) {
                setRecommendations(response.recommendations || []);
                setUserProfile(response.userProfile || null);
                setIsNewUser(response.isNewUser || false);
            } else {
                setError("Failed to load recommendations");
            }
        } catch (err) {
            console.error("Error fetching recommendations:", err);
            setError("Unable to load recommendations");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRecommendations();
    }, [limit, showProfile]);

    const scroll = (direction: "left" | "right") => {
        if (carouselRef.current) {
            const scrollAmount = 320;
            carouselRef.current.scrollBy({
                left: direction === "left" ? -scrollAmount : scrollAmount,
                behavior: "smooth",
            });
        }
    };

    // Loading state
    if (isLoading) {
        return (
            <motion.section
                className="mx-auto max-w-7xl px-4 py-12 sm:py-16"
                animate={{
                    opacity: isSearchFocused ? 0.5 : 1,
                    filter: isSearchFocused ? "blur(2px)" : "blur(0px)",
                }}
                transition={{ duration: 0.3, ease: "easeOut" }}
            >
                <div className="flex items-center gap-3 mb-8">
                    <Sparkles className="h-6 w-6 text-[var(--orange)]" />
                    <h2 className="text-2xl font-bold text-[var(--text)]">{title}</h2>
                </div>
                <div className="flex gap-6 overflow-hidden">
                    {[1, 2, 3, 4].map((i) => (
                        <div
                            key={i}
                            className="min-w-[280px] h-[300px] bg-[var(--bg-card)] border border-[var(--border)] rounded-xl animate-pulse"
                        />
                    ))}
                </div>
            </motion.section>
        );
    }

    // Error state
    if (error) {
        return (
            <motion.section
                className="mx-auto max-w-7xl px-4 py-12 sm:py-16"
                animate={{
                    opacity: isSearchFocused ? 0.5 : 1,
                    filter: isSearchFocused ? "blur(2px)" : "blur(0px)",
                }}
            >
                <div className="text-center py-12">
                    <p className="text-[var(--text-subtle)] mb-4">{error}</p>
                    <button
                        onClick={fetchRecommendations}
                        className="flex items-center gap-2 mx-auto px-4 py-2 bg-[var(--orange)] hover:bg-[var(--orange-dark)] text-white rounded-lg transition-colors"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Try Again
                    </button>
                </div>
            </motion.section>
        );
    }

    // No recommendations
    if (recommendations.length === 0) {
        return (
            <motion.section
                className="mx-auto max-w-7xl px-4 py-12 sm:py-16"
                animate={{
                    opacity: isSearchFocused ? 0.5 : 1,
                    filter: isSearchFocused ? "blur(2px)" : "blur(0px)",
                }}
            >
                <div className="flex items-center gap-3 mb-8">
                    <Sparkles className="h-6 w-6 text-[var(--orange)]" />
                    <h2 className="text-2xl font-bold text-[var(--text)]">{title}</h2>
                </div>
                <div className="text-center py-12 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl">
                    <Sparkles className="h-12 w-12 text-[var(--orange)] mx-auto mb-4" />
                    <p className="text-[var(--text)] font-medium mb-2">
                        {isNewUser ? "Welcome! Start ordering to get personalized recommendations" : "No recommendations yet"}
                    </p>
                    <p className="text-[var(--text-subtle)] text-sm">
                        The more you order, the better we get at suggesting items you&apos;ll love
                    </p>
                </div>
            </motion.section>
        );
    }

    return (
        <motion.section
            className="mx-auto max-w-7xl px-4 py-12 sm:py-16"
            animate={{
                opacity: isSearchFocused ? 0.5 : 1,
                filter: isSearchFocused ? "blur(2px)" : "blur(0px)",
            }}
            transition={{ duration: 0.3, ease: "easeOut" }}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <Sparkles className="h-6 w-6 text-[var(--orange)]" />
                    <div>
                        <h2 className="text-2xl font-bold text-[var(--text)]">{title}</h2>
                        {userProfile && showProfile && (
                            <p className="text-sm text-[var(--text-subtle)] mt-1">
                                Based on your {userProfile.totalOrders} orders
                                {userProfile.favoriteRestaurant && ` • ${userProfile.favoriteRestaurant} fan`}
                            </p>
                        )}
                    </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex gap-2">
                    <button
                        onClick={() => scroll("left")}
                        className="p-2 rounded-full border-2 transition-all hover:scale-110 border-[var(--orange)] text-[var(--orange)] hover:bg-[var(--orange)]/10"
                        aria-label="Scroll left"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                        onClick={() => scroll("right")}
                        className="p-2 rounded-full border-2 transition-all hover:scale-110 border-[var(--orange)] text-[var(--orange)] hover:bg-[var(--orange)]/10"
                        aria-label="Scroll right"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* New User Message */}
            {isNewUser && (
                <div className="mb-6 p-4 bg-[var(--orange)]/10 border border-[var(--orange)]/30 rounded-lg">
                    <p className="text-[var(--text)] text-sm">
                        <Sparkles className="h-4 w-4 inline-block mr-2 text-[var(--orange)]" />
                        Welcome! Here are some popular items to get you started. Order a few meals and we&apos;ll learn your preferences!
                    </p>
                </div>
            )}

            {/* Carousel */}
            <div
                ref={carouselRef}
                className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
                style={{
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                }}
            >
                {recommendations.map((recommendation, index) => (
                    <RecommendationCard
                        key={recommendation.item?._id || recommendation.item?.item || index}
                        recommendation={recommendation}
                        index={index}
                    />
                ))}
            </div>

            {/* Refresh Button */}
            <div className="flex justify-center mt-6">
                <button
                    onClick={fetchRecommendations}
                    className="flex items-center gap-2 px-4 py-2 text-[var(--text-subtle)] hover:text-[var(--text)] transition-colors"
                >
                    <RefreshCw className="h-4 w-4" />
                    <span className="text-sm">Refresh suggestions</span>
                </button>
            </div>
        </motion.section>
    );
}
