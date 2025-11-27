# Howl2Go API Documentation

**Quick, practical guide to the Howl2Go REST API**

---

## Base URL

```
Development: http://localhost:4000/api
Production:  Coming Soon
```

---

## Quick Start

```bash
# Search for food
curl -X POST http://localhost:4000/api/food/search \
  -H "Content-Type: application/json" \
  -d '{"query": "high protein low carb", "limit": 10}'

# Get recommendations
curl -X POST http://localhost:4000/api/food/recommend \
  -H "Content-Type: application/json" \
  -d '{"query": "healthy breakfast", "limit": 5}'
```

---

## Endpoints

### 1. Health Check

**`GET /api/health`**

Check if the API is running.

**Response:**
```json
{
  "status": "ok",
  "service": "food-delivery-backend",
  "uptime": 3600.45
}
```

---

### 2. Search Food Items

**`POST /api/food/search`**

Search for food items using natural language.

**Request:**
```json
{
  "query": "at least 30g protein under 500 calories",
  "limit": 10,
  "page": 1
}
```

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| query | string | Yes | - | Natural language search query |
| limit | number | No | 10 | Results per page (1-100) |
| page | number | No | 1 | Page number |

**Response:**
```json
{
  "success": true,
  "query": "at least 30g protein under 500 calories",
  "criteria": {
    "protein": { "min": 30 },
    "calories": { "max": 500 }
  },
  "results": [
    {
      "_id": "65a1b2c3d4e5f6789012345",
      "item": "Grilled Chicken Breast",
      "restaurant": "Subway",
      "calories": 165,
      "protein": 31,
      "total_fat": 3.6,
      "total_carb": 0,
      "fiber": 0,
      "sugar": 0,
      "sodium": 74
    }
  ],
  "pagination": {
    "total": 45,
    "page": 1,
    "limit": 10,
    "pages": 5
  },
  "message": "Found 10 items matching your criteria"
}
```

---

### 3. Get Recommendations

**`POST /api/food/recommend`**

Get smart food recommendations sorted by relevance.

**Request:**
```json
{
  "query": "high protein snack",
  "limit": 5
}
```

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| query | string | Yes | - | Natural language query |
| limit | number | No | 5 | Number of recommendations (1-20) |

**Response:**
```json
{
  "success": true,
  "recommendations": [
    {
      "_id": "65a1b2c3d4e5f6789012347",
      "item": "Greek Yogurt Parfait",
      "restaurant": "Starbucks",
      "protein": 20,
      "calories": 150
    }
  ],
  "count": 5
}
```

---

### 4. Parse Query (Debug)

**`POST /api/food/parse`**

Test how the AI interprets your query without executing a search.

**Request:**
```json
{
  "query": "I want a high protein meal with low carbs"
}
```

**Response:**
```json
{
  "success": true,
  "query": "I want a high protein meal with low carbs",
  "criteria": {
    "protein": { "min": 20 },
    "carbs": { "max": 30 }
  }
}
```

---

## Query Examples

### Simple Queries
```
"high protein"
"low calorie"
"low fat dessert"
```

### Specific Numbers
```
"at least 30g of protein"
"less than 500 calories"
"under 20g of carbs"
```

### Complex Queries
```
"high protein, low carb, under 500 calories"
"at least 25g protein with low sodium"
"meal between 300 and 600 calories with 20g+ protein"
```

### By Goal
```
Weight Loss:     "low calorie high protein meal"
Muscle Building: "at least 30g of protein"
Low Carb:        "under 20g of carbs"
Heart Health:    "low sodium low cholesterol"
```

---

## Nutritional Fields

The AI can filter by these parameters:

| Field | Database Field | Unit | Example |
|-------|----------------|------|---------|
| Calories | `calories` | kcal | "under 500 calories" |
| Protein | `protein` | g | "at least 30g of protein" |
| Fat | `total_fat` | g | "low fat" |
| Carbs | `total_carb` | g | "low carb" |
| Fiber | `fiber` | g | "high fiber" |
| Sugar | `sugar` | g | "low sugar" |
| Sodium | `sodium` | mg | "low sodium" |
| Cholesterol | `cholesterol` | mg | "low cholesterol" |
| Saturated Fat | `sat_fat` | g | "low saturated fat" |
| Trans Fat | `trans_fat` | g | "no trans fat" |

