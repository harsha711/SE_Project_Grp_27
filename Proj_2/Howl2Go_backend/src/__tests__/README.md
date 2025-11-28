# Test Suite Documentation

This document describes all the test files in the Howl2Go backend test suite.

## Test Structure

All tests follow a consistent structure:
- Use Jest as the testing framework
- Use Supertest for HTTP endpoint testing
- Include database safety checks to prevent running against production
- Clean up test data before and after tests
- Use `beforeAll`, `afterAll`, and `beforeEach` hooks for setup/teardown

## Test Files

### 1. `order.test.js`
Tests for the Order API endpoints.

**Coverage:**
- `POST /api/orders` - Create order from cart
  - Successful order creation
  - Authentication required
  - Empty cart validation
  - Unique order number generation
- `GET /api/orders` - Get order history
  - Fetch user's orders
  - Authentication required
  - Pagination support
- `GET /api/orders/insights` - Get order insights
  - Nutrition patterns
  - Dietary trends
  - Personalized recommendations
- `GET /api/orders/:orderId` - Get specific order
  - Order details retrieval
  - 404 for non-existent orders
  - Authorization (users can only see their own orders)

### 2. `review.test.js`
Tests for the Review API endpoints.

**Coverage:**
- `POST /api/reviews` - Create review
  - Successful review creation
  - Required fields validation
  - Food item existence check
  - Duplicate review prevention (one review per user per item)
  - Rating range validation (1-5)
  - Authentication required
- `GET /api/reviews/food/:foodItemId` - Get reviews for food item
  - Fetch all reviews for an item
  - Review statistics (average rating, total reviews)
  - Empty reviews handling
- `PATCH /api/reviews/:reviewId` - Update review
  - Update own review
  - Authorization (users can only update their own reviews)
  - 404 for non-existent reviews
- `DELETE /api/reviews/:reviewId` - Delete review
  - Delete own review
  - Authorization (users can only delete their own reviews)
- `PATCH /api/reviews/:reviewId/helpful` - Mark review helpful
  - Helpful vote functionality

### 3. `bug.test.js`
Tests for the Bug Report API endpoints.

**Coverage:**
- `POST /api/bugs` - Submit bug report
  - Authenticated bug submission
  - Anonymous bug submission
  - Required fields validation (title, description)
  - Severity enum validation
  - AssignedTo enum validation
- `GET /api/bugs` - Get all bug reports (Admin only)
  - Admin access required
  - Fetch all bug reports
  - 403 for non-admin users
  - 401 for unauthenticated users

### 4. `admin.test.js`
Tests for the Admin Analytics API endpoints.

**Coverage:**
- `GET /api/admin/analytics/dashboard` - Get comprehensive dashboard data
  - Admin access required
  - Platform analytics
  - Restaurant analytics
  - Order trends
  - Top restaurants
- `GET /api/admin/analytics/restaurants` - Get restaurant analytics
  - Restaurant performance metrics
  - Time range filtering
  - Admin access required
- `GET /api/admin/analytics/platform` - Get platform analytics
  - Overall platform statistics
  - Revenue, orders, users metrics
  - Admin access required
- `GET /api/admin/analytics/trends` - Get order trends
  - Time-based order trends
  - Different grouping options (day, week, month)
  - Admin access required
- `GET /api/admin/analytics/top-restaurants` - Get top restaurants
  - Top restaurants by revenue
  - Top restaurants by orders
  - Metric and limit parameters
  - Admin access required

### 5. `orderAnalytics.test.js`
Tests for the Order Analytics service functions.

**Coverage:**
- `analyzeNutritionPatterns(userId, timeRange)`
  - Calculate average nutrition values
  - Identify most ordered restaurants
  - Identify most ordered items
  - Time range filtering
  - Empty order history handling
- `trackDietaryTrends(userId, timeRange)`
  - Track dietary changes over time
  - Generate insights
  - Empty order history handling
- `generatePersonalizedRecommendations(userId)`
  - Generate recommendations based on order history
  - Empty order history handling

### 6. `adminAnalytics.test.js`
Tests for the Admin Analytics service functions.

**Coverage:**
- `getRestaurantAnalytics(timeRange)`
  - Restaurant performance metrics
  - Revenue, orders, items per restaurant
  - Nutritional data per restaurant
  - Popular items per restaurant
  - Time range filtering
- `getPlatformAnalytics(timeRange)`
  - Overall platform statistics
  - Total revenue, orders, users
  - Average order value
  - Nutritional totals
- `getOrderTrends(timeRange, groupBy)`
  - Order trends over time
  - Different grouping options (day, week, month, hour)
  - Revenue and order count trends
- `getTopRestaurants(metric, limit, timeRange)`
  - Top restaurants by revenue
  - Top restaurants by orders
  - Top restaurants by items
  - Top restaurants by calories/protein
  - Limit parameter support

## Running Tests

### Run all tests:
```bash
npm test
```

### Run specific test file:
```bash
npm test -- order.test.js
npm test -- review.test.js
npm test -- bug.test.js
npm test -- admin.test.js
npm test -- orderAnalytics.test.js
npm test -- adminAnalytics.test.js
```

### Run tests in watch mode:
```bash
npm test -- --watch
```

### Run tests with coverage:
```bash
npm test -- --coverage
```

## Test Database Safety

All test files include safety checks to prevent running against production databases:

1. **Database name check**: Database name must include "test" OR `NODE_ENV` must be "test"
2. **Error on production**: Tests will throw an error and stop if trying to run against production
3. **Cleanup**: All test data is cleaned up after tests complete

## Test Coverage Goals

- **Lines**: 50% minimum
- **Functions**: 50% minimum
- **Branches**: 50% minimum
- **Statements**: 50% minimum

## Test Data Management

- Test data is created in `beforeAll` hooks
- Test data is cleaned up in `afterAll` hooks
- Individual test data is cleaned up in `beforeEach` hooks when needed
- Each test should be independent and not rely on data from other tests

## Common Test Patterns

### Authentication Testing
```javascript
test("should return 401 if not authenticated", async () => {
  const response = await request(app).get("/api/endpoint");
  assert.equal(response.status, 401);
});
```

### Admin Authorization Testing
```javascript
test("should return 403 if non-admin tries to access", async () => {
  const response = await request(app)
    .get("/api/admin/endpoint")
    .set("Authorization", `Bearer ${regularToken}`);
  assert.equal(response.status, 403);
});
```

### Validation Testing
```javascript
test("should return 400 if required field is missing", async () => {
  const response = await request(app)
    .post("/api/endpoint")
    .set("Authorization", `Bearer ${authToken}`)
    .send({ /* missing required field */ });
  assert.equal(response.status, 400);
});
```

## Notes

- All tests use `assert` from Node.js for assertions
- Tests use `supertest` for HTTP endpoint testing
- Database connections are managed through `connectDB()` utility
- JWT tokens are generated using `generateAccessToken()` utility
- Test users and data are created fresh for each test suite

