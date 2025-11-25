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
   - `recommendFood`: Gets smart recommendations

4. **Routes** (`src/routes/food.routes.js`)
   - Defines API endpoints and middleware chain

## API Endpoints

### 1. Get Recommendations

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

## Supported Nutritional Fields

The LLM can extract and filter by these nutritional criteria:

### Macronutrients
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

### Micronutrients (NEW!)
All micronutrient values are in milligrams (mg):

| Field | Database Field | Example Query |
|-------|----------------|---------------|
| Iron | `iron` | "high iron meals" |
| Potassium | `potassium` | "high potassium" |
| Magnesium | `magnesium` | "foods with magnesium" |
| Calcium | `calcium` | "at least 200mg calcium" |
| Vitamin A | `vitaminA` | "rich in vitamin A" |
| Vitamin C | `vitaminC` | "high vitamin C" |
| Vitamin D | `vitaminD` | "foods with vitamin D" |

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

### Micronutrient Queries (NEW!)
```
"Show me meals high in iron"
"I need more calcium, at least 200mg"
"Give me foods rich in vitamin C"
"Low sodium but high in potassium"
"High protein meal with good iron content under $10"
"Foods with calcium and vitamin D for bone health"
"High vitamin C meals for immune support"
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
cd "Proj_2/Howl2Go_backend"
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
curl -X POST http://localhost:4000/api/food/recommend \
  -H "Content-Type: application/json" \
  -d '{"query": "I want a high protein meal"}'
```

## Testing with cURL

### Get Recommendations
```bash
curl -X POST http://localhost:4000/api/food/recommend \
  -H "Content-Type: application/json" \
  -d '{
    "query": "healthy breakfast with lots of protein",
    "limit": 3
  }'
```

## Integration with Frontend

### JavaScript/Fetch Example
```javascript
async function getRecommendations(query) {
  const response = await fetch('http://localhost:4000/api/food/recommend', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: query,
      limit: 5
    })
  });

  const data = await response.json();
  return data;
}

// Usage
const results = await getRecommendations("I want a high protein meal under 500 calories");
console.log(results.recommendations);
```

### React Example
```javascript
import { useState } from 'react';

function FoodRecommendations() {
  const [query, setQuery] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleGetRecommendations = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:4000/api/food/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      const data = await response.json();
      setRecommendations(data.recommendations);
    } catch (error) {
      console.error('Get recommendations failed:', error);
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
      <button onClick={handleGetRecommendations} disabled={loading}>
        {loading ? 'Getting Recommendations...' : 'Get Recommendations'}
      </button>
      <ul>
        {recommendations.map(item => (
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

4. **Execute Recommendation Query** → Query MongoDB with intelligent sorting and return results

5. **Return Response** → Send formatted recommendations back to client

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
- Try relaxing your query constraints

## License
Part of Howl2Go project - SE_Project_Grp_27
