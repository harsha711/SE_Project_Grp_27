import test from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import { authenticate, authorize, optionalAuth } from '../middleware/auth.middleware.js';
import User from '../models/User.js';

const ORIGINAL_ENV = {
  JWT_SECRET: process.env.JWT_SECRET
};

const originalFindById = User.findById;

const createResponse = () => {
  const res = {
    statusCode: 200,
    payload: null
  };
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (data) => {
    res.payload = data;
    return res;
  };
  return res;
};

const createNext = () => {
  let called = false;
  const next = () => {
    called = true;
  };
  next.wasCalled = () => called;
  return next;
};

const createAccessToken = (overrides = {}) => {
  const payload = {
    id: 'user-id',
    email: 'user@example.com',
    role: 'user',
    ...overrides
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    audience: 'howl2go-app',
    issuer: 'howl2go-api',
    expiresIn: '1h'
  });
};

test.before(() => {
  process.env.JWT_SECRET = 'unit-test-secret';
});

test.afterEach(() => {
  User.findById = originalFindById;
});

test.after(() => {
  process.env.JWT_SECRET = ORIGINAL_ENV.JWT_SECRET;
  User.findById = originalFindById;
});

test('authenticate returns 401 when authorization header is missing', async () => {
  const req = { headers: {} };
  const res = createResponse();
  const next = createNext();

  await authenticate(req, res, next);

  assert.equal(res.statusCode, 401);
  assert.equal(res.payload.success, false);
  assert.match(res.payload.message, /Authentication required/i);
  assert.equal(next.wasCalled(), false);
});

test('authenticate returns 401 when token verification fails', async () => {
  const req = { headers: { authorization: 'Bearer not-a-jwt' } };
  const res = createResponse();
  const next = createNext();

  await authenticate(req, res, next);

  assert.equal(res.statusCode, 401);
  assert.equal(res.payload.success, false);
  assert.match(res.payload.message, /Invalid/i);
  assert.equal(next.wasCalled(), false);
});

test('authenticate returns 401 when user record is missing', async () => {
  const token = createAccessToken({ id: 'missing-user' });
  const req = { headers: { authorization: `Bearer ${token}` } };
  const res = createResponse();
  const next = createNext();

  User.findById = () => ({
    select: () => Promise.resolve(null)
  });

  await authenticate(req, res, next);

  assert.equal(res.statusCode, 401);
  assert.equal(res.payload.message, 'User no longer exists');
  assert.equal(next.wasCalled(), false);
});

test('authenticate returns 401 when user is inactive', async () => {
  const token = createAccessToken({ id: 'inactive-user' });
  const req = { headers: { authorization: `Bearer ${token}` } };
  const res = createResponse();
  const next = createNext();

  User.findById = () => ({
    select: () =>
      Promise.resolve({
        _id: 'inactive-user',
        email: 'user@example.com',
        name: 'User',
        role: 'user',
        isActive: false,
        preferences: {},
        changedPasswordAfter: () => false
      })
  });

  await authenticate(req, res, next);

  assert.equal(res.statusCode, 401);
  assert.match(res.payload.message, /deactivated/i);
  assert.equal(next.wasCalled(), false);
});

test('authenticate returns 401 when password was changed after token issuance', async () => {
  const token = createAccessToken();
  const req = { headers: { authorization: `Bearer ${token}` } };
  const res = createResponse();
  const next = createNext();

  User.findById = () => ({
    select: () =>
      Promise.resolve({
        _id: 'user-id',
        email: 'user@example.com',
        name: 'User',
        role: 'user',
        isActive: true,
        preferences: {},
        changedPasswordAfter: () => true
      })
  });

  await authenticate(req, res, next);

  assert.equal(res.statusCode, 401);
  assert.match(res.payload.message, /Password recently changed/i);
  assert.equal(next.wasCalled(), false);
});

test('authenticate attaches user object and calls next on success', async () => {
  const token = createAccessToken({ role: 'admin' });
  const req = { headers: { authorization: `Bearer ${token}` } };
  const res = createResponse();
  const next = createNext();
  const userDoc = {
    _id: 'user-id',
    email: 'user@example.com',
    name: 'User',
    role: 'admin',
    isActive: true,
    preferences: { dietaryRestrictions: [] },
    changedPasswordAfter: () => false
  };

  User.findById = () => ({
    select: () => Promise.resolve(userDoc)
  });

  await authenticate(req, res, next);

  assert.equal(next.wasCalled(), true);
  assert.equal(res.statusCode, 200);
  assert.deepEqual(req.user, {
    id: userDoc._id,
    email: userDoc.email,
    name: userDoc.name,
    role: userDoc.role,
    preferences: userDoc.preferences
  });
});

test('authenticate returns 500 when an unexpected error occurs', async () => {
  const token = createAccessToken();
  const req = { headers: { authorization: `Bearer ${token}` } };
  const res = createResponse();
  const next = createNext();

  User.findById = () => {
    throw new Error('Database failure');
  };

  await authenticate(req, res, next);

  assert.equal(res.statusCode, 500);
  assert.match(res.payload.message, /Authentication failed/i);
  assert.equal(next.wasCalled(), false);
});

test('authorize returns 401 when user is missing', () => {
  const middleware = authorize('admin');
  const req = {};
  const res = createResponse();
  const next = createNext();

  middleware(req, res, next);

  assert.equal(res.statusCode, 401);
  assert.match(res.payload.message, /Authentication required/i);
  assert.equal(next.wasCalled(), false);
});

test('authorize returns 403 when role is not allowed', () => {
  const middleware = authorize('admin');
  const req = { user: { role: 'user' } };
  const res = createResponse();
  const next = createNext();

  middleware(req, res, next);

  assert.equal(res.statusCode, 403);
  assert.match(res.payload.message, /permission/i);
  assert.equal(next.wasCalled(), false);
});

test('authorize calls next when role is allowed', () => {
  const middleware = authorize('admin', 'manager');
  const req = { user: { role: 'admin' } };
  const res = createResponse();
  const next = createNext();

  middleware(req, res, next);

  assert.equal(next.wasCalled(), true);
  assert.equal(res.statusCode, 200);
});

test('optionalAuth continues without token', async () => {
  const req = { headers: {} };
  const res = createResponse();
  const next = createNext();

  await optionalAuth(req, res, next);

  assert.equal(next.wasCalled(), true);
  assert.equal(req.user, undefined);
});

test('optionalAuth attaches user when token is valid', async () => {
  const token = createAccessToken();
  const req = { headers: { authorization: `Bearer ${token}` } };
  const res = createResponse();
  const next = createNext();
  const userDoc = {
    _id: 'user-id',
    email: 'user@example.com',
    name: 'Opt User',
    role: 'user',
    isActive: true,
    preferences: { favoriteRestaurants: [] },
    changedPasswordAfter: () => false
  };

  User.findById = async () => userDoc;

  await optionalAuth(req, res, next);

  assert.equal(next.wasCalled(), true);
  assert.deepEqual(req.user, {
    id: userDoc._id,
    email: userDoc.email,
    name: userDoc.name,
    role: userDoc.role,
    preferences: userDoc.preferences
  });
});

test('optionalAuth ignores errors and moves on', async () => {
  const req = { headers: { authorization: 'Bearer bad-token' } };
  const res = createResponse();
  const next = createNext();

  await optionalAuth(req, res, next);

  assert.equal(next.wasCalled(), true);
  assert.equal(req.user, undefined);
});
