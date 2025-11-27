"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Lightbulb,
  Calendar,
  Utensils,
  Activity,
  Target,
  AlertCircle,
  CheckCircle,
  BarChart3,
  Star,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";
import { getOrderHistory, getOrderInsights, type Order, type OrderInsights } from "@/lib/api/order";
import { useAuth } from "@/context/AuthContext";
import ReviewModal from "@/components/ReviewModal";
import { getMyReviews } from "@/lib/api/review";

export default function OrderHistoryPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [insights, setInsights] = useState<OrderInsights | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingInsights, setIsLoadingInsights] = useState(true);
  const [timeRange, setTimeRange] = useState<'all' | 'week' | 'month' | 'year'>('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 0,
    limit: 20,
  });
  const [reviewModal, setReviewModal] = useState<{
    isOpen: boolean;
    orderId: string;
    foodItemId: string;
    itemName: string;
    restaurant: string;
  } | null>(null);
  const [userReviews, setUserReviews] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login?returnUrl=/orders");
      return;
    }

    loadOrders();
    loadInsights();
    loadUserReviews();
  }, [isAuthenticated, timeRange, page]);

  const loadUserReviews = async () => {
    try {
      const data = await getMyReviews(1, 100);
      const reviewSet = new Set(
        data.reviews.map((r) => `${r.orderId}-${r.foodItemId}`)
      );
      setUserReviews(reviewSet);
    } catch (error) {
      console.error("Failed to load user reviews:", error);
    }
  };

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      const data = await getOrderHistory(page, 20, timeRange);
      setOrders(data.orders);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Failed to load orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadInsights = async () => {
    try {
      setIsLoadingInsights(true);
      const data = await getOrderInsights(timeRange, 'month');
      setInsights(data);
    } catch (error) {
      console.error("Failed to load insights:", error);
    } finally {
      setIsLoadingInsights(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "var(--error)";
      case "medium":
        return "var(--orange)";
      case "low":
        return "var(--success)";
      default:
        return "var(--text)";
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-40 border-b backdrop-blur-sm"
        style={{
          borderColor: "color-mix(in srgb, var(--howl-neutral) 10%, transparent)",
          backgroundColor: "color-mix(in srgb, var(--bg) 95%, transparent)",
        }}
      >
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="p-2 transition-colors rounded-lg hover:bg-[var(--bg-hover)]"
              >
                <ArrowLeft className="h-5 w-5 text-[var(--text)]" />
              </Link>
              <h1 className="text-2xl font-bold text-[var(--text)]">Order History</h1>
            </div>
            <div className="flex items-center gap-2">
              {['all', 'week', 'month', 'year'].map((range) => (
                <button
                  key={range}
                  onClick={() => {
                    setTimeRange(range as typeof timeRange);
                    setPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    timeRange === range
                      ? "bg-[var(--orange)] text-[var(--bg)]"
                      : "bg-[var(--bg-hover)] text-[var(--text)] hover:bg-[var(--border)]"
                  }`}
                >
                  {range.charAt(0).toUpperCase() + range.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Insights */}
          <div className="lg:col-span-1 space-y-6">
            {/* Nutrition Patterns */}
            {isLoadingInsights ? (
              <div className="rounded-2xl p-6 border" style={{ borderColor: "var(--border)" }}>
                <div className="animate-pulse">Loading insights...</div>
              </div>
            ) : insights ? (
              <>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl p-6 border"
                  style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-card)" }}
                >
                  <h2 className="text-xl font-bold text-[var(--text)] mb-4 flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-[var(--orange)]" />
                    Nutrition Patterns
                  </h2>
                  {insights.patterns.totalOrders > 0 ? (
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-[var(--text-subtle)]">Avg Calories</span>
                          <span className="font-semibold text-[var(--text)]">
                            {insights.patterns.averageCalories}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-[var(--text-subtle)]">Avg Protein</span>
                          <span className="font-semibold text-[var(--text)]">
                            {insights.patterns.averageProtein}g
                          </span>
                        </div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-[var(--text-subtle)]">Avg Fat</span>
                          <span className="font-semibold text-[var(--text)]">
                            {insights.patterns.averageFat}g
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-[var(--text-subtle)]">Avg Carbs</span>
                          <span className="font-semibold text-[var(--text)]">
                            {insights.patterns.averageCarbs}g
                          </span>
                        </div>
                      </div>
                      <div className="pt-4 border-t" style={{ borderColor: "var(--border)" }}>
                        <p className="text-sm text-[var(--text-subtle)] mb-2">Top Restaurants</p>
                        {insights.patterns.mostOrderedRestaurants.slice(0, 3).map((rest, idx) => (
                          <div key={idx} className="flex justify-between text-sm mb-1">
                            <span className="text-[var(--text)]">{rest.name}</span>
                            <span className="text-[var(--text-subtle)]">{rest.count}x</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-[var(--text-subtle)]">No orders yet</p>
                  )}
                </motion.div>

                {/* Dietary Trends */}
                {insights.trends.trends.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="rounded-2xl p-6 border"
                    style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-card)" }}
                  >
                    <h2 className="text-xl font-bold text-[var(--text)] mb-4 flex items-center gap-2">
                      <Activity className="h-5 w-5 text-[var(--orange)]" />
                      Trends
                    </h2>
                    {insights.trends.insights.length > 0 ? (
                      <div className="space-y-2">
                        {insights.trends.insights.map((insight, idx) => (
                          <div
                            key={idx}
                            className={`p-3 rounded-lg flex items-start gap-2 ${
                              insight.type === "improvement"
                                ? "bg-green-500/10"
                                : "bg-orange-500/10"
                            }`}
                          >
                            {insight.type === "improvement" ? (
                              <TrendingDown className="h-4 w-4 text-green-500 mt-0.5" />
                            ) : (
                              <TrendingUp className="h-4 w-4 text-orange-500 mt-0.5" />
                            )}
                            <p className="text-sm text-[var(--text)]">{insight.message}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-[var(--text-subtle)]">No trend insights yet</p>
                    )}
                  </motion.div>
                )}

                {/* Recommendations */}
                {insights.recommendations.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="rounded-2xl p-6 border"
                    style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-card)" }}
                  >
                    <h2 className="text-xl font-bold text-[var(--text)] mb-4 flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-[var(--orange)]" />
                      Recommendations
                    </h2>
                    <div className="space-y-3">
                      {insights.recommendations.map((rec, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-lg border"
                          style={{
                            borderColor: getPriorityColor(rec.priority),
                            backgroundColor: "var(--bg-hover)",
                          }}
                        >
                          <div className="flex items-start gap-2 mb-2">
                            {rec.priority === "high" ? (
                              <AlertCircle className="h-4 w-4 mt-0.5" style={{ color: getPriorityColor(rec.priority) }} />
                            ) : (
                              <CheckCircle className="h-4 w-4 mt-0.5" style={{ color: getPriorityColor(rec.priority) }} />
                            )}
                            <p className="text-sm font-medium text-[var(--text)] flex-1">
                              {rec.message}
                            </p>
                          </div>
                          <p className="text-xs text-[var(--text-subtle)] ml-6">
                            💡 {rec.suggestion}
                          </p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </>
            ) : null}
          </div>

          {/* Right Column - Order List */}
          <div className="lg:col-span-2">
            {isLoading ? (
              <div className="rounded-2xl p-6 border" style={{ borderColor: "var(--border)" }}>
                <div className="animate-pulse">Loading orders...</div>
              </div>
            ) : orders.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl p-12 border text-center"
                style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-card)" }}
              >
                <Utensils className="h-16 w-16 mx-auto mb-4 text-[var(--text-subtle)]" />
                <h3 className="text-xl font-bold text-[var(--text)] mb-2">No orders yet</h3>
                <p className="text-[var(--text-subtle)] mb-6">
                  Start ordering to see your history and insights here!
                </p>
                <Link
                  href="/"
                  className="inline-block px-6 py-3 rounded-lg font-semibold bg-[var(--orange)] text-[var(--bg)] hover:bg-[var(--cream)] transition-colors"
                >
                  Start Shopping
                </Link>
              </motion.div>
            ) : (
              <div className="space-y-4">
                {orders.map((order, idx) => (
                  <motion.div
                    key={order._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="rounded-2xl p-6 border"
                    style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-card)" }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-[var(--text)]">
                          {order.orderNumber}
                        </h3>
                        <p className="text-sm text-[var(--text-subtle)]">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-[var(--orange)]">
                          ${order.total.toFixed(2)}
                        </p>
                        <p className="text-xs text-[var(--text-subtle)]">
                          {order.totalItems} {order.totalItems === 1 ? "item" : "items"}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      {order.items.map((item, itemIdx) => {
                        const foodItemId = typeof item.foodItem === 'object' && item.foodItem?._id 
                          ? item.foodItem._id 
                          : typeof item.foodItem === 'string' 
                          ? item.foodItem 
                          : null;
                        const hasReviewed = foodItemId 
                          ? userReviews.has(`${order._id}-${foodItemId}`)
                          : false;
                        
                        return (
                          <div
                            key={itemIdx}
                            className="flex items-center justify-between text-sm p-2 rounded-lg hover:bg-[var(--bg-hover)] transition-colors"
                          >
                            <div className="flex-1">
                              <span className="text-[var(--text)]">
                                {item.quantity}x {item.item}
                              </span>
                              <span className="text-[var(--text-subtle)] ml-2">
                                {item.restaurant}
                              </span>
                            </div>
                            {foodItemId && !hasReviewed && (
                              <button
                                onClick={() => setReviewModal({
                                  isOpen: true,
                                  orderId: order._id,
                                  foodItemId,
                                  itemName: item.item,
                                  restaurant: item.restaurant,
                                })}
                                className="ml-2 px-3 py-1 rounded-lg text-xs font-medium bg-[var(--orange)]/10 text-[var(--orange)] hover:bg-[var(--orange)]/20 transition-colors flex items-center gap-1"
                              >
                                <Star size={12} />
                                Review
                              </button>
                            )}
                            {hasReviewed && (
                              <span className="ml-2 px-3 py-1 rounded-lg text-xs font-medium bg-green-500/10 text-green-500 flex items-center gap-1">
                                <CheckCircle size={12} />
                                Reviewed
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="pt-4 border-t flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
                      <div className="flex items-center gap-4 text-xs text-[var(--text-subtle)]">
                        <span>🔥 {order.nutrition.totalCalories} cal</span>
                        <span>💪 {order.nutrition.totalProtein}g protein</span>
                        <span>🍔 {order.nutrition.totalFat}g fat</span>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          order.status === "completed"
                            ? "bg-green-500/20 text-green-500"
                            : order.status === "pending"
                            ? "bg-orange-500/20 text-orange-500"
                            : "bg-red-500/20 text-red-500"
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </motion.div>
                ))}

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-6">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ borderColor: "var(--border)" }}
                    >
                      Previous
                    </button>
                    <span className="text-sm text-[var(--text-subtle)]">
                      Page {page} of {pagination.pages}
                    </span>
                    <button
                      onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                      disabled={page === pagination.pages}
                      className="px-4 py-2 rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ borderColor: "var(--border)" }}
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {reviewModal && (
        <ReviewModal
          isOpen={reviewModal.isOpen}
          onClose={() => {
            setReviewModal(null);
            loadUserReviews(); // Reload reviews after closing
          }}
          orderId={reviewModal.orderId}
          foodItemId={reviewModal.foodItemId}
          itemName={reviewModal.itemName}
          restaurant={reviewModal.restaurant}
          onReviewCreated={() => {
            loadUserReviews();
          }}
        />
      )}
    </div>
  );
}

