# Testing Guide - Howl2Go

[![Coverage Status](https://coveralls.io/repos/github/harsha711/SE_Project_Grp_27/badge.svg?branch=main)](https://coveralls.io/github/harsha711/SE_Project_Grp_27?branch=main)
[![Tests](https://img.shields.io/badge/tests-404%20passing-success)](https://github.com/harsha711/SE_Project_Grp_27)

**Testing documentation for the Howl2Go**

---

## Quick Stats

```
Total Tests: 404+
├── Frontend: 200+ tests (17 suites)
├── Backend: 200+ tests (12 suites)
└── Coverage: 80%+
```

---

## Table of Contents

1. [Running Tests](#running-tests)
2. [Test Coverage](#test-coverage)
3. [Writing New Tests](#writing-new-tests)
4. [Best Practices](#best-practices)
5. [Troubleshooting](#troubleshooting)

---

## Running Tests

### Frontend Tests

```bash
cd "Proj_2/Howl2Go_frontend"

# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Watch mode (auto-rerun on changes)
npm test -- --watch

# Run specific file
npm test Cart.test.tsx
```

### Backend Tests

```bash
cd "Proj_2/Howl2Go_backend"

# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
```

### Quick Commands

| Command | Description |
|---------|-------------|
| `npm test` | Run all tests |
| `npm test -- --coverage` | Generate coverage report |
| `npm test -- --watch` | Watch mode |
| `npm test filename.test.tsx` | Run specific file |

---

## Test Coverage

### Frontend (200+ Tests)

| Category | Tests | Files |
|----------|-------|-------|
| **Pages** | **150+** | Cart (56), Search (30), Signup (45), Dashboard (35), About (40), Home (15), Login (12) |
| **Components** | **40+** | Header, Footer, SearchBar, ItemCard, DishCard, HeroSection, etc. |
| **Integration** | **10+** | SearchToCart flow |

### Backend (200+ Tests)

| Category | Tests | Files |
|----------|-------|-------|
| **API Routes** | **100+** | Food routes (40), User (35), Cart (30), Health (8) |
| **Controllers** | **50+** | Food controller |
| **Services** | **30+** | LLM service (25), LLM middleware (15) |
| **Middleware** | **15+** | Auth middleware (18) |
| **Utilities** | **10+** | JWT utils (12), Database (10) |
| **Integration** | **20+** | Food integration (25), App (15) |

---

## Writing New Tests

### Test File Structure

```typescript
// 1. MOCKS (must be BEFORE imports)
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush })
}))
global.fetch = jest.fn()

// 2. IMPORTS
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Component from '@/app/component/page'

// 3. TEST SUITE
describe('Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders correctly', () => {
    render(<Component />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })
})
```

### Common Patterns

#### Mock Next.js Router
```typescript
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush })
}))
```

#### Mock Fetch
```typescript
global.fetch = jest.fn()

(global.fetch as jest.Mock).mockResolvedValue({
  ok: true,
  json: async () => ({ data: 'test' })
})
```

#### Mock window.location (JSDOM)
```typescript
delete (window as any).location
const mockLocation = { href: 'http://localhost/' }
Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
  configurable: true
})
```

#### Mock Components
```typescript
jest.mock('@/components/Header', () => {
  return function MockHeader() {
    return <header data-testid="header">Header</header>
  }
})
```

### Testing Async Operations

```typescript
it('loads data asynchronously', async () => {
  render(<Component />)

  // Option 1: waitFor
  await waitFor(() => {
    expect(screen.getByText('Loaded')).toBeInTheDocument()
  })

  // Option 2: findBy (preferred)
  const element = await screen.findByText('Loaded')
  expect(element).toBeInTheDocument()
})
```

---

## Best Practices

### ✅ DO

1. **Test User Behavior**
   ```typescript
   // ✅ Good
   expect(screen.getByText('2')).toBeInTheDocument()

   // ❌ Bad
   expect(component.state.count).toBe(2)
   ```

2. **Use Accessible Queries** (in order of preference)
   ```typescript
   screen.getByRole('button', { name: 'Submit' })  // Best
   screen.getByLabelText('Email')                  // Good
   screen.getByTestId('submit-btn')                // OK
   ```

3. **Mock External Dependencies**
   - Always mock fetch/API calls
   - Mock Next.js router and hooks
   - Use in-memory database for backend

4. **Keep Tests Isolated**
   ```typescript
   beforeEach(() => {
     jest.clearAllMocks()
   })
   ```

5. **Write Descriptive Names**
   ```typescript
   // ✅ Good
   it('displays error when email is invalid')

   // ❌ Bad
   it('works')
   ```

### ❌ DON'T

1. **Don't Test Implementation Details**
2. **Don't Rely on Test Order** - each test should be independent
3. **Don't Use setTimeout** - use `waitFor()` instead
4. **Don't Test Third-Party Code** - trust that libraries work
5. **Don't Skip Cleanup** - always use `beforeEach/afterEach`

---

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| "Cannot find module" | Check `jest.config.js` moduleNameMapper |
| "document is not defined" | Add `testEnvironment: 'jsdom'` to jest.config.js |
| Mock not working | Declare mocks BEFORE imports |
| "Unable to find element" | Use `await waitFor()` or `findBy` queries |
| "Cannot redefine property: location" | Delete property before redefining with Object.defineProperty |
| Tests pass locally, fail in CI | Check Node version, clear cache: `npx jest --clearCache` |

### Quick Fixes

```typescript
// Mock not working? Put it FIRST
jest.mock('next/navigation')  // ✅ Before imports
import Component from './Component'

// Element not found? Use waitFor
await waitFor(() => {
  expect(screen.getByText('Result')).toBeInTheDocument()
})

// Location issues? Delete first
delete (window as any).location
Object.defineProperty(window, 'location', {
  value: { href: 'http://localhost/' },
  writable: true,
  configurable: true
})
```

---

## Testing Stack

### Frontend
- **Jest 29** - Test runner
- **React Testing Library 14** - Component testing
- **@testing-library/user-event 14** - User interactions
- **@testing-library/jest-dom 6** - DOM matchers

### Backend
- **Jest 29** - Test runner
- **Supertest 6** - HTTP testing
- **mongodb-memory-server 9** - In-memory MongoDB
- **Sinon 17** - Mocking & stubbing

---

## CI/CD Integration

### GitHub Actions

Tests run automatically on push/PR via `.github/workflows/test.yml`:

```yaml
- Frontend tests with coverage upload to Coveralls
- Backend tests with MongoDB Memory Server
- Automatic badge updates
```

### Pre-commit Hooks

Husky runs tests before each commit:

```bash
cd "Proj_2/Howl2Go_frontend" && npm test
cd "Proj_2/Howl2Go_backend" && npm test
```

### Coverage Reports

```bash
# Generate coverage
npm test -- --coverage

# View HTML report
open coverage/lcov-report/index.html
```

---

## Manual Testing Checklist

### Critical User Flows

**1. Food Search**
- [ ] Enter query → Results load < 3s
- [ ] Results match search criteria
- [ ] Nutritional info displayed

**2. Add to Cart**
- [ ] Click "Add to Cart" → Item appears
- [ ] Quantity controls work (+/-)
- [ ] Price calculations correct

**3. Place Order**
- [ ] Click "Place Order" → Processing shows
- [ ] Success animation plays
- [ ] Cart clears after order

**4. Authentication**
- [ ] Sign up form validates
- [ ] Login redirects to dashboard
- [ ] User data displays correctly

### Browser Compatibility
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari & Chrome

### Accessibility (WCAG 2.1 AA)
- [ ] Alt text shown for images
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Color contrast ≥ 4.5:1
- [ ] Focus indicators visible


---

## Resources

### Documentation
- [Jest Docs](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

### Internal Docs
- [Developer Setup](DEVELOPER_SETUP.md)
- [API Documentation](API_DOCUMENTATION.md)
- [Contributing Guidelines](../CONTRIBUTING.md)

---

## Test Examples by Type

### Page Component Test
```typescript
describe('Cart Page', () => {
  it('calculates subtotal correctly', () => {
    render(<CartPage />)
    expect(screen.getByText(/\$17\.47/)).toBeInTheDocument()
  })
})
```

### API Test
```javascript
describe('POST /api/food/recommend', () => {
  it('returns recommendations', async () => {
    const response = await request(app)
      .post('/api/food/recommend')
      .send({ query: 'high protein' })
      .expect(200)

    expect(response.body.recommendations).toHaveLength(10)
  })
})
```

### Integration Test
```typescript
describe('Search to Cart Flow', () => {
  it('completes full user journey', async () => {
    render(<App />)

    // Search
    const input = screen.getByRole('searchbox')
    await userEvent.type(input, 'burger')
    await userEvent.keyboard('{Enter}')

    // Add to cart
    await waitFor(() => {
      expect(screen.getByText('Big Mac')).toBeInTheDocument()
    })
    const addButton = screen.getByRole('button', { name: /add/i })
    await userEvent.click(addButton)

    // Verify cart
    expect(screen.getByText('1 item')).toBeInTheDocument()
  })
})
```

---

**Last Updated:** November 6th 2025
**Version:** 2.0.0
**Status:** ✅ 323/404 Tests Passing (80%)

---

**Happy Testing! 🧪**
