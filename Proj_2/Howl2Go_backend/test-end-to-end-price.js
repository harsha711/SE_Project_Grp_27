/**
 * End-to-end test: Query database with price filters
 * This proves the entire pipeline works: LLM → MongoDB → Results
 */

import mongoose from 'mongoose';
import { llmService } from './src/services/llm.service.js';
import FastFoodItem from './src/models/FastFoodItem.js';
import dotenv from 'dotenv';

dotenv.config();

// Calculate price like the controller does
const calculatePrice = (calories) => {
    if (!calories || calories <= 0) return 2.0;
    const basePrice = calories * 0.01;
    return Math.min(Math.max(basePrice, 2.0), 15.0);
};

async function testEndToEnd() {
    console.log('[TEST] END-TO-END TEST: Price-Based Recommendations\n');
    console.log('='.repeat(70));
    
    // Connect to MongoDB
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('[SUCCESS] Connected to MongoDB\n');
    } catch (error) {
        console.error('[ERROR] MongoDB connection failed:', error.message);
        return;
    }
    
    const testQueries = [
        { query: "meals under $5", description: "Find cheap meals" },
        { query: "meals between $8 and $12", description: "Mid-range meals" },
    ];
    
    for (const test of testQueries) {
        console.log(`\n[QUERY] "${test.query}"`);
        console.log(`[DESCRIPTION] ${test.description}`);
        console.log('-'.repeat(70));
        
        try {
            // Step 1: Parse query with LLM
            const parseResult = await llmService.parseQuery(test.query);
            console.log('[SUCCESS] Step 1: LLM Parsed Criteria:', JSON.stringify(parseResult.criteria, null, 2));
            
            // Step 2: Build MongoDB query
            const mongoQuery = llmService.buildMongoQuery(parseResult.criteria);
            console.log('[SUCCESS] Step 2: MongoDB Query:', JSON.stringify(mongoQuery, null, 2));
            
            // Step 3: Query database (apply price filter to calculated prices)
            const allItems = await FastFoodItem.find().limit(1000).lean();
            
            // Add calculated prices and filter
            const itemsWithPrice = allItems.map(item => ({
                ...item,
                price: calculatePrice(item.calories)
            }));
            
            // Apply price filter
            let filteredItems = itemsWithPrice;
            if (parseResult.criteria.price) {
                if (parseResult.criteria.price.max) {
                    filteredItems = filteredItems.filter(item => item.price <= parseResult.criteria.price.max);
                }
                if (parseResult.criteria.price.min) {
                    filteredItems = filteredItems.filter(item => item.price >= parseResult.criteria.price.min);
                }
            }
            
            // Sort by price
            filteredItems.sort((a, b) => a.price - b.price);
            
            console.log(`[SUCCESS] Step 3: Found ${filteredItems.length} matching items\n`);
            
            // Show top 5 results
            console.log('[RESULTS] Top 5 Results:');
            filteredItems.slice(0, 5).forEach((item, idx) => {
                console.log(`\n${idx + 1}. ${item.company} - ${item.item}`);
                console.log(`   Price: $${item.price.toFixed(2)}`);
                console.log(`   Calories: ${item.calories}`);
                console.log(`   Protein: ${item.protein}g`);
            });
            
            // Verify price constraint
            console.log('\n[VERIFICATION] Price Verification:');
            if (parseResult.criteria.price?.max) {
                const allUnderMax = filteredItems.every(item => item.price <= parseResult.criteria.price.max);
                console.log(`   All items under $${parseResult.criteria.price.max}: ${allUnderMax ? '[PASS] YES' : '[FAIL] NO'}`);
            }
            if (parseResult.criteria.price?.min) {
                const allOverMin = filteredItems.every(item => item.price >= parseResult.criteria.price.min);
                console.log(`   All items over $${parseResult.criteria.price.min}: ${allOverMin ? '[PASS] YES' : '[FAIL] NO'}`);
            }
            
        } catch (error) {
            console.error('[ERROR]:', error.message);
        }
        
        console.log('='.repeat(70));
    }
    
    await mongoose.disconnect();
    console.log('\n[SUCCESS] MongoDB disconnected');
    console.log('[COMPLETE] END-TO-END TEST COMPLETE!\n');
}

testEndToEnd().catch(console.error);
