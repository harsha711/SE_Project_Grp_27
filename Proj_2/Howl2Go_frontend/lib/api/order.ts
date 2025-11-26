import { apiFetch } from "../api";

// Order types
export interface OrderItem {
  foodItem: {
    _id: string;
    company: string;
    item: string;
    [key: string]: any;
  } | string;
  restaurant: string;
  item: string;
  calories: number;
  totalFat?: number;
  saturatedFat?: number;
  transFat?: number;
  protein?: number;
  carbohydrates?: number;
  fiber?: number;
  sugars?: number;
  sodium?: number;
  cholesterol?: number;
  price: number;
  quantity: number;
}

export interface OrderNutrition {
  totalCalories: number;
  totalFat: number;
  totalSaturatedFat: number;
  totalTransFat: number;
  totalProtein: number;
  totalCarbohydrates: number;
  totalFiber: number;
  totalSugars: number;
  totalSodium: number;
  totalCholesterol: number;
}

export interface Order {
  _id: string;
  orderNumber: string;
  userId: string;
  items: OrderItem[];
  nutrition: OrderNutrition;
  subtotal: number;
  tax: number;
  deliveryFee: number;
  total: number;
  totalItems: number;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface OrderHistoryResponse {
  success: boolean;
  data: {
    orders: Order[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  };
}

export interface OrderInsights {
  patterns: {
    averageCalories: number;
    averageProtein: number;
    averageFat: number;
    averageCarbs: number;
    mostOrderedRestaurants: Array<{ name: string; count: number }>;
    mostOrderedItems: Array<{ name: string; count: number }>;
    nutritionDistribution: {
      calories: {
        low: number;
        medium: number;
        high: number;
      };
      protein: {
        low: number;
        medium: number;
        high: number;
      };
    };
    totalOrders: number;
  };
  trends: {
    trends: Array<{
      date: string;
      calories: number;
      protein: number;
      fat: number;
      carbs: number;
      orderCount: number;
    }>;
    insights: Array<{
      type: 'improvement' | 'warning';
      message: string;
      metric: string;
    }>;
    period: string;
  };
  recommendations: Array<{
    type: string;
    priority: 'high' | 'medium' | 'low';
    message: string;
    suggestion: string;
  }>;
}

/**
 * Create order from current cart
 */
export async function createOrder(): Promise<Order> {
  try {
    const response = await apiFetch("/api/orders", {
      method: "POST",
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to create order: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Failed to create order");
    }

    return data.data.order;
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
}

/**
 * Get order history
 */
export async function getOrderHistory(
  page: number = 1,
  limit: number = 20,
  timeRange: 'all' | 'week' | 'month' | 'year' = 'all'
): Promise<OrderHistoryResponse['data']> {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      timeRange,
    });

    const response = await apiFetch(`/api/orders?${params.toString()}`, {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to fetch orders: ${response.status}`);
    }

    const data: OrderHistoryResponse = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Failed to fetch order history");
    }

    return data.data;
  } catch (error) {
    console.error("Error fetching order history:", error);
    throw error;
  }
}

/**
 * Get order by ID
 */
export async function getOrderById(orderId: string): Promise<Order> {
  try {
    const response = await apiFetch(`/api/orders/${orderId}`, {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to fetch order: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Failed to fetch order");
    }

    return data.data.order;
  } catch (error) {
    console.error("Error fetching order:", error);
    throw error;
  }
}

/**
 * Get order insights and analytics
 */
export async function getOrderInsights(
  timeRange: 'all' | 'week' | 'month' | 'year' = 'all',
  period: 'week' | 'month' | 'year' = 'month'
): Promise<OrderInsights> {
  try {
    const params = new URLSearchParams({
      timeRange,
      period,
    });

    const response = await apiFetch(`/api/orders/insights?${params.toString()}`, {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to fetch insights: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Failed to fetch order insights");
    }

    return {
      patterns: data.data.patterns,
      trends: data.data.trends,
      recommendations: data.data.recommendations,
    };
  } catch (error) {
    console.error("Error fetching order insights:", error);
    throw error;
  }
}

