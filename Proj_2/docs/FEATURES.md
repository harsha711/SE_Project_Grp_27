# Howl2Go - Feature List

**Last Updated:** November 6th, 2025

---

## Overview

Howl2Go is a smart food discovery platform that uses natural language AI to help users find fast food items matching their nutritional preferences. This document lists all the features in the current codebase.

---

## Implemented Features

### 1. User Authentication & Profiles

**Endpoints:**
- `POST /api/users/register` - User registration
- `POST /api/users/login` - User login
- `GET /api/users/profile` - Get user profile (authenticated)
- `POST /api/users/change-password` - Change password (authenticated)
- `POST /api/users/refresh-token` - Refresh access token

**Features:**
- JWT-based authentication (access + refresh tokens)
- Password hashing with bcrypt (salt rounds: 12)
- Email validation and uniqueness enforcement
- Token expiration: 7 days (access), 30 days (refresh)
- Role-based system (user/admin)
- Account status tracking (active/inactive)
- Last login timestamp
- User preferences storage (dietary restrictions, favorite restaurants, calorie/protein goals)

**User Model:**
```javascript
{
  name: String,
  email: String (unique, lowercase),
  password: String (hashed, not returned in responses),
  role: String (user/admin),
  isActive: Boolean,
  lastLogin: Date,
  preferences: {
    dietaryRestrictions: [String],
    favoriteRestaurants: [String],
    maxCalories: Number,
    minProtein: Number
  }
}
```

---

### 2. AI-Powered Food Search & Recommendations

**Endpoint:**
- `POST /api/food/recommend` - Get food recommendations based on natural language

**Features:**
- **LLM Integration:** Groq API with Llama 3.1 8B Instant model
- Natural language query parsing (e.g., "high protein low carb under 500 calories")
- Extracts nutritional criteria from conversational queries
- Supports multiple constraints: calories, protein, fats, carbs, fiber, sugar, sodium, cholesterol
- Item name search (e.g., "burger", "Big Mac", "chicken sandwich")
- Company/restaurant name search
- Min/max range support (e.g., "between 400 and 600 calories")
- Smart sorting based on query intent:
  - High protein queries → sorted by protein descending
  - Low calorie queries → sorted by calories ascending
  - Low fat queries → sorted by fat ascending
- Automatic price calculation based on calories ($0.01/cal, min $2, max $15)

**Example Request:**
```json
POST /api/food/recommend
{
  "query": "high protein low fat meal under 500 calories"
}
```

**LLM Service:**
- Converts natural language to structured criteria
- Builds MongoDB queries from criteria
- Handles non-food queries (returns empty criteria)
- Error handling for invalid queries

---

### 3. Shopping Cart Management

**Endpoints:**
- `GET /api/cart` - Get current cart
- `POST /api/cart/items` - Add item to cart
- `PATCH /api/cart/items/:foodItemId` - Update item quantity
- `DELETE /api/cart/items/:foodItemId` - Remove specific item
- `DELETE /api/cart` - Clear entire cart
- `POST /api/cart/merge` - Merge guest cart with user cart on login (authenticated)

**Features:**
- **Session-based carts** for guest users (no login required)
- **User-based carts** for authenticated users
- Automatic cart creation on first use
- Stores complete item details:
  - Restaurant name
  - Item name
  - Nutritional information (calories, protein, fat, carbs)
  - Price
  - Quantity
- Auto-calculated totals:
  - Total items count
  - Total price
  - Total calories
- Item deduplication (adding same item increases quantity)
- Guest-to-user cart merging on authentication
- Cart persistence (7-day expiration via MongoDB TTL index)
- Quantity management (update or set to 0 to remove)

**Cart Model:**
```javascript
{
  sessionId: String (unique, indexed),
  userId: ObjectId (optional, indexed),
  items: [{
    foodItem: ObjectId,
    restaurant: String,
    item: String,
    calories: Number,
    totalFat: Number,
    protein: Number,
    carbohydrates: Number,
    price: Number,
    quantity: Number
  }],
  totalItems: Number (auto-calculated),
  totalPrice: Number (auto-calculated),
  expiresAt: Date (7 days from creation)
}
```

---

### 4. Fast Food Database

**Database:** MongoDB with 1,148+ fast food items

**Supported Restaurants:**
- McDonald's
- Burger King
- Wendy's
- KFC
- Taco Bell
- Pizza Hut

**FastFoodItem Model:**
```javascript
{
  company: String,
  item: String,
  calories: Number,
  caloriesFromFat: Number,
  totalFat: Number,
  saturatedFat: Number,
  transFat: Number,
  cholesterol: Number,
  sodium: Number,
  carbs: Number,
  fiber: Number,
  sugars: Number,
  protein: Number,
  weightWatchersPoints: Number
}
```

**Database Optimizations:**
- Text indexes on item and company fields for efficient search
- Compound index on (company, item)
- Nutritional field indexes for filtering

