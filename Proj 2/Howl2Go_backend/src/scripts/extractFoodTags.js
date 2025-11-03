import mongoose from 'mongoose';
import { config } from '../config/env.js';
import FastFoodItem from '../models/FastFoodItem.js';

/**
 * Script to extract unique food item categories/tags from the database
 * This analyzes item names and extracts common food categories like "burger", "pizza", "taco", etc.
 */

// Common food keywords to look for in item names
const FOOD_KEYWORDS = [
    'burger', 'hamburger', 'cheeseburger',
    'sandwich', 'wrap',
    'pizza',
    'taco', 'burrito', 'quesadilla', 'nacho',
    'salad',
    'chicken', 'nugget', 'wing', 'tender',
    'fries', 'french fries',
    'hot dog', 'hotdog',
    'sub', 'submarine',
    'fish', 'seafood', 'shrimp',
    'breakfast', 'pancake', 'waffle', 'omelette', 'omelet', 'egg',
    'coffee', 'latte', 'cappuccino', 'mocha', 'espresso',
    'shake', 'smoothie', 'frappe',
    'ice cream', 'sundae', 'cone',
    'cookie', 'brownie', 'muffin', 'donut', 'doughnut',
    'pie', 'turnover',
    'steak', 'beef', 'pork',
    'pasta', 'spaghetti', 'noodle',
    'soup',
    'potato', 'tots',
    'rice', 'bowl',
    'soda', 'drink', 'beverage',
    'dessert', 'cake'
];

async function extractFoodTags() {
    try {
        console.log('🔍 Connecting to MongoDB...');
        await mongoose.connect(config.mongodbUri);
        console.log('✅ Connected to MongoDB\n');

        console.log('📊 Fetching all food items...');
        const items = await FastFoodItem.find({}, { item: 1, _id: 0 }).lean();
        console.log(`✅ Found ${items.length} items\n`);

        // Extract all unique item names
        const itemNames = items.map(item => item.item.toLowerCase());
        const uniqueItemNames = [...new Set(itemNames)];

        console.log(`📝 Total unique item names: ${uniqueItemNames.length}\n`);

        // Find which keywords appear in the items
        const foundTags = new Map();

        for (const keyword of FOOD_KEYWORDS) {
            const matchingItems = uniqueItemNames.filter(name =>
                name.includes(keyword.toLowerCase())
            );

            if (matchingItems.length > 0) {
                foundTags.set(keyword, {
                    count: matchingItems.length,
                    examples: matchingItems.slice(0, 3) // First 3 examples
                });
            }
        }

        // Sort by count (most common first)
        const sortedTags = Array.from(foundTags.entries())
            .sort((a, b) => b[1].count - a[1].count);

        console.log('🏷️  FOOD TAGS FOUND IN DATABASE:');
        console.log('=' .repeat(80));
        console.log();

        // Print in a nice format
        sortedTags.forEach(([tag, data]) => {
            console.log(`📌 ${tag.toUpperCase()}`);
            console.log(`   Count: ${data.count} items`);
            console.log(`   Examples: ${data.examples.join(', ').substring(0, 100)}...`);
            console.log();
        });

        console.log('=' .repeat(80));
        console.log();

        // Export as a simple array
        const tagsList = sortedTags.map(([tag]) => tag);
        console.log('📋 TAGS AS ARRAY (copy this for use in your code):');
        console.log();
        console.log(JSON.stringify(tagsList, null, 2));
        console.log();

        // Also create a tags object with counts
        const tagsObject = Object.fromEntries(
            sortedTags.map(([tag, data]) => [tag, data.count])
        );
        console.log('📊 TAGS WITH COUNTS (as object):');
        console.log();
        console.log(JSON.stringify(tagsObject, null, 2));
        console.log();

        // Extract some actual unique item names as examples
        console.log('=' .repeat(80));
        console.log();
        console.log('💡 SAMPLE OF ACTUAL UNIQUE ITEM NAMES (first 50):');
        console.log();
        uniqueItemNames.slice(0, 50).forEach((name, index) => {
            console.log(`${(index + 1).toString().padStart(2, '0')}. ${name}`);
        });

        console.log();
        console.log('=' .repeat(80));
        console.log();

        // Categorize each unique item into tags
        console.log('🏷️  CATEGORIZED ITEMS (mapping each item to its tags):');
        console.log();

        const categorizedItems = [];

        for (const itemName of uniqueItemNames) {
            const matchedTags = [];

            // Find all tags that match this item
            for (const keyword of FOOD_KEYWORDS) {
                if (itemName.includes(keyword.toLowerCase())) {
                    matchedTags.push(keyword);
                }
            }

            // Prioritize main food category over modifiers
            let primaryTag = matchedTags[0] || 'other';

            // Smart categorization - prioritize main food items
            const mainFoodTags = ['burger', 'hamburger', 'cheeseburger', 'pizza', 'taco', 'burrito', 'sandwich', 'wrap', 'salad', 'nugget', 'wing', 'tender', 'fries', 'bowl'];
            const beverageTags = ['coffee', 'latte', 'cappuccino', 'mocha', 'shake', 'smoothie', 'frappe', 'soda', 'drink', 'beverage'];
            const dessertTags = ['pie', 'cookie', 'cake', 'ice cream', 'sundae', 'cone', 'brownie', 'muffin', 'donut', 'doughnut', 'dessert'];

            // Find the best primary tag
            const mainFood = matchedTags.find(tag => mainFoodTags.includes(tag));
            const beverage = matchedTags.find(tag => beverageTags.includes(tag));
            const dessert = matchedTags.find(tag => dessertTags.includes(tag));

            if (mainFood) primaryTag = mainFood;
            else if (beverage) primaryTag = beverage;
            else if (dessert) primaryTag = dessert;

            categorizedItems.push({
                item: itemName,
                primaryTag: primaryTag,
                allTags: matchedTags
            });
        }

        // Group items by primary tag
        const itemsByTag = {};
        categorizedItems.forEach(item => {
            if (!itemsByTag[item.primaryTag]) {
                itemsByTag[item.primaryTag] = [];
            }
            itemsByTag[item.primaryTag].push(item.item);
        });

        // Sort tags by number of items
        const sortedCategories = Object.entries(itemsByTag)
            .sort((a, b) => b[1].length - a[1].length);

        sortedCategories.forEach(([tag, items]) => {
            console.log(`📌 ${tag.toUpperCase()} (${items.length} items):`);
            items.slice(0, 5).forEach(item => {
                console.log(`   - ${item}`);
            });
            if (items.length > 5) {
                console.log(`   ... and ${items.length - 5} more`);
            }
            console.log();
        });

        console.log('=' .repeat(80));
        console.log();

        // Create a JSON output for programmatic use
        console.log('📦 CATEGORIZED DATA (JSON format for programmatic use):');
        console.log();
        console.log('// Map of tag -> array of items');
        console.log('const itemsByCategory = ' + JSON.stringify(itemsByTag, null, 2));
        console.log();

        // Also create reverse mapping: item -> primary tag
        const itemToTag = {};
        categorizedItems.forEach(item => {
            itemToTag[item.item] = item.primaryTag;
        });

        console.log('// Map of item name -> primary tag');
        console.log('const itemTagMapping = ' + JSON.stringify(itemToTag, null, 2));
        console.log();

        console.log('🎉 Tag extraction complete!');

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Connection closed.');
        process.exit(0);
    }
}

// Run the script
extractFoodTags();
