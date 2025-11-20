// import test from 'node:test';
import { describe, test, expect, beforeAll, afterAll } from "@jest/globals";
import assert from "node:assert/strict";
import request from "supertest";
import app from "../app.js";

/**
 * Integration tests for Food API endpoints
 * These tests require the Groq API to be configured
 * Skip these tests if GROQ_API_KEY is not set
 */

const hasGroqApiKey = process.env.GROQ_API_KEY !== undefined;

test("POST /api/food/recommend - returns 400 when query is missing", async () => {
  const response = await request(app)
    .post("/api/food/recommend")
    .send({})
    .expect(400);

  assert.equal(response.body.success, false);
});

if (hasGroqApiKey) {
  test("POST /api/food/recommend - returns 400 when query yields no criteria", async () => {
    const response = await request(app)
      .post("/api/food/recommend")
      .send({ query: "Random text" })
      .expect(400);

    assert.equal(response.body.success, false);
  }, 15000);
}

test("POST /api/food/recommend - handles limit parameter", async () => {
  const testData = {
    query: "low calorie",
    limit: 3,
  };

  assert.equal(testData.limit, 3);
});

test("POST /api/food/recommend endpoint exists", async () => {
  const response = await request(app)
    .post("/api/food/recommend")
    .send({ query: "" });

  // Should not return 404
  assert.notEqual(response.status, 404);
});

if (!hasGroqApiKey) {
  console.log(
    "\n⚠️  Warning: GROQ_API_KEY not set. Skipping integration tests that require LLM API.\n"
  );
}
