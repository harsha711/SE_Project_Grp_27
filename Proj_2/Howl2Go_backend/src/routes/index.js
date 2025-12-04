/**
 * API route index
 *
 * Central router that mounts feature routers under `/api/*` in the server.
 * - `/health`  : health checks
 * - `/food`    : food catalog and lookup
 * - `/users`   : user registration, login, profile
 * - `/cart`    : session/cart operations (optional authentication)
 * - `/orders`  : order creation and management
 * - `/recommendations` : AI-powered meal recommendations
 *
 * @author Ahmed Hassan
 */
import { Router } from "express";
import healthRouter from "./health.routes.js";
import foodRouter from "./food.routes.js";
import userRouter from "./user.routes.js";
import cartRouter from "./cart.routes.js";
import orderRouter from "./order.routes.js";
import adminRouter from "./admin.routes.js";
import recommendationRouter from "./recommendation.routes.js";

const router = Router();

router.use("/health", healthRouter);
router.use("/food", foodRouter);
router.use("/users", userRouter);
router.use("/cart", cartRouter);
router.use("/orders", orderRouter);
router.use("/admin", adminRouter);
router.use("/recommendations", recommendationRouter);

export default router;
