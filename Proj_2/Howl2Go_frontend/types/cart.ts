// Cart-related type definitions

import type { FoodItem } from "./food";

export interface CartItem {
  id: string; // Unique ID for cart item (not food item ID)
  foodItem: FoodItem;
  quantity: number;
  addedAt: Date;
  price: number; // Price per item (placeholder, can be calculated from calories or set manually)
}

export interface CartSummary {
  totalItems: number;
  subtotal: number;
  tax: number;
  deliveryFee: number;
  total: number;
}
