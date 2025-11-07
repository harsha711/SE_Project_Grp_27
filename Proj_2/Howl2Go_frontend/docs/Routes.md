# Howl2Go Route Documentation

## Overview
**Howl2Go** follows the **Next.js App Router** structure.  
All routes are defined by folders inside the `/app/` directory.

---

## Route Overview

| Route Path | Purpose / Description | Main Components Used |
|-------------|-----------------------|----------------------|
| `/` | Home page with hero section and site entry | `HeroSection`, `Header` |
| `/search` | Food menu search and results (API powered) | `SearchBar`, `SearchResults`, `ItemCard` |
| `/cart` | Shopping cart page for adding/removing food and checkout | `CartPage`, `ItemCard` |
| `/dashboard` | User dashboard with analytics and personalized greeting | `DashboardHero`, `PersonalizedGreeting` |
| `/login` | Login page (initial version, placeholder) | `LoginForm` *(planned)* |
| `/signup` | User registration page | `SignupForm` *(planned)* |
| `/about` | App information and about page | `ContentSection` |

---