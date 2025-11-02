import express from 'express';
import {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  refreshAccessToken,
  deactivateAccount,
  getAllUsers,
  getUserById,
  updateUserById,
  deleteUserById
} from '../controllers/user.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes (no authentication required)
router.post('/register', register);
router.post('/login', login);
router.post('/refresh-token', refreshAccessToken);

// Protected routes (authentication required)
router.use(authenticate); // All routes below this require authentication

// User profile routes
router.get('/profile', getProfile);
router.patch('/profile', updateProfile);
router.delete('/profile', deactivateAccount);

// Password management
router.post('/change-password', changePassword);

// Admin-only routes
router.get('/', authorize('admin'), getAllUsers);
router.get('/:id', authorize('admin'), getUserById);
router.patch('/:id', authorize('admin'), updateUserById);
router.delete('/:id', authorize('admin'), deleteUserById);

export default router;
