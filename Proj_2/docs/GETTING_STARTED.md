# Getting Started with Howl2Go

Welcome to Howl2Go - the smart food discovery platform that uses AI to help you find exactly what you're craving!

---

## What is Howl2Go?

Howl2Go eliminates traditional menu browsing by using **AI-powered natural language search** to help you find food items that match your nutritional preferences. Simply describe what you want, and let AI do the work.

**Key Features:**
- Natural language search (e.g., "high protein low carb under 500 calories")
- Search across 1,148+ items from 6 major fast-food chains
- Smart nutritional filtering
- User authentication and shopping cart
- Session-based cart for guest users

**Supported Restaurants:**
- McDonald's
- Burger King
- Wendy's
- KFC
- Taco Bell
- Pizza Hut

---

## Quick Start

### Prerequisites

- Node.js 18+ installed
- MongoDB (local or Atlas account)
- Groq API key (free tier available at [groq.com](https://groq.com))

### Installation

**1. Clone the Repository**
```bash
cd "SE_Project_Grp_27/Proj_2"
```

**2. Setup Backend**
```bash
cd Howl2Go_backend
npm install

# Create .env file
cp .env.example .env
# Edit .env with your credentials:
# - MONGODB_URI
# - GROQ_API_KEY
# - JWT_SECRET
# - JWT_REFRESH_SECRET
# - SESSION_SECRET

# Import food data
npm run import:fastfood

# Start backend server
npm run dev
```

Backend runs on `http://localhost:4000`

**3. Setup Frontend**
```bash
cd ../Howl2Go_frontend
npm install

# Start frontend
npm run dev
```

Frontend runs on `http://localhost:3000`

---

## Using Howl2Go

### 1. Search for Food

**Access the App:**
Open `http://localhost:3000` in your browser

**Try These Example Searches:**
```
high protein meal
low calorie breakfast under 400 calories
burger with at least 30g protein
lunch between 400 and 600 calories
low carb high fat meal
low sodium food with high fiber
```

**How Search Works:**
1. Type your query in natural language
2. Press Enter or click the search icon
3. AI (Groq's Llama 3.1) parses your query
4. MongoDB retrieves matching food items
5. Results display with nutritional info

### 2. Understanding Search Queries

**Simple Queries:**
- "high protein" → items with 20g+ protein
- "low calorie" → items under 400 calories
- "low fat" → items with minimal fat content

**Specific Numbers:**
- "at least 30g of protein"
- "less than 500 calories"
- "under 20g of carbs"

**Ranges:**
- "between 300 and 500 calories"
- "20 to 30 grams of protein"

**Combined Criteria:**
- "high protein low carb under 500 calories"
- "low fat high fiber with at least 15g protein"
- "breakfast under 400 calories with 20g protein"

**Supported Nutritional Fields:**
- Calories, Protein, Total Fat, Carbs
- Fiber, Sugar, Sodium, Cholesterol
- Saturated Fat, Trans Fat, Calories from Fat

### 3. User Accounts (Optional)

**Register:**
```
POST /api/users/register
{
  "name": "Your Name",
  "email": "you@example.com",
  "password": "SecurePass123!"
}
```

**Login:**
```
POST /api/users/login
{
  "email": "you@example.com",
  "password": "SecurePass123!"
}
```

### 4. Shopping Cart

**Add Items to Cart:**
- Click "Add" button on food items
- Works for both guests and authenticated users

**Manage Cart:**
- View cart: `GET /api/cart`
- Update quantity: `PATCH /api/cart/items/:foodItemId`
- Remove item: `DELETE /api/cart/items/:foodItemId`
- Clear cart: `DELETE /api/cart`

**Guest to User Cart Merge:**
When you log in, your guest cart automatically merges with your user cart.

---

## API Endpoints

### Food Search
- `POST /api/food/recommend` - Get food recommendations

### User Management
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - Login user
- `GET /api/users/profile` - Get profile (auth required)
- `POST /api/users/change-password` - Change password (auth required)
- `POST /api/users/refresh-token` - Refresh access token

### Cart Management
- `GET /api/cart` - Get current cart
- `POST /api/cart/items` - Add item to cart
- `PATCH /api/cart/items/:foodItemId` - Update quantity
- `DELETE /api/cart/items/:foodItemId` - Remove item
- `DELETE /api/cart` - Clear cart
- `POST /api/cart/merge` - Merge carts (auth required)

### Health Check
- `GET /api/health` - Server health status

---

## Environment Variables

**Backend (.env):**
```bash
# Server
PORT=4000
NODE_ENV=development

# Database
MONGODB_URI=your-mongodb-url

# Authentication
JWT_SECRET=your-jwt-secret-key-here
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Session
SESSION_SECRET=your-session-secret-key
SESSION_NAME=howl2go.sid
SESSION_MAX_AGE=86400000

# AI/LLM
GROQ_API_KEY=your-groq-api-key

# Frontend (for CORS)
FRONTEND_URL=http://localhost:3000
```

---

## Search Tips & Best Practices

### Effective Searches

**DO:**
✓ Be specific: "at least 30g protein"
✓ Use ranges: "400-600 calories"
✓ Combine criteria: "high protein low carb"
✓ Use natural language: "I want a healthy breakfast"

**DON'T:**
✗ Be too restrictive: "exactly 437 calories"
✗ Use contradictions: "high calorie low calorie"
✗ Too many criteria: More than 4-5 requirements

### Search Examples by Goal

**Weight Loss:**
```
low calorie high protein filling meal
breakfast under 400 calories high fiber
low fat high protein under 500 calories
```

**Muscle Building:**
```
high protein meal 30-40g protein
post-workout high protein under 600 calories
lean protein with moderate carbs
```

**Keto Diet:**
```
low carb high fat under 10g carbs
very low carb with at least 20g fat
keto friendly under 20g carbs
```

**Heart Health:**
```
low sodium low cholesterol
low saturated fat under 600mg sodium
heart healthy low fat meal
```

---

## Troubleshooting

### No Results Found

**Problem:** Search returns no items

**Solutions:**
- Broaden your criteria (remove one requirement)
- Use ranges instead of exact numbers
- Try simpler terms first, then refine
- Check for typos in nutritional terms

### Backend Connection Error

**Problem:** "Unable to connect to server"

**Solutions:**
1. **Check backend is running:**
   ```bash
   cd Howl2Go_backend
   npm run dev
   ```
   Should see: "Server running on port 4000"

2. **Verify MongoDB connection:**
   - Check MONGODB_URI in .env
   - Ensure MongoDB is running
   - For Atlas: Whitelist your IP

3. **Check Groq API key:**
   ```bash
   # Test API key
   curl https://api.groq.com/openai/v1/models \
     -H "Authorization: Bearer $GROQ_API_KEY"
   ```

### Slow Search Response

**Problem:** Searches take >5 seconds

**Causes:**
- Groq API rate limiting (30 requests/min on free tier)
- Slow internet connection
- Complex query

**Solutions:**
- Wait 60 seconds between searches
- Simplify your query
- Check internet speed
- Upgrade Groq plan for higher limits

### Import Food Data Failed

**Problem:** `npm run import:fastfood` errors

**Solutions:**
1. **Check CSV file exists:**
   ```bash
   ls data/fastfood.csv
   ```

2. **Verify MongoDB connection**
3. **Clear existing data and retry:**
   ```bash
   mongo howl2go --eval "db.fastfooditems.deleteMany({})"
   npm run import:fastfood
   ```

---

## Running Tests

**Backend Tests:**
```bash
cd Howl2Go_backend
npm test
```

**Test Coverage:**
- User authentication
- Cart management
- Food search/recommendations
- LLM query parsing
- Database connections

---

## Next Steps

### Explore Features

1. **Search & Discover**
   - Try different query patterns
   - Test nutritional filtering
   - Explore result sorting

2. **Create Account**
   - Register with email/password
   - Set dietary preferences
   - Track favorites

3. **Use Shopping Cart**
   - Add items to cart
   - Update quantities
   - View nutritional totals

### Coming Soon

- Order History
- Payment processing (Stripe/PayPal integration)
- AI Meal Suggestions based on Order History
- Ingredient based filtering/recommendations
- Rate limiting
- Query caching

### Learn More

- **API Documentation:** [API_DOCUMENTATION.md](API_DOCUMENTATION.md)
- **Features Guide:** [FEATURES.md](FEATURES.md)
- **Developer Setup:** [DEVELOPER_SETUP.md](DEVELOPER_SETUP.md)
- **Testing Guide:** [TESTING_GUIDE.md](TESTING_GUIDE.md)
- **Database Schema:** [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md)

---

## Support & Community

**Report Issues:**
- GitHub Issues: [github.com/harsha711/SE_Project_Grp_27/issues](https://github.com/harsha711/SE_Project_Grp_27/issues)

**Get Help:**
- Check existing issues
- Review documentation
- Ask in GitHub Discussions

**Contribute:**
- Fork the repository
- Make improvements
- Submit pull requests

---

## Quick Reference

### Common Commands

```bash
# Backend
cd Howl2Go_backend
npm run dev              # Start development server
npm test                 # Run tests
npm run import:fastfood  # Import food data

# Frontend
cd Howl2Go_frontend
npm run dev    # Start with Turbopack
npm run build  # Production build
npm start      # Start production server
```

### Most Common Queries

| Goal | Search Query |
|------|--------------|
| Healthy breakfast | `breakfast under 400 calories high protein` |
| Keto-friendly | `low carb high fat under 20g carbs` |
| Weight loss | `low calorie filling meal under 500 calories` |
| Post-workout | `high protein moderate carbs 30-40g protein` |
| Quick snack | `snack under 200 calories` |


---

**Happy Searching! 🍔**

*Crave it. Find it. Instantly.*

---

[← Back to Main README](../README.md) | [View All Features →](FEATURES.md)
