"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Save, X, Plus } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import type { UserPreferences } from "@/types/user";

const AVAILABLE_RESTAURANTS = [
    "McDonald's",
    "Burger King",
    "Wendy's",
    "KFC",
    "Taco Bell",
    "Pizza Hut",
];

const DIETARY_OPTIONS = [
    "Vegetarian",
    "Vegan",
    "Gluten-Free",
    "Dairy-Free",
    "Nut-Free",
    "Low-Sodium",
    "Halal",
    "Kosher",
];

export default function PreferencesPage() {
    const router = useRouter();
    const { user, isLoading: authLoading, isAuthenticated } = useAuth();

    const [preferences, setPreferences] = useState<UserPreferences>({
        dietaryRestrictions: [],
        favoriteRestaurants: [],
        maxCalories: null,
        minProtein: null,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Fetch current preferences
    useEffect(() => {
        async function fetchPreferences() {
            if (!isAuthenticated) return;

            try {
                const response = await fetch("/api/users/preferences", {
                    credentials: "include",
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.success && data.data?.preferences) {
                        setPreferences(data.data.preferences);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch preferences:", error);
            } finally {
                setIsLoading(false);
            }
        }

        if (!authLoading) {
            if (!isAuthenticated) {
                router.push("/login?returnUrl=/preferences");
            } else {
                fetchPreferences();
            }
        }
    }, [isAuthenticated, authLoading, router]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const response = await fetch("/api/users/preferences", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(preferences),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                toast.success("Preferences saved successfully!");
            } else {
                toast.error(data.message || "Failed to save preferences");
            }
        } catch (error) {
            console.error("Save preferences error:", error);
            toast.error("Failed to save preferences");
        } finally {
            setIsSaving(false);
        }
    };

    const toggleRestaurant = (restaurant: string) => {
        setPreferences((prev) => ({
            ...prev,
            favoriteRestaurants: prev.favoriteRestaurants.includes(restaurant)
                ? prev.favoriteRestaurants.filter((r) => r !== restaurant)
                : [...prev.favoriteRestaurants, restaurant],
        }));
    };

    const toggleDietary = (restriction: string) => {
        setPreferences((prev) => ({
            ...prev,
            dietaryRestrictions: prev.dietaryRestrictions.includes(restriction)
                ? prev.dietaryRestrictions.filter((r) => r !== restriction)
                : [...prev.dietaryRestrictions, restriction],
        }));
    };

    if (authLoading || isLoading) {
        return (
            <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
                <div className="text-[var(--text)] text-xl">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--bg)] flex flex-col">
            <Header />

            <main className="flex-1 pt-20 pb-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-2xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-8">
                        <Link
                            href="/dashboard"
                            className="p-2 rounded-lg bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-[var(--text)]" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-[var(--text)]">
                                Food Preferences
                            </h1>
                            <p className="text-[var(--text-subtle)]">
                                Customize your search and recommendation settings
                            </p>
                        </div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        {/* Nutritional Defaults */}
                        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-6">
                            <h2 className="text-lg font-semibold text-[var(--text)] mb-4">
                                Nutritional Defaults
                            </h2>
                            <p className="text-sm text-[var(--text-subtle)] mb-4">
                                These values will be applied automatically to your searches when
                                not specified in your query.
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-[var(--text)] mb-2">
                                        Max Calories per Meal
                                    </label>
                                    <input
                                        type="number"
                                        value={preferences.maxCalories ?? ""}
                                        onChange={(e) =>
                                            setPreferences((prev) => ({
                                                ...prev,
                                                maxCalories: e.target.value
                                                    ? parseInt(e.target.value)
                                                    : null,
                                            }))
                                        }
                                        placeholder="e.g., 600"
                                        className="w-full px-4 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--orange)]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[var(--text)] mb-2">
                                        Min Protein (g)
                                    </label>
                                    <input
                                        type="number"
                                        value={preferences.minProtein ?? ""}
                                        onChange={(e) =>
                                            setPreferences((prev) => ({
                                                ...prev,
                                                minProtein: e.target.value
                                                    ? parseInt(e.target.value)
                                                    : null,
                                            }))
                                        }
                                        placeholder="e.g., 20"
                                        className="w-full px-4 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--orange)]"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Favorite Restaurants */}
                        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-6">
                            <h2 className="text-lg font-semibold text-[var(--text)] mb-4">
                                Favorite Restaurants
                            </h2>
                            <p className="text-sm text-[var(--text-subtle)] mb-4">
                                Items from your favorite restaurants will appear at the top of
                                search results.
                            </p>

                            <div className="flex flex-wrap gap-2">
                                {AVAILABLE_RESTAURANTS.map((restaurant) => (
                                    <button
                                        key={restaurant}
                                        onClick={() => toggleRestaurant(restaurant)}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${preferences.favoriteRestaurants.includes(restaurant)
                                                ? "bg-[var(--orange)] text-white"
                                                : "bg-[var(--bg)] text-[var(--text)] border border-[var(--border)] hover:border-[var(--orange)]"
                                            }`}
                                    >
                                        {restaurant}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Dietary Restrictions */}
                        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-6">
                            <h2 className="text-lg font-semibold text-[var(--text)] mb-4">
                                Dietary Restrictions
                            </h2>
                            <p className="text-sm text-[var(--text-subtle)] mb-4">
                                Select any dietary restrictions. (Note: Full filtering coming
                                soon)
                            </p>

                            <div className="flex flex-wrap gap-2">
                                {DIETARY_OPTIONS.map((option) => (
                                    <button
                                        key={option}
                                        onClick={() => toggleDietary(option)}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${preferences.dietaryRestrictions.includes(option)
                                                ? "bg-[var(--cream)] text-[var(--bg)]"
                                                : "bg-[var(--bg)] text-[var(--text)] border border-[var(--border)] hover:border-[var(--cream)]"
                                            }`}
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Save Button */}
                        <div className="flex justify-end gap-4">
                            <Link
                                href="/dashboard"
                                className="px-6 py-3 rounded-lg bg-[var(--bg-card)] text-[var(--text)] hover:bg-[var(--bg-hover)] transition-colors"
                            >
                                Cancel
                            </Link>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="flex items-center gap-2 px-6 py-3 rounded-lg bg-[var(--orange)] text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                            >
                                <Save className="w-4 h-4" />
                                {isSaving ? "Saving..." : "Save Preferences"}
                            </button>
                        </div>
                    </motion.div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
