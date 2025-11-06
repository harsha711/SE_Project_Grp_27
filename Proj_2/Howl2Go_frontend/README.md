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

-   🎨 **Beautiful Dark Theme** - Modern burnt orange and dark gray color scheme
-   ⚡ **Lightning Fast** - Next.js 15 with optimized rendering
-   📱 **Fully Responsive** - Mobile-first design with Tailwind CSS
-   🎬 **Smooth Animations** - Framer Motion for delightful UX
-   🔍 **Smart Search** - AI-powered natural language search
-   🛒 **Shopping Cart** - Complete cart management with place order
-   🧪 **Well Tested** - 56+ test cases with Jest & React Testing Library

## Tech Stack

-   **Framework:** Next.js 15 (App Router)
-   **UI Library:** React 19
-   **Language:** TypeScript 5
-   **Styling:** Tailwind CSS 4
-   **Animations:** Framer Motion
-   **Icons:** Lucide React
-   **Testing:** Jest, React Testing Library
-   **Linting:** ESLint

## Pages

| Route     | Description                                |
| --------- | ------------------------------------------ |
| `/`       | Home page with search bar and hero section |
| `/search` | Search results with food item cards        |
| `/cart`   | Shopping cart with checkout functionality  |
| `/login`  | Login page (placeholder for v1.1)          |

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

-   Cart page: 56 test cases
-   Search page: Coming soon
-   Home page: Coming soon

See [**tests**/TESTING_GUIDE.md](__tests__/TESTING_GUIDE.md) for testing documentation.

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

-   Use Tailwind CSS utility classes
-   Follow existing color palette (burnt orange + dark gray)
-   Maintain dark theme consistency
-   Use Framer Motion for animations

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

-   [Getting Started](../docs/GETTING_STARTED.md) - Complete user guide
-   [Features](../docs/FEATURES.md) - Complete feature list
-   [Design System](DESIGN_SYSTEM.md) - UI/UX guidelines
-   [API Documentation](../docs/API_DOCUMENTATION.md) - API reference

## Contributing

1. Follow TypeScript best practices
2. Write tests for new features
3. Maintain existing code style
4. Update documentation as needed

## License

Part of Howl2Go project - SE_Project_Grp_27

---

**Built with Next.js 15 • React 19 • TypeScript**

---

# Howl2Go Frontend Docker Guide

This guide explains how to build and run the Howl2Go Next.js frontend using the provided multi-stage `Dockerfile`. The container bundles a production-ready [standalone Next.js build](https://nextjs.org/docs/app/building-your-application/deploying/standalone) and serves it with `node server.js` on port `3000`.

---

## 1. Prerequisites

-   Docker 24+ (or any recent version that supports multi-stage builds)
-   Access to a running Howl2Go backend API
    -   Default local backend URL: `http://localhost:4000`
    -   When running the backend in Docker, expose it on the same network so the frontend can reach it

---

## 2. Configure Runtime Environment

The frontend expects a single environment variable at **runtime**:

| Variable      | Description                                      |
| ------------- | ------------------------------------------------ |
| `BACKEND_URL` | Base URL for the backend API (no trailing slash) |

### Option A — Pass at `docker run`

```bash
docker run \
  --env BACKEND_URL=http://host.docker.internal:4000 \
  --publish 3000:3000 \
  howl2go-frontend:latest
```

> **Linux note:** add `--add-host=host.docker.internal:host-gateway` when the backend runs on the host machine.

### Option B — Provide an `.env` file

Create a file (for example `.env.docker`) alongside the `Dockerfile`:

```dotenv
BACKEND_URL=http://host.docker.internal:4000
```

Then run:

```bash
docker run --env-file .env.docker -p 3000:3000 howl2go-frontend:latest
```

---

## 3. Build the Image

From `Proj_2/Howl2Go_frontend/`:

```bash
docker build -t howl2go-frontend:latest .
```

What happens during the build:

1. `deps` stage runs `npm ci` to install all dependencies (including dev deps needed for the build).
2. `builder` stage copies the source and executes `npm run build` with Next.js outputting a standalone bundle.
3. `runner` stage copies only the compiled artifacts plus the `public` folder into a minimal Node 22 Alpine image and configures a non-root user.

---

## 4. Run the Container

```bash
docker run \
  --name howl2go-frontend \
  --publish 3000:3000 \
  --env BACKEND_URL=http://host.docker.internal:4000 \
  --add-host=host.docker.internal:host-gateway \
  howl2go-frontend:latest
```

Then open http://localhost:3000 in your browser.

### Using Docker Compose

```yaml
services:
    frontend:
        image: howl2go-frontend:latest
        build:
            context: .
        ports:
            - "3000:3000"
        environment:
            BACKEND_URL: http://backend:4000
        depends_on:
            - backend
```

Make sure your backend service is reachable at the hostname (`backend` in the example).

---

## 5. Rebuilding After Source Changes

The image contains a compiled build, so you must rebuild after modifying the source code:

```bash
docker build --no-cache -t howl2go-frontend:latest .
docker compose up --build frontend
```

---

## 6. Troubleshooting

-   **Frontend cannot reach backend:** verify `BACKEND_URL` is accessible from inside the container. Use `docker exec -it howl2go-frontend wget -qO- $BACKEND_URL/health`.
-   **Port already in use:** stop existing containers (`docker ps` then `docker stop <id>`) or map a different host port (e.g., `-p 3001:3000`).
-   **Environment variable missing:** Next.js route handlers will throw `TypeError: fetch failed` if `BACKEND_URL` is unset—check `docker logs`.
-   **Build caching issues:** run `docker builder prune` or rebuild with `--no-cache`.

---

## 7. Useful Commands

```bash
# Tail logs
docker logs -f howl2go-frontend

# Execute a shell in the running container
docker exec -it howl2go-frontend sh

# Remove the container and image
docker rm -f howl2go-frontend
docker rmi howl2go-frontend:latest
```

Happy shipping! Let the container handle builds so your team can focus on creating great experiences.
