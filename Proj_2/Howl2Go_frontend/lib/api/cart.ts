import { apiFetch } from "../api";

// Backend cart item structure
interface BackendCartItem {
  foodItem: {
    _id: string;
    company: string;
    item: string;
    calories: number;
    [key: string]: any;
  } | string; // Can be ObjectId string or populated object
  restaurant: string;
  item: string;
  calories: number;
  totalFat?: number;
  protein?: number;
  carbohydrates?: number;
  price: number;
  quantity: number;
}

interface BackendCartResponse {
  success: boolean;
  data: {
    cart: {
      id: string;
      items: BackendCartItem[];
      totalItems: number;
      totalPrice: number;
      userId?: string | null;
    };
  };
  message?: string;
}

// Transform backend cart item to frontend CartItem format
function transformCartItem(backendItem: BackendCartItem) {
  const foodItemId = typeof backendItem.foodItem === 'string' 
    ? backendItem.foodItem 
    : backendItem.foodItem._id;

  return {
    id: `cart-${foodItemId}`, // Use foodItemId as unique identifier
    foodItem: {
      _id: foodItemId,
      restaurant: backendItem.restaurant,
      item: backendItem.item,
      calories: backendItem.calories,
      totalFat: backendItem.totalFat ?? null,
      protein: backendItem.protein ?? null,
      carbs: backendItem.carbohydrates ?? null,
      price: backendItem.price,
    },
    quantity: backendItem.quantity,
    addedAt: new Date(), // Backend doesn't store this, so we use current date
    price: backendItem.price,
  };
}

/**
 * Fetch current cart from backend
 */
export async function fetchCart() {
  try {
    const response = await apiFetch("/api/cart", {
      method: "GET",
      credentials: "include", // Important for session cookies
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch cart: ${response.status}`);
    }

    const data: BackendCartResponse = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Failed to fetch cart");
    }

    // Transform backend cart items to frontend format
    const items = data.data.cart.items.map((item) => 
      transformCartItem(item)
    );

    return items;
  } catch (error) {
    console.error("Error fetching cart:", error);
    throw error;
  }
}

/**
 * Add item to cart
 */
export async function addItemToCart(foodItemId: string, quantity: number = 1) {
  try {
    const response = await apiFetch("/api/cart/items", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        foodItemId,
        quantity,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to add item: ${response.status}`);
    }

    const data: BackendCartResponse = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Failed to add item to cart");
    }

    // Return transformed items
    const items = data.data.cart.items.map((item) => 
      transformCartItem(item)
    );

    return items;
  } catch (error) {
    console.error("Error adding item to cart:", error);
    throw error;
  }
}

/**
 * Update item quantity in cart
 */
export async function updateCartItemQuantity(foodItemId: string, quantity: number) {
  try {
    const response = await apiFetch(`/api/cart/items/${foodItemId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ quantity }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to update item: ${response.status}`);
    }

    const data: BackendCartResponse = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Failed to update cart item");
    }

    // Return transformed items
    const items = data.data.cart.items.map((item) => 
      transformCartItem(item)
    );

    return items;
  } catch (error) {
    console.error("Error updating cart item:", error);
    throw error;
  }
}

/**
 * Remove item from cart
 */
export async function removeItemFromCart(foodItemId: string) {
  try {
    const response = await apiFetch(`/api/cart/items/${foodItemId}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to remove item: ${response.status}`);
    }

    const data: BackendCartResponse = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Failed to remove cart item");
    }

    // Return transformed items
    const items = data.data.cart.items.map((item) => 
      transformCartItem(item)
    );

    return items;
  } catch (error) {
    console.error("Error removing cart item:", error);
    throw error;
  }
}

/**
 * Clear entire cart
 */
export async function clearCart() {
  try {
    const response = await apiFetch("/api/cart", {
      method: "DELETE",
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to clear cart: ${response.status}`);
    }

    const data: BackendCartResponse = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Failed to clear cart");
    }

    return [];
  } catch (error) {
    console.error("Error clearing cart:", error);
    throw error;
  }
}

