import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ItemCard from '@/components/ItemCard'

describe('ItemCard Component', () => {
  const defaultProps = {
    restaurant: "McDonald's",
    item: 'Big Mac',
    calories: 550,
    index: 0,
  }

  describe('Rendering', () => {
    it('renders the item card', () => {
      render(<ItemCard {...defaultProps} />)
      expect(screen.getByText('Big Mac')).toBeInTheDocument()
    })

    it('displays restaurant name', () => {
      render(<ItemCard {...defaultProps} />)
      expect(screen.getByText("McDonald's")).toBeInTheDocument()
    })

    it('displays item name', () => {
      render(<ItemCard {...defaultProps} />)
      expect(screen.getByText('Big Mac')).toBeInTheDocument()
    })

    it('displays calories', () => {
      render(<ItemCard {...defaultProps} />)
      expect(screen.getByText('550 cal')).toBeInTheDocument()
    })

    it('renders item name as heading', () => {
      render(<ItemCard {...defaultProps} />)
      const heading = screen.getByText('Big Mac')
      expect(heading.tagName).toBe('H3')
    })

    it('displays category badge', () => {
      render(<ItemCard {...defaultProps} />)
      expect(screen.getByText('Fast Food')).toBeInTheDocument()
    })

    it('displays placeholder price', () => {
      render(<ItemCard {...defaultProps} />)
      expect(screen.getByText('$--.--')).toBeInTheDocument()
    })
  })

  describe('Restaurant Logo', () => {
    it('renders restaurant logo for McDonald\'s', () => {
      render(<ItemCard {...defaultProps} />)
      const logo = screen.getByAltText("McDonald's logo")
      expect(logo).toBeInTheDocument()
      expect(logo).toHaveAttribute('src', '/mcdonalds-5.svg')
    })

    it('renders restaurant logo for Burger King', () => {
      render(<ItemCard {...defaultProps} restaurant="Burger King" />)
      const logo = screen.getByAltText('Burger King logo')
      expect(logo).toHaveAttribute('src', '/burger-king-4.svg')
    })

    it('renders restaurant logo for Wendy\'s', () => {
      render(<ItemCard {...defaultProps} restaurant="Wendy's" />)
      const logo = screen.getByAltText("Wendy's logo")
      expect(logo).toHaveAttribute('src', '/wendys-logo-1.svg')
    })

    it('renders restaurant logo for KFC', () => {
      render(<ItemCard {...defaultProps} restaurant="KFC" />)
      const logo = screen.getByAltText('KFC logo')
      expect(logo).toHaveAttribute('src', '/kfc-4.svg')
    })

    it('renders restaurant logo for Taco Bell', () => {
      render(<ItemCard {...defaultProps} restaurant="Taco Bell" />)
      const logo = screen.getByAltText('Taco Bell logo')
      expect(logo).toHaveAttribute('src', '/taco-bell-1.svg')
    })

    it('renders fallback logo for unknown restaurant', () => {
      render(<ItemCard {...defaultProps} restaurant="Unknown Restaurant" />)
      const logo = screen.getByAltText('Unknown Restaurant logo')
      expect(logo).toHaveAttribute('src', '/fast-food-svgrepo-com.svg')
    })

    it('handles case-insensitive restaurant matching', () => {
      render(<ItemCard {...defaultProps} restaurant="mcdonald's" />)
      const logo = screen.getByAltText("mcdonald's logo")
      expect(logo).toHaveAttribute('src', '/mcdonalds-5.svg')
    })

    it('handles restaurant name with extra spaces', () => {
      render(<ItemCard {...defaultProps} restaurant="  Burger King  " />)
      const logo = screen.getByAltText('Burger King   logo')
      expect(logo).toHaveAttribute('src', '/burger-king-4.svg')
    })
  })

  describe('Add Button', () => {
    it('renders an Add button', () => {
      render(<ItemCard {...defaultProps} />)
      const addButton = screen.getByRole('button', { name: 'Add' })
      expect(addButton).toBeInTheDocument()
    })

    it('Add button is clickable', async () => {
      const user = userEvent.setup()
      render(<ItemCard {...defaultProps} />)
      const addButton = screen.getByRole('button', { name: 'Add' })

      await user.click(addButton)

      expect(addButton).toBeInTheDocument()
    })
  })

  describe('Different Props', () => {
    it('handles different calorie values', () => {
      render(<ItemCard {...defaultProps} calories={1000} />)
      expect(screen.getByText('1000 cal')).toBeInTheDocument()
    })

    it('handles zero calories', () => {
      render(<ItemCard {...defaultProps} calories={0} />)
      expect(screen.getByText('0 cal')).toBeInTheDocument()
    })

    it('handles different index for animation delay', () => {
      const { rerender } = render(<ItemCard {...defaultProps} index={0} />)
      expect(screen.getByText('Big Mac')).toBeInTheDocument()

      rerender(<ItemCard {...defaultProps} index={5} />)
      expect(screen.getByText('Big Mac')).toBeInTheDocument()
    })
  })

  describe('Card Structure', () => {
    it('has header with logo and price', () => {
      render(<ItemCard {...defaultProps} />)
      const logo = screen.getByAltText("McDonald's logo")
      const price = screen.getByText('$--.--')
      expect(logo).toBeInTheDocument()
      expect(price).toBeInTheDocument()
    })

    it('has nutrition info section with calories', () => {
      render(<ItemCard {...defaultProps} />)
      const calories = screen.getByText('550 cal')
      expect(calories).toBeInTheDocument()
    })

    it('has footer with category and button', () => {
      render(<ItemCard {...defaultProps} />)
      const category = screen.getByText('Fast Food')
      const button = screen.getByRole('button', { name: 'Add' })
      expect(category).toBeInTheDocument()
      expect(button).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has proper image alt text', () => {
      render(<ItemCard {...defaultProps} />)
      const logo = screen.getByAltText("McDonald's logo")
      expect(logo).toBeInTheDocument()
    })

    it('button is keyboard accessible', () => {
      render(<ItemCard {...defaultProps} />)
      const button = screen.getByRole('button', { name: 'Add' })
      expect(button).toBeInTheDocument()
      expect(button.tagName).toBe('BUTTON')
    })
  })
})