---

### 5. Session Management

**Technology:** express-session + connect-mongo

**Features:**
- MongoDB-backed session storage
- Session encryption with crypto secret
- Secure cookies:
  - `httpOnly: true`
  - `secure: true` (production only)
  - `sameSite: 'none'` (production) or `'lax'` (development)
- Session max age: 24 hours (configurable)
- Lazy session updates (24-hour touchAfter)
- Session persistence across server restarts

---

### 6. Security & Middleware

**Authentication Middleware:**
- `authenticate` - Requires valid JWT token
- `optionalAuth` - Accepts token if provided, continues without if missing
- `authorize(roles)` - Role-based access control

**LLM Middleware:**
- `parseLLMQuery` - Converts natural language to criteria using Groq API
- `buildMongoQuery` - Converts criteria to MongoDB query
- `validateCriteria` - Ensures meaningful criteria exists

**Security Features:**
- Password hashing with bcrypt (12 salt rounds)
- JWT token validation
- Token expiration handling
- CORS configuration with credentials support
- Password change invalidates old tokens (via passwordChangedAt timestamp)
- User active status validation

---

### 7. API Health & Monitoring

**Endpoint:**
- `GET /api/health` - Health check

**Response:**
```json
{
  "status": "ok",
  "message": "Food Delivery API is running"
}
```

---

### 8. Testing Infrastructure

**Test Coverage:**
- User authentication tests (registration, login, profile, password change)
- Cart management tests (add, update, remove, merge)
- Food controller tests
- LLM service tests (query parsing, MongoDB query building)
- Database connection tests
- Health check tests

**Testing Framework:**
- Jest with Supertest for API testing
- MongoDB memory server for test isolation
- Test database safety checks

---

## Technical Stack

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express.js 5.1.0
- **Database:** MongoDB with Mongoose 8.19.1
- **Authentication:** JWT (jsonwebtoken 9.0.2)
- **Password Hashing:** bcrypt 5.1.1
- **AI/LLM:** Groq SDK 0.33.0 (Llama 3.1 8B Instant)
- **Session:** express-session 1.18.1 + connect-mongo 5.1.0
- **Testing:** Jest 29.x + Supertest 7.1.4

### Frontend
- **Framework:** Next.js 15.5.5 (React 19.1.0)
- **Language:** TypeScript 5.x
- **Styling:** Tailwind CSS 4.x
- **Animations:** Framer Motion 12.23.24
- **Icons:** Lucide React 0.545.0

### DevOps
- **Pre-commit Hooks:** Husky 9.1.7 + lint-staged 16.2.4
- **Code Quality:** ESLint
- **API Testing:** Supertest 7.1.4

---

## Configuration

**Environment Variables Required:**
```bash
# Server
PORT=4000
NODE_ENV=development

# Database
MONGODB_URI=your-mongodb-url

# Authentication
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Session
SESSION_SECRET=your-session-secret
SESSION_NAME=howl2go.sid
SESSION_MAX_AGE=86400000

# AI/LLM
GROQ_API_KEY=your-groq-api-key

# Frontend (for CORS)
FRONTEND_URL=http://localhost:3000
```

---

## API Routes Summary

### User Routes (`/api/users`)
| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/register` | No | Register new user |
| POST | `/login` | No | Login user |
| GET | `/profile` | Yes | Get user profile |
| POST | `/change-password` | Yes | Change password |
| POST | `/refresh-token` | No | Refresh access token |

### Food Routes (`/api/food`)
| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/recommend` | No | Get food recommendations |

### Cart Routes (`/api/cart`)
| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/` | No | Get current cart |
| POST | `/items` | No | Add item to cart |
| PATCH | `/items/:foodItemId` | No | Update item quantity |
| DELETE | `/items/:foodItemId` | No | Remove item from cart |
| DELETE | `/` | No | Clear cart |
| POST | `/merge` | Yes | Merge guest cart with user cart |

### Health Routes (`/api`)
| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/health` | No | Health check |

---

## Planned Features

The following features are planned for the future:

- Order History
- Payment processing (Stripe/PayPal integration)
- AI Meal Suggestions based on Order History
- Ingredient based filtering/recommendations
- Rate limiting
- Query caching

---

## Running the Application

### Backend Setup
```bash
cd Howl2Go_backend
npm install
npm run import:fastfood  # Import food data
npm run dev              # Start development server
```

### Frontend Setup
```bash
cd Howl2Go_frontend
npm install
npm run dev              # Start with Turbopack
```

### Run Tests
```bash
cd Howl2Go_backend
npm test
```

---

## Performance Notes

- LLM query processing: ~400-500ms via Groq API
- Database queries: < 100ms with proper indexes
- Cart operations: Session-backed, fast in-memory access
- Token validation: < 5ms with JWT

---

**Document Maintained By:** SE_Project_Grp_27
**Last Updated:** November 6th, 2025

*Crave it. Find it. Instantly.*
