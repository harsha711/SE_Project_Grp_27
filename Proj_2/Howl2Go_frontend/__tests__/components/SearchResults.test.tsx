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
          recommendations={[]}
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
          recommendations={[]}
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
          recommendations={[]}
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
          recommendations={[]}
        />
      )

      const grid = container.querySelector('.grid.grid-cols-1.sm\\:grid-cols-3')
      expect(grid).toBeInTheDocument()
    })
  })

  describe('Live Mode - Recommendations', () => {
    const mockRecommendations = [
      '100 calorie burger',
      '200 calories pizza',
      '300 calorie salad',
    ]

    it('shows recommendations when not in demo mode and showLiveResults is true', () => {
      render(
        <SearchResults
          isDemoMode={false}
          isSearchFocused={true}
          showDemoCards={false}
          showLiveResults={true}
          recommendations={mockRecommendations}
        />
      )

      expect(screen.getByText(/Try searching for:/)).toBeInTheDocument()
      expect(screen.getByText('100 calorie burger')).toBeInTheDocument()
      expect(screen.getByText('200 calories pizza')).toBeInTheDocument()
      expect(screen.getByText('300 calorie salad')).toBeInTheDocument()
    })

    it('renders all recommendation suggestions', () => {
      render(
        <SearchResults
          isDemoMode={false}
          isSearchFocused={true}
          showDemoCards={false}
          showLiveResults={true}
          recommendations={mockRecommendations}
        />
      )

      const suggestions = screen.getAllByRole('listitem')
      expect(suggestions.length).toBe(3)
    })

    it('recommendations are in a list layout', () => {
      const { container } = render(
        <SearchResults
          isDemoMode={false}
          isSearchFocused={true}
          showDemoCards={false}
          showLiveResults={true}
          recommendations={mockRecommendations}
        />
      )

      const list = container.querySelector('ul.space-y-3')
      expect(list).toBeInTheDocument()
    })

    it('handles empty recommendations array', () => {
      render(
        <SearchResults
          isDemoMode={false}
          isSearchFocused={true}
          showDemoCards={false}
          showLiveResults={true}
          recommendations={[]}
        />
      )

      expect(screen.getByText(/Try searching for:/)).toBeInTheDocument()
      const suggestions = screen.queryAllByRole('listitem')
      expect(suggestions.length).toBe(0)
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
          recommendations={[]}
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
          recommendations={[]}
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
          recommendations={[]}
        />
      )

      expect(screen.getByText(/Big Mac/)).toBeInTheDocument()
    })
  })
})
