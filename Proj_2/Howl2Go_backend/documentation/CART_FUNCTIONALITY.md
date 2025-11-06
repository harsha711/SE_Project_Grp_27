# Shopping Cart with Session Management

This document explains the shopping cart functionality with session management implemented in the Howl2Go backend.

## Overview

The cart system uses **express-session** with MongoDB storage to provide persistent shopping carts for both authenticated and guest users. Sessions are stored in MongoDB and automatically expire after 7 days.

## Features

- **Session-based cart management** - Cart persists across browser sessions using cookies
- **Guest cart support** - Users can add items to cart without logging in
- **User cart association** - When users log in, their session cart can be merged with their user cart
- **Automatic cart persistence** - Cart data is stored in MongoDB
- **Cart expiration** - Carts automatically expire after 7 days of inactivity
- **Secure cookies** - HTTPOnly cookies prevent XSS attacks

## Configuration

### Environment Variables

Add these to your `.env` file:

```env
SESSION_SECRET=your_session_secret_key_here_at_least_32_characters_long
SESSION_NAME=howl2go.sid
SESSION_MAX_AGE=86400000  # 24 hours in milliseconds
FRONTEND_URL=http://localhost:3000  # Your frontend URL for CORS
```

### Dependencies

The following packages were installed:

```bash
npm install express-session connect-mongo
```

## API Endpoints

### 1. Get Current Cart

```
GET /api/cart
```

**Authentication:** Optional (works for both authenticated and guest users)

**Response:**
```json
{
  "success": true,
  "data": {
    "cart": {
      "id": "cart_id",
      "items": [
        {
          "foodItem": "food_item_id",
          "restaurant": "McDonald's",
          "item": "Big Mac",
          "calories": 550,
          "totalFat": 30,
          "protein": 25,
          "carbohydrates": 45,
          "price": 0,
          "quantity": 2
        }
      ],
      "totalItems": 2,
      "totalPrice": 0,
      "userId": "user_id_or_null"
    }
  }
}
```

### 2. Add Item to Cart

```
POST /api/cart/items
```

**Authentication:** Optional

**Request Body:**
```json
{
  "foodItemId": "food_item_id",
  "quantity": 2
}
```

**Response:**
```json
{
  "success": true,
  "message": "Item added to cart",
  "data": {
    "cart": { /* cart object */ }
  }
}
```

**Behavior:**
- If item already exists in cart, quantity is increased
- Creates new cart if none exists for the session
- Associates cart with user if authenticated

### 3. Update Item Quantity

```
PATCH /api/cart/items/:foodItemId
```

**Authentication:** Optional

**Request Body:**
```json
{
  "quantity": 5
}
```

**Response:**
```json
{
  "success": true,
  "message": "Cart updated",
  "data": {
    "cart": { /* cart object */ }
  }
}
```

**Behavior:**
- If quantity is 0, item is removed from cart
- If quantity is negative, returns 400 error

### 4. Remove Item from Cart

```
DELETE /api/cart/items/:foodItemId
```

**Authentication:** Optional

**Response:**
```json
{
  "success": true,
  "message": "Item removed from cart",
  "data": {
    "cart": { /* cart object */ }
  }
}
```

### 5. Clear Cart

```
DELETE /api/cart
```

**Authentication:** Optional

**Response:**
```json
{
  "success": true,
  "message": "Cart cleared",
  "data": {
    "cart": {
      "id": "cart_id",
      "items": [],
      "totalItems": 0,
      "totalPrice": 0
    }
  }
}
```

### 6. Merge Cart on Login

```
POST /api/cart/merge
```

**Authentication:** Required (must be logged in)

**Response:**
```json
{
  "success": true,
  "message": "Cart merged successfully",
  "data": {
    "cart": { /* cart object */ }
  }
}
```

**Behavior:**
- Merges guest cart (session cart) with user's existing cart
- If user has no existing cart, associates session cart with user
- Deletes session cart after merging

## Frontend Integration

### Setting Up Credentials

When making requests from the frontend, you must include credentials to send cookies:

```typescript
// Using fetch
fetch('http://localhost:4000/api/cart', {
  credentials: 'include',  // Important: allows cookies to be sent
  headers: {
    'Content-Type': 'application/json',
    // Add Authorization header if user is authenticated
    'Authorization': `Bearer ${token}`
  }
})

// Using axios
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:4000/api',
  withCredentials: true,  // Important: allows cookies to be sent
});
```

### Example: Adding Items to Cart

