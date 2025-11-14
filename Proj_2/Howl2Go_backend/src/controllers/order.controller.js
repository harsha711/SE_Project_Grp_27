/**
 * Orders controller
 *
 * Responsible for creating orders from the current session cart (or from a
 * client-provided items payload), fetching a user's orders (or session orders
 * for guests), listing all orders for staff/admin, and updating an order's
 * lifecycle status. The `createOrder` action normalizes item payloads so items
 * can be stored as references (`foodItem`) or embedded `snapshot` objects,
 * atomically allocates a sequential `orderNumber` via the `Counter` model,
 * and clears the server-side cart on success.
 *
 * Endpoints used by routes:
 * - POST /api/orders        -> createOrder (optional auth)
 * - GET  /api/orders/me     -> getMyOrders (optional auth)
 * - GET  /api/orders        -> getAllOrders (authenticate: admin/staff)
 * - PATCH /api/orders/:id/status -> updateOrderStatus (authenticate: admin/staff)
 *
 * @author Ahmed Hassan
 */
import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Counter from "../models/Counter.js";

/**
 * Create an order from current session cart (or items provided in body)
 * POST /api/orders
 */
export const createOrder = async (req, res) => {
  try {
    const sessionId = req.session.id;
    const userId = req.user?.id || null;

    const cart = await Cart.findOne({ sessionId }).populate("items.foodItem");

    let items = [];
    if (cart && cart.items.length > 0) {
      items = cart.items.map((i) => {
        const fi =
          i.foodItem && typeof i.foodItem === "object" ? i.foodItem : null;
        return {
          foodItem:
            fi && fi._id
              ? fi._id
              : typeof i.foodItem === "string" || i.foodItem?.toString
              ? i.foodItem
              : undefined,
          snapshot: fi || undefined,
          restaurant: i.restaurant,
          item: i.item,
          calories: i.calories,
          totalFat: i.totalFat,
          protein: i.protein,
          carbohydrates: i.carbohydrates,
          price: i.price,
          quantity: i.quantity,
        };
      });
    } else if (
      req.body.items &&
      Array.isArray(req.body.items) &&
      req.body.items.length > 0
    ) {
      items = req.body.items.map((it) => {
        const providedFi = it.foodItem;
        const isObj = providedFi && typeof providedFi === "object";
        return {
          foodItem:
            isObj && providedFi._id
              ? providedFi._id
              : !isObj
              ? providedFi
              : undefined,
          snapshot: isObj ? providedFi : undefined,
          restaurant:
            it.restaurant || (isObj ? providedFi.restaurant : undefined),
          item: it.item || (isObj ? providedFi.item : undefined),
          calories: it.calories || (isObj ? providedFi.calories : undefined),
          totalFat: it.totalFat || (isObj ? providedFi.totalFat : undefined),
          protein: it.protein || (isObj ? providedFi.protein : undefined),
          carbohydrates:
            it.carbohydrates || (isObj ? providedFi.carbohydrates : undefined),
          price: it.price || (isObj ? providedFi.price : 0),
          quantity: it.quantity || 1,
        };
      });
    } else {
      return res
        .status(400)
        .json({ success: false, message: "No items to create order" });
    }

    const counter = await Counter.findOneAndUpdate(
      { name: "orderNumber" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    const nextOrderNumber = counter.seq;

    const order = await Order.create({
      sessionId,
      userId,
      items,
      orderNumber: nextOrderNumber,
    });

    if (cart) {
      await cart.clearCart();
    }

    res
      .status(201)
      .json({ success: true, message: "Order created", data: { order } });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create order",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Get orders for current user or session
 * GET /api/orders/me
 */
export const getMyOrders = async (req, res) => {
  try {
    const userId = req.user?.id || null;
    const sessionId = req.session.id;

    const filter = userId ? { userId } : { sessionId };
    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .populate("items.foodItem");

    res.status(200).json({ success: true, data: { orders } });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ success: false, message: "Failed to fetch orders" });
  }
};

/**
 * Admin: get all orders
 * GET /api/orders
 */
export const getAllOrders = async (req, res) => {
  try {
    if (!req.user || (req.user.role !== "admin" && req.user.role !== "staff")) {
      return res
        .status(403)
        .json({ success: false, message: "Admin or Staff access required" });
    }

    const orders = await Order.find({})
      .sort({ createdAt: -1 })
      .populate("items.foodItem");
    res.status(200).json({ success: true, data: { orders } });
  } catch (error) {
    console.error("Error fetching all orders:", error);
    res.status(500).json({ success: false, message: "Failed to fetch orders" });
  }
};

/**
 * Admin: update order status
 * PATCH /api/orders/:id/status
 */
export const updateOrderStatus = async (req, res) => {
  try {
    if (!req.user || (req.user.role !== "admin" && req.user.role !== "staff")) {
      return res
        .status(403)
        .json({ success: false, message: "Admin or Staff access required" });
    }

    const { id } = req.params;
    const { status } = req.body;
    const allowed = [
      "pending",
      "in_progress",
      "ready",
      "complete",
      "cancelled",
    ];

    if (!allowed.includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status" });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    order.status = status;
    await order.save();

    res.status(200).json({
      success: true,
      message: "Order status updated",
      data: { order },
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to update order status" });
  }
};

/**
 * User: mark own order as picked up/complete if it's in 'ready' state
 * PATCH /api/orders/:id/pickup
 */
export const userMarkComplete = async (req, res) => {
  try {
    const userId = req.user?.id || null;
    const { id } = req.params;

    const order = await Order.findById(id);
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });

    if (!userId || order.userId?.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    if (order.status !== "ready") {
      return res
        .status(400)
        .json({
          success: false,
          message: "Order must be 'ready' to mark as picked up",
        });
    }

    order.status = "complete";
    await order.save();

    res
      .status(200)
      .json({
        success: true,
        message: "Order marked complete",
        data: { order },
      });
  } catch (error) {
    console.error("Error marking order complete:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to mark order complete" });
  }
};
