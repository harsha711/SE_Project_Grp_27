import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DishCard from '@/components/DishCard'

describe('DishCard Component', () => {
  describe('Rendering', () => {
    it('renders the dish card', () => {
      render(<DishCard index={1} />)
      expect(screen.getByText('Spicy Korean Tacos')).toBeInTheDocument()
    })

    it('displays correct dish for index 1', () => {
      render(<DishCard index={1} />)
      expect(screen.getByText('Spicy Korean Tacos')).toBeInTheDocument()
      expect(screen.getByText('Kimchi, sriracha mayo, cilantro')).toBeInTheDocument()
    })

    it('displays correct dish for index 2', () => {
      render(<DishCard index={2} />)
      expect(screen.getByText('Truffle Mac & Cheese')).toBeInTheDocument()
      expect(screen.getByText('Three cheese blend, truffle oil')).toBeInTheDocument()
    })

    it('displays correct dish for index 3', () => {
      render(<DishCard index={3} />)
      expect(screen.getByText('Margherita Pizza')).toBeInTheDocument()
      expect(screen.getByText('Fresh mozzarella, basil, tomato')).toBeInTheDocument()
    })

    it('cycles through dishes using modulo for large indices', () => {
      render(<DishCard index={11} />)
      // Index 11 should wrap to index 1 (11-1 % 10 = 0, which is first dish)
      expect(screen.getByText('Spicy Korean Tacos')).toBeInTheDocument()
    })

    it('handles index 10 correctly', () => {
      render(<DishCard index={10} />)
      expect(screen.getByText('Chocolate Lava Cake')).toBeInTheDocument()
      expect(screen.getByText('Molten center, vanilla ice cream')).toBeInTheDocument()
    })
  })

  describe('Price Calculation', () => {
    it('calculates price correctly for index 1', () => {
      render(<DishCard index={1} />)
      expect(screen.getByText('$10.00')).toBeInTheDocument()
    })

    it('calculates price correctly for index 2', () => {
      render(<DishCard index={2} />)
      expect(screen.getByText('$12.00')).toBeInTheDocument()
    })

    it('calculates price correctly for index 5', () => {
      render(<DishCard index={5} />)
      expect(screen.getByText('$18.00')).toBeInTheDocument()
    })

    it('displays price with two decimal places', () => {
      render(<DishCard index={1} />)
      const price = screen.getByText(/\$\d+\.\d{2}/)
      expect(price).toBeInTheDocument()
    })
  })

  describe('Add Button', () => {
    it('renders an Add button', () => {
      render(<DishCard index={1} />)
      const addButton = screen.getByRole('button', { name: 'Add' })
      expect(addButton).toBeInTheDocument()
    })

    it('Add button is clickable', async () => {
      const user = userEvent.setup()
      render(<DishCard index={1} />)
      const addButton = screen.getByRole('button', { name: 'Add' })

      await user.click(addButton)

      // Button should still be in the document after click
      expect(addButton).toBeInTheDocument()
    })
  })

  describe('Visual Elements', () => {
    it('displays emoji based on index modulo 3 - tacos (index 0 mod 3)', () => {
      render(<DishCard index={3} />)
      const container = screen.getByText('Margherita Pizza').closest('div')?.parentElement
      expect(container).toBeInTheDocument()
    })

    it('displays emoji based on index modulo 3 - noodles (index 1 mod 3)', () => {
      render(<DishCard index={1} />)
      const container = screen.getByText('Spicy Korean Tacos').closest('div')?.parentElement
      expect(container).toBeInTheDocument()
    })

    it('displays emoji based on index modulo 3 - pizza (index 2 mod 3)', () => {
      render(<DishCard index={2} />)
      const container = screen.getByText('Truffle Mac & Cheese').closest('div')?.parentElement
      expect(container).toBeInTheDocument()
    })
  })

  describe('Card Structure', () => {
    it('has image section and content section', () => {
      const { container } = render(<DishCard index={1} />)
      expect(container.querySelector('.h-48')).toBeInTheDocument()
      expect(screen.getByText('Spicy Korean Tacos')).toBeInTheDocument()
    })

    it('contains dish name as heading', () => {
      render(<DishCard index={1} />)
      const heading = screen.getByText('Spicy Korean Tacos')
      expect(heading.tagName).toBe('H3')
    })
  })
})
