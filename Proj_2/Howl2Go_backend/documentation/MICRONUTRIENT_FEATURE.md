# Micronutrient Extension Feature

## Overview

The food database now includes **7 micronutrient fields** for all 1,150+ fast food items, enabling users to search for meals based on specific vitamin and mineral content beyond traditional macronutrients.

## Available Micronutrients

All values are in **milligrams (mg)**:

| Micronutrient | Field Name  | Unit | Description                                         | Typical Range |
| ------------- | ----------- | ---- | --------------------------------------------------- | ------------- |
| Iron          | `iron`      | mg   | Essential for blood production and oxygen transport | 0.5 - 5 mg    |
| Potassium     | `potassium` | mg   | Supports heart and muscle function                  | 100 - 800 mg  |
| Magnesium     | `magnesium` | mg   | Supports bone health and energy production          | 10 - 60 mg    |
| Calcium       | `calcium`   | mg   | Essential for bone health and muscle function       | 50 - 500 mg   |
| Vitamin A     | `vitaminA`  | mg   | Supports vision and immune function                 | 0 - 0.3 mg    |
| Vitamin C     | `vitaminC`  | mg   | Antioxidant, supports immune system                 | 0 - 100 mg    |
| Vitamin D     | `vitaminD`  | mg   | Supports bone health and immunity                   | 0 - 3 mg      |

## Data Coverage

- **Restaurants**: McDonald's, Burger King, Wendy's, KFC, Taco Bell, Pizza Hut
- **Total Items**: 1,150+ menu items
- **Coverage**: 100% of items have micronutrient data
- **Data Source**: Based on USDA nutritional database and restaurant nutritional information

## Natural Language Query Examples

### Single Micronutrient

```
"Show me meals high in iron"
"I need more calcium"
"Give me foods rich in vitamin C"
"High potassium options"
"Meals with vitamin D"
```

### Specific Amounts

```
"At least 200mg of calcium"
"Foods with more than 3mg of iron"
"Vitamin C over 20mg"
"Between 300 and 500mg of potassium"
```

### Combined Queries

```
"Low sodium but high in potassium"
"High protein with good iron content"
"Calcium and vitamin D for bone health"
"Foods rich in both vitamin C and calcium"
```

### Health-Focused Queries

```
"Heart healthy meals" (interprets as low sodium, high potassium)
"Bone health foods" (interprets as high calcium, vitamin D)
"Immune boosting meals" (interprets as high vitamin C, A)
"Energy-boosting options" (interprets as magnesium, iron)
```

## API Response Format

### Request

```bash
curl -X POST http://localhost:4000/api/food/search \
  -H "Content-Type: application/json" \
  -d '{"query": "high iron meals", "limit": 3}'
```

### Response

```json
{
  "success": true,
  "query": "high iron meals",
  "criteria": {
    "iron": { "min": 2 }
  },
  "results": [
    {
      "_id": "...",
      "company": "McDonald's",
      "item": "Quarter Pounder with Cheese",
      "calories": 520,
      "protein": 30,
      "totalFat": 26,
      "carbs": 41,
      "sodium": 1110,
      "iron": 4.5,
      "potassium": 480,
      "magnesium": 42,
      "calcium": 260,
      "vitaminA": 0.06,
      "vitaminC": 2,
      "vitaminD": 0.8,
      "price": 5.2
    }
  ],
  "pagination": {
    "total": 45,
    "page": 1,
    "limit": 3,
    "pages": 15
  },
  "message": "Found 3 items matching your criteria"
}
```

## Use Cases

### 1. Anemia Management (Iron)

**Query:** `"Show me high iron meals"`

Iron is essential for blood production. Useful for:

- People with iron deficiency
- Pregnant women
- Athletes
- Vegetarians/vegans looking for iron sources

### 2. Bone Health (Calcium & Vitamin D)

**Query:** `"Foods with calcium and vitamin D"`

Important for:

- Growing children and teens
- Older adults preventing osteoporosis
- Lactose-intolerant individuals
- Post-menopausal women

### 3. Heart Health (Potassium & Sodium)

**Query:** `"Low sodium but high potassium"`

Helps with:

- Blood pressure management
- Cardiovascular health
- Kidney health
- Reducing hypertension risk

### 4. Immune Support (Vitamin C & A)

**Query:** `"Foods rich in vitamin C"`

Benefits:

- Cold and flu prevention
- Wound healing
- Antioxidant protection
- Immune system support

### 5. Athletic Performance (Magnesium & Potassium)

**Query:** `"High protein with magnesium and potassium"`

Supports:

- Muscle function
- Energy production
- Electrolyte balance
- Recovery after exercise

## Database Schema

```javascript
// FastFoodItem Schema
{
  company: String,
  item: String,
  calories: Number,
  protein: Number,
  totalFat: Number,
  carbs: Number,
  // ... other macronutrients

  // Micronutrients (NEW!)
  iron: Number,           // mg
  potassium: Number,      // mg
  magnesium: Number,      // mg
  calcium: Number,        // mg
  vitaminA: Number,       // mg
  vitaminC: Number,       // mg
  vitaminD: Number,       // mg
}
```

## Import Data

### Import Command

```bash
npm run import:v4
```

### What It Does

1. Connects to MongoDB
2. Clears existing food data
3. Imports all 1,150+ items with micronutrient data
4. Creates indexes for efficient querying
5. Displays statistics

### Output Example

