import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import {
  getRestaurantAnalyticsController,
  getPlatformAnalyticsController,
  getOrderTrendsController,
  getTopRestaurantsController,
  getAdminDashboardController
} from '../controllers/admin.controller.js';

const router = Router();

// All admin routes require authentication
router.use(authenticate);

// Dashboard endpoint (comprehensive data)
router.get('/analytics/dashboard', getAdminDashboardController);

// Individual analytics endpoints
router.get('/analytics/restaurants', getRestaurantAnalyticsController);
router.get('/analytics/platform', getPlatformAnalyticsController);
router.get('/analytics/trends', getOrderTrendsController);
router.get('/analytics/top-restaurants', getTopRestaurantsController);

export default router;