---

## Error Handling

### Error Response Format
```json
{
  "success": false,
  "error": "error_type",
  "message": "Human-readable error description"
}
```

### Common Errors

**400 - Missing Query**
```json
{
  "success": false,
  "error": "Query parameter is required",
  "message": "Please provide a food query"
}
```

**404 - No Results**
```json
{
  "success": true,
  "results": [],
  "message": "No items found matching your criteria"
}
```

**500 - LLM Service Error**
```json
{
  "success": false,
  "error": "Failed to parse query",
  "message": "AI service temporarily unavailable"
}
```

**Fixes:**
- Missing Query: Include `query` field in request body
- No Results: Make criteria less restrictive
- LLM Error: Check `GROQ_API_KEY` in backend `.env`, wait 60s and retry

---

## Code Examples

### JavaScript (Fetch)

```javascript
async function searchFood(query, limit = 10) {
  const response = await fetch('http://localhost:4000/api/food/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, limit })
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.message);
  }

  return data.results;
}

// Usage
const results = await searchFood("high protein meal");
console.log(results);
```

### TypeScript

```typescript
interface FoodItem {
  _id: string;
  item: string;
  restaurant: string;
  calories: number;
  protein: number;
  total_fat: number;
  total_carb: number;
}

interface SearchResponse {
  success: boolean;
  results: FoodItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

async function searchFood(query: string): Promise<FoodItem[]> {
  const response = await fetch('http://localhost:4000/api/food/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, limit: 10 })
  });

  const data: SearchResponse = await response.json();
  return data.results;
}
```

### Python

```python
import requests

def search_food(query, limit=10):
    response = requests.post(
        'http://localhost:4000/api/food/search',
        json={'query': query, 'limit': limit}
    )
    data = response.json()

    if data['success']:
        return data['results']
    else:
        raise Exception(data['message'])

# Usage
results = search_food("high protein meal")
for item in results:
    print(f"{item['item']}: {item['protein']}g protein")
```

### React Hook

```typescript
import { useState, useCallback } from 'react';

export function useFoodSearch() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchFood = useCallback(async (query: string, limit = 10) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:4000/api/food/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, limit })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message);
      }

      return data;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { searchFood, loading, error };
}
```

---

## Best Practices

### Query Optimization
- ✅ Use specific numbers: "at least 30g of protein"
- ✅ Combine criteria: "high protein, low carb, under 500 cal"
- ✅ Test with `/parse` endpoint first
- ❌ Avoid generic queries: "food"
- ❌ Don't send queries on every keystroke (use debouncing)

### Error Handling
```javascript
try {
  const data = await searchFood(query);
  if (!data.success) {
    showUserMessage(data.message);
    return;
  }
  // Process results
} catch (error) {
  showUserMessage('Unable to connect. Please try again.');
}
```

### Performance
- Debounce search inputs (300-500ms)
- Cache common queries
- Use pagination (limit 10-20)
- Show loading states

---

## Review & Rating Endpoints

### Create Review

**`POST /api/reviews`**

Create a review for a food item you've ordered.

**Authentication:** Required

