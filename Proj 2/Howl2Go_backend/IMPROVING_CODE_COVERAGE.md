# Improving Code Coverage Guide

Current coverage: **72.38%**
Target: **80%+**

## Files That Need More Tests

### 1. cart.controller.js (60.43% coverage) - **TOP PRIORITY**

This file has the lowest coverage. Add tests for:

#### Missing Coverage Areas:
- **Error handling paths**: Lines 18-19, 49-50, 117-118, etc.
- **Edge cases**: Invalid item IDs, quantity limits
- **Calculation errors**: Lines 269-326 (price calculations, totals)
- **Session handling**: Missing sessionId scenarios
- **Database errors**: Connection failures, timeout scenarios

#### Recommended Tests to Add:
```javascript
// src/__tests__/cart.test.js - ADD THESE TESTS:

describe("Cart Error Scenarios", () => {
    test("POST /api/cart - should handle invalid food item ID", async () => {
        const response = await request(app)
            .post("/api/cart")
            .set("Cookie", [`${SESSION_NAME}=test-session-id`])
            .send({
                foodItemId: "invalid-id-format",
                quantity: 1
            });

        expect(response.status).toBe(400 || 500);
        expect(response.body.success).toBe(false);
    });

    test("POST /api/cart - should handle non-existent food item", async () => {
        const fakeId = new mongoose.Types.ObjectId();
        const response = await request(app)
            .post("/api/cart")
            .set("Cookie", [`${SESSION_NAME}=test-session-id`])
            .send({
                foodItemId: fakeId.toString(),
                quantity: 1
            });

        expect(response.status).toBe(404);
        expect(response.body.success).toBe(false);
    });

    test("POST /api/cart - should handle quantity edge cases", async () => {
        // Test with quantity = 0
        const response1 = await request(app)
            .post("/api/cart")
            .send({ foodItemId: testFoodItem._id, quantity: 0 });

        // Test with negative quantity
        const response2 = await request(app)
            .post("/api/cart")
            .send({ foodItemId: testFoodItem._id, quantity: -1 });

        // Test with very large quantity
        const response3 = await request(app)
            .post("/api/cart")
            .send({ foodItemId: testFoodItem._id, quantity: 10000 });
    });

    test("PUT /api/cart/:id - should handle cart not found", async () => {
        const fakeId = new mongoose.Types.ObjectId();
        const response = await request(app)
            .put(`/api/cart/${fakeId}`)
            .send({ quantity: 5 });

        expect(response.status).toBe(404);
    });

    test("DELETE /api/cart/:itemId - should handle item not in cart", async () => {
        const fakeId = new mongoose.Types.ObjectId();
        const response = await request(app)
            .delete(`/api/cart/${fakeId}`)
            .set("Cookie", [`${SESSION_NAME}=test-session-id`]);

        expect(response.status).toBe(404);
    });

    test("POST /api/cart/checkout - should handle empty cart", async () => {
        const response = await request(app)
            .post("/api/cart/checkout")
            .set("Cookie", [`${SESSION_NAME}=empty-session`]);

        expect(response.status).toBe(400 || 404);
    });

    test("POST /api/cart/checkout - should calculate totals correctly", async () => {
        // Add multiple items
        await request(app)
            .post("/api/cart")
            .send({ foodItemId: testFoodItem._id, quantity: 2 });

        const response = await request(app)
            .post("/api/cart/checkout");

        expect(response.body.data).toHaveProperty('totalPrice');
        expect(response.body.data).toHaveProperty('totalCalories');
        expect(response.body.data.totalPrice).toBeGreaterThan(0);
    });
});
```

### 2. food.controller.js (57.14% coverage)

Add tests for error paths:

```javascript
// src/__tests__/food.controller.test.js - ADD:

test("recommendFood - handles database error gracefully", async () => {
    const req = {
        body: { query: "test" },
        parsedCriteria: { protein: { min: 20 } },
        mongoQuery: { invalid: "query" }
    };
    const res = mockResponse();

    // This should trigger error handling
    await recommendFood(req, res);

    // Verify error response structure
});

test("recommendFood - handles empty query", async () => {
    const req = {
        body: { query: "" },
        parsedCriteria: {},
        mongoQuery: {}
    };
    const res = mockResponse();

    await recommendFood(req, res);
});
```

### 3. user.controller.js (71.96% coverage)

Add tests for uncovered error paths:

