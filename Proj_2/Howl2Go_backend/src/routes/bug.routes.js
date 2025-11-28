import { Router } from 'express';
import { createBugReport, getBugReports } from '../controllers/bug.controller.js';
import { authenticate, optionalAuth } from '../middleware/auth.middleware.js';

const router = Router();

/**
 * @route   POST /api/bugs
 * @desc    Create a bug report
 * @access  Public (optional auth)
 */
router.post('/', optionalAuth, createBugReport);

/**
 * @route   GET /api/bugs
 * @desc    Get all bug reports (admin only)
 * @access  Private (admin)
 */
router.get('/', authenticate, getBugReports);

export default router;

