# LLM-Powered Food Search API Documentation

This API provides natural language food search capabilities using Groq's LLM (Large Language Model) integration. Users can search for food items using conversational queries instead of structured filters.

## Base URL
```
http://localhost:4000/api/food
```

## Architecture Overview

### Components

1. **LLM Service** (`src/services/llm.service.js`)
   - Handles Groq API integration
   - Converts natural language to structured criteria
   - Builds MongoDB queries from criteria

2. **Middleware** (`src/middleware/llm.middleware.js`)
   - `parseLLMQuery`: Parses user queries using LLM
   - `buildMongoQuery`: Converts criteria to MongoDB query
   - `validateCriteria`: Ensures meaningful criteria exists

3. **Controller** (`src/controllers/food.controller.js`)
   - `parseQuery`: Returns parsed criteria without search
   - `searchFood`: Searches database with pagination
   - `recommendFood`: Gets smart recommendations
   - `getFoodStats`: Returns statistics about matches

4. **Routes** (`src/routes/food.routes.js`)
   - Defines API endpoints and middleware chain

## API Endpoints

### 1. Parse Query (Test LLM)

Parse a natural language query to see structured criteria without searching.

**Endpoint:** `POST /api/food/parse`

**Request Body:**
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
  },
  "message": "Query parsed successfully"
}
```

**Use Cases:**
- Testing the LLM's understanding of queries
- Debugging query parsing
- Understanding what criteria will be generated

---

### 2. Search Food Items

Search for food items based on natural language query with pagination.

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
- `query` (required): Natural language food query
- `limit` (optional): Number of results per page (default: 10)
- `page` (optional): Page number (default: 1)

**Response:**
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
      "_id": "...",
      "item": "Grilled Chicken Breast",
      "calories": 165,
      "protein": 31,
      "total_fat": 3.6,
      "total_carb": 0,
      "restaurant": "Fast Food Chain"
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

**Example Queries:**
```javascript
// High protein, low calorie
{ "query": "I need a high protein meal under 400 calories" }

// Low fat dessert
{ "query": "Give me a dessert with low fat and low sugar" }

// Fiber-rich meal
{ "query": "I want something with at least 20g of fiber" }

// Complex query
{ "query": "I'm looking for a meal with 25-35g of protein, less than 600 calories, and low sodium" }
```

---

### 3. Get Recommendations

Get smart food recommendations based on preferences with intelligent sorting.

**Endpoint:** `POST /api/food/recommend`

**Request Body:**
```json
{
  "query": "I need a high protein snack",
  "limit": 5
}
```

**Parameters:**
- `query` (required): Natural language food query
- `limit` (optional): Number of recommendations (default: 5)

**Response:**
```json
{
  "success": true,
  "query": "I need a high protein snack",
  "criteria": {
    "protein": { "min": 15 }
  },
  "recommendations": [
    {
      "_id": "...",
      "item": "Greek Yogurt",
      "protein": 20,
      "calories": 120,
      "restaurant": "Chain A"
    }
  ],
  "count": 5,
  "message": "Here are 5 recommendations based on your preferences"
}
```

**Sorting Logic:**
- High protein queries → Sort by protein (descending)
- Low calorie queries → Sort by calories (ascending)
- Low fat queries → Sort by fat (ascending)

---

### 4. Get Statistics

Get statistics about food items matching your criteria.

**Endpoint:** `POST /api/food/stats`

**Request Body:**
```json
{
  "query": "low calorie desserts"
}
```

**Response:**
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
      "carbs": 35
    },
    "ranges": {
      "calories": {
        "min": 150,
        "max": 300
      },
      "protein": {
        "min": 2,
        "max": 10
      }
    }
  },
  "message": "Statistics for 15 items matching your criteria"
}
```

---

## Supported Nutritional Fields

The LLM can extract and filter by these nutritional criteria:

| Field | Database Field | Example Query |
|-------|----------------|---------------|
| Calories | `calories` | "under 500 calories" |
| Protein | `protein` | "at least 30g of protein" |
| Fat | `total_fat` | "low fat" |
| Carbs | `total_carb` | "low carb" |
| Fiber | `fiber` | "high fiber" |
| Sugar | `sugar` | "low sugar" |
| Sodium | `sodium` | "low sodium" |
| Cholesterol | `cholesterol` | "low cholesterol" |
| Saturated Fat | `sat_fat` | "low saturated fat" |
| Trans Fat | `trans_fat` | "no trans fat" |

## Query Examples

### Simple Queries
```
"high protein"
"low calorie"
"low fat dessert"
"high fiber breakfast"
```

### Specific Numbers
```
"at least 30g of protein"
"less than 500 calories"
"under 20g of carbs"
"more than 10g of fiber"
```

