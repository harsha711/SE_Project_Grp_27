# Howl2Go Component Documentation

## Overview
The `/components/` folder contains key **reusable React components** for Howl2Go.  
Each component is written in **TypeScript** for strong typing, safety, and maintainability.

---

## Component Reference

| Component | Props | Type | Required | Default | Purpose / Usage |
|------------|--------|------|-----------|----------|-----------------|
| AnimatedHeadline | `text` | `string` | Yes | – | Displays animated headlines |
| DailyProgressRing | `value`, `max` | `number` | Yes | – | Shows progress ring for daily goals |
| DashboardHero | `userName` | `string` | Yes | – | Dashboard hero banner |
| DishCard | `dish` | `FoodItem` | Yes | – | Displays food dish details |
| Footer | – | – | – | – | Page footer |
| FrequentlyBoughtSection | `items` | `FoodItem[]` | Yes | – | Section for items often purchased |
| Header | `userName` | `string` | Yes | – | Main app header |
| HeroSection | `title`, `subtitle`, `ctaText` | `string` | Yes | – | Landing page hero section |
| ItemCard | See `FoodItem` interface | `FoodItem` | Yes | – | Detailed card for food items, used in lists |
| PersonalizedGreeting | `userName` | `string` | Yes | – | Greeting message section |
| RecentMealsSection | `meals` | `Meal[]` | Yes | – | Displays user's recent meals |
| SearchBar | `onSearch` | `function` | Yes | – | Search input bar, calls handler on submit |
| SearchResults | `results` | `FoodItem[]` | Yes | – | Shows food item search results |

---

## Notes

- All components use **React functional components** with **TypeScript interfaces** defined at the top of each `.tsx` file.  
- Styling uses **Tailwind CSS**, and animations are handled by **Framer Motion**.  
- For detailed prop definitions, check each component’s file in `/components/{ComponentName}.tsx`.

---
