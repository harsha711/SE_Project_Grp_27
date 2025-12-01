/**
 * Order routes
 *
 * Endpoint summary:
 * - POST `/`         : Create order from current session cart (optional auth)
 * - GET  `/me`       : Fetch orders for current user or session (optional auth)
 * - GET  `/`         : List all orders (requires `authenticate` - admin/staff)
 * - PATCH `/:id/status`: Update order status (requires `authenticate` - admin/staff)
 *
 * The routes use `optionalAuth` for user-aware guest flows (orders can be created
 * by guests and logged-in users) and `authenticate` for admin/staff protected
 * actions.
 *
 * @author Ahmed Hassan
 */
import { Router } from "express";
import { optionalAuth, authenticate } from "../middleware/auth.middleware.js";
import {
  createOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  userMarkComplete,
} from "../controllers/order.controller.js";

const router = Router();

// Create order from current session cart (optional auth)
router.post("/", optionalAuth, createOrder);

// Get my orders (session or user)
router.get("/me", optionalAuth, getMyOrders);

// Admin or Staff: list all orders
router.get("/", authenticate, getAllOrders);

// Admin or Staff: update status
router.patch("/:id/status", authenticate, updateOrderStatus);

// User: mark own order as picked up (complete) when ready
router.patch("/:id/pickup", authenticate, userMarkComplete);

export default router;