### Range Queries
```
"between 300 and 500 calories"
"20 to 30 grams of protein"
```

### Complex Queries
```
"I want a meal with at least 25g of protein, less than 600 calories, and low sodium"
"Give me a high protein, low carb snack under 200 calories"
"I need something with lots of fiber and low sugar"
```

## Error Responses

### 400 - Bad Request
**Missing Query:**
```json
{
  "success": false,
  "error": "Query parameter is required and must be a string",
  "message": "Please provide a natural language food query in the request body"
}
```

**No Criteria Found:**
```json
{
  "success": false,
  "error": "No nutritional criteria found",
  "message": "Your query does not contain recognizable food or nutritional requirements. Please try again with a food-related query."
}
```

### 500 - Server Error
```json
{
  "success": false,
  "error": "Failed to parse query",
  "message": "Error details here"
}
```

## Setup Instructions

### 1. Install Dependencies
```bash
cd "Proj 2/Howl2Go_backend"
npm install groq-sdk
```

### 2. Configure Environment Variables
Add to `.env` file:
```env
GROQ_API_KEY=your_groq_api_key_here
```

### 3. Start the Server
```bash
npm run dev
```

### 4. Test the API
```bash
curl -X POST http://localhost:4000/api/food/parse \
  -H "Content-Type: application/json" \
  -d '{"query": "I want a high protein meal"}'
```

## Testing with cURL

### Parse Query
```bash
curl -X POST http://localhost:4000/api/food/parse \
  -H "Content-Type: application/json" \
  -d '{
    "query": "I want something with at least 30g of protein and less than 500 calories"
  }'
```

### Search Food
```bash
curl -X POST http://localhost:4000/api/food/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "high protein low carb meal",
    "limit": 5,
    "page": 1
  }'
```

### Get Recommendations
```bash
curl -X POST http://localhost:4000/api/food/recommend \
  -H "Content-Type: application/json" \
  -d '{
    "query": "healthy breakfast with lots of protein",
    "limit": 3
  }'
```

### Get Statistics
```bash
curl -X POST http://localhost:4000/api/food/stats \
  -H "Content-Type: application/json" \
  -d '{
    "query": "low calorie snacks"
  }'
```

## Integration with Frontend

### JavaScript/Fetch Example
```javascript
async function searchFood(query) {
  const response = await fetch('http://localhost:4000/api/food/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: query,
      limit: 10,
      page: 1
    })
  });

  const data = await response.json();
  return data;
}

// Usage
const results = await searchFood("I want a high protein meal under 500 calories");
console.log(results.results);
```

### React Example
```javascript
import { useState } from 'react';

function FoodSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:4000/api/food/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      const data = await response.json();
      setResults(data.results);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="What are you looking for?"
      />
      <button onClick={handleSearch} disabled={loading}>
        {loading ? 'Searching...' : 'Search'}
      </button>
      <ul>
        {results.map(item => (
          <li key={item._id}>{item.item} - {item.calories} cal, {item.protein}g protein</li>
        ))}
      </ul>
    </div>
  );
}
```

## How It Works

1. **User sends natural language query** → "I want a high protein meal with low carbs"

2. **LLM Middleware parses query** → Converts to structured criteria:
   ```json
   {
     "protein": { "min": 20 },
     "carbs": { "max": 30 }
   }
   ```

3. **Build MongoDB Query** → Converts criteria to database query:
   ```javascript
   {
     "protein": { "$gte": 20 },
     "total_carb": { "$lte": 30 }
   }
   ```

4. **Execute Search** → Query MongoDB and return results

5. **Return Response** → Send formatted results back to client

## Performance Considerations

- **LLM API Call**: ~500ms-2s per request
- **Database Query**: ~10-100ms depending on complexity
- **Total Response Time**: ~1-3 seconds

### Optimization Tips
- Cache common queries
- Use pagination to limit result size
- Consider implementing request queuing for high traffic

## Security Notes

- **API Key Protection**: Keep `GROQ_API_KEY` in `.env` file, never commit to git
- **Input Validation**: Queries are validated before processing
- **Rate Limiting**: Consider adding rate limiting for production
- **Error Handling**: Errors are caught and logged without exposing internals

## Troubleshooting

### "GROQ_API_KEY is not set"
- Check `.env` file exists in backend root
- Verify `GROQ_API_KEY=your_key` is present
- Restart server after adding key

### "Failed to parse query"
- Check Groq API is accessible
- Verify API key is valid
- Check query is a valid string

### "No items found"
- Criteria might be too restrictive
- Database might not have matching items
- Use `/parse` endpoint to debug criteria

## License
Part of Howl2Go project - SE_Project_Grp_27
