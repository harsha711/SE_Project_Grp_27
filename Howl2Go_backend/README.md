# Food Delivery Backend

Backend service for a food delivery system built with Node.js and Express. This project starts with a lightweight API foundation that can be expanded with domain-specific features like restaurant management, menu catalogs, order processing, and driver dispatching.

## Prerequisites

- Node.js 18+ and npm 9+

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy the environment template and adjust values as needed:
   ```bash
   cp .env.example .env
   ```
3. Start the development server with auto-reload:
   ```bash
   npm run dev
   ```

The API defaults to `http://localhost:4000`. A health-check endpoint is available at `GET /api/health`.

## Available Scripts

- `npm run dev` – start the server with hot-reload via nodemon
- `npm start` – start the server once with Node.js
- `npm test` – run Node's built-in test runner against files in `src/**/__tests__`

## Project Structure

```
src/
├── app.js               # Express app configuration
├── config/              # Environment and configuration helpers
├── controllers/         # Request handlers
├── middleware/          # Custom middleware (placeholder)
├── routes/              # Route definitions and routers
└── server.js            # HTTP server bootstrap
```

## Next Steps

- Flesh out domain modules for restaurants, menus, orders, and couriers.
- Add persistence (e.g., PostgreSQL, MongoDB) and related data access layers.
- Introduce logging, validation, authentication, and testing infrastructure as requirements evolve.
