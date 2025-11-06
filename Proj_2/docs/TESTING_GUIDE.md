# Testing Guide - Howl2Go

**Comprehensive testing documentation for Howl2Go project**

## Table of Contents

1. [Overview](#overview)
2. [Test Types](#test-types)
3. [Testing Stack](#testing-stack)
4. [Running Tests](#running-tests)
5. [Frontend Testing](#frontend-testing)
6. [Backend Testing](#backend-testing)
7. [Manual Testing](#manual-testing)
8. [Test Coverage](#test-coverage)
9. [Writing New Tests](#writing-new-tests)
10. [Best Practices](#best-practices)
11. [CI/CD Integration](#cicd-integration)

---

## Overview

Howl2Go follows a comprehensive testing strategy combining automated and manual testing approaches to ensure code quality, reliability, and user experience.

### Testing Philosophy

- **Test Early, Test Often** - Write tests alongside feature development
- **Meaningful Coverage** - Focus on critical user paths, not just coverage metrics
- **Fast Feedback** - Tests should run quickly for rapid iteration
- **Clear Failures** - Test failures should clearly indicate what broke and why

### Test Pyramid Strategy

```
       /\
      /  \       E2E Tests (10%)
     /----\      Integration Tests (30%)
    /------\     Unit Tests (60%)
   /________\
```

---

## Test Types

### 1. Unit Tests

**Purpose:** Test individual functions/methods in isolation

**Coverage:**
- Utility functions
- Data transformations
- Calculations
- Pure functions

**Example:**
```typescript
describe('calculateSubtotal', () => {
  it('sums item prices correctly', () => {
    const items = [
      { price: 5.99, quantity: 2 },
      { price: 7.49, quantity: 1 }
    ]
    expect(calculateSubtotal(items)).toBe(19.47)
  })
})
```

### 2. Component Tests

**Purpose:** Test React components in isolation

**Coverage:**
- Component rendering
- User interactions
- State management
- Props handling

**Example:**
```typescript
describe('CartItem', () => {
  it('renders item details correctly', () => {
    render(<CartItem item={mockItem} />)
    expect(screen.getByText('Big Mac')).toBeInTheDocument()
  })
})
```

### 3. Integration Tests

**Purpose:** Test multiple components/modules working together

**Coverage:**
- Page components with API calls
- State management across components
- Routing and navigation
- Data flow

**Example:**
```typescript
describe('Search Flow', () => {
  it('displays results after search', async () => {
    render(<SearchPage />)
    fireEvent.change(searchInput, { target: { value: 'high protein' } })
    fireEvent.click(submitButton)
    await waitFor(() => {
      expect(screen.getByText('Grilled Chicken')).toBeInTheDocument()
    })
  })
})
```

### 4. API Tests

**Purpose:** Test backend endpoints

**Coverage:**
- Request/response handling
- Error handling
- Data validation
- Authentication

**Example:**
```javascript
describe('POST /api/food/search', () => {
  it('returns food items matching criteria', async () => {
    const response = await request(app)
      .post('/api/food/search')
      .send({ query: 'high protein' })
      .expect(200)

    expect(response.body.success).toBe(true)
    expect(response.body.results).toHaveLength(10)
  })
})
```

### 5. E2E Tests

**Purpose:** Test complete user workflows (Coming Soon)

**Coverage:**
- Full user journeys
- Cross-browser compatibility
- Real API interactions

**Tools:** Playwright or Cypress (TBD)

### 6. Manual Tests

**Purpose:** Human verification of features

**Coverage:**
- UI/UX quality
- Visual design
- Accessibility
- Edge cases

---

## Testing Stack

### Frontend Testing

| Tool | Purpose | Version |
|------|---------|---------|
| **Jest** | Test runner | 29+ |
| **React Testing Library** | Component testing | 14+ |
| **@testing-library/user-event** | User interaction simulation | 14+ |
| **@testing-library/jest-dom** | DOM matchers | 6+ |

### Backend Testing (Planned)

| Tool | Purpose | Status |
|------|---------|--------|
| **Jest** | Test runner | ✅ Configured |
| **Supertest** | API testing | 📋 Planned |
| **MongoDB Memory Server** | In-memory database | 📋 Planned |

---

## Running Tests

### Frontend Tests

```bash
cd "Proj 2/Howl2Go_frontend"

# Run all tests
npm test

# Run specific test file
npm test Cart.test.tsx

# Watch mode (re-run on file changes)
npm test -- --watch

# Coverage report
npm test -- --coverage

# Update snapshots
npm test -- -u
```

### Backend Tests (Planned)

```bash
cd "Proj 2/Howl2Go_backend"

# Run all tests
npm test

# Run specific test suite
npm test -- food.test.js

# Watch mode
npm test -- --watch

# Coverage
npm test -- --coverage
```

### Run All Tests

```bash
# From project root
npm test --workspaces
```

---

## Frontend Testing

### Current Test Coverage

#### Cart Page (56 tests)

**Test Groups:**
1. Initial Rendering (5 tests)
2. Cart Item Display (5 tests)
3. Quantity Controls (5 tests)
4. Remove Item Functionality (4 tests)
5. Order Summary Calculations (6 tests)
6. Place Order Button (4 tests)
7. Success Animation (4 tests)
8. Clear Cart Functionality (3 tests)
9. Empty Cart State (4 tests)
10. Responsive Design & Styling (5 tests)
11. Multiple Item Operations (4 tests)
12. Edge Cases & Validation (4 tests)
13. User Experience Enhancements (3 tests)
14. Console Logging & Debugging (1 test)

**Example Test:**
```typescript
it('increases item quantity when plus button is clicked', () => {
  render(<CartPage />)
  const plusButtons = screen.getAllByLabelText('Increase quantity')

  fireEvent.click(plusButtons[0])

  expect(screen.getByText('3')).toBeInTheDocument()
})
```

### Tests To Be Written

#### Search Page
- [ ] Search input rendering
- [ ] Query submission
- [ ] Results display
- [ ] Loading states
- [ ] Empty state
- [ ] Error handling
- [ ] Pagination

#### Home Page
- [ ] Hero section rendering
- [ ] Typewriter animation
- [ ] Search bar integration
- [ ] Navigation

#### Login Page
- [ ] Form rendering (placeholder)
- [ ] Validation (future)
- [ ] Authentication (future)

---

## Backend Testing

### Planned Test Coverage

#### API Endpoints

**Food Search API** (`/api/food/search`)
- [ ] Returns results for valid query
- [ ] Handles invalid query
- [ ] Pagination works correctly
- [ ] Returns 400 for missing query
- [ ] Returns correct result count

**Recommendations API** (`/api/food/recommend`)
- [ ] Returns recommendations
- [ ] Respects limit parameter
- [ ] Sorts results correctly
- [ ] Handles edge cases

**Parse Query API** (`/api/food/parse`)
- [ ] Parses natural language correctly
- [ ] Extracts nutritional criteria
- [ ] Handles complex queries
- [ ] Returns appropriate errors

#### Database Operations
- [ ] MongoDB connection
- [ ] CRUD operations
- [ ] Query optimization
- [ ] Index usage

#### LLM Integration
- [ ] Groq API connection
- [ ] Query parsing
- [ ] Error handling
- [ ] Rate limiting

---

## Manual Testing

### Test Scenarios

#### 1. Search Functionality

**Scenario:** User searches for food
```
Steps:
1. Navigate to home page
2. Enter query: "high protein meal"
3. Press Enter
4. Verify results appear
5. Check results match criteria

Expected:
- Results load within 2 seconds
- At least 5 results displayed
- Each result shows protein value
- Items sorted by protein (descending)
```

#### 2. Cart Management

**Scenario:** User adds items to cart
```
Steps:
1. Search for "burger"
2. Click "Add" on Big Mac
3. Navigate to cart
4. Verify item appears
5. Increase quantity
6. Check price updates

Expected:
- Cart shows 1 item
- Quantity controls work
- Subtotal calculates correctly
- Tax and delivery fee shown
```

#### 3. Checkout Flow

**Scenario:** User places order
```
Steps:
1. Add items to cart
2. Click "Place Order"
3. Wait for success animation
4. Verify redirect to home

Expected:
- Processing state shows
- Success animation plays
- Redirects after 3 seconds
- Cart is cleared
```

### Manual Test Checklist

#### UI/UX Testing
- [ ] Dark theme applied consistently
- [ ] Burnt orange accents correct
- [ ] Responsive on mobile (320px - 480px)
- [ ] Responsive on tablet (768px - 1024px)
- [ ] Responsive on desktop (1280px+)
- [ ] Animations smooth (60fps)
- [ ] Hover effects work
- [ ] Loading states visible
- [ ] Error messages clear

#### Browser Compatibility
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

#### Accessibility
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] ARIA labels present
- [ ] Color contrast sufficient (WCAG AA)
- [ ] Focus indicators visible
- [ ] Alt text on images

#### Performance
- [ ] Page load < 2 seconds
- [ ] Search results < 2 seconds
- [ ] No layout shifts
- [ ] Images optimized
- [ ] API calls efficient

---

## Test Coverage

### Current Coverage

```
Frontend:
├── Cart Page: 100% (56/56 tests passing)
├── Search Page: 0% (tests pending)
├── Home Page: 0% (tests pending)
└── Login Page: 0% (tests pending)

Backend:
└── All: 0% (tests pending)

Overall: ~15% automated test coverage
```

### Coverage Goals

**Phase 1 (Current):**
- ✅ Cart page: 100%

**Phase 2 (Next Sprint):**
- [ ] Search page: 80%
- [ ] Home page: 80%
- [ ] Backend API: 70%

**Phase 3 (Future):**
- [ ] E2E tests: 5 critical flows
- [ ] Integration tests: 80%
- [ ] Overall coverage: 75%+

### Generating Coverage Reports

```bash
# Frontend
cd Howl2Go_frontend
npm test -- --coverage

# View HTML report
open coverage/lcov-report/index.html

# Backend (planned)
cd Howl2Go_backend
npm test -- --coverage
```

---

## Writing New Tests

### Test File Structure

```typescript
// __tests__/pages/Example.test.tsx

// 1. Mocks (must be before imports)
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush })
}))

// 2. Imports
import { render, screen, fireEvent } from '@testing-library/react'
import ExamplePage from '../../app/example/page'

// 3. Test suite
describe('ExamplePage Component', () => {
  // 4. Setup/teardown
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // 5. Test groups
  describe('Rendering', () => {
    it('renders the page title', () => {
      render(<ExamplePage />)
      expect(screen.getByText('Example')).toBeInTheDocument()
    })
  })

  describe('User Interactions', () => {
    it('handles button click', () => {
      render(<ExamplePage />)
      const button = screen.getByRole('button')
      fireEvent.click(button)
      expect(mockFunction).toHaveBeenCalled()
    })
  })
})
```

### Naming Conventions

**Test Files:**
- `ComponentName.test.tsx` for component tests
- `utils.test.ts` for utility tests
- `api.test.js` for API tests

**Test Descriptions:**
- Use "should" or present tense: "renders correctly"
- Be specific: "increases quantity when plus button clicked"
- Avoid "works" or "is correct" - describe the behavior

**Good:**
```typescript
it('displays error message when query is empty', () => {})
```

**Bad:**
```typescript
it('works', () => {})
```

### AAA Pattern

Always follow Arrange-Act-Assert:

```typescript
it('calculates total correctly', () => {
  // Arrange
  const items = [{ price: 10, quantity: 2 }]

  // Act
  const total = calculateTotal(items)

  // Assert
  expect(total).toBe(20)
})
```

---

## Best Practices

### DO ✅

1. **Test behavior, not implementation**
   - Test what users see/do
   - Don't test internal state

2. **Keep tests isolated**
   - Each test should be independent
   - Use `beforeEach` for setup

3. **Use descriptive test names**
   - Clearly state what's being tested
   - Include expected behavior

4. **Mock external dependencies**
   - Mock API calls
   - Mock navigation
   - Mock timers

5. **Test error states**
   - Empty states
   - Loading states
   - Error messages

### DON'T ❌

1. **Don't test implementation details**
   ```typescript
   // Bad
   expect(component.state.count).toBe(5)

   // Good
   expect(screen.getByText('5')).toBeInTheDocument()
   ```

2. **Don't rely on test order**
   - Tests should run in any order
   - No shared state between tests

3. **Don't use timeouts**
   ```typescript
   // Bad
   setTimeout(() => expect(...), 1000)

   // Good
   await waitFor(() => expect(...))
   ```

4. **Don't test third-party libraries**
   - Trust that React, Next.js work
   - Test your code, not frameworks

5. **Don't skip assertions**
   - Every test needs `expect()`
   - Verify actual behavior

---

## CI/CD Integration

### GitHub Actions (Planned)

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install
      - run: npm test
      - run: npm run test:coverage
```

### Pre-commit Hooks

Already configured with Husky:
```bash
# Runs before each commit
npm test
```

### Coverage Requirements (Future)

- Minimum 75% statement coverage
- Minimum 70% branch coverage
- Minimum 80% function coverage
- Minimum 75% line coverage

---

## Troubleshooting

### Common Issues

#### Tests fail with "ReferenceError: document is not defined"

**Solution:** Ensure Jest is configured for jsdom environment

```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom'
}
```

#### Mock not working

**Solution:** Mocks must be declared before imports

```typescript
// Correct
jest.mock('next/navigation')
import Component from './Component'

// Wrong
import Component from './Component'
jest.mock('next/navigation') // Too late!
```

#### "Unable to find element" errors

**Solution:** Use `waitFor` for async elements

```typescript
// Good
await waitFor(() => {
  expect(screen.getByText('Result')).toBeInTheDocument()
})

// Bad
expect(screen.getByText('Result')).toBeInTheDocument()
```

#### Tests pass locally but fail in CI

**Solution:**
- Check Node.js version matches
- Clear Jest cache: `npx jest --clearCache`
- Check for test order dependencies

---

## Resources

### Documentation
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

### Internal Guides
- [Frontend Testing Guide](../Howl2Go_frontend/__tests__/TESTING_GUIDE.md)
- [Developer Setup](DEVELOPER_SETUP.md)
- [Contributing Guidelines](../CONTRIBUTING.md)

### Team Contacts
- Testing Lead: [Name] - [email]
- QA Team: [email]
- Dev Team: [email]

---

## Changelog

### Version 1.0.0 (Current)
- ✅ Cart page: 56 comprehensive tests
- ✅ Jest configuration
- ✅ Testing infrastructure setup

### Version 1.1.0 (Planned)
- 📋 Search page tests
- 📋 Home page tests
- 📋 Backend API tests
- 📋 Integration tests

### Version 2.0.0 (Future)
- 📋 E2E test suite
- 📋 CI/CD automation
- 📋 Visual regression tests
- 📋 Performance tests

---

**Last Updated:** January 2025
**Document Version:** 1.0.0
**Project:** Howl2Go - SE_Project_Grp_27

---

**Happy Testing! 🧪**
