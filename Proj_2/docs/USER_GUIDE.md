# Howl2Go - Complete User Guide

**Welcome to Howl2Go!** This comprehensive guide will walk you through every feature of our AI-powered food discovery platform.

---

## 📋 Table of Contents

1. [Getting Started](#getting-started)
2. [Account Management](#account-management)
3. [Searching for Food](#searching-for-food)
4. [Shopping Cart](#shopping-cart)
5. [Placing Orders](#placing-orders)
6. [Order History & Insights](#order-history--insights)
7. [Dashboard](#dashboard)
8. [Tips & Best Practices](#tips--best-practices)
9. [Troubleshooting](#troubleshooting)

---

## 🚀 Getting Started

### First Visit

When you first visit Howl2Go, you'll see our beautiful homepage with:

- **Hero Section**: An animated headline welcoming you
- **Search Bar**: The main way to find food items
- **Featured Sections**: Popular items and recommendations
- **Navigation**: Access to all features

### Quick Start

1. **No Account Required**: You can start searching immediately without signing up!
2. **Search for Food**: Type what you want in natural language (e.g., "high protein meal")
3. **Add to Cart**: Click "Add" on any item you like
4. **View Cart**: Click the cart icon in the header
5. **Sign Up** (Optional): Create an account to save your orders and get personalized insights

---

## 👤 Account Management

### Creating an Account

1. Click **"Sign Up"** in the top navigation
2. Fill in your details:
   - **Name**: Your full name
   - **Email**: A valid email address (must be unique)
   - **Password**: At least 8 characters
3. Click **"Create Account"**
4. You'll be automatically logged in

### Logging In

1. Click **"Login"** in the top navigation
2. Enter your email and password
3. Click **"Sign In"**
4. You'll be redirected to your dashboard

### User Profile

Once logged in, you can:
- View your profile information
- See your order history
- Access personalized recommendations
- Manage your preferences

### Logging Out

Click your profile icon or the **"Logout"** button in the navigation menu.

---

## 🔍 Searching for Food

### Natural Language Search

Howl2Go's biggest feature is **natural language search**. Instead of using complex filters, just describe what you want!

#### Basic Searches

**Calorie-Based:**
- `"under 500 calories"`
- `"low calorie meal"`
- `"high calorie food"`
- `"between 400 and 600 calories"`

**Protein-Focused:**
- `"high protein meal"`
- `"at least 30g protein"`
- `"low protein snack"`

**Fat & Carbs:**
- `"low fat burger"`
- `"low carb meal"`
- `"high fiber food"`
- `"low sugar options"`

**Combined Searches:**
- `"high protein low carb under 500 calories"`
- `"low fat high fiber meal"`
- `"low calorie high protein snack"`

#### Restaurant-Specific Searches

- `"McDonald's burger"`
- `"Burger King low calorie"`
- `"Wendy's high protein"`

#### Item-Specific Searches

- `"Big Mac"`
- `"chicken sandwich"`
- `"burger under 300 calories"`

### How Search Works

1. **Type Your Query**: Enter what you want in the search bar
2. **AI Processing**: Our AI (Llama 3.1) understands your request
3. **Smart Matching**: We search through 1,148+ items from multiple restaurants
4. **Results Display**: Items matching your criteria appear instantly

### Search Results Page

The search results page shows:

- **Item Cards**: Each item displays:
  - Restaurant logo
  - Item name
  - Restaurant name
  - Calories
  - Price
  - **"Details"** button: View full nutrition information
  - **"Add"** button: Add to cart

- **Nutrition Info**: Click "Details" to see:
  - Total fat, saturated fat, trans fat
  - Protein, carbohydrates, fiber
  - Sugars, sodium, cholesterol
  - All nutritional values

### Tips for Better Searches

✅ **Do:**
- Be specific: `"high protein low fat under 500 calories"`
- Use natural language: `"healthy breakfast option"`
- Combine criteria: `"low calorie high fiber meal"`

❌ **Don't:**
- Use complex technical terms
- Search for non-food items
- Use abbreviations (spell out "calories")

---

## 🛒 Shopping Cart

### Adding Items to Cart

1. **From Search Results**: Click the **"Add"** button on any item card
2. **From Item Details**: Click **"Add to Cart"** in the details view
3. **Multiple Items**: Add as many items as you want
4. **Same Item Twice**: If you add the same item again, the quantity increases automatically

### Viewing Your Cart

1. Click the **cart icon** in the top navigation
2. You'll see:
   - All items in your cart
   - Quantity for each item
   - Individual item prices
   - Order summary with totals

### Managing Cart Items

**Increase Quantity:**
- Click the **"+"** button next to an item
- Or click **"Add"** on the same item again

**Decrease Quantity:**
- Click the **"-"** button next to an item
- If quantity reaches 0, the item is removed

**Remove Item:**
- Click the **trash icon** next to any item
- The item is immediately removed from your cart

**Clear Entire Cart:**
- Click **"Clear Cart"** button (if available)
- All items will be removed

### Cart Summary

The cart shows:
- **Subtotal**: Sum of all item prices
- **Tax**: 8% tax on subtotal
- **Delivery Fee**: $3.99 (free on orders over $30)
- **Total**: Final amount to pay

### Guest vs. Logged-In Cart

- **Guest Users**: Cart is saved in your browser session
- **Logged-In Users**: Cart is saved to your account and synced across devices
- **Cart Merging**: When you log in, your guest cart merges with your account cart

---

## 📦 Placing Orders

### Before Placing an Order

1. **Review Your Cart**: Make sure all items are correct
2. **Check Quantities**: Verify quantities for each item
3. **Review Total**: Confirm the final price

### Placing an Order

1. Go to your **Cart** page
2. Review all items and the order summary
3. Click **"Place Order"** button
4. Wait for order processing (2-3 seconds)
5. You'll see a success message
6. You'll be redirected to your **Order History** page

### Order Confirmation

After placing an order, you'll see:
- ✅ **Success Animation**: Confirmation that your order was placed
- **Order Number**: Unique identifier for your order
- **Order Total**: Final amount charged
- **Item Count**: Number of items in the order

### What Happens After Ordering

- ✅ Cart is automatically cleared
- ✅ Order is saved to your account
- ✅ Order appears in your Order History
- ✅ Nutrition data is tracked for insights

---

## 📊 Order History & Insights

### Accessing Order History

1. Click **"Orders"** in the navigation (must be logged in)
2. Or visit `/orders` directly
3. You'll see all your past orders

### Order History Features

#### Time Range Filters

Filter orders by:
- **All**: All orders ever placed
- **Week**: Orders from the last 7 days
- **Month**: Orders from the last 30 days
- **Year**: Orders from the last 365 days

#### Order Details

Each order card shows:
- **Order Number**: Unique identifier (e.g., ORD-ABC123-XYZ789)
- **Date & Time**: When the order was placed
- **Total Price**: Final amount paid
- **Item Count**: Number of items
- **Item List**: First 3 items (with "+X more" if applicable)
- **Nutrition Summary**: Calories, protein, fat per order
- **Status**: Completed, pending, or cancelled

### 📈 Nutrition Patterns

The insights panel shows:

**Average Nutrition:**
- Average calories per order
- Average protein per order
- Average fat per order
- Average carbs per order

**Top Restaurants:**
- Your most frequently ordered restaurants
- Order count for each restaurant

**Top Items:**
- Your most frequently ordered items
- Order count for each item

**Nutrition Distribution:**
- Low/Medium/High calorie orders breakdown
- Low/Medium/High protein orders breakdown

### 📉 Dietary Trends

**Trend Analysis:**
- Time-based nutrition trends
- Comparison with previous periods
- Visual indicators for improvements or warnings

**Trend Insights:**
- ✅ **Improvements**: When you've reduced calories or increased protein
- ⚠️ **Warnings**: When calorie intake has increased significantly

### 💡 Personalized Recommendations

Based on your ordering habits, you'll receive:

**High Priority Recommendations:**
- Calorie reduction suggestions
- Protein increase recommendations
- Health-focused tips

**Medium Priority Recommendations:**
- Trend-based warnings
- Balance suggestions

**Low Priority Recommendations:**
- Restaurant diversity suggestions
- Balanced meal confirmations

**Recommendation Types:**
- **Calorie Reduction**: If average calories are high
- **Protein Increase**: If protein intake is low
- **Diversity**: If you order from one restaurant too often
- **Trend Warnings**: Based on recent changes
- **Balanced Meals**: Positive feedback for good choices

### Using Insights

1. **Review Patterns**: Understand your eating habits
2. **Check Trends**: See how your nutrition changes over time
3. **Follow Recommendations**: Use suggestions to improve your diet
4. **Track Progress**: Monitor improvements in your nutrition

---

## 🎯 Dashboard

### Accessing Dashboard

1. Log in to your account
2. Click **"Dashboard"** in the navigation
3. Or visit `/dashboard` directly

### Dashboard Features

**Personalized Greeting:**
- Welcome message with your name
- Time-based greetings (Good morning, afternoon, evening)

**Daily Progress:**
- Calorie tracking (if available)
- Protein goals
- Visual progress rings

**Recent Meals:**
- Today's logged meals
- Grouped by meal type (breakfast, lunch, dinner, snack)
- Quick access to meal details

**Quick Actions:**
- Search for food
- View cart
- Check order history

---

## 💡 Tips & Best Practices

### Getting Better Search Results

1. **Be Specific**: More specific queries = better results
   - ✅ `"high protein low fat under 500 calories"`
   - ❌ `"food"`

2. **Use Natural Language**: Write as you speak
   - ✅ `"healthy breakfast option"`
   - ❌ `"calories<500 AND protein>30"`

3. **Combine Criteria**: Mix multiple requirements
   - ✅ `"low calorie high fiber meal"`
   - ✅ `"McDonald's burger under 400 calories"`

4. **Try Different Phrasings**: If one doesn't work, rephrase
   - `"low fat"` vs `"low in fat"`
   - `"high protein"` vs `"protein rich"`

### Managing Your Cart

1. **Review Before Ordering**: Always check your cart before placing an order
2. **Adjust Quantities**: Use +/- buttons to fine-tune
3. **Remove Unwanted Items**: Keep your cart clean
4. **Check Totals**: Verify prices before ordering

### Using Order Insights

1. **Check Regularly**: Review insights weekly or monthly
2. **Follow Recommendations**: Implement suggested changes
3. **Track Trends**: Monitor your nutrition over time
4. **Set Goals**: Use insights to set personal nutrition goals

### Account Management

1. **Keep Email Updated**: Use a valid email for account recovery
2. **Strong Password**: Use a secure password (8+ characters)
3. **Stay Logged In**: For better cart sync and insights
4. **Review Orders**: Check order history regularly

---

## 🔧 Troubleshooting

### Search Issues

**Problem**: No results found
- **Solution**: Try a broader search or different keywords
- **Example**: Instead of `"McDonald's Big Mac with no pickles"`, try `"Big Mac"`

**Problem**: Results don't match what I want
- **Solution**: Be more specific in your query
- **Example**: Add calorie or nutrition constraints

**Problem**: Search is slow
- **Solution**: Check your internet connection
- **Note**: First search may take 2-3 seconds (AI processing)

### Cart Issues

**Problem**: Items not adding to cart
- **Solution**: 
  - Make sure you're clicking the "Add" button
  - Check if you're logged in (for account sync)
  - Refresh the page and try again

**Problem**: Cart is empty when I return
- **Solution**: 
  - If you're a guest, cart is session-based (clears when browser closes)
  - Log in to save cart to your account
  - Check if you cleared the cart accidentally

**Problem**: Wrong quantities
- **Solution**: Use +/- buttons to adjust
- Or remove and re-add items

### Order Issues

**Problem**: Can't place order
- **Solution**: 
  - Make sure cart is not empty
  - Check if you're logged in (required for orders)
  - Verify internet connection
  - Try refreshing the page

**Problem**: Order not showing in history
- **Solution**: 
  - Make sure you're logged in
  - Check the time range filter (try "All")
  - Refresh the page
  - Contact support if issue persists

### Account Issues

**Problem**: Can't log in
- **Solution**: 
  - Verify email and password
  - Check if Caps Lock is on
  - Try password reset (if available)
  - Make sure account exists

**Problem**: Can't create account
- **Solution**: 
  - Check if email is already registered
  - Ensure password is 8+ characters
  - Verify email format is correct
  - Try a different email

### General Issues

**Problem**: Page not loading
- **Solution**: 
  - Check internet connection
  - Clear browser cache
  - Try a different browser
  - Refresh the page

**Problem**: Features not working
- **Solution**: 
  - Make sure JavaScript is enabled
  - Update your browser
  - Try incognito/private mode
  - Contact support

---

## 📱 Features Summary

### ✅ Available Features

1. **🔍 Natural Language Search**
   - AI-powered food discovery
   - 1,148+ items from 6+ restaurants
   - Multiple nutrition filters

2. **🛒 Shopping Cart**
   - Add/remove items
   - Quantity management
   - Session-based (guest) or account-based (logged in)
   - Automatic cart merging on login

3. **📦 Order Management**
   - Place orders
   - Order history
   - Order tracking
   - Order details

4. **📊 Order Insights**
   - Nutrition pattern analysis
   - Dietary trend tracking
   - Personalized recommendations
   - Time-based filtering

5. **👤 User Accounts**
   - Registration & login
   - Profile management
   - Order history
   - Personalized dashboard

6. **🎨 Beautiful UI**
   - Dark theme
   - Smooth animations
   - Responsive design
   - Mobile-friendly

### 🚧 Coming Soon

- Payment processing
- Ingredient-based filtering
- Meal planning
- Social features
- Mobile app

---

## 🆘 Need Help?

### Support Resources

- **Email**: supp0rt.howl2go@gmail.com
- **GitHub Issues**: [Report a bug](https://github.com/harsha711/SE_Project_Grp_27/issues)
- **Documentation**: Check our [docs folder](Proj_2/docs/)

### Common Questions

**Q: Do I need an account to search?**
A: No! You can search and add items to cart without an account. However, you need an account to place orders and view order history.

**Q: How accurate are the nutrition values?**
A: All nutrition data comes from official restaurant sources and is stored in our database. We strive for 100% accuracy.

**Q: Can I order food through Howl2Go?**
A: Currently, Howl2Go is a discovery and tracking platform. We help you find and track food items, but actual ordering is done through the restaurants.

**Q: How often are insights updated?**
A: Insights are calculated in real-time based on your order history. They update immediately after placing a new order.

**Q: Can I delete my account?**
A: Contact support at supp0rt.howl2go@gmail.com for account deletion requests.

---

## 🎉 You're All Set!

You now know everything about Howl2Go! Start exploring and discover your perfect meal.

**Happy Searching! 🍔**

---

*Last Updated: December 2024*
*Version: 1.0.0*

