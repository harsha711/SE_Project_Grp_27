import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import HeroSection from '@/components/HeroSection'

// Mock child components
jest.mock('@/components/AnimatedHeadline', () => {
  return function MockAnimatedHeadline({ isSearchFocused }: any) {
    return <div data-testid="animated-headline">Headline {isSearchFocused ? 'Focused' : 'Normal'}</div>
  }
})

jest.mock('@/components/SearchBar', () => {
  return function MockSearchBar({
    isDemoMode,
    isSearchFocused,
    inputValue,
    typedText,
    onInputChange,
    onKeyDown,
    onSearchFocus,
    onSearchBlur,
  }: any) {
    return (
      <div data-testid="search-bar">
        <input
          data-testid="search-input"
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={onKeyDown}
          onFocus={onSearchFocus}
          onBlur={onSearchBlur}
          placeholder={isDemoMode ? 'Demo' : 'Live'}
        />
        <span data-testid="typed-text">{typedText}</span>
        <span data-testid="mode">{isDemoMode ? 'Demo' : 'Live'}</span>
        <span data-testid="focus-state">{isSearchFocused ? 'Focused' : 'Blurred'}</span>
      </div>
    )
  }
})

jest.mock('@/components/SearchResults', () => {
  return function MockSearchResults({
    isDemoMode,
    isSearchFocused,
    showDemoCards,
    showLiveResults,
    filteredResults,
  }: any) {
    return (
      <div data-testid="search-results">
        <span data-testid="results-mode">{isDemoMode ? 'Demo' : 'Live'}</span>
        <span data-testid="results-demo-cards">{showDemoCards ? 'Showing' : 'Hidden'}</span>
        <span data-testid="results-live">{showLiveResults ? 'Showing' : 'Hidden'}</span>
        <span data-testid="results-count">{filteredResults.length}</span>
      </div>
    )
  }
})

