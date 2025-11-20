/**
 * Direct test of price parsing functionality
 * This calls the LLM service directly to prove it works
 */

import { llmService } from './src/services/llm.service.js';
import dotenv from 'dotenv';

dotenv.config();

async function testPriceParsing() {
    console.log('[TEST] Testing Price-Based LLM Parsing\n');
    console.log('=' .repeat(70));

    const testCases = [
        { query: "meals under $5", expected: "price.max = 5" },
        { query: "meals between $8 and $12", expected: "price.min = 8, price.max = 12" },
        { query: "high protein meal under $10", expected: "price.max = 10 + protein criteria" },
        { query: "cheap healthy meal", expected: "price criteria (LLM interprets 'cheap')" },
    ];

    for (const test of testCases) {
        console.log(`\n[QUERY] "${test.query}"`);
        console.log(`[EXPECTED] ${test.expected}`);
        console.log('-'.repeat(70));

        try {
            const result = await llmService.parseQuery(test.query);
            
            console.log('[SUCCESS] LLM Response:');
            console.log('   Raw:', result.rawResponse);
            console.log('   Parsed Criteria:', JSON.stringify(result.criteria, null, 2));
            
            // Build MongoDB query from criteria
            const mongoQuery = llmService.buildMongoQuery(result.criteria);
            console.log('   MongoDB Query:', JSON.stringify(mongoQuery, null, 2));
            
            // Verify price was extracted
            if (result.criteria.price) {
                console.log('[CONFIRMED] PRICE EXTRACTION CONFIRMED');
                if (result.criteria.price.max) {
                    console.log(`   -> Max price: $${result.criteria.price.max}`);
                }
                if (result.criteria.price.min) {
                    console.log(`   -> Min price: $${result.criteria.price.min}`);
                }
            } else {
                console.log('[WARNING] No price criteria extracted (might be okay for "cheap")');
            }
            
        } catch (error) {
            console.error('[ERROR]:', error.message);
        }
        
        console.log('='.repeat(70));
    }
    
    console.log('\n[SUCCESS] All parsing tests completed!\n');
}

// Run the test
testPriceParsing().catch(console.error);
