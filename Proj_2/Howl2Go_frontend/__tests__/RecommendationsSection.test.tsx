/**
 * RecommendationsSection Component Tests
 *
 * Tests for the recommendations carousel section.
 */

import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import RecommendationsSection from "@/components/RecommendationsSection";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import * as recommendationsApi from "@/lib/api/recommendations";

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
        section: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
            <section {...props}>{children}</section>
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

// Mock the recommendations API
jest.mock("@/lib/api/recommendations");

const mockedApi = recommendationsApi as jest.Mocked<typeof recommendationsApi>;

// Wrapper component with providers
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>
        <CartProvider>{children}</CartProvider>
    </AuthProvider>
);

// Sample API response
const mockApiResponse = {
    success: true,
    message: "Recommendations fetched successfully",
    recommendations: [
        {
            item: {
                _id: "1",
                restaurant: "McDonald's",
                item: "Big Mac",
                calories: 540,
                protein: 25,
                price: 5.99,
            },
            reason: "Your favorite burger",
            type: "frequent" as const,
            confidence: 95,
        },
        {
            item: {
                _id: "2",
                restaurant: "Wendy's",
                item: "Grilled Chicken",
                calories: 370,
                protein: 34,
                price: 4.99,
            },
            reason: "Healthier option",
            type: "healthy-alt" as const,
            confidence: 85,
            caloriesSaved: 170,
        },
    ],
    userProfile: {
        totalOrders: 15,
        favoriteRestaurant: "McDonald's",
        avgCaloriesPerItem: 650,
        dietaryPreference: "balanced" as const,
    },
    isNewUser: false,
};

describe("RecommendationsSection", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("shows loading state initially", () => {
        mockedApi.getPersonalizedRecommendations.mockImplementation(
            () => new Promise(() => { }) // Never resolves
        );

        render(
            <TestWrapper>
                <RecommendationsSection />
            </TestWrapper>
        );

        // Check for loading skeleton
        expect(screen.getByText("Recommended for You")).toBeInTheDocument();
    });

    it("renders recommendations after loading", async () => {
        mockedApi.getPersonalizedRecommendations.mockResolvedValue(mockApiResponse);

        render(
            <TestWrapper>
                <RecommendationsSection />
            </TestWrapper>
        );

        await waitFor(() => {
            expect(screen.getByText("Big Mac")).toBeInTheDocument();
        });

        expect(screen.getByText("Grilled Chicken")).toBeInTheDocument();
    });

    it("renders custom title", async () => {
        mockedApi.getPersonalizedRecommendations.mockResolvedValue(mockApiResponse);

        render(
            <TestWrapper>
                <RecommendationsSection title="Popular Picks" />
            </TestWrapper>
        );

        expect(screen.getByText("Popular Picks")).toBeInTheDocument();
    });

    it("shows user profile info when showProfile is true", async () => {
        mockedApi.getPersonalizedRecommendations.mockResolvedValue(mockApiResponse);

        render(
            <TestWrapper>
                <RecommendationsSection showProfile={true} />
            </TestWrapper>
        );

        await waitFor(() => {
            expect(screen.getByText(/Based on your 15 orders/)).toBeInTheDocument();
        });
    });

    it("does not show user profile when showProfile is false", async () => {
        mockedApi.getPersonalizedRecommendations.mockResolvedValue(mockApiResponse);

        render(
            <TestWrapper>
                <RecommendationsSection showProfile={false} />
            </TestWrapper>
        );

        await waitFor(() => {
            expect(screen.getByText("Big Mac")).toBeInTheDocument();
        });

        expect(screen.queryByText(/Based on your.*orders/)).not.toBeInTheDocument();
    });

    it("shows error state and retry button on API failure", async () => {
        mockedApi.getPersonalizedRecommendations.mockRejectedValue(new Error("API Error"));

        render(
            <TestWrapper>
                <RecommendationsSection />
            </TestWrapper>
        );

        await waitFor(() => {
            expect(screen.getByText("Unable to load recommendations")).toBeInTheDocument();
        });

        expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument();
    });

    it("shows new user message when isNewUser is true", async () => {
        mockedApi.getPersonalizedRecommendations.mockResolvedValue({
            ...mockApiResponse,
            isNewUser: true,
        });

        render(
            <TestWrapper>
                <RecommendationsSection />
            </TestWrapper>
        );

        await waitFor(() => {
            expect(screen.getByText(/Welcome!/)).toBeInTheDocument();
        });
    });

    it("shows empty state when no recommendations", async () => {
        mockedApi.getPersonalizedRecommendations.mockResolvedValue({
            success: true,
            message: "No recommendations available",
            recommendations: [],
            isNewUser: false,
        });

        render(
            <TestWrapper>
                <RecommendationsSection />
            </TestWrapper>
        );

        await waitFor(() => {
            expect(screen.getByText("No recommendations yet")).toBeInTheDocument();
        });
    });

    it("has navigation buttons for carousel", async () => {
        mockedApi.getPersonalizedRecommendations.mockResolvedValue(mockApiResponse);

        render(
            <TestWrapper>
                <RecommendationsSection />
            </TestWrapper>
        );

        await waitFor(() => {
            expect(screen.getByLabelText("Scroll left")).toBeInTheDocument();
            expect(screen.getByLabelText("Scroll right")).toBeInTheDocument();
        });
    });

    it("has refresh button", async () => {
        mockedApi.getPersonalizedRecommendations.mockResolvedValue(mockApiResponse);

        render(
            <TestWrapper>
                <RecommendationsSection />
            </TestWrapper>
        );

        await waitFor(() => {
            expect(screen.getByText("Refresh suggestions")).toBeInTheDocument();
        });
    });

    it("calls API with correct parameters", async () => {
        mockedApi.getPersonalizedRecommendations.mockResolvedValue(mockApiResponse);

        render(
            <TestWrapper>
                <RecommendationsSection limit={10} showProfile={true} />
            </TestWrapper>
        );

        await waitFor(() => {
            expect(mockedApi.getPersonalizedRecommendations).toHaveBeenCalledWith(10, true);
        });
    });

    it("retries API call when refresh button is clicked", async () => {
        mockedApi.getPersonalizedRecommendations.mockResolvedValue(mockApiResponse);

        render(
            <TestWrapper>
                <RecommendationsSection />
            </TestWrapper>
        );

        await waitFor(() => {
            expect(screen.getByText("Big Mac")).toBeInTheDocument();
        });

        // Click refresh
        fireEvent.click(screen.getByText("Refresh suggestions"));

        await waitFor(() => {
            expect(mockedApi.getPersonalizedRecommendations).toHaveBeenCalledTimes(2);
        });
    });
});
