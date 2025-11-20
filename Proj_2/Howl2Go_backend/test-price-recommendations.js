/**
 * Manual test script for price-based recommendations
 * This tests the complete flow with actual API calls
 */

import fetch from 'node-fetch';

const API_BASE = 'http://localhost:4000/api';

// Test queries
const testQueries = [
    { query: "meals under $5", description: "Price filter: under $5" },
    { query: "meals between $8 and $12", description: "Price range: $8-$12" },
    { query: "high protein meal under $10", description: "Price + nutrition" },
    { query: "cheap healthy meal", description: "Natural language price" },
    { query: "budget-friendly lunch", description: "Budget-friendly query" }
];

async function testRecommendation(testCase) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Testing: ${testCase.description}`);
    console.log(`Query: "${testCase.query}"`);
    console.log('='.repeat(60));

    try {
        const response = await fetch(`${API_BASE}/food/recommend`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: testCase.query })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error(`[ERROR] ${response.status}:`, data.error || data.message);
            return;
        }

        console.log(`[SUCCESS] Got ${data.count} recommendations`);
        console.log(`\nParsed Criteria:`, JSON.stringify(data.criteria, null, 2));

        if (data.recommendations && data.recommendations.length > 0) {
            console.log(`\nTop 5 Results:`);
            data.recommendations.slice(0, 5).forEach((item, idx) => {
                const price = item.price || (item.calories * 0.01);
                console.log(`\n${idx + 1}. ${item.company} - ${item.item}`);
                console.log(`   Price: $${price.toFixed(2)}`);
                console.log(`   Calories: ${item.calories}, Protein: ${item.protein}g`);
            });
        }

    } catch (error) {
        console.error(`[ERROR] Request failed:`, error.message);
    }
}

async function runTests() {
    console.log('\n[TEST] Testing Price-Based Recommendations Feature');
    console.log('[INFO] API Base:', API_BASE);

    // Test health endpoint first
    try {
        const health = await fetch(`${API_BASE}/health`);
        if (health.ok) {
            console.log('[SUCCESS] Backend is running\n');
        } else {
            console.error('[ERROR] Backend health check failed');
            return;
        }
    } catch (error) {
        console.error('[ERROR] Cannot connect to backend. Make sure it\'s running with: npm run dev');
        return;
    }

    // Run all test cases
    for (const testCase of testQueries) {
        await testRecommendation(testCase);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limiting
    }

    console.log('\n' + '='.repeat(60));
    console.log('[SUCCESS] All tests completed!');
    console.log('='.repeat(60) + '\n');
}

// Run tests
runTests().catch(console.error);
