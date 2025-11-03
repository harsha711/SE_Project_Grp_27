# Howl2Go - Smart Menu Food Discovery Platform

![Howl2Go Logo](Howl2Go_frontend/public/Howl2go_orange_logo_transparent.png)

**Smart Menu Food Discovery - Find your next favorite meal instantly. No traditional menu - just search for what you're craving and discover amazing dishes.**

[![Version](https://img.shields.io/badge/version-1.0.0-orange.svg)](https://github.com/harsha711/SE_Project_Grp_27)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](../LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/react-19.1.0-blue.svg)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-%3E%3D7.0.0-green.svg)](https://www.mongodb.com/)
[![Express](https://img.shields.io/badge/express-4.21.1-black.svg)](https://expressjs.com/)
[![Next.js](https://img.shields.io/badge/Next.js-15.0.0-white.svg)](https://nextjs.org/)
[![Groq AI](https://img.shields.io/badge/Groq_AI-Enabled-orange.svg)](https://groq.com/)



---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Demo & Screenshots](#demo--screenshots)
- [Technology Stack](#technology-stack)
- [Quick Start](#quick-start)
- [Documentation](#documentation)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)
- [Team](#team)

---

## Overview

Howl2Go revolutionizes food discovery by eliminating traditional menus. Instead of browsing endless lists, users simply describe what they're craving using natural language, and our AI-powered search finds the perfect match across multiple restaurants.

### The Problem We Solve

- **Traditional menus are overwhelming** - Hundreds of items to scroll through
- **Hard to find specific cravings** - "Something spicy but not too heavy"
- **Dietary restrictions are tedious** - Manual filtering through every item
- **Decision fatigue** - Too many choices lead to poor decisions

### Our Solution

- **Natural Language Search** - "High protein, low carb breakfast under 400 calories"
- **AI-Powered Matching** - LLM understands intent and nutritional preferences
- **Multi-Restaurant Discovery** - See options from McDonald's, Burger King, Wendy's, KFC, Taco Bell
- **Instant Results** - No scrolling, just relevant matches

---

## Key Features

### 🔍 **Intelligent Search**
- Natural language query processing using Groq LLM (Llama 3.1)
- Understands complex nutritional criteria
- Filters by calories, protein, carbs, fats, sodium, etc.
- Range queries: "between 300-500 calories"

### 🍔 **Multi-Restaurant Support**
- Aggregates items from major fast-food chains
- 1,148+ food items in database
- Restaurant branding and logos
- Unified search across all menus

### 🎨 **Modern UI/UX**
- Dark theme with burnt orange accents
- Smooth animations using Framer Motion
- Responsive design (mobile, tablet, desktop)
- Typewriter effect for engaging search experience

### 📊 **Nutritional Insights**
- Complete nutritional information for each item
- Weight Watchers points included
- Calorie badges on food cards
- Statistics view for search results

### ⚡ **Performance**
- Fast API responses (< 500ms average)
- Next.js 15 with Turbopack for instant page loads
- MongoDB indexes for optimized queries
- Rate limiting and caching ready

---

## Demo & Screenshots

### Video Demos

**Full Application Walkthrough**
> 📹 [Watch Demo Video](https://youtu.be/your-demo-link) - 5 minute overview

**Feature Demonstrations**
- 🔍 [Search Functionality](https://youtu.be/your-search-demo) - Natural language queries
- 🛒 [Order Flow](https://youtu.be/your-order-demo) - From search to checkout
- 📱 [Mobile Experience](https://youtu.be/your-mobile-demo) - Responsive design showcase

### Screenshots

**Home Page - Hero Section**
![Home Page](docs/screenshots/home-page.png)

**Search Results**
![Search Results](docs/screenshots/search-results.png)

**Food Item Card**
![Item Card](docs/screenshots/item-card.png)

**Natural Language Query Examples**
![Query Examples](docs/screenshots/query-examples.png)

> **Note:** Demo videos and screenshots to be added. Create a `docs/screenshots/` directory and add images.

---

## Technology Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 15.5.5 | React framework with SSR |
| **React** | 19.1.0 | UI library |
| **TypeScript** | 5.x | Type safety |
| **Tailwind CSS** | 4.x | Utility-first styling |
| **Framer Motion** | 12.23.24 | Animations |
| **Lucide React** | 0.545.0 | Icons |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | 18+ | JavaScript runtime |
| **Express** | 5.1.0 | Web framework |
| **MongoDB** | Latest | NoSQL database |
| **Mongoose** | 8.19.1 | ODM for MongoDB |
| **Groq SDK** | 0.33.0 | LLM integration |

### AI/LLM
- **Model:** Llama 3.1 8B Instant
- **Provider:** Groq (free tier)
- **Rate Limit:** 30 requests/minute

---

## Quick Start

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0
- MongoDB Atlas account (free tier) OR local MongoDB
- Groq API key (free at https://console.groq.com)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/harsha711/SE_Project_Grp_27.git
cd SE_Project_Grp_27/Proj\ 2

# 2. Install backend dependencies
cd Howl2Go_backend
npm install

# 3. Configure environment variables
cp .env.example .env
# Edit .env and add your credentials:
# - MONGODB_URI=your_mongodb_connection_string
# - GROQ_API_KEY=your_groq_api_key

# 4. Import food data (optional - if database is empty)
npm run import:fastfood

# 5. Start backend server
npm run dev
# Backend runs at http://localhost:4000

# 6. In a new terminal, install frontend dependencies
cd ../Howl2Go_frontend
npm install

# 7. Start frontend development server
npm run dev
# Frontend runs at http://localhost:3000
```

### Verify Installation

**Backend Health Check:**
```bash
curl http://localhost:4000/api/health
```

**Test Search API:**
```bash
curl -X POST http://localhost:4000/api/food/search \
  -H "Content-Type: application/json" \
  -d '{"query": "high protein low carb", "limit": 5}'
```

**Access Frontend:**
Open http://localhost:3000 in your browser

---

## Documentation

### User Documentation
- **[Getting Started Guide](docs/GETTING_STARTED.md)** - First-time user walkthrough
- **[User Manual](docs/USER_MANUAL.md)** - Complete feature guide
- **[FAQ](docs/FAQ.md)** - Common questions and answers

### Developer Documentation
- **[Developer Setup Guide](docs/DEVELOPER_SETUP.md)** - Environment configuration
- **[API Documentation](Howl2Go_backend/LLM_API_DOCUMENTATION.md)** - All endpoints with examples
- **[Database Schema](docs/DATABASE_SCHEMA.md)** - Data models and relationships
- **[Architecture Overview](docs/ARCHITECTURE.md)** - System design and diagrams
- **[Contributing Guide](CONTRIBUTING.md)** - How to contribute code
- **[Testing Guide](docs/TESTING_GUIDE.md)** - Running and writing tests

### Design Documentation
- **[UI/UX Design Guide](Howl2Go_frontend/DESIGN_SYSTEM.md)** - Complete design system
- **[Color Palette Guide](Howl2Go_frontend/COLOR_PALETTE_GUIDE.md)** - Color usage
- **[User Flow Diagrams](docs/USER_FLOWS.md)** - Visual user journeys

### Project Management
- **[Feature List](docs/FEATURES.md)** - All implemented features
- **[Release Notes](CHANGELOG.md)** - Version history and changes
- **[Roadmap](docs/ROADMAP.md)** - Future plans and enhancements

### Legal
- **[Privacy Policy](docs/PRIVACY_POLICY.md)** - How we handle user data
- **[Terms of Service](docs/TERMS_OF_SERVICE.md)** - Usage terms
- **[Code of Conduct](CODE_OF_CONDUCT.md)** - Community guidelines

---

## Project Structure

```
Proj 2/
├── Howl2Go_backend/              # Express.js API Server
│   ├── src/
│   │   ├── app.js                # Express application
│   │   ├── server.js             # Server entry point
│   │   ├── config/               # Configuration files
│   │   ├── controllers/          # Request handlers
│   │   ├── routes/               # API routes
│   │   ├── middleware/           # Custom middleware
│   │   ├── services/             # Business logic
│   │   ├── models/               # Database models
│   │   ├── scripts/              # Utility scripts
│   │   └── __tests__/            # Backend tests
│   ├── package.json
│   └── README.md
│
├── Howl2Go_frontend/             # Next.js React App
│   ├── app/                      # Next.js App Router
│   │   ├── page.tsx              # Home page
│   │   ├── search/               # Search results page
│   │   ├── login/                # Login page
│   │   └── dashboard/            # User dashboard
│   ├── components/               # React components
│   ├── types/                    # TypeScript types
│   ├── public/                   # Static assets
│   ├── package.json
│   └── README.md
│
├── Howl2Go_LLM/                  # LLM Testing Scripts
│   ├── test_groq.py              # Groq API tests
│   └── llama_test.py             # Local Llama tests
│
├── docs/                         # Documentation
│   ├── screenshots/              # UI screenshots
│   ├── diagrams/                 # Architecture diagrams
│   └── *.md                      # Documentation files
│
└── README.md                     # This file
```

---

## Available Scripts

### Backend

```bash
npm run dev          # Start development server with hot-reload
npm start            # Start production server
npm test             # Run all tests
npm run import:fastfood  # Import food data from CSV
```

### Frontend

```bash
npm run dev          # Start development server (Turbopack)
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
npm test             # Run tests
```

---

## API Endpoints

### Food Search API

**Base URL:** `http://localhost:4000/api`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/food/search` | POST | Search foods with natural language |
| `/food/parse` | POST | Parse query and extract criteria |
| `/food/recommend` | POST | Get personalized recommendations |
| `/food/stats` | POST | Get statistics for matching foods |
| `/health` | GET | Health check endpoint |

**Example Request:**
```bash
curl -X POST http://localhost:4000/api/food/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "high protein breakfast under 500 calories",
    "limit": 10,
    "page": 1
  }'
```

**Example Response:**
```json
{
  "success": true,
  "query": "high protein breakfast under 500 calories",
  "data": [
    {
      "company": "McDonald's",
      "item": "Egg McMuffin",
      "calories": 300,
      "protein": 17,
      "carbs": 30,
      "totalFat": 13
    }
  ],
  "count": 1,
  "page": 1,
  "totalPages": 1,
  "hasMore": false
}
```

See [API_TEST_EXAMPLES.md](Howl2Go_backend/API_TEST_EXAMPLES.md) for more examples.

---

## Environment Variables

### Backend (.env)
```env
PORT=4000
NODE_ENV=development
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/howl2go
GROQ_API_KEY=gsk_your_api_key_here
```

### Frontend (optional .env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

---

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

**Quick contribution workflow:**
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please read our [Code of Conduct](CODE_OF_CONDUCT.md) before contributing.

---

## Testing

```bash
# Backend tests
cd Howl2Go_backend
npm test

# Frontend tests (to be implemented)
cd Howl2Go_frontend
npm test

# Run with coverage
npm test -- --coverage
```

See [Testing Guide](docs/TESTING_GUIDE.md) for detailed testing instructions.

---

## Deployment

### Backend Deployment (Railway/Render/Heroku)
1. Set environment variables in hosting platform
2. Connect GitHub repository
3. Deploy from `main` branch
4. Ensure MongoDB Atlas is accessible

### Frontend Deployment (Vercel - Recommended)
1. Connect GitHub repository to Vercel
2. Set `NEXT_PUBLIC_API_URL` environment variable
3. Deploy automatically on push to `main`

See [Deployment Guide](docs/DEPLOYMENT.md) for detailed instructions.

---

## Performance

- **API Response Time:** < 500ms average
- **LLM Processing:** ~200-400ms per query
- **Database Queries:** < 100ms with indexes
- **Frontend Load Time:** < 2s (Next.js SSR)
- **Lighthouse Score:** 90+ (Performance, Accessibility, Best Practices)

---

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

---

## Known Issues

- Search requires backend server to be running
- LLM rate limit: 30 requests/minute on free tier
- Some complex queries may timeout (>10s)
- Mobile UI needs further optimization

See [Issues](https://github.com/harsha711/SE_Project_Grp_27/issues) for full list.

---

## Roadmap

### Version 1.1 (Next Release)
- [ ] User authentication and profiles
- [ ] Shopping cart functionality
- [ ] Order placement and tracking
- [ ] Payment integration
- [ ] Favorites and history

### Version 2.0 (Future)
- [ ] Real restaurant integrations
- [ ] Delivery tracking with maps
- [ ] Push notifications
- [ ] Driver/courier features
- [ ] Restaurant dashboard

See [Roadmap](docs/ROADMAP.md) for complete feature plans.

---

## License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

---

## Team

**SE_Project_Grp_27**

- **Project Lead:** [Harsha](https://github.com/harsha711)
- **Contributors:** See [CONTRIBUTORS.md](CONTRIBUTORS.md)

---

## Acknowledgments

- **Groq** for free LLM API access
- **MongoDB Atlas** for free database hosting
- **Vercel** for frontend hosting
- **Next.js** team for amazing framework
- **OpenAI** for inspiration in AI-powered search

---

## Contact & Support

- **Issues:** [GitHub Issues](https://github.com/harsha711/SE_Project_Grp_27/issues)
- **Discussions:** [GitHub Discussions](https://github.com/harsha711/SE_Project_Grp_27/discussions)
- **Email:** [support@howl2go.com](mailto:support@howl2go.com)

---

## Star History

If you find this project useful, please give it a star! ⭐

[![Star History Chart](https://api.star-history.com/svg?repos=harsha711/SE_Project_Grp_27&type=Date)](https://star-history.com/#harsha711/SE_Project_Grp_27&Date)

---

**Made with ❤️ by SE_Project_Grp_27**

*Crave it. Find it. Instantly.*
