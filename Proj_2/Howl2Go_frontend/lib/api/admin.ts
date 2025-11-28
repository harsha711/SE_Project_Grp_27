import { apiFetch } from "../api";

export interface RestaurantAnalytics {
  restaurant: string;
  totalRevenue: number;
  orderCount: number;
  totalItems: number;
  totalCalories: number;
  totalProtein: number;
  totalFat: number;
  totalCarbs: number;
  averageOrderValue: number;
  averageCaloriesPerOrder: number;
  averageProteinPerOrder: number;
  popularItems: Array<{
    name: string;
    quantity: number;
    revenue: number;
    calories: number;
    protein: number;
    averagePrice: number;
  }>;
}

export interface PlatformAnalytics {
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  averageOrderValue: number;
  totalCalories: number;
  totalProtein: number;
  totalFat: number;
  totalCarbs: number;
  averageCaloriesPerOrder: number;
  averageProteinPerOrder: number;
}

export interface OrderTrend {
  date: string;
  revenue: number;
  orderCount: number;
  averageOrderValue: number;
  totalCalories: number;
  totalProtein: number;
}

export interface AdminDashboardData {
  platform: PlatformAnalytics;
  restaurants: RestaurantAnalytics[];
  trends: OrderTrend[];
  topByRevenue: RestaurantAnalytics[];
  topByOrders: RestaurantAnalytics[];
  timeRange: string;
}

export async function getAdminDashboard(
  timeRange: string = 'all'
): Promise<AdminDashboardData> {
  try {
    const response = await apiFetch(
      `/api/admin/analytics/dashboard?timeRange=${timeRange}`,
      {
        method: "GET",
        credentials: "include",
      }
    );

    if (!response.ok) {
      let errorMessage = `Failed to fetch admin dashboard: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        // If response is not JSON, use default message
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Failed to fetch admin dashboard");
    }

    return data.data;
  } catch (error) {
    console.error("Error fetching admin dashboard:", error);
    throw error;
  }
}

export async function getRestaurantAnalytics(
  timeRange: string = 'all'
): Promise<RestaurantAnalytics[]> {
  try {
    const response = await apiFetch(
      `/api/admin/analytics/restaurants?timeRange=${timeRange}`,
      {
        method: "GET",
        credentials: "include",
      }
    );

    if (!response.ok) {
      let errorMessage = `Failed to fetch restaurant analytics: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        // If response is not JSON, use default message
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Failed to fetch restaurant analytics");
    }

    return data.data.restaurants;
  } catch (error) {
    console.error("Error fetching restaurant analytics:", error);
    throw error;
  }
}

export async function getPlatformAnalytics(
  timeRange: string = 'all'
): Promise<PlatformAnalytics> {
  try {
    const response = await apiFetch(
      `/api/admin/analytics/platform?timeRange=${timeRange}`,
      {
        method: "GET",
        credentials: "include",
      }
    );

    if (!response.ok) {
      let errorMessage = `Failed to fetch platform analytics: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        // If response is not JSON, use default message
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Failed to fetch platform analytics");
    }

    return data.data.platform;
  } catch (error) {
    console.error("Error fetching platform analytics:", error);
    throw error;
  }
}

export async function getOrderTrends(
  timeRange: string = 'month',
  groupBy: string = 'day'
): Promise<OrderTrend[]> {
  try {
    const response = await apiFetch(
      `/api/admin/analytics/trends?timeRange=${timeRange}&groupBy=${groupBy}`,
      {
        method: "GET",
        credentials: "include",
      }
    );

    if (!response.ok) {
      let errorMessage = `Failed to fetch order trends: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        // If response is not JSON, use default message
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Failed to fetch order trends");
    }

    return data.data.trends;
  } catch (error) {
    console.error("Error fetching order trends:", error);
    throw error;
  }
}

