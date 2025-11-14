"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { RefreshCw, XCircle } from "lucide-react";

/**
 * Staff Orders Page
 * - Fetches all orders via `/api/orders` (admin/staff endpoint) using the proxy
 * - Shows only orders with status pending, in_progress, or ready
 * - Allows staff to change an order's status among the allowed set
 */

type OrderItem = {
  item?: string;
  restaurant?: string;
  price?: number;
  quantity?: number;
};
type Order = {
  _id: string;
  orderNumber?: number;
  items: OrderItem[];
  totalItems: number;
  totalPrice: number;
  status: string;
  createdAt: string;
};

export default function StaffOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>(
    {}
  );

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    setLoading(true);
    try {
      const resp = await fetch(
        `/api/proxy?path=${encodeURIComponent("/api/orders")}`
      );
      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.message || "Failed to load orders");
      // Filter out orders that are complete or cancelled
      const visible = data.data.orders.filter((o: Order) =>
        ["pending", "in_progress", "ready"].includes(o.status)
      );
      setOrders(visible);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id: string, status: string) {
    setUpdatingId(id);
    try {
      const resp = await fetch(
        `/api/proxy?path=${encodeURIComponent(`/api/orders/${id}/status`)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        }
      );
      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.message || "Failed to update status");
      await fetchOrders();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(msg || "Error");
    } finally {
      setUpdatingId(null);
    }
  }

  const toggleExpanded = (orderId: string) => {
    setExpandedOrders((prev) => ({ ...prev, [orderId]: !prev[orderId] }));
  };

  function statusLabel(s: string) {
    switch (s) {
      case "pending":
        return "Pending";
      case "in_progress":
        return "In Progress";
      case "ready":
        return "Ready";
      case "complete":
        return "Complete";
      case "cancelled":
        return "Cancelled";
      default:
        return s;
    }
  }

  function statusColorBg(status: string) {
    switch (status) {
      case "pending":
        return "color-mix(in srgb, var(--orange) 12%, transparent)";
      case "in_progress":
        return "color-mix(in srgb, var(--warning) 12%, transparent)";
      case "ready":
        return "color-mix(in srgb, var(--success) 12%, transparent)";
      case "complete":
        return "color-mix(in srgb, var(--success) 18%, transparent)";
      case "cancelled":
        return "color-mix(in srgb, var(--error) 12%, transparent)";
      default:
        return "color-mix(in srgb, var(--bg) 10%, transparent)";
    }
  }

  function statusColorText(status: string) {
    switch (status) {
      case "pending":
        return "var(--orange)";
      case "in_progress":
        return "var(--warning)";
      case "ready":
        return "var(--success)";
      case "complete":
        return "var(--success)";
      case "cancelled":
        return "var(--error)";
      default:
        return "var(--text)";
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] p-8 text-[var(--text)]">
      <div className="max-w-7xl mx-auto">
        <Header />

        <header className="mb-6 pt-16">
          <h1 className="text-3xl font-bold text-center">Manage Orders</h1>
          <p className="text-sm text-center text-[var(--text-subtle)]">
            Manage active orders (pending, in progress, ready).
          </p>
        </header>

        {loading && (
          <div className="text-center py-8 text-[var(--text-subtle)]">
            Loading orders...
          </div>
        )}
        {error && <div className="text-[var(--error)]">{error}</div>}

        <div className="grid gap-6">
          {orders.map((o) => (
            <article
              key={o._id}
              className="rounded-2xl border p-4 bg-[var(--bg-card)]"
              style={{ borderColor: "var(--border)" }}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm text-[var(--text-subtle)]">
                    {new Date(o.createdAt).toLocaleString()}
                  </div>
                  <div className="font-semibold text-lg">
                    {o.orderNumber
                      ? `#${o.orderNumber}`
                      : `#${o._id.slice(-6)}`}
                  </div>
                </div>

                <div className="flex-1">
                  <div className="mb-2 text-[var(--text)] font-medium">
                    {o.items.length === 0
                      ? "No items"
                      : expandedOrders[o._id]
                      ? o.items
                          .map((it) => it.item)
                          .filter(Boolean)
                          .join(", ")
                      : o.items
                          .slice(0, 3)
                          .map((it) => it.item)
                          .filter(Boolean)
                          .join(", ")}
                  </div>

                  {o.items.length > 3 && (
                    <div className="mb-2">
                      {!expandedOrders[o._id] ? (
                        <button
                          onClick={() => toggleExpanded(o._id)}
                          className="text-sm text-[var(--text-subtle)] underline cursor-pointer"
                        >
                          +{o.items.length - 3} more items
                        </button>
                      ) : (
                        <button
                          onClick={() => toggleExpanded(o._id)}
                          className="text-sm text-[var(--text-subtle)] underline cursor-pointer"
                        >
                          Show less
                        </button>
                      )}
                    </div>
                  )}

                  <div className="text-sm text-[var(--text-subtle)]">
                    {o.totalItems} {o.totalItems === 1 ? "item" : "items"} • $
                    {(o.totalPrice || 0).toFixed(2)}
                  </div>
                </div>

                <div className="text-right">
                  <div className="mb-2 font-bold text-xl text-[var(--cream)]">
                    ${(o.totalPrice || 0).toFixed(2)}
                  </div>
                  <div>
                    <span
                      className="inline-block px-3 py-1 rounded-full text-sm"
                      style={{
                        backgroundColor: statusColorBg(o.status),
                        color: statusColorText(o.status),
                      }}
                    >
                      {statusLabel(o.status)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <select
                    defaultValue={o.status}
                    onChange={(e) => updateStatus(o._id, e.target.value)}
                    className="p-2 border rounded  bg-[var(--bg-card)] text-[var(--text)]"
                  >
                    <option value="pending">pending</option>
                    <option value="in_progress">in_progress</option>
                    <option value="ready">ready</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <button
                    className="px-3 py-1 bg-[var(--error)] text-white rounded flex items-center gap-2 cursor-pointer"
                    onClick={() => updateStatus(o._id, "cancelled")}
                    disabled={updatingId === o._id}
                  >
                    {updatingId === o._id ? (
                      <RefreshCw className="animate-spin h-4 w-4" />
                    ) : (
                      <XCircle className="h-4 w-4" />
                    )}
                    <span>
                      {updatingId === o._id ? "Updating..." : "Cancel"}
                    </span>
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
