"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, ArrowLeft, ShoppingBag } from "lucide-react";
import Link from "next/link";

// Cart Item Interface
interface CartItem {
  id: string;
  restaurant: string;
  item: string;
  calories: number;
  protein: number | null;
  price: number;
  quantity: number;
}

export default function CheckoutPage() {
  const router = useRouter();

  // Sample cart items (in real app, this would come from cart context/state)
  const [cartItems] = useState<CartItem[]>([
    {
      id: "1",
      restaurant: "McDonald's",
      item: "Big Mac",
      calories: 563,
      protein: 25,
      price: 5.99,
      quantity: 2,
    },
    {
      id: "2",
      restaurant: "Subway",
      item: "Grilled Chicken Breast",
      calories: 165,
      protein: 31,
      price: 7.49,
      quantity: 1,
    },
    {
      id: "3",
      restaurant: "Starbucks",
      item: "Greek Yogurt Parfait",
      calories: 150,
      protein: 20,
      price: 4.95,
      quantity: 1,
    },
  ]);

  // Order state
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  // Calculate totals
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const tax = subtotal * 0.08; // 8% tax
  const deliveryFee = cartItems.length > 0 ? 3.99 : 0;
  const total = subtotal + tax + deliveryFee;

  // Handle order placement
  const handlePlaceOrder = () => {
    setIsProcessing(true);

    // Simulate order processing
    setTimeout(() => {
      console.log("Order placed successfully!");
      console.log("Cart Items:", cartItems);
      console.log("Total:", total.toFixed(2));

      setIsProcessing(false);
      setOrderPlaced(true);

      // Redirect to home after 3 seconds
      setTimeout(() => {
        router.push("/");
      }, 3000);
    }, 2000);
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

          <p className="text-lg mb-6" style={{ color: "var(--text-subtle)" }}>
            Your delicious food is on the way!
          </p>

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
            <p
              className="text-3xl font-bold"
              style={{ color: "var(--cream)" }}
            >
              ${total.toFixed(2)}
            </p>
            <p className="text-sm mt-2" style={{ color: "var(--text-subtle)" }}>
              {totalItems} {totalItems === 1 ? "item" : "items"}
            </p>
          </div>

          <div
            className="flex items-center justify-center gap-2 text-sm"
            style={{ color: "var(--text-muted)" }}
          >
            <div className="flex gap-1">
              <span
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ backgroundColor: "var(--orange)", animationDelay: "0s" }}
              />
              <span
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ backgroundColor: "var(--orange)", animationDelay: "0.2s" }}
              />
              <span
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ backgroundColor: "var(--orange)", animationDelay: "0.4s" }}
              />
            </div>
            <span>Redirecting to home...</span>
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

  // Main Checkout Page
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
              href="/cart"
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
                Checkout
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Order Items */}
          <div className="lg:col-span-2">
            <h2
              className="text-2xl font-bold mb-6"
              style={{ color: "var(--text)" }}
            >
              Your Order
            </h2>

            <div className="space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl p-6 border"
                  style={{
                    backgroundColor: "var(--bg-card)",
                    borderColor: "var(--border)",
                  }}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3
                        className="font-semibold text-lg mb-1"
                        style={{ color: "var(--text)" }}
                      >
                        {item.item}
                      </h3>
                      <p
                        className="text-sm"
                        style={{ color: "var(--text-subtle)" }}
                      >
                        {item.restaurant}
                      </p>
                    </div>
                    <div className="text-right">
                      <div
                        className="text-xl font-bold"
                        style={{ color: "var(--cream)" }}
                      >
                        ${(item.price * item.quantity).toFixed(2)}
                      </div>
                      <div
                        className="text-sm"
                        style={{ color: "var(--text-muted)" }}
                      >
                        ${item.price.toFixed(2)} × {item.quantity}
                      </div>
                    </div>
                  </div>

                  {/* Nutritional Info */}
                  <div className="flex gap-3">
                    <span
                      className="text-sm px-3 py-1 rounded-full"
                      style={{
                        backgroundColor:
                          "color-mix(in srgb, var(--cream) 15%, transparent)",
                        color: "var(--cream)",
                      }}
                    >
                      {item.calories} cal
                    </span>
                    {item.protein && (
                      <span
                        className="text-sm px-3 py-1 rounded-full"
                        style={{
                          backgroundColor:
                            "color-mix(in srgb, var(--success) 15%, transparent)",
                          color: "var(--success)",
                        }}
                      >
                        {item.protein}g protein
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
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
                    Subtotal ({totalItems} {totalItems === 1 ? "item" : "items"})
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
                <p
                  className="text-sm"
                  style={{ color: "var(--text-muted)" }}
                >
                  Estimated delivery: 30-45 min
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
