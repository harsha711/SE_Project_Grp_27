import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../app.js';

test('GET /api/health responds with service status', async () => {
  const response = await request(app).get('/api/health').expect(200);

  assert.equal(response.body.status, 'ok');
  assert.equal(response.body.service, 'food-delivery-backend');
  assert.match(response.body.timestamp, /^\d{4}-\d{2}-\d{2}T/);
  assert.ok(response.body.uptime >= 0);
});

test('GET /api/unknown returns 404 payload', async () => {
  const response = await request(app).get('/api/unknown').expect(404);

  assert.equal(response.body.message, 'Resource not found');
});