```
Connected to MongoDB
Cleared existing fast food items
Parsed 1150 items from CSV

✅ Successfully imported 1150 fast food items with micronutrient data

Companies in database: 6
  - McDonald's
  - Burger King
  - Wendy's
  - KFC
  - Taco Bell
  - Pizza Hut

Items with micronutrient data: 1150/1150
```

## Testing

### Run Test Suite

```bash
npm test llm.service
```

### Test Coverage

- **Total Tests**: 82
- **Micronutrient Tests**: 33
- **Pass Rate**: 100%
- **Code Coverage**: 91.8% on LLM service

### Test Categories

#### 1. Unit Tests (Micronutrient Query Building)

- Iron min/max/range constraints
- Potassium min/max constraints
- Magnesium min/max constraints
- Calcium min/max/range constraints
- Vitamin A min/max constraints
- Vitamin C min/max/range constraints
- Vitamin D min/max constraints

#### 2. Combined Query Tests

- Multiple micronutrients together
- All 7 micronutrients simultaneously
- Micronutrients + macronutrients (protein, calories)
- Micronutrients + item name search
- Comprehensive queries with everything

#### 3. Integration Tests (LLM Parsing)

- Natural language iron extraction
- Natural language calcium extraction
- Natural language vitamin C extraction
- Combined sodium + potassium queries
- Protein + iron + price queries

## Daily Value Reference

For nutritional context, here are typical Daily Values (DV):

| Nutrient  | Daily Value      | % DV in Typical Meal                  |
| --------- | ---------------- | ------------------------------------- |
| Iron      | 18 mg            | A meal with 2-3mg = 11-17% DV         |
| Potassium | 3,500 mg         | A meal with 300-500mg = 9-14% DV      |
| Magnesium | 400 mg           | A meal with 30-50mg = 8-13% DV        |
| Calcium   | 1,000 mg         | A meal with 200-300mg = 20-30% DV     |
| Vitamin A | 0.9 mg           | A meal with 0.05-0.1mg = 6-11% DV     |
| Vitamin C | 90 mg            | A meal with 10-20mg = 11-22% DV       |
| Vitamin D | 0.02 mg (20 mcg) | A meal with 0.5-1mg = 2500-5000% DV\* |

\*Note: Vitamin D values are often fortified and may appear high in dairy products.

## Technical Implementation

### Phase 1: Schema Extension

- Extended `FastFoodItem` model with 7 new fields
- All fields default to `null` if not available
- File: `src/models/FastFoodItem.js`

### Phase 2: Data Population

- Added micronutrient data for all 1,150+ items
- Values based on USDA database
- CSV format: `data/fast-food/FastFoodNutritionMenuV4.csv`

### Phase 3: Import Script

- Created `src/scripts/importFastFoodDataV4.js`
- Handles CSV parsing with micronutrient columns
- Validates and imports all fields

### Phase 4: LLM Service Update

- Updated prompt with micronutrient examples
- Extended field mapping for MongoDB queries
- Added unit specifications (all in mg)
- File: `src/services/llm.service.js`

### Phase 5: Comprehensive Testing

- 33 new micronutrient-specific tests
- Unit tests, integration tests, edge cases
- File: `src/__tests__/llm.service.test.js`

## Query Conversion Examples

The LLM automatically converts natural language to MongoDB queries:

| Natural Language             | LLM Criteria                                  | MongoDB Query                                   |
| ---------------------------- | --------------------------------------------- | ----------------------------------------------- |
| "high iron meals"            | `{iron: {min: 2}}`                            | `{iron: {$gte: 2}}`                             |
| "at least 200mg calcium"     | `{calcium: {min: 200}}`                       | `{calcium: {$gte: 200}}`                        |
| "vitamin C between 10-50mg"  | `{vitaminC: {min: 10, max: 50}}`              | `{vitaminC: {$gte: 10, $lte: 50}}`              |
| "low sodium, high potassium" | `{sodium: {max: 500}, potassium: {min: 300}}` | `{sodium: {$lte: 500}, potassium: {$gte: 300}}` |

## Future Enhancements

Potential additions for future versions:

### Additional Micronutrients

- Vitamin B6, B12, Folate
- Zinc, Selenium
- Phosphorus
- Niacin, Riboflavin, Thiamin

### Features

- Daily Value (DV) percentage calculations
- Nutritional goal tracking and progress
- Meal planning with micronutrient targets
- Dietary recommendations based on deficiencies
- Nutrient interaction warnings (e.g., calcium + iron)
- Personalized recommendations based on health conditions

### Data Improvements

- More detailed vitamin breakdowns
- Bioavailability information
- Nutrient density scores
- Allergen and dietary restriction tagging

## Troubleshooting

### "No micronutrient data found"

- Run `npm run import:v4` to import latest data
- Check MongoDB connection
- Verify CSV file exists: `data/fast-food/FastFoodNutritionMenuV4.csv`

### "LLM not recognizing micronutrient queries"

- Check GROQ_API_KEY is set in `.env`
- Verify server has latest code
- Try more specific queries: "at least 200mg calcium" vs "calcium"

### Tests failing

- Ensure MongoDB is running
- Check GROQ_API_KEY is valid
- Some tests may timeout if API is slow (increase timeout to 15s)

## Support

For questions or issues:

- Review test examples: `src/__tests__/llm.service.test.js`
- Check LLM service: `src/services/llm.service.js`
- Verify data import: `npm run import:v4`
- See API documentation: `documentation/LLM_API_DOCUMENTATION.md`

## License

Part of Howl2Go project - 2025Fall-Team11-Project3