describe('HeroSection Component', () => {
  let mockPush: jest.Mock
  const mockOnSearchFocusChange = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
    mockPush = global.mockRouterPush as jest.Mock
    mockPush.mockClear()
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  describe('Initial State', () => {
    it('renders the hero section', () => {
      render(<HeroSection onSearchFocusChange={mockOnSearchFocusChange} />)
      expect(screen.getByTestId('animated-headline')).toBeInTheDocument()
      expect(screen.getByTestId('search-bar')).toBeInTheDocument()
      expect(screen.getByTestId('search-results')).toBeInTheDocument()
    })

    it('starts in demo mode', () => {
      render(<HeroSection onSearchFocusChange={mockOnSearchFocusChange} />)
      expect(screen.getByTestId('mode')).toHaveTextContent('Demo')
    })

    it('starts with search not focused', () => {
      render(<HeroSection onSearchFocusChange={mockOnSearchFocusChange} />)
      expect(screen.getByTestId('focus-state')).toHaveTextContent('Blurred')
    })

    it('starts with empty input value', () => {
      render(<HeroSection onSearchFocusChange={mockOnSearchFocusChange} />)
      const input = screen.getByTestId('search-input') as HTMLInputElement
      expect(input.value).toBe('')
    })
  })

  describe('Demo Mode - Typewriter Effect', () => {
    it('cycles through typewriter text', async () => {
      render(<HeroSection onSearchFocusChange={mockOnSearchFocusChange} />)

      // Fast-forward timers to trigger typewriter effect
      act(() => {
        jest.advanceTimersByTime(1000)
      })

      const typedText = screen.getByTestId('typed-text')
      // Text should have some content during typing
      await waitFor(() => {
        expect(typedText.textContent).not.toBe('')
      })
    })

    it('shows demo cards after typing completes', async () => {
      render(<HeroSection onSearchFocusChange={mockOnSearchFocusChange} />)

      // Initial state - demo cards should be hidden
      expect(screen.getByTestId('results-demo-cards')).toHaveTextContent('Hidden')

      // Fast-forward through typing and delay
      act(() => {
        jest.advanceTimersByTime(5000)
      })

      // Demo cards should now be showing
      await waitFor(() => {
        expect(screen.getByTestId('results-demo-cards')).toHaveTextContent('Showing')
      })
    })
  })

  describe('Mode Switching', () => {
    it('switches to live mode when search is focused', () => {
      render(<HeroSection onSearchFocusChange={mockOnSearchFocusChange} />)
      const input = screen.getByTestId('search-input')

      fireEvent.focus(input)

      expect(screen.getByTestId('mode')).toHaveTextContent('Live')
      expect(screen.getByTestId('focus-state')).toHaveTextContent('Focused')
    })

    it('shows live results when switching to live mode', () => {
      render(<HeroSection onSearchFocusChange={mockOnSearchFocusChange} />)
      const input = screen.getByTestId('search-input')

      fireEvent.focus(input)

      expect(screen.getByTestId('results-live')).toHaveTextContent('Showing')
    })

    it('returns to demo mode when input is blurred and empty', () => {
      render(<HeroSection onSearchFocusChange={mockOnSearchFocusChange} />)
      const input = screen.getByTestId('search-input')

      // Focus and then blur
      fireEvent.focus(input)
      fireEvent.blur(input)

      expect(screen.getByTestId('mode')).toHaveTextContent('Demo')
      expect(screen.getByTestId('results-live')).toHaveTextContent('Hidden')
    })

    it('does not return to demo mode when blurred with input value', async () => {
      const user = userEvent.setup({ delay: null })
      render(<HeroSection onSearchFocusChange={mockOnSearchFocusChange} />)
      const input = screen.getByTestId('search-input')

      fireEvent.focus(input)
      await user.type(input, 'pizza')
      fireEvent.blur(input)

      expect(screen.getByTestId('mode')).toHaveTextContent('Live')
    })

    it('calls onSearchFocusChange when focus state changes', () => {
      render(<HeroSection onSearchFocusChange={mockOnSearchFocusChange} />)
      const input = screen.getByTestId('search-input')

      fireEvent.focus(input)
      expect(mockOnSearchFocusChange).toHaveBeenCalledWith(true)

      fireEvent.blur(input)
      expect(mockOnSearchFocusChange).toHaveBeenCalledWith(false)
    })
  })

  describe('User Input', () => {
    it('updates input value when user types', async () => {
      const user = userEvent.setup({ delay: null })
      render(<HeroSection onSearchFocusChange={mockOnSearchFocusChange} />)
      const input = screen.getByTestId('search-input')

      fireEvent.focus(input)
      await user.type(input, 'burger')

      expect(input).toHaveValue('burger')
    })

    it('filters results based on item name', async () => {
      const user = userEvent.setup({ delay: null })
      render(<HeroSection onSearchFocusChange={mockOnSearchFocusChange} />)
      const input = screen.getByTestId('search-input')

      fireEvent.focus(input)
      await user.type(input, 'Big Mac')

      // Mock has 4 items total, "Big Mac" should match at least 1
      const resultsCount = screen.getByTestId('results-count')
      expect(parseInt(resultsCount.textContent || '0')).toBeGreaterThanOrEqual(1)
    })

    it('filters results based on restaurant name', async () => {
      const user = userEvent.setup({ delay: null })
      render(<HeroSection onSearchFocusChange={mockOnSearchFocusChange} />)
      const input = screen.getByTestId('search-input')

      fireEvent.focus(input)
      await user.type(input, "McDonald's")

      const resultsCount = screen.getByTestId('results-count')
      expect(parseInt(resultsCount.textContent || '0')).toBeGreaterThanOrEqual(1)
    })

    it('shows all results when search is empty', () => {
      render(<HeroSection onSearchFocusChange={mockOnSearchFocusChange} />)
      const input = screen.getByTestId('search-input')

      fireEvent.focus(input)

      const resultsCount = screen.getByTestId('results-count')
      expect(parseInt(resultsCount.textContent || '0')).toBe(4) // Mock has 4 items
    })
  })

  describe('Keyboard Navigation', () => {
    it('navigates to search page on Enter key with query', async () => {
      const user = userEvent.setup({ delay: null })
      render(<HeroSection onSearchFocusChange={mockOnSearchFocusChange} />)
      const input = screen.getByTestId('search-input')

      fireEvent.focus(input)
      await user.type(input, 'pizza')
      fireEvent.keyDown(input, { key: 'Enter' })

      expect(mockPush).toHaveBeenCalledWith('/search?q=pizza')
    })

    it('does not navigate on Enter with empty query', () => {
      render(<HeroSection onSearchFocusChange={mockOnSearchFocusChange} />)
      const input = screen.getByTestId('search-input')

      fireEvent.focus(input)
      fireEvent.keyDown(input, { key: 'Enter' })

      expect(mockPush).not.toHaveBeenCalled()
    })

    it('trims whitespace from query before navigation', async () => {
      const user = userEvent.setup({ delay: null })
      render(<HeroSection onSearchFocusChange={mockOnSearchFocusChange} />)
      const input = screen.getByTestId('search-input')

      fireEvent.focus(input)
      await user.type(input, '  burger  ')
      fireEvent.keyDown(input, { key: 'Enter' })

      expect(mockPush).toHaveBeenCalledWith('/search?q=burger')
    })

    it('encodes special characters in URL', async () => {
      const user = userEvent.setup({ delay: null })
      render(<HeroSection onSearchFocusChange={mockOnSearchFocusChange} />)
      const input = screen.getByTestId('search-input')

      fireEvent.focus(input)
      await user.type(input, 'mac & cheese')
      fireEvent.keyDown(input, { key: 'Enter' })

      expect(mockPush).toHaveBeenCalledWith('/search?q=mac%20%26%20cheese')
    })

    it('returns to demo mode on Escape with empty input', () => {
      render(<HeroSection onSearchFocusChange={mockOnSearchFocusChange} />)
      const input = screen.getByTestId('search-input')

      fireEvent.focus(input)
      expect(screen.getByTestId('mode')).toHaveTextContent('Live')

      fireEvent.keyDown(input, { key: 'Escape' })

      expect(screen.getByTestId('mode')).toHaveTextContent('Demo')
      expect(screen.getByTestId('focus-state')).toHaveTextContent('Blurred')
    })

    it('does not return to demo mode on Escape with input value', async () => {
      const user = userEvent.setup({ delay: null })
      render(<HeroSection onSearchFocusChange={mockOnSearchFocusChange} />)
      const input = screen.getByTestId('search-input')

      fireEvent.focus(input)
      await user.type(input, 'pizza')
      fireEvent.keyDown(input, { key: 'Escape' })

      expect(screen.getByTestId('mode')).toHaveTextContent('Live')
    })
  })

  describe('Search Results Filtering', () => {
    it('is case-insensitive when filtering', async () => {
      const user = userEvent.setup({ delay: null })
      render(<HeroSection onSearchFocusChange={mockOnSearchFocusChange} />)
      const input = screen.getByTestId('search-input')

      fireEvent.focus(input)
      await user.type(input, 'BIG MAC')

      const resultsCount = screen.getByTestId('results-count')
      expect(parseInt(resultsCount.textContent || '0')).toBeGreaterThanOrEqual(1)
    })

    it('shows no results for non-matching query', async () => {
      const user = userEvent.setup({ delay: null })
      render(<HeroSection onSearchFocusChange={mockOnSearchFocusChange} />)
      const input = screen.getByTestId('search-input')

      fireEvent.focus(input)
      await user.type(input, 'XYZNONEXISTENT')

      const resultsCount = screen.getByTestId('results-count')
      expect(parseInt(resultsCount.textContent || '0')).toBe(0)
    })
  })

  describe('Component Structure', () => {
    it('renders within a section element', () => {
      const { container } = render(<HeroSection onSearchFocusChange={mockOnSearchFocusChange} />)
      const section = container.querySelector('section')
      expect(section).toBeInTheDocument()
    })

    it('renders all three main child components', () => {
      render(<HeroSection onSearchFocusChange={mockOnSearchFocusChange} />)
      expect(screen.getByTestId('animated-headline')).toBeInTheDocument()
      expect(screen.getByTestId('search-bar')).toBeInTheDocument()
      expect(screen.getByTestId('search-results')).toBeInTheDocument()
    })
  })
})
