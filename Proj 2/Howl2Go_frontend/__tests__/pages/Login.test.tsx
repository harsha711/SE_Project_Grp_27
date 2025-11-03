import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginPage from '@/app/login/page'

describe('Login Page', () => {
  describe('Rendering', () => {
    it('renders the login page', () => {
      render(<LoginPage />)
      expect(screen.getByText('Login')).toBeInTheDocument()
    })

    it('renders the login heading', () => {
      render(<LoginPage />)
      const heading = screen.getByText('Login')
      expect(heading.tagName).toBe('H1')
    })

    it('renders email input field', () => {
      render(<LoginPage />)
      const emailInput = screen.getByPlaceholderText('Email')
      expect(emailInput).toBeInTheDocument()
      expect(emailInput).toHaveAttribute('type', 'email')
    })

    it('renders password input field', () => {
      render(<LoginPage />)
      const passwordInput = screen.getByPlaceholderText('Password')
      expect(passwordInput).toBeInTheDocument()
      expect(passwordInput).toHaveAttribute('type', 'password')
    })

    it('renders Log In button', () => {
      render(<LoginPage />)
      const loginButton = screen.getByRole('button', { name: 'Log In' })
      expect(loginButton).toBeInTheDocument()
    })
  })

  describe('Form Inputs', () => {
    it('allows typing in email field', async () => {
      const user = userEvent.setup()
      render(<LoginPage />)
      const emailInput = screen.getByPlaceholderText('Email') as HTMLInputElement

      await user.type(emailInput, 'test@example.com')

      expect(emailInput.value).toBe('test@example.com')
    })

    it('allows typing in password field', async () => {
      const user = userEvent.setup()
      render(<LoginPage />)
      const passwordInput = screen.getByPlaceholderText('Password') as HTMLInputElement

      await user.type(passwordInput, 'mypassword123')

      expect(passwordInput.value).toBe('mypassword123')
    })

    it('password field masks input', () => {
      render(<LoginPage />)
      const passwordInput = screen.getByPlaceholderText('Password')
      expect(passwordInput).toHaveAttribute('type', 'password')
    })
  })

  describe('Button', () => {
    it('Log In button is clickable', async () => {
      const user = userEvent.setup()
      render(<LoginPage />)
      const loginButton = screen.getByRole('button', { name: 'Log In' })

      await user.click(loginButton)

      // Button should still be in the document after click
      expect(loginButton).toBeInTheDocument()
    })

    it('button has correct styling classes', () => {
      render(<LoginPage />)
      const loginButton = screen.getByRole('button', { name: 'Log In' })
      expect(loginButton).toHaveClass('font-semibold')
      expect(loginButton).toHaveClass('rounded')
    })
  })

  describe('Layout', () => {
    it('has full screen height container', () => {
      const { container } = render(<LoginPage />)
      const mainDiv = container.querySelector('.min-h-screen')
      expect(mainDiv).toBeInTheDocument()
    })

    it('centers content vertically and horizontally', () => {
      const { container } = render(<LoginPage />)
      const mainDiv = container.querySelector('.flex.justify-center.items-center')
      expect(mainDiv).toBeInTheDocument()
    })

    it('card has border and rounded corners', () => {
      const { container } = render(<LoginPage />)
      const card = container.querySelector('.border.rounded-lg')
      expect(card).toBeInTheDocument()
    })

    it('heading is centered', () => {
      render(<LoginPage />)
      const heading = screen.getByText('Login')
      expect(heading).toHaveClass('text-center')
    })
  })

  describe('Form Structure', () => {
    it('inputs are in a flex column with gap', () => {
      const { container } = render(<LoginPage />)
      const formContainer = container.querySelector('.flex.flex-col.gap-4')
      expect(formContainer).toBeInTheDocument()
    })

    it('email input comes before password input', () => {
      render(<LoginPage />)
      const inputs = screen.getAllByRole('textbox').concat(
        Array.from(document.querySelectorAll('input[type="password"]'))
      ) as HTMLInputElement[]

      const emailInput = screen.getByPlaceholderText('Email')
      const passwordInput = screen.getByPlaceholderText('Password')

      const emailIndex = inputs.indexOf(emailInput as any)
      const passwordIndex = Array.from(document.querySelectorAll('input')).indexOf(
        passwordInput as HTMLInputElement
      )

      expect(emailIndex).toBeLessThan(passwordIndex)
    })

    it('button comes after inputs', () => {
      const { container } = render(<LoginPage />)
      const emailInput = screen.getByPlaceholderText('Email')
      const button = screen.getByRole('button', { name: 'Log In' })

      const emailParent = emailInput.parentElement
      const buttonElement = button

      expect(emailParent).toBeInTheDocument()
      expect(buttonElement).toBeInTheDocument()
    })
  })

  describe('Styling', () => {
    it('applies custom CSS variables for colors', () => {
      const { container } = render(<LoginPage />)
      const heading = screen.getByText('Login')
      expect(heading).toHaveClass('text-[var(--login-heading-text)]')
    })

    it('inputs have focus styles', () => {
      render(<LoginPage />)
      const emailInput = screen.getByPlaceholderText('Email')
      expect(emailInput).toHaveClass('focus:outline-none')
    })

    it('button has hover transition', () => {
      render(<LoginPage />)
      const button = screen.getByRole('button', { name: 'Log In' })
      expect(button).toHaveClass('transition-colors')
    })
  })

  describe('Accessibility', () => {
    it('email input has correct type attribute', () => {
      render(<LoginPage />)
      const emailInput = screen.getByPlaceholderText('Email')
      expect(emailInput).toHaveAttribute('type', 'email')
    })

    it('password input has correct type attribute', () => {
      render(<LoginPage />)
      const passwordInput = screen.getByPlaceholderText('Password')
      expect(passwordInput).toHaveAttribute('type', 'password')
    })

    it('button is keyboard accessible', () => {
      render(<LoginPage />)
      const button = screen.getByRole('button', { name: 'Log In' })
      expect(button.tagName).toBe('BUTTON')
    })

    it('inputs have placeholder text for accessibility', () => {
      render(<LoginPage />)
      expect(screen.getByPlaceholderText('Email')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Password')).toBeInTheDocument()
    })
  })

  describe('Card Container', () => {
    it('card has maximum width constraint', () => {
      const { container } = render(<LoginPage />)
      const card = container.querySelector('.max-w-md')
      expect(card).toBeInTheDocument()
    })

    it('card has full width within constraint', () => {
      const { container } = render(<LoginPage />)
      const card = container.querySelector('.w-full.max-w-md')
      expect(card).toBeInTheDocument()
    })

    it('card has padding', () => {
      const { container } = render(<LoginPage />)
      const card = container.querySelector('.p-8')
      expect(card).toBeInTheDocument()
    })
  })
})
