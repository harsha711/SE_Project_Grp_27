# Backend Test Suite Documentation

## Overview
This document provides a comprehensive explanation of every test in the Howl2Go backend test suite. The tests are organized by file and cover all major functionality including API endpoints, middleware, services, utilities, and database operations.

---

## Table of Contents
1. [Test Setup & Teardown](#test-setup--teardown)
2. [app.test.js - Application Configuration Tests](#apptest-js)
3. [auth.middleware.test.js - Authentication Middleware Tests](#authmiddlewaretest-js)
4. [cart.test.js - Cart API Tests](#carttest-js)
5. [database.test.js - Database Connection Tests](#databasetest-js)
6. [food.controller.test.js - Food Controller Tests](#foodcontrollertest-js)
7. [food.integration.test.js - Food Integration Tests](#foodintegrationtest-js)
8. [food.routes.integration.test.js - Food Routes Integration Tests](#foodroutesintegrationtest-js)
9. [health.test.js - Health Check Tests](#healthtest-js)
10. [jwt.util.test.js - JWT Utility Tests](#jwtutiltest-js)
11. [llm.middleware.test.js - LLM Middleware Tests](#llmmiddlewaretest-js)
12. [llm.service.test.js - LLM Service Tests](#llmservicetest-js)
13. [user.test.js - User API Tests](#usertest-js)

---

## Test Setup & Teardown

### setup.js
**Purpose**: Global setup that runs once before all test suites.

**What it does**:
- Sets `NODE_ENV` to `'test'` to ensure tests run in test mode
- Outputs a confirmation message when setup is complete

### teardown.js
**Purpose**: Global teardown that runs once after all test suites complete.

**What it does**:
- Closes all MongoDB connections to prevent memory leaks
- Ensures clean exit after all tests complete

---

## app.test.js

### Purpose
Tests the main Express application configuration including CORS, middleware, routing, and error handling.

### Test Groups

#### CORS Configuration Tests
1. **"should accept requests from allowed origin"** - Verifies that requests from localhost:3000 are accepted and CORS headers are set
2. **"should handle preflight OPTIONS request"** - Tests that preflight CORS requests for POST operations are handled correctly
3. **"should allow credentials in CORS"** - Ensures the Access-Control-Allow-Credentials header is set to true
4. **"should handle requests without origin header"** - Verifies the app works even when no Origin header is present

#### Root Endpoint Tests
5. **"should return health check on root path"** - Tests GET / returns status "ok" with proper message
6. **"should return JSON content type"** - Verifies root endpoint returns application/json

#### 404 Handler Tests
7. **"should return 404 for non-existent routes"** - Tests 404 response for invalid routes
8. **"should return 404 for non-existent API routes"** - Tests 404 for invalid /api/* routes
9. **"should return 404 for POST to non-existent route"** - Tests POST requests to invalid routes
10. **"should return 404 for PUT to non-existent route"** - Tests PUT requests to invalid routes
11. **"should return 404 for DELETE to non-existent route"** - Tests DELETE requests to invalid routes
12. **"should return 404 for PATCH to non-existent route"** - Tests PATCH requests to invalid routes
13. **"should return 404 for deeply nested non-existent route"** - Tests 404 for complex nested paths

#### JSON Body Parsing Tests
14. **"should parse JSON body correctly"** - Verifies JSON request bodies are parsed
15. **"should handle malformed JSON"** - Tests error handling for invalid JSON
16. **"should handle empty JSON body"** - Tests handling of empty {} requests
17. **"should handle large JSON payload"** - Tests parsing of large nested JSON objects
18. **"should parse nested JSON objects"** - Verifies nested object parsing works correctly

#### Session Management Tests
19. **"should create session for new requests"** - Tests that sessions are created with set-cookie header
20. **"should maintain session across requests"** - Verifies sessions persist across multiple requests
21. **"should have HttpOnly cookie flag"** - Security test ensuring cookies are HttpOnly
22. **"should persist cart data across session requests"** - Tests session data persistence

#### URL Encoded Body Parsing Tests
23. **"should parse URL-encoded body"** - Tests application/x-www-form-urlencoded parsing
24. **"should parse complex URL-encoded data"** - Tests parsing of multiple URL-encoded parameters
25. **"should handle URL-encoded with special characters"** - Tests URL encoding/decoding

#### Request Methods Support Tests
26. **"should support GET requests"** - Verifies GET method support
27. **"should support POST requests"** - Verifies POST method support
28. **"should support PATCH requests"** - Verifies PATCH method support
29. **"should support DELETE requests"** - Verifies DELETE method support
30. **"should support PUT requests"** - Verifies PUT method support

#### Middleware Chain Tests
31. **"should apply morgan logging middleware"** - Tests logging middleware is active
32. **"should apply express.json middleware"** - Tests JSON parsing middleware
33. **"should apply express.urlencoded middleware"** - Tests URL encoding middleware
34. **"should apply session middleware"** - Tests session middleware configuration

#### Content Type Handling Tests
35. **"should handle missing content-type header"** - Tests requests without content-type
36. **"should return JSON responses"** - Verifies responses are JSON format
37. **"should handle JSON response for errors"** - Tests error responses are JSON

#### Error Handler Tests
38. **"should handle 404 errors consistently"** - Tests 404 error format consistency
39. **"should handle multiple 404 requests"** - Tests multiple concurrent 404 responses

#### API Routes Tests
40. **"should mount routes under /api prefix"** - Verifies /api prefix routing
41. **"should not respond to routes without /api prefix for API endpoints"** - Tests that API endpoints require /api prefix

#### Response Headers Tests
42. **"should include proper content-type header"** - Tests content-type headers are set
43. **"should include CORS headers when origin is provided"** - Tests CORS headers with origin

---

## auth.middleware.test.js

### Purpose
Tests the authentication and authorization middleware functions that protect routes.

### Test Cases

#### authenticate Middleware Tests
1. **"returns 401 when authorization header is missing"** - Tests missing auth header returns 401
2. **"returns 401 when token verification fails"** - Tests invalid JWT returns 401
3. **"returns 401 when user record is missing"** - Tests deleted user accounts are rejected
4. **"returns 401 when user is inactive"** - Tests deactivated accounts cannot authenticate
5. **"returns 401 when password was changed after token issuance"** - Security test for password changes invalidating old tokens
6. **"attaches user object and calls next on success"** - Tests successful authentication flow
7. **"returns 500 when an unexpected error occurs"** - Tests error handling for database failures

#### authorize Middleware Tests
8. **"returns 401 when user is missing"** - Tests authorization requires authentication first
9. **"returns 403 when role is not allowed"** - Tests role-based access control denies unauthorized roles
10. **"calls next when role is allowed"** - Tests authorized roles can proceed

#### optionalAuth Middleware Tests
11. **"continues without token"** - Tests optional auth allows unauthenticated requests
12. **"attaches user when token is valid"** - Tests optional auth attaches user if token present
13. **"ignores errors and moves on"** - Tests optional auth doesn't fail on bad tokens

---

## cart.test.js

### Purpose
Comprehensive tests for the shopping cart API endpoints including cart operations, error handling, and data integrity.

### Test Groups

#### GET /api/cart Tests
1. **"should return empty cart for new session"** - Tests new sessions get empty cart with totalItems=0

#### POST /api/cart/items Tests
2. **"should add item to cart"** - Tests adding item with specified quantity
3. **"should increase quantity when adding same item twice"** - Tests quantity accumulation
4. **"should return 400 if foodItemId is missing"** - Tests validation for required fields
5. **"should return 404 if food item does not exist"** - Tests invalid item ID handling

#### PATCH /api/cart/items/:foodItemId Tests
6. **"should update item quantity"** - Tests quantity updates
7. **"should remove item when quantity is 0"** - Tests setting quantity to 0 removes item

#### DELETE /api/cart/items/:foodItemId Tests
8. **"should remove item from cart"** - Tests item deletion

#### DELETE /api/cart Tests
9. **"should clear entire cart"** - Tests clearing all items from cart

#### Session Persistence Tests
10. **"should maintain cart across multiple requests"** - Tests session-based cart persistence

#### Error Handling Tests (11-18)
11. **"should handle invalid foodItemId format"** - Tests malformed ObjectId handling
12. **"should handle missing quantity"** - Tests validation for quantity field
13. **"should handle negative quantity"** - Tests rejection of negative quantities
14. **"should handle zero quantity"** - Tests zero quantity validation on add
15. **"should handle invalid item ID"** - Tests PATCH with invalid ID
16. **"should handle non-existent item"** - Tests updating non-existent items
17. **"should handle negative quantity update"** - Tests negative quantity in updates
18. **"should handle invalid item ID"** - Tests DELETE with invalid ID
19. **"should handle non-existent item"** - Tests deleting non-existent items

#### Cart Calculations Tests (20-23)
20. **"should calculate total price correctly"** - Tests price calculation
21. **"should calculate total calories correctly"** - Tests nutritional totals
22. **"should recalculate totals when quantity changes"** - Tests recalculation on updates

#### Multiple Items Tests (24-25)
23. **"should handle multiple different items in cart"** - Tests multiple item types
24. **"should remove specific item without affecting others"** - Tests selective deletion

#### POST /api/cart/merge Tests
25. **"should return 401 when user is not authenticated"** - Tests authentication requirement

#### Edge Cases - Missing Nutritional Data (26-27)
26. **"should handle adding item with missing nutritional data"** - Tests items with null/undefined nutrition
27. **"should handle item with partial nutritional data"** - Tests partial nutrition data defaults

#### Edge Cases - Quantity Handling (28-32)
28. **"should handle extremely large quantity"** - Tests large numbers (999999)
29. **"should handle string quantity and convert to integer"** - Tests type coercion
30. **"should handle float quantity by converting to integer"** - Tests rounding behavior
31. **"should handle very small quantity"** - Tests minimum valid quantity

#### Cart Not Found Scenarios (33-34)
32. **"should return 404 when updating non-existent cart"** - Tests cart existence checks
33. **"should return 404 when clearing non-existent cart"** - Tests clearing non-existent cart

#### Development vs Production Error Messages (35-36)
34. **"should handle error responses in development mode"** - Tests dev error details
35. **"should handle error responses in production mode"** - Tests production error hiding

#### Cart Item Data Integrity Tests (37-38)
36. **"should store complete food item data when adding to cart"** - Tests data completeness
37. **"should maintain data consistency across cart operations"** - Tests data doesn't corrupt

#### Concurrent Operations Tests (39-40)
38. **"should handle multiple add operations in sequence"** - Tests rapid sequential adds
39. **"should handle rapid quantity updates"** - Tests concurrent update handling

#### Cart Price Handling Tests (41-42)
40. **"should set price to 0 when adding items"** - Tests default pricing
41. **"should calculate totalPrice correctly"** - Tests total price calculation

#### User Association Tests (43-44)
42. **"should handle cart without userId"** - Tests guest carts
43. **"should create cart with session only"** - Tests session-based carts

#### Response Structure Validation Tests (45-49)
44. **"should return consistent response structure for getCart"** - Tests API response format
45. **"should return consistent response structure for addItemToCart"** - Tests add response
46. **"should return consistent response structure for updateCartItemQuantity"** - Tests update response
47. **"should return consistent response structure for removeItemFromCart"** - Tests delete response
48. **"should return consistent response structure for clearCart"** - Tests clear response

#### Message Variations Tests (49-50)
49. **"should return 'Item removed from cart' when quantity is set to 0"** - Tests specific message
50. **"should return 'Cart updated' when quantity is changed"** - Tests update message

#### Additional Coverage Tests (51-62)
51. **"should calculate price for food items with zero calories"** - Tests $2.00 default for 0 cal
52. **"should calculate price for food items with null calories"** - Tests null calorie handling
53. **"should calculate price with maximum cap for high-calorie items"** - Tests $15.00 max price
54. **"should calculate price with minimum floor for very low-calorie items"** - Tests $2.00 min price
55. **"should handle mergeCart with empty session cart and no existing user cart"** - Tests empty merge
56. **"should merge session cart into existing user cart"** - Tests cart merging logic
57. **"should associate guest cart with user when user logs in"** - Tests cart ownership transfer
58. **"should handle mergeCart when only session cart has items"** - Tests one-sided merge
59. **"should handle adding item with negative calories gracefully"** - Tests negative value handling
60. **"should populate foodItem reference when getting cart"** - Tests MongoDB population
61. **"should handle cart operations with all nutritional data fields"** - Tests full nutrition schema
62. **"should handle multiple different items in cart"** - Tests multi-item carts

---

## database.test.js

### Purpose
Tests MongoDB database connection and configuration.

### Test Cases

1. **"should connect to MongoDB successfully"** - Tests successful connection with readyState=1
2. **"should have database name defined"** - Tests database name is set
3. **"should be connected to test database"** - Safety check ensures test DB is used
4. **"should have connection host defined"** - Tests host configuration
5. **"should maintain connection state"** - Tests connection remains stable
6. **"should have connection configuration"** - Tests connection object exists
7. **"should handle connection string"** - Tests connection string is available
8. **"should have proper connection options"** - Tests connection options are set
9. **"should be able to check connection status"** - Tests connection status checking
10. **"should have database client"** - Tests MongoDB client is available

---

## food.controller.test.js

### Purpose
Unit tests for food recommendation controller logic.

### Test Cases

1. **"recommendFood - handles limit parameter"** - Tests limit parameter parsing (5 items)
2. **"recommendFood - uses default limit when not provided"** - Tests default limit of 5
3. **"recommendFood - determines sort criteria for high protein"** - Tests protein descending sort
4. **"recommendFood - determines sort criteria for low calories"** - Tests calories ascending sort
5. **"recommendFood - determines sort criteria for low fat"** - Tests fat ascending sort

---

## food.integration.test.js

### Purpose
Integration tests for food recommendation API with mocked LLM service.

### Test Setup
- Seeds test database with 4 food items (3 from "Integration Test Kitchen", 1 from "Outside Vendor")
- Mocks LLM service to return predefined criteria
- Includes safety check to prevent production DB testing

### Test Cases

#### Successful Recommendation Tests
1. **"sorts recommendations by protein when criteria requests high protein"** - Tests protein sorting, expects 2 results with highest protein first

#### Error Handling Tests
2. **"should handle missing query"** - Tests 400 for empty request body
3. **"should handle empty query string"** - Tests 400 for ""
4. **"should handle null query"** - Tests 400 for null
5. **"should handle non-string query"** - Tests 400 for number input
6. **"should handle query with no nutritional criteria"** - Tests 400 for non-food queries
7. **"should return empty results when no matches"** - Tests empty array for impossible criteria

#### Sorting Logic Tests
8. **"should sort by calories (low to high) when querying low calorie"** - Tests calorie ascending sort

#### Multiple Criteria Tests
9. **"should handle multiple nutritional criteria"** - Tests protein AND calories filters
10. **"should handle carb range criteria"** - Tests min/max range queries

---

## food.routes.integration.test.js

### Purpose
Lightweight integration tests for food API routes (requires actual Groq API).

### Test Cases

1. **"returns 400 when query is missing"** - Tests validation for empty body
2. **"returns 400 when query yields no criteria"** - Tests non-food prompts (conditional on API key)
3. **"handles limit parameter"** - Tests limit parameter exists in request
4. **"POST /api/food/recommend endpoint exists"** - Tests route is mounted

**Note**: Tests 2 and beyond only run if GROQ_API_KEY is set in environment.

---

## health.test.js

### Purpose
Tests for health check endpoint used for monitoring.

### Test Cases

1. **"GET /api/health responds with service status"** - Tests returns status="ok", service name, timestamp, and uptime
2. **"GET /api/unknown returns 404 payload"** - Tests 404 handler works with proper message

---

## jwt.util.test.js

### Purpose
Tests JWT token generation, verification, and extraction utilities.

### Test Groups

#### Token Generation Tests
1. **"generateAccessToken embeds id, email, and role claims"** - Tests access token payload
2. **"generateAccessToken defaults role to user when omitted"** - Tests default role
3. **"generateRefreshToken creates refresh token with type claim"** - Tests refresh token has type="refresh"

#### Token Verification Tests
4. **"verifyToken returns payload for valid access token"** - Tests successful verification
5. **"verifyToken validates refresh tokens when flag is set"** - Tests refresh token validation
6. **"verifyToken throws helpful error for invalid token"** - Tests error message clarity
7. **"verifyToken throws helpful error when token expired"** - Tests expiration handling

#### Token Decoding Tests
8. **"decodeToken returns payload without verification"** - Tests unsafe decoding
9. **"decodeToken returns null for malformed token"** - Tests malformed token handling

#### Token Extraction Tests
10. **"extractTokenFromHeader supports Bearer scheme"** - Tests "Bearer token" parsing
11. **"extractTokenFromHeader returns raw token when Bearer absent"** - Tests raw token
12. **"extractTokenFromHeader returns null when header missing"** - Tests undefined header

---

## llm.middleware.test.js

### Purpose
Tests middleware that parses user queries using LLM and builds MongoDB queries.

### Test Groups

#### parseLLMQuery Tests
1. **"returns 400 when query is missing"** - Tests missing query parameter
2. **"returns 400 when query is not a string"** - Tests type validation
3. **"returns 400 when query is empty string"** - Tests empty string rejection
4. **"returns 400 when query is null"** - Tests null rejection

#### buildMongoQuery Tests
5. **"returns 400 when parsedCriteria is missing"** - Tests missing criteria
6. **"builds query successfully when criteria exists"** - Tests MongoDB query generation
7. **"builds empty query when criteria is empty object"** - Tests empty criteria handling

#### validateCriteria Tests
8. **"returns 400 when criteria is missing"** - Tests missing criteria validation
9. **"returns 400 when criteria is empty object"** - Tests empty object validation
10. **"calls next when criteria has values"** - Tests valid criteria passes
11. **"calls next when criteria has multiple values"** - Tests multiple criteria validation

---

## llm.service.test.js

### Purpose
Comprehensive tests for LLM service that translates natural language to database queries.

### Test Groups

#### buildPrompt Tests
1. **"buildPrompt creates correct prompt format"** - Tests prompt includes user query and instructions

#### buildMongoQuery - Single Field Tests (2-16)
2. **"handles protein min constraint"** - Tests protein >= value
3. **"handles calories max constraint"** - Tests calories <= value
4. **"handles multiple constraints"** - Tests combining constraints
5. **"handles min and max for same field"** - Tests range queries
6. **"handles all supported fields"** - Tests all 10 nutritional fields
7. **"returns empty object for empty criteria"** - Tests empty input
8. **"ignores unknown fields"** - Tests field validation
9. **"handles item name search"** - Tests regex search for items
10. **"handles company name search"** - Tests regex search for restaurants
11. **"handles item name with nutritional criteria"** - Tests combined queries
12. **"handles item and company search together"** - Tests multiple text searches

#### buildPrompt Context Tests
13. **"includes item name examples"** - Tests prompt has examples

#### Single Constraint Unit Tests (14-23)
14-23. **Various single constraint tests** - Tests each field individually (calories, protein, fat, sodium, etc.)

#### parseQuery Non-Food Tests (24-28)
24. **"returns empty object for joke request"** - Tests non-food queries return {}
25. **"returns empty object for prompt injection attempt"** - Security test
26. **"returns empty object for weather query"** - Tests off-topic queries
27. **"returns empty object for general conversation"** - Tests greetings
28. **"returns empty object for math question"** - Tests math queries

#### Initialize Method Tests (29-31)
29. **"initialize should set initialized flag to true"** - Tests initialization
30. **"initialize should skip if already initialized"** - Tests idempotency
31. **"initialize should create Groq client"** - Tests client creation

#### buildMongoQuery Edge Cases (32-42)
32. **"handles caloriesFromFat field"** - Tests caloriesFromFat support
33. **"handles caloriesFromFat with min"** - Tests minimum constraint
34. **"ignores item without name property"** - Tests malformed item criteria
35. **"ignores company without name property"** - Tests malformed company criteria
36. **"handles empty constraint object"** - Tests empty protein: {}
37. **"handles constraint with only unrecognized properties"** - Tests invalid properties
38. **"handles all nutritional fields"** - Tests complete nutritional query

#### parseQuery Input Validation (39-43)
39. **"should throw error for undefined input"** - Tests undefined rejection
40. **"should throw error for boolean input"** - Tests boolean rejection
41. **"should throw error for array input"** - Tests array rejection
42. **"should throw error for object input"** - Tests object rejection

#### parseQuery Integration Test
43. **"handles multiple constraints from natural language"** - Tests actual LLM parsing with timeout

---

## user.test.js

### Purpose
Comprehensive tests for user authentication, registration, and profile management.

### Test Groups

#### Registration Tests (1-5)
1. **"should register a new user successfully"** - Tests POST /api/users/register with valid data
2. **"should fail with duplicate email"** - Tests 409 for existing email
3. **"should fail without required fields"** - Tests 400 for missing fields
4. **"should fail with invalid email"** - Tests email format validation
5. **"should fail with short password"** - Tests password length requirement

#### Login Tests (6-9)
6. **"should login successfully"** - Tests POST /api/users/login returns tokens
7. **"should fail with incorrect password"** - Tests 401 for wrong password
8. **"should fail with non-existent email"** - Tests 401 for unknown user
9. **"should fail without credentials"** - Tests 400 for empty body

#### Profile Tests (10-12)
10. **"should get profile with valid token"** - Tests GET /api/users/profile
11. **"should fail without token"** - Tests 401 for unauthenticated request
12. **"should fail with invalid token"** - Tests 401 for malformed token

#### Password Change Tests (13-15)
13. **"should change password successfully"** - Tests POST /api/users/change-password
14. **"should fail with wrong current password"** - Tests 401 for incorrect password
15. **"should login with new password"** - Tests password change persisted

#### Refresh Token Tests (16-18)
16. **"should refresh access token"** - Tests POST /api/users/refresh-token
17. **"should fail with invalid token"** - Tests 401 for bad refresh token
18. **"should fail without refresh token"** - Tests 400 for missing token

#### Additional Password Change Tests (19-20)
19. **"should fail with missing fields"** - Tests validation
20. **"should fail with weak new password"** - Tests password strength

#### Error Handling Tests (21-27)
21. **"should fail for non-existent user"** - Tests 404 for deleted user
22. **"should handle email case insensitivity"** - Tests email normalization
23. **"should handle email case insensitivity in login"** - Tests case-insensitive login
24. **"should fail for non-existent user on password change"** - Tests 404 handling
25. **"should fail for non-existent user on refresh"** - Tests 401 for missing user
26. **"should fail for deactivated user account"** - Tests inactive account rejection
27. **"should fail for inactive user on refresh"** - Tests inactive user refresh rejection

#### Validation Tests (28-29)
28. **"should handle mongoose validation errors properly"** - Tests validation error format
29. **"should handle mongoose validation errors on password change"** - Tests change-password validation

#### Profile Response Tests (30-34)
30. **"should return all user fields including timestamps"** - Tests complete profile response
31. **"should handle database connection errors gracefully"** - Tests error handling
32. **"should return refreshToken along with accessToken"** - Tests login response completeness
33. **"should generate new tokens after password change"** - Tests token regeneration
34. **Tests changing password back** - Cleanup test for subsequent runs

---

## Test Coverage Summary

### Total Tests: 270+

### Coverage Areas:
- **API Endpoints**: All REST endpoints tested with success and error cases
- **Authentication**: JWT generation, verification, refresh, and middleware
- **Authorization**: Role-based access control
- **Database**: Connection, queries, and error handling
- **Cart Operations**: CRUD operations, calculations, merging, and edge cases
- **Food Recommendations**: Natural language processing, filtering, and sorting
- **Input Validation**: Type checking, format validation, and sanitization
- **Error Handling**: 400, 401, 403, 404, 409, and 500 responses
- **Session Management**: Cookie handling and persistence
- **Price Calculations**: Min/max pricing with calorie-based pricing
- **Nutritional Data**: Complete nutritional information handling
- **Security**: Password hashing, token validation, CORS, HttpOnly cookies

### Test Patterns Used:
- **Unit Tests**: Individual functions and utilities
- **Integration Tests**: Full API request/response cycles
- **Edge Cases**: Boundary values, null/undefined, malformed data
- **Security Tests**: Authentication bypass attempts, injection tests
- **Performance Tests**: Large payloads, concurrent operations
- **Consistency Tests**: Response format validation across endpoints

---

## Running the Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- app.test.js

# Run with coverage
npm test -- --coverage

# Run in watch mode
npm test -- --watch
```

## Test Database Safety

All test files include safety checks to prevent running against production databases:
```javascript
const dbName = mongoose.connection.name;
if (!dbName.includes("test") && process.env.NODE_ENV !== "test") {
    throw new Error("Tests trying to run against non-test database");
}
```

---

## Dependencies

- **Jest**: Test framework
- **Supertest**: HTTP assertion library
- **MongoDB/Mongoose**: Database interaction
- **JWT**: Token management
- **Express**: Web framework

---

**Last Updated**: November 2025
**Test Framework Version**: Jest 29.x
**Node Version**: 18.x+
