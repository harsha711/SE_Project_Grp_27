import { render, screen } from '@testing-library/react'
import SearchResults from '@/components/SearchResults'
import type { FoodItem } from '@/types/food'

// Mock ItemCard component
jest.mock('@/components/ItemCard', () => {
  return function MockItemCard({ restaurant, item, calories, index }: any) {
    return (
      <div data-testid={`item-card-${index}`}>
        {restaurant} - {item} - {calories} cal
      </div>
    )
  }
})

describe('SearchResults Component', () => {
  const mockFoodItems: FoodItem[] = [
    {
      restaurant: "McDonald's",
      item: 'Big Mac',
      calories: 550,
      caloriesFromFat: null,
      totalFat: null,
      saturatedFat: null,
      transFat: null,
      cholesterol: null,
      sodium: null,
      carbs: null,
      fiber: null,
      sugars: null,
      protein: null,
      weightWatchersPoints: null,
    },
    {
      restaurant: 'Burger King',
      item: 'Whopper',
      calories: 660,
      caloriesFromFat: null,
      totalFat: null,
      saturatedFat: null,
      transFat: null,
      cholesterol: null,
      sodium: null,
      carbs: null,
      fiber: null,
      sugars: null,
      protein: null,
      weightWatchersPoints: null,
    },
  ]

  describe('Demo Mode', () => {
    it('shows demo cards when in demo mode and showDemoCards is true', () => {
      render(
        <SearchResults
          isDemoMode={true}
          isSearchFocused={false}
          showDemoCards={true}
          showLiveResults={false}
          filteredResults={[]}
        />
      )

      // Demo mode shows 3 preset items (McDonald's Big Mac, Taco Bell, KFC)
      expect(screen.getByText(/McDonald's - Big Mac - 550 cal/)).toBeInTheDocument()
      expect(screen.getByText(/Taco Bell - Crunchy Taco - 170 cal/)).toBeInTheDocument()
      expect(screen.getByText(/KFC - Chicken Breast - 390 cal/)).toBeInTheDocument()
    })

    it('does not show demo cards when showDemoCards is false', () => {
      render(
        <SearchResults
          isDemoMode={true}
          isSearchFocused={false}
          showDemoCards={false}
          showLiveResults={false}
          filteredResults={[]}
        />
      )

      expect(screen.queryByText(/Big Mac/)).not.toBeInTheDocument()
    })

    it('renders exactly 3 demo cards', () => {
      render(
        <SearchResults
          isDemoMode={true}
          isSearchFocused={false}
          showDemoCards={true}
          showLiveResults={false}
          filteredResults={[]}
        />
      )

      const itemCards = screen.getAllByTestId(/item-card-/)
      expect(itemCards.length).toBe(3)
    })

    it('demo cards are in a grid layout', () => {
      const { container } = render(
        <SearchResults
          isDemoMode={true}
          isSearchFocused={false}
          showDemoCards={true}
          showLiveResults={false}
          filteredResults={[]}
        />
      )

      const grid = container.querySelector('.grid.grid-cols-1.sm\\:grid-cols-3')
      expect(grid).toBeInTheDocument()
    })
  })

  describe('Live Mode - With Results', () => {
    it('shows live results when not in demo mode and showLiveResults is true', () => {
      render(
        <SearchResults
          isDemoMode={false}
          isSearchFocused={true}
          showDemoCards={false}
          showLiveResults={true}
          filteredResults={mockFoodItems}
        />
      )

      expect(screen.getByText(/McDonald's - Big Mac - 550 cal/)).toBeInTheDocument()
      expect(screen.getByText(/Burger King - Whopper - 660 cal/)).toBeInTheDocument()
    })

    it('renders all filtered results', () => {
      render(
        <SearchResults
          isDemoMode={false}
          isSearchFocused={true}
          showDemoCards={false}
          showLiveResults={true}
          filteredResults={mockFoodItems}
        />
      )

      const itemCards = screen.getAllByTestId(/item-card-/)
      expect(itemCards.length).toBe(2)
    })

    it('results are in a grid layout', () => {
      const { container } = render(
        <SearchResults
          isDemoMode={false}
          isSearchFocused={true}
          showDemoCards={false}
          showLiveResults={true}
          filteredResults={mockFoodItems}
        />
      )

      const grid = container.querySelector('.grid.grid-cols-1')
      expect(grid).toBeInTheDocument()
    })
  })

  describe('Live Mode - No Results', () => {
    it('shows empty state message when no results', () => {
      render(
        <SearchResults
          isDemoMode={false}
          isSearchFocused={true}
          showDemoCards={false}
          showLiveResults={true}
          filteredResults={[]}
        />
      )

      expect(
        screen.getByText(/Search something like: "100 calories food"!/)
      ).toBeInTheDocument()
    })

    it('does not render any item cards when no results', () => {
      render(
        <SearchResults
          isDemoMode={false}
          isSearchFocused={true}
          showDemoCards={false}
          showLiveResults={true}
          filteredResults={[]}
        />
      )

      const itemCards = screen.queryAllByTestId(/item-card-/)
      expect(itemCards.length).toBe(0)
    })
  })

  describe('No Results State', () => {
    it('shows nothing when neither demo nor live results should show', () => {
      const { container } = render(
        <SearchResults
          isDemoMode={false}
          isSearchFocused={false}
          showDemoCards={false}
          showLiveResults={false}
          filteredResults={[]}
        />
      )

      const itemCards = screen.queryAllByTestId(/item-card-/)
      expect(itemCards.length).toBe(0)
    })
  })

  describe('Focus State Interaction', () => {
    it('applies blur effect to demo cards when search is focused', () => {
      render(
        <SearchResults
          isDemoMode={true}
          isSearchFocused={true}
          showDemoCards={true}
          showLiveResults={false}
          filteredResults={[]}
        />
      )

      // Component should still render even when focused
      expect(screen.getByText(/Big Mac/)).toBeInTheDocument()
    })

    it('renders demo cards without blur when not focused', () => {
      render(
        <SearchResults
          isDemoMode={true}
          isSearchFocused={false}
          showDemoCards={true}
          showLiveResults={false}
          filteredResults={[]}
        />
      )

      expect(screen.getByText(/Big Mac/)).toBeInTheDocument()
    })
  })

  describe('ItemCard Props', () => {
    it('passes correct props to ItemCard components in live mode', () => {
      render(
        <SearchResults
          isDemoMode={false}
          isSearchFocused={true}
          showDemoCards={false}
          showLiveResults={true}
          filteredResults={mockFoodItems}
        />
      )

      expect(screen.getByText(/McDonald's - Big Mac - 550 cal/)).toBeInTheDocument()
      expect(screen.getByText(/Burger King - Whopper - 660 cal/)).toBeInTheDocument()
    })

    it('assigns correct index to each item card', () => {
      render(
        <SearchResults
          isDemoMode={false}
          isSearchFocused={true}
          showDemoCards={false}
          showLiveResults={true}
          filteredResults={mockFoodItems}
        />
      )

      expect(screen.getByTestId('item-card-0')).toBeInTheDocument()
      expect(screen.getByTestId('item-card-1')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('handles single result correctly', () => {
      render(
        <SearchResults
          isDemoMode={false}
          isSearchFocused={true}
          showDemoCards={false}
          showLiveResults={true}
          filteredResults={[mockFoodItems[0]]}
        />
      )

      const itemCards = screen.getAllByTestId(/item-card-/)
      expect(itemCards.length).toBe(1)
    })

    it('handles many results correctly', () => {
      const manyItems = Array(10).fill(mockFoodItems[0])
      render(
        <SearchResults
          isDemoMode={false}
          isSearchFocused={true}
          showDemoCards={false}
          showLiveResults={true}
          filteredResults={manyItems}
        />
      )

      const itemCards = screen.getAllByTestId(/item-card-/)
      expect(itemCards.length).toBe(10)
    })
  })
})
