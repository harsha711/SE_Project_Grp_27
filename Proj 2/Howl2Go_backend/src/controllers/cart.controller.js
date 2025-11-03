import Cart from '../models/Cart.js';
import FastFoodItem from '../models/FastFoodItem.js';

/**
 * Get or create cart for current session
 */
const getOrCreateCart = async (sessionId, userId = null) => {
  let cart = await Cart.findOne({ sessionId }).populate('items.foodItem');

  if (!cart) {
    cart = await Cart.create({
      sessionId,
      userId,
      items: []
    });
  } else if (userId && !cart.userId) {
    // Associate cart with user if they log in
    cart.userId = userId;
    await cart.save();
  }

  return cart;
};

/**
 * Get current cart
 * GET /api/cart
 */
export const getCart = async (req, res) => {
  try {
    const sessionId = req.session.id;
    const userId = req.user?.id || null;

    const cart = await getOrCreateCart(sessionId, userId);

    res.status(200).json({
      success: true,
      data: {
        cart: {
          id: cart._id,
          items: cart.items,
          totalItems: cart.totalItems,
          totalPrice: cart.totalPrice,
          userId: cart.userId
        }
      }
    });
  } catch (error) {
    console.error('Error getting cart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve cart',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Add item to cart
 * POST /api/cart/items
 */
export const addItemToCart = async (req, res) => {
  try {
    const { foodItemId, quantity = 1 } = req.body;

    if (!foodItemId) {
      return res.status(400).json({
        success: false,
        message: 'Food item ID is required'
      });
    }

    // Verify food item exists
    const foodItem = await FastFoodItem.findById(foodItemId);

    if (!foodItem) {
      return res.status(404).json({
        success: false,
        message: 'Food item not found'
      });
    }

    const sessionId = req.session.id;
    const userId = req.user?.id || null;

    const cart = await getOrCreateCart(sessionId, userId);

    // Add item with all necessary data
    await cart.addItem({
      foodItem: foodItem._id,
      restaurant: foodItem.company,
      item: foodItem.item,
      calories: foodItem.calories || 0,
      totalFat: foodItem.totalFat || 0,
      protein: foodItem.protein || 0,
      carbohydrates: foodItem.carbs || 0,
      price: 0, // Price can be added later if needed
      quantity: parseInt(quantity, 10)
    });

    // Reload cart with populated items
    const updatedCart = await Cart.findById(cart._id).populate('items.foodItem');

    res.status(200).json({
      success: true,
      message: 'Item added to cart',
      data: {
        cart: {
          id: updatedCart._id,
          items: updatedCart.items,
          totalItems: updatedCart.totalItems,
          totalPrice: updatedCart.totalPrice
        }
      }
    });
  } catch (error) {
    console.error('Error adding item to cart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add item to cart',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Update item quantity in cart
 * PATCH /api/cart/items/:foodItemId
 */
export const updateCartItemQuantity = async (req, res) => {
  try {
    const { foodItemId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid quantity is required'
      });
    }

    const sessionId = req.session.id;
    const cart = await Cart.findOne({ sessionId });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    await cart.updateItemQuantity(foodItemId, parseInt(quantity, 10));

    // Reload cart with populated items
    const updatedCart = await Cart.findById(cart._id).populate('items.foodItem');

    res.status(200).json({
      success: true,
      message: quantity === 0 ? 'Item removed from cart' : 'Cart updated',
      data: {
        cart: {
          id: updatedCart._id,
          items: updatedCart.items,
          totalItems: updatedCart.totalItems,
          totalPrice: updatedCart.totalPrice
        }
      }
    });
  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update cart item',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Remove item from cart
 * DELETE /api/cart/items/:foodItemId
 */
export const removeItemFromCart = async (req, res) => {
  try {
    const { foodItemId } = req.params;

    const sessionId = req.session.id;
    const cart = await Cart.findOne({ sessionId });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    await cart.removeItem(foodItemId);

    // Reload cart with populated items
    const updatedCart = await Cart.findById(cart._id).populate('items.foodItem');

    res.status(200).json({
      success: true,
      message: 'Item removed from cart',
      data: {
        cart: {
          id: updatedCart._id,
          items: updatedCart.items,
          totalItems: updatedCart.totalItems,
          totalPrice: updatedCart.totalPrice
        }
      }
    });
  } catch (error) {
    console.error('Error removing cart item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove cart item',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Clear cart
 * DELETE /api/cart
 */
export const clearCart = async (req, res) => {
  try {
    const sessionId = req.session.id;
    const cart = await Cart.findOne({ sessionId });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    await cart.clearCart();

    res.status(200).json({
      success: true,
      message: 'Cart cleared',
      data: {
        cart: {
          id: cart._id,
          items: [],
          totalItems: 0,
          totalPrice: 0
        }
      }
    });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear cart',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Merge guest cart with user cart on login
 * POST /api/cart/merge
 */
export const mergeCart = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const sessionId = req.session.id;
    const userId = req.user.id;

    // Get session cart (guest cart)
    const sessionCart = await Cart.findOne({ sessionId });

    // Get user's existing cart
    let userCart = await Cart.findOne({ userId, sessionId: { $ne: sessionId } });

    if (sessionCart && sessionCart.items.length > 0) {
      if (userCart) {
        // Merge session cart items into user cart
        for (const item of sessionCart.items) {
          await userCart.addItem(item);
        }
        // Delete session cart
        await Cart.deleteOne({ _id: sessionCart._id });
      } else {
        // Just associate session cart with user
        sessionCart.userId = userId;
        await sessionCart.save();
        userCart = sessionCart;
      }
    } else if (!userCart) {
      // Create new cart for user
      userCart = await Cart.create({
        sessionId,
        userId,
        items: []
      });
    }

    // Reload cart with populated items
    const finalCart = await Cart.findById(userCart._id).populate('items.foodItem');

    res.status(200).json({
      success: true,
      message: 'Cart merged successfully',
      data: {
        cart: {
          id: finalCart._id,
          items: finalCart.items,
          totalItems: finalCart.totalItems,
          totalPrice: finalCart.totalPrice
        }
      }
    });
  } catch (error) {
    console.error('Error merging cart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to merge cart',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
