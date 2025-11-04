# User Management System Documentation

## Overview

This document describes the complete user management and authentication system implemented for the Howl2Go backend API.

## Table of Contents

1. [Architecture](#architecture)
2. [API Endpoints](#api-endpoints)
3. [Authentication Flow](#authentication-flow)
4. [Testing](#testing)
5. [Security Features](#security-features)
6. [Usage Examples](#usage-examples)

## Architecture

### Components

#### 1. User Model (`src/models/User.js`)
- **Fields:**
  - `name` - User's full name (required, 2-100 characters)
  - `email` - Unique email address (required, validated)
  - `password` - Hashed password (required, min 8 characters)
  - `role` - User role: 'user' or 'admin' (default: 'user')
  - `isActive` - Account status (default: true)
  - `preferences` - User preferences object:
    - `dietaryRestrictions` - Array of dietary restrictions
    - `favoriteRestaurants` - Array of favorite restaurant names
    - `maxCalories` - Maximum calorie preference
    - `minProtein` - Minimum protein preference
  - `lastLogin` - Timestamp of last login
  - `passwordChangedAt` - Timestamp of last password change
  - Automatic timestamps: `createdAt`, `updatedAt`

- **Security Features:**
  - Passwords automatically hashed with bcrypt (salt rounds: 12)
  - Password field excluded from queries by default
  - Email stored in lowercase
  - Email validation with regex
  - Password change tracking for token invalidation

#### 2. Authentication Utilities (`src/utils/jwt.util.js`)
- **Functions:**
  - `generateAccessToken(userId, email, role)` - Creates JWT access token (default: 7 days)
  - `generateRefreshToken(userId)` - Creates refresh token (default: 30 days)
  - `verifyToken(token, isRefreshToken)` - Verifies and decodes JWT
  - `decodeToken(token)` - Decodes JWT without verification
  - `extractTokenFromHeader(authHeader)` - Extracts token from Authorization header

#### 3. Authentication Middleware (`src/middleware/auth.middleware.js`)
- **Middleware:**
  - `authenticate` - Verifies JWT and attaches user to `req.user`
  - `optionalAuth` - Optional authentication (doesn't fail if no token)

#### 4. User Controller (`src/controllers/user.controller.js`)
- **Public Endpoints:**
  - `register` - Create new user account
  - `login` - Authenticate user
  - `refreshAccessToken` - Get new access token using refresh token

- **Protected Endpoints (User):**
  - `getProfile` - Get current user profile
  - `changePassword` - Change user password
  - `deactivateAccount` - Deactivate user account

## API Endpoints

### Public Endpoints (No Authentication)

#### 1. Register New User
```http
POST /api/users/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "preferences": {},
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

#### 2. Login
```http
POST /api/users/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "preferences": {},
      "lastLogin": "2024-01-01T00:00:00.000Z"
    },
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

#### 3. Refresh Access Token
```http
POST /api/users/refresh-token
Content-Type: application/json

{
  "refreshToken": "eyJhbGc..."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGc..."
  }
}
```

### Protected Endpoints (Authentication Required)

All protected endpoints require the `Authorization` header:
```http
Authorization: Bearer <access_token>
```

#### 4. Get User Profile
```http
GET /api/users/profile
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "preferences": {
        "dietaryRestrictions": [],
        "favoriteRestaurants": [],
        "maxCalories": null,
        "minProtein": null
      },
      "isActive": true,
      "lastLogin": "2024-01-01T00:00:00.000Z",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

#### 5. Change Password
```http
POST /api/users/change-password
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "currentPassword": "SecurePass123!",
  "newPassword": "NewSecurePass456!"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Password changed successfully",
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

#### 6. Deactivate Account
```http
DELETE /api/users/profile
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Account deactivated successfully"
}
```

## Authentication Flow

### 1. Registration Flow
```
User -> POST /api/users/register
     -> Validate input (name, email, password)
     -> Check if email exists
     -> Hash password (bcrypt, 12 salt rounds)
     -> Create user in database
     -> Generate access & refresh tokens
     -> Update last login timestamp
     -> Return user data + tokens
```

### 2. Login Flow
```
User -> POST /api/users/login
     -> Validate input (email, password)
     -> Find user by email
     -> Compare password with hash
     -> Check if account is active
     -> Generate access & refresh tokens
     -> Update last login timestamp
     -> Return user data + tokens
```

### 3. Protected Route Access Flow
```
User -> Request with Authorization header
     -> Extract token from header
     -> Verify JWT signature
     -> Check if user exists in database
     -> Check if user is active
     -> Check if password changed after token issue
     -> Attach user to req.user
     -> Continue to route handler
```

### 4. Token Refresh Flow
```
User -> POST /api/users/refresh-token with refresh token
     -> Verify refresh token
     -> Check if user exists and is active
     -> Generate new access token
     -> Return new access token
```

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run user tests specifically
npm test -- user.test.js

# Run tests in watch mode
npm test -- --watch
```

### Test Coverage

The test suite (`src/__tests__/user.test.js`) covers:

1. **Registration Tests:**
   - Successful registration
   - Duplicate email validation
   - Missing required fields
   - Invalid email format
   - Short password validation

2. **Login Tests:**
   - Successful login
   - Incorrect password
   - Non-existent user
   - Missing credentials

3. **Profile Tests:**
   - Get profile with valid token
   - Get profile without token
   - Get profile with invalid token

4. **Password Tests:**
   - Change password successfully
   - Wrong current password
   - Login with new password

5. **Token Tests:**
   - Refresh token successfully
   - Invalid refresh token

6. **Account Deactivation Tests:**
   - Deactivate account
   - Login with deactivated account (should fail)

## Security Features

### 1. Password Security
- **Hashing:** bcrypt with 12 salt rounds
- **Minimum Length:** 8 characters
- **Storage:** Never returned in API responses
- **Validation:** Automatic validation before save

### 2. Token Security
- **JWT Algorithm:** HS256
- **Access Token:** Short-lived (7 days default)
- **Refresh Token:** Long-lived (30 days default)
- **Issuer/Audience:** Validated on verification
- **Token Invalidation:** Password change invalidates old tokens

### 3. Input Validation
- Email format validation
- Email uniqueness check
- Password minimum length
- Name length constraints
- Role enum validation

### 4. Authorization
- Token required for protected routes
- User can only access own data

### 5. Account Security
- Account deactivation instead of deletion
- Deactivated accounts cannot login
- Last login tracking
- Password change tracking

### 6. Error Handling
- Generic error messages for authentication failures
- Detailed validation errors
- Environment-aware error responses
- No password exposure in logs or responses

## Usage Examples

### Frontend Integration (JavaScript/React)

```javascript
// 1. Register a new user
const register = async (name, email, password) => {
  const response = await fetch('http://localhost:4000/api/users/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password })
  });
  const data = await response.json();

  if (data.success) {
    // Store tokens
    localStorage.setItem('accessToken', data.data.accessToken);
    localStorage.setItem('refreshToken', data.data.refreshToken);
    return data.data.user;
  }
  throw new Error(data.message);
};

// 2. Login
const login = async (email, password) => {
  const response = await fetch('http://localhost:4000/api/users/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await response.json();

  if (data.success) {
    localStorage.setItem('accessToken', data.data.accessToken);
    localStorage.setItem('refreshToken', data.data.refreshToken);
    return data.data.user;
  }
  throw new Error(data.message);
};

// 3. Make authenticated request
const getProfile = async () => {
  const token = localStorage.getItem('accessToken');
  const response = await fetch('http://localhost:4000/api/users/profile', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const data = await response.json();

  if (data.success) {
    return data.data.user;
  }
  throw new Error(data.message);
};

// 4. Refresh token
const refreshToken = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  const response = await fetch('http://localhost:4000/api/users/refresh-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken })
  });
  const data = await response.json();

  if (data.success) {
    localStorage.setItem('accessToken', data.data.accessToken);
    return data.data.accessToken;
  }
  throw new Error(data.message);
};

// 5. Logout
const logout = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};
```

### Axios Interceptor Example

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:4000/api'
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retried
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post(
          'http://localhost:4000/api/users/refresh-token',
          { refreshToken }
        );

        const { accessToken } = response.data.data;
        localStorage.setItem('accessToken', accessToken);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
```

## Environment Variables

Required environment variables in `.env`:

```env
# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here_at_least_32_characters_long
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_here_at_least_32_characters_long
JWT_REFRESH_EXPIRES_IN=30d
```

**IMPORTANT:** Change the JWT secrets in production!

## Best Practices

1. **Token Storage:**
   - Store tokens in httpOnly cookies for web apps (more secure)
   - Use secure storage in mobile apps
   - Never store tokens in localStorage if possible (XSS vulnerability)

2. **Token Expiration:**
   - Keep access token expiration short (7 days is generous, consider 15-60 minutes)
   - Use refresh tokens for long-term sessions
   - Implement automatic token refresh in frontend

3. **Password Requirements:**
   - Enforce strong password policies in frontend
   - Current minimum: 8 characters
   - Consider adding complexity requirements

4. **Error Handling:**
   - Don't reveal if email exists during login (security)
   - Use generic messages for authentication failures
   - Log detailed errors server-side only

5. **Production Security:**
   - Use HTTPS in production
   - Change default JWT secrets
   - Enable rate limiting for auth endpoints
   - Implement account lockout after failed attempts
   - Add email verification
   - Implement password reset functionality

## Future Enhancements

1. **Email Verification:** Send verification email on registration
2. **Password Reset:** Implement forgot password flow
3. **Rate Limiting:** Limit authentication attempts
4. **Two-Factor Authentication:** Add 2FA support
5. **OAuth Integration:** Add Google/Facebook login
6. **Session Management:** Track and manage active sessions
7. **Audit Logging:** Log all authentication events
8. **Password History:** Prevent password reuse
9. **Account Lockout:** Lock account after failed attempts
10. **Email Notifications:** Notify on password changes, login from new device

## Support

For issues or questions, please refer to the main project documentation or create an issue in the repository.
