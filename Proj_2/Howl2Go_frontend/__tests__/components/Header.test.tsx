import { render, screen } from '@testing-library/react'
import Header from '@/components/Header'

describe('Header Component', () => {
  it('renders the header component', () => {
    render(<Header />)
    const header = screen.getByRole('banner')
    expect(header).toBeInTheDocument()
  })

  it('renders the Howl2Go logo', () => {
    render(<Header />)
    const logo = screen.getByAltText('Howl2Go Logo')
    expect(logo).toBeInTheDocument()
    expect(logo).toHaveAttribute('src', '/Howl2go_orange_logo_transparent.png')
  })

  it('renders menu button with accessible label', () => {
    render(<Header />)
    const menuButton = screen.getByLabelText('Menu')
    expect(menuButton).toBeInTheDocument()
  })

  it('renders menu icon', () => {
    render(<Header />)
    const menuIcon = screen.getByTestId('menu-icon')
    expect(menuIcon).toBeInTheDocument()
  })

  it('renders About link', () => {
    render(<Header />)
    const aboutLink = screen.getByText('About')
    expect(aboutLink).toBeInTheDocument()
    expect(aboutLink).toHaveAttribute('href', '/about')
  })

  it('renders Log In link', () => {
    render(<Header />)
    const loginLink = screen.getByText('Log In')
    expect(loginLink).toBeInTheDocument()
    expect(loginLink).toHaveAttribute('href', '/login')
  })

  it('renders Dashboard link', () => {
    render(<Header />)
    const dashboardLink = screen.getByText('Dashboard')
    expect(dashboardLink).toBeInTheDocument()
    expect(dashboardLink).toHaveAttribute('href', '/dashboard')
  })

  it('has correct navigation structure', () => {
    render(<Header />)
    const nav = screen.getByRole('navigation')
    expect(nav).toBeInTheDocument()
  })

  it('logo is wrapped in a link to home page', () => {
    render(<Header />)
    const logo = screen.getByAltText('Howl2Go Logo')
    const logoLink = logo.closest('a')
    expect(logoLink).toHaveAttribute('href', '/')
  })
})
