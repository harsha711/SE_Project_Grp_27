/**
 * Orders page (client): displays the authenticated user's order history.
 *
 * This page calls the frontend proxy `/api/proxy?path=/api/orders/me` to fetch
 * the current user's orders (the proxy attaches the httpOnly access token),
 * and renders a responsive grid of order cards with status badges and summaries.
 *
 * @author Ahmed Hassan
 */
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import Header from "@/components/Header";

type OrderItem = {
  foodItem: any;
  restaurant?: string;
  item?: string;
  price?: number;
  quantity?: number;
};

type Order = {
  _id: string;
  orderNumber?: string;
  items: OrderItem[];
  totalItems: number;
  totalPrice: number;
  status: string;
  createdAt: string;
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>(
    {}
  );
  const { user } = useAuth();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const resp = await fetch(
          `/api/proxy?path=${encodeURIComponent("/api/orders/me")}`,
          { method: "GET" }
        );
        const data = await resp.json();
        if (!resp.ok) {
          setLoading(false);
          return;
        }

        setOrders(data?.data?.orders || []);
        setLoading(false);
      } catch (err: any) {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const markPickedUp = async (orderId: string) => {
    try {
      const resp = await fetch(
        `/api/proxy?path=${encodeURIComponent(
          `/api/orders/${orderId}/pickup`
        )}`,
        { method: "PATCH" }
      );
      if (!resp.ok) {
        const data = await resp.json();
        throw new Error(data?.message || "Failed to mark picked up");
      }
      // refresh
      const resp2 = await fetch(
        `/api/proxy?path=${encodeURIComponent("/api/orders/me")}`
      );
      const data2 = await resp2.json();
      setOrders(data2?.data?.orders || []);
    } catch (err: any) {
      alert(err.message || "Error marking picked up");
    }
  };

  const toggleExpanded = (orderId: string) => {
    setExpandedOrders((prev) => ({ ...prev, [orderId]: !prev[orderId] }));
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg)" }}>
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-24">
        <div className="mb-6">
          <h1
            className="text-3xl font-bold text-center "
            style={{ color: "var(--text)" }}
          >
            Order History
          </h1>
          <p
            className="text-sm text-center "
            style={{ color: "var(--text-subtle)" }}
          >
            View your past orders and statuses.
          </p>
        </div>

        {loading && (
          <p className="text-center " style={{ color: "var(--text-subtle)" }}>
            Loading orders...
          </p>
        )}

        {!loading && orders.length === 0 && (
          <div className="text-center py-20">
            <h2
              style={{ color: "var(--text)" }}
              className="text-xl font-semibold mb-2"
            >
              No orders yet
            </h2>
            <p style={{ color: "var(--text-subtle)" }}>
              Place an order to see it here.
            </p>
            <div className="mt-6">
              <Link
                href="/"
                className="px-6 py-3 rounded-full font-semibold"
                style={{
                  backgroundColor: "var(--orange)",
                  color: "var(--text)",
                }}
              >
                Browse Menu
              </Link>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-center items-stretch">
          {orders.map((o) => (
            <article
              key={o._id}
              className="rounded-2xl border p-4 transform transition-shadow duration-200 hover:shadow-xl hover:-translate-y-1"
              style={{
                backgroundColor: "var(--bg-card)",
                borderColor: "var(--border)",
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div
                    className="text-sm"
                    style={{ color: "var(--text-subtle)" }}
                  >
                    {new Date(o.createdAt).toLocaleString()}
                  </div>
                  <div
                    className="font-semibold text-lg"
                    style={{ color: "var(--text)" }}
                  >
                    {o.orderNumber || `#${o._id.slice(-6)}`}
                  </div>
                </div>

                <div className="text-right">
                  <div
                    className="font-bold text-xl"
                    style={{ color: "var(--cream)" }}
                  >
                    ${(o.totalPrice || 0).toFixed(2)}
                  </div>
                  <div style={{ color: "var(--text-subtle)" }}>
                    {o.totalItems} {o.totalItems === 1 ? "item" : "items"}
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm`}
                  style={{
                    backgroundColor: statusColorBg(o.status),
                    color: statusColorText(o.status),
                  }}
                >
                  {o.status.replace("_", " ")}
                </span>
              </div>

              <div className="space-y-3 mb-3">
                {o.items
                  .slice(0, expandedOrders[o._id] ? o.items.length : 3)
                  .map((it, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <div
                          className="font-medium"
                          style={{ color: "var(--text)" }}
                        >
                          {it?.item || it?.foodItem?.item || "Item"}
                        </div>
                        <div
                          className="text-sm"
                          style={{ color: "var(--text-subtle)" }}
                        >
                          {it?.restaurant || it?.foodItem?.restaurant || ""}
                        </div>
                      </div>
                      <div className="text-right">
                        <div style={{ color: "var(--cream)" }}>
                          ${((it?.price || 0) * (it?.quantity || 1)).toFixed(2)}
                        </div>
                        <div
                          className="text-sm"
                          style={{ color: "var(--text-subtle)" }}
                        >
                          x{it?.quantity || 1}
                        </div>
                      </div>
                    </div>
                  ))}
                {o.items.length > 3 && (
                  <div className="mt-2">
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
              </div>
              {o.status === "ready" && (
                <div className="mt-3 flex justify-center">
                  <button
                    onClick={() => markPickedUp(o._id)}
                    className="px-4 py-2 bg-[var(--success)] rounded text-[var(--text)] cursor-pointer text-center"
                  >
                    Pick Up
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      </main>
    </div>
  );
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
