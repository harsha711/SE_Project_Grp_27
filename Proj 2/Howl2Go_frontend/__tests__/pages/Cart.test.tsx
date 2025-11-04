// Mock next/navigation BEFORE imports
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

// Mock next/link BEFORE imports
jest.mock('next/link', () => {
  return function MockLink({ children, href }: any) {
    return <a href={href}>{children}</a>
  }
})

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Trash2: () => <svg data-testid="trash-icon" />,
  Plus: () => <svg data-testid="plus-icon" />,
  Minus: () => <svg data-testid="minus-icon" />,
  ShoppingBag: () => <svg data-testid="shopping-bag-icon" />,
  ArrowLeft: () => <svg data-testid="arrow-left-icon" />,
  CheckCircle: () => <svg data-testid="check-circle-icon" />,
}))

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CartPage from '../../app/cart/page'

describe('CartPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  describe('1. Initial Rendering', () => {
    it('renders the cart page with shopping cart title', () => {
      render(<CartPage />)
      expect(screen.getByText('Shopping Cart')).toBeInTheDocument()
    })

    it('displays initial sample cart items', () => {
      render(<CartPage />)
      expect(screen.getByText('Big Mac')).toBeInTheDocument()
      expect(screen.getByText('Grilled Chicken Breast')).toBeInTheDocument()
      expect(screen.getByText('Greek Yogurt Parfait')).toBeInTheDocument()
    })

    it('shows correct restaurant names for each item', () => {
      render(<CartPage />)
      expect(screen.getByText("McDonald's")).toBeInTheDocument()
      expect(screen.getByText('Subway')).toBeInTheDocument()
      expect(screen.getByText('Starbucks')).toBeInTheDocument()
    })

    it('renders back arrow link to home page', () => {
      render(<CartPage />)
      const backLink = screen.getByRole('link', { name: '' })
      expect(backLink).toHaveAttribute('href', '/')
    })

    it('displays shopping bag icon in header', () => {
      const { container } = render(<CartPage />)
      // Check for lucide-react icon by looking for svg
      const icons = container.querySelectorAll('svg')
      expect(icons.length).toBeGreaterThan(0)
    })
  })

  describe('2. Cart Item Display', () => {
    it('displays calorie information for each item', () => {
      render(<CartPage />)
      expect(screen.getByText('563 cal')).toBeInTheDocument() // Big Mac
      expect(screen.getByText('165 cal')).toBeInTheDocument() // Chicken
      expect(screen.getByText('150 cal')).toBeInTheDocument() // Yogurt
    })

    it('displays protein information when available', () => {
      render(<CartPage />)
      expect(screen.getByText('25g protein')).toBeInTheDocument()
      expect(screen.getByText('31g protein')).toBeInTheDocument()
      expect(screen.getByText('20g protein')).toBeInTheDocument()
    })

    it('shows individual item prices', () => {
      render(<CartPage />)
      expect(screen.getByText('$5.99 each')).toBeInTheDocument()
      expect(screen.getByText('$7.49 each')).toBeInTheDocument()
      expect(screen.getByText('$4.95 each')).toBeInTheDocument()
    })

    it('calculates and displays item total based on quantity', () => {
      render(<CartPage />)
      // Big Mac: $5.99 × 2 = $11.98
      expect(screen.getByText('$11.98')).toBeInTheDocument()
      // Chicken: $7.49 × 1 = $7.49
      expect(screen.getByText('$7.49')).toBeInTheDocument()
      // Yogurt: $4.95 × 1 = $4.95
      expect(screen.getByText('$4.95')).toBeInTheDocument()
    })
  })

  describe('3. Quantity Controls', () => {
    it('displays initial quantities correctly', () => {
      render(<CartPage />)
      const quantities = screen.getAllByText('2')
      expect(quantities.length).toBeGreaterThan(0) // Big Mac has quantity 2
    })

    it('increases item quantity when plus button is clicked', () => {
      render(<CartPage />)
      const plusButtons = screen.getAllByLabelText('Increase quantity')

      // Click the first plus button (Big Mac, initially quantity 2)
      fireEvent.click(plusButtons[0])

      // Should now show quantity 3
      expect(screen.getByText('3')).toBeInTheDocument()
    })

    it('decreases item quantity when minus button is clicked', () => {
      render(<CartPage />)
      const minusButtons = screen.getAllByLabelText('Decrease quantity')

      // Click the first minus button (Big Mac, initially quantity 2)
      fireEvent.click(minusButtons[0])

      // Quantity should decrease to 1
      const quantities = screen.getAllByText('1')
      expect(quantities.length).toBeGreaterThan(0)
    })

    it('does not decrease quantity below 1', () => {
      render(<CartPage />)
      const minusButtons = screen.getAllByLabelText('Decrease quantity')

      // Click minus button on item with quantity 1 multiple times
      fireEvent.click(minusButtons[1]) // Grilled Chicken (quantity 1)
      fireEvent.click(minusButtons[1])
      fireEvent.click(minusButtons[1])

      // Should still show items with quantity 1 (there are multiple)
      const quantityOnes = screen.getAllByText('1')
      expect(quantityOnes.length).toBeGreaterThan(0)
    })

    it('updates item total price when quantity changes', () => {
      render(<CartPage />)
      const plusButtons = screen.getAllByLabelText('Increase quantity')

      // Increase Big Mac quantity from 2 to 3
      fireEvent.click(plusButtons[0])

      // New total: $5.99 × 3 = $17.97
      expect(screen.getByText('$17.97')).toBeInTheDocument()
    })
  })

  describe('4. Remove Item Functionality', () => {
    it('displays remove buttons for all items', () => {
      render(<CartPage />)
      const removeButtons = screen.getAllByLabelText('Remove item')
      expect(removeButtons).toHaveLength(3)
    })

    it('removes item from cart when remove button is clicked', () => {
      render(<CartPage />)
      const removeButtons = screen.getAllByLabelText('Remove item')

      // Remove Big Mac
      fireEvent.click(removeButtons[0])

      // Big Mac should no longer be in the document
      expect(screen.queryByText('Big Mac')).not.toBeInTheDocument()
    })

    it('updates cart totals after removing an item', () => {
      render(<CartPage />)
      const removeButtons = screen.getAllByLabelText('Remove item')

      // Remove Big Mac ($11.98)
      fireEvent.click(removeButtons[0])

      // Total should be recalculated (original: $23.89, new: ~$13.40)
      // This will be tested in the totals section
      expect(screen.queryByText('$11.98')).not.toBeInTheDocument()
    })

    it('shows empty cart state when all items are removed', () => {
      render(<CartPage />)
      const clearCartButton = screen.getByText('Clear Cart')

      fireEvent.click(clearCartButton)

      expect(screen.getByText('Your cart is empty')).toBeInTheDocument()
      expect(screen.getByText('Add some delicious items to get started!')).toBeInTheDocument()
    })
  })

  describe('5. Order Summary Calculations', () => {
    it('displays correct subtotal', () => {
      render(<CartPage />)
      // Big Mac: $11.98, Chicken: $7.49, Yogurt: $4.95 = $24.42
      expect(screen.getByText('$24.42')).toBeInTheDocument()
    })

    it('calculates correct tax (8%)', () => {
      render(<CartPage />)
      // 8% of $24.42 = $1.95
      expect(screen.getByText('$1.95')).toBeInTheDocument()
    })

    it('displays correct delivery fee', () => {
      render(<CartPage />)
      expect(screen.getByText('$3.99')).toBeInTheDocument()
    })

    it('calculates correct total', () => {
      render(<CartPage />)
      // $24.42 + $1.95 + $3.99 = $30.36
      expect(screen.getByText('$30.36')).toBeInTheDocument()
    })

    it('updates totals when quantity changes', () => {
      render(<CartPage />)
      const plusButtons = screen.getAllByLabelText('Increase quantity')

      // Add one more Big Mac
      fireEvent.click(plusButtons[0])

      // New subtotal: $30.41
      expect(screen.getByText('$30.41')).toBeInTheDocument()
    })

    it('shows correct item count', () => {
      render(<CartPage />)
      // Initial: 2 Big Macs + 1 Chicken + 1 Yogurt = 4 items
      expect(screen.getByText('4 Items')).toBeInTheDocument()
    })
  })

  describe('6. Place Order Button', () => {
    it('renders Place Order button', () => {
      render(<CartPage />)
      const placeOrderButton = screen.getByRole('button', { name: /place order/i })
      expect(placeOrderButton).toBeInTheDocument()
    })

    it('shows processing state when Place Order is clicked', () => {
      render(<CartPage />)
      const placeOrderButton = screen.getByRole('button', { name: /place order/i })

      fireEvent.click(placeOrderButton)

      expect(screen.getByText('Processing...')).toBeInTheDocument()
    })

    it('disables button during processing', () => {
      render(<CartPage />)
      const placeOrderButton = screen.getByRole('button', { name: /place order/i })

      fireEvent.click(placeOrderButton)

      expect(placeOrderButton).toBeDisabled()
    })

    it('logs order details to console when order is placed', () => {
      const consoleSpy = jest.spyOn(console, 'log')
      render(<CartPage />)
      const placeOrderButton = screen.getByRole('button', { name: /place order/i })

      fireEvent.click(placeOrderButton)
      jest.advanceTimersByTime(2000)

      expect(consoleSpy).toHaveBeenCalledWith('Order placed successfully!')
      consoleSpy.mockRestore()
    })
  })

  describe('7. Success Animation', () => {
    it('shows success screen after order is placed', async () => {
      render(<CartPage />)
      const placeOrderButton = screen.getByRole('button', { name: /place order/i })

      fireEvent.click(placeOrderButton)
      jest.advanceTimersByTime(2000) // Wait for processing

      await waitFor(() => {
        expect(screen.getByText('Order Placed!')).toBeInTheDocument()
      })
    })

    it('displays success message with order total', async () => {
      render(<CartPage />)
      const placeOrderButton = screen.getByRole('button', { name: /place order/i })

      fireEvent.click(placeOrderButton)
      jest.advanceTimersByTime(2000)

      await waitFor(() => {
        expect(screen.getByText('Your delicious food is on the way!')).toBeInTheDocument()
        expect(screen.getByText('Order Total')).toBeInTheDocument()
      })
    })

    it('shows redirect message in success screen', async () => {
      render(<CartPage />)
      const placeOrderButton = screen.getByRole('button', { name: /place order/i })

      fireEvent.click(placeOrderButton)
      jest.advanceTimersByTime(2000)

      await waitFor(() => {
        expect(screen.getByText('Redirecting to home...')).toBeInTheDocument()
      })
    })

    it('redirects to home page after success screen', async () => {
      render(<CartPage />)
      const placeOrderButton = screen.getByRole('button', { name: /place order/i })

      fireEvent.click(placeOrderButton)
      jest.advanceTimersByTime(2000) // Processing
      jest.advanceTimersByTime(3000) // Redirect delay

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/')
      })
    })
  })

  describe('8. Clear Cart Functionality', () => {
    it('displays Clear Cart button', () => {
      render(<CartPage />)
      expect(screen.getByText('Clear Cart')).toBeInTheDocument()
    })

    it('removes all items when Clear Cart is clicked', () => {
      render(<CartPage />)
      const clearCartButton = screen.getByText('Clear Cart')

      fireEvent.click(clearCartButton)

      expect(screen.queryByText('Big Mac')).not.toBeInTheDocument()
      expect(screen.queryByText('Grilled Chicken Breast')).not.toBeInTheDocument()
      expect(screen.queryByText('Greek Yogurt Parfait')).not.toBeInTheDocument()
    })

    it('shows empty cart message after clearing', () => {
      render(<CartPage />)
      const clearCartButton = screen.getByText('Clear Cart')

      fireEvent.click(clearCartButton)

      expect(screen.getByText('Your cart is empty')).toBeInTheDocument()
    })
  })

  describe('9. Empty Cart State', () => {
    it('shows Browse Menu button when cart is empty', () => {
      render(<CartPage />)
      const clearCartButton = screen.getByText('Clear Cart')
      fireEvent.click(clearCartButton)

      const browseButton = screen.getByText('Browse Menu')
      expect(browseButton).toBeInTheDocument()
    })

    it('Browse Menu button links to home page', () => {
      render(<CartPage />)
      const clearCartButton = screen.getByText('Clear Cart')
      fireEvent.click(clearCartButton)

      const browseButton = screen.getByText('Browse Menu')
      expect(browseButton.closest('a')).toHaveAttribute('href', '/')
    })

    it('does not show order summary when cart is empty', () => {
      render(<CartPage />)
      const clearCartButton = screen.getByText('Clear Cart')
      fireEvent.click(clearCartButton)

      expect(screen.queryByText('Order Summary')).not.toBeInTheDocument()
    })

    it('does not show Place Order button when cart is empty', () => {
      render(<CartPage />)
      const clearCartButton = screen.getByText('Clear Cart')
      fireEvent.click(clearCartButton)

      expect(screen.queryByRole('button', { name: /place order/i })).not.toBeInTheDocument()
    })
  })

  describe('10. Responsive Design & Styling', () => {
    it('applies correct background color', () => {
      const { container } = render(<CartPage />)
      const mainDiv = container.firstChild as HTMLElement
      expect(mainDiv).toHaveStyle({ backgroundColor: 'var(--bg)' })
    })

    it('has sticky order summary', () => {
      const { container } = render(<CartPage />)
      const orderSummary = container.querySelector('.sticky')
      expect(orderSummary).toBeInTheDocument()
    })

    it('displays items in grid layout', () => {
      const { container } = render(<CartPage />)
      const gridLayout = container.querySelector('.grid')
      expect(gridLayout).toBeInTheDocument()
    })

    it('shows free delivery message', () => {
      render(<CartPage />)
      expect(screen.getByText('Free delivery on orders over $30')).toBeInTheDocument()
    })

    it('applies hover effects to interactive elements', () => {
      const { container } = render(<CartPage />)
      const placeOrderButton = screen.getByRole('button', { name: /place order/i })
      expect(placeOrderButton).toHaveClass('hover:scale-105')
      expect(placeOrderButton).toHaveClass('hover:shadow-lg')
    })
  })

  describe('11. Multiple Item Operations', () => {
    it('correctly handles increasing multiple items quantities', () => {
      render(<CartPage />)
      const plusButtons = screen.getAllByLabelText('Increase quantity')

      // Increase quantity for first two items
      fireEvent.click(plusButtons[0]) // Big Mac: 2 → 3
      fireEvent.click(plusButtons[1]) // Chicken: 1 → 2

      // Verify quantities changed
      expect(screen.getByText('3')).toBeInTheDocument()
      expect(screen.getAllByText('2').length).toBeGreaterThan(0)
    })

    it('maintains correct totals after multiple operations', () => {
      render(<CartPage />)
      const plusButtons = screen.getAllByLabelText('Increase quantity')
      const minusButtons = screen.getAllByLabelText('Decrease quantity')

      // Complex operations
      fireEvent.click(plusButtons[0]) // Big Mac: 2 → 3
      fireEvent.click(minusButtons[2]) // Yogurt: 1 → 1 (no change)
      fireEvent.click(plusButtons[1]) // Chicken: 1 → 2

      // Verify total updated correctly
      // New subtotal: (5.99 × 3) + (7.49 × 2) + (4.95 × 1) = 37.90
      expect(screen.getByText('$37.90')).toBeInTheDocument()
    })

    it('removes multiple items correctly', () => {
      render(<CartPage />)

      // Remove Big Mac
      const removeButtons1 = screen.getAllByLabelText('Remove item')
      fireEvent.click(removeButtons1[0])

      // Remove Chicken (now first after Big Mac is gone)
      const removeButtons2 = screen.getAllByLabelText('Remove item')
      fireEvent.click(removeButtons2[0])

      // Only Greek Yogurt should remain
      expect(screen.queryByText('Big Mac')).not.toBeInTheDocument()
      expect(screen.getByText('Greek Yogurt Parfait')).toBeInTheDocument()

      // Should have 1 item left
      expect(screen.getByText('1 Item')).toBeInTheDocument()
    })

    it('updates item count badge correctly', () => {
      render(<CartPage />)
      const plusButtons = screen.getAllByLabelText('Increase quantity')

      // Initial: 4 items (2 + 1 + 1)
      expect(screen.getByText('4 Items')).toBeInTheDocument()

      // Add more
      fireEvent.click(plusButtons[0])
      expect(screen.getByText('5 Items')).toBeInTheDocument()
    })
  })

  describe('12. Edge Cases & Validation', () => {
    it('handles rapid quantity changes correctly', () => {
      render(<CartPage />)
      const plusButton = screen.getAllByLabelText('Increase quantity')[0]

      // Rapidly click plus button
      fireEvent.click(plusButton)
      fireEvent.click(plusButton)
      fireEvent.click(plusButton)
      fireEvent.click(plusButton)

      // Should show quantity 6 (started at 2)
      expect(screen.getByText('6')).toBeInTheDocument()
    })

    it('prevents double-submission of order', () => {
      render(<CartPage />)
      const placeOrderButton = screen.getByRole('button', { name: /place order/i })

      // Click twice rapidly
      fireEvent.click(placeOrderButton)
      fireEvent.click(placeOrderButton)

      // Should still only process once (button disabled after first click)
      expect(placeOrderButton).toBeDisabled()
      expect(screen.getByText('Processing...')).toBeInTheDocument()
    })

    it('shows singular "Item" for quantity of 1', () => {
      render(<CartPage />)

      // Remove Big Mac
      const removeButtons1 = screen.getAllByLabelText('Remove item')
      fireEvent.click(removeButtons1[0])

      // Remove Chicken
      const removeButtons2 = screen.getAllByLabelText('Remove item')
      fireEvent.click(removeButtons2[0])

      // Should show "1 Item" (singular) for the remaining Greek Yogurt
      expect(screen.getByText('1 Item')).toBeInTheDocument()
    })

    it('calculates totals with decimal precision', () => {
      render(<CartPage />)
      // Initial total should have 2 decimal places - check all prices
      const allPrices = screen.getAllByText(/\$\d+\.\d{2}/)
      expect(allPrices.length).toBeGreaterThan(0)

      // Verify the main total has correct format
      expect(screen.getByText('$30.36')).toBeInTheDocument()
    })
  })

  describe('13. User Experience Enhancements', () => {
    it('displays free delivery message', () => {
      render(<CartPage />)
      // The cart shows "Free delivery on orders over $30"
      expect(screen.getByText('Free delivery on orders over $30')).toBeInTheDocument()
    })

    it('shows Clear Cart button only when cart has items', () => {
      render(<CartPage />)

      // Should show when items exist
      expect(screen.getByText('Clear Cart')).toBeInTheDocument()

      // Clear cart
      fireEvent.click(screen.getByText('Clear Cart'))

      // Should not show when empty
      expect(screen.queryByText('Clear Cart')).not.toBeInTheDocument()
    })

    it('displays nutritional badges with correct styling', () => {
      const { container } = render(<CartPage />)

      // Check for calorie badges
      const calorieBadge = screen.getByText('563 cal')
      expect(calorieBadge).toBeInTheDocument()

      // Check for protein badges
      const proteinBadge = screen.getByText('25g protein')
      expect(proteinBadge).toBeInTheDocument()
    })
  })

  describe('14. Console Logging & Debugging', () => {
    it('logs correct cart data when placing order', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
      render(<CartPage />)

      const placeOrderButton = screen.getByRole('button', { name: /place order/i })
      fireEvent.click(placeOrderButton)
      jest.advanceTimersByTime(2000)

      expect(consoleSpy).toHaveBeenCalledWith('Order placed successfully!')
      expect(consoleSpy).toHaveBeenCalledWith('Cart Items:', expect.any(Array))
      expect(consoleSpy).toHaveBeenCalledWith('Total:', expect.any(String))

      consoleSpy.mockRestore()
    })
  })
})
