# Howl2Go API Documentation

## Table of Contents
- [Overview](#overview)
- [Key Features](#key-features)
- [Authentication](#authentication)
- [Base URLs](#base-urls)
- [API Endpoints](#api-endpoints)
  - [Health Check](#health-check)
  - [Food Search](#food-search-endpoints)
- [Request/Response Formats](#requestresponse-formats)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Pagination](#pagination)
- [Query Syntax Guide](#query-syntax-guide)
- [Code Examples](#code-examples)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)
- [API Versioning](#api-versioning)
- [Postman Collection](#postman-collection)

---

## Overview

The Howl2Go API is a next-generation food delivery backend service that leverages AI-powered natural language processing to provide intuitive food search capabilities. Instead of complex filters and dropdown menus, users can search for food using conversational queries like "I want a high protein meal with low carbs" or "Give me a healthy breakfast under 400 calories."

**Powered by:**
- **Groq LLM**: Converts natural language to structured nutritional criteria
- **MongoDB**: Fast, scalable database for food item storage
- **Express.js**: Robust REST API framework
- **Node.js**: High-performance server runtime

---

## Key Features

- **Natural Language Search**: Search using plain English instead of complex filters
- **Smart Recommendations**: Get personalized food suggestions based on preferences
- **Nutritional Filtering**: Support for 10+ nutritional parameters (calories, protein, carbs, fat, fiber, sugar, sodium, etc.)
- **Pagination Support**: Efficiently browse through large result sets
- **Statistical Insights**: Get nutritional statistics for matching items
- **Real-time Query Parsing**: Debug and understand how queries are interpreted
- **CORS Enabled**: Ready for cross-origin frontend integration
- **Comprehensive Error Handling**: Clear, actionable error messages

---

## Authentication

**Status**: Coming Soon

Currently, all API endpoints are public and do not require authentication. In future releases, we will implement:
- JWT-based authentication
- API key management
- User-specific rate limiting
- Personalized recommendations based on order history
- Saved preferences and dietary restrictions

For now, all endpoints can be accessed without authentication headers.

---

## Base URLs

### Development
```
http://localhost:4000
```

### Production
```
https://howl2go.com (Coming Soon)
```

### API Prefix
All endpoints use the `/api` prefix:
```
http://localhost:4000/api
```

---

## API Endpoints

### Health Check

#### Get Health Status
Check if the API service is running and healthy.

**Endpoint:** `GET /api/health`

**Request:**
```bash
GET http://localhost:4000/api/health
```

**Response:** `200 OK`
```json
{
  "status": "ok",
  "service": "food-delivery-backend",
  "uptime": 3600.45,
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

**Response Fields:**
- `status` (string): Service health status ("ok" if healthy)
- `service` (string): Service name identifier
- `uptime` (number): Server uptime in seconds
- `timestamp` (string): Current server time in ISO 8601 format

---

### Food Search Endpoints

#### 1. Parse Query (Test LLM)

Parse a natural language query to see how the LLM interprets it without executing a search. Perfect for debugging and understanding query processing.

**Endpoint:** `POST /api/food/parse`

**Request Body:**
```json
{
  "query": "I want a high protein meal with low carbs"
}
```

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| query | string | Yes | Natural language food query |

**Response:** `200 OK`
```json
{
  "success": true,
  "query": "I want a high protein meal with low carbs",
  "criteria": {
    "protein": { "min": 20 },
    "carbs": { "max": 30 }
  },
  "message": "Query parsed successfully"
}
```

**Use Cases:**
- Testing query interpretation
- Debugging unexpected search results
- Understanding criteria extraction
- Training users on effective query syntax

---

#### 2. Search Food Items

Search for food items using natural language queries with full pagination support.

**Endpoint:** `POST /api/food/search`

**Request Body:**
```json
{
  "query": "I want something with at least 30g of protein and less than 500 calories",
  "limit": 10,
  "page": 1
}
```

**Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| query | string | Yes | - | Natural language food query |
| limit | number | No | 10 | Results per page (1-100) |
| page | number | No | 1 | Page number (1+) |

**Response:** `200 OK`
```json
{
  "success": true,
  "query": "I want something with at least 30g of protein and less than 500 calories",
  "criteria": {
    "protein": { "min": 30 },
    "calories": { "max": 500 }
  },
  "results": [
    {
      "_id": "65a1b2c3d4e5f6789012345",
      "item": "Grilled Chicken Breast",
      "calories": 165,
      "protein": 31,
      "total_fat": 3.6,
      "total_carb": 0,
      "fiber": 0,
      "sugar": 0,
      "sodium": 74,
      "sat_fat": 1,
      "trans_fat": 0,
      "cholesterol": 85,
      "restaurant": "Subway"
    },
    {
      "_id": "65a1b2c3d4e5f6789012346",
      "item": "Tuna Salad",
      "calories": 280,
      "protein": 35,
      "total_fat": 12,
      "total_carb": 8,
      "fiber": 2,
      "sugar": 3,
      "sodium": 450,
      "sat_fat": 2,
      "trans_fat": 0,
      "cholesterol": 45,
      "restaurant": "Panera Bread"
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

**Response Fields:**
- `success` (boolean): Operation success indicator
- `query` (string): Original query string
- `criteria` (object): Parsed nutritional criteria
- `results` (array): Array of matching food items
- `pagination` (object): Pagination metadata
- `message` (string): Human-readable result summary

---

#### 3. Get Food Recommendations

Get smart food recommendations with intelligent sorting based on your preferences.

**Endpoint:** `POST /api/food/recommend`

**Request Body:**
```json
{
  "query": "I need a high protein snack",
  "limit": 5
}
```

**Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| query | string | Yes | - | Natural language food query |
| limit | number | No | 5 | Number of recommendations (1-20) |

**Response:** `200 OK`
```json
{
  "success": true,
  "query": "I need a high protein snack",
  "criteria": {
    "protein": { "min": 15 }
  },
  "recommendations": [
    {
      "_id": "65a1b2c3d4e5f6789012347",
      "item": "Greek Yogurt Parfait",
      "protein": 20,
      "calories": 150,
      "total_fat": 4,
      "total_carb": 18,
      "restaurant": "Starbucks"
    },
    {
      "_id": "65a1b2c3d4e5f6789012348",
      "item": "Protein Box",
      "protein": 18,
      "calories": 220,
      "total_fat": 8,
      "total_carb": 15,
      "restaurant": "Starbucks"
    }
  ],
  "count": 5,
  "message": "Here are 5 recommendations based on your preferences"
}
```

**Intelligent Sorting Logic:**
- **High protein queries** → Sorted by protein (descending)
- **Low calorie queries** → Sorted by calories (ascending)
- **Low fat queries** → Sorted by fat (ascending)
- **Low carb queries** → Sorted by carbs (ascending)
- **High fiber queries** → Sorted by fiber (descending)

---

#### 4. Get Food Statistics

Get comprehensive statistics about food items matching your criteria.

**Endpoint:** `POST /api/food/stats`

**Request Body:**
```json
{
  "query": "low calorie desserts"
}
```

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| query | string | Yes | Natural language food query |

**Response:** `200 OK`
```json
{
  "success": true,
  "query": "low calorie desserts",
  "criteria": {
    "calories": { "max": 300 }
  },
  "stats": {
    "count": 15,
    "averages": {
      "calories": 245,
      "protein": 5,
      "fat": 8,
      "carbs": 35,
      "fiber": 2,
      "sugar": 18
    },
    "ranges": {
      "calories": {
        "min": 150,
        "max": 300
      },
      "protein": {
        "min": 2,
        "max": 10
      },
      "fat": {
        "min": 3,
        "max": 15
      },
      "carbs": {
        "min": 20,
        "max": 45
      }
    }
  },
  "message": "Statistics for 15 items matching your criteria"
}
```

**Use Cases:**
- Understanding nutritional ranges in search results
- Comparing average values across categories
- Making informed dietary decisions
- Analyzing restaurant menu nutritional profiles

---

### Future Endpoints (Planned)

The following endpoints are planned for future releases:

#### User Management
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/preferences` - Update dietary preferences

#### Cart Management
- `GET /api/cart` - Get user's cart
- `POST /api/cart/items` - Add item to cart
- `PUT /api/cart/items/:id` - Update cart item quantity
- `DELETE /api/cart/items/:id` - Remove item from cart
- `DELETE /api/cart` - Clear cart

#### Order Management
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get user's order history
- `GET /api/orders/:id` - Get specific order details
- `PUT /api/orders/:id/cancel` - Cancel order

#### Restaurant Management
- `GET /api/restaurants` - List all restaurants
- `GET /api/restaurants/:id` - Get restaurant details
- `GET /api/restaurants/:id/menu` - Get restaurant menu

---

## Request/Response Formats

### Content Type
All requests must include the `Content-Type: application/json` header.

### Request Format
```http
POST /api/food/search HTTP/1.1
Host: localhost:4000
Content-Type: application/json

{
  "query": "high protein low carb",
  "limit": 10,
  "page": 1
}
```

### Success Response Format
All successful responses follow this structure:
```json
{
  "success": true,
  "query": "original query string",
  "criteria": { /* parsed criteria */ },
  "results": [ /* data array */ ],
  "message": "descriptive message"
}
```

### Supported Nutritional Fields

The LLM can extract and filter by these nutritional parameters:

| Field | Database Field | Unit | Example Query |
|-------|----------------|------|---------------|
| Calories | `calories` | kcal | "under 500 calories" |
| Protein | `protein` | grams | "at least 30g of protein" |
| Fat | `total_fat` | grams | "low fat" |
| Carbohydrates | `total_carb` | grams | "low carb meal" |
| Fiber | `fiber` | grams | "high fiber breakfast" |
| Sugar | `sugar` | grams | "low sugar dessert" |
| Sodium | `sodium` | mg | "low sodium option" |
| Cholesterol | `cholesterol` | mg | "low cholesterol" |
| Saturated Fat | `sat_fat` | grams | "low saturated fat" |
| Trans Fat | `trans_fat` | grams | "no trans fat" |

---

## Error Handling

### Error Response Format
All error responses follow this structure:
```json
{
  "success": false,
  "error": "error_type",
  "message": "Human-readable error description"
}
```

### HTTP Status Codes

| Code | Status | Description |
|------|--------|-------------|
| 200 | OK | Request successful |
| 400 | Bad Request | Invalid request parameters |
| 404 | Not Found | Endpoint not found |
| 500 | Internal Server Error | Server-side error |
| 503 | Service Unavailable | Service temporarily down |

### Common Error Responses

#### 400 - Missing Query Parameter
```json
{
  "success": false,
  "error": "Query parameter is required and must be a string",
  "message": "Please provide a natural language food query in the request body"
}
```

**How to Fix:** Include a `query` field in the request body with a non-empty string value.

---

#### 400 - No Criteria Found
```json
{
  "success": false,
  "error": "No nutritional criteria found",
  "message": "Your query does not contain recognizable food or nutritional requirements. Please try again with a food-related query."
}
```

**How to Fix:** Make your query more specific with nutritional terms like "high protein," "low calorie," or specific numbers like "30g of protein."

**Example Valid Queries:**
- "high protein meal"
- "under 500 calories"
- "at least 20g of fiber"

---

#### 404 - No Results Found
```json
{
  "success": true,
  "query": "100g of protein and 50 calories",
  "criteria": {
    "protein": { "min": 100 },
    "calories": { "max": 50 }
  },
  "results": [],
  "pagination": {
    "total": 0,
    "page": 1,
    "limit": 10,
    "pages": 0
  },
  "message": "No items found matching your criteria"
}
```

**How to Fix:** Adjust your criteria to be less restrictive or verify the database contains matching items.

---

#### 500 - LLM Service Error
```json
{
  "success": false,
  "error": "Failed to parse query",
  "message": "The AI service is temporarily unavailable. Please try again."
}
```

**Possible Causes:**
- Groq API is down or unreachable
- Invalid or expired API key
- Network connectivity issues
- Rate limiting exceeded

**How to Fix:**
- Check Groq API status
- Verify `GROQ_API_KEY` environment variable
- Wait a few seconds and retry
- Check server logs for detailed error information

---

#### 500 - Database Connection Error
```json
{
  "success": false,
  "error": "Database connection failed",
  "message": "Unable to connect to the database. Please try again later."
}
```

**How to Fix:** Check MongoDB connection string and ensure database is running.

---

## Rate Limiting

### Groq API Limits
The Howl2Go API uses Groq's LLM service, which has the following limits:

**Free Tier:**
- 30 requests per minute
- 14,400 requests per day
- ~500ms-2s response time per LLM call

**Recommendations:**
- Implement client-side debouncing for search-as-you-type features
- Cache common queries on the client side
- Avoid unnecessary parse requests in production
- Consider request queuing for high-traffic applications

### Future Rate Limiting (Planned)
When authentication is implemented, we will add:
- Per-user rate limits: 100 requests/minute
- Per-IP rate limits: 200 requests/minute
- Burst allowance: 20 requests
- Rate limit headers in responses:
  ```
  X-RateLimit-Limit: 100
  X-RateLimit-Remaining: 95
  X-RateLimit-Reset: 1640000000
  ```

---

## Pagination

### How Pagination Works

The search endpoint supports cursor-based pagination with page numbers.

**Request:**
```json
{
  "query": "high protein",
  "limit": 10,
  "page": 2
}
```

**Response Pagination Object:**
```json
{
  "pagination": {
    "total": 45,      // Total items matching criteria
    "page": 2,        // Current page number
    "limit": 10,      // Items per page
    "pages": 5        // Total number of pages
  }
}
```

### Pagination Examples

#### First Page
```bash
curl -X POST http://localhost:4000/api/food/search \
  -H "Content-Type: application/json" \
  -d '{"query": "high protein", "limit": 10, "page": 1}'
```

#### Next Page
```bash
curl -X POST http://localhost:4000/api/food/search \
  -H "Content-Type: application/json" \
  -d '{"query": "high protein", "limit": 10, "page": 2}'
```

#### Last Page
```bash
# Calculate: pages = Math.ceil(total / limit)
curl -X POST http://localhost:4000/api/food/search \
  -H "Content-Type: application/json" \
  -d '{"query": "high protein", "limit": 10, "page": 5}'
```

### Best Practices
- Always use the same `limit` value across pages
- Store pagination state on the client
- Disable "Next" button when `page >= pages`
- Show total results count to users
- Consider infinite scrolling for mobile apps

---

## Query Syntax Guide

### Understanding Natural Language Queries

The LLM can understand various query formats. Here's a comprehensive guide:

### Simple Queries

**Format:** `[modifier] [nutrient]`

```
"high protein"
"low calorie"
"low fat dessert"
"high fiber breakfast"
```

**What the LLM understands:**
- `high` = above average (typically top 30%)
- `low` = below average (typically bottom 30%)
- Specific food categories: dessert, breakfast, lunch, dinner, snack

---

### Specific Number Queries

**Format:** `[comparison] [number] [unit] of [nutrient]`

```
"at least 30g of protein"
"less than 500 calories"
"under 20g of carbs"
"more than 10g of fiber"
"exactly 400 calories"
```

**Supported Comparisons:**
- `at least`, `minimum`, `min` = greater than or equal to
- `at most`, `maximum`, `max` = less than or equal to
- `less than`, `under` = less than
- `more than`, `over` = greater than
- `exactly`, `equal to` = equals

---

### Range Queries

**Format:** `between [number] and [number] [unit]`

```
"between 300 and 500 calories"
"20 to 30 grams of protein"
"from 10 to 15g of fiber"
```

---

### Complex Multi-Criteria Queries

**Format:** Combine multiple criteria with `and`, `with`, commas

```
"I want a meal with at least 25g of protein, less than 600 calories, and low sodium"
"Give me a high protein, low carb snack under 200 calories"
"I need something with lots of fiber and low sugar"
"Show me options with 30g+ protein, under 500 calories, and less than 10g of fat"
```

---

### Conversational Queries

The LLM understands natural conversation:

```
"What can I eat that's healthy and filling?"
"I'm trying to lose weight, what do you recommend?"
"I need energy for my workout"
"Something light for dinner"
"I want to gain muscle"
```

**Note:** These conversational queries are interpreted based on common nutritional knowledge:
- Weight loss = low calorie, high protein
- Muscle gain = high protein
- Energy = balanced macros
- Light = low calorie

---

### Query Examples by Goal

#### Weight Loss
```
"low calorie high protein meal"
"under 400 calories with lots of protein"
"filling meal under 500 calories"
```

#### Muscle Building
```
"high protein meal"
"at least 30g of protein"
"protein-rich breakfast"
```

#### Low Carb Diet
```
"low carb high fat"
"under 20g of carbs"
"keto-friendly meal"
```

#### Heart Health
```
"low sodium low cholesterol"
"low saturated fat"
"heart-healthy options"
```

#### Diabetes Management
```
"low sugar low carb"
"high fiber low glycemic"
"under 30g of carbs with fiber"
```

---

### Tips for Effective Queries

1. **Be Specific with Numbers**
   - Better: "at least 30g of protein"
   - Worse: "lots of protein"

2. **Combine Multiple Criteria**
   - Better: "high protein, low carb, under 500 calories"
   - Worse: Multiple separate searches

3. **Use Standard Units**
   - Calories: kcal (no unit needed)
   - Macros: grams (g)
   - Micronutrients: mg

4. **Include Context**
   - Better: "high protein breakfast under 400 calories"
   - Worse: "food"

5. **Test with /parse Endpoint**
   - Use `/api/food/parse` to see how your query is interpreted
   - Refine based on the returned criteria

---

## Code Examples

### cURL

#### Search Food Items
```bash
curl -X POST http://localhost:4000/api/food/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "high protein low carb meal",
    "limit": 5,
    "page": 1
  }'
```

#### Get Recommendations
```bash
curl -X POST http://localhost:4000/api/food/recommend \
  -H "Content-Type: application/json" \
  -d '{
    "query": "healthy breakfast with lots of protein",
    "limit": 3
  }'
```

#### Get Statistics
```bash
curl -X POST http://localhost:4000/api/food/stats \
  -H "Content-Type: application/json" \
  -d '{
    "query": "low calorie snacks"
  }'
```

#### Parse Query
```bash
curl -X POST http://localhost:4000/api/food/parse \
  -H "Content-Type: application/json" \
  -d '{
    "query": "I want something with at least 30g of protein and less than 500 calories"
  }'
```

#### Health Check
```bash
curl http://localhost:4000/api/health
```

---

### JavaScript/Node.js (Fetch API)

#### Basic Search Function
```javascript
async function searchFood(query, limit = 10, page = 1) {
  try {
    const response = await fetch('http://localhost:4000/api/food/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, limit, page })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Search failed:', error);
    throw error;
  }
}

// Usage
const results = await searchFood(
  "I want a high protein meal under 500 calories",
  10,
  1
);
console.log(results.results);
console.log(`Found ${results.pagination.total} total items`);
```

#### Get Recommendations
```javascript
async function getRecommendations(query, limit = 5) {
  const response = await fetch('http://localhost:4000/api/food/recommend', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, limit })
  });

  const data = await response.json();
  return data.recommendations;
}

// Usage
const recommendations = await getRecommendations(
  "high protein snack",
  5
);
recommendations.forEach(item => {
  console.log(`${item.item}: ${item.protein}g protein, ${item.calories} cal`);
});
```

#### Error Handling Example
```javascript
async function searchWithErrorHandling(query) {
  try {
    const response = await fetch('http://localhost:4000/api/food/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query })
    });

    const data = await response.json();

    if (!data.success) {
      // Handle API error
      console.error('API Error:', data.error);
      console.error('Message:', data.message);
      return null;
    }

    if (data.results.length === 0) {
      console.log('No results found. Try adjusting your criteria.');
      return null;
    }

    return data;
  } catch (error) {
    // Handle network error
    console.error('Network error:', error.message);
    return null;
  }
}
```

---

### Python (requests library)

#### Installation
```bash
pip install requests
```

#### Basic Search
```python
import requests

def search_food(query, limit=10, page=1):
    """Search for food items using natural language query."""
    url = "http://localhost:4000/api/food/search"
    payload = {
        "query": query,
        "limit": limit,
        "page": page
    }
    headers = {
        "Content-Type": "application/json"
    }

    try:
        response = requests.post(url, json=payload, headers=headers)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error: {e}")
        return None

# Usage
results = search_food("high protein low carb meal", limit=5)
if results and results['success']:
    print(f"Found {results['pagination']['total']} items")
    for item in results['results']:
        print(f"{item['item']}: {item['protein']}g protein, {item['calories']} cal")
```

#### Get Recommendations
```python
def get_recommendations(query, limit=5):
    """Get food recommendations based on preferences."""
    url = "http://localhost:4000/api/food/recommend"
    payload = {
        "query": query,
        "limit": limit
    }

    response = requests.post(url, json=payload)
    data = response.json()

    if data['success']:
        return data['recommendations']
    else:
        print(f"Error: {data['message']}")
        return []

# Usage
recommendations = get_recommendations("healthy breakfast", limit=3)
for item in recommendations:
    print(f"- {item['item']} ({item['restaurant']})")
```

#### Parse Query
```python
def parse_query(query):
    """Parse a query to see how it will be interpreted."""
    url = "http://localhost:4000/api/food/parse"
    payload = {"query": query}

    response = requests.post(url, json=payload)
    data = response.json()

    if data['success']:
        print(f"Query: {data['query']}")
        print(f"Criteria: {data['criteria']}")

    return data

# Usage
parse_query("I want at least 30g of protein and less than 500 calories")
```

#### Complete Example with Error Handling
```python
import requests
from typing import Optional, Dict, List

class Howl2GoAPI:
    def __init__(self, base_url="http://localhost:4000"):
        self.base_url = base_url
        self.headers = {"Content-Type": "application/json"}

    def _post(self, endpoint: str, payload: Dict) -> Optional[Dict]:
        """Make a POST request to the API."""
        try:
            response = requests.post(
                f"{self.base_url}{endpoint}",
                json=payload,
                headers=self.headers,
                timeout=10
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.Timeout:
            print("Request timed out")
            return None
        except requests.exceptions.RequestException as e:
            print(f"Request failed: {e}")
            return None

    def search(self, query: str, limit: int = 10, page: int = 1) -> Optional[Dict]:
        """Search for food items."""
        return self._post("/api/food/search", {
            "query": query,
            "limit": limit,
            "page": page
        })

    def recommend(self, query: str, limit: int = 5) -> Optional[List[Dict]]:
        """Get food recommendations."""
        data = self._post("/api/food/recommend", {
            "query": query,
            "limit": limit
        })
        return data.get('recommendations') if data else None

    def stats(self, query: str) -> Optional[Dict]:
        """Get statistics for matching items."""
        return self._post("/api/food/stats", {"query": query})

    def parse(self, query: str) -> Optional[Dict]:
        """Parse a query to see criteria."""
        return self._post("/api/food/parse", {"query": query})

# Usage
api = Howl2GoAPI()

# Search
results = api.search("high protein low carb", limit=5)
if results and results['success']:
    for item in results['results']:
        print(f"{item['item']}: {item['calories']} cal")

# Recommendations
recommendations = api.recommend("healthy snack")
if recommendations:
    for item in recommendations:
        print(f"- {item['item']}")
```

---

### React Frontend Integration

#### Custom Hook for API Calls
```javascript
// hooks/useHowl2GoAPI.js
import { useState, useCallback } from 'react';

export const useHowl2GoAPI = (baseURL = 'http://localhost:4000') => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const makeRequest = useCallback(async (endpoint, payload) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${baseURL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Request failed');
      }

      setLoading(false);
      return data;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return null;
    }
  }, [baseURL]);

  const searchFood = useCallback((query, limit = 10, page = 1) => {
    return makeRequest('/api/food/search', { query, limit, page });
  }, [makeRequest]);

  const getRecommendations = useCallback((query, limit = 5) => {
    return makeRequest('/api/food/recommend', { query, limit });
  }, [makeRequest]);

  const getStats = useCallback((query) => {
    return makeRequest('/api/food/stats', { query });
  }, [makeRequest]);

  return {
    loading,
    error,
    searchFood,
    getRecommendations,
    getStats
  };
};
```

#### Search Component
```javascript
// components/FoodSearch.jsx
import { useState } from 'react';
import { useHowl2GoAPI } from '../hooks/useHowl2GoAPI';

function FoodSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [pagination, setPagination] = useState(null);
  const { loading, error, searchFood } = useHowl2GoAPI();

  const handleSearch = async (page = 1) => {
    const data = await searchFood(query, 10, page);
    if (data) {
      setResults(data.results);
      setPagination(data.pagination);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSearch(1);
  };

  return (
    <div className="food-search">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="What are you looking for? (e.g., high protein meal)"
          disabled={loading}
        />
        <button type="submit" disabled={loading || !query}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {error && (
        <div className="error-message">
          Error: {error}
        </div>
      )}

      {results.length > 0 && (
        <>
          <div className="results">
            <h2>Results ({pagination.total} items found)</h2>
            <ul>
              {results.map(item => (
                <li key={item._id}>
                  <h3>{item.item}</h3>
                  <p>{item.restaurant}</p>
                  <div className="nutrition">
                    <span>{item.calories} cal</span>
                    <span>{item.protein}g protein</span>
                    <span>{item.total_fat}g fat</span>
                    <span>{item.total_carb}g carbs</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {pagination.pages > 1 && (
            <div className="pagination">
              <button
                onClick={() => handleSearch(pagination.page - 1)}
                disabled={pagination.page === 1 || loading}
              >
                Previous
              </button>
              <span>Page {pagination.page} of {pagination.pages}</span>
              <button
                onClick={() => handleSearch(pagination.page + 1)}
                disabled={pagination.page >= pagination.pages || loading}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {!loading && results.length === 0 && pagination && (
        <div className="no-results">
          No items found. Try adjusting your search criteria.
        </div>
      )}
    </div>
  );
}

export default FoodSearch;
```

#### Recommendations Component
```javascript
// components/Recommendations.jsx
import { useState, useEffect } from 'react';
import { useHowl2GoAPI } from '../hooks/useHowl2GoAPI';

function Recommendations({ defaultQuery = "healthy meal" }) {
  const [recommendations, setRecommendations] = useState([]);
  const { loading, error, getRecommendations } = useHowl2GoAPI();

  useEffect(() => {
    const fetchRecommendations = async () => {
      const data = await getRecommendations(defaultQuery, 5);
      if (data) {
        setRecommendations(data.recommendations);
      }
    };

    fetchRecommendations();
  }, [defaultQuery, getRecommendations]);

  if (loading) return <div>Loading recommendations...</div>;
  if (error) return <div>Error loading recommendations: {error}</div>;

  return (
    <div className="recommendations">
      <h2>Recommended for You</h2>
      <div className="recommendation-grid">
        {recommendations.map(item => (
          <div key={item._id} className="recommendation-card">
            <h3>{item.item}</h3>
            <p className="restaurant">{item.restaurant}</p>
            <div className="nutrition-summary">
              <div className="nutrition-item">
                <span className="label">Calories</span>
                <span className="value">{item.calories}</span>
              </div>
              <div className="nutrition-item">
                <span className="label">Protein</span>
                <span className="value">{item.protein}g</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Recommendations;
```

---

### TypeScript Example

```typescript
// types/api.ts
export interface FoodItem {
  _id: string;
  item: string;
  calories: number;
  protein: number;
  total_fat: number;
  total_carb: number;
  fiber: number;
  sugar: number;
  sodium: number;
  sat_fat: number;
  trans_fat: number;
  cholesterol: number;
  restaurant: string;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface SearchResponse {
  success: boolean;
  query: string;
  criteria: Record<string, any>;
  results: FoodItem[];
  pagination: Pagination;
  message: string;
}

export interface RecommendationResponse {
  success: boolean;
  query: string;
  criteria: Record<string, any>;
  recommendations: FoodItem[];
  count: number;
  message: string;
}

// api/howl2go.ts
class Howl2GoAPI {
  private baseURL: string;

  constructor(baseURL: string = 'http://localhost:4000') {
    this.baseURL = baseURL;
  }

  private async post<T>(endpoint: string, payload: any): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async search(
    query: string,
    limit: number = 10,
    page: number = 1
  ): Promise<SearchResponse> {
    return this.post<SearchResponse>('/api/food/search', {
      query,
      limit,
      page
    });
  }

  async recommend(
    query: string,
    limit: number = 5
  ): Promise<RecommendationResponse> {
    return this.post<RecommendationResponse>('/api/food/recommend', {
      query,
      limit
    });
  }
}

export default new Howl2GoAPI();
```

---

## Best Practices

### 1. Query Optimization

**Do:**
- Use specific nutritional criteria: "at least 30g of protein"
- Combine multiple criteria in one query
- Test queries with `/parse` endpoint first
- Cache common query results on client

**Don't:**
- Use overly generic queries: "food"
- Make separate API calls for each criterion
- Send queries on every keystroke (use debouncing)

---

### 2. Error Handling

**Do:**
- Always check the `success` field in responses
- Implement proper try-catch blocks
- Show user-friendly error messages
- Log errors for debugging
- Implement retry logic for network errors

**Don't:**
- Assume requests always succeed
- Expose raw error messages to users
- Ignore error responses

**Example:**
```javascript
try {
  const data = await searchFood(query);
  if (!data.success) {
    // Handle API error
    showUserMessage(data.message);
    return;
  }
  // Process results
} catch (error) {
  // Handle network error
  showUserMessage('Unable to connect. Please try again.');
}
```

---

### 3. Performance Optimization

**Client-Side:**
- Debounce search inputs (300-500ms delay)
- Cache results using localStorage or React Query
- Implement pagination instead of loading all results
- Use loading states for better UX

**Example Debouncing:**
```javascript
import { useState, useEffect } from 'react';

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

// Usage in component
const [searchQuery, setSearchQuery] = useState('');
const debouncedQuery = useDebounce(searchQuery, 500);

useEffect(() => {
  if (debouncedQuery) {
    searchFood(debouncedQuery);
  }
}, [debouncedQuery]);
```

---

### 4. User Experience

**Do:**
- Show loading indicators during API calls
- Display helpful error messages
- Provide query suggestions or examples
- Show total result counts
- Implement "no results" states with suggestions

**Don't:**
- Block UI during API calls
- Show technical error messages
- Leave users guessing about query format

---

### 5. Security Considerations

**Do:**
- Sanitize user inputs before sending to API
- Use environment variables for API URLs
- Implement CORS properly on backend
- Use HTTPS in production
- Validate response data structure

**Don't:**
- Expose API keys in frontend code
- Trust user input without validation
- Store sensitive data in localStorage

---

### 6. Testing

**Do:**
- Test with various query formats
- Test pagination edge cases (first, last, invalid pages)
- Test error scenarios
- Test with slow network conditions
- Use `/parse` endpoint for debugging

**Don't:**
- Only test happy path scenarios
- Ignore edge cases

---

## Troubleshooting

### Common Issues and Solutions

#### Issue: "GROQ_API_KEY is not set"

**Symptoms:**
- API returns 500 error
- Error message about missing API key
- LLM service unavailable

**Solution:**
1. Check `.env` file exists in backend root directory
2. Verify it contains: `GROQ_API_KEY=your_actual_key_here`
3. Ensure no spaces around `=` sign
4. Restart the server after adding key
5. Verify key is valid on Groq's platform

```bash
# Check .env file
cat "Proj 2/Howl2Go_backend/.env"

# Restart server
cd "Proj 2/Howl2Go_backend"
npm run dev
```

---

#### Issue: "Failed to parse query"

**Symptoms:**
- Search returns 500 error
- Error indicates LLM service failure
- Works sometimes but fails randomly

**Possible Causes:**
1. Groq API is down or rate limited
2. Network connectivity issues
3. Invalid API key
4. Query is too long or contains special characters

**Solution:**
1. Check Groq API status: https://status.groq.com
2. Verify network connectivity
3. Try a simpler query
4. Wait 60 seconds and retry (rate limiting)
5. Check server logs for detailed error

---

#### Issue: "No items found matching your criteria"

**Symptoms:**
- API returns empty results array
- Pagination shows 0 total items
- Query parses successfully but finds nothing

**Solution:**
1. Use `/parse` endpoint to check criteria:
   ```bash
   curl -X POST http://localhost:4000/api/food/parse \
     -H "Content-Type: application/json" \
     -d '{"query": "your query here"}'
   ```

2. Verify criteria makes sense:
   - Are numbers realistic? (e.g., 100g protein + 50 calories is impossible)
   - Try broader criteria
   - Check database has relevant items

3. Adjust query to be less restrictive:
   - Instead of: "100g protein and 50 calories"
   - Try: "high protein and low calorie"

---

#### Issue: CORS Errors in Browser

**Symptoms:**
```
Access to fetch at 'http://localhost:4000' from origin 'http://localhost:3000'
has been blocked by CORS policy
```

**Solution:**
1. Verify CORS is enabled in backend (it should be by default)
2. Check `src/app.js` includes: `app.use(cors());`
3. For specific origins, configure CORS:
   ```javascript
   app.use(cors({
     origin: 'http://localhost:3000',
     credentials: true
   }));
   ```
4. Clear browser cache and cookies
5. Try in incognito mode

---

#### Issue: Slow Response Times

**Symptoms:**
- Requests take 3+ seconds
- Timeout errors
- Poor user experience

**Causes:**
- LLM API call takes 500ms-2s
- Database query is slow
- Large result sets without pagination
- Network latency

**Solution:**
1. Use pagination with smaller limits (10-20 items)
2. Implement client-side caching
3. Add loading indicators
4. Consider caching common queries server-side
5. Optimize database indexes
6. Use recommendations endpoint (faster than full search)

---

#### Issue: Unexpected Criteria Parsing

**Symptoms:**
- Query "high protein" returns unexpected criteria
- Numbers interpreted wrong
- Missing criteria

**Solution:**
1. Use `/parse` endpoint to debug:
   ```bash
   curl -X POST http://localhost:4000/api/food/parse \
     -H "Content-Type: application/json" \
     -d '{"query": "your problematic query"}'
   ```

2. Be more explicit in queries:
   - Instead of: "lots of protein"
   - Use: "at least 25g of protein"

3. Avoid ambiguous terms:
   - "Very low" → "less than X grams"
   - "Really high" → "at least X grams"

---

#### Issue: MongoDB Connection Failed

**Symptoms:**
- Server fails to start
- Database connection errors
- "Unable to connect to database"

**Solution:**
1. Check MongoDB is running:
   ```bash
   # For local MongoDB
   mongosh
   ```

2. Verify connection string in `.env`:
   ```
   MONGODB_URI=mongodb://localhost:27017/food_delivery
   ```

3. Check network connectivity
4. Verify MongoDB service is running
5. Check database credentials

---

#### Issue: Pagination Not Working

**Symptoms:**
- Always returns same results regardless of page
- Page number doesn't affect results
- Invalid page numbers accepted

**Solution:**
1. Verify you're passing correct parameters:
   ```json
   {
     "query": "high protein",
     "limit": 10,
     "page": 2  // Must be integer, not string
   }
   ```

2. Check response pagination object:
   ```json
   {
     "pagination": {
       "total": 45,
       "page": 2,
       "limit": 10,
       "pages": 5
     }
   }
   ```

3. Ensure page number is within valid range (1 to pages)
4. Use same limit value across pagination requests

---

## API Versioning

### Current Version
**Version:** 1.0.0 (Unversioned URLs)

All current endpoints are unversioned and follow the format:
```
http://localhost:4000/api/food/search
```

### Future Versioning Strategy

When breaking changes are introduced, we will implement URL versioning:

**Format:**
```
http://localhost:4000/api/v1/food/search  (Current)
http://localhost:4000/api/v2/food/search  (Future)
```

**Version Support Policy (Future):**
- Current version: Fully supported
- Previous version: Supported for 6 months
- Legacy versions: Best effort, deprecated
- Breaking changes trigger major version bump

### What Constitutes a Breaking Change

**Breaking Changes (require new version):**
- Removing endpoints
- Removing response fields
- Changing field data types
- Changing authentication requirements
- Modifying required parameters

**Non-Breaking Changes (no version change):**
- Adding new endpoints
- Adding optional parameters
- Adding new response fields
- Performance improvements
- Bug fixes

### Staying Updated

Subscribe to our changelog and API updates:
- GitHub Releases: https://github.com/SE_Project_Grp_27/Howl2Go
- API Changelog: `Proj 2/docs/CHANGELOG.md`

---

## Postman Collection

### Coming Soon

We're creating a comprehensive Postman collection with:
- Pre-configured requests for all endpoints
- Example queries and responses
- Environment variables for easy switching between dev/prod
- Automated tests
- Documentation

### Create Your Own Collection

While we prepare the official collection, you can create your own:

1. **Create New Collection** in Postman
2. **Add Environment Variables:**
   ```
   base_url: http://localhost:4000
   api_prefix: /api
   ```

3. **Add Requests:**

   **Search Food**
   ```
   POST {{base_url}}{{api_prefix}}/food/search
   Headers: Content-Type: application/json
   Body (raw JSON):
   {
     "query": "high protein low carb",
     "limit": 10,
     "page": 1
   }
   ```

   **Get Recommendations**
   ```
   POST {{base_url}}{{api_prefix}}/food/recommend
   Headers: Content-Type: application/json
   Body (raw JSON):
   {
     "query": "healthy breakfast",
     "limit": 5
   }
   ```

   **Parse Query**
   ```
   POST {{base_url}}{{api_prefix}}/food/parse
   Headers: Content-Type: application/json
   Body (raw JSON):
   {
     "query": "at least 30g protein under 500 calories"
   }
   ```

   **Get Statistics**
   ```
   POST {{base_url}}{{api_prefix}}/food/stats
   Headers: Content-Type: application/json
   Body (raw JSON):
   {
     "query": "low calorie desserts"
   }
   ```

   **Health Check**
   ```
   GET {{base_url}}{{api_prefix}}/health
   ```

---

## Additional Resources

### Documentation
- **LLM Integration Guide**: `Proj 2/Howl2Go_backend/LLM_API_DOCUMENTATION.md`
- **Backend README**: `Proj 2/Howl2Go_backend/README.md`
- **Frontend README**: `Howl2Go_frontend/README.md`

### External Links
- **Groq Documentation**: https://console.groq.com/docs
- **MongoDB Atlas**: https://www.mongodb.com/docs/atlas/
- **Express.js Guide**: https://expressjs.com/

### Support
- **GitHub Issues**: https://github.com/SE_Project_Grp_27/Howl2Go/issues
- **Project Repository**: https://github.com/SE_Project_Grp_27/Howl2Go

---

## Contributing

We welcome contributions to improve the API! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

See `CONTRIBUTING.md` for detailed guidelines.

---

## License

Part of Howl2Go project - SE_Project_Grp_27

---

## Changelog

### Version 1.0.0 (Current)
- Initial API release
- Natural language food search
- Smart recommendations
- Statistical analysis
- Pagination support
- Groq LLM integration
- MongoDB backend
- Health check endpoint

### Planned Features
- User authentication (JWT)
- Order management
- Cart functionality
- User preferences
- Restaurant management
- Advanced filtering
- Real-time updates
- GraphQL API option

---

**Last Updated:** October 2025
**API Version:** 1.0.0
**Documentation Version:** 1.0.0
