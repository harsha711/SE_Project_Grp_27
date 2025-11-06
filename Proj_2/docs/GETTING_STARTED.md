# Getting Started with Howl2Go

Welcome to Howl2Go! This guide will help you get started with using the application to discover your perfect meal.

---

## Table of Contents

1. [What is Howl2Go?](#what-is-howl2go)
2. [How It Works](#how-it-works)
3. [Your First Search](#your-first-search)
4. [Understanding Results](#understanding-results)
5. [Advanced Search Tips](#advanced-search-tips)
6. [Next Steps](#next-steps)

---

## What is Howl2Go?

Howl2Go is an intelligent food discovery platform that helps you find exactly what you're craving without scrolling through endless menus.

### Key Benefits

- **No More Menu Browsing** - Just describe what you want
- **Smart Filtering** - Automatically filters by nutrition, calories, and dietary needs
- **Multi-Restaurant Search** - Find options across McDonald's, Burger King, Wendy's, KFC, and Taco Bell
- **Instant Results** - Get relevant matches in seconds

---

## How It Works

### The Traditional Way (Other Apps)
1. Open app
2. Browse restaurant list
3. Select a restaurant
4. Scroll through entire menu
5. Read each item description
6. Filter manually for dietary needs
7. Make a decision (maybe?)

### The Howl2Go Way
1. Open Howl2Go
2. Type what you're craving
3. See instant matches from all restaurants
4. Pick your favorite
5. Done!

---

## Your First Search

### Step 1: Access the Application

Open your web browser and navigate to:
```
http://localhost:3000
```
(For production: https://howl2go.app)

### Step 2: Understand the Interface

You'll see:
- **Header** - Navigation with Login and Dashboard buttons
- **Hero Section** - Animated headline and search bar
- **Search Bar** - Where the magic happens
- **Frequently Bought** - Popular items (demo)

### Step 3: Try a Simple Search

Click on the search bar and type a simple query:

```
burger
```

Press **Enter** or click the search icon.

### Step 4: View Your Results

You'll be redirected to the search results page showing:
- Food items matching "burger"
- Restaurant logos (McDonald's, Burger King, Wendy's)
- Calorie information
- Pricing (coming soon)
- "Add to Cart" buttons

---

## Understanding Results

### Food Item Card Components

Each result card shows:

**Top Section:**
- **Restaurant Logo** - Visual identification of where it's from
- **Item Name** - E.g., "Big Mac", "Whopper"

**Middle Section:**
- **Calorie Badge** - Quick nutritional reference
- **Description** - Item details (if available)

**Bottom Section:**
- **Price** - Cost information (placeholder)
- **Add to Cart Button** - Quick action to add item

### Result Ordering

Results are ordered by relevance to your query based on:
- Name matching
- Nutritional criteria matching
- Popularity (coming soon)

---

## Advanced Search Tips

### 1. Nutritional Queries

**High Protein:**
```
high protein meal
```
Returns items with protein > 20g

**Low Calorie:**
```
low calorie breakfast
```
Returns items with calories < 300

**Range Queries:**
```
300-500 calories
```
Returns items within that calorie range

### 2. Specific Nutrients

You can search by:
- **Calories:** "under 400 calories"
- **Protein:** "high protein"
- **Carbs:** "low carb"
- **Fat:** "low fat"
- **Sodium:** "low sodium"
- **Fiber:** "high fiber"
- **Sugar:** "low sugar"

### 3. Combined Criteria

**Example 1: Fitness-Focused**
```
high protein low carb lunch under 500 calories
```

**Example 2: Health-Conscious**
```
low sodium low fat dinner with high fiber
```

**Example 3: Specific Meal Time**
```
breakfast under 400 calories with at least 15g protein
```

### 4. Food Type + Criteria

**Example 1:**
```
chicken sandwich with low carbs
```

**Example 2:**
```
salad with high protein
```

**Example 3:**
```
burger under 600 calories
```

### 5. Dietary Restrictions

**Low Carb Diet:**
```
high protein low carb
```

**Weight Management:**
```
low calorie high fiber
```

**Heart Health:**
```
low sodium low saturated fat
```

---

## Search Examples by Use Case

### For Weight Loss
```
low calorie high protein filling meal
```

### For Muscle Building
```
high protein high calorie meal
```

### For Breakfast
```
breakfast under 400 calories
```

### For Lunch
```
lunch with balanced macros around 500 calories
```

### For Dinner
```
dinner high protein low carb
```

### For Snacks
```
snack under 200 calories
```

### For Keto Diet
```
very low carb high fat
```

### For Vegan Options (Future Feature)
```
vegetarian high protein
```

---

## Understanding Nutritional Information

### What Each Field Means

- **Calories** - Total energy content
- **Calories from Fat** - Energy from fat specifically
- **Total Fat** - All fat types combined
- **Saturated Fat** - Unhealthy fat type
- **Trans Fat** - Most unhealthy fat type
- **Cholesterol** - Affects heart health
- **Sodium** - Salt content (affects blood pressure)
- **Carbs** - Total carbohydrates
- **Fiber** - Digestive health
- **Sugars** - Simple carbohydrates
- **Protein** - Muscle building nutrient
- **Weight Watchers Points** - WW diet system points

### Typical Daily Values (2000 calorie diet)

- **Total Fat:** < 65g
- **Saturated Fat:** < 20g
- **Cholesterol:** < 300mg
- **Sodium:** < 2300mg
- **Carbs:** 300g
- **Fiber:** 25-30g
- **Protein:** 50-175g

---

## Tips for Best Results

### ✅ Do's

- **Be specific** - "high protein low carb" is better than just "healthy"
- **Use ranges** - "400-600 calories" gives you more options
- **Combine criteria** - Mix food type with nutritional needs
- **Use natural language** - The AI understands conversational queries

### ❌ Don'ts

- **Don't be too vague** - "food" or "something good" won't help
- **Don't use contradictions** - "low calorie high calorie" won't work
- **Don't expect exact matches** - "exactly 487 calories" is too specific
- **Don't use special characters** - Stick to letters and numbers

---

## Troubleshooting

### No Results Found

**Possible Causes:**
1. Query is too specific
2. No items match your criteria
3. Typo in search term

**Solutions:**
- Broaden your search
- Try different terms
- Check spelling

### Too Many Results

**Solutions:**
- Add more criteria to narrow down
- Use specific calorie ranges
- Add meal type (breakfast, lunch, dinner)

### Unexpected Results

**Possible Causes:**
- AI interpreted query differently
- Multiple interpretations possible

**Solutions:**
- Rephrase your query more clearly
- Use explicit numbers: "under 500 calories" instead of "low calorie"

### Slow Loading

**Possible Causes:**
- Backend server not running
- Network issues
- API rate limit reached

**Solutions:**
- Check backend server status
- Wait a few seconds and retry
- Check internet connection

---

## Next Steps

### Explore More Features

1. **Create an Account** (Coming Soon)
   - Save favorite searches
   - Track order history
   - Manage dietary preferences

2. **Add to Cart** (Coming Soon)
   - Build your order
   - Apply discounts
   - Add tip

3. **Place Order** (Coming Soon)
   - Choose delivery or pickup
   - Track order status
   - Rate your meal

4. **Customize Profile** (Coming Soon)
   - Set dietary restrictions
   - Save addresses
   - Payment methods

### Learn More

- **[User Manual](USER_MANUAL.md)** - Complete feature guide
- **[FAQ](FAQ.md)** - Common questions
- **[Video Tutorials](https://youtube.com/howl2go)** - Visual guides

---

## Need Help?

### Support Resources

- **Email:** support@howl2go.com
- **GitHub Issues:** [Report a bug](https://github.com/harsha711/SE_Project_Grp_27/issues)
- **FAQ:** [Common questions](FAQ.md)

### Community

- **Discussions:** [GitHub Discussions](https://github.com/harsha711/SE_Project_Grp_27/discussions)
- **Feature Requests:** [Submit an idea](https://github.com/harsha711/SE_Project_Grp_27/issues/new)

---

## Quick Reference Card

### Most Common Queries

| What You Want | What to Search |
|---------------|----------------|
| Healthy breakfast | `breakfast under 400 calories high protein` |
| Keto-friendly | `low carb high fat` |
| Weight loss meal | `low calorie high protein filling` |
| Post-workout | `high protein moderate carbs` |
| Quick snack | `snack under 200 calories` |
| Balanced meal | `500-700 calories balanced macros` |
| Light dinner | `dinner under 500 calories` |
| Muscle building | `high protein high calorie` |

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `/` | Focus search bar |
| `Enter` | Submit search |
| `Esc` | Clear search |
| `Ctrl/Cmd + K` | Quick search (coming soon) |

---

**Happy Searching! 🍔**

*Crave it. Find it. Instantly.*

---

[← Back to README](../README.md) | [User Manual →](USER_MANUAL.md)