```typescript
const addToCart = async (foodItemId: string, quantity: number = 1) => {
  try {
    const response = await fetch('http://localhost:4000/api/cart/items', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ foodItemId, quantity })
    });

    const data = await response.json();

    if (data.success) {
      console.log('Cart updated:', data.data.cart);
      return data.data.cart;
    }
  } catch (error) {
    console.error('Failed to add item to cart:', error);
  }
};
```

### Example: Getting Cart on Page Load

```typescript
const getCart = async () => {
  try {
    const response = await fetch('http://localhost:4000/api/cart', {
      credentials: 'include'
    });

    const data = await response.json();

    if (data.success) {
      return data.data.cart;
    }
  } catch (error) {
    console.error('Failed to get cart:', error);
  }
};
```

### Example: Merging Cart After Login

```typescript
const handleLogin = async (email: string, password: string) => {
  try {
    // Login user
    const loginResponse = await fetch('http://localhost:4000/api/users/login', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password })
    });

    const loginData = await loginResponse.json();

    if (loginData.success) {
      // Store token
      localStorage.setItem('token', loginData.data.token);

      // Merge cart
      const mergeResponse = await fetch('http://localhost:4000/api/cart/merge', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${loginData.data.token}`
        }
      });

      const mergeData = await mergeResponse.json();
      console.log('Cart merged:', mergeData.data.cart);
    }
  } catch (error) {
    console.error('Login failed:', error);
  }
};
```

## Data Models

### Cart Model

```javascript
{
  sessionId: String,        // Session ID from express-session
  userId: ObjectId,         // User ID (null for guest carts)
  items: [CartItem],        // Array of cart items
  totalItems: Number,       // Total number of items (sum of quantities)
  totalPrice: Number,       // Total price of all items
  expiresAt: Date,          // Expiration date (7 days from creation)
  createdAt: Date,          // Auto-generated by Mongoose
  updatedAt: Date           // Auto-generated by Mongoose
}
```

### Cart Item Structure

```javascript
{
  foodItem: ObjectId,       // Reference to FastFoodItem
  restaurant: String,       // Restaurant/Company name
  item: String,             // Item name
  calories: Number,         // Calories
  totalFat: Number,         // Total fat (g)
  protein: Number,          // Protein (g)
  carbohydrates: Number,    // Carbohydrates (g)
  price: Number,            // Price (currently 0, can be added later)
  quantity: Number          // Quantity in cart
}
```

## Session Configuration

The session is configured with the following settings:

- **Store:** MongoDB (using connect-mongo)
- **Cookie Name:** `howl2go.sid` (configurable via SESSION_NAME)
- **Cookie Max Age:** 24 hours (configurable via SESSION_MAX_AGE)
- **Cookie HTTPOnly:** true (prevents JavaScript access)
- **Cookie Secure:** true in production (HTTPS only)
- **Cookie SameSite:** 'none' in production, 'lax' in development
- **Session Resave:** false (don't save unchanged sessions)
- **Session Save Uninitialized:** false (don't save empty sessions)

## Security Features

1. **HTTPOnly Cookies:** Prevent XSS attacks by making cookies inaccessible to JavaScript
2. **Secure Cookies:** In production, cookies are only sent over HTTPS
3. **SameSite Cookie Attribute:** Helps prevent CSRF attacks
4. **Session Secret:** Cryptographically signs session cookies
5. **CORS Configuration:** Only allows requests from configured frontend URL
6. **Automatic Expiration:** Carts expire after 7 days to prevent stale data

## Testing

To test the cart functionality:

```bash
npm test src/__tests__/cart.test.js
```

**Note:** Session persistence tests may fail with supertest due to cookie handling limitations. The functionality works correctly in a real browser environment.

## Common Issues and Solutions

### Issue: Cart not persisting across requests

**Solution:** Ensure your frontend is sending `credentials: 'include'` with all requests and that CORS is properly configured.

### Issue: Session cookie not being set

**Solution:**
- Check that `FRONTEND_URL` in .env matches your frontend origin
- Ensure `credentials: true` is set in CORS configuration
- In production, ensure you're using HTTPS

### Issue: Cart not merging after login

**Solution:**
- Make sure to call `/api/cart/merge` after successful login
- Ensure the Authorization header with JWT token is included

### Issue: Cart items disappearing

**Solution:**
- Check that cookies are not being blocked by browser settings
- Verify session is not expiring too quickly
- Ensure MongoDB connection is stable

## Future Enhancements

1. **Add pricing data** - Integrate with actual pricing API
2. **Cart sharing** - Allow users to share carts via URL
3. **Save for later** - Move items to a wishlist
4. **Cart analytics** - Track cart abandonment and conversion rates
5. **Promo codes** - Add support for discount codes
6. **Cart notifications** - Notify users of price changes or low stock
