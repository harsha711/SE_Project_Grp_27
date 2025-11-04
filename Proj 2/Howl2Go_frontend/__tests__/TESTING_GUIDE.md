# Testing Guide for Howl2Go Frontend

## 📚 Table of Contents
1. [Understanding Test Structure](#understanding-test-structure)
2. [Types of Tests](#types-of-tests)
3. [Writing Effective Test Cases](#writing-effective-test-cases)
4. [Cart Page Test Breakdown](#cart-page-test-breakdown)
5. [Running Tests](#running-tests)
6. [Best Practices](#best-practices)

---

## 🎯 Understanding Test Structure

### Basic Test Anatomy

```typescript
describe('Component Name', () => {
  // Setup before each test
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Feature Group', () => {
    it('does something specific', () => {
      // Arrange: Setup
      render(<Component />)

      // Act: Perform action
      const button = screen.getByRole('button')
      fireEvent.click(button)

      // Assert: Verify result
      expect(screen.getByText('Result')).toBeInTheDocument()
    })
  })
})
```

### Key Testing Library Functions

| Function | Purpose | Example |
|----------|---------|---------|
| `render()` | Renders component | `render(<CartPage />)` |
| `screen.getByText()` | Find by text content | `screen.getByText('Shopping Cart')` |
| `screen.getByRole()` | Find by ARIA role | `screen.getByRole('button')` |
| `screen.getByLabelText()` | Find by label | `screen.getByLabelText('Remove item')` |
| `screen.queryBy*()` | Same as getBy but returns null if not found | `screen.queryByText('Missing')` |
| `fireEvent.click()` | Simulate click | `fireEvent.click(button)` |
| `waitFor()` | Wait for async changes | `await waitFor(() => expect(...))` |

---

## 🧪 Types of Tests

### 1. **Rendering Tests**
**Purpose:** Verify components render correctly with expected content.

```typescript
it('renders the cart page with shopping cart title', () => {
  render(<CartPage />)
  expect(screen.getByText('Shopping Cart')).toBeInTheDocument()
})
```

**What to test:**
- Component appears on screen
- Initial data displays correctly
- All sections are present

---

### 2. **User Interaction Tests**
**Purpose:** Test user actions like clicking, typing, etc.

```typescript
it('increases item quantity when plus button is clicked', () => {
  render(<CartPage />)
  const plusButtons = screen.getAllByLabelText('Increase quantity')

  fireEvent.click(plusButtons[0])

  expect(screen.getByText('3')).toBeInTheDocument()
})
```

**What to test:**
- Button clicks
- Form inputs
- Keyboard events
- Mouse events (hover, focus)

---

### 3. **State Management Tests**
**Purpose:** Verify state changes correctly.

```typescript
it('updates totals when quantity changes', () => {
  render(<CartPage />)
  const plusButtons = screen.getAllByLabelText('Increase quantity')

  fireEvent.click(plusButtons[0])

  // Check that total updated
  expect(screen.getByText('$30.41')).toBeInTheDocument()
})
```

**What to test:**
- State updates after actions
- Derived state calculations
- Conditional rendering based on state

---

### 4. **Async Behavior Tests**
**Purpose:** Test asynchronous operations.

```typescript
it('shows success screen after order is placed', async () => {
  render(<CartPage />)
  const placeOrderButton = screen.getByRole('button', { name: /place order/i })

  fireEvent.click(placeOrderButton)
  jest.advanceTimersByTime(2000) // Fast-forward time

  await waitFor(() => {
    expect(screen.getByText('Order Placed!')).toBeInTheDocument()
  })
})
```

**What to test:**
- Loading states
- Success/error states
- Timeouts and delays
- API calls (mocked)

---

### 5. **Integration Tests**
**Purpose:** Test multiple components working together.

```typescript
it('updates item total price when quantity changes', () => {
  render(<CartPage />)
  const plusButtons = screen.getAllByLabelText('Increase quantity')

  fireEvent.click(plusButtons[0])

  // Verify item total, subtotal, tax, and grand total all update
  expect(screen.getByText('$17.97')).toBeInTheDocument() // Item total
  expect(screen.getByText('$30.41')).toBeInTheDocument() // Subtotal
})
```

**What to test:**
- Data flow between components
- Parent-child communication
- Side effects

---

### 6. **Edge Case Tests**
**Purpose:** Test boundary conditions and error scenarios.

```typescript
it('does not decrease quantity below 1', () => {
  render(<CartPage />)
  const minusButtons = screen.getAllByLabelText('Decrease quantity')

  // Click minus many times
  fireEvent.click(minusButtons[1])
  fireEvent.click(minusButtons[1])
  fireEvent.click(minusButtons[1])

  // Should still be 1
  expect(screen.getByText('1')).toBeInTheDocument()
})
```

**What to test:**
- Empty states
- Maximum values
- Invalid inputs
- Error handling

---

### 7. **Accessibility Tests**
**Purpose:** Ensure components are accessible.

```typescript
it('displays remove buttons for all items', () => {
  render(<CartPage />)
  const removeButtons = screen.getAllByLabelText('Remove item')
  expect(removeButtons).toHaveLength(3)
})
```

**What to test:**
- ARIA labels
- Keyboard navigation
- Screen reader support
- Focus management

---

### 8. **Style & Layout Tests**
**Purpose:** Verify styling and responsive design.

```typescript
it('applies correct background color', () => {
  const { container } = render(<CartPage />)
  const mainDiv = container.firstChild as HTMLElement
  expect(mainDiv).toHaveStyle({ backgroundColor: 'var(--bg)' })
})
```

**What to test:**
- CSS classes applied
- Inline styles
- Responsive breakpoints
- Theme support

---

## 📋 Cart Page Test Breakdown

### Group 1: Initial Rendering (5 tests)
Tests that the page loads with correct initial state.

**What we're testing:**
- Title displays
- Initial items appear
- Restaurant names show
- Navigation elements present
- Icons render

**Why it matters:** Users need to see their cart immediately.

---

### Group 2: Cart Item Display (5 tests)
Tests individual item information.

**What we're testing:**
- Calorie counts
- Protein information
- Individual prices
- Total prices per item

**Why it matters:** Users need accurate nutritional and pricing info.

---

### Group 3: Quantity Controls (5 tests)
Tests increment/decrement functionality.

**What we're testing:**
- Increase quantity
- Decrease quantity
- Minimum quantity (1)
- Price updates with quantity

**Why it matters:** Core shopping cart functionality.

---

### Group 4: Remove Item Functionality (4 tests)
Tests removing items from cart.

**What we're testing:**
- Remove buttons exist
- Items disappear when removed
- Totals update after removal
- Empty state appears

**Why it matters:** Users need to modify their orders.

---

### Group 5: Order Summary Calculations (6 tests)
Tests all pricing math.

**What we're testing:**
- Subtotal calculation
- Tax (8%) calculation
- Delivery fee
- Grand total
- Dynamic updates
- Item count

**Why it matters:** Pricing accuracy is critical.

---

### Group 6: Place Order Button (4 tests)
Tests order placement flow.

**What we're testing:**
- Button renders
- Processing state
- Disabled during processing
- Console logging

**Why it matters:** Primary user action.

---

### Group 7: Success Animation (4 tests)
Tests success screen after order.

**What we're testing:**
- Success message appears
- Order total shown
- Redirect message
- Redirect happens

**Why it matters:** User feedback and navigation.

---

### Group 8: Clear Cart Functionality (3 tests)
Tests clearing entire cart.

**What we're testing:**
- Button exists
- All items removed
- Empty state appears

**Why it matters:** User convenience.

---

### Group 9: Empty Cart State (4 tests)
Tests behavior with no items.

**What we're testing:**
- Browse menu button
- Link to home
- No summary shown
- No place order button

**Why it matters:** Graceful empty state.

---

### Group 10: Responsive Design & Styling (5 tests)
Tests visual and layout aspects.

**What we're testing:**
- Background colors
- Sticky positioning
- Grid layouts
- Messaging
- Hover effects

**Why it matters:** Good UX and design consistency.

---

## 🚀 Running Tests

### Run all tests
```bash
npm test
```

### Run specific test file
```bash
npm test Cart.test.tsx
```

### Run tests in watch mode
```bash
npm test -- --watch
```

### Run with coverage
```bash
npm test -- --coverage
```

### Run specific test suite
```bash
npm test -- -t "Place Order Button"
```

---

## ✅ Best Practices

### 1. **Follow AAA Pattern**
- **Arrange:** Set up test data
- **Act:** Execute the action
- **Assert:** Verify the result

```typescript
it('example test', () => {
  // Arrange
  render(<Component />)

  // Act
  fireEvent.click(screen.getByRole('button'))

  // Assert
  expect(screen.getByText('Result')).toBeInTheDocument()
})
```

---

### 2. **Use Descriptive Test Names**
❌ Bad: `it('works', () => {})`
✅ Good: `it('increases item quantity when plus button is clicked', () => {})`

---

### 3. **Test User Behavior, Not Implementation**
❌ Bad: Testing internal state directly
✅ Good: Testing what user sees/does

```typescript
// Bad
expect(component.state.count).toBe(5)

// Good
expect(screen.getByText('5')).toBeInTheDocument()
```

---

### 4. **Keep Tests Independent**
Each test should work alone. Use `beforeEach` for setup.

```typescript
beforeEach(() => {
  jest.clearAllMocks()
  localStorage.clear()
})
```

---

### 5. **Mock External Dependencies**
Mock routers, APIs, external libraries.

```typescript
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}))
```

---

### 6. **Test Edge Cases**
Don't just test the happy path.

```typescript
// Test empty state
it('shows message when cart is empty', () => {})

// Test maximum values
it('does not allow quantity over 99', () => {})

// Test errors
it('shows error message when API fails', () => {})
```

---

### 7. **Use Semantic Queries**
Prefer queries that reflect how users interact.

**Priority order:**
1. `getByRole` - Best for accessibility
2. `getByLabelText` - For form inputs
3. `getByPlaceholderText` - For inputs
4. `getByText` - For content
5. `getByTestId` - Last resort

---

### 8. **Avoid Testing Implementation Details**
❌ Bad: Testing CSS classes
✅ Good: Testing visual output or behavior

---

### 9. **Group Related Tests**
Use nested `describe` blocks for organization.

```typescript
describe('CartPage', () => {
  describe('Quantity Controls', () => {
    it('increases quantity', () => {})
    it('decreases quantity', () => {})
  })
})
```

---

### 10. **Clean Up After Tests**
```typescript
afterEach(() => {
  jest.clearAllTimers()
  jest.restoreAllMocks()
})
```

---

## 🎓 Learning Checklist

- [ ] Understand AAA pattern (Arrange, Act, Assert)
- [ ] Know different query methods (getBy, queryBy, findBy)
- [ ] Can mock external dependencies
- [ ] Understand async testing with waitFor
- [ ] Know how to test user interactions
- [ ] Can test state changes
- [ ] Understand edge case testing
- [ ] Know accessibility testing basics
- [ ] Can run tests and read results
- [ ] Understand test coverage reports

---

## 📖 Additional Resources

- [React Testing Library Docs](https://testing-library.com/docs/react-testing-library/intro/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

## 🤝 Contributing Tests

When adding new features:
1. Write tests first (TDD) or immediately after
2. Aim for 80%+ coverage
3. Test user workflows, not implementation
4. Update this guide with new patterns
5. Run full test suite before committing

Happy Testing! 🧪✨
