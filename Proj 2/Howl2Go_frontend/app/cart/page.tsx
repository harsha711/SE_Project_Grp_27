"use client";

import { useState } from "react";
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from "lucide-react";
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

export default function CartPage() {

  // Initial cart state with sample items
  const [cartItems, setCartItems] = useState<CartItem[]>([
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

  // Increase quantity
  const increaseQuantity = (id: string) => {
    setCartItems((items) =>
      items.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  // Decrease quantity
  const decreaseQuantity = (id: string) => {
    setCartItems((items) =>
      items.map((item) =>
        item.id === id && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );
  };

  // Remove item from cart
  const removeItem = (id: string) => {
    setCartItems((items) => items.filter((item) => item.id !== id));
  };

  // Calculate totals
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const tax = subtotal * 0.08; // 8% tax
  const deliveryFee = cartItems.length > 0 ? 3.99 : 0;
  const total = subtotal + tax + deliveryFee;

  // Checkout handler
  const handleCheckout = () => {
    console.log("Proceeding to checkout with Next.js router...");
    console.log("Cart Items:", cartItems);
    console.log("Total:", total.toFixed(2));
    // Future: router.push('/checkout')
  };

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
                  onClick={() => setCartItems([])}
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

              {cartItems.map((item) => (
                <div
                  key={item.id}
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
                            {item.item}
                          </h3>
                          <p
                            className="text-sm"
                            style={{ color: "var(--text-subtle)" }}
                          >
                            {item.restaurant}
                          </p>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
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
                            onClick={() => decreaseQuantity(item.id)}
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
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => increaseQuantity(item.id)}
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
                            ${(item.price * item.quantity).toFixed(2)}
                          </div>
                          <div
                            className="text-sm"
                            style={{ color: "var(--text-muted)" }}
                          >
                            ${item.price.toFixed(2)} each
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

                {/* Checkout Button */}
                <button
                  onClick={handleCheckout}
                  className="w-full py-4 rounded-full font-bold text-lg transition-all hover:scale-105 hover:shadow-lg"
                  style={{
                    backgroundColor: "var(--orange)",
                    color: "var(--text)",
                  }}
                >
                  Proceed to Checkout
                </button>

                {/* Additional Info */}
                <div className="mt-4 text-center">
                  <p
                    className="text-sm"
                    style={{ color: "var(--text-muted)" }}
                  >
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
