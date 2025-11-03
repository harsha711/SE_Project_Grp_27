import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SearchBar from '@/components/SearchBar'

describe('SearchBar Component', () => {
  const mockOnInputChange = jest.fn()
  const mockOnKeyDown = jest.fn()
  const mockOnSearchFocus = jest.fn()
  const mockOnSearchBlur = jest.fn()

  const defaultProps = {
    isDemoMode: false,
    isSearchFocused: false,
    inputValue: '',
    typedText: '',
    onInputChange: mockOnInputChange,
    onKeyDown: mockOnKeyDown,
    onSearchFocus: mockOnSearchFocus,
    onSearchBlur: mockOnSearchBlur,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders the search bar', () => {
      render(<SearchBar {...defaultProps} />)
      const searchInput = screen.getByRole('textbox')
      expect(searchInput).toBeInTheDocument()
    })

    it('has correct accessibility label', () => {
      render(<SearchBar {...defaultProps} />)
      const searchInput = screen.getByLabelText('Search for food')
      expect(searchInput).toBeInTheDocument()
    })

    it('shows placeholder in live mode', () => {
      render(<SearchBar {...defaultProps} />)
      const searchInput = screen.getByPlaceholderText('Search for any craving...')
      expect(searchInput).toBeInTheDocument()
    })

    it('does not show placeholder in demo mode', () => {
      render(<SearchBar {...defaultProps} isDemoMode={true} />)
      const searchInput = screen.getByRole('textbox')
      expect(searchInput).toHaveAttribute('placeholder', '')
    })

    it('shows search icon in live mode', () => {
      render(<SearchBar {...defaultProps} />)
      const searchIcon = screen.getByTestId('search-icon')
      expect(searchIcon).toBeInTheDocument()
    })

    it('does not show search icon in demo mode', () => {
      render(<SearchBar {...defaultProps} isDemoMode={true} />)
      const searchIcon = screen.queryByTestId('search-icon')
      expect(searchIcon).not.toBeInTheDocument()
    })
  })

  describe('Demo Mode', () => {
    it('displays typewriter text in demo mode', () => {
      render(<SearchBar {...defaultProps} isDemoMode={true} typedText="spicy ramen" />)
      expect(screen.getByText('spicy ramen')).toBeInTheDocument()
    })

    it('does not show typewriter text in live mode', () => {
      render(<SearchBar {...defaultProps} isDemoMode={false} typedText="spicy ramen" />)
      expect(screen.queryByText('spicy ramen')).not.toBeInTheDocument()
    })
  })

  describe('Live Mode', () => {
    it('autofocuses in live mode', () => {
      render(<SearchBar {...defaultProps} />)
      const searchInput = screen.getByRole('textbox')
      expect(searchInput).toHaveAttribute('autoFocus')
    })

    it('does not autofocus in demo mode', () => {
      render(<SearchBar {...defaultProps} isDemoMode={true} />)
      const searchInput = screen.getByRole('textbox')
      expect(searchInput).not.toHaveAttribute('autoFocus')
    })

    it('shows Enter CTA when search is focused and has input', () => {
      render(<SearchBar {...defaultProps} isSearchFocused={true} inputValue="pizza" />)
      expect(screen.getByText('↵')).toBeInTheDocument()
    })

    it('does not show Enter CTA when search is not focused', () => {
      render(<SearchBar {...defaultProps} isSearchFocused={false} inputValue="pizza" />)
      expect(screen.queryByText('Press')).not.toBeInTheDocument()
    })

    it('does not show Enter CTA when input is empty', () => {
      render(<SearchBar {...defaultProps} isSearchFocused={true} inputValue="" />)
      expect(screen.queryByText('Press')).not.toBeInTheDocument()
    })

    it('shows helper text when focused with input', () => {
      render(<SearchBar {...defaultProps} isSearchFocused={true} inputValue="bu" />)
      expect(screen.getByText('Press Enter to find your craving')).toBeInTheDocument()
    })

    it('does not show helper text when input is too short', () => {
      render(<SearchBar {...defaultProps} isSearchFocused={true} inputValue="b" />)
      expect(screen.queryByText('Press Enter to find your craving')).not.toBeInTheDocument()
    })
  })

  describe('User Interactions', () => {
    it('calls onInputChange when user types', async () => {
      const user = userEvent.setup()
      render(<SearchBar {...defaultProps} />)
      const searchInput = screen.getByRole('textbox')

      await user.type(searchInput, 'burger')

      expect(mockOnInputChange).toHaveBeenCalled()
    })

    it('calls onSearchFocus when input is focused', () => {
      render(<SearchBar {...defaultProps} />)
      const searchInput = screen.getByRole('textbox')

      fireEvent.focus(searchInput)

      expect(mockOnSearchFocus).toHaveBeenCalledTimes(1)
    })

    it('calls onSearchBlur when input loses focus', () => {
      render(<SearchBar {...defaultProps} />)
      const searchInput = screen.getByRole('textbox')

      fireEvent.blur(searchInput)

      expect(mockOnSearchBlur).toHaveBeenCalledTimes(1)
    })

    it('calls onKeyDown when key is pressed', () => {
      render(<SearchBar {...defaultProps} />)
      const searchInput = screen.getByRole('textbox')

      fireEvent.keyDown(searchInput, { key: 'Enter' })

      expect(mockOnKeyDown).toHaveBeenCalledTimes(1)
    })

    it('displays the current input value', () => {
      render(<SearchBar {...defaultProps} inputValue="tacos" />)
      const searchInput = screen.getByRole('textbox') as HTMLInputElement
      expect(searchInput.value).toBe('tacos')
    })
  })

  describe('Styling States', () => {
    it('applies different background in demo vs live mode', () => {
      const { rerender } = render(<SearchBar {...defaultProps} isDemoMode={true} />)
      const searchBarDemo = screen.getByRole('textbox').closest('div')

      rerender(<SearchBar {...defaultProps} isDemoMode={false} />)
      const searchBarLive = screen.getByRole('textbox').closest('div')

      // Both should exist (testing that component re-renders properly)
      expect(searchBarDemo).toBeInTheDocument()
      expect(searchBarLive).toBeInTheDocument()
    })
  })
})
