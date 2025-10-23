import test from 'node:test';
import assert from 'node:assert/strict';
import { llmService } from '../services/llm.service.js';

test('LLM Service - buildPrompt creates correct prompt format', () => {
  const userPrompt = 'I want a high protein meal';
  const prompt = llmService.buildPrompt(userPrompt);

  assert.ok(prompt.includes(userPrompt));
  assert.ok(prompt.includes('json object'));
  assert.ok(prompt.includes('nutritional'));
  assert.ok(prompt.includes('protein'));
});

test('LLM Service - buildMongoQuery handles protein min constraint', () => {
  const criteria = {
    protein: { min: 30 }
  };

  const query = llmService.buildMongoQuery(criteria);

  assert.deepEqual(query, {
    protein: { $gte: 30 }
  });
});

test('LLM Service - buildMongoQuery handles calories max constraint', () => {
  const criteria = {
    calories: { max: 500 }
  };

  const query = llmService.buildMongoQuery(criteria);

  assert.deepEqual(query, {
    calories: { $lte: 500 }
  });
});

test('LLM Service - buildMongoQuery handles multiple constraints', () => {
  const criteria = {
    protein: { min: 30 },
    calories: { max: 500 },
    fat: { max: 20 }
  };

  const query = llmService.buildMongoQuery(criteria);

  assert.deepEqual(query, {
    protein: { $gte: 30 },
    calories: { $lte: 500 },
    total_fat: { $lte: 20 }
  });
});

test('LLM Service - buildMongoQuery handles min and max for same field', () => {
  const criteria = {
    protein: { min: 20, max: 40 }
  };

  const query = llmService.buildMongoQuery(criteria);

  assert.deepEqual(query, {
    protein: { $gte: 20, $lte: 40 }
  });
});

test('LLM Service - buildMongoQuery handles all supported fields', () => {
  const criteria = {
    calories: { min: 100 },
    protein: { max: 50 },
    fat: { min: 10 },
    carbs: { max: 30 },
    fiber: { min: 5 },
    sugar: { max: 15 },
    sodium: { max: 1000 },
    cholesterol: { max: 200 },
    saturated_fat: { max: 10 },
    trans_fat: { max: 2 }
  };

  const query = llmService.buildMongoQuery(criteria);

  assert.deepEqual(query, {
    calories: { $gte: 100 },
    protein: { $lte: 50 },
    total_fat: { $gte: 10 },
    total_carb: { $lte: 30 },
    fiber: { $gte: 5 },
    sugar: { $lte: 15 },
    sodium: { $lte: 1000 },
    cholesterol: { $lte: 200 },
    sat_fat: { $lte: 10 },
    trans_fat: { $lte: 2 }
  });
});

test('LLM Service - buildMongoQuery returns empty object for empty criteria', () => {
  const criteria = {};
  const query = llmService.buildMongoQuery(criteria);

  assert.deepEqual(query, {});
});

test('LLM Service - buildMongoQuery ignores unknown fields', () => {
  const criteria = {
    protein: { min: 30 },
    unknownField: { min: 100 }
  };

  const query = llmService.buildMongoQuery(criteria);

  assert.deepEqual(query, {
    protein: { $gte: 30 }
  });
});

test('LLM Service - parseQuery throws error for non-string input', async () => {
  await assert.rejects(
    async () => {
      await llmService.parseQuery(null);
    },
    {
      message: 'User prompt must be a non-empty string'
    }
  );
});

test('LLM Service - parseQuery throws error for empty string', async () => {
  await assert.rejects(
    async () => {
      await llmService.parseQuery('');
    },
    {
      message: 'User prompt must be a non-empty string'
    }
  );
});

test('LLM Service - parseQuery throws error for number input', async () => {
  await assert.rejects(
    async () => {
      await llmService.parseQuery(123);
    },
    {
      message: 'User prompt must be a non-empty string'
    }
  );
});

test('LLM Service - buildMongoQuery handles item name search', () => {
  const criteria = {
    item: { name: 'burger' }
  };

  const query = llmService.buildMongoQuery(criteria);

  assert.deepEqual(query, {
    item: { $regex: 'burger', $options: 'i' }
  });
});

test('LLM Service - buildMongoQuery handles company name search', () => {
  const criteria = {
    company: { name: 'McDonald' }
  };

  const query = llmService.buildMongoQuery(criteria);

  assert.deepEqual(query, {
    company: { $regex: 'McDonald', $options: 'i' }
  });
});

test('LLM Service - buildMongoQuery handles item name with nutritional criteria', () => {
  const criteria = {
    item: { name: 'Big Mac' },
    protein: { min: 20 },
    calories: { max: 600 }
  };

  const query = llmService.buildMongoQuery(criteria);

  assert.deepEqual(query, {
    item: { $regex: 'Big Mac', $options: 'i' },
    protein: { $gte: 20 },
    calories: { $lte: 600 }
  });
});

test('LLM Service - buildMongoQuery handles item and company search together', () => {
  const criteria = {
    item: { name: 'sandwich' },
    company: { name: 'Subway' },
    calories: { max: 400 }
  };

  const query = llmService.buildMongoQuery(criteria);

  assert.deepEqual(query, {
    item: { $regex: 'sandwich', $options: 'i' },
    company: { $regex: 'Subway', $options: 'i' },
    calories: { $lte: 400 }
  });
});

test('LLM Service - buildPrompt includes item name examples', () => {
  const userPrompt = 'Show me Big Mac';
  const prompt = llmService.buildPrompt(userPrompt);

  assert.ok(prompt.includes('Big Mac'));
  assert.ok(prompt.includes('item'));
  assert.ok(prompt.includes('burger'));
  assert.ok(prompt.includes('chicken sandwich'));
});
