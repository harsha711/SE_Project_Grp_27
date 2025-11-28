"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Users,
  Calendar,
  BarChart3,
  Store,
  Target,
  Zap,
  Filter,
  Bug,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { getAdminDashboard, type AdminDashboardData, type RestaurantAnalytics } from "@/lib/api/admin";
import LoadingSpinner from "@/components/LoadingSpinner";
import toast from "react-hot-toast";

const TIME_RANGES = [
  { value: "all", label: "All Time" },
  { value: "year", label: "Last Year" },
  { value: "month", label: "Last Month" },
  { value: "week", label: "Last Week" },
  { value: "today", label: "Today" },
];

export default function AdminAnalyticsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<string>("all");
  const [selectedRestaurant, setSelectedRestaurant] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthLoading) {
      if (!isAuthenticated) {
        router.push("/login?returnUrl=/admin/analytics");
        return;
      }
      if (user?.role !== "admin") {
        toast.error("Admin access required");
        router.push("/");
        return;
      }
      loadDashboard();
    }
  }, [isAuthenticated, isAuthLoading, user, timeRange]);

  const loadDashboard = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const dashboardData = await getAdminDashboard(timeRange);
      setData(dashboardData);
    } catch (err: any) {
      console.error("Failed to load dashboard:", err);
      setError(err.message || "Failed to load analytics dashboard");
      toast.error("Failed to load analytics dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US").format(num);
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <LoadingSpinner message="Loading..." size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Header */}
      <div
        className="border-b sticky top-0 z-40 backdrop-blur-sm"
        style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-card)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <Link
                href="/admin/bugs"
                className="p-2 rounded-lg transition-colors hover:bg-[var(--bg-hover)]"
              >
                <ArrowLeft className="h-5 w-5 text-[var(--text)]" />
              </Link>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[var(--orange)]/10">
                  <BarChart3 className="h-6 w-6 text-[var(--orange)]" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-[var(--text)]">Analytics Dashboard</h1>
                  <p className="text-sm text-[var(--text-subtle)]">Restaurant Performance & Revenue Insights</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/admin/bugs"
                className="px-4 py-2 rounded-lg border transition-colors flex items-center gap-2"
                style={{
                  borderColor: "var(--border)",
                  color: "var(--text)",
                  backgroundColor: "var(--bg-hover)",
                }}
              >
                <Bug className="h-4 w-4" />
                Bug Reports
              </Link>
              <Filter className="h-4 w-4 text-[var(--text-subtle)]" />
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-[var(--orange)]/50 transition-all"
                style={{
                  backgroundColor: "var(--bg-hover)",
                  borderColor: "var(--border)",
                  color: "var(--text)",
                }}
              >
                {TIME_RANGES.map((range) => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="rounded-2xl p-6 border" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-card)" }}>
            <LoadingSpinner message="Loading analytics data..." size="md" />
          </div>
        ) : error ? (
          <div className="rounded-2xl p-6 border text-center" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-card)" }}>
            <p className="text-[var(--text)] font-medium mb-2">Error Loading Analytics</p>
            <p className="text-[var(--text-subtle)] text-sm mb-4">{error}</p>
            <button
              onClick={loadDashboard}
              className="px-4 py-2 rounded-lg bg-[var(--orange)] text-[var(--bg)] hover:bg-[var(--cream)] transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : data ? (
          <div className="space-y-6">
            {/* Platform Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl p-6 border"
                style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-card)" }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-lg bg-green-500/10">
                    <DollarSign className="h-5 w-5 text-green-500" />
                  </div>
                </div>
                <p className="text-sm text-[var(--text-subtle)] mb-1">Total Revenue</p>
                <p className="text-2xl font-bold text-[var(--text)]">{formatCurrency(data.platform.totalRevenue)}</p>
                <p className="text-xs text-[var(--text-subtle)] mt-2">{data.platform.totalOrders} orders</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-xl p-6 border"
                style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-card)" }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-lg bg-blue-500/10">
                    <ShoppingCart className="h-5 w-5 text-blue-500" />
                  </div>
                </div>
                <p className="text-sm text-[var(--text-subtle)] mb-1">Total Orders</p>
                <p className="text-2xl font-bold text-[var(--text)]">{formatNumber(data.platform.totalOrders)}</p>
                <p className="text-xs text-[var(--text-subtle)] mt-2">Avg: {formatCurrency(data.platform.averageOrderValue)}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-xl p-6 border"
                style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-card)" }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-lg bg-purple-500/10">
                    <Users className="h-5 w-5 text-purple-500" />
                  </div>
                </div>
                <p className="text-sm text-[var(--text-subtle)] mb-1">Active Users</p>
                <p className="text-2xl font-bold text-[var(--text)]">{formatNumber(data.platform.totalUsers)}</p>
                <p className="text-xs text-[var(--text-subtle)] mt-2">Customers</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="rounded-xl p-6 border"
                style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-card)" }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-lg bg-orange-500/10">
                    <Zap className="h-5 w-5 text-orange-500" />
                  </div>
                </div>
                <p className="text-sm text-[var(--text-subtle)] mb-1">Avg Calories/Order</p>
                <p className="text-2xl font-bold text-[var(--text)]">{formatNumber(data.platform.averageCaloriesPerOrder)}</p>
                <p className="text-xs text-[var(--text-subtle)] mt-2">{formatNumber(data.platform.averageProteinPerOrder)}g protein</p>
              </motion.div>
            </div>

            {/* Top Restaurants */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top by Revenue */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl p-6 border"
                style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-card)" }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="h-5 w-5 text-[var(--orange)]" />
                  <h2 className="text-lg font-bold text-[var(--text)]">Top Restaurants by Revenue</h2>
                </div>
                <div className="space-y-3">
                  {data.topByRevenue.length > 0 ? (
                    data.topByRevenue.map((restaurant, idx) => (
                      <div
                        key={restaurant.restaurant}
                        className="flex items-center justify-between p-3 rounded-lg"
                        style={{ backgroundColor: "var(--bg-hover)" }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[var(--orange)]/20 flex items-center justify-center text-sm font-bold text-[var(--orange)]">
                            {idx + 1}
                          </div>
                          <div>
                            <p className="font-semibold text-[var(--text)]">{restaurant.restaurant}</p>
                            <p className="text-xs text-[var(--text-subtle)]">{restaurant.orderCount} orders</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-[var(--text)]">{formatCurrency(restaurant.totalRevenue)}</p>
                          <p className="text-xs text-[var(--text-subtle)]">Avg: {formatCurrency(restaurant.averageOrderValue)}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-[var(--text-subtle)] text-center py-4">No data available</p>
                  )}
                </div>
              </motion.div>

              {/* Top by Orders */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-xl p-6 border"
                style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-card)" }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <ShoppingCart className="h-5 w-5 text-[var(--orange)]" />
                  <h2 className="text-lg font-bold text-[var(--text)]">Top Restaurants by Orders</h2>
                </div>
                <div className="space-y-3">
                  {data.topByOrders.length > 0 ? (
                    data.topByOrders.map((restaurant, idx) => (
                      <div
                        key={restaurant.restaurant}
                        className="flex items-center justify-between p-3 rounded-lg"
                        style={{ backgroundColor: "var(--bg-hover)" }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[var(--orange)]/20 flex items-center justify-center text-sm font-bold text-[var(--orange)]">
                            {idx + 1}
                          </div>
                          <div>
                            <p className="font-semibold text-[var(--text)]">{restaurant.restaurant}</p>
                            <p className="text-xs text-[var(--text-subtle)]">{formatCurrency(restaurant.totalRevenue)} revenue</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-[var(--text)]">{restaurant.orderCount}</p>
                          <p className="text-xs text-[var(--text-subtle)]">orders</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-[var(--text-subtle)] text-center py-4">No data available</p>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Restaurant Performance Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-xl p-6 border overflow-hidden"
              style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-card)" }}
            >
              <div className="flex items-center gap-2 mb-6">
                <Store className="h-5 w-5 text-[var(--orange)]" />
                <h2 className="text-lg font-bold text-[var(--text)]">Restaurant Performance</h2>
                <span className="text-sm text-[var(--text-subtle)] ml-auto">
                  {data.restaurants.length} restaurants
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b" style={{ borderColor: "var(--border)" }}>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-[var(--text-subtle)]">Restaurant</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-[var(--text-subtle)]">Revenue</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-[var(--text-subtle)]">Orders</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-[var(--text-subtle)]">Items</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-[var(--text-subtle)]">Avg Order</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-[var(--text-subtle)]">Calories</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-[var(--text-subtle)]">Protein</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.restaurants.length > 0 ? (
                      data.restaurants.map((restaurant, idx) => (
                        <motion.tr
                          key={restaurant.restaurant}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="border-b hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
                          style={{ borderColor: "var(--border)" }}
                          onClick={() => setSelectedRestaurant(selectedRestaurant === restaurant.restaurant ? null : restaurant.restaurant)}
                        >
                          <td className="py-4 px-4">
                            <div className="font-semibold text-[var(--text)]">{restaurant.restaurant}</div>
                            {selectedRestaurant === restaurant.restaurant && restaurant.popularItems.length > 0 && (
                              <div className="mt-2 pt-2 border-t" style={{ borderColor: "var(--border)" }}>
                                <p className="text-xs font-medium text-[var(--text-subtle)] mb-2">Popular Items:</p>
                                <div className="space-y-1">
                                  {restaurant.popularItems.slice(0, 5).map((item) => (
                                    <div key={item.name} className="text-xs text-[var(--text)]">
                                      • {item.name} ({item.quantity}x) - {formatCurrency(item.revenue)}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </td>
                          <td className="text-right py-4 px-4 font-bold text-[var(--text)]">
                            {formatCurrency(restaurant.totalRevenue)}
                          </td>
                          <td className="text-right py-4 px-4 text-[var(--text)]">{restaurant.orderCount}</td>
                          <td className="text-right py-4 px-4 text-[var(--text)]">{restaurant.totalItems}</td>
                          <td className="text-right py-4 px-4 text-[var(--text)]">
                            {formatCurrency(restaurant.averageOrderValue)}
                          </td>
                          <td className="text-right py-4 px-4 text-[var(--text)]">
                            {formatNumber(restaurant.averageCaloriesPerOrder)}/order
                          </td>
                          <td className="text-right py-4 px-4 text-[var(--text)]">
                            {formatNumber(restaurant.averageProteinPerOrder)}g/order
                          </td>
                        </motion.tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-[var(--text-subtle)]">
                          No restaurant data available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>

            {/* Order Trends Chart */}
            {data.trends.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="rounded-xl p-6 border"
                style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-card)" }}
              >
                <div className="flex items-center gap-2 mb-6">
                  <Calendar className="h-5 w-5 text-[var(--orange)]" />
                  <h2 className="text-lg font-bold text-[var(--text)]">Order Trends</h2>
                </div>
                <div className="space-y-4">
                  {data.trends.slice(-10).map((trend, idx) => (
                    <div key={trend.date} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[var(--text-subtle)]">{trend.date}</span>
                        <div className="flex items-center gap-4 text-xs">
                          <span className="text-[var(--text)]">{trend.orderCount} orders</span>
                          <span className="text-[var(--orange)] font-semibold">{formatCurrency(trend.revenue)}</span>
                        </div>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "var(--bg-hover)" }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(trend.revenue / Math.max(...data.trends.map(t => t.revenue))) * 100}%` }}
                          transition={{ delay: idx * 0.1, duration: 0.5 }}
                          className="h-full bg-gradient-to-r from-[var(--orange)] to-[var(--cream)]"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}