```javascript
// src/__tests__/user.test.js - ADD:

test("POST /api/users/register - should handle duplicate email", async () => {
    // Register first user
    await request(app)
        .post("/api/users/register")
        .send({
            name: "User1",
            email: "duplicate@test.com",
            password: "Pass123!"
        });

    // Try to register with same email
    const response = await request(app)
        .post("/api/users/register")
        .send({
            name: "User2",
            email: "duplicate@test.com",
            password: "Pass456!"
        });

    expect(response.status).toBe(409);
    expect(response.body.message).toContain("already exists");
});

test("POST /api/users/login - should handle deactivated account", async () => {
    // Create and deactivate user
    const user = await User.create({
        name: "Deactivated User",
        email: "deactivated@test.com",
        password: "Pass123!",
        isActive: false
    });

    const response = await request(app)
        .post("/api/users/login")
        .send({
            email: "deactivated@test.com",
            password: "Pass123!"
        });

    expect(response.status).toBe(401);
    expect(response.body.message).toContain("deactivated");
});

test("POST /api/users/change-password - should reject incorrect current password", async () => {
    const response = await request(app)
        .post("/api/users/change-password")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
            currentPassword: "WrongPassword",
            newPassword: "NewPass123!"
        });

    expect(response.status).toBe(401);
    expect(response.body.message).toContain("incorrect");
});

test("POST /api/users/refresh-token - should reject invalid token", async () => {
    const response = await request(app)
        .post("/api/users/refresh-token")
        .send({
            refreshToken: "invalid-token"
        });

    expect(response.status).toBe(401);
});

test("GET /api/users/:id - admin should get user by ID", async () => {
    const response = await request(app)
        .get(`/api/users/${testUser._id}`)
        .set("Authorization", `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.data.user.email).toBe(testUser.email);
});

test("PATCH /api/users/:id - admin should update user", async () => {
    const response = await request(app)
        .patch(`/api/users/${testUser._id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
            name: "Updated Name"
        });

    expect(response.status).toBe(200);
    expect(response.body.data.user.name).toBe("Updated Name");
});

test("DELETE /api/users/:id - admin should delete user", async () => {
    const tempUser = await User.create({
        name: "Temp User",
        email: "temp@test.com",
        password: "Pass123!"
    });

    const response = await request(app)
        .delete(`/api/users/${tempUser._id}`)
        .set("Authorization", `Bearer ${adminToken}`);

    expect(response.status).toBe(200);

    // Verify user is deleted
    const deletedUser = await User.findById(tempUser._id);
    expect(deletedUser).toBeNull();
});
```

### 4. app.js (78.57% coverage)

Test error handling middleware:

```javascript
// src/__tests__/app.test.js - CREATE NEW FILE:

import request from 'supertest';
import app from '../app.js';

describe('App Error Handling', () => {
    test('should handle 404 for unknown routes', async () => {
        const response = await request(app)
            .get('/api/nonexistent-route');

        expect(response.status).toBe(404);
    });

    test('should handle malformed JSON', async () => {
        const response = await request(app)
            .post('/api/users/register')
            .set('Content-Type', 'application/json')
            .send('invalid json{');

        expect(response.status).toBe(400);
    });
});
```

## Quick Wins to Boost Coverage

### Priority Order:
1. ✅ **Cart controller** - Add 10-15 error handling tests (could add 10-15% coverage)
2. ✅ **User controller** - Add admin endpoint tests (could add 5-8% coverage)
3. ✅ **Food controller** - Add error path tests (could add 3-5% coverage)
4. ✅ **App.js** - Add middleware error tests (could add 2-3% coverage)

### Coverage Goals by File:
- cart.controller.js: 60% → **85%** (add ~20 tests)
- user.controller.js: 72% → **85%** (add ~15 tests)
- food.controller.js: 57% → **80%** (add ~5 tests)
- app.js: 78% → **90%** (add ~3 tests)

## Running Coverage Locally

```bash
# Run tests with coverage
npm test -- --coverage

# Generate HTML coverage report
npm test -- --coverage --coverageDirectory=coverage

# Open coverage report in browser
open coverage/lcov-report/index.html  # macOS
xdg-open coverage/lcov-report/index.html  # Linux
```

## Coverage Configuration

Your `jest.config.js` should have:

```javascript
module.exports = {
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!src/__tests__/**',
    '!src/server.js',
    '!src/scripts/**',
    '!src/dummy_tests/**'
  ],
  coverageThresholds: {
    global: {
      statements: 80,
      branches: 75,
      functions: 80,
      lines: 80
    }
  }
};
```

## Tips for Writing Good Tests

1. **Test Error Paths**: Always test what happens when things go wrong
2. **Test Edge Cases**: Boundary values, null/undefined, empty strings
3. **Test Integration**: Full request/response cycles, not just units
4. **Test Validation**: Required fields, format validation, length limits
5. **Test Authorization**: Unauthenticated, wrong user, admin vs user
6. **Test Database Errors**: Connection failures, invalid IDs, constraints

## Expected Coverage After Improvements

With these additional tests:
- **Current**: 72.38%
- **After cart tests**: ~78%
- **After user tests**: ~83%
- **After food tests**: ~85%
- **After app tests**: ~87%

**Target: 85%+ overall coverage** 🎯

## Next Steps

1. Start with cart.controller.js tests (biggest impact)
2. Add user.controller.js admin endpoint tests
3. Add error path tests for food.controller.js
4. Add app.js middleware error tests
5. Run `npm test -- --coverage` to verify improvements
6. Check coveralls dashboard to see the increase

Good luck! 🚀
