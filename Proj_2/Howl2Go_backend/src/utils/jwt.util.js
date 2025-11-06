import jwt from 'jsonwebtoken';
import { getEnvVariable } from '../config/env.js';

/**
 * Generate JWT access token for a user
 * @param {string} userId - User's MongoDB _id
 * @param {string} email - User's email
 * @param {string} role - User's role
 * @returns {string} JWT token
 */
export const generateAccessToken = (userId, email, role = 'user') => {
  const secret = getEnvVariable('JWT_SECRET');
  const expiresIn = getEnvVariable('JWT_EXPIRES_IN', '7d');

  return jwt.sign(
    {
      id: userId,
      email,
      role
    },
    secret,
    {
      expiresIn,
      issuer: 'howl2go-api',
      audience: 'howl2go-app'
    }
  );
};

/**
 * Generate JWT refresh token for a user
 * @param {string} userId - User's MongoDB _id
 * @returns {string} JWT refresh token
 */
export const generateRefreshToken = (userId) => {
  const secret = getEnvVariable('JWT_REFRESH_SECRET', getEnvVariable('JWT_SECRET'));
  const expiresIn = getEnvVariable('JWT_REFRESH_EXPIRES_IN', '30d');

  return jwt.sign(
    {
      id: userId,
      type: 'refresh'
    },
    secret,
    {
      expiresIn,
      issuer: 'howl2go-api',
      audience: 'howl2go-app'
    }
  );
};

/**
 * Verify JWT token
 * @param {string} token - JWT token to verify
 * @param {boolean} isRefreshToken - Whether this is a refresh token
 * @returns {object} Decoded token payload
 * @throws {Error} If token is invalid or expired
 */
export const verifyToken = (token, isRefreshToken = false) => {
  const secret = isRefreshToken
    ? getEnvVariable('JWT_REFRESH_SECRET', getEnvVariable('JWT_SECRET'))
    : getEnvVariable('JWT_SECRET');

  try {
    return jwt.verify(token, secret, {
      issuer: 'howl2go-api',
      audience: 'howl2go-app'
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token has expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    } else {
      throw error;
    }
  }
};

/**
 * Decode JWT token without verification (for inspection only)
 * @param {string} token - JWT token to decode
 * @returns {object|null} Decoded token payload or null if invalid
 */
export const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    return null;
  }
};

/**
 * Extract token from Authorization header
 * @param {string} authHeader - Authorization header value
 * @returns {string|null} Extracted token or null
 */
export const extractTokenFromHeader = (authHeader) => {
  if (!authHeader) return null;

  // Support both "Bearer TOKEN" and "TOKEN" formats
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  return authHeader;
};
