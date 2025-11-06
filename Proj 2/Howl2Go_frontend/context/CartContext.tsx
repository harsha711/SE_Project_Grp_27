"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import type { CartItem, CartSummary } from "@/types/cart";
import type { FoodItem } from "@/types/food";

interface CartContextType {
  items: CartItem[];
  addToCart: (foodItem: FoodItem, quantity?: number) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  summary: CartSummary;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "howl2go_cart";
const TAX_RATE = 0.08; // 8% tax
const DELIVERY_FEE = 3.99;

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        // Convert date strings back to Date objects
        const itemsWithDates = parsed.map((item: CartItem) => ({
          ...item,
          addedAt: new Date(item.addedAt),
        }));
        setItems(itemsWithDates);
      }
    } catch (error) {
      console.error("Failed to load cart from localStorage:", error);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error("Failed to save cart to localStorage:", error);
    }
  }, [items]);

  const addToCart = (foodItem: FoodItem, quantity: number = 1) => {
    setItems((currentItems) => {
      // Check if item already exists in cart
      const existingItemIndex = currentItems.findIndex(
        (item) =>
          item.foodItem.restaurant === foodItem.restaurant &&
          item.foodItem.item === foodItem.item
      );

      if (existingItemIndex >= 0) {
        // Update quantity of existing item
        const updatedItems = [...currentItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + quantity,
        };
        return updatedItems;
      } else {
        // Add new item - use price from API if available, otherwise calculate
        const itemPrice = foodItem.price ?? calculatePrice(foodItem.calories);
        const newItem: CartItem = {
          id: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          foodItem,
          quantity,
          addedAt: new Date(),
          price: itemPrice,
        };
        return [...currentItems, newItem];
      }
    });
  };

  const removeFromCart = (itemId: string) => {
    setItems((currentItems) =>
      currentItems.filter((item) => item.id !== itemId)
    );
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  // Calculate cart summary
  const summary: CartSummary = React.useMemo(() => {
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const tax = subtotal * TAX_RATE;
    const deliveryFee = items.length > 0 ? DELIVERY_FEE : 0;
    const total = subtotal + tax + deliveryFee;

    return {
      totalItems,
      subtotal,
      tax,
      deliveryFee,
      total,
    };
  }, [items]);

  const value = {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    summary,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

// Helper function to calculate price based on calories
// This is a placeholder - you can adjust the pricing logic
function calculatePrice(calories: number): number {
  // Base price calculation: ~$0.01 per calorie, with min $2 and max $15
  const basePrice = calories * 0.01;
  return Math.min(Math.max(basePrice, 2.0), 15.0);
}
