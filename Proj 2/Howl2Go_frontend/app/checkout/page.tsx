"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  Truck,
  MapPin,
  Clock,
  CheckCircle,
  ArrowLeft,
  User,
  Phone,
  Mail,
} from "lucide-react";
import Link from "next/link";

// Order Summary Interface
interface OrderSummary {
  subtotal: number;
  tax: number;
  deliveryFee: number;
  total: number;
  itemCount: number;
}

export default function CheckoutPage() {
  const router = useRouter();

  // Order summary (would come from cart context in real app)
  const orderSummary: OrderSummary = {
    subtotal: 18.43,
    tax: 1.47,
    deliveryFee: 3.99,
    total: 23.89,
    itemCount: 4,
  };

  // Form state
  const [deliveryType, setDeliveryType] = useState<"delivery" | "pickup">(
    "delivery"
  );
  const [paymentMethod, setPaymentMethod] = useState<
    "credit" | "debit" | "cash"
  >("credit");

  // Contact Information
  const [contactInfo, setContactInfo] = useState({
    name: "",
    email: "",
    phone: "",
  });

  // Delivery Address
  const [address, setAddress] = useState({
    street: "",
    apartment: "",
    city: "",
    zipCode: "",
    instructions: "",
  });

  // Payment Information
  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
  });

  // Delivery Time
  const [deliveryTime, setDeliveryTime] = useState("asap");

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  // Handle order placement
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate API call
    setTimeout(() => {
      console.log("Order placed successfully!");
      console.log("Contact Info:", contactInfo);
      console.log("Delivery Type:", deliveryType);
      console.log("Address:", address);
      console.log("Payment Method:", paymentMethod);
      console.log("Payment Info:", paymentInfo);
      console.log("Delivery Time:", deliveryTime);
      console.log("Order Total:", orderSummary.total);

      setIsProcessing(false);
      setOrderPlaced(true);

      // Redirect to order confirmation after 2 seconds
      setTimeout(() => {
        router.push("/");
      }, 3000);
    }, 2000);
  };

  // Success state
  if (orderPlaced) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "var(--bg)" }}
      >
        <div
          className="max-w-md w-full mx-4 rounded-2xl p-8 text-center"
          style={{
            backgroundColor: "var(--bg-card)",
            borderWidth: "1px",
            borderColor: "var(--border)",
          }}
        >
          <CheckCircle
            className="w-20 h-20 mx-auto mb-4"
            style={{ color: "var(--success)" }}
          />
          <h1
            className="text-3xl font-bold mb-2"
            style={{ color: "var(--text)" }}
          >
            Order Placed!
          </h1>
          <p className="mb-6" style={{ color: "var(--text-subtle)" }}>
            Your order has been confirmed and will be delivered soon.
          </p>
          <div
            className="text-sm mb-6 p-4 rounded-lg"
            style={{ backgroundColor: "var(--bg)" }}
          >
            <p style={{ color: "var(--text-muted)" }}>Order Total</p>
            <p
              className="text-2xl font-bold"
              style={{ color: "var(--cream)" }}
            >
              ${orderSummary.total.toFixed(2)}
            </p>
          </div>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Redirecting to home page...
          </p>
        </div>
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
              href="/cart"
              className="p-2 rounded-lg transition-colors"
              style={{ color: "var(--text-subtle)" }}
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
              <CreditCard
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handlePlaceOrder}>
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Checkout Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Contact Information */}
              <div
                className="rounded-2xl p-6 border"
                style={{
                  backgroundColor: "var(--bg-card)",
                  borderColor: "var(--border)",
                }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <User
                    className="w-6 h-6"
                    style={{ color: "var(--orange)" }}
                  />
                  <h2
                    className="text-xl font-bold"
                    style={{ color: "var(--text)" }}
                  >
                    Contact Information
                  </h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label
                      className="block text-sm font-medium mb-2"
                      style={{ color: "var(--text-subtle)" }}
                    >
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={contactInfo.name}
                      onChange={(e) =>
                        setContactInfo({ ...contactInfo, name: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                      style={{
                        backgroundColor: "var(--bg)",
                        borderColor: "var(--border)",
                        color: "var(--text)",
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = "var(--orange)";
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = "var(--border)";
                      }}
                      placeholder="John Doe"
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        className="block text-sm font-medium mb-2"
                        style={{ color: "var(--text-subtle)" }}
                      >
                        Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={contactInfo.email}
                        onChange={(e) =>
                          setContactInfo({
                            ...contactInfo,
                            email: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 rounded-lg border focus:outline-none transition-all"
                        style={{
                          backgroundColor: "var(--bg)",
                          borderColor: "var(--border)",
                          color: "var(--text)",
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = "var(--orange)";
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = "var(--border)";
                        }}
                        placeholder="john@example.com"
                      />
                    </div>

                    <div>
                      <label
                        className="block text-sm font-medium mb-2"
                        style={{ color: "var(--text-subtle)" }}
                      >
                        Phone *
                      </label>
                      <input
                        type="tel"
                        required
                        value={contactInfo.phone}
                        onChange={(e) =>
                          setContactInfo({
                            ...contactInfo,
                            phone: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 rounded-lg border focus:outline-none transition-all"
                        style={{
                          backgroundColor: "var(--bg)",
                          borderColor: "var(--border)",
                          color: "var(--text)",
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = "var(--orange)";
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = "var(--border)";
                        }}
                        placeholder="(555) 123-4567"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Delivery Type */}
              <div
                className="rounded-2xl p-6 border"
                style={{
                  backgroundColor: "var(--bg-card)",
                  borderColor: "var(--border)",
                }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <Truck
                    className="w-6 h-6"
                    style={{ color: "var(--orange)" }}
                  />
                  <h2
                    className="text-xl font-bold"
                    style={{ color: "var(--text)" }}
                  >
                    Delivery Method
                  </h2>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setDeliveryType("delivery")}
                    className="p-4 rounded-lg border-2 text-left transition-all"
                    style={{
                      backgroundColor:
                        deliveryType === "delivery"
                          ? "var(--bg)"
                          : "transparent",
                      borderColor:
                        deliveryType === "delivery"
                          ? "var(--orange)"
                          : "var(--border)",
                    }}
                  >
                    <Truck
                      className="w-5 h-5 mb-2"
                      style={{
                        color:
                          deliveryType === "delivery"
                            ? "var(--orange)"
                            : "var(--text-subtle)",
                      }}
                    />
                    <div
                      className="font-semibold"
                      style={{ color: "var(--text)" }}
                    >
                      Delivery
                    </div>
                    <div
                      className="text-sm"
                      style={{ color: "var(--text-subtle)" }}
                    >
                      30-45 mins • $3.99
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryType("pickup")}
                    className="p-4 rounded-lg border-2 text-left transition-all"
                    style={{
                      backgroundColor:
                        deliveryType === "pickup" ? "var(--bg)" : "transparent",
                      borderColor:
                        deliveryType === "pickup"
                          ? "var(--orange)"
                          : "var(--border)",
                    }}
                  >
                    <MapPin
                      className="w-5 h-5 mb-2"
                      style={{
                        color:
                          deliveryType === "pickup"
                            ? "var(--orange)"
                            : "var(--text-subtle)",
                      }}
                    />
                    <div
                      className="font-semibold"
                      style={{ color: "var(--text)" }}
                    >
                      Pickup
                    </div>
                    <div
                      className="text-sm"
                      style={{ color: "var(--text-subtle)" }}
                    >
                      15-20 mins • Free
                    </div>
                  </button>
                </div>
              </div>

              {/* Delivery Address (only for delivery) */}
              {deliveryType === "delivery" && (
                <div
                  className="rounded-2xl p-6 border"
                  style={{
                    backgroundColor: "var(--bg-card)",
                    borderColor: "var(--border)",
                  }}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <MapPin
                      className="w-6 h-6"
                      style={{ color: "var(--orange)" }}
                    />
                    <h2
                      className="text-xl font-bold"
                      style={{ color: "var(--text)" }}
                    >
                      Delivery Address
                    </h2>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label
                        className="block text-sm font-medium mb-2"
                        style={{ color: "var(--text-subtle)" }}
                      >
                        Street Address *
                      </label>
                      <input
                        type="text"
                        required
                        value={address.street}
                        onChange={(e) =>
                          setAddress({ ...address, street: e.target.value })
                        }
                        className="w-full px-4 py-3 rounded-lg border focus:outline-none transition-all"
                        style={{
                          backgroundColor: "var(--bg)",
                          borderColor: "var(--border)",
                          color: "var(--text)",
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = "var(--orange)";
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = "var(--border)";
                        }}
                        placeholder="123 Main St"
                      />
                    </div>

                    <div>
                      <label
                        className="block text-sm font-medium mb-2"
                        style={{ color: "var(--text-subtle)" }}
                      >
                        Apartment, Suite, etc. (Optional)
                      </label>
                      <input
                        type="text"
                        value={address.apartment}
                        onChange={(e) =>
                          setAddress({ ...address, apartment: e.target.value })
                        }
                        className="w-full px-4 py-3 rounded-lg border focus:outline-none transition-all"
                        style={{
                          backgroundColor: "var(--bg)",
                          borderColor: "var(--border)",
                          color: "var(--text)",
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = "var(--orange)";
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = "var(--border)";
                        }}
                        placeholder="Apt 4B"
                      />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label
                          className="block text-sm font-medium mb-2"
                          style={{ color: "var(--text-subtle)" }}
                        >
                          City *
                        </label>
                        <input
                          type="text"
                          required
                          value={address.city}
                          onChange={(e) =>
                            setAddress({ ...address, city: e.target.value })
                          }
                          className="w-full px-4 py-3 rounded-lg border focus:outline-none transition-all"
                          style={{
                            backgroundColor: "var(--bg)",
                            borderColor: "var(--border)",
                            color: "var(--text)",
                          }}
                          onFocus={(e) => {
                            e.currentTarget.style.borderColor =
                              "var(--orange)";
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.borderColor =
                              "var(--border)";
                          }}
                          placeholder="New York"
                        />
                      </div>

                      <div>
                        <label
                          className="block text-sm font-medium mb-2"
                          style={{ color: "var(--text-subtle)" }}
                        >
                          ZIP Code *
                        </label>
                        <input
                          type="text"
                          required
                          value={address.zipCode}
                          onChange={(e) =>
                            setAddress({ ...address, zipCode: e.target.value })
                          }
                          className="w-full px-4 py-3 rounded-lg border focus:outline-none transition-all"
                          style={{
                            backgroundColor: "var(--bg)",
                            borderColor: "var(--border)",
                            color: "var(--text)",
                          }}
                          onFocus={(e) => {
                            e.currentTarget.style.borderColor =
                              "var(--orange)";
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.borderColor =
                              "var(--border)";
                          }}
                          placeholder="10001"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        className="block text-sm font-medium mb-2"
                        style={{ color: "var(--text-subtle)" }}
                      >
                        Delivery Instructions (Optional)
                      </label>
                      <textarea
                        value={address.instructions}
                        onChange={(e) =>
                          setAddress({
                            ...address,
                            instructions: e.target.value,
                          })
                        }
                        rows={3}
                        className="w-full px-4 py-3 rounded-lg border focus:outline-none transition-all resize-none"
                        style={{
                          backgroundColor: "var(--bg)",
                          borderColor: "var(--border)",
                          color: "var(--text)",
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = "var(--orange)";
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = "var(--border)";
                        }}
                        placeholder="Leave at door, ring bell, etc."
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Delivery Time */}
              <div
                className="rounded-2xl p-6 border"
                style={{
                  backgroundColor: "var(--bg-card)",
                  borderColor: "var(--border)",
                }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <Clock
                    className="w-6 h-6"
                    style={{ color: "var(--orange)" }}
                  />
                  <h2
                    className="text-xl font-bold"
                    style={{ color: "var(--text)" }}
                  >
                    Delivery Time
                  </h2>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all">
                    <input
                      type="radio"
                      name="deliveryTime"
                      value="asap"
                      checked={deliveryTime === "asap"}
                      onChange={(e) => setDeliveryTime(e.target.value)}
                      className="w-4 h-4 accent-[var(--orange)]"
                    />
                    <div>
                      <div
                        className="font-semibold"
                        style={{ color: "var(--text)" }}
                      >
                        ASAP
                      </div>
                      <div
                        className="text-sm"
                        style={{ color: "var(--text-subtle)" }}
                      >
                        {deliveryType === "delivery" ? "30-45" : "15-20"}{" "}
                        minutes
                      </div>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all">
                    <input
                      type="radio"
                      name="deliveryTime"
                      value="scheduled"
                      checked={deliveryTime === "scheduled"}
                      onChange={(e) => setDeliveryTime(e.target.value)}
                      className="w-4 h-4 accent-[var(--orange)]"
                    />
                    <div>
                      <div
                        className="font-semibold"
                        style={{ color: "var(--text)" }}
                      >
                        Schedule for Later
                      </div>
                      <div
                        className="text-sm"
                        style={{ color: "var(--text-subtle)" }}
                      >
                        Choose a specific time
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Payment Method */}
              <div
                className="rounded-2xl p-6 border"
                style={{
                  backgroundColor: "var(--bg-card)",
                  borderColor: "var(--border)",
                }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <CreditCard
                    className="w-6 h-6"
                    style={{ color: "var(--orange)" }}
                  />
                  <h2
                    className="text-xl font-bold"
                    style={{ color: "var(--text)" }}
                  >
                    Payment Method
                  </h2>
                </div>

                <div className="space-y-4">
                  <div className="grid sm:grid-cols-3 gap-4 mb-4">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("credit")}
                      className="p-3 rounded-lg border-2 font-medium transition-all"
                      style={{
                        backgroundColor:
                          paymentMethod === "credit"
                            ? "var(--bg)"
                            : "transparent",
                        borderColor:
                          paymentMethod === "credit"
                            ? "var(--orange)"
                            : "var(--border)",
                        color:
                          paymentMethod === "credit"
                            ? "var(--orange)"
                            : "var(--text-subtle)",
                      }}
                    >
                      Credit Card
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod("debit")}
                      className="p-3 rounded-lg border-2 font-medium transition-all"
                      style={{
                        backgroundColor:
                          paymentMethod === "debit"
                            ? "var(--bg)"
                            : "transparent",
                        borderColor:
                          paymentMethod === "debit"
                            ? "var(--orange)"
                            : "var(--border)",
                        color:
                          paymentMethod === "debit"
                            ? "var(--orange)"
                            : "var(--text-subtle)",
                      }}
                    >
                      Debit Card
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod("cash")}
                      className="p-3 rounded-lg border-2 font-medium transition-all"
                      style={{
                        backgroundColor:
                          paymentMethod === "cash"
                            ? "var(--bg)"
                            : "transparent",
                        borderColor:
                          paymentMethod === "cash"
                            ? "var(--orange)"
                            : "var(--border)",
                        color:
                          paymentMethod === "cash"
                            ? "var(--orange)"
                            : "var(--text-subtle)",
                      }}
                    >
                      Cash
                    </button>
                  </div>

                  {(paymentMethod === "credit" || paymentMethod === "debit") && (
                    <div className="space-y-4 pt-4">
                      <div>
                        <label
                          className="block text-sm font-medium mb-2"
                          style={{ color: "var(--text-subtle)" }}
                        >
                          Card Number *
                        </label>
                        <input
                          type="text"
                          required
                          value={paymentInfo.cardNumber}
                          onChange={(e) =>
                            setPaymentInfo({
                              ...paymentInfo,
                              cardNumber: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 rounded-lg border focus:outline-none transition-all"
                          style={{
                            backgroundColor: "var(--bg)",
                            borderColor: "var(--border)",
                            color: "var(--text)",
                          }}
                          onFocus={(e) => {
                            e.currentTarget.style.borderColor =
                              "var(--orange)";
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.borderColor =
                              "var(--border)";
                          }}
                          placeholder="1234 5678 9012 3456"
                          maxLength={19}
                        />
                      </div>

                      <div>
                        <label
                          className="block text-sm font-medium mb-2"
                          style={{ color: "var(--text-subtle)" }}
                        >
                          Cardholder Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={paymentInfo.cardName}
                          onChange={(e) =>
                            setPaymentInfo({
                              ...paymentInfo,
                              cardName: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 rounded-lg border focus:outline-none transition-all"
                          style={{
                            backgroundColor: "var(--bg)",
                            borderColor: "var(--border)",
                            color: "var(--text)",
                          }}
                          onFocus={(e) => {
                            e.currentTarget.style.borderColor =
                              "var(--orange)";
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.borderColor =
                              "var(--border)";
                          }}
                          placeholder="John Doe"
                        />
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label
                            className="block text-sm font-medium mb-2"
                            style={{ color: "var(--text-subtle)" }}
                          >
                            Expiry Date *
                          </label>
                          <input
                            type="text"
                            required
                            value={paymentInfo.expiryDate}
                            onChange={(e) =>
                              setPaymentInfo({
                                ...paymentInfo,
                                expiryDate: e.target.value,
                              })
                            }
                            className="w-full px-4 py-3 rounded-lg border focus:outline-none transition-all"
                            style={{
                              backgroundColor: "var(--bg)",
                              borderColor: "var(--border)",
                              color: "var(--text)",
                            }}
                            onFocus={(e) => {
                              e.currentTarget.style.borderColor =
                                "var(--orange)";
                            }}
                            onBlur={(e) => {
                              e.currentTarget.style.borderColor =
                                "var(--border)";
                            }}
                            placeholder="MM/YY"
                            maxLength={5}
                          />
                        </div>

                        <div>
                          <label
                            className="block text-sm font-medium mb-2"
                            style={{ color: "var(--text-subtle)" }}
                          >
                            CVV *
                          </label>
                          <input
                            type="text"
                            required
                            value={paymentInfo.cvv}
                            onChange={(e) =>
                              setPaymentInfo({
                                ...paymentInfo,
                                cvv: e.target.value,
                              })
                            }
                            className="w-full px-4 py-3 rounded-lg border focus:outline-none transition-all"
                            style={{
                              backgroundColor: "var(--bg)",
                              borderColor: "var(--border)",
                              color: "var(--text)",
                            }}
                            onFocus={(e) => {
                              e.currentTarget.style.borderColor =
                                "var(--orange)";
                            }}
                            onBlur={(e) => {
                              e.currentTarget.style.borderColor =
                                "var(--border)";
                            }}
                            placeholder="123"
                            maxLength={4}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === "cash" && (
                    <div
                      className="p-4 rounded-lg"
                      style={{
                        backgroundColor:
                          "color-mix(in srgb, var(--warning) 15%, transparent)",
                      }}
                    >
                      <p
                        className="text-sm"
                        style={{ color: "var(--text-subtle)" }}
                      >
                        Please have exact change ready. Our driver will collect
                        payment upon delivery.
                      </p>
                    </div>
                  )}
                </div>
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
                  <div className="flex justify-between">
                    <span style={{ color: "var(--text-subtle)" }}>
                      Subtotal ({orderSummary.itemCount} items)
                    </span>
                    <span
                      className="font-semibold"
                      style={{ color: "var(--text)" }}
                    >
                      ${orderSummary.subtotal.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span style={{ color: "var(--text-subtle)" }}>
                      Tax (8%)
                    </span>
                    <span
                      className="font-semibold"
                      style={{ color: "var(--text)" }}
                    >
                      ${orderSummary.tax.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span style={{ color: "var(--text-subtle)" }}>
                      {deliveryType === "delivery"
                        ? "Delivery Fee"
                        : "Pickup Fee"}
                    </span>
                    <span
                      className="font-semibold"
                      style={{ color: "var(--text)" }}
                    >
                      {deliveryType === "delivery"
                        ? `$${orderSummary.deliveryFee.toFixed(2)}`
                        : "Free"}
                    </span>
                  </div>

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
                        $
                        {(deliveryType === "delivery"
                          ? orderSummary.total
                          : orderSummary.total - orderSummary.deliveryFee
                        ).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Place Order Button */}
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-4 rounded-full font-bold text-lg transition-all hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: "var(--orange)",
                    color: "var(--text)",
                  }}
                >
                  {isProcessing ? "Processing..." : "Place Order"}
                </button>

                <p
                  className="text-xs text-center mt-4"
                  style={{ color: "var(--text-muted)" }}
                >
                  By placing this order, you agree to our Terms of Service and
                  Privacy Policy
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
