# Database Schema Documentation

This document describes the database schema used in the HOWL2GO application.

## Table of Contents

- [Overview](#overview)
- [FastFoodItem Collection](#fastfooditem-collection)
- [Field Descriptions](#field-descriptions)
- [Indexes](#indexes)
- [Example Documents](#example-documents)
- [Data Sources](#data-sources)
- [Usage in Queries](#usage-in-queries)

---

## Overview

HOWL2GO uses MongoDB as its database system. The application stores fast food nutritional information in a single collection called `FastFoodItem`.

**Database Type:** MongoDB (NoSQL)
**ODM (Object Document Mapper):** Mongoose v8.x
**Collection Name:** `fastfooditems`
**Model File:** `src/models/FastFoodItem.js`

---

## FastFoodItem Collection

The `FastFoodItem` collection stores nutritional information for menu items from various fast food restaurants.

### Schema Definition

```javascript
{
  company: String (required, indexed),
  item: String (required),
  calories: Number,
  caloriesFromFat: Number,
  totalFat: Number,
  saturatedFat: Number,
  transFat: Number,
  cholesterol: Number,
  sodium: Number,
  carbs: Number,
  fiber: Number,
  sugars: Number,
  protein: Number,
  weightWatchersPoints: Number,
  createdAt: Date (auto-generated),
  updatedAt: Date (auto-generated)
}
```

---

## Field Descriptions

### Required Fields

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| `company` | String | Restaurant/brand name (e.g., "McDonald's") | Required, Trimmed, Indexed |
| `item` | String | Menu item name (e.g., "Big Mac") | Required, Trimmed |

### Nutritional Fields

All nutritional fields are optional (default: `null`) and stored as Numbers.

| Field | Type | Unit | Description |
|-------|------|------|-------------|
| `calories` | Number | kcal | Total energy content |
| `caloriesFromFat` | Number | kcal | Calories derived from fat |
| `totalFat` | Number | grams (g) | Total fat content |
| `saturatedFat` | Number | grams (g) | Saturated fat content |
| `transFat` | Number | grams (g) | Trans fat content |
| `cholesterol` | Number | milligrams (mg) | Cholesterol content |
| `sodium` | Number | milligrams (mg) | Sodium content |
| `carbs` | Number | grams (g) | Total carbohydrates |
| `fiber` | Number | grams (g) | Dietary fiber |
| `sugars` | Number | grams (g) | Sugar content |
| `protein` | Number | grams (g) | Protein content |
| `weightWatchersPoints` | Number | points | Weight Watchers point value |

### System Fields (Auto-generated)

| Field | Type | Description |
|-------|------|-------------|
| `_id` | ObjectId | MongoDB unique identifier (auto-generated) |
| `createdAt` | Date | Timestamp when document was created |
| `updatedAt` | Date | Timestamp when document was last updated |

---

## Indexes

The schema includes several indexes to optimize query performance:

### 1. Single Field Index
```javascript
{ company: 1 }  // Ascending index on company field
```
**Purpose:** Fast filtering by restaurant brand

### 2. Compound Index
```javascript
{ company: 1, item: 1 }  // Compound index
```
**Purpose:** Efficient queries when filtering by both company and item name

### 3. Text Index
```javascript
{ item: 'text', company: 'text' }  // Full-text search index
```
**Purpose:** Enables text search across item names and company names using MongoDB's `$text` operator

**Example Text Search:**
```javascript
db.fastfooditems.find({ $text: { $search: "Big Mac" } })
```

---

## Example Documents

### Example 1: McDonald's Big Mac

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "company": "McDonald's",
  "item": "Big Mac",
  "calories": 540,
  "caloriesFromFat": 250,
  "totalFat": 28,
  "saturatedFat": 10,
  "transFat": 1,
  "cholesterol": 80,
  "sodium": 1040,
  "carbs": 46,
  "fiber": 3,
  "sugars": 9,
  "protein": 25,
  "weightWatchersPoints": 490,
  "createdAt": "2025-01-15T10:30:00.000Z",
  "updatedAt": "2025-01-15T10:30:00.000Z"
}
```

### Example 2: Burger King Whopper

```json
{
  "_id": "507f1f77bcf86cd799439012",
  "company": "Burger King",
  "item": "Whopper",
  "calories": 660,
  "caloriesFromFat": 360,
  "totalFat": 40,
  "saturatedFat": 12,
  "transFat": 1.5,
  "cholesterol": 90,
  "sodium": 980,
  "carbs": 49,
  "fiber": 2,
  "sugars": 11,
  "protein": 28,
  "weightWatchersPoints": 640,
  "createdAt": "2025-01-15T10:30:00.000Z",
  "updatedAt": "2025-01-15T10:30:00.000Z"
}
```

### Example 3: Item with Null Values

```json
{
  "_id": "507f1f77bcf86cd799439013",
  "company": "Taco Bell",
  "item": "Crunchy Taco",
  "calories": 170,
  "caloriesFromFat": 90,
  "totalFat": 10,
  "saturatedFat": 3.5,
  "transFat": null,
  "cholesterol": 25,
  "sodium": 310,
  "carbs": 13,
  "fiber": 3,
  "sugars": 1,
  "protein": 8,
  "weightWatchersPoints": null,
  "createdAt": "2025-01-15T10:30:00.000Z",
  "updatedAt": "2025-01-15T10:30:00.000Z"
}
```

---

## Data Sources

The FastFoodItem collection is populated from CSV data files located in:
```
data/fast-food/FastFoodNutritionMenuV3.csv
```

### Supported Restaurant Chains

- **McDonald's**
- **Burger King**
- **Wendy's**
- **KFC**
- **Taco Bell**
- **Pizza Hut**

### CSV to Schema Mapping

| CSV Column | Database Field | Notes |
|------------|----------------|-------|
| Company | `company` | String |
| Item | `item` | String |
| Calories | `calories` | Number |
| Calories from Fat | `caloriesFromFat` | Number |
| Total Fat (g) | `totalFat` | Number |
| Saturated Fat (g) | `saturatedFat` | Number |
| Trans Fat (g) | `transFat` | Number |
| Cholesterol (mg) | `cholesterol` | Number |
| Sodium (mg) | `sodium` | Number |
| Carbs (g) | `carbs` | Number |
| Fiber (g) | `fiber` | Number |
| Sugars (g) | `sugars` | Number |
| Protein (g) | `protein` | Number |
| Weight Watchers Pnts | `weightWatchersPoints` | Number |

---

## Usage in Queries

### Basic Queries

**Find all items from McDonald's:**
```javascript
FastFoodItem.find({ company: "McDonald's" })
```

**Find items with less than 500 calories:**
```javascript
FastFoodItem.find({ calories: { $lt: 500 } })
```

**Find high-protein items (>25g):**
```javascript
FastFoodItem.find({ protein: { $gte: 25 } })
```

### Complex Queries

**Find low-calorie, high-protein items:**
```javascript
FastFoodItem.find({
  calories: { $lte: 500 },
  protein: { $gte: 20 }
})
```

**Find items with low saturated fat:**
```javascript
FastFoodItem.find({
  saturatedFat: { $lte: 5 }
})
```

**Search for items by name:**
```javascript
FastFoodItem.find({
  item: { $regex: "burger", $options: "i" }
})
```

### Aggregation Queries

**Calculate average calories by restaurant:**
```javascript
FastFoodItem.aggregate([
  {
    $group: {
      _id: "$company",
      avgCalories: { $avg: "$calories" },
      count: { $sum: 1 }
    }
  }
])
```

**Find nutritional ranges:**
```javascript
FastFoodItem.aggregate([
  {
    $group: {
      _id: null,
      minCalories: { $min: "$calories" },
      maxCalories: { $max: "$calories" },
      avgProtein: { $avg: "$protein" }
    }
  }
])
```

---

## LLM Query Integration

The HOWL2GO application uses an LLM (Large Language Model) to parse natural language queries into MongoDB queries. The LLM service maps user-friendly criteria to database field names:

### Field Mapping (LLM → Database)

| User Query Term | Database Field | Example |
|----------------|----------------|---------|
| "calories" | `calories` | "less than 500 calories" |
| "protein" | `protein` | "at least 25g protein" |
| "totalFat" | `totalFat` | "less than 10g fat" |
| "saturatedFat" | `saturatedFat` | "low saturated fat" |
| "carbs" | `carbs` | "under 50g carbs" |
| "sugars" | `sugars` | "low sugar" |
| "sodium" | `sodium` | "maximum 2000mg sodium" |
| "fiber" | `fiber` | "high fiber" |
| "cholesterol" | `cholesterol` | "low cholesterol" |
| "transFat" | `transFat` | "no trans fat" |

### Example Natural Language to MongoDB Query

**User Input:**
"I want something with high protein and low saturated fat"

**LLM Extracted Criteria:**
```json
{
  "protein": { "min": 25 },
  "saturatedFat": { "max": 5 }
}
```

**Generated MongoDB Query:**
```javascript
{
  protein: { $gte: 25 },
  saturatedFat: { $lte: 5 }
}
```

---

## Validation Rules

### Data Integrity

1. **Required Fields:**
   - `company` and `item` must be present
   - Both are automatically trimmed of whitespace

2. **Null Values:**
   - All nutritional fields can be `null`
   - Null values indicate missing or unavailable data

3. **Data Types:**
   - All nutritional values are stored as Numbers
   - Non-numeric values are rejected by Mongoose validation

### Best Practices

1. **Querying Null Values:**
   - Use `{ field: { $ne: null } }` to filter out null values
   - Example: `{ calories: { $ne: null } }` finds items with calorie data

2. **Default Values:**
   - When aggregating, handle null values with `$ifNull`
   - Example: `{ $avg: { $ifNull: ["$calories", 0] } }`

3. **Performance:**
   - Use indexed fields (`company`) in query filters when possible
   - Combine multiple filters to reduce result set size

---

## Schema Updates and Migration

### Adding New Fields

To add a new field to the schema:

1. Update the schema in `src/models/FastFoodItem.js`
2. Existing documents will have `null` values for the new field
3. Re-import data if needed: `npm run import:fastfood`

### Modifying Existing Fields

- Schema changes do not automatically update existing documents
- Use MongoDB migration scripts if bulk updates are needed
- Consider backward compatibility when changing field types

---

## Related Files

- **Model Definition:** `src/models/FastFoodItem.js`
- **Import Script:** `src/scripts/importFastFoodData.js`
- **Sample Data:** `data/fast-food/FastFoodNutritionMenuV3.csv`
- **LLM Service:** `src/services/llm.service.js`
- **Food Controller:** `src/controllers/food.controller.js`

---

## Database Statistics

To get statistics about the collection:

```javascript
// Count total documents
db.fastfooditems.countDocuments()

// Get collection stats
db.fastfooditems.stats()

// Count items per company
db.fastfooditems.aggregate([
  { $group: { _id: "$company", count: { $sum: 1 } } }
])
```

---

## Troubleshooting

### Common Issues

**Issue: Missing nutritional data**
- Solution: Some items may have `null` values for certain fields. Filter with `{ field: { $ne: null } }`

**Issue: Query performance is slow**
- Solution: Ensure you're using indexed fields (`company`) in your queries. Consider adding compound indexes for frequently queried field combinations.

**Issue: Text search not working**
- Solution: Verify the text index exists: `db.fastfooditems.getIndexes()`

---

## Further Reading

- [Mongoose Schema Documentation](https://mongoosejs.com/docs/guide.html)
- [MongoDB Query Operators](https://www.mongodb.com/docs/manual/reference/operator/query/)
- [MongoDB Indexing Strategies](https://www.mongodb.com/docs/manual/indexes/)
