# Howl2Go User Manual

**Version 1.0.0**
*Last Updated: October 26, 2025*

---

## Table of Contents

1. [Introduction to Howl2Go](#1-introduction-to-howl2go)
2. [Account Management](#2-account-management)
3. [Food Discovery & Search](#3-food-discovery--search)
4. [Search Results](#4-search-results)
5. [Food Item Details](#5-food-item-details)
6. [Cart Management](#6-cart-management)
7. [Order Placement](#7-order-placement)
8. [Order Tracking](#8-order-tracking)
9. [Order History](#9-order-history)
10. [Profile Management](#10-profile-management)
11. [Notifications](#11-notifications)
12. [Settings](#12-settings)
13. [User Flows](#13-user-flows)
14. [Troubleshooting](#14-troubleshooting)
15. [Best Practices](#15-best-practices)

---

## 1. Introduction to Howl2Go

### Welcome to Howl2Go!

Howl2Go is a revolutionary food delivery application that transforms how you discover and order food. Instead of browsing through endless traditional menus, Howl2Go uses **AI-powered natural language search** to help you find exactly what you're craving - instantly.

### What Makes Howl2Go Different?

**Traditional Food Apps:**
- Scroll through hundreds of menu items
- Manual filtering through categories
- Time-consuming decision making
- Difficult to find items matching dietary needs

**Howl2Go:**
- Simply describe what you want in plain English
- AI understands your cravings and nutritional preferences
- Instant results from multiple restaurants
- Smart recommendations based on your requirements

### Key Features

- **Natural Language Search** - Search like you talk: "I want something high in protein but low in calories"
- **Multi-Restaurant Discovery** - See options from McDonald's, Burger King, Wendy's, KFC, and Taco Bell
- **Nutritional Intelligence** - Filter by calories, protein, carbs, fats, fiber, sodium, and more
- **Smart Recommendations** - AI-powered suggestions based on your preferences
- **Beautiful Interface** - Modern dark theme with smooth animations
- **Fast & Responsive** - Quick search results with real-time updates

### Supported Restaurants

Currently, Howl2Go aggregates menu items from these popular fast-food chains:

- **McDonald's** - 230+ items
- **Burger King** - 180+ items
- **Wendy's** - 140+ items
- **KFC** - 120+ items
- **Taco Bell** - 160+ items

**Total Database:** 1,148+ food items with complete nutritional information

---

## 2. Account Management

> **Coming Soon** - User accounts and authentication features are planned for Version 1.1

### Registration (Coming Soon)

Future features will include:
- Email/password registration
- Social login (Google, Facebook)
- Phone number verification
- Profile creation

### Login (Coming Soon)

Currently, Howl2Go operates without user accounts. You can:
- Access the home page directly
- Search for food without signing in
- View search results anonymously

**Note:** A placeholder login page exists at `/login` but is not yet functional.

### Profile (Coming Soon)

Planned profile features:
- Personal information management
- Dietary preferences
- Favorite items
- Order history
- Saved addresses
- Payment methods

---

## 3. Food Discovery & Search

This is the **core feature** of Howl2Go - our AI-powered intelligent search system that understands natural language queries.

### 3.1 Accessing the Search

#### From Home Page

1. **Navigate to Howl2Go** - Open your browser and go to `http://localhost:3000`
2. **Locate the Search Bar** - You'll see a prominent search bar in the hero section
3. **Typewriter Demo** - Watch as example queries are typed automatically to show you what's possible

#### Search Bar Features

- **Shared Layout Animation** - The search bar smoothly transitions when you navigate to the search page
- **Auto-focus** - Automatically focuses when you click, ready for your input
- **Visual Feedback** - Border color changes from gray to burnt orange when focused
- **Glow Effect** - Subtle shadow effect when active
- **Enter Key Indicator** - Shows "Press ↵" prompt when you start typing

### 3.2 Understanding Search Query Types

Howl2Go's AI can understand various types of queries. Here's a comprehensive guide:

#### Simple Descriptive Queries

These queries use general terms without specific numbers:

```
"high protein"
"low calorie"
"low fat"
"high fiber"
"low carb"
"low sodium"
"low sugar"
"healthy breakfast"
"light dinner"
```

**How it works:** The AI interprets "high protein" as approximately 20g+ and "low calorie" as under 400 calories.

#### Specific Numeric Queries

These queries include exact numbers for precise filtering:

```
"at least 30g of protein"
"less than 500 calories"
"under 20g of carbs"
"more than 10g of fiber"
"below 600mg of sodium"
"at least 5g of fat"
```

**Supported Operators:**
- "at least" / "minimum" / "more than" → Sets minimum value
- "less than" / "under" / "below" / "maximum" → Sets maximum value
- "exactly" → Sets exact value

#### Range Queries

Specify both minimum and maximum values:

```
"between 300 and 500 calories"
"20 to 30 grams of protein"
"10-15g of fat"
"400-600 calories with at least 25g protein"
```

**Range Formats:**
- "between X and Y"
- "X to Y"
- "X-Y"

#### Complex Multi-Criteria Queries

Combine multiple nutritional requirements in one query:

```
"I want a meal with at least 25g of protein, less than 600 calories, and low sodium"
"Give me a high protein, low carb snack under 200 calories"
"I need something with lots of fiber, low sugar, and under 400 calories"
"Find me a breakfast with 20-30g protein, less than 500 calories, and low fat"
"I'm looking for a low calorie dessert with less than 10g of fat"
```

**Best Practices for Complex Queries:**
- Use commas to separate different criteria
- Use "and" to connect requirements
- Be specific about what matters most to you
- The AI can handle 3-5 criteria in a single query

#### Meal Type Queries

Include meal context for better results:

```
"healthy breakfast under 400 calories"
"high protein lunch"
"light dinner with low carbs"
"post-workout snack with high protein"
"low calorie dessert"
```

**Meal Types Recognized:**
- Breakfast
- Lunch
- Dinner
- Snack
- Dessert
- Post-workout
- Pre-workout

### 3.3 Supported Nutritional Fields

The AI can filter by these nutritional criteria:

| Nutritional Field | Database Field | Examples |
|-------------------|----------------|----------|
| **Calories** | `calories` | "under 500 calories", "300-500 cal" |
| **Protein** | `protein` | "at least 30g of protein", "high protein" |
| **Total Fat** | `total_fat` | "low fat", "less than 15g fat" |
| **Carbohydrates** | `total_carb` | "low carb", "under 30g carbs" |
| **Fiber** | `fiber` | "high fiber", "at least 10g fiber" |
| **Sugar** | `sugar` | "low sugar", "under 20g sugar" |
| **Sodium** | `sodium` | "low sodium", "under 600mg sodium" |
| **Cholesterol** | `cholesterol` | "low cholesterol", "under 50mg" |
| **Saturated Fat** | `sat_fat` | "low saturated fat", "under 5g" |
| **Trans Fat** | `trans_fat` | "no trans fat", "0g trans fat" |
| **Calories from Fat** | `caloriesFromFat` | "low fat calories" |
| **Weight Watchers Points** | `weightWatchersPoints` | "low WW points" |

### 3.4 Search Execution

#### How to Search

**Method 1: Press Enter**
1. Type your query in the search bar
2. Press the **Enter** key (or **Return** on Mac)
3. The page will navigate to `/search?q=your+query`
4. Results will load automatically

**Method 2: Click Search Icon**
1. Type your query
2. Click the **orange search icon** on the right side of the search bar
3. Results will load

#### Search Process

When you submit a search query:

1. **Query Submission** - Your query is sent to the backend API
2. **AI Processing** - Groq's Llama 3.1 model analyzes your query
3. **Criteria Extraction** - The AI converts your natural language into structured criteria
4. **Database Query** - MongoDB searches for matching food items
5. **Results Ranking** - Results are sorted intelligently based on your criteria
6. **Display** - Items appear in a grid layout with smooth animations

#### Loading States

While searching, you'll see:
- **Animated placeholders** - 6 skeleton cards showing loading state
- **Pulsing animation** - Cards pulse to indicate loading
- **Search bar remains active** - You can modify your search while loading

#### Search Response Time

- **Average:** 1-3 seconds
- **AI Processing:** 200-500ms
- **Database Query:** 50-100ms
- **Network Transfer:** Variable based on connection

### 3.5 Search Examples & Use Cases

#### For Weight Loss
```
"low calorie meals under 400 calories"
"high protein low carb lunch"
"filling food under 300 calories"
```

#### For Muscle Building
```
"high protein meal with at least 30g protein"
"post-workout food with 25-35g protein"
"lean protein under 500 calories"
```

#### For Dietary Restrictions
```
"low sodium food under 600mg sodium"
"low sugar dessert under 15g sugar"
"low fat meal under 10g fat"
```

#### For Specific Diets
```
# Keto Diet
"low carb high fat under 10g carbs"
"keto friendly meal under 20g carbs"

# High Fiber
"high fiber meal with at least 15g fiber"
"fiber-rich breakfast"

# Low Cholesterol
"low cholesterol food under 50mg cholesterol"
```

#### For Calorie Counting
```
"exactly 500 calories"
"between 400 and 600 calories"
"under 350 calories with high protein"
```

### 3.6 Search Tips & Tricks

#### Be Specific When It Matters
- Instead of: "healthy food"
- Try: "high protein low calorie meal under 500 calories"

#### Use Numbers for Precision
- Instead of: "low calorie"
- Try: "under 400 calories"

#### Combine Multiple Criteria
- Instead of searching separately
- Try: "25g protein, low carb, under 500 calories"

#### Use Natural Language
- You can type conversationally: "I want something with lots of protein but not too many calories"
- The AI understands context

#### Experiment with Meal Types
- Adding meal context helps: "healthy breakfast" vs just "healthy"

#### Don't Over-Specify
- Too many criteria might return no results
- Start broad, then narrow down

---

## 4. Search Results

After submitting your search query, you'll be taken to the search results page where you can view, filter, and interact with matching food items.

### 4.1 Search Results Page Layout

#### Header Navigation Bar

Located at the top of the page:

- **Back Button** - Arrow icon on the left to return to home page
- **Howl2Go Logo** - Click to return home
- **Dashboard Button** - Orange button on the right (Coming Soon)

**Features:**
- Sticky header - Stays visible while scrolling
- Backdrop blur effect - Semi-transparent background
- Smooth animations - Fades in on page load

#### Search Bar (Persistent)

The search bar remains at the top of the results page:

- **Same search bar** from home page (shared layout animation)
- **Auto-focused** - Ready for new searches
- **Current query visible** - Shows your search terms
- **Real-time modification** - Type new query and press Enter

**Keyboard Shortcuts:**
- **Enter** - Submit new search
- **Escape** - Return to home page

#### Results Grid

Food items are displayed in a responsive grid:

- **Desktop (lg screens):** 3 columns
- **Tablet (md screens):** 2 columns
- **Mobile (sm screens):** 1 column
- **Gap:** 6 units between cards

### 4.2 Understanding Search Results

#### Result Count

Currently, the system returns:
- **Default:** Top 10 most relevant items
- **Maximum:** Configurable via API (up to 50)

**Note:** Pagination is implemented in the API but not yet in the UI.

#### Result Quality Indicators

The AI returns items matching your criteria. Quality indicators:

- **Exact matches** - Items meeting all criteria appear first
- **Partial matches** - Items meeting some criteria appear next
- **Relevance ranking** - Sorted based on how well they match

#### No Results State

If no items match your criteria:

```
🔍
Start Your Search
Try searching for something like "100 calories food" or
"burger under 300 calories"
```

**Reasons for no results:**
- Criteria too restrictive (e.g., "under 50 calories")
- Combination impossible (e.g., "high protein 0 calories")
- Typos in nutritional terms
- Database doesn't have matching items

**What to do:**
1. Broaden your criteria
2. Remove one or two requirements
3. Try a different query approach
4. Check for typos

### 4.3 Sorting Results

Currently, sorting is automatic based on your query type:

#### Intelligent Auto-Sorting

The system automatically chooses the best sort order:

**High Protein Queries:**
```
Query: "high protein meal"
Sorting: By protein content (descending)
Result: Items with most protein appear first
```

**Low Calorie Queries:**
```
Query: "low calorie food"
Sorting: By calories (ascending)
Result: Lowest calorie items appear first
```

**Low Fat Queries:**
```
Query: "low fat meal"
Sorting: By fat content (ascending)
Result: Lowest fat items appear first
```

**Multi-Criteria Queries:**
```
Query: "high protein low calorie"
Sorting: Balanced score based on both criteria
Result: Best overall matches appear first
```

#### Manual Sorting (Coming Soon)

Future versions will include:
- Sort by price (low to high, high to low)
- Sort by calories (ascending, descending)
- Sort by protein (ascending, descending)
- Sort by restaurant
- Sort by rating
- Custom sort options

### 4.4 Filtering Results

#### Current Filtering

Filtering happens at the search level. To filter:

1. **Modify your search query** - Type new criteria
2. **Press Enter** - Submit new search
3. **View new results** - Instantly filtered

**Example Flow:**
```
Initial search: "high protein"
Results: 10 items with protein > 20g

Modify to: "high protein under 400 calories"
Results: 5 items with protein > 20g AND calories < 400
```

#### Advanced Filtering (Coming Soon)

Planned filter options:
- Filter by restaurant
- Filter by price range
- Filter by meal type
- Filter by dietary tags (vegetarian, gluten-free, etc.)
- Filter by rating
- Multiple simultaneous filters

### 4.5 Result Card Anatomy

Each food item is displayed as a card with these elements:

#### Card Structure

```
┌─────────────────────────────────┐
│ [Logo]              [$--.--]    │ ← Header
│                                  │
│ Item Name                        │ ← Title
│ Restaurant Name                  │ ← Subtitle
│                                  │
│ [⚡] 450 cal                    │ ← Nutrition Badge
│                                  │
│ ─────────────────────────────── │
│ [Fast Food]            [Add]    │ ← Footer
└─────────────────────────────────┘
```

#### Card Elements Explained

**1. Restaurant Logo (Top Left)**
- 64x64 pixel image
- Restaurant-specific branding
- Logos included for McDonald's, Burger King, Wendy's, KFC, Taco Bell
- Generic fast-food icon for others

**2. Price Badge (Top Right)**
- Currently shows placeholder: `$--.--`
- Real pricing coming in future updates

**3. Item Name**
- Large, bold text
- Turns orange on hover
- Example: "Big Mac", "Whopper", "Spicy Chicken Sandwich"

**4. Restaurant Name**
- Smaller, muted text
- Shows which chain offers this item
- Example: "McDonald's", "Burger King"

**5. Calorie Badge**
- Orange lightning bolt icon
- Shows total calories
- Dark gray background
- Example: "450 cal", "320 cal"

**6. Category Tag (Bottom Left)**
- Currently shows: "Fast Food"
- Future: Dynamic categories (Burger, Chicken, Salad, etc.)

**7. Add Button (Bottom Right)**
- Orange button with white text
- Scales up on hover (1.05x)
- Scales down on click (0.95x)
- **Coming Soon:** Adds item to cart

#### Card Interactions

**Hover Effects:**
- Card lifts up 4px
- Border color changes to orange
- Item name turns orange
- Smooth transitions (0.2s)

**Click Behavior:**
- Currently: No action
- **Coming Soon:** Opens item details modal

**Animations:**
- Cards fade in sequentially (50ms stagger)
- Each card animates from bottom to top
- Smooth entrance effect

### 4.6 Empty States

#### Before First Search

```
🔍
Start Your Search
Try searching for something like "100 calories food"
or "burger under 300 calories"
```

#### No Results Found

```
⚠️
Oops! Something went wrong
No results found. Try a different search.

[Try Again]
```

#### Error State

```
⚠️
Oops! Something went wrong
Unable to connect to server. Please check your
connection and try again.

[Try Again]
```

### 4.7 Performance & Loading

#### Loading Indicators

While fetching results:
- 6 skeleton cards with pulsing animation
- Search bar remains interactive
- Smooth transition when results arrive

#### Progressive Loading

Results appear with staggered animation:
- Card 1: 0ms delay
- Card 2: 50ms delay
- Card 3: 100ms delay
- Card 4: 150ms delay
- And so on...

Creates a smooth, professional loading experience.

---

## 5. Food Item Details

Currently, food items display basic information on the card. Detailed views are planned for future updates.

### 5.1 Current Information Display

On each search result card, you can see:

#### Basic Information
- **Item Name** - Full name of the food item
- **Restaurant** - Which chain offers it
- **Calories** - Total caloric content

#### Visual Elements
- **Restaurant Logo** - Brand identification
- **Calorie Badge** - Quick nutritional reference
- **Category Tag** - Food classification

### 5.2 Available Nutritional Data

While not currently displayed in full detail, the system has access to these nutritional fields for each item:

| Field | Description | Example |
|-------|-------------|---------|
| **Calories** | Total energy content | 450 kcal |
| **Calories from Fat** | Energy from fat sources | 180 kcal |
| **Total Fat** | Total fat content | 20g |
| **Saturated Fat** | Saturated fat content | 8g |
| **Trans Fat** | Trans fat content | 0g |
| **Cholesterol** | Cholesterol content | 45mg |
| **Sodium** | Salt content | 800mg |
| **Total Carbohydrates** | Total carb content | 45g |
| **Dietary Fiber** | Fiber content | 3g |
| **Sugars** | Sugar content | 12g |
| **Protein** | Protein content | 25g |
| **Weight Watchers Points** | WW point value | 8 points |

### 5.3 Detailed View (Coming Soon)

**Planned Features:**

#### Nutrition Facts Panel
- Complete nutritional breakdown
- Standard FDA nutrition label format
- Daily value percentages
- Allergen information

#### Restaurant Information
- Restaurant address
- Distance from your location
- Operating hours
- Contact information
- Rating and reviews

#### Item Details
- Full description
- Ingredients list
- Preparation time
- Customization options
- Dietary tags (vegetarian, gluten-free, etc.)

#### Similar Items
- "You might also like..."
- Items with similar nutritional profiles
- Items from the same restaurant
- Items in the same category

#### Customer Reviews
- Star ratings
- Written reviews
- Photos from customers
- Helpful/not helpful votes

#### Pricing Information
- Base price
- Size options
- Add-ons and extras
- Combo deals
- Current promotions

### 5.4 How to View Details (Coming Soon)

**Planned Interaction:**

1. **Click on item card** - Opens modal or detail page
2. **View complete information** - All nutritional data visible
3. **Customize if needed** - Modify ingredients, size, etc.
4. **Add to cart** - Direct from detail view

---

## 6. Cart Management

> **Coming Soon** - Shopping cart functionality is planned for Version 1.1

### 6.1 Adding Items to Cart (Coming Soon)

**Planned Flow:**

1. **Find your item** - Search and browse results
2. **Click "Add" button** - On the item card
3. **Item added to cart** - Confirmation animation
4. **Cart badge updates** - Shows item count

**Features in Development:**
- Quick add from search results
- Add with customizations from detail view
- Add multiple quantities
- Smart duplicate handling

### 6.2 Viewing Your Cart (Coming Soon)

**Planned Cart Interface:**

```
Your Cart (3 items)
┌─────────────────────────────────────┐
│ Big Mac × 2                  $11.98 │
│ McDonald's                           │
│ [- 2 +] [Remove]                    │
├─────────────────────────────────────┤
│ Large Fries × 1              $3.49  │
│ McDonald's                           │
│ [- 1 +] [Remove]                    │
└─────────────────────────────────────┘

Subtotal:                      $15.47
Tax:                           $1.24
Delivery Fee:                  $2.99
─────────────────────────────────────
Total:                         $19.70
```

### 6.3 Updating Quantities (Coming Soon)

**Planned Controls:**

- **Plus button (+)** - Increase quantity
- **Minus button (-)** - Decrease quantity
- **Number input** - Direct quantity entry
- **Remove button** - Delete item entirely

**Quantity Limits:**
- Minimum: 1 per item
- Maximum: 99 per item
- Validation on input

### 6.4 Applying Discounts (Coming Soon)

**Planned Discount Features:**

#### Promo Codes
```
Enter Promo Code
┌─────────────────────┐
│ HOWL10             │ [Apply]
└─────────────────────┘

✓ 10% discount applied (-$1.55)
```

#### Automatic Discounts
- First-time user discount
- Restaurant promotions
- Combo meal savings
- Loyalty rewards
- Holiday specials

#### Discount Types
- Percentage off (10%, 20%, etc.)
- Dollar amount off ($5 off $25, etc.)
- Free delivery
- Buy one get one (BOGO)
- Free items

### 6.5 Tips (Coming Soon)

**Planned Tipping Options:**

```
Tip Your Driver
┌─────────────────────────────────┐
│ ○ 15% ($2.95)                   │
│ ● 18% ($3.55)  [Recommended]    │
│ ○ 20% ($3.94)                   │
│ ○ Custom: $_____                │
└─────────────────────────────────┘
```

**Tip Features:**
- Preset percentage options (15%, 18%, 20%, 25%)
- Custom tip amount
- No tip option
- Tip explanation
- Driver sees tip amount

### 6.6 Cart Persistence (Coming Soon)

**Planned Features:**

- **Local Storage** - Cart saved in browser
- **Cross-Session** - Cart persists after closing browser
- **Expiration** - Items expire after 24 hours
- **Sync with Account** - Cart syncs across devices (when logged in)

---

## 7. Order Placement

> **Coming Soon** - Checkout and order placement features are planned for Version 1.1

### 7.1 Checkout Process (Coming Soon)

**Planned Checkout Flow:**

1. **Review Cart** - Verify items and quantities
2. **Choose Delivery Method** - Delivery or pickup
3. **Select Address** - Delivery address or pickup location
4. **Choose Payment** - Payment method selection
5. **Review Order** - Final confirmation
6. **Place Order** - Submit and receive confirmation

### 7.2 Delivery vs Pickup (Coming Soon)

#### Delivery Option

**Features:**
- Address entry and validation
- Delivery time estimate
- Delivery fee calculation
- Driver tip option
- Contactless delivery option
- Delivery instructions field

**Information Provided:**
- Estimated delivery time: 30-45 minutes
- Delivery radius: 5 miles
- Minimum order: $10
- Delivery fee: $2.99 - $5.99

#### Pickup Option

**Features:**
- Restaurant selection
- Pickup time selection
- Special instructions
- Curbside pickup option
- No delivery fee

**Information Provided:**
- Ready time estimate: 15-20 minutes
- Restaurant address
- Parking instructions
- Pickup counter location

### 7.3 Payment Options (Coming Soon)

**Planned Payment Methods:**

#### Credit/Debit Cards
- Visa, Mastercard, American Express, Discover
- Secure card storage
- CVV verification
- Billing address validation

#### Digital Wallets
- Apple Pay
- Google Pay
- PayPal

#### Other Methods
- Cash on delivery (for delivery orders)
- Gift cards
- Store credit

**Security Features:**
- PCI DSS compliance
- SSL encryption
- Tokenized card storage
- 3D Secure authentication
- Fraud detection

### 7.4 Order Confirmation (Coming Soon)

**After Placing Order:**

```
✓ Order Confirmed!
Order #123456

McDonald's
Estimated delivery: 35-40 min

Items:
- Big Mac × 2
- Large Fries × 1

Total: $19.70

[Track Order] [View Receipt]
```

**Confirmation Methods:**
- On-screen confirmation
- Email receipt
- SMS notification
- In-app notification

---

## 8. Order Tracking

> **Coming Soon** - Real-time order tracking features are planned for Version 1.1

### 8.1 Track Deliveries (Coming Soon)

**Planned Tracking Features:**

#### Order Status Timeline
```
✓ Order Placed          12:00 PM
✓ Order Confirmed       12:02 PM
✓ Restaurant Preparing  12:05 PM
○ Out for Delivery      ~12:30 PM
○ Delivered            ~12:45 PM
```

#### Live Map Tracking
- Real-time driver location
- Estimated arrival time
- Route visualization
- Driver information (name, photo, rating)

#### Status Updates
- Push notifications
- SMS updates
- Email updates
- In-app updates

### 8.2 View Status (Coming Soon)

**Order Status Types:**

| Status | Description | Typical Duration |
|--------|-------------|------------------|
| **Placed** | Order received by system | Instant |
| **Confirmed** | Restaurant accepted order | 1-2 minutes |
| **Preparing** | Food is being made | 10-15 minutes |
| **Ready** | Order ready for pickup/delivery | - |
| **Out for Delivery** | Driver picked up order | 15-20 minutes |
| **Nearby** | Driver is close | 2-5 minutes |
| **Delivered** | Order completed | - |

**For Pickup Orders:**
- Order Placed
- Order Confirmed
- Preparing
- Ready for Pickup
- Picked Up

### 8.3 Contact Driver (Coming Soon)

**Planned Features:**

- In-app messaging
- Phone call (masked numbers)
- Delivery instructions
- Special requests
- Report issues

---

## 9. Order History

> **Coming Soon** - Order history features are planned for Version 1.1

### 9.1 View Past Orders (Coming Soon)

**Planned Order History Interface:**

```
Your Orders
─────────────────────────────────────
Nov 15, 2025 - $19.70
McDonald's
Big Mac × 2, Large Fries × 1
Delivered
[Reorder] [View Details]

Nov 12, 2025 - $15.49
Burger King
Whopper × 1, Onion Rings × 1
Delivered
[Reorder] [View Details]
```

**Sorting & Filtering:**
- Sort by date (newest/oldest)
- Filter by restaurant
- Filter by status
- Search by item name
- Date range filter

### 9.2 Reorder (Coming Soon)

**Quick Reorder Feature:**

1. **Find past order** - Browse order history
2. **Click "Reorder"** - One-click reorder
3. **Review cart** - Items added to cart
4. **Modify if needed** - Change quantities or items
5. **Checkout** - Complete order

**Benefits:**
- Save time on frequent orders
- No need to search again
- Customize before ordering
- Works with favorite meals

### 9.3 Order Details (Coming Soon)

**Detailed Order View:**

- Complete item list with prices
- Subtotal, tax, fees breakdown
- Payment method used
- Delivery/pickup address
- Order date and time
- Restaurant information
- Driver information (for delivery)
- Special instructions
- Order status history
- Digital receipt

**Actions Available:**
- Reorder
- Report issue
- Rate order
- Download receipt
- Contact support

---

## 10. Profile Management

> **Coming Soon** - User profile features are planned for Version 1.1

### 10.1 Personal Information (Coming Soon)

**Planned Profile Fields:**

- Full name
- Email address
- Phone number
- Date of birth
- Profile photo
- Account creation date

### 10.2 Addresses (Coming Soon)

**Address Management:**

#### Saved Addresses
```
Home
123 Main Street, Apt 4B
New York, NY 10001
[Edit] [Delete] [Set as Default]

Work
456 Office Tower
New York, NY 10002
[Edit] [Delete]

[+ Add New Address]
```

**Address Features:**
- Multiple saved addresses
- Default address selection
- Address labels (Home, Work, Other)
- Address validation
- Map integration

### 10.3 Payment Methods (Coming Soon)

**Saved Payment Methods:**

```
Visa ending in 1234
Expires 12/25
[Edit] [Delete] [Set as Default]

Mastercard ending in 5678
Expires 03/26
[Edit] [Delete]

[+ Add Payment Method]
```

**Security:**
- Secure encrypted storage
- CVV not stored
- Tokenized card data
- PCI compliance

### 10.4 Preferences (Coming Soon)

**Dietary Preferences:**
- Vegetarian
- Vegan
- Gluten-free
- Dairy-free
- Nut allergies
- Other allergies

**App Preferences:**
- Favorite restaurants
- Preferred cuisine types
- Spice level preferences
- Default tip percentage
- Preferred delivery time

**Notification Preferences:**
- Order updates
- Promotional emails
- SMS notifications
- Push notifications

---

## 11. Notifications

> **Coming Soon** - Notification system is planned for Version 1.1

### 11.1 Push Notifications (Coming Soon)

**Notification Types:**

#### Order Updates
- Order confirmed
- Being prepared
- Out for delivery
- Nearby
- Delivered

#### Promotions
- Daily deals
- New restaurant partnerships
- Discount codes
- Special offers

#### Account
- Profile updates
- Payment method expiring
- Password change confirmation

**Notification Controls:**
- Enable/disable by category
- Quiet hours setting
- Do not disturb mode
- Sound preferences

### 11.2 Email Alerts (Coming Soon)

**Email Types:**

- Order confirmations
- Receipts
- Delivery updates
- Weekly summaries
- Monthly statements
- Marketing emails
- Newsletter

**Email Preferences:**
- Unsubscribe from marketing
- Frequency settings
- Email format (HTML/Plain text)

### 11.3 SMS Notifications (Coming Soon)

**SMS Features:**

- Order status updates
- Delivery arrival alerts
- Verification codes
- Promotional offers

**SMS Controls:**
- Enable/disable SMS
- Opt-out at any time
- Number verification

---

## 12. Settings

> **Coming Soon** - Settings page is planned for Version 1.1

### 12.1 App Preferences (Coming Soon)

**Planned Settings:**

#### Display Settings
- Dark mode / Light mode toggle
- Font size adjustment
- Compact/Expanded view
- Animation preferences

#### Language Settings
- Language selection
- Regional format (date, time, currency)
- Measurement units (imperial/metric)

#### Accessibility
- Screen reader support
- High contrast mode
- Keyboard navigation
- Text scaling

### 12.2 Notification Settings (Coming Soon)

**Notification Controls:**

```
Notifications
─────────────────────────────────────
Order Updates
  ☑ Push notifications
  ☑ Email
  ☑ SMS

Promotions
  ☑ Push notifications
  ☐ Email
  ☐ SMS

Quiet Hours
  Enabled: 10:00 PM - 8:00 AM
```

### 12.3 Privacy Settings (Coming Soon)

**Privacy Controls:**

- Location services
- Activity tracking
- Personalized recommendations
- Data sharing preferences
- Cookie preferences
- Third-party sharing

### 12.4 Account Settings (Coming Soon)

**Account Management:**

- Change password
- Update email
- Update phone number
- Two-factor authentication
- Login sessions
- Connected devices
- Delete account

---

## 13. User Flows

This section provides visual step-by-step guides for common tasks.

### 13.1 Search & Discover Flow

**Flow Diagram:**

```
┌─────────────┐
│ Home Page   │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│ View Hero Section   │
│ - Typewriter demo   │
│ - Search bar ready  │
└──────┬──────────────┘
       │
       ▼
┌───────────────────────┐
│ Click on Search Bar   │
│ - Auto-focus          │
│ - Orange border glow  │
└──────┬────────────────┘
       │
       ▼
┌────────────────────────────┐
│ Type Your Query            │
│ Example: "high protein     │
│ low calorie"               │
└──────┬─────────────────────┘
       │
       ▼
┌──────────────────────┐
│ Press Enter          │
│ - URL updates        │
│ - Navigate to search │
└──────┬───────────────┘
       │
       ▼
┌─────────────────────┐
│ Loading State       │
│ - 6 skeleton cards  │
│ - Pulsing animation │
└──────┬──────────────┘
       │
       ▼
┌──────────────────────────┐
│ View Results             │
│ - Grid of food items     │
│ - Sorted by relevance    │
│ - Staggered animation    │
└──────┬───────────────────┘
       │
       ▼
┌────────────────────────┐
│ Browse Results         │
│ - Hover over cards     │
│ - View nutritional info│
└────────────────────────┘
```

**Detailed Steps:**

1. **Start at Home Page**
   - See Howl2Go logo
   - Watch typewriter demo
   - Notice prominent search bar

2. **Initiate Search**
   - Click anywhere in search bar
   - Bar gains focus
   - Border turns orange
   - Subtle glow appears

3. **Enter Query**
   - Type naturally: "I want a high protein meal under 500 calories"
   - See "Press ↵" indicator appear
   - Query updates in real-time

4. **Submit Search**
   - Press Enter key
   - OR click orange search icon
   - URL updates to `/search?q=your+query`
   - Page transitions smoothly

5. **Wait for Results**
   - See loading skeletons
   - Watch pulsing animation
   - Search bar remains at top

6. **View Results**
   - Cards fade in sequentially
   - 10 matching items displayed
   - Grid layout adjusts to screen size

7. **Interact with Results**
   - Hover over cards (lifts 4px)
   - See orange highlights
   - View calorie information

### 13.2 Refining Search Flow

**Flow Diagram:**

```
┌──────────────────┐
│ Initial Results  │
│ (10 items shown) │
└────────┬─────────┘
         │
         ▼
┌─────────────────────────┐
│ Too many/few results?   │
└────┬───────────┬────────┘
     │           │
   YES          NO
     │           │
     ▼           ▼
┌──────────┐  ┌──────────┐
│ Modify   │  │ Browse   │
│ Query    │  │ Results  │
└────┬─────┘  └──────────┘
     │
     ▼
┌────────────────────────┐
│ Type in Search Bar     │
│ (still at top of page) │
└────────┬───────────────┘
         │
         ▼
┌────────────────────┐
│ Add more criteria  │
│ "high protein low  │
│ calorie under 400  │
│ calories"          │
└────────┬───────────┘
         │
         ▼
┌────────────────┐
│ Press Enter    │
└────────┬───────┘
         │
         ▼
┌──────────────────┐
│ New Results     │
│ (5 items shown) │
└─────────────────┘
```

**Detailed Steps:**

1. **Review Initial Results**
   - Look at items returned
   - Check if they match your needs
   - Note the count

2. **Decide to Refine**
   - Too many results → Add more criteria
   - Too few results → Remove some criteria
   - Wrong results → Rephrase query

3. **Modify Search**
   - Click in persistent search bar
   - Add to existing query: "+ under 400 calories"
   - OR start fresh with new query

4. **Re-submit**
   - Press Enter
   - New search executes
   - URL updates

5. **Compare Results**
   - New results appear
   - More focused on your needs
   - Iterate until satisfied

### 13.3 Complete Order Flow (Coming Soon)

**Planned Flow:**

```
Search → View Item → Add to Cart → Review Cart →
Checkout → Choose Delivery → Enter Address →
Select Payment → Confirm Order → Track Delivery →
Receive Order → Rate Experience
```

### 13.4 Reorder Flow (Coming Soon)

**Planned Flow:**

```
Dashboard → Order History → Find Past Order →
Click Reorder → Review Cart → Modify (optional) →
Checkout → Confirm Order
```

---

## 14. Troubleshooting

Common issues and their solutions.

### 14.1 Search Issues

#### Problem: "No results found"

**Possible Causes:**
- Criteria too restrictive
- Typos in query
- Database doesn't have matching items
- Backend server not running

**Solutions:**
1. **Broaden your search:**
   - Remove some criteria
   - Use ranges instead of exact numbers
   - Try "low calorie" instead of "under 100 calories"

2. **Check for typos:**
   - Verify spelling of nutritional terms
   - Ensure numbers are valid

3. **Try different queries:**
   - Rephrase your search
   - Use simpler terms
   - Start with basic query, then add criteria

4. **Verify backend is running:**
   ```bash
   # Check if backend is accessible
   curl http://localhost:4000/api/health
   ```

#### Problem: "Unable to connect to server"

**Possible Causes:**
- Backend server not started
- Wrong API URL
- Network connectivity issues
- Firewall blocking connection

**Solutions:**
1. **Start the backend server:**
   ```bash
   cd "Proj 2/Howl2Go_backend"
   npm run dev
   ```

2. **Check server is running:**
   - Should see: "Server running on port 4000"
   - Should see: "MongoDB connected successfully"

3. **Verify API URL:**
   - Default: `http://localhost:4000/api/food/recommend`
   - Check in browser dev tools → Network tab

4. **Check firewall:**
   - Allow Node.js through firewall
   - Try disabling firewall temporarily

#### Problem: Search is very slow (>5 seconds)

**Possible Causes:**
- Slow internet connection
- Groq API rate limiting
- Large database query
- Server overload

**Solutions:**
1. **Check internet speed:**
   - Run speed test
   - Try on different network

2. **Wait and retry:**
   - Groq free tier: 30 requests/minute
   - Wait 60 seconds between searches

3. **Simplify query:**
   - Use fewer criteria
   - Avoid complex range queries

4. **Check server logs:**
   - Look for errors or warnings
   - Monitor response times

#### Problem: Search results don't match my query

**Possible Causes:**
- AI misunderstood query
- Query too vague
- LLM hallucination

**Solutions:**
1. **Be more specific:**
   - Use exact numbers: "at least 30g protein"
   - Instead of: "lots of protein"

2. **Test query parsing:**
   ```bash
   # Test what the AI understands
   curl -X POST http://localhost:4000/api/food/parse \
     -H "Content-Type: application/json" \
     -d '{"query": "your query here"}'
   ```

3. **Rephrase query:**
   - Try different wording
   - Use standard nutritional terms

### 14.2 Display Issues

#### Problem: Search bar not visible

**Solutions:**
1. **Scroll to top of page**
2. **Refresh browser (Ctrl+R / Cmd+R)**
3. **Clear browser cache**
4. **Try different browser**

#### Problem: Food cards overlapping or misaligned

**Possible Causes:**
- Browser zoom level
- Small screen size
- CSS not loaded

**Solutions:**
1. **Reset browser zoom:**
   - Ctrl+0 (Windows/Linux)
   - Cmd+0 (Mac)

2. **Resize browser window:**
   - Try full screen
   - Test different sizes

3. **Hard refresh:**
   - Ctrl+Shift+R (Windows/Linux)
   - Cmd+Shift+R (Mac)

#### Problem: Restaurant logos not showing

**Possible Causes:**
- Images not loaded
- Wrong image path
- Browser cache issue

**Solutions:**
1. **Check image files exist:**
   ```bash
   ls "Proj 2/Howl2Go_frontend/public/"
   ```

2. **Clear browser cache**
3. **Check browser console for errors**

### 14.3 Performance Issues

#### Problem: Page loads slowly

**Solutions:**
1. **Check your internet connection**
2. **Close unnecessary browser tabs**
3. **Clear browser cache**
4. **Disable browser extensions**
5. **Use Chrome or Firefox (recommended)**

#### Problem: Animations are laggy

**Solutions:**
1. **Close other applications**
2. **Update graphics drivers**
3. **Use hardware acceleration:**
   - Chrome: Settings → System → Use hardware acceleration
4. **Reduce animation complexity (future setting)**

### 14.4 Backend Issues

#### Problem: Backend won't start

**Error:** "GROQ_API_KEY is not set"

**Solution:**
```bash
cd "Proj 2/Howl2Go_backend"
# Create .env file
echo "GROQ_API_KEY=your_key_here" > .env
echo "MONGODB_URI=your_mongodb_uri" >> .env
```

#### Problem: Database connection failed

**Error:** "MongoDB connection error"

**Solutions:**
1. **Check MongoDB is running:**
   - MongoDB Atlas: Check cluster status
   - Local MongoDB: `mongod` command

2. **Verify connection string:**
   - Check .env file
   - Ensure URI is correct
   - Check username/password

3. **Check network:**
   - MongoDB Atlas: Whitelist your IP
   - Firewall: Allow MongoDB port (27017)

#### Problem: API returns 500 error

**Solutions:**
1. **Check backend logs:**
   - Look for error messages
   - Check stack traces

2. **Restart backend server:**
   ```bash
   # Stop server (Ctrl+C)
   # Start again
   npm run dev
   ```

3. **Test API directly:**
   ```bash
   curl -X POST http://localhost:4000/api/food/search \
     -H "Content-Type: application/json" \
     -d '{"query": "test"}'
   ```

### 14.5 Browser Compatibility

#### Supported Browsers

- Chrome 90+ ✓
- Firefox 88+ ✓
- Safari 14+ ✓
- Edge 90+ ✓

#### Unsupported Browsers

- Internet Explorer (any version) ✗
- Opera Mini ✗
- UC Browser ✗

**Solution:** Update to a modern browser

### 14.6 Getting Help

If you continue to experience issues:

1. **Check GitHub Issues:**
   - https://github.com/harsha711/SE_Project_Grp_27/issues
   - Search for your problem
   - Create new issue if not found

2. **Check Documentation:**
   - [Getting Started Guide](GETTING_STARTED.md)
   - [API Documentation](../Howl2Go_backend/LLM_API_DOCUMENTATION.md)
   - [FAQ](FAQ.md)

3. **Contact Support:**
   - Email: support@howl2go.com
   - GitHub Discussions

4. **Developer Resources:**
   - [Developer Setup Guide](DEVELOPER_SETUP.md)
   - [Architecture Overview](ARCHITECTURE.md)

---

## 15. Best Practices

Tips for getting the most out of Howl2Go.

### 15.1 Search Best Practices

#### Effective Query Writing

**DO:**
- ✓ Be specific with numbers: "at least 30g protein"
- ✓ Use ranges for flexibility: "400-600 calories"
- ✓ Combine 2-3 criteria: "high protein low calorie"
- ✓ Use natural language: "I want a healthy breakfast"
- ✓ Include meal context: "post-workout snack"

**DON'T:**
- ✗ Be too restrictive: "exactly 437 calories"
- ✗ Use too many criteria: 6+ requirements
- ✗ Use contradictory terms: "high calorie low calorie"
- ✗ Use brand names in query: "McDonald's Big Mac" (just search, then filter)

#### Query Examples by Goal

**For Weight Loss:**
```
✓ "low calorie filling meals under 400 calories"
✓ "high protein low fat under 500 calories"
✓ "high fiber low sugar breakfast"
```

**For Muscle Gain:**
```
✓ "high protein meal 30-40g protein"
✓ "post-workout high protein under 600 calories"
✓ "lean protein low fat"
```

**For Keto Diet:**
```
✓ "low carb high fat under 10g carbs"
✓ "keto friendly under 20g carbs"
✓ "zero carb high fat"
```

**For Heart Health:**
```
✓ "low sodium low cholesterol"
✓ "low saturated fat under 600mg sodium"
✓ "heart healthy low fat"
```

#### Iterative Refinement

**Start Broad, Then Narrow:**

1. **First search:** "high protein"
   - Result: 50 items with protein > 20g

2. **Refine:** "high protein under 500 calories"
   - Result: 25 items

3. **Refine more:** "high protein under 500 calories low carb"
   - Result: 10 items

4. **Perfect:** Found exactly what you need

### 15.2 Browsing Efficiently

#### Quick Scanning

**What to look for:**
1. **Restaurant logo** - Quickly identify source
2. **Calorie badge** - First nutritional indicator
3. **Item name** - Recognize favorites
4. **Price** - Budget check (coming soon)

#### Hover Interactions

- **Hover over card** - Quick preview
- **Look for orange highlights** - Visual feedback
- **Check category tag** - Item classification

#### Keyboard Navigation (Coming Soon)

**Planned shortcuts:**
- **Tab** - Move between cards
- **Enter** - Select card
- **Escape** - Return to home
- **Ctrl+F** - Focus search bar

### 15.3 Managing Expectations

#### Realistic Search Expectations

**Understand AI Limitations:**

1. **Interpretation Variance**
   - "High protein" = typically 20g+
   - "Low calorie" = typically <400 cal
   - "Low carb" = typically <30g carbs

2. **Context Matters**
   - "Healthy" is subjective
   - AI interprets based on general nutrition guidelines
   - Your specific needs may differ

3. **Database Limitations**
   - Only fast food items currently
   - Limited to 5 restaurant chains
   - Not all nutritional data available for every item

#### Setting Realistic Goals

**Calorie Targets:**
- Meal: 400-700 calories
- Snack: 100-200 calories
- Full day: 1,500-2,500 calories

**Protein Targets:**
- Light meal: 15-20g
- Main meal: 25-35g
- High protein: 40g+

**Carb Targets:**
- Low carb: <20g
- Moderate: 30-50g
- Higher carb: 50g+

### 15.4 Optimizing Performance

#### For Faster Searches

1. **Use simpler queries first**
   - Start with 1-2 criteria
   - Add more if needed

2. **Avoid rapid searching**
   - Wait for results before new search
   - Respect API rate limits (30/min)

3. **Keep browser updated**
   - Latest Chrome or Firefox
   - Clear cache periodically

#### For Better Results

1. **Use specific nutritional terms**
   - "protein", "calories", "carbs", "fat"
   - Avoid vague terms like "healthy", "good"

2. **Include units when helpful**
   - "30g of protein" instead of "30 protein"
   - "500 calories" instead of "500 energy"

3. **Test query parsing**
   - Use `/parse` API endpoint
   - Verify AI understanding
   - Adjust query accordingly

### 15.5 Health & Nutrition Tips

#### Understanding Nutritional Information

**Daily Value References (2,000 cal diet):**
- Total Fat: <78g
- Saturated Fat: <20g
- Cholesterol: <300mg
- Sodium: <2,300mg
- Total Carbs: 275g
- Fiber: 28g
- Protein: 50g

#### Making Healthier Choices

**General Guidelines:**

1. **Balance Your Macros**
   - 40-50% carbs
   - 20-30% protein
   - 20-30% fat

2. **Watch These:**
   - Sodium: <600mg per meal
   - Saturated fat: <7g per meal
   - Added sugars: <12g per meal
   - Trans fat: 0g (always)

3. **Prioritize These:**
   - High fiber (>5g per meal)
   - Adequate protein (20-30g per meal)
   - Low sodium
   - Whole grains (when available)

#### Portion Control

Even with Howl2Go's smart search:

- **Don't just rely on "low calorie"** - Check serving size
- **Combine items wisely** - Balance your entire meal
- **Consider your daily total** - One meal is part of bigger picture

### 15.6 Privacy & Security

#### Protecting Your Information

**Current Version (No Accounts):**
- No personal data collected
- Searches are not saved
- Anonymous usage

**Future Versions (With Accounts):**
- Use strong passwords
- Enable two-factor authentication
- Review privacy settings
- Don't share account credentials

#### Safe Browsing

1. **Use HTTPS**
   - Check for padlock icon
   - Verify URL is correct

2. **Public WiFi**
   - Avoid entering payment info on public networks
   - Use VPN if possible

3. **Shared Computers**
   - Log out after use
   - Clear browser history
   - Don't save passwords

### 15.7 Accessibility

#### For Screen Reader Users

**Current Support:**
- Semantic HTML
- ARIA labels on search input
- Keyboard navigation (partial)

**Best Practices:**
- Use Tab to navigate
- Search input has aria-label
- Listen for status updates

#### For Keyboard Users

**Available Shortcuts:**
- **Tab** - Navigate forward
- **Shift+Tab** - Navigate backward
- **Enter** - Submit search
- **Escape** - Return to home (from search page)

#### For Low Vision Users

**Tips:**
- Use browser zoom (Ctrl/Cmd + Plus)
- High contrast mode (OS level)
- Increase text size in browser settings
- Dark theme reduces eye strain

### 15.8 Feedback & Improvement

#### Help Us Improve

**Ways to Contribute:**

1. **Report Bugs**
   - GitHub Issues
   - Include screenshots
   - Describe steps to reproduce

2. **Suggest Features**
   - GitHub Discussions
   - Explain use case
   - Provide examples

3. **Share Your Experience**
   - Write reviews
   - Share on social media
   - Tell friends about Howl2Go

4. **Contribute Code**
   - Fork the repository
   - Make improvements
   - Submit pull requests

#### Feature Requests

**What We Want to Hear:**
- What features do you miss?
- What slows you down?
- What would make ordering easier?
- What restaurants should we add?

**How to Request:**
- GitHub Issues: Label as "feature request"
- Email: support@howl2go.com
- Community forum (coming soon)

---

## Appendix A: Keyboard Shortcuts

> **Coming Soon** - Comprehensive keyboard shortcuts planned for Version 1.1

**Currently Available:**

| Shortcut | Action | Page |
|----------|--------|------|
| **Tab** | Navigate forward | All |
| **Shift+Tab** | Navigate backward | All |
| **Enter** | Submit search | Search bar |
| **Escape** | Return to home | Search page |

**Planned for Future:**

| Shortcut | Action |
|----------|--------|
| **Ctrl/Cmd+K** | Focus search bar |
| **Ctrl/Cmd+/** | Show shortcuts help |
| **Arrow Keys** | Navigate results |
| **C** | View cart |
| **O** | View orders |
| **P** | View profile |

---

## Appendix B: API Response Format

For technical users and developers:

### Search API Response

```json
{
  "success": true,
  "query": "high protein low calorie",
  "criteria": {
    "protein": { "min": 20 },
    "calories": { "max": 400 }
  },
  "recommendations": [
    {
      "company": "McDonald's",
      "item": "Grilled Chicken Sandwich",
      "calories": 350,
      "protein": 28,
      "totalFat": 9,
      "saturatedFat": 2,
      "transFat": 0,
      "cholesterol": 70,
      "sodium": 820,
      "carbs": 44,
      "fiber": 3,
      "sugars": 11,
      "weightWatchersPoints": 8
    }
  ],
  "count": 10,
  "message": "Here are 10 recommendations based on your preferences"
}
```

---

## Appendix C: Glossary

**AI (Artificial Intelligence)** - Computer systems that can perform tasks requiring human intelligence

**API (Application Programming Interface)** - System that allows applications to communicate

**Calorie** - Unit of energy in food (technically kilocalorie)

**Carbohydrates** - Macronutrient providing energy, includes sugars and starches

**Cholesterol** - Fatty substance in blood; dietary cholesterol in food

**Daily Value (DV)** - Recommended daily amount of a nutrient (based on 2,000 cal diet)

**Fiber** - Indigestible carbohydrate that aids digestion

**Groq** - AI company providing LLM API (uses Llama models)

**Llama** - Large Language Model by Meta AI

**LLM (Large Language Model)** - AI model trained on vast text data

**Macros (Macronutrients)** - Protein, carbs, and fats

**MongoDB** - NoSQL database used by Howl2Go

**Natural Language** - Human language (vs. programming language)

**Next.js** - React framework for web applications

**Protein** - Macronutrient essential for building muscle and tissue

**Saturated Fat** - Type of fat that may raise cholesterol

**Sodium** - Mineral, often from salt; can raise blood pressure

**Trans Fat** - Unhealthy fat that should be avoided

**Weight Watchers Points** - Point system for tracking food in WW program

---

## Appendix D: FAQ Quick Reference

**Q: Do I need to create an account?**
A: Not currently. Account features are coming in Version 1.1.

**Q: How does the search work?**
A: Uses AI (Llama 3.1 via Groq) to understand your natural language queries.

**Q: Why no results for my search?**
A: Criteria might be too restrictive. Try broader terms or fewer requirements.

**Q: Can I order food?**
A: Not yet. Cart and ordering features are coming in Version 1.1.

**Q: Which restaurants are supported?**
A: Currently McDonald's, Burger King, Wendy's, KFC, and Taco Bell.

**Q: Is my search history saved?**
A: No, searches are not saved or tracked.

**Q: Can I customize items?**
A: Not yet. Customization features are planned for future updates.

**Q: How accurate is the nutritional information?**
A: Data is sourced from official restaurant nutrition guides.

**Q: Can I filter by allergens?**
A: Not yet. Allergen filtering is planned for future updates.

**Q: Is there a mobile app?**
A: No, but the web app is mobile-responsive.

---

## Appendix E: Contact & Support

### Support Channels

**GitHub Issues** (Recommended for bugs)
- https://github.com/harsha711/SE_Project_Grp_27/issues
- Response time: 24-48 hours

**GitHub Discussions** (For questions and ideas)
- https://github.com/harsha711/SE_Project_Grp_27/discussions
- Community-driven support

**Email Support**
- support@howl2go.com
- Response time: 48-72 hours

### Documentation

- **User Manual** - This document
- **Getting Started** - [GETTING_STARTED.md](GETTING_STARTED.md)
- **API Documentation** - [LLM_API_DOCUMENTATION.md](../Howl2Go_backend/LLM_API_DOCUMENTATION.md)
- **Developer Guide** - [DEVELOPER_SETUP.md](DEVELOPER_SETUP.md)

### Community

**GitHub Repository**
- https://github.com/harsha711/SE_Project_Grp_27

**Contribution Guide**
- See [CONTRIBUTING.md](../CONTRIBUTING.md)

---

## Version History

**Version 1.0.0** (Current)
- Initial release
- Natural language food search
- Multi-restaurant discovery
- Nutritional filtering
- Modern UI with animations

**Planned Version 1.1**
- User accounts and authentication
- Shopping cart functionality
- Order placement
- Payment integration
- Order tracking
- Order history
- Profile management

**Planned Version 2.0**
- More restaurant integrations
- Real delivery tracking
- Push notifications
- Driver features
- Restaurant dashboard
- Advanced filtering

---

## License

This user manual is part of the Howl2Go project, licensed under the MIT License.

Copyright (c) 2025 SE_Project_Grp_27

---

## Acknowledgments

**Created by:** SE_Project_Grp_27
**Lead Developer:** Harsha
**Documentation:** Howl2Go Team

**Technologies:**
- Next.js 15 & React 19
- Groq LLM (Llama 3.1)
- MongoDB Atlas
- Tailwind CSS
- Framer Motion

**Special Thanks:**
- Groq for LLM API access
- MongoDB for database hosting
- The open-source community

---

**Made with care for food lovers everywhere.**

*Crave it. Find it. Instantly.*

---

**End of User Manual**

*For the latest updates, visit: https://github.com/harsha711/SE_Project_Grp_27*
