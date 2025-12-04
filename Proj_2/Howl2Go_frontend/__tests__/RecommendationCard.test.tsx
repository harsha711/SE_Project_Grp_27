/**
 * RecommendationCard Component Tests
 *
 * Tests for the recommendation card display and interactions.
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import RecommendationCard from "@/components/RecommendationCard";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import type { Recommendation } from "@/types/recommendation";

// Mock next/navigation
jest.mock("next/navigation", () => ({
    useRouter: () => ({
        push: jest.fn(),
        replace: jest.fn(),
        prefetch: jest.fn(),
    }),
}));

// Mock framer-motion
jest.mock("framer-motion", () => ({
    motion: {
        div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
            <div {...props}>{children}</div>
        ),
        button: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
            <button {...props}>{children}</button>
        ),
    },
}));

// Mock react-hot-toast
jest.mock("react-hot-toast", () => ({
    __esModule: true,
    default: {
        success: jest.fn(),
        error: jest.fn(),
    },
}));

// Wrapper component with providers
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>
        <CartProvider>{children}</CartProvider>
    </AuthProvider>
);

// Sample recommendation data
const mockRecommendation: Recommendation = {
    item: {
        _id: "test-item-1",
        restaurant: "McDonald's",
        item: "Big Mac",
        calories: 540,
        protein: 25,
        totalFat: 28,
        carbs: 46,
        price: 5.99,
    },
    reason: "Based on your love for burgers",
    type: "frequent",
    confidence: 92,
};

const mockHealthyRecommendation: Recommendation = {
    item: {
        _id: "test-item-2",
        restaurant: "Wendy's",
        item: "Grilled Chicken Sandwich",
        calories: 370,
        protein: 34,
        totalFat: 10,
        carbs: 36,
        price: 4.99,
    },
    reason: "A healthier alternative to your usual order",
    type: "healthy-alt",
    confidence: 85,
    caloriesSaved: 170,
};

describe("RecommendationCard", () => {
    it("renders the item name", () => {
        render(
            <TestWrapper>
                <RecommendationCard recommendation={mockRecommendation} />
            </TestWrapper>
        );

        expect(screen.getByText("Big Mac")).toBeInTheDocument();
    });

    it("renders the restaurant name", () => {
        render(
            <TestWrapper>
                <RecommendationCard recommendation={mockRecommendation} />
            </TestWrapper>
        );

        expect(screen.getByText("McDonald's")).toBeInTheDocument();
    });

    it("renders the reason", () => {
        render(
            <TestWrapper>
                <RecommendationCard recommendation={mockRecommendation} />
            </TestWrapper>
        );

        expect(screen.getByText("Based on your love for burgers")).toBeInTheDocument();
    });

    it("renders the price", () => {
        render(
            <TestWrapper>
                <RecommendationCard recommendation={mockRecommendation} />
            </TestWrapper>
        );

        expect(screen.getByText("$5.99")).toBeInTheDocument();
    });

    it("renders calories and protein", () => {
        render(
            <TestWrapper>
                <RecommendationCard recommendation={mockRecommendation} />
            </TestWrapper>
        );

        expect(screen.getByText("540 cal")).toBeInTheDocument();
        expect(screen.getByText("25g protein")).toBeInTheDocument();
    });

    it("renders confidence percentage", () => {
        render(
            <TestWrapper>
                <RecommendationCard recommendation={mockRecommendation} />
            </TestWrapper>
        );

        expect(screen.getByText("92% match")).toBeInTheDocument();
    });

    it("renders type badge for frequent items", () => {
        render(
            <TestWrapper>
                <RecommendationCard recommendation={mockRecommendation} />
            </TestWrapper>
        );

        expect(screen.getByText("Your Favorite")).toBeInTheDocument();
    });

    it("renders type badge for healthy alternatives", () => {
        render(
            <TestWrapper>
                <RecommendationCard recommendation={mockHealthyRecommendation} />
            </TestWrapper>
        );

        expect(screen.getByText("Healthier")).toBeInTheDocument();
    });

    it("renders calories saved badge for healthy alternatives", () => {
        render(
            <TestWrapper>
                <RecommendationCard recommendation={mockHealthyRecommendation} />
            </TestWrapper>
        );

        expect(screen.getByText("Save 170 calories")).toBeInTheDocument();
    });

    it("does not render calories saved badge for non-healthy items", () => {
        render(
            <TestWrapper>
                <RecommendationCard recommendation={mockRecommendation} />
            </TestWrapper>
        );

        expect(screen.queryByText(/Save \d+ calories/)).not.toBeInTheDocument();
    });

    it("renders Add to Cart button", () => {
        render(
            <TestWrapper>
                <RecommendationCard recommendation={mockRecommendation} />
            </TestWrapper>
        );

        expect(screen.getByRole("button", { name: /add/i })).toBeInTheDocument();
    });

    it("handles different recommendation types", () => {
        const types: Array<Recommendation["type"]> = [
            "frequent",
            "similar",
            "explore",
            "healthy-alt",
            "time-based",
            "popular",
        ];

        const labels = [
            "Your Favorite",
            "You'll Love",
            "Try New",
            "Healthier",
            "Right Now",
            "Popular",
        ];

        types.forEach((type, index) => {
            const rec: Recommendation = {
                ...mockRecommendation,
                type,
            };

            const { unmount } = render(
                <TestWrapper>
                    <RecommendationCard recommendation={rec} />
                </TestWrapper>
            );

            expect(screen.getByText(labels[index])).toBeInTheDocument();
            unmount();
        });
    });

    it("handles missing optional fields gracefully", () => {
        const minimalRecommendation: Recommendation = {
            item: {
                restaurant: "",
                item: "Test Item",
                calories: 0,
                protein: 0,
                price: 0,
            },
            reason: "Test reason",
            type: "popular",
            confidence: 50,
        };

        render(
            <TestWrapper>
                <RecommendationCard recommendation={minimalRecommendation} />
            </TestWrapper>
        );

        expect(screen.getByText("Test Item")).toBeInTheDocument();
        expect(screen.getByText("Unknown")).toBeInTheDocument(); // Default restaurant
        expect(screen.getByText("$0.00")).toBeInTheDocument();
    });
});
