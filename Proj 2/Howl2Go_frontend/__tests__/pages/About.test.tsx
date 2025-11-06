import { render, screen, waitFor } from '@testing-library/react'
import About from '@/app/about/page'

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}))

// Mock components
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

// Mock next/link
jest.mock('next/link', () => {
  return function MockLink({ children, href, ...props }: any) {
    return <a href={href} {...props}>{children}</a>
  }
})

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Search: () => <div data-testid="search-icon">Search Icon</div>,
  TrendingUp: () => <div data-testid="trending-icon">TrendingUp Icon</div>,
  ShoppingCart: () => <div data-testid="cart-icon">ShoppingCart Icon</div>,
  Shield: () => <div data-testid="shield-icon">Shield Icon</div>,
  Zap: () => <div data-testid="zap-icon">Zap Icon</div>,
  Heart: () => <div data-testid="heart-icon">Heart Icon</div>,
}))

describe('About Page', () => {
  describe('Rendering', () => {
    it('renders the about page', () => {
      render(<About />)
      expect(screen.getByTestId('header')).toBeInTheDocument()
      expect(screen.getByTestId('footer')).toBeInTheDocument()
    })

    it('renders the page title', () => {
      render(<About />)
      expect(screen.getByText(/About.*Wolf2Go/i)).toBeInTheDocument()
    })

    it('renders the tagline', () => {
      render(<About />)
      expect(screen.getByText(/The smart way to discover food nutrition/)).toBeInTheDocument()
    })

    it('renders all sections', () => {
      const { container } = render(<About />)
      expect(container.querySelector('.min-h-screen')).toBeInTheDocument()
    })

    it('has proper background color', () => {
      const { container } = render(<About />)
      const mainDiv = container.querySelector('.bg-\\[var\\(--howl-bg\\)\\]')
      expect(mainDiv).toBeInTheDocument()
    })
  })

  describe('What is Wolf2Go Section', () => {
    it('renders the "What is Wolf2Go?" heading', () => {
      render(<About />)
      expect(screen.getByText('What is Wolf2Go?')).toBeInTheDocument()
    })

    it('explains the platform concept', () => {
      render(<About />)
      expect(screen.getByText(/revolutionary food delivery platform/i)).toBeInTheDocument()
    })

    it('mentions search functionality', () => {
      render(<About />)
      expect(screen.getByText(/search for exactly what you want/i)).toBeInTheDocument()
    })

    it('lists technology stack', () => {
      render(<About />)
      expect(screen.getAllByText(/Next.js/).length).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByText(/React/).length).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByText(/TypeScript/).length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('Key Features Section', () => {
    it('renders the "Key Features" heading', () => {
      render(<About />)
      expect(screen.getByText('Key Features')).toBeInTheDocument()
    })

    it('renders all 6 feature cards', () => {
      render(<About />)
      expect(screen.getByText('Search-First Discovery')).toBeInTheDocument()
      expect(screen.getByText('Instant Nutrition Facts')).toBeInTheDocument()
      expect(screen.getByText('Health Tracking Dashboard')).toBeInTheDocument()
      expect(screen.getByText('Smart Cart Management')).toBeInTheDocument()
      expect(screen.getByText('Secure & Private')).toBeInTheDocument()
      expect(screen.getByText('Lightning Fast')).toBeInTheDocument()
    })

    it('renders feature icons', () => {
      render(<About />)
      expect(screen.getByTestId('search-icon')).toBeInTheDocument()
      expect(screen.getByTestId('trending-icon')).toBeInTheDocument()
      expect(screen.getByTestId('heart-icon')).toBeInTheDocument()
      expect(screen.getByTestId('cart-icon')).toBeInTheDocument()
      expect(screen.getByTestId('shield-icon')).toBeInTheDocument()
      expect(screen.getByTestId('zap-icon')).toBeInTheDocument()
    })

    it('displays feature descriptions', () => {
      render(<About />)
      expect(screen.getByText(/No endless scrolling through menus/i)).toBeInTheDocument()
      expect(screen.getByText(/Get complete nutritional information/i)).toBeInTheDocument()
      expect(screen.getByText(/Track your daily nutrition goals/i)).toBeInTheDocument()
    })
  })

  describe('Technology Stack Section', () => {
    it('renders the "Built with Modern Technology" heading', () => {
      render(<About />)
      expect(screen.getByText('Built with Modern Technology')).toBeInTheDocument()
    })

    it('lists all technology badges', () => {
      render(<About />)
      const technologies = ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Framer Motion', 'Node.js']

      technologies.forEach(tech => {
        expect(screen.getAllByText(tech).length).toBeGreaterThanOrEqual(1)
      })
    })

    it('displays technology description', () => {
      render(<About />)
      expect(screen.getByText(/powered by cutting-edge web technologies/i)).toBeInTheDocument()
    })
  })

  describe('Call to Action Section', () => {
    it('renders the CTA heading', () => {
      render(<About />)
      expect(screen.getByText('Ready to get started?')).toBeInTheDocument()
    })

    it('renders CTA description', () => {
      render(<About />)
      expect(screen.getByText(/Search for your next meal and track your nutrition goals today/i)).toBeInTheDocument()
    })

    it('renders "Start Searching" button', () => {
      render(<About />)
      const startButton = screen.getByText('Start Searching')
      expect(startButton).toBeInTheDocument()
      expect(startButton.closest('a')).toHaveAttribute('href', '/')
    })

    it('renders "View Dashboard" button', () => {
      render(<About />)
      const dashboardButton = screen.getByText('View Dashboard')
      expect(dashboardButton).toBeInTheDocument()
      expect(dashboardButton.closest('a')).toHaveAttribute('href', '/dashboard')
    })

    it('has proper button styling classes', () => {
      render(<About />)
      const startButton = screen.getByText('Start Searching').closest('a')
      expect(startButton).toHaveClass('px-8', 'py-4', 'rounded-full')
    })
  })

  describe('Layout and Styling', () => {
    it('has minimum height screen', () => {
      const { container } = render(<About />)
      expect(container.querySelector('.min-h-screen')).toBeInTheDocument()
    })

    it('applies correct background color', () => {
      const { container } = render(<About />)
      const mainDiv = container.querySelector('.bg-\\[var\\(--howl-bg\\)\\]')
      expect(mainDiv).toBeInTheDocument()
    })

    it('has proper section spacing', () => {
      const { container } = render(<About />)
      const sections = container.querySelectorAll('section')
      expect(sections.length).toBeGreaterThan(0)
    })

    it('uses responsive design classes', () => {
      const { container } = render(<About />)
      // Check for responsive classes like sm:, md:, lg:
      const html = container.innerHTML
      expect(html).toContain('sm:')
      expect(html).toContain('lg:')
    })
  })

  describe('Navigation Links', () => {
    it('links to home page correctly', () => {
      render(<About />)
      const homeLink = screen.getByText('Start Searching').closest('a')
      expect(homeLink).toHaveAttribute('href', '/')
    })

    it('links to dashboard correctly', () => {
      render(<About />)
      const dashboardLink = screen.getByText('View Dashboard').closest('a')
      expect(dashboardLink).toHaveAttribute('href', '/dashboard')
    })
  })

  describe('Content Validation', () => {
    it('mentions search functionality benefits', () => {
      render(<About />)
      expect(screen.getByText(/No menus. No hassle/i)).toBeInTheDocument()
    })

    it('highlights nutrition tracking', () => {
      render(<About />)
      expect(screen.getByText(/track your health goals/i)).toBeInTheDocument()
    })

    it('emphasizes security features', () => {
      render(<About />)
      expect(screen.getByText(/industry-standard security/i)).toBeInTheDocument()
    })

    it('mentions performance benefits', () => {
      render(<About />)
      expect(screen.getByText(/results in milliseconds/i)).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has proper heading hierarchy', () => {
      const { container } = render(<About />)
      const h1 = container.querySelector('h1')
      const h2 = container.querySelectorAll('h2')
      const h3 = container.querySelectorAll('h3')

      expect(h1).toBeInTheDocument()
      expect(h2.length).toBeGreaterThan(0)
      expect(h3.length).toBeGreaterThan(0)
    })

    it('buttons have descriptive text', () => {
      render(<About />)
      expect(screen.getByText('Start Searching')).toBeInTheDocument()
      expect(screen.getByText('View Dashboard')).toBeInTheDocument()
    })
  })

  describe('Responsive Design', () => {
    it('has responsive grid layout for features', () => {
      const { container } = render(<About />)
      const grid = container.querySelector('.grid')
      expect(grid).toBeInTheDocument()
    })

    it('uses responsive text sizing', () => {
      const { container } = render(<About />)
      const html = container.innerHTML
      expect(html).toContain('text-5xl')
      expect(html).toContain('sm:text-6xl')
    })

    it('has responsive padding classes', () => {
      const { container } = render(<About />)
      const html = container.innerHTML
      expect(html).toContain('px-4')
      expect(html).toContain('sm:px-6')
      expect(html).toContain('lg:px-8')
    })
  })

  describe('Client Component Functionality', () => {
    it('renders as a client component', () => {
      const { container } = render(<About />)
      expect(container).toBeInTheDocument()
    })

    it('handles motion animations without errors', () => {
      expect(() => render(<About />)).not.toThrow()
    })
  })

  describe('Edge Cases', () => {
    it('renders without crashing when no props are passed', () => {
      expect(() => render(<About />)).not.toThrow()
    })

    it('maintains structure with all sections present', () => {
      const { container } = render(<About />)
      const sections = container.querySelectorAll('section')
      // Should have: Hero, What is Wolf2Go, Features, Tech Stack, CTA
      expect(sections.length).toBeGreaterThanOrEqual(4)
    })
  })
})
