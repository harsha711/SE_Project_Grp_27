# Howl2Go Frontend

**Modern Next.js 15 application with AI-powered food search**

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwind-css)](https://tailwindcss.com/)

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run tests
npm test
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Project Structure

```
Howl2Go_frontend/
├── app/                    # Next.js 15 app directory
│   ├── page.tsx           # Home page with search
│   ├── search/            # Search results page
│   ├── cart/              # Shopping cart
│   ├── login/             # Login page (placeholder)
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/            # Reusable React components
├── public/                # Static assets (logos, icons)
├── __tests__/             # Jest test files
│   ├── pages/             # Page component tests
│   └── TESTING_GUIDE.md   # Testing documentation
└── tailwind.config.ts     # Tailwind configuration
```

## Key Features

- 🎨 **Beautiful Dark Theme** - Modern burnt orange and dark gray color scheme
- ⚡ **Lightning Fast** - Next.js 15 with optimized rendering
- 📱 **Fully Responsive** - Mobile-first design with Tailwind CSS
- 🎬 **Smooth Animations** - Framer Motion for delightful UX
- 🔍 **Smart Search** - AI-powered natural language search
- 🛒 **Shopping Cart** - Complete cart management with place order
- 🧪 **Well Tested** - 56+ test cases with Jest & React Testing Library

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **UI Library:** React 19
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Testing:** Jest, React Testing Library
- **Linting:** ESLint

## Pages

| Route | Description |
|-------|-------------|
| `/` | Home page with search bar and hero section |
| `/search` | Search results with food item cards |
| `/cart` | Shopping cart with checkout functionality |
| `/login` | Login page (placeholder for v1.1) |

## Components

### Search Bar
Shared search component with typewriter animation and smooth transitions between pages.

### Food Card
Displays food item with restaurant logo, calories, nutrition info, and add-to-cart button.

### Cart Item
Cart item card with quantity controls, remove button, and nutritional summary.

## Color Palette

```css
--burnt-orange: #CC5500    /* Primary accent */
--dark-gray: #1A1A1A       /* Background */
--light-gray: #E5E5E5      /* Text */
--card-bg: #2A2A2A         /* Card background */
```

See [COLOR_PALETTE_GUIDE.md](COLOR_PALETTE_GUIDE.md) for complete color system.

## Environment Variables

```env
# API endpoint (default: http://localhost:4000)
NEXT_PUBLIC_API_URL=http://localhost:4000
```

## Scripts

```bash
npm run dev          # Start development server (port 3000)
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
npm test             # Run Jest tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Generate coverage report
```

## Testing

```bash
# Run all tests
npm test

# Run specific test file
npm test Cart.test.tsx

# Watch mode for TDD
npm test -- --watch

# Coverage report
npm test -- --coverage
```

**Test Coverage:**
- Cart page: 56 test cases
- Search page: Coming soon
- Home page: Coming soon

See [__tests__/TESTING_GUIDE.md](__tests__/TESTING_GUIDE.md) for testing documentation.

## Development

### Adding a New Page

1. Create `app/your-page/page.tsx`
2. Export default React component
3. Add route to navigation

### Adding a Component

1. Create `components/YourComponent.tsx`
2. Export component
3. Import and use in pages

### Styling Guidelines

- Use Tailwind CSS utility classes
- Follow existing color palette (burnt orange + dark gray)
- Maintain dark theme consistency
- Use Framer Motion for animations

## API Integration

The frontend communicates with the backend API at `http://localhost:4000/api`:

```typescript
// Search food items
POST /api/food/search
Body: { query: string, limit?: number, page?: number }

// Get recommendations
POST /api/food/recommend
Body: { query: string, limit?: number }
```

See [API Documentation](../docs/API_DOCUMENTATION.md) for complete API reference.

## Troubleshooting

### Port already in use
```bash
# Kill process on port 3000
npx kill-port 3000
# Or use a different port
npm run dev -- -p 3001
```

### Build fails
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

### Tests failing
```bash
# Clear Jest cache
npx jest --clearCache
npm test
```

## Documentation

- [User Manual](../docs/USER_MANUAL.md) - End-user guide
- [Getting Started](../docs/GETTING_STARTED.md) - Quick start guide
- [Features](../docs/FEATURES.md) - Complete feature list
- [Design System](DESIGN_SYSTEM.md) - UI/UX guidelines

## Contributing

1. Follow TypeScript best practices
2. Write tests for new features
3. Maintain existing code style
4. Update documentation as needed

## License

Part of Howl2Go project - SE_Project_Grp_27

---

**Built with Next.js 15 • React 19 • TypeScript**
