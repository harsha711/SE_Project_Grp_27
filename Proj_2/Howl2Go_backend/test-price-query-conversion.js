/**
 * Test price-based query functionality
 * Verifies that price constraints are converted to calorie constraints correctly
 */

import { llmService } from './src/services/llm.service.js';

console.log('='.repeat(60));
console.log('TESTING PRICE-BASED QUERIES');
console.log('='.repeat(60));
console.log();

console.log('Price Formula: price = calories * $0.01 (min $2, max $15)');
console.log('Reverse Formula: calories = price / $0.01');
console.log();

// Test 1: Under $5
console.log('[TEST 1] Query: "meals under $5"');
const test1 = { price: { max: 5 } };
const query1 = llmService.buildMongoQuery(test1);
console.log('  Input criteria:', JSON.stringify(test1, null, 2));
console.log('  MongoDB query:', JSON.stringify(query1, null, 2));
console.log('  Expected: calories <= 500');
console.log('  Result:', query1.calories?.$lte === 500 ? 'PASS' : 'FAIL');
console.log();

// Test 2: Between $10 and $15
console.log('[TEST 2] Query: "meals between $10 and $15"');
const test2 = { price: { min: 10, max: 15 } };
const query2 = llmService.buildMongoQuery(test2);
console.log('  Input criteria:', JSON.stringify(test2, null, 2));
console.log('  MongoDB query:', JSON.stringify(query2, null, 2));
console.log('  Expected: 1000 <= calories <= 1500');
const pass2 = query2.calories?.$gte === 1000 && query2.calories?.$lte === 1500;
console.log('  Result:', pass2 ? 'PASS' : 'FAIL');
console.log();

// Test 3: Over $8
console.log('[TEST 3] Query: "meals over $8"');
const test3 = { price: { min: 8 } };
const query3 = llmService.buildMongoQuery(test3);
console.log('  Input criteria:', JSON.stringify(test3, null, 2));
console.log('  MongoDB query:', JSON.stringify(query3, null, 2));
console.log('  Expected: calories >= 800');
console.log('  Result:', query3.calories?.$gte === 800 ? 'PASS' : 'FAIL');
console.log();

// Test 4: Under $2 (minimum price edge case)
console.log('[TEST 4] Query: "meals under $2" (edge case - minimum price)');
const test4 = { price: { max: 2 } };
const query4 = llmService.buildMongoQuery(test4);
console.log('  Input criteria:', JSON.stringify(test4, null, 2));
console.log('  MongoDB query:', JSON.stringify(query4, null, 2));
console.log('  Expected: calories <= 200 (since minimum price is $2)');
console.log('  Result:', query4.calories?.$lte === 200 ? 'PASS' : 'FAIL');
console.log();

// Test 5: Over $15 (maximum price edge case)
console.log('[TEST 5] Query: "meals over $15" (edge case - maximum price)');
const test5 = { price: { min: 15 } };
const query5 = llmService.buildMongoQuery(test5);
console.log('  Input criteria:', JSON.stringify(test5, null, 2));
console.log('  MongoDB query:', JSON.stringify(query5, null, 2));
console.log('  Expected: calories >= 1500 (since maximum price is $15)');
console.log('  Result:', query5.calories?.$gte === 1500 ? 'PASS' : 'FAIL');
console.log();

// Test 6: Combined price and nutrition
console.log('[TEST 6] Query: "high protein meal under $10"');
const test6 = { price: { max: 10 }, protein: { min: 25 } };
const query6 = llmService.buildMongoQuery(test6);
console.log('  Input criteria:', JSON.stringify(test6, null, 2));
console.log('  MongoDB query:', JSON.stringify(query6, null, 2));
console.log('  Expected: calories <= 1000 AND protein >= 25');
const pass6 = query6.calories?.$lte === 1000 && query6.protein?.$gte === 25;
console.log('  Result:', pass6 ? 'PASS' : 'FAIL');
console.log();

// Test 7: Price range $5-$10
console.log('[TEST 7] Query: "meals between $5 and $10"');
const test7 = { price: { min: 5, max: 10 } };
const query7 = llmService.buildMongoQuery(test7);
console.log('  Input criteria:', JSON.stringify(test7, null, 2));
console.log('  MongoDB query:', JSON.stringify(query7, null, 2));
console.log('  Expected: 500 <= calories <= 1000');
const pass7 = query7.calories?.$gte === 500 && query7.calories?.$lte === 1000;
console.log('  Result:', pass7 ? 'PASS' : 'FAIL');
console.log();

console.log('='.repeat(60));
console.log('SUMMARY');
console.log('='.repeat(60));
console.log('All tests verify that price constraints are correctly');
console.log('converted to calorie constraints for MongoDB queries.');
console.log();
console.log('This allows price-based searches to work even though');
console.log('price is not stored in the database (calculated dynamically).');
console.log('='.repeat(60));
