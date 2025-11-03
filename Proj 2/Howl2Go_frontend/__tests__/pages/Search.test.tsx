import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SmartMenuSearch from '@/app/search/page'

// Mock Next.js modules
const mockGet = jest.fn()
const mockPush = jest.fn()
const mockReplace = jest.fn()

jest.mock('next/navigation', () => ({
  useSearchParams: () => ({
    get: mockGet,
  }),
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
  usePathname: () => '/search',
}))

// Mock ItemCard component
jest.mock('@/components/ItemCard', () => {
  return function MockItemCard({ restaurant, item, calories, index }: any) {
    return (
      <div data-testid={`item-card-${index}`}>
        {restaurant} - {item} - {calories}cal
      </div>
    )
  }
})

describe('Search Page', () => {
  let mockFetch: jest.SpyInstance

  beforeEach(() => {
    jest.clearAllMocks()
    mockGet.mockReturnValue(null)
    mockFetch = jest.spyOn(global, 'fetch')
  })

  afterEach(() => {
    mockFetch.mockRestore()
  })

  describe('Initial Rendering', () => {
    it('renders the search page', async () => {
      render(<SmartMenuSearch />)
      await waitFor(() => {
        expect(screen.getByLabelText('Search for food')).toBeInTheDocument()
      })
    })

    it('renders navigation header with logo', async () => {
      render(<SmartMenuSearch />)
      await waitFor(() => {
        expect(screen.getByAltText('Howl2Go Logo')).toBeInTheDocument()
      })
    })

    it('renders Back button', async () => {
      render(<SmartMenuSearch />)
      await waitFor(() => {
        expect(screen.getByText('Back')).toBeInTheDocument()
      })
    })

    it('renders Dashboard link', async () => {
      render(<SmartMenuSearch />)
      await waitFor(() => {
        expect(screen.getByRole('link', { name: 'Dashboard' })).toBeInTheDocument()
      })
    })

    it('Back button links to home page', async () => {
      render(<SmartMenuSearch />)
      await waitFor(() => {
        const backLink = screen.getByText('Back').closest('a')
        expect(backLink).toHaveAttribute('href', '/')
      })
    })

    it('renders search input field', async () => {
      render(<SmartMenuSearch />)
      await waitFor(() => {
        const searchInput = screen.getByLabelText('Search for food')
        expect(searchInput).toBeInTheDocument()
        expect(searchInput).toHaveAttribute('type', 'text')
      })
    })
  })

  describe('Initial Query Parameter', () => {
    it('loads with query from URL parameter', async () => {
      mockGet.mockReturnValue('burger')
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          recommendations: [
            {
              company: "McDonald's",
              item: 'Big Mac',
              calories: 550,
            },
          ],
        }),
      })

      render(<SmartMenuSearch />)

      await waitFor(() => {
        const searchInput = screen.getByLabelText('Search for food') as HTMLInputElement
        expect(searchInput.value).toBe('burger')
      })
    })

    it('automatically submits search on load with query param', async () => {
      mockGet.mockReturnValue('pizza')
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          recommendations: [
            {
              company: 'Pizza Hut',
              item: 'Pepperoni Pizza',
              calories: 300,
            },
          ],
        }),
      })

      render(<SmartMenuSearch />)

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:4000/api/food/recommend',
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({ query: 'pizza' }),
          })
        )
      })
    })
  })

  describe('Search Functionality', () => {
    it('allows user to type in search field', async () => {
      const user = userEvent.setup()
      render(<SmartMenuSearch />)

      await waitFor(() => {
        expect(screen.getByLabelText('Search for food')).toBeInTheDocument()
      })

      const searchInput = screen.getByLabelText('Search for food')
      await user.type(searchInput, 'tacos')

      expect(searchInput).toHaveValue('tacos')
    })

    it('submits search on Enter key', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ recommendations: [] }),
      })

      const user = userEvent.setup()
      render(<SmartMenuSearch />)

      await waitFor(() => {
        expect(screen.getByLabelText('Search for food')).toBeInTheDocument()
      })

      const searchInput = screen.getByLabelText('Search for food')
      await user.type(searchInput, 'chicken')
      fireEvent.submit(searchInput.closest('form')!)

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:4000/api/food/recommend',
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({ query: 'chicken' }),
          })
        )
      })
    })

    it('updates URL when search is submitted', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ recommendations: [] }),
      })

      const user = userEvent.setup()
      render(<SmartMenuSearch />)

      await waitFor(() => {
        expect(screen.getByLabelText('Search for food')).toBeInTheDocument()
      })

      const searchInput = screen.getByLabelText('Search for food')
      await user.type(searchInput, 'burger')
      fireEvent.submit(searchInput.closest('form')!)

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith(
          '/search?q=burger',
          expect.any(Object)
        )
      })
    })

    it('does not update URL while typing', async () => {
      const user = userEvent.setup()
      render(<SmartMenuSearch />)

      await waitFor(() => {
        expect(screen.getByLabelText('Search for food')).toBeInTheDocument()
      })

      const searchInput = screen.getByLabelText('Search for food')
      await user.type(searchInput, 'b')

      // URL should not update on every keystroke
      expect(mockReplace).not.toHaveBeenCalled()
    })
  })

  describe('API Integration', () => {
    it('displays results from API', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          recommendations: [
            {
              company: "McDonald's",
              item: 'Big Mac',
              calories: 550,
            },
            {
              company: 'Burger King',
              item: 'Whopper',
              calories: 660,
            },
          ],
        }),
      })

      const user = userEvent.setup()
      render(<SmartMenuSearch />)

      await waitFor(() => {
        expect(screen.getByLabelText('Search for food')).toBeInTheDocument()
      })

      const searchInput = screen.getByLabelText('Search for food')
      await user.type(searchInput, 'burger')
      fireEvent.submit(searchInput.closest('form')!)

      await waitFor(() => {
        expect(screen.getByText(/McDonald's - Big Mac - 550cal/)).toBeInTheDocument()
        expect(screen.getByText(/Burger King - Whopper - 660cal/)).toBeInTheDocument()
      })
    })

    it('shows loading state while fetching', async () => {
      mockFetch.mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve({
                ok: true,
                json: async () => ({ recommendations: [] }),
              } as Response)
            }, 100)
          })
      )

      const user = userEvent.setup()
      render(<SmartMenuSearch />)

      await waitFor(() => {
        expect(screen.getByLabelText('Search for food')).toBeInTheDocument()
      })

      const searchInput = screen.getByLabelText('Search for food')
      await user.type(searchInput, 'pizza')
      fireEvent.submit(searchInput.closest('form')!)

      // Should show loading state (skeleton cards)
      await waitFor(() => {
        const container = document.querySelector('.animate-pulse')
        expect(container).toBeInTheDocument()
      })
    })

    it('handles API errors gracefully', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
      })

      const user = userEvent.setup()
      render(<SmartMenuSearch />)

      await waitFor(() => {
        expect(screen.getByLabelText('Search for food')).toBeInTheDocument()
      })

      const searchInput = screen.getByLabelText('Search for food')
      await user.type(searchInput, 'error')
      fireEvent.submit(searchInput.closest('form')!)

      await waitFor(() => {
        expect(screen.getByText(/Server error/)).toBeInTheDocument()
      })
    })

    it('handles network errors', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'))

      const user = userEvent.setup()
      render(<SmartMenuSearch />)

      await waitFor(() => {
        expect(screen.getByLabelText('Search for food')).toBeInTheDocument()
      })

      const searchInput = screen.getByLabelText('Search for food')
      await user.type(searchInput, 'test')
      fireEvent.submit(searchInput.closest('form')!)

      await waitFor(() => {
        expect(screen.getByText(/Unable to connect to server/)).toBeInTheDocument()
      })
    })

    it('handles 400 error with helpful message', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
      })

      const user = userEvent.setup()
      render(<SmartMenuSearch />)

      await waitFor(() => {
        expect(screen.getByLabelText('Search for food')).toBeInTheDocument()
      })

      const searchInput = screen.getByLabelText('Search for food')
      await user.type(searchInput, 'bad')
      fireEvent.submit(searchInput.closest('form')!)

      await waitFor(() => {
        expect(screen.getByText(/Invalid search query/)).toBeInTheDocument()
      })
    })
  })

  describe('Empty States', () => {
    it('shows empty state when no query', async () => {
      render(<SmartMenuSearch />)

      await waitFor(() => {
        expect(screen.getByText('Start Your Search')).toBeInTheDocument()
      })
    })

    it('shows search suggestions in empty state', async () => {
      render(<SmartMenuSearch />)

      await waitFor(() => {
        expect(
          screen.getByText(/Try searching for something like/)
        ).toBeInTheDocument()
      })
    })
  })

  describe('Keyboard Navigation', () => {
    it('returns to home page on Escape key', async () => {
      render(<SmartMenuSearch />)

      await waitFor(() => {
        expect(screen.getByLabelText('Search for food')).toBeInTheDocument()
      })

      const searchInput = screen.getByLabelText('Search for food')
      fireEvent.keyDown(searchInput, { key: 'Escape' })

      expect(mockPush).toHaveBeenCalledWith('/')
    })
  })

  describe('Search Icon and CTA', () => {
    it('displays search icon', async () => {
      render(<SmartMenuSearch />)

      await waitFor(() => {
        expect(screen.getByTestId('search-icon')).toBeInTheDocument()
      })
    })

    it('shows Enter key CTA when typing', async () => {
      const user = userEvent.setup()
      render(<SmartMenuSearch />)

      await waitFor(() => {
        expect(screen.getByLabelText('Search for food')).toBeInTheDocument()
      })

      const searchInput = screen.getByLabelText('Search for food')
      await user.type(searchInput, 'p')

      await waitFor(() => {
        expect(screen.getByText('↵')).toBeInTheDocument()
      })
    })
  })

  describe('Results Parsing', () => {
    it('handles recommendations array format', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          recommendations: [
            {
              company: 'Test Restaurant',
              item: 'Test Item',
              calories: 100,
            },
          ],
        }),
      })

      const user = userEvent.setup()
      render(<SmartMenuSearch />)

      await waitFor(() => {
        expect(screen.getByLabelText('Search for food')).toBeInTheDocument()
      })

      const searchInput = screen.getByLabelText('Search for food')
      await user.type(searchInput, 'test')
      fireEvent.submit(searchInput.closest('form')!)

      await waitFor(() => {
        expect(screen.getByText(/Test Restaurant - Test Item - 100cal/)).toBeInTheDocument()
      })
    })

    it('handles array format without recommendations wrapper', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => [
          {
            company: 'Direct Restaurant',
            item: 'Direct Item',
            calories: 200,
          },
        ],
      })

      const user = userEvent.setup()
      render(<SmartMenuSearch />)

      await waitFor(() => {
        expect(screen.getByLabelText('Search for food')).toBeInTheDocument()
      })

      const searchInput = screen.getByLabelText('Search for food')
      await user.type(searchInput, 'test')
      fireEvent.submit(searchInput.closest('form')!)

      await waitFor(() => {
        expect(screen.getByText(/Direct Restaurant - Direct Item - 200cal/)).toBeInTheDocument()
      })
    })
  })

  describe('Layout', () => {
    it('has sticky header', async () => {
      const { container } = render(<SmartMenuSearch />)

      await waitFor(() => {
        const header = container.querySelector('.sticky')
        expect(header).toBeInTheDocument()
      })
    })

    it('results are in a grid layout', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          recommendations: [
            { company: 'Test', item: 'Item', calories: 100 },
          ],
        }),
      })

      const user = userEvent.setup()
      render(<SmartMenuSearch />)

      await waitFor(() => {
        expect(screen.getByLabelText('Search for food')).toBeInTheDocument()
      })

      const searchInput = screen.getByLabelText('Search for food')
      await user.type(searchInput, 'test')
      fireEvent.submit(searchInput.closest('form')!)

      await waitFor(() => {
        const grid = document.querySelector('.grid')
        expect(grid).toBeInTheDocument()
      })
    })
  })
})
