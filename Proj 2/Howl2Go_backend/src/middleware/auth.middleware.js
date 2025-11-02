import User from '../models/User.js';
import { verifyToken, extractTokenFromHeader } from '../utils/jwt.util.js';

/**
 * Middleware to authenticate user via JWT token
 * Attaches user object to req.user if authentication succeeds
 */
export const authenticate = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    const token = extractTokenFromHeader(req.headers.authorization);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please provide a valid token.'
      });
    }

    // Verify token
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: error.message || 'Invalid or expired token'
      });
    }

    // Check if user still exists
    const user = await User.findById(decoded.id).select('+passwordChangedAt');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User no longer exists'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User account is deactivated'
      });
    }

    // Check if user changed password after token was issued
    if (user.changedPasswordAfter(decoded.iat)) {
      return res.status(401).json({
        success: false,
        message: 'Password recently changed. Please log in again.'
      });
    }

    // Attach user to request object (without password)
    req.user = {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      preferences: user.preferences
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Middleware to authorize user based on roles
 * @param {...string} allowedRoles - Roles that are allowed to access the route
 */
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to access this resource'
      });
    }

    next();
  };
};

/**
 * Optional authentication middleware
 * Authenticates user if token is provided, but doesn't fail if not
 * Useful for routes that have different behavior for authenticated users
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);

    if (!token) {
      return next(); // Continue without authentication
    }

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id);

    if (user && user.isActive && !user.changedPasswordAfter(decoded.iat)) {
      req.user = {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        preferences: user.preferences
      };
    }

    next();
  } catch (error) {
    // If there's an error with optional auth, just continue without user
    next();
  }
};
