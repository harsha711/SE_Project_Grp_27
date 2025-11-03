import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app.js';
import connectDB from '../config/database.js';
import FastFoodItem from '../models/FastFoodItem.js';
import { llmService } from '../services/llm.service.js';

const TEST_COMPANY = 'Integration Test Kitchen';
const SEED_ITEMS = [
  {
    company: TEST_COMPANY,
    item: 'Power Protein Bowl',
    calories: 480,
    protein: 42,
    carbs: 48
  },
  {
    company: TEST_COMPANY,
    item: 'Lean Chicken Salad',
    calories: 340,
    protein: 28,
    carbs: 24
  },
  {
    company: TEST_COMPANY,
    item: 'Fresh Quinoa Wrap',
    calories: 260,
    protein: 18,
    carbs: 36
  },
  {
    company: 'Outside Vendor',
    item: 'Classic Cheeseburger',
    calories: 640,
    protein: 26,
    carbs: 52
  }
];

const llmResponses = new Map();
let originalParseQuery;

const setMockedLlmResponse = (prompt, criteria) => {
  llmResponses.set(prompt, criteria);
};

test.before(async () => {
  originalParseQuery = llmService.parseQuery;

  llmService.parseQuery = async (prompt) => {
    if (!prompt || typeof prompt !== 'string') {
      throw new Error('User prompt must be a non-empty string');
    }

    if (!llmResponses.has(prompt)) {
      throw new Error(`No mocked LLM response configured for prompt: ${prompt}`);
    }

    const criteria = llmResponses.get(prompt);

    return {
      success: true,
      criteria,
      rawResponse: JSON.stringify(criteria)
    };
  };

  await connectDB();
  await FastFoodItem.deleteMany({ company: { $in: [TEST_COMPANY, 'Outside Vendor'] } });
  await FastFoodItem.insertMany(SEED_ITEMS);
});

test.afterEach(() => {
  llmResponses.clear();
});

test.after(async () => {
  llmService.parseQuery = originalParseQuery;
  await FastFoodItem.deleteMany({ company: { $in: [TEST_COMPANY, 'Outside Vendor'] } });
  await mongoose.connection.close();
});

test('POST /api/food/parse returns parsed criteria from mocked LLM response', async () => {
  const prompt = 'Show me high protein meals from Integration Test Kitchen';
  const criteria = {
    company: { name: TEST_COMPANY },
    protein: { min: 40 }
  };

  setMockedLlmResponse(prompt, criteria);

  const response = await request(app)
    .post('/api/food/parse')
    .send({ query: prompt });

  assert.equal(response.status, 200);
  assert.equal(response.body.success, true);
  assert.equal(response.body.query, prompt);
  assert.deepEqual(response.body.criteria, criteria);
  assert.equal(response.body.message, 'Query parsed successfully');
});

test('POST /api/food/search filters results using criteria from mocked LLM response', async () => {
  const prompt = 'Find the most protein packed options from Integration Test Kitchen';
  const criteria = {
    company: { name: TEST_COMPANY },
    protein: { min: 40 }
  };

  setMockedLlmResponse(prompt, criteria);

  const response = await request(app)
    .post('/api/food/search')
    .send({
      query: prompt,
      limit: 5,
      page: 1
    });

  assert.equal(response.status, 200);
  assert.equal(response.body.success, true);
  assert.equal(response.body.query, prompt);
  assert.deepEqual(response.body.criteria, criteria);
  assert.equal(response.body.results.length, 1);
  assert.equal(response.body.results[0].item, 'Power Protein Bowl');
  assert.equal(response.body.pagination.total, 1);
  assert.equal(response.body.pagination.page, 1);
  assert.equal(response.body.pagination.limit, 5);
});

test('POST /api/food/recommend sorts recommendations by protein when criteria requests high protein', async () => {
  const prompt = 'Recommend protein focused dishes from Integration Test Kitchen';
  const criteria = {
    company: { name: TEST_COMPANY },
    protein: { min: 20 }
  };

  setMockedLlmResponse(prompt, criteria);

  const response = await request(app)
    .post('/api/food/recommend')
    .send({ query: prompt });

  assert.equal(response.status, 200);
  assert.equal(response.body.success, true);
  assert.equal(response.body.query, prompt);
  assert.equal(response.body.count, 2);
  assert.equal(response.body.recommendations.length, 2);
  assert.equal(response.body.recommendations[0].item, 'Power Protein Bowl');
  assert.equal(response.body.recommendations[1].item, 'Lean Chicken Salad');
  assert.ok(response.body.recommendations[0].protein >= response.body.recommendations[1].protein);
});

test('POST /api/food/stats calculates summary metrics for matched items', async () => {
  const prompt = 'Summarize lighter entrees from Integration Test Kitchen';
  const criteria = {
    company: { name: TEST_COMPANY },
    calories: { max: 400 }
  };

  setMockedLlmResponse(prompt, criteria);

  const response = await request(app)
    .post('/api/food/stats')
    .send({ query: prompt });

  assert.equal(response.status, 200);
  assert.equal(response.body.success, true);
  assert.equal(response.body.query, prompt);
  assert.deepEqual(response.body.criteria, criteria);
  assert.equal(response.body.stats.count, 2);
  assert.equal(response.body.stats.averages.calories, 300);
  assert.equal(response.body.stats.averages.protein, 23);
  assert.equal(response.body.stats.ranges.calories.min, 260);
  assert.equal(response.body.stats.ranges.calories.max, 340);
});

test('POST /api/food/search rejects natural language prompts without nutritional criteria', async () => {
  const prompt = 'Tell me something interesting about space exploration';

  setMockedLlmResponse(prompt, {});

  const response = await request(app)
    .post('/api/food/search')
    .send({ query: prompt });

  assert.equal(response.status, 400);
  assert.equal(response.body.success, false);
  assert.match(response.body.error, /No nutritional criteria/i);
});

test('POST /api/food/search requires a query in the request body', async () => {
  const response = await request(app)
    .post('/api/food/search')
    .send({});

  assert.equal(response.status, 400);
  assert.equal(response.body.success, false);
  assert.match(response.body.error, /Query parameter is required/i);
});
