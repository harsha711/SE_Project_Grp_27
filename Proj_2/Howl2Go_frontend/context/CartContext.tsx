"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import type { CartItem, CartSummary } from "@/types/cart";
import type { FoodItem } from "@/types/food";
import {
  fetchCart,
  addItemToCart as addItemToCartAPI,
  removeItemFromCart as removeItemFromCartAPI,
  updateCartItemQuantity as updateCartItemQuantityAPI,
  clearCart as clearCartAPI,
} from "@/lib/api/cart";

interface CartContextType {
  items: CartItem[];
  isLoading: boolean;
  addToCart: (foodItem: FoodItem, quantity?: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  summary: CartSummary;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const TAX_RATE = 0.08; // 8% tax
const DELIVERY_FEE = 3.99;

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load cart from MongoDB on mount
  useEffect(() => {
    async function loadCart() {
      try {
        setIsLoading(true);
        const cartItems = await fetchCart();
        setItems(cartItems);
      } catch (error) {
        console.error("Failed to load cart from server:", error);
        // On error, start with empty cart
        setItems([]);
      } finally {
        setIsLoading(false);
      }
    }

    loadCart();
  }, []);

  const addToCart = async (foodItem: FoodItem, quantity: number = 1) => {
    // Require _id to add to cart - try multiple possible fields
    const foodItemId = foodItem._id || (foodItem as any).id;
    if (!foodItemId) {
      console.error("Cannot add item to cart: missing _id", foodItem);
      const errorMessage = "Unable to add item to cart: missing item ID. Please try searching again.";
      toast.error(errorMessage);
      throw new Error("Food item must have an _id to add to cart");
    }

    try {
      const updatedItems = await addItemToCartAPI(foodItemId, quantity);
      setItems(updatedItems);
      toast.success("Item added to cart!");
    } catch (error: any) {
      console.error("Failed to add item to cart:", error);
      // Only show error toast if it's not already shown (avoid duplicates)
      const errorMessage = error?.message || "Failed to add item to cart. Please try again.";
      if (!errorMessage.includes("already shown")) {
        toast.error(errorMessage);
      }
      throw error;
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      // Find the cart item to get the foodItemId
      const cartItem = items.find((item) => item.id === itemId);
      if (!cartItem || !cartItem.foodItem._id) {
        console.error("Cannot remove item: missing foodItem _id");
        // Optimistically remove from UI
        setItems((currentItems) =>
          currentItems.filter((item) => item.id !== itemId)
        );
        return;
      }

      const updatedItems = await removeItemFromCartAPI(cartItem.foodItem._id);
      setItems(updatedItems);
    } catch (error) {
      console.error("Failed to remove item from cart:", error);
      throw error;
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(itemId);
      return;
    }

    try {
      // Find the cart item to get the foodItemId
      const cartItem = items.find((item) => item.id === itemId);
      if (!cartItem || !cartItem.foodItem._id) {
        console.error("Cannot update item: missing foodItem _id");
        throw new Error("Cart item not found or missing foodItem _id");
      }

      const updatedItems = await updateCartItemQuantityAPI(
        cartItem.foodItem._id,
        quantity
      );
      setItems(updatedItems);
    } catch (error) {
      console.error("Failed to update cart item quantity:", error);
      throw error;
    }
  };

  const clearCart = async () => {
    try {
      await clearCartAPI();
      setItems([]);
    } catch (error) {
      console.error("Failed to clear cart:", error);
      throw error;
    }
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
    isLoading,
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
