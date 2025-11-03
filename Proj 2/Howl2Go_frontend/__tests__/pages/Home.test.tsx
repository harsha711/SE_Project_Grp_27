import { render, screen } from '@testing-library/react'
import Home from '@/app/page'

// Mock all child components
jest.mock('@/components/Header', () => {
  return function MockHeader() {
    return <header data-testid="header">Header</header>
  }
})

jest.mock('@/components/Footer', () => {
  return function MockFooter() {
    return <footer data-testid="footer">Footer</footer>
  }
})

jest.mock('@/components/HeroSection', () => {
  return function MockHeroSection({ onSearchFocusChange }: any) {
    return (
      <div data-testid="hero-section">
        <button onClick={() => onSearchFocusChange(true)}>Focus</button>
        <button onClick={() => onSearchFocusChange(false)}>Blur</button>
      </div>
    )
  }
})

jest.mock('@/components/FrequentlyBoughtSection', () => {
  return function MockFrequentlyBoughtSection({ isSearchFocused }: any) {
    return (
      <div data-testid="frequently-bought-section">
        Frequently Bought - {isSearchFocused ? 'Focused' : 'Not Focused'}
      </div>
    )
  }
})

describe('Home Page', () => {
  describe('Rendering', () => {
    it('renders the home page', () => {
      render(<Home />)
      expect(screen.getByTestId('header')).toBeInTheDocument()
      expect(screen.getByTestId('hero-section')).toBeInTheDocument()
      expect(screen.getByTestId('frequently-bought-section')).toBeInTheDocument()
      expect(screen.getByTestId('footer')).toBeInTheDocument()
    })

    it('renders all main sections in correct order', () => {
      const { container } = render(<Home />)
      const sections = container.querySelectorAll('[data-testid]')
      const testIds = Array.from(sections).map(el => el.getAttribute('data-testid'))

      expect(testIds).toEqual([
        'header',
        'hero-section',
        'frequently-bought-section',
        'footer',
      ])
    })
  })

  describe('State Management', () => {
    it('starts with search not focused', () => {
      render(<Home />)
      expect(screen.getByText(/Not Focused/)).toBeInTheDocument()
    })

    it('updates FrequentlyBoughtSection when search focus changes to focused', () => {
      render(<Home />)
      const focusButton = screen.getByText('Focus')

      focusButton.click()

      expect(screen.getByText(/Frequently Bought - Focused/)).toBeInTheDocument()
    })

    it('updates FrequentlyBoughtSection when search focus changes to blurred', () => {
      render(<Home />)
      const focusButton = screen.getByText('Focus')
      const blurButton = screen.getByText('Blur')

      focusButton.click()
      expect(screen.getByText(/Frequently Bought - Focused/)).toBeInTheDocument()

      blurButton.click()
      expect(screen.getByText(/Frequently Bought - Not Focused/)).toBeInTheDocument()
    })
  })

  describe('Layout', () => {
    it('has minimum height screen class', () => {
      const { container } = render(<Home />)
      const mainDiv = container.querySelector('.min-h-screen')
      expect(mainDiv).toBeInTheDocument()
    })

    it('applies background color class', () => {
      const { container } = render(<Home />)
      const mainDiv = container.querySelector('.bg-\\[var\\(--howl-bg\\)\\]')
      expect(mainDiv).toBeInTheDocument()
    })

    it('has padding top for header spacing', () => {
      const { container } = render(<Home />)
      const contentDiv = container.querySelector('.pt-15')
      expect(contentDiv).toBeInTheDocument()
    })
  })

  describe('Component Integration', () => {
    it('passes onSearchFocusChange callback to HeroSection', () => {
      render(<Home />)
      const heroSection = screen.getByTestId('hero-section')
      expect(heroSection).toBeInTheDocument()
      expect(screen.getByText('Focus')).toBeInTheDocument()
      expect(screen.getByText('Blur')).toBeInTheDocument()
    })

    it('passes isSearchFocused state to FrequentlyBoughtSection', () => {
      render(<Home />)
      const frequentlyBought = screen.getByTestId('frequently-bought-section')
      expect(frequentlyBought).toBeInTheDocument()
      expect(frequentlyBought).toHaveTextContent('Not Focused')
    })
  })

  describe('Client Component', () => {
    it('renders as a client component', () => {
      const { container } = render(<Home />)
      expect(container).toBeInTheDocument()
    })

    it('can handle state updates (client-side interactivity)', () => {
      render(<Home />)
      const focusButton = screen.getByText('Focus')

      // Should be able to interact with the component
      expect(() => focusButton.click()).not.toThrow()
    })
  })
})
