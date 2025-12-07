/**
 * Cart page (client): displays current cart items, allows quantity updates/removals,
 * and places orders by posting the cart payload to the backend via the frontend
 * proxy (`/api/proxy?path=/api/orders`). The proxy forwards the httpOnly accessToken
 * as an Authorization header so backend auth middleware can attach `req.user`.
 *
 * On successful order creation the server-side cart is cleared and the client
 * cart is cleared locally before redirecting the user.
 *
 * @author Ahmed Hassan
 */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowLeft,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

export default function CartPage() {
  const router = useRouter();
  const {
    items: cartItems,
    removeFromCart,
    updateQuantity,
    clearCart,
    summary,
  } = useCart();

  // Order state
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderSummary, setOrderSummary] = useState({ total: 0, totalItems: 0 });

  // Increase quantity
  const increaseQuantity = (id: string) => {
    const item = cartItems.find((i) => i.id === id);
    if (item) {
      updateQuantity(id, item.quantity + 1);
    }
  };

  // Decrease quantity
  const decreaseQuantity = (id: string) => {
    const item = cartItems.find((i) => i.id === id);
    if (item && item.quantity > 1) {
      updateQuantity(id, item.quantity - 1);
    }
  };

  // Destructure summary
  const { totalItems, subtotal, tax, deliveryFee, total } = summary;

  // Place Order handler
  const handlePlaceOrder = async () => {
    try {
      setIsProcessing(true);

      // Save order summary before sending
      setOrderSummary({
        total: total,
        totalItems: totalItems,
      });

      const payload = {
        items: cartItems.map((ci) => {
          const fi = (ci.foodItem as any) || {};
          return {
            foodItem: fi._id || fi.id || ci.foodItem,
            restaurant: fi.restaurant || (ci as any).restaurant || "",
            item: fi.item || (ci as any).item || "",
            calories: fi.calories || (ci as any).calories || 0,
            price: (ci as any).price || 0,
            quantity: (ci as any).quantity || 1,
          };
        }),
      };

      const resp = await fetch(
        `/api/proxy?path=${encodeURIComponent("/api/orders")}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await resp.json();
      if (!resp.ok) {
        console.error("Order creation failed:", data);
        setIsProcessing(false);
        return;
      }

      console.log("Order placed successfully!", data);

      clearCart();

      setIsProcessing(false);
      setOrderPlaced(true);

      setTimeout(() => {
        router.push("/dashboard");
      }, 3000);
    } catch (error) {
      console.error("Failed to place order:", error);
      setIsProcessing(false);
    }
  };

  // Success Animation State
  if (orderPlaced) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "var(--bg)" }}
      >
        <div
          className="max-w-md w-full mx-4 rounded-2xl p-8 text-center animate-fade-in"
          style={{
            backgroundColor: "var(--bg-card)",
            borderWidth: "1px",
            borderColor: "var(--border)",
          }}
        >
          {/* Success Icon with pulse animation */}
          <div className="relative mb-6">
            <div
              className="absolute inset-0 w-24 h-24 mx-auto rounded-full animate-ping opacity-20"
              style={{ backgroundColor: "var(--success)" }}
            />
            <CheckCircle
              className="w-24 h-24 mx-auto relative animate-bounce"
              style={{ color: "var(--success)" }}
            />
          </div>

          <h1
            className="text-4xl font-bold mb-3"
            style={{ color: "var(--text)" }}
          >
            Order Placed!
          </h1>

          <div
            className="p-6 rounded-xl mb-6"
            style={{
              backgroundColor: "var(--bg)",
              border: "1px solid var(--border)",
            }}
          >
            <p className="text-sm mb-2" style={{ color: "var(--text-muted)" }}>
              Order Total
            </p>
            <p className="text-3xl font-bold" style={{ color: "var(--cream)" }}>
              ${orderSummary.total.toFixed(2)}
            </p>
            <p className="text-sm mt-2" style={{ color: "var(--text-subtle)" }}>
              {orderSummary.totalItems}{" "}
              {orderSummary.totalItems === 1 ? "item" : "items"}
            </p>
          </div>

          <div
            className="flex items-center justify-center gap-2 text-sm"
            style={{ color: "var(--text-muted)" }}
          >
            <div className="flex gap-1">
              <span
                className="w-2 h-2 rounded-full animate-pulse"
                style={{
                  backgroundColor: "var(--orange)",
                  animationDelay: "0s",
                }}
              />
              <span
                className="w-2 h-2 rounded-full animate-pulse"
                style={{
                  backgroundColor: "var(--orange)",
                  animationDelay: "0.2s",
                }}
              />
              <span
                className="w-2 h-2 rounded-full animate-pulse"
                style={{
                  backgroundColor: "var(--orange)",
                  animationDelay: "0.4s",
                }}
              />
            </div>
            <span>Redirecting to dashboard...</span>
          </div>
        </div>

        <style jsx>{`
          @keyframes fade-in {
            from {
              opacity: 0;
              transform: scale(0.9);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }

          .animate-fade-in {
            animation: fade-in 0.5s ease-out;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen pb-20"
      style={{ backgroundColor: "var(--bg)" }}
    >
      {/* Header */}
      <div
        className="border-b"
        style={{
          backgroundColor: "var(--bg-card)",
          borderColor: "var(--border)",
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="p-2 rounded-lg transition-colors"
              style={{
                color: "var(--text-subtle)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "var(--bg-hover)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-3">
              <ShoppingBag
                className="w-8 h-8"
                style={{ color: "var(--orange)" }}
              />
              <h1
                className="text-3xl font-bold"
                style={{ color: "var(--text)" }}
              >
                Shopping Cart
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {cartItems.length === 0 ? (
          // Empty Cart State
          <div className="text-center py-20">
            <ShoppingBag
              className="w-20 h-20 mx-auto mb-4"
              style={{ color: "var(--text-muted)" }}
            />
            <h2
              className="text-2xl font-semibold mb-2"
              style={{ color: "var(--text)" }}
            >
              Your cart is empty
            </h2>
            <p className="mb-6" style={{ color: "var(--text-subtle)" }}>
              Add some delicious items to get started!
            </p>
            <Link
              href="/"
              className="inline-block px-8 py-3 rounded-full font-semibold transition-all hover:scale-105"
              style={{
                backgroundColor: "var(--orange)",
                color: "var(--text)",
              }}
            >
              Browse Menu
            </Link>
          </div>
        ) : (
          // Cart Items Grid
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2
                  className="text-xl font-semibold"
                  style={{ color: "var(--text)" }}
                >
                  {totalItems} {totalItems === 1 ? "Item" : "Items"}
                </h2>
                <button
                  onClick={() => clearCart()}
                  className="text-sm font-medium transition-colors"
                  style={{ color: "var(--text-subtle)" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "var(--error)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "var(--text-subtle)";
                  }}
                >
                  Clear Cart
                </button>
              </div>

              {cartItems.map((cartItem) => (
                <div
                  key={cartItem.id}
                  className="rounded-2xl p-6 border transition-all"
                  style={{
                    backgroundColor: "var(--bg-card)",
                    borderColor: "var(--border)",
                  }}
                >
                  <div className="flex gap-4">
                    {/* Item Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3
                            className="font-semibold text-lg mb-1"
                            style={{ color: "var(--text)" }}
                          >
                            {cartItem.foodItem.item}
                          </h3>
                          <p
                            className="text-sm"
                            style={{ color: "var(--text-subtle)" }}
                          >
                            {cartItem.foodItem.restaurant}
                          </p>
                        </div>
                        <button
                          onClick={() => removeFromCart(cartItem.id)}
                          className="p-2 rounded-lg transition-colors"
                          style={{ color: "var(--text-muted)" }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor =
                              "var(--bg-hover)";
                            e.currentTarget.style.color = "var(--error)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor =
                              "transparent";
                            e.currentTarget.style.color = "var(--text-muted)";
                          }}
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Nutritional Info */}
                      <div className="flex gap-4 mb-4">
                        <span
                          className="text-sm px-3 py-1 rounded-full"
                          style={{
                            backgroundColor:
                              "color-mix(in srgb, var(--cream) 15%, transparent)",
                            color: "var(--cream)",
                          }}
                        >
                          {cartItem.foodItem.calories} cal
                        </span>
                        {cartItem.foodItem.protein && (
                          <span
                            className="text-sm px-3 py-1 rounded-full"
                            style={{
                              backgroundColor:
                                "color-mix(in srgb, var(--success) 15%, transparent)",
                              color: "var(--success)",
                            }}
                          >
                            {cartItem.foodItem.protein}g protein
                          </span>
                        )}
                      </div>

                      {/* Quantity Controls & Price */}
                      <div className="flex items-center justify-between">
                        <div
                          className="flex items-center gap-3 rounded-lg border px-3 py-2"
                          style={{
                            borderColor: "var(--border)",
                            backgroundColor: "var(--bg)",
                          }}
                        >
                          <button
                            onClick={() => decreaseQuantity(cartItem.id)}
                            className="p-1 rounded transition-colors"
                            style={{ color: "var(--text-subtle)" }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor =
                                "var(--bg-hover)";
                              e.currentTarget.style.color = "var(--orange)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor =
                                "transparent";
                              e.currentTarget.style.color =
                                "var(--text-subtle)";
                            }}
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span
                            className="font-semibold min-w-[2rem] text-center"
                            style={{ color: "var(--text)" }}
                          >
                            {cartItem.quantity}
                          </span>
                          <button
                            onClick={() => increaseQuantity(cartItem.id)}
                            className="p-1 rounded transition-colors"
                            style={{ color: "var(--text-subtle)" }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor =
                                "var(--bg-hover)";
                              e.currentTarget.style.color = "var(--orange)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor =
                                "transparent";
                              e.currentTarget.style.color =
                                "var(--text-subtle)";
                            }}
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="text-right">
                          <div
                            className="text-xl font-bold"
                            style={{ color: "var(--cream)" }}
                          >
                            ${(cartItem.price * cartItem.quantity).toFixed(2)}
                          </div>
                          <div
                            className="text-sm"
                            style={{ color: "var(--text-muted)" }}
                          >
                            ${cartItem.price.toFixed(2)} each
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1">
              <div
                className="rounded-2xl p-6 border sticky top-24"
                style={{
                  backgroundColor: "var(--bg-card)",
                  borderColor: "var(--border)",
                }}
              >
                <h2
                  className="text-xl font-bold mb-6"
                  style={{ color: "var(--text)" }}
                >
                  Order Summary
                </h2>

                <div className="space-y-4 mb-6">
                  {/* Subtotal */}
                  <div className="flex justify-between">
                    <span style={{ color: "var(--text-subtle)" }}>
                      Subtotal
                    </span>
                    <span
                      className="font-semibold"
                      style={{ color: "var(--text)" }}
                    >
                      ${subtotal.toFixed(2)}
                    </span>
                  </div>

                  {/* Tax */}
                  <div className="flex justify-between">
                    <span style={{ color: "var(--text-subtle)" }}>
                      Tax (8%)
                    </span>
                    <span
                      className="font-semibold"
                      style={{ color: "var(--text)" }}
                    >
                      ${tax.toFixed(2)}
                    </span>
                  </div>

                  {/* Delivery Fee */}
                  <div className="flex justify-between">
                    <span style={{ color: "var(--text-subtle)" }}>
                      Delivery Fee
                    </span>
                    <span
                      className="font-semibold"
                      style={{ color: "var(--text)" }}
                    >
                      ${deliveryFee.toFixed(2)}
                    </span>
                  </div>

                  {/* Divider */}
                  <div
                    className="border-t pt-4"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <div className="flex justify-between items-center">
                      <span
                        className="text-lg font-semibold"
                        style={{ color: "var(--text)" }}
                      >
                        Total
                      </span>
                      <span
                        className="text-2xl font-bold"
                        style={{ color: "var(--cream)" }}
                      >
                        ${total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Place Order Button */}
                <button
                  onClick={handlePlaceOrder}
                  disabled={isProcessing}
                  className="w-full py-4 rounded-full font-bold text-lg transition-all hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: "var(--orange)",
                    color: "var(--text)",
                  }}
                >
                  {isProcessing ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg
                        className="animate-spin h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    "Place Order"
                  )}
                </button>

                {/* Additional Info */}
                <div className="mt-4 text-center">
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                    Free delivery on orders over $30
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
