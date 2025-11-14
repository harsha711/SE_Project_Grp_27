import express from "express";
import {
  register,
  login,
  getProfile,
  changePassword,
  refreshAccessToken,
} from "../controllers/user.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public routes (no authentication required)
router.post("/register", register);
router.post("/login", login);
router.post("/refresh-token", refreshAccessToken);

// Protected routes (authentication required)
router.use(authenticate); // All routes below this require authentication

// User profile routes
router.get("/profile", getProfile);

// Password management
router.post("/change-password", changePassword);

export default router;