**Request:**
```json
{
  "orderId": "65a1b2c3d4e5f6789012345",
  "foodItemId": "65a1b2c3d4e5f6789012346",
  "rating": 5,
  "comment": "Amazing burger! Great taste and quality."
}
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| orderId | string | Yes | Order ID containing the item |
| foodItemId | string | Yes | Food item ID to review |
| rating | number | Yes | Rating 1-5 (integer) |
| comment | string | No | Review text (max 1000 chars) |

**Response:**
```json
{
  "success": true,
  "message": "Review created successfully",
  "data": {
    "review": {
      "_id": "65a1b2c3d4e5f6789012347",
      "userId": {
        "_id": "65a1b2c3d4e5f6789012348",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "orderId": "65a1b2c3d4e5f6789012345",
      "foodItemId": "65a1b2c3d4e5f6789012346",
      "restaurant": "McDonald's",
      "itemName": "Big Mac",
      "rating": 5,
      "comment": "Amazing burger! Great taste and quality.",
      "helpful": 0,
      "isVerified": true,
      "createdAt": "2024-12-15T10:30:00.000Z",
      "updatedAt": "2024-12-15T10:30:00.000Z"
    }
  }
}
```

**Errors:**
- `400` - Missing required fields or invalid rating
- `401` - Authentication required
- `404` - Order or food item not found
- `400` - Already reviewed this item from this order

---

### Get Item Reviews

**`GET /api/reviews/item/:foodItemId`**

Get all reviews for a specific food item.

**Authentication:** Optional (public endpoint)

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 10 | Reviews per page |
| sort | string | "recent" | Sort order: recent, oldest, highest, lowest, helpful |

**Response:**
```json
{
  "success": true,
  "data": {
    "reviews": [
      {
        "_id": "65a1b2c3d4e5f6789012347",
        "userId": {
          "_id": "65a1b2c3d4e5f6789012348",
          "name": "John Doe",
          "email": "john@example.com"
        },
        "rating": 5,
        "comment": "Amazing burger!",
        "helpful": 12,
        "isVerified": true,
        "createdAt": "2024-12-15T10:30:00.000Z"
      }
    ],
    "stats": {
      "averageRating": 4.5,
      "totalReviews": 42,
      "ratingDistribution": {
        "5": 20,
        "4": 15,
        "3": 5,
        "2": 1,
        "1": 1
      }
    },
    "pagination": {
      "total": 42,
      "page": 1,
      "limit": 10,
      "pages": 5
    }
  }
}
```

---

### Get My Reviews

**`GET /api/reviews/my-reviews`**

Get current user's reviews.

**Authentication:** Required

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 20 | Reviews per page |

**Response:**
```json
{
  "success": true,
  "data": {
    "reviews": [
      {
        "_id": "65a1b2c3d4e5f6789012347",
        "foodItemId": {
          "_id": "65a1b2c3d4e5f6789012346",
          "company": "McDonald's",
          "item": "Big Mac"
        },
        "rating": 5,
        "comment": "Great!",
        "createdAt": "2024-12-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "total": 5,
      "page": 1,
      "limit": 20,
      "pages": 1
    }
  }
}
```

---

### Update Review

**`PATCH /api/reviews/:reviewId`**

Update your own review.

**Authentication:** Required

**Request:**
```json
{
  "rating": 4,
  "comment": "Updated review text"
}
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| rating | number | No | New rating (1-5) |
| comment | string | No | New comment text |

**Response:**
```json
{
  "success": true,
  "message": "Review updated successfully",
  "data": {
    "review": { /* updated review object */ }
  }
}
```

---

### Delete Review

**`DELETE /api/reviews/:reviewId`**

Delete your own review.

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "message": "Review deleted successfully"
}
```

---

### Mark Review as Helpful

**`POST /api/reviews/:reviewId/helpful`**

Mark a review as helpful (one vote per user per review).

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "message": "Review marked as helpful",
  "data": {
    "helpful": 13
  }
}
```

---

## Rate Limits

**Groq API (Free Tier):**
- 30 requests per minute
- 14,400 requests per day
- ~500ms-2s response time

**Recommendations:**
- Debounce search inputs
- Cache results client-side
- Avoid unnecessary parse requests

---

## Troubleshooting

### "GROQ_API_KEY is not set"
```bash
# Check .env file
cat "Proj_2/Howl2Go_backend/.env"

# Should contain:
GROQ_API_KEY=your_actual_key_here

# Restart server
npm run dev
```

### CORS Errors
Verify CORS is enabled in `src/app.js`:
```javascript
app.use(cors());
```

### Slow Response Times
- Use pagination (limit 10-20)
- Implement caching
- Add loading indicators
- Use `/recommend` instead of `/search` for faster results

### No Results Found
1. Test with `/parse` to see how query is interpreted
2. Make criteria less restrictive
3. Check database has matching items

### MongoDB Connection Failed
```bash
# Check connection string in .env
MONGODB_URI=mongodb://localhost:27017/food_delivery

# Verify MongoDB is running
mongosh
```

---

## Support

- **GitHub**: https://github.com/harsha711/SE_Project_Grp_27
- **Email**: support_howl2go@gmail.com
- **Issues**: https://github.com/harsha711/SE_Project_Grp_27/issues

---

**API Version:** 1.0.0
**Last Updated:** January 2025
**Project:** Howl2Go - SE_Project_Grp_27
