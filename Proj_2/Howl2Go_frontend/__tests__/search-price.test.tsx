/**
 * Tests for price-based recommendations feature
 * Tests price filter chips and natural language price queries
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import SmartMenuSearch from '@/app/search/page'

// Mock fetch for API calls
const mockFetch = global.fetch as jest.Mock

describe('Price-Based Recommendations', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        recommendations: [
          {
            _id: '1',
            company: "McDonald's",
            item: 'Chicken McNuggets (4 piece)',
            calories: 190,
            caloriesFromFat: 80,
            totalFat: 12,
            saturatedFat: 2.5,
            transFat: 0,
            cholesterol: 40,
            sodium: 340,
            carbs: 11,
            fiber: 1,
            sugars: 0,
            protein: 9,
            weightWatchersPoints: 5,
            price: 2.00,
          },
          {
            _id: '2',
            company: 'Burger King',
            item: 'Hamburger',
            calories: 240,
            caloriesFromFat: 90,
            totalFat: 10,
            saturatedFat: 4,
            transFat: 0.5,
            cholesterol: 30,
            sodium: 380,
            carbs: 26,
            fiber: 1,
            sugars: 5,
            protein: 13,
            weightWatchersPoints: 6,
            price: 3.50,
          },
        ],
        count: 2,
        criteria: { price: { max: 5 } },
      }),
    })
  })

  describe('Price Filter Chips - Rendering', () => {
    it('renders all five price filter chips before search', () => {
      render(<SmartMenuSearch />)

      expect(screen.getByText('Under $5')).toBeInTheDocument()
      expect(screen.getByText('$5-$10')).toBeInTheDocument()
      expect(screen.getByText('$10-$15')).toBeInTheDocument()
      expect(screen.getByText('Budget-Friendly')).toBeInTheDocument()
      expect(screen.getByText('Premium')).toBeInTheDocument()
    })

    it('price filter chips are buttons', () => {
      render(<SmartMenuSearch />)

      const underFiveChip = screen.getByText('Under $5')
      expect(underFiveChip.tagName).toBe('BUTTON')
    })

    it('price chips are in a container element', () => {
      render(<SmartMenuSearch />)

      const underFiveChip = screen.getByText('Under $5')
      const chipsContainer = underFiveChip.parentElement

      expect(chipsContainer).toBeTruthy()
      expect(chipsContainer).toContainElement(underFiveChip)
    })
  })

  describe('Price Filter Chips - Interactions', () => {
    it('clicking chips updates search query state', () => {
      render(<SmartMenuSearch />)

      const underFiveChip = screen.getByText('Under $5')
      fireEvent.click(underFiveChip)

      // Check that query input is updated
      const searchInput = screen.getByPlaceholderText(/search/i) as HTMLInputElement
      expect(searchInput.value).toBe('meals under $5')
    })

    it('clicking "$5-$10" updates query', () => {
      render(<SmartMenuSearch />)

      const rangeChip = screen.getByText('$5-$10')
      fireEvent.click(rangeChip)

      const searchInput = screen.getByPlaceholderText(/search/i) as HTMLInputElement
      expect(searchInput.value).toBe('meals between $5 and $10')
    })

    it('clicking "$10-$15" updates query', () => {
      render(<SmartMenuSearch />)

      const rangeChip = screen.getByText('$10-$15')
      fireEvent.click(rangeChip)

      const searchInput = screen.getByPlaceholderText(/search/i) as HTMLInputElement
      expect(searchInput.value).toBe('meals between $10 and $15')
    })

    it('clicking "Budget-Friendly" sets natural language query', () => {
      render(<SmartMenuSearch />)

      const budgetChip = screen.getByText('Budget-Friendly')
      fireEvent.click(budgetChip)

      const searchInput = screen.getByPlaceholderText(/search/i) as HTMLInputElement
      expect(searchInput.value).toBe('cheap healthy meal')
    })

    it('clicking "Premium" sets premium query', () => {
      render(<SmartMenuSearch />)

      const premiumChip = screen.getByText('Premium')
      fireEvent.click(premiumChip)

      const searchInput = screen.getByPlaceholderText(/search/i) as HTMLInputElement
      expect(searchInput.value).toBe('premium meal')
    })
  })

  describe('Initial State', () => {
    it('shows default state before search', () => {
      render(<SmartMenuSearch />)

      // Should see "Start Your Search" message
      expect(screen.getByText(/Start Your Search/i)).toBeInTheDocument()
      expect(screen.getByText(/0.*results/i)).toBeInTheDocument()
    })
  })

  describe('Natural Language Price Queries', () => {
    it('allows typing "under $5" query', () => {
      render(<SmartMenuSearch />)

      const searchInput = screen.getByPlaceholderText(/search/i) as HTMLInputElement
      fireEvent.change(searchInput, { target: { value: 'meals under $5' } })

      expect(searchInput.value).toBe('meals under $5')
    })

    it('allows typing price range query', () => {
      render(<SmartMenuSearch />)

      const searchInput = screen.getByPlaceholderText(/search/i) as HTMLInputElement
      fireEvent.change(searchInput, {
        target: { value: 'lunch between $8 and $12' },
      })

      expect(searchInput.value).toBe('lunch between $8 and $12')
    })

    it('allows typing combined price and nutrition query', () => {
      render(<SmartMenuSearch />)

      const searchInput = screen.getByPlaceholderText(/search/i) as HTMLInputElement
      fireEvent.change(searchInput, {
        target: { value: 'high protein meal under $10' },
      })

      expect(searchInput.value).toBe('high protein meal under $10')
    })

    it('allows typing "cheap" natural language', () => {
      render(<SmartMenuSearch />)

      const searchInput = screen.getByPlaceholderText(/search/i) as HTMLInputElement
      fireEvent.change(searchInput, {
        target: { value: 'cheap healthy food' },
      })

      expect(searchInput.value).toBe('cheap healthy food')
    })
  })

  describe('Price Filter Chips - Visibility', () => {
    it('chips are visible before search', () => {
      render(<SmartMenuSearch />)

      // Before search - chips should be visible
      expect(screen.getByText('Under $5')).toBeInTheDocument()
      expect(screen.getByText('Quick Price Filters')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('price filter chips are keyboard accessible', () => {
      render(<SmartMenuSearch />)

      const underFiveChip = screen.getByText('Under $5')

      // Should be focusable
      underFiveChip.focus()
      expect(document.activeElement).toBe(underFiveChip)
    })

    it('search input has proper aria label', () => {
      render(<SmartMenuSearch />)

      const searchInput = screen.getByPlaceholderText(/search/i)
      expect(searchInput).toHaveAttribute('aria-label', 'Search for food')
    })
  })

  describe('Integration with Existing Features', () => {
    it('sort dropdown is available', () => {
      render(<SmartMenuSearch />)

      // Find sort dropdown
      const sortSelect = screen.getByRole('combobox')
      expect(sortSelect).toBeInTheDocument()
      
      // Check sort options include price options
      expect(screen.getByText(/Price: low → high/i)).toBeInTheDocument()
      expect(screen.getByText(/Price: high → low/i)).toBeInTheDocument()
    })

    it('price sorting option available', () => {
      render(<SmartMenuSearch />)

      const sortSelect = screen.getByRole('combobox')
      fireEvent.change(sortSelect, { target: { value: 'priceLow' } })
      
      expect(sortSelect).toHaveValue('priceLow')
    })
  })

  describe('Results Count Display', () => {
    it('displays result count element', () => {
      render(<SmartMenuSearch />)

      // Should show 0 results initially
      expect(screen.getByText(/0.*results/i)).toBeInTheDocument()
    })
  })
})
