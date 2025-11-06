import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Signup from '@/app/signup/page'

// Mock next/link
jest.mock('next/link', () => {
  return function MockLink({ children, href, ...props }: any) {
    return <a href={href} {...props}>{children}</a>
  }
})

// Mock fetch
global.fetch = jest.fn()

describe('Signup Page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockClear()
  })

  describe('Rendering', () => {
    it('renders the signup page', () => {
      render(<Signup />)
      expect(screen.getByRole('heading', { name: 'Sign Up' })).toBeInTheDocument()
    })

    it('renders all form fields', () => {
      render(<Signup />)
      expect(screen.getByPlaceholderText('Full Name')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Email')).toBeInTheDocument()
      expect(screen.getByPlaceholderText(/Password/)).toBeInTheDocument()
    })

    it('renders the signup button', () => {
      render(<Signup />)
      expect(screen.getByRole('button', { name: /Sign Up/i })).toBeInTheDocument()
    })

    it('renders link to login page', () => {
      render(<Signup />)
      const loginLink = screen.getByText('Log In')
      expect(loginLink).toBeInTheDocument()
      expect(loginLink.closest('a')).toHaveAttribute('href', '/login')
    })

    it('displays "Already have an account?" text', () => {
      render(<Signup />)
      expect(screen.getByText(/Already have an account?/)).toBeInTheDocument()
    })
  })

  describe('Form Input Validation', () => {
    it('requires name field to be filled', () => {
      render(<Signup />)
      const nameInput = screen.getByPlaceholderText('Full Name')
      expect(nameInput).toHaveAttribute('required')
    })

    it('requires email field to be filled', () => {
      render(<Signup />)
      const emailInput = screen.getByPlaceholderText('Email')
      expect(emailInput).toHaveAttribute('required')
    })

    it('requires password field to be filled', () => {
      render(<Signup />)
      const passwordInput = screen.getByPlaceholderText(/Password/)
      expect(passwordInput).toHaveAttribute('required')
    })

    it('enforces minimum name length of 2 characters', () => {
      render(<Signup />)
      const nameInput = screen.getByPlaceholderText('Full Name')
      expect(nameInput).toHaveAttribute('minLength', '2')
    })

    it('enforces maximum name length of 100 characters', () => {
      render(<Signup />)
      const nameInput = screen.getByPlaceholderText('Full Name')
      expect(nameInput).toHaveAttribute('maxLength', '100')
    })

    it('enforces minimum password length of 8 characters', () => {
      render(<Signup />)
      const passwordInput = screen.getByPlaceholderText(/Password/)
      expect(passwordInput).toHaveAttribute('minLength', '8')
    })

    it('has email input type for email field', () => {
      render(<Signup />)
      const emailInput = screen.getByPlaceholderText('Email')
      expect(emailInput).toHaveAttribute('type', 'email')
    })

    it('has password input type for password field', () => {
      render(<Signup />)
      const passwordInput = screen.getByPlaceholderText(/Password/)
      expect(passwordInput).toHaveAttribute('type', 'password')
    })
  })

  describe('Form Submission', () => {
    it('prevents submission with password less than 8 characters', async () => {
      render(<Signup />)

      const nameInput = screen.getByPlaceholderText('Full Name')
      const emailInput = screen.getByPlaceholderText('Email')
      const passwordInput = screen.getByPlaceholderText(/Password/)
      const submitButton = screen.getByRole('button', { name: /Sign Up/i })

      await userEvent.type(nameInput, 'John Doe')
      await userEvent.type(emailInput, 'john@example.com')
      await userEvent.type(passwordInput, 'short')

      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/Password must be at least 8 characters long/i)).toBeInTheDocument()
      })
    })

    it('makes API call with correct data on valid submission', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, user: { name: 'John Doe', email: 'john@example.com' } }),
      })

      // Mock window.location for redirect
      delete (window as any).location
      const mockLocation = { href: 'http://localhost/' }
      Object.defineProperty(window, 'location', {
        value: mockLocation,
        writable: true,
        configurable: true
      })

      render(<Signup />)

      const nameInput = screen.getByPlaceholderText('Full Name')
      const emailInput = screen.getByPlaceholderText('Email')
      const passwordInput = screen.getByPlaceholderText(/Password/)
      const submitButton = screen.getByRole('button', { name: /Sign Up/i })

      await userEvent.type(nameInput, 'John Doe')
      await userEvent.type(emailInput, 'john@example.com')
      await userEvent.type(passwordInput, 'password123')

      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'John Doe',
            email: 'john@example.com',
            password: 'password123',
          }),
        })
      })
    })

    it('redirects to dashboard on successful signup', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, user: { name: 'John Doe' } }),
      })

      // Mock window.location with settable href
      delete (window as any).location
      const mockLocation = { href: 'http://localhost/' }
      Object.defineProperty(window, 'location', {
        value: mockLocation,
        writable: true,
        configurable: true
      })

      render(<Signup />)

      const nameInput = screen.getByPlaceholderText('Full Name')
      const emailInput = screen.getByPlaceholderText('Email')
      const passwordInput = screen.getByPlaceholderText(/Password/)
      const submitButton = screen.getByRole('button', { name: /Sign Up/i })

      await userEvent.type(nameInput, 'John Doe')
      await userEvent.type(emailInput, 'john@example.com')
      await userEvent.type(passwordInput, 'password123')

      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockLocation.href).toBe('/dashboard')
      })
    })
  })

  describe('Error Handling', () => {
    it('displays error message when registration fails', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ message: 'Email already exists' }),
      })

      render(<Signup />)

      const nameInput = screen.getByPlaceholderText('Full Name')
      const emailInput = screen.getByPlaceholderText('Email')
      const passwordInput = screen.getByPlaceholderText(/Password/)
      const submitButton = screen.getByRole('button', { name: /Sign Up/i })

      await userEvent.type(nameInput, 'John Doe')
      await userEvent.type(emailInput, 'existing@example.com')
      await userEvent.type(passwordInput, 'password123')

      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Email already exists')).toBeInTheDocument()
      })
    })

    it('displays generic error on network failure', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

      render(<Signup />)

      const nameInput = screen.getByPlaceholderText('Full Name')
      const emailInput = screen.getByPlaceholderText('Email')
      const passwordInput = screen.getByPlaceholderText(/Password/)
      const submitButton = screen.getByRole('button', { name: /Sign Up/i })

      await userEvent.type(nameInput, 'John Doe')
      await userEvent.type(emailInput, 'john@example.com')
      await userEvent.type(passwordInput, 'password123')

      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Something went wrong')).toBeInTheDocument()
      })
    })

    it('displays default error message when server response lacks message', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({}),
      })

      render(<Signup />)

      const nameInput = screen.getByPlaceholderText('Full Name')
      const emailInput = screen.getByPlaceholderText('Email')
      const passwordInput = screen.getByPlaceholderText(/Password/)
      const submitButton = screen.getByRole('button', { name: /Sign Up/i })

      await userEvent.type(nameInput, 'John Doe')
      await userEvent.type(emailInput, 'john@example.com')
      await userEvent.type(passwordInput, 'password123')

      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Registration failed')).toBeInTheDocument()
      })
    })

    it('clears error message when form is resubmitted', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Email already exists' }),
      })

      render(<Signup />)

      const nameInput = screen.getByPlaceholderText('Full Name')
      const emailInput = screen.getByPlaceholderText('Email')
      const passwordInput = screen.getByPlaceholderText(/Password/)
      const submitButton = screen.getByRole('button', { name: /Sign Up/i })

      // First submission
      await userEvent.type(nameInput, 'John Doe')
      await userEvent.type(emailInput, 'existing@example.com')
      await userEvent.type(passwordInput, 'password123')
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Email already exists')).toBeInTheDocument()
      })

      // Second submission with valid data
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      })

      delete (window as any).location
      const mockLocation = { href: 'http://localhost/' }
      Object.defineProperty(window, 'location', {
        value: mockLocation,
        writable: true,
        configurable: true
      })

      await userEvent.clear(emailInput)
      await userEvent.type(emailInput, 'newemail@example.com')
      fireEvent.click(submitButton)

      // Error should be cleared
      await waitFor(() => {
        expect(screen.queryByText('Email already exists')).not.toBeInTheDocument()
      })
    })
  })

  describe('User Input Handling', () => {
    it('updates name field when user types', async () => {
      render(<Signup />)
      const nameInput = screen.getByPlaceholderText('Full Name') as HTMLInputElement

      await userEvent.type(nameInput, 'Jane Smith')

      expect(nameInput.value).toBe('Jane Smith')
    })

    it('updates email field when user types', async () => {
      render(<Signup />)
      const emailInput = screen.getByPlaceholderText('Email') as HTMLInputElement

      await userEvent.type(emailInput, 'jane@example.com')

      expect(emailInput.value).toBe('jane@example.com')
    })

    it('updates password field when user types', async () => {
      render(<Signup />)
      const passwordInput = screen.getByPlaceholderText(/Password/) as HTMLInputElement

      await userEvent.type(passwordInput, 'mypassword123')

      expect(passwordInput.value).toBe('mypassword123')
    })

    it('allows form submission with Enter key', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      })

      delete (window as any).location
      const mockLocation = { href: 'http://localhost/' }
      Object.defineProperty(window, 'location', {
        value: mockLocation,
        writable: true,
        configurable: true
      })

      render(<Signup />)

      const nameInput = screen.getByPlaceholderText('Full Name')
      const emailInput = screen.getByPlaceholderText('Email')
      const passwordInput = screen.getByPlaceholderText(/Password/)

      await userEvent.type(nameInput, 'John Doe')
      await userEvent.type(emailInput, 'john@example.com')
      await userEvent.type(passwordInput, 'password123{enter}')

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled()
      })
    })
  })

  describe('Layout and Styling', () => {
    it('has centered layout', () => {
      const { container } = render(<Signup />)
      const mainDiv = container.querySelector('.min-h-screen')
      expect(mainDiv).toHaveClass('flex', 'justify-center', 'items-center')
    })

    it('applies background color', () => {
      const { container } = render(<Signup />)
      const mainDiv = container.querySelector('.bg-\\[var\\(--login-bg\\)\\]')
      expect(mainDiv).toBeInTheDocument()
    })

    it('card has proper styling classes', () => {
      const { container } = render(<Signup />)
      const card = container.querySelector('.rounded-lg')
      expect(card).toHaveClass('p-8', 'w-full', 'max-w-md')
    })

    it('heading has proper styling', () => {
      render(<Signup />)
      const heading = screen.getByRole('heading', { name: 'Sign Up' })
      expect(heading).toHaveClass('text-3xl', 'font-bold', 'mb-6', 'text-center')
    })

    it('form has proper gap between fields', () => {
      const { container } = render(<Signup />)
      const form = container.querySelector('form')
      expect(form).toHaveClass('flex', 'flex-col', 'gap-4')
    })
  })

  describe('Accessibility', () => {
    it('input fields have proper placeholder text', () => {
      render(<Signup />)
      expect(screen.getByPlaceholderText('Full Name')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Email')).toBeInTheDocument()
      expect(screen.getByPlaceholderText(/Password \(min 8 characters\)/)).toBeInTheDocument()
    })

    it('submit button is a proper button element', () => {
      render(<Signup />)
      const button = screen.getByRole('button', { name: /Sign Up/i })
      expect(button).toHaveAttribute('type', 'submit')
    })

    it('error messages are visible to screen readers', async () => {
      render(<Signup />)

      const passwordInput = screen.getByPlaceholderText(/Password/)
      const submitButton = screen.getByRole('button', { name: /Sign Up/i })

      await userEvent.type(screen.getByPlaceholderText('Full Name'), 'John Doe')
      await userEvent.type(screen.getByPlaceholderText('Email'), 'john@example.com')
      await userEvent.type(passwordInput, 'short')

      fireEvent.click(submitButton)

      await waitFor(() => {
        const errorDiv = screen.getByText(/Password must be at least 8 characters long/i)
        expect(errorDiv).toHaveClass('text-red-500')
      })
    })

    it('has semantic form structure', () => {
      const { container } = render(<Signup />)
      expect(container.querySelector('form')).toBeInTheDocument()
    })
  })

  describe('Navigation', () => {
    it('has link to login page', () => {
      render(<Signup />)
      const loginLink = screen.getByText('Log In').closest('a')
      expect(loginLink).toHaveAttribute('href', '/login')
    })

    it('login link has proper styling', () => {
      render(<Signup />)
      const loginLink = screen.getByText('Log In')
      expect(loginLink).toHaveClass('hover:underline', 'font-semibold')
    })

    it('displays contextual text for login link', () => {
      render(<Signup />)
      expect(screen.getByText(/Already have an account?/)).toBeInTheDocument()
    })
  })

  describe('Form State Management', () => {
    it('prevents default form submission behavior', async () => {
      const mockPreventDefault = jest.fn()

      render(<Signup />)

      const form = screen.getByRole('button', { name: /Sign Up/i }).closest('form')!

      const submitEvent = new Event('submit', { bubbles: true, cancelable: true })
      Object.defineProperty(submitEvent, 'preventDefault', {
        value: mockPreventDefault,
      })

      form.dispatchEvent(submitEvent)

      await waitFor(() => {
        expect(mockPreventDefault).toHaveBeenCalled()
      })
    })

    it('starts with empty form fields', () => {
      render(<Signup />)

      const nameInput = screen.getByPlaceholderText('Full Name') as HTMLInputElement
      const emailInput = screen.getByPlaceholderText('Email') as HTMLInputElement
      const passwordInput = screen.getByPlaceholderText(/Password/) as HTMLInputElement

      expect(nameInput.value).toBe('')
      expect(emailInput.value).toBe('')
      expect(passwordInput.value).toBe('')
    })

    it('does not display error message initially', () => {
      render(<Signup />)
      expect(screen.queryByText(/error/i)).not.toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('handles rapid form submissions', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      })

      delete (window as any).location
      const mockLocation = { href: 'http://localhost/' }
      Object.defineProperty(window, 'location', {
        value: mockLocation,
        writable: true,
        configurable: true
      })

      render(<Signup />)

      const nameInput = screen.getByPlaceholderText('Full Name')
      const emailInput = screen.getByPlaceholderText('Email')
      const passwordInput = screen.getByPlaceholderText(/Password/)
      const submitButton = screen.getByRole('button', { name: /Sign Up/i })

      await userEvent.type(nameInput, 'John Doe')
      await userEvent.type(emailInput, 'john@example.com')
      await userEvent.type(passwordInput, 'password123')

      // Rapid clicks
      fireEvent.click(submitButton)
      fireEvent.click(submitButton)
      fireEvent.click(submitButton)

      // Should handle gracefully
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled()
      })
    })

    it('handles special characters in input fields', async () => {
      render(<Signup />)

      const nameInput = screen.getByPlaceholderText('Full Name') as HTMLInputElement
      const emailInput = screen.getByPlaceholderText('Email') as HTMLInputElement
      const passwordInput = screen.getByPlaceholderText(/Password/) as HTMLInputElement

      await userEvent.type(nameInput, "O'Brien-Smith")
      await userEvent.type(emailInput, 'test+alias@example.com')
      await userEvent.type(passwordInput, 'P@ssw0rd!123')

      expect(nameInput.value).toBe("O'Brien-Smith")
      expect(emailInput.value).toBe('test+alias@example.com')
      expect(passwordInput.value).toBe('P@ssw0rd!123')
    })
  })

  describe('Client Component Functionality', () => {
    it('renders as a client component', () => {
      const { container } = render(<Signup />)
      expect(container).toBeInTheDocument()
    })

    it('handles state updates correctly', async () => {
      render(<Signup />)

      const nameInput = screen.getByPlaceholderText('Full Name')

      await userEvent.type(nameInput, 'Test User')

      expect((nameInput as HTMLInputElement).value).toBe('Test User')
    })
  })
})
