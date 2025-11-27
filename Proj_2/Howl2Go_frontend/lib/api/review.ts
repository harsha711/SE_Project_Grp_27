import { apiFetch } from "../api";

export interface Review {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  orderId: string;
  foodItemId: string;
  restaurant: string;
  itemName: string;
  rating: number;
  comment?: string;
  helpful: number;
  helpfulUsers: string[];
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export interface ReviewResponse {
  success: boolean;
  data: {
    reviews: Review[];
    stats: ReviewStats;
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  };
}

/**
 * Create a review for a food item
 */
export async function createReview(
  orderId: string,
  foodItemId: string,
  rating: number,
  comment?: string
): Promise<Review> {
  try {
    const response = await apiFetch("/api/reviews", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        orderId,
        foodItemId,
        rating,
        comment: comment || "",
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to create review: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Failed to create review");
    }

    return data.data.review;
  } catch (error) {
    console.error("Error creating review:", error);
    throw error;
  }
}

/**
 * Get reviews for a food item
 */
export async function getItemReviews(
  foodItemId: string,
  page: number = 1,
  limit: number = 10,
  sort: 'recent' | 'oldest' | 'highest' | 'lowest' | 'helpful' = 'recent'
): Promise<ReviewResponse['data']> {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sort,
    });

    const response = await apiFetch(`/api/reviews/item/${foodItemId}?${params.toString()}`, {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to fetch reviews: ${response.status}`);
    }

    const data: ReviewResponse = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Failed to fetch reviews");
    }

    return data.data;
  } catch (error) {
    console.error("Error fetching reviews:", error);
    throw error;
  }
}

/**
 * Get current user's reviews
 */
export async function getMyReviews(page: number = 1, limit: number = 20): Promise<{
  reviews: Review[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}> {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    const response = await apiFetch(`/api/reviews/my-reviews?${params.toString()}`, {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to fetch reviews: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Failed to fetch reviews");
    }

    return data.data;
  } catch (error) {
    console.error("Error fetching my reviews:", error);
    throw error;
  }
}

/**
 * Update a review
 */
export async function updateReview(
  reviewId: string,
  rating?: number,
  comment?: string
): Promise<Review> {
  try {
    const body: any = {};
    if (rating !== undefined) body.rating = rating;
    if (comment !== undefined) body.comment = comment;

    const response = await apiFetch(`/api/reviews/${reviewId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to update review: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Failed to update review");
    }

    return data.data.review;
  } catch (error) {
    console.error("Error updating review:", error);
    throw error;
  }
}

/**
 * Delete a review
 */
export async function deleteReview(reviewId: string): Promise<void> {
  try {
    const response = await apiFetch(`/api/reviews/${reviewId}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to delete review: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Failed to delete review");
    }
  } catch (error) {
    console.error("Error deleting review:", error);
    throw error;
  }
}

/**
 * Mark a review as helpful
 */
export async function markReviewHelpful(reviewId: string): Promise<number> {
  try {
    const response = await apiFetch(`/api/reviews/${reviewId}/helpful`, {
      method: "POST",
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to mark review as helpful: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Failed to mark review as helpful");
    }

    return data.data.helpful;
  } catch (error) {
    console.error("Error marking review as helpful:", error);
    throw error;
  }
}

