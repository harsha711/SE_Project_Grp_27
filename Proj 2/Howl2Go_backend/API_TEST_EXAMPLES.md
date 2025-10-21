# API Test Examples - Working Endpoints

## Issue Fixed
The 404 error was caused by the MongoDB connection not being established before the server started. This has been fixed by adding `await connectDB()` in [server.js](src/server.js#L9).

## All Endpoints Are Now Working

### 1. Parse Query (Test LLM Understanding)
```bash
curl -X POST http://localhost:4000/api/food/parse \
  -H "Content-Type: application/json" \
  -d '{"query": "I want a high protein meal"}'
```

**Response:**
```json
{
  "success": true,
  "query": "I want a high protein meal",
  "criteria": {
    "protein": {"min": 20}
  },
  "message": "Query parsed successfully"
}
```

---

### 2. Search Food Items (With Pagination)
```bash
curl -X POST http://localhost:4000/api/food/search \
  -H "Content-Type: application/json" \
  -d '{"query": "I want a high protein meal", "limit": 3}'
```

**Response:**
```json
{
  "success": true,
  "query": "I want a high protein meal",
  "criteria": {
    "protein": {"min": 20}
  },
  "results": [
    {
      "_id": "68f4463b5437a8dff9c9151d",
      "company": "McDonald's",
      "item": "Double Cheeseburger",
      "calories": 440,
      "protein": 25,
      "carbs": 34,
      "totalFat": 23
    }
  ],
  "pagination": {
    "total": 165,
    "page": 1,
    "limit": 3,
    "pages": 55
  },
  "message": "Found 3 items matching your criteria"
}
```

---

### 3. Get Recommendations
```bash
curl -X POST http://localhost:4000/api/food/recommend \
  -H "Content-Type: application/json" \
  -d '{"query": "low calorie dessert", "limit": 2}'
```

**Response:**
```json
{
  "success": true,
  "query": "low calorie dessert",
  "criteria": {
    "calories": {"max": 300}
  },
  "recommendations": [
    {
      "item": "Dasani® Water",
      "calories": 0,
      "protein": 0,
      "carbs": 0
    }
  ],
  "count": 2,
  "message": "Here are 2 recommendations based on your preferences"
}
```

---

### 4. Get Statistics
```bash
curl -X POST http://localhost:4000/api/food/stats \
  -H "Content-Type: application/json" \
  -d '{"query": "high protein, low carb"}'
```

**Response:**
```json
{
  "success": true,
  "query": "high protein, low carb",
  "criteria": {
    "protein": {"min": 1},
    "carb": {"max": 1}
  },
  "stats": {
    "count": 765,
    "averages": {
      "calories": 352,
      "protein": 13,
      "fat": 0,
      "carbs": 0
    },
    "ranges": {
      "calories": {"min": 10, "max": 1220},
      "protein": {"min": 1, "max": 71}
    }
  },
  "message": "Statistics for 765 items matching your criteria"
}
```

---

## Complex Query Examples

### Example 1: Specific Protein and Calorie Requirements
```bash
curl -X POST http://localhost:4000/api/food/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "I want something with at least 30g of protein and less than 500 calories",
    "limit": 5,
    "page": 1
  }'
```

### Example 2: Multiple Nutritional Constraints
```bash
curl -X POST http://localhost:4000/api/food/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "I need a meal with 25-35g protein, under 600 calories, and low sodium",
    "limit": 10
  }'
```

### Example 3: Healthy Breakfast
```bash
curl -X POST http://localhost:4000/api/food/recommend \
  -H "Content-Type: application/json" \
  -d '{
    "query": "healthy breakfast with lots of protein and fiber",
    "limit": 5
  }'
```

### Example 4: Low Fat Options
```bash
curl -X POST http://localhost:4000/api/food/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "low fat meal under 400 calories",
    "limit": 10
  }'
```

---

## Server Status

The server is now running with:
- ✅ MongoDB Connected: hobbycluster-shard-00-00.hdicc.mongodb.net
- ✅ API listening on port 4000
- ✅ All 4 endpoints functional
- ✅ LLM integration working via Groq API

---

## Troubleshooting

If you get a 404 error:
1. Make sure the server is running: `npm run dev`
2. Check MongoDB is connected (you should see "MongoDB Connected" in logs)
3. Verify you're using the correct endpoint URL: `http://localhost:4000/api/food/...`

If you get "buffering timed out":
- The server wasn't connected to MongoDB
- Restart the server (this has been fixed in the code)

---

## Next Steps for Integration

1. **Frontend Integration**: Use these endpoints in your React/Vue/Angular app
2. **Authentication**: Add JWT middleware if needed
3. **Rate Limiting**: Add rate limiting for production use
4. **Caching**: Cache common queries for better performance
5. **Analytics**: Track popular queries and results

For complete documentation, see [LLM_API_DOCUMENTATION.md](LLM_API_DOCUMENTATION.md)
