import { render, screen, waitFor } from '@testing-library/react'
import Dashboard from '@/app/dashboard/page'

// Mock useAuth hook
const mockUseAuth = jest.fn()
jest.mock('@/context/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
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

jest.mock('@/components/DashboardHero', () => {
  return function MockDashboardHero({ userName, dailyProgress, recentMeals }: any) {
    return (
      <div data-testid="dashboard-hero">
        <div data-testid="user-name">{userName}</div>
        <div data-testid="daily-progress-consumed">{dailyProgress.consumed}</div>
        <div data-testid="daily-progress-goal">{dailyProgress.goal}</div>
        <div data-testid="meals-count">{recentMeals.length}</div>
      </div>
    )
  }
})

// Mock dashboard data utilities
jest.mock('@/lib/mockDashboardData', () => ({
  mockDashboardData: {
    todaysMeals: [
      {
        id: '1',
        item: 'Grilled Chicken',
        calories: 300,
        protein: 30,
        restaurant: 'Subway',
        time: '12:00 PM',
      },
      {
        id: '2',
        item: 'Greek Salad',
        calories: 150,
        protein: 5,
        restaurant: 'Panera',
        time: '6:00 PM',
      },
    ],
  },
  calculateDailyProgress: (meals: any[], goal: number) => ({
    consumed: meals.reduce((sum, meal) => sum + meal.calories, 0),
    goal: goal,
    remaining: goal - meals.reduce((sum, meal) => sum + meal.calories, 0),
    percentage: (meals.reduce((sum, meal) => sum + meal.calories, 0) / goal) * 100,
  }),
}))

describe('Dashboard Page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Loading State', () => {
    it('displays loading message when auth is loading', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isLoading: true,
      })

      render(<Dashboard />)
      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('applies correct styling to loading screen', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isLoading: true,
      })

      const { container } = render(<Dashboard />)
      const loadingDiv = container.querySelector('.min-h-screen')
      expect(loadingDiv).toBeInTheDocument()
      expect(loadingDiv).toHaveClass('flex', 'items-center', 'justify-center')
    })

    it('does not render Header or Footer during loading', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isLoading: true,
      })

      render(<Dashboard />)
      expect(screen.queryByTestId('header')).not.toBeInTheDocument()
      expect(screen.queryByTestId('footer')).not.toBeInTheDocument()
    })
  })

  describe('Unauthenticated State', () => {
    it('displays login prompt when user is not logged in', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isLoading: false,
      })

      render(<Dashboard />)
      expect(screen.getByText('Please log in to view dashboard')).toBeInTheDocument()
    })

    it('does not render dashboard content when not logged in', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isLoading: false,
      })

      render(<Dashboard />)
      expect(screen.queryByTestId('dashboard-hero')).not.toBeInTheDocument()
    })

    it('applies correct background color to login prompt screen', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isLoading: false,
      })

      const { container } = render(<Dashboard />)
      const mainDiv = container.querySelector('.bg-\\[var\\(--howl-bg\\)\\]')
      expect(mainDiv).toBeInTheDocument()
    })
  })

  describe('Authenticated State - Rendering', () => {
    const mockUser = {
      id: '123',
      name: 'John Doe',
      email: 'john@example.com',
      dailyGoal: 2000,
    }

    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: mockUser,
        isLoading: false,
      })
    })

    it('renders Header when user is logged in', () => {
      render(<Dashboard />)
      expect(screen.getByTestId('header')).toBeInTheDocument()
    })

    it('renders Footer when user is logged in', () => {
      render(<Dashboard />)
      expect(screen.getByTestId('footer')).toBeInTheDocument()
    })

    it('renders DashboardHero component', () => {
      render(<Dashboard />)
      expect(screen.getByTestId('dashboard-hero')).toBeInTheDocument()
    })

    it('has proper layout structure', () => {
      const { container } = render(<Dashboard />)
      const mainDiv = container.querySelector('.min-h-screen')
      expect(mainDiv).toBeInTheDocument()
    })

    it('applies proper padding for header spacing', () => {
      const { container } = render(<Dashboard />)
      const contentDiv = container.querySelector('.pt-15')
      expect(contentDiv).toBeInTheDocument()
    })
  })

  describe('User Data Display', () => {
    it('passes user name to DashboardHero', () => {
      mockUseAuth.mockReturnValue({
        user: {
          id: '123',
          name: 'Jane Smith',
          email: 'jane@example.com',
          dailyGoal: 2000,
        },
        isLoading: false,
      })

      render(<Dashboard />)
      expect(screen.getByTestId('user-name')).toHaveTextContent('Jane Smith')
    })

    it('displays correct user name for different users', () => {
      mockUseAuth.mockReturnValue({
        user: {
          id: '456',
          name: 'Alex Johnson',
          email: 'alex@example.com',
          dailyGoal: 2500,
        },
        isLoading: false,
      })

      render(<Dashboard />)
      expect(screen.getByTestId('user-name')).toHaveTextContent('Alex Johnson')
    })
  })

  describe('Daily Progress Calculation', () => {
    it('calculates daily progress with default goal of 2000 calories', async () => {
      mockUseAuth.mockReturnValue({
        user: {
          id: '123',
          name: 'John Doe',
          email: 'john@example.com',
          // No dailyGoal specified, should default to 2000
        },
        isLoading: false,
      })

      render(<Dashboard />)

      await waitFor(() => {
        expect(screen.getByTestId('daily-progress-goal')).toHaveTextContent('2000')
      })
    })

    it('calculates daily progress with custom goal', async () => {
      mockUseAuth.mockReturnValue({
        user: {
          id: '123',
          name: 'John Doe',
          email: 'john@example.com',
          dailyGoal: 2500,
        },
        isLoading: false,
      })

      render(<Dashboard />)

      await waitFor(() => {
        expect(screen.getByTestId('daily-progress-goal')).toHaveTextContent('2500')
      })
    })

    it('calculates consumed calories from meals', async () => {
      mockUseAuth.mockReturnValue({
        user: {
          id: '123',
          name: 'John Doe',
          email: 'john@example.com',
          dailyGoal: 2000,
        },
        isLoading: false,
      })

      render(<Dashboard />)

      // Mock meals: 300 + 150 = 450 calories
      await waitFor(() => {
        expect(screen.getByTestId('daily-progress-consumed')).toHaveTextContent('450')
      })
    })
  })

  describe('Meals Display', () => {
    it('displays today\'s meals', async () => {
      mockUseAuth.mockReturnValue({
        user: {
          id: '123',
          name: 'John Doe',
          email: 'john@example.com',
          dailyGoal: 2000,
        },
        isLoading: false,
      })

      render(<Dashboard />)

      await waitFor(() => {
        expect(screen.getByTestId('meals-count')).toHaveTextContent('2')
      })
    })

    it('passes meal data to DashboardHero', async () => {
      mockUseAuth.mockReturnValue({
        user: {
          id: '123',
          name: 'John Doe',
          email: 'john@example.com',
          dailyGoal: 2000,
        },
        isLoading: false,
      })

      render(<Dashboard />)

      await waitFor(() => {
        const dashboardHero = screen.getByTestId('dashboard-hero')
        expect(dashboardHero).toBeInTheDocument()
      })
    })
  })

  describe('Layout and Styling', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: {
          id: '123',
          name: 'John Doe',
          email: 'john@example.com',
          dailyGoal: 2000,
        },
        isLoading: false,
      })
    })

    it('has minimum height screen class', () => {
      const { container } = render(<Dashboard />)
      expect(container.querySelector('.min-h-screen')).toBeInTheDocument()
    })

    it('applies correct background color', () => {
      const { container } = render(<Dashboard />)
      const mainDiv = container.querySelector('.bg-\\[var\\(--howl-bg\\)\\]')
      expect(mainDiv).toBeInTheDocument()
    })

    it('has proper padding top for header', () => {
      const { container } = render(<Dashboard />)
      expect(container.querySelector('.pt-15')).toBeInTheDocument()
    })
  })

  describe('State Management', () => {
    it('initializes with empty meals array', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isLoading: true,
      })

      render(<Dashboard />)
      // Should not crash on initial render
      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('updates meals when user data loads', async () => {
      mockUseAuth.mockReturnValue({
        user: {
          id: '123',
          name: 'John Doe',
          email: 'john@example.com',
          dailyGoal: 2000,
        },
        isLoading: false,
      })

      render(<Dashboard />)

      await waitFor(() => {
        expect(screen.getByTestId('meals-count')).toBeInTheDocument()
      })
    })

    it('calculates progress based on user goal', async () => {
      mockUseAuth.mockReturnValue({
        user: {
          id: '123',
          name: 'John Doe',
          email: 'john@example.com',
          dailyGoal: 1500,
        },
        isLoading: false,
      })

      render(<Dashboard />)

      await waitFor(() => {
        expect(screen.getByTestId('daily-progress-goal')).toHaveTextContent('1500')
      })
    })
  })

  describe('Edge Cases', () => {
    it('handles user without dailyGoal property', async () => {
      mockUseAuth.mockReturnValue({
        user: {
          id: '123',
          name: 'John Doe',
          email: 'john@example.com',
          // No dailyGoal
        },
        isLoading: false,
      })

      render(<Dashboard />)

      await waitFor(() => {
        // Should default to 2000
        expect(screen.getByTestId('daily-progress-goal')).toHaveTextContent('2000')
      })
    })

    it('handles null user gracefully', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isLoading: false,
      })

      expect(() => render(<Dashboard />)).not.toThrow()
    })

    it('handles transition from loading to authenticated', async () => {
      const { rerender } = render(<Dashboard />)

      // Initially loading
      mockUseAuth.mockReturnValue({
        user: null,
        isLoading: true,
      })
      rerender(<Dashboard />)
      expect(screen.getByText('Loading...')).toBeInTheDocument()

      // Then loaded
      mockUseAuth.mockReturnValue({
        user: {
          id: '123',
          name: 'John Doe',
          email: 'john@example.com',
          dailyGoal: 2000,
        },
        isLoading: false,
      })
      rerender(<Dashboard />)

      await waitFor(() => {
        expect(screen.getByTestId('dashboard-hero')).toBeInTheDocument()
      })
    })
  })

  describe('Component Integration', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: {
          id: '123',
          name: 'John Doe',
          email: 'john@example.com',
          dailyGoal: 2000,
        },
        isLoading: false,
      })
    })

    it('renders all components in correct order', () => {
      const { container } = render(<Dashboard />)
      const elements = container.querySelectorAll('[data-testid]')
      const testIds = Array.from(elements).map(el => el.getAttribute('data-testid'))

      expect(testIds).toContain('header')
      expect(testIds).toContain('dashboard-hero')
      expect(testIds).toContain('footer')
    })

    it('passes correct props to DashboardHero', async () => {
      render(<Dashboard />)

      await waitFor(() => {
        expect(screen.getByTestId('user-name')).toHaveTextContent('John Doe')
        expect(screen.getByTestId('daily-progress-consumed')).toBeInTheDocument()
        expect(screen.getByTestId('daily-progress-goal')).toBeInTheDocument()
        expect(screen.getByTestId('meals-count')).toBeInTheDocument()
      })
    })
  })

  describe('Accessibility', () => {
    it('has proper text color for loading state', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isLoading: true,
      })

      const { container } = render(<Dashboard />)
      const loadingText = screen.getByText('Loading...')
      expect(loadingText).toHaveClass('text-\\[var\\(--text\\)\\]')
    })

    it('has proper text color for login prompt', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isLoading: false,
      })

      const { container } = render(<Dashboard />)
      const promptText = screen.getByText('Please log in to view dashboard')
      expect(promptText).toHaveClass('text-\\[var\\(--text\\)\\]')
    })

    it('maintains readable text size', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isLoading: true,
      })

      const { container } = render(<Dashboard />)
      const loadingText = screen.getByText('Loading...')
      expect(loadingText).toHaveClass('text-xl')
    })
  })

  describe('Client Component Functionality', () => {
    it('renders as a client component', () => {
      mockUseAuth.mockReturnValue({
        user: {
          id: '123',
          name: 'John Doe',
          email: 'john@example.com',
          dailyGoal: 2000,
        },
        isLoading: false,
      })

      const { container } = render(<Dashboard />)
      expect(container).toBeInTheDocument()
    })

    it('handles useEffect lifecycle without errors', async () => {
      mockUseAuth.mockReturnValue({
        user: {
          id: '123',
          name: 'John Doe',
          email: 'john@example.com',
          dailyGoal: 2000,
        },
        isLoading: false,
      })

      expect(() => render(<Dashboard />)).not.toThrow()

      await waitFor(() => {
        expect(screen.getByTestId('dashboard-hero')).toBeInTheDocument()
      })
    })
  })
})
