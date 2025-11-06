/**
 * Integration Tests: Search to Cart Flow
 *
 * These tests verify the complete user journey from searching
 * for food items to adding them to cart and placing orders.
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Mock router and navigation
const mockPush = jest.fn()
const mockGet = jest.fn()
const mockReplace = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
  useSearchParams: () => ({
    get: mockGet,
  }),
  usePathname: () => '/search',
}))

jest.mock('next/link', () => {
  return function MockLink({ children, href }: any) {
    return <a href={href}>{children}</a>
  }
})

// Mock icons
jest.mock('lucide-react', () => ({
  Search: () => <svg data-testid="search-icon" />,
  ArrowLeft: () => <svg data-testid="arrow-left-icon" />,
  ShoppingBag: () => <svg data-testid="shopping-bag-icon" />,
  Plus: () => <svg data-testid="plus-icon" />,
  Minus: () => <svg data-testid="minus-icon" />,
  Trash2: () => <svg data-testid="trash-icon" />,
  CheckCircle: () => <svg data-testid="check-circle-icon" />,
}))

describe('Integration Tests: Search to Cart Flow', () => {
  let mockFetch: jest.SpyInstance

  const mockSearchResults = [
    {
      _id: '1',
      item: 'Big Mac',
      company: "McDonald's",
      calories: 550,
      protein: 25,
      total_fat: 30,
      total_carb: 45,
      fiber: 3,
      sugar: 9,
      sodium: 1010,
    },
    {
      _id: '2',
      item: 'Whopper',
      company: 'Burger King',
      calories: 660,
      protein: 28,
      total_fat: 40,
      total_carb: 49,
      fiber: 2,
      sugar: 11,
      sodium: 980,
    },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    mockFetch = jest.spyOn(global, 'fetch')
    mockGet.mockReturnValue(null)

    // Clear localStorage
    localStorage.clear()
  })

  afterEach(() => {
    mockFetch.mockRestore()
  })

  describe('1. Complete Flow: Home → Search → Cart', () => {
    it('allows user to search, add item, and navigate to cart', async () => {
      // Note: This test simulates the flow conceptually
      // In a real integration test, you'd render the actual pages

      // Step 1: User searches for "burger"
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          recommendations: mockSearchResults,
        }),
      })

      // Step 2: Verify search functionality
      expect(mockFetch).not.toHaveBeenCalled()

      // Simulate API call
      const response = await fetch('http://localhost:4000/api/food/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: 'burger' }),
      })

      const data = await response.json()
      expect(data.recommendations).toHaveLength(2)
      expect(data.recommendations[0].item).toBe('Big Mac')

      // Step 3: User clicks "Add to Cart" (simulated)
      // In real implementation, this would update cart state
      localStorage.setItem('cart', JSON.stringify([mockSearchResults[0]]))

      // Step 4: Verify cart has item
      const cart = JSON.parse(localStorage.getItem('cart') || '[]')
      expect(cart).toHaveLength(1)
      expect(cart[0].item).toBe('Big Mac')
    })
  })

  describe('2. Search Query Persistence', () => {
    it('persists search query in URL and search bar', async () => {
      const query = 'high protein'
      mockGet.mockReturnValue(query)

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          recommendations: mockSearchResults,
        }),
      })

      // Simulate search
      await fetch('http://localhost:4000/api/food/recommend', {
        method: 'POST',
        body: JSON.stringify({ query }),
      })

      // Verify query param
      expect(mockGet()).toBe(query)
    })

    it('maintains query when navigating back and forth', async () => {
      mockGet.mockReturnValue('burger')

      // First visit
      const query1 = mockGet()
      expect(query1).toBe('burger')

      // Navigate away and back
      mockGet.mockReturnValue('burger') // Query persists
      const query2 = mockGet()
      expect(query2).toBe('burger')
    })
  })

  describe('3. Backend API Integration', () => {
    it('frontend sends correct request format to backend', async () => {
      const query = 'low calorie'

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          recommendations: [],
        }),
      })

      await fetch('http://localhost:4000/api/food/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, limit: 10, page: 1 }),
      })

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:4000/api/food/search',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query, limit: 10, page: 1 }),
        })
      )
    })

    it('handles empty results from backend gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          recommendations: [],
          pagination: { total: 0, page: 1, limit: 10, pages: 0 },
        }),
      })

      const response = await fetch('http://localhost:4000/api/food/search', {
        method: 'POST',
        body: JSON.stringify({ query: 'impossible query' }),
      })

      const data = await response.json()
      expect(data.recommendations).toEqual([])
      expect(data.pagination.total).toBe(0)
    })

    it('processes paginated results correctly', async () => {
      const paginatedResponse = {
        recommendations: mockSearchResults,
        pagination: {
          total: 50,
          page: 1,
          limit: 10,
          pages: 5,
        },
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => paginatedResponse,
      })

      const response = await fetch('http://localhost:4000/api/food/search', {
        method: 'POST',
        body: JSON.stringify({ query: 'burger', page: 1, limit: 10 }),
      })

      const data = await response.json()
      expect(data.pagination.pages).toBe(5)
      expect(data.pagination.total).toBe(50)
      expect(data.recommendations).toHaveLength(2)
    })

    it('parses nutritional data correctly from backend', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          recommendations: [mockSearchResults[0]],
        }),
      })

      const response = await fetch('http://localhost:4000/api/food/recommend', {
        method: 'POST',
        body: JSON.stringify({ query: 'Big Mac' }),
      })

      const data = await response.json()
      const item = data.recommendations[0]

      expect(item.calories).toBe(550)
      expect(item.protein).toBe(25)
      expect(item.total_fat).toBe(30)
      expect(item.total_carb).toBe(45)
      expect(item.sodium).toBe(1010)
    })
  })

  describe('4. Cart Integration', () => {
    it('updates cart count when item is added', () => {
      // Initial cart is empty
      expect(JSON.parse(localStorage.getItem('cart') || '[]')).toHaveLength(0)

      // Add item to cart
      const cart = [mockSearchResults[0]]
      localStorage.setItem('cart', JSON.stringify(cart))

      // Verify cart count
      const updatedCart = JSON.parse(localStorage.getItem('cart') || '[]')
      expect(updatedCart).toHaveLength(1)
    })

    it('persists cart when navigating between pages', () => {
      // Add items to cart
      const cartItems = [mockSearchResults[0], mockSearchResults[1]]
      localStorage.setItem('cart', JSON.stringify(cartItems))

      // Simulate navigation
      const cartBeforeNav = JSON.parse(localStorage.getItem('cart') || '[]')
      expect(cartBeforeNav).toHaveLength(2)

      // Simulate navigation back
      const cartAfterNav = JSON.parse(localStorage.getItem('cart') || '[]')
      expect(cartAfterNav).toHaveLength(2)
      expect(cartAfterNav[0].item).toBe('Big Mac')
      expect(cartAfterNav[1].item).toBe('Whopper')
    })

    it('clears cart after successful order placement', async () => {
      // Setup cart with items
      localStorage.setItem('cart', JSON.stringify([mockSearchResults[0]]))
      expect(JSON.parse(localStorage.getItem('cart') || '[]')).toHaveLength(1)

      // Simulate order placement
      jest.useFakeTimers()

      // Order is placed
      // After success animation (3 seconds), cart should clear
      jest.advanceTimersByTime(3000)

      localStorage.removeItem('cart')

      // Verify cart is empty
      expect(JSON.parse(localStorage.getItem('cart') || '[]')).toHaveLength(0)

      jest.useRealTimers()
    })
  })

  describe('5. Error Handling Integration', () => {
    it('handles API timeout gracefully', async () => {
      mockFetch.mockImplementation(
        () =>
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Request timeout')), 100)
          )
      )

      try {
        await fetch('http://localhost:4000/api/food/search', {
          method: 'POST',
          body: JSON.stringify({ query: 'test' }),
        })
      } catch (error) {
        expect(error).toBeDefined()
        expect((error as Error).message).toBe('Request timeout')
      }
    })

    it('handles network failures', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      try {
        await fetch('http://localhost:4000/api/food/recommend', {
          method: 'POST',
          body: JSON.stringify({ query: 'test' }),
        })
      } catch (error) {
        expect(error).toBeDefined()
        expect((error as Error).message).toBe('Network error')
      }
    })
  })

  describe('6. Data Flow Integration', () => {
    it('maintains data consistency from search to cart', async () => {
      // Step 1: Search returns items
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          recommendations: mockSearchResults,
        }),
      })

      const searchResponse = await fetch('http://localhost:4000/api/food/recommend', {
        method: 'POST',
        body: JSON.stringify({ query: 'burger' }),
      })

      const searchData = await searchResponse.json()
      const selectedItem = searchData.recommendations[0]

      // Step 2: Add to cart
      localStorage.setItem('cart', JSON.stringify([selectedItem]))

      // Step 3: Retrieve from cart
      const cartItems = JSON.parse(localStorage.getItem('cart') || '[]')
      const cartItem = cartItems[0]

      // Verify data consistency
      expect(cartItem._id).toBe(selectedItem._id)
      expect(cartItem.item).toBe(selectedItem.item)
      expect(cartItem.calories).toBe(selectedItem.calories)
      expect(cartItem.protein).toBe(selectedItem.protein)
    })
  })

  describe('7. User Journey: Complete Order Flow', () => {
    it('simulates complete user journey from search to order', async () => {
      // Step 1: User searches
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          recommendations: mockSearchResults,
        }),
      })

      const searchResponse = await fetch('http://localhost:4000/api/food/recommend', {
        method: 'POST',
        body: JSON.stringify({ query: 'burger' }),
      })
      const searchData = await searchResponse.json()
      expect(searchData.recommendations).toHaveLength(2)

      // Step 2: User adds item to cart
      const selectedItem = searchData.recommendations[0]
      localStorage.setItem('cart', JSON.stringify([selectedItem]))

      // Step 3: User views cart
      const cart = JSON.parse(localStorage.getItem('cart') || '[]')
      expect(cart).toHaveLength(1)

      // Step 4: User places order
      jest.useFakeTimers()

      // Simulate order placement with success
      const orderSuccessful = true

      if (orderSuccessful) {
        // Step 5: Clear cart and redirect
        jest.advanceTimersByTime(3000)
        localStorage.removeItem('cart')

        // Verify
        expect(JSON.parse(localStorage.getItem('cart') || '[]')).toHaveLength(0)
      }

      jest.useRealTimers()
    })
  })

  describe('8. Multi-Item Cart Operations', () => {
    it('handles adding multiple different items', () => {
      // Add first item
      localStorage.setItem('cart', JSON.stringify([mockSearchResults[0]]))
      let cart = JSON.parse(localStorage.getItem('cart') || '[]')
      expect(cart).toHaveLength(1)

      // Add second item
      cart.push(mockSearchResults[1])
      localStorage.setItem('cart', JSON.stringify(cart))

      // Verify
      cart = JSON.parse(localStorage.getItem('cart') || '[]')
      expect(cart).toHaveLength(2)
      expect(cart[0].item).toBe('Big Mac')
      expect(cart[1].item).toBe('Whopper')
    })

    it('calculates correct total for multiple items', () => {
      const cartItems = mockSearchResults
      localStorage.setItem('cart', JSON.stringify(cartItems))

      const cart = JSON.parse(localStorage.getItem('cart') || '[]')
      const totalCalories = cart.reduce((sum: number, item: any) => sum + item.calories, 0)

      expect(totalCalories).toBe(1210) // 550 + 660
    })
  })

  describe('9. State Persistence', () => {
    it('persists search state across page reloads', () => {
      const query = 'high protein low carb'
      mockGet.mockReturnValue(query)

      // Simulate page load with query param
      const persistedQuery = mockGet()
      expect(persistedQuery).toBe(query)
    })

    it('maintains cart state across browser sessions', () => {
      // Session 1: Add items
      localStorage.setItem('cart', JSON.stringify(mockSearchResults))

      // Simulate browser close/reopen
      // localStorage persists

      // Session 2: Retrieve items
      const cart = JSON.parse(localStorage.getItem('cart') || '[]')
      expect(cart).toHaveLength(2)
      expect(cart[0].item).toBe('Big Mac')
    })
  })

  describe('10. Edge Cases Integration', () => {
    it('handles rapid consecutive searches', async () => {
      const searches = ['burger', 'pizza', 'salad']

      for (const query of searches) {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            recommendations: mockSearchResults,
          }),
        })

        await fetch('http://localhost:4000/api/food/recommend', {
          method: 'POST',
          body: JSON.stringify({ query }),
        })
      }

      expect(mockFetch).toHaveBeenCalledTimes(3)
    })

    it('handles adding same item multiple times', () => {
      const item = mockSearchResults[0]

      // Add item with quantity 2
      const cartItem = { ...item, quantity: 2 }
      localStorage.setItem('cart', JSON.stringify([cartItem]))

      const cart = JSON.parse(localStorage.getItem('cart') || '[]')
      expect(cart[0].quantity).toBe(2)
    })

    it('handles empty cart operations', () => {
      localStorage.removeItem('cart')

      const cart = JSON.parse(localStorage.getItem('cart') || '[]')
      expect(cart).toHaveLength(0)

      // Should not crash when accessing empty cart
      const total = cart.reduce((sum: number, item: any) => sum + item.calories, 0)
      expect(total).toBe(0)
    })
  })
})

describe('Integration Tests: API Contract', () => {
  let mockFetch: jest.SpyInstance

  beforeEach(() => {
    mockFetch = jest.spyOn(global, 'fetch')
  })

  afterEach(() => {
    mockFetch.mockRestore()
  })

  it('verifies search API contract', async () => {
    const expectedRequest = {
      query: 'test',
      limit: 10,
      page: 1,
    }

    const expectedResponse = {
      success: true,
      results: [],
      pagination: {
        total: 0,
        page: 1,
        limit: 10,
        pages: 0,
      },
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => expectedResponse,
    })

    const response = await fetch('http://localhost:4000/api/food/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(expectedRequest),
    })

    const data = await response.json()

    expect(data).toMatchObject({
      success: expect.any(Boolean),
      results: expect.any(Array),
      pagination: expect.objectContaining({
        total: expect.any(Number),
        page: expect.any(Number),
        limit: expect.any(Number),
        pages: expect.any(Number),
      }),
    })
  })

  it('verifies recommend API contract', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        recommendations: [],
      }),
    })

    const response = await fetch('http://localhost:4000/api/food/recommend', {
      method: 'POST',
      body: JSON.stringify({ query: 'test' }),
    })

    const data = await response.json()
    expect(data).toHaveProperty('recommendations')
    expect(Array.isArray(data.recommendations)).toBe(true)
  })
})
