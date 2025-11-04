# Test Database Protection

This document explains the safety measures implemented to prevent tests from deleting production data.

## Problem

Previously, the GitHub Actions CI workflow was running tests against the production MongoDB database, which caused all users to be deleted whenever code was pushed to GitHub.

## Solution

We've implemented a two-layer protection system:

### 1. CI Workflow Changes (`.github/workflows/ci.yml`)

The workflow now automatically uses a separate test database:

- **Primary option**: If you set `MONGODB_TEST_URI` as a GitHub secret, it will use that
- **Fallback option**: If `MONGODB_TEST_URI` is not set, it will automatically append `-test` to your production database name

**Example:**
- Production: `mongodb+srv://user:pass@cluster.mongodb.net/howl2go`
- Test (auto): `mongodb+srv://user:pass@cluster.mongodb.net/howl2go-test`

The workflow also sets `NODE_ENV=test` to ensure proper environment detection.

### 2. Test File Safety Checks

Every test file now includes a safety check in `beforeAll()` that:

1. Verifies the database name contains "test" OR `NODE_ENV` is set to "test"
2. Throws an error and stops execution if running against production
3. Logs which database is being used

**Files protected:**
- `src/__tests__/user.test.js`
- `src/__tests__/cart.test.js`
- `src/__tests__/food.integration.test.js`

## Setup Instructions

### Option 1: Create a Separate Test Database (Recommended)

1. Go to your MongoDB Atlas dashboard
2. Create a new database called `howl2go-test` (or similar)
3. Add it as a GitHub secret:
   - Go to your GitHub repository
   - Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `MONGODB_TEST_URI`
   - Value: Your test database connection string

### Option 2: Use Automatic Naming (Fallback)

If you don't set `MONGODB_TEST_URI`, the CI will automatically:
- Take your production URI
- Append `-test` to the database name
- Create/use that test database

This happens automatically with no additional configuration needed.

## Local Development

When running tests locally, ensure you either:

1. Set `NODE_ENV=test` in your terminal:
   ```bash
   NODE_ENV=test npm test
   ```

2. OR use a database with "test" in the name in your `.env`:
   ```env
   MONGODB_URI=mongodb://localhost:27017/howl2go-test
   ```

## Safety Guarantees

✅ **Tests will NEVER run against production** if the database name doesn't contain "test" and `NODE_ENV` is not "test"

✅ **Immediate error** if tests try to connect to production database

✅ **Clear error messages** explaining what went wrong and how to fix it

✅ **Logs show which database** tests are running against

## Error Messages

If you see this error:
```
DANGER: Tests are trying to run against non-test database: "howl2go".
Database name must include "test" or NODE_ENV must be "test".
Current NODE_ENV: "development"
```

**Fix:** Either rename your test database to include "test" (e.g., `howl2go-test`) or set `NODE_ENV=test`

## Verification

After pushing to GitHub, check the Actions tab to verify:
1. The workflow creates the `.env` file
2. It logs "Using test database (not production)"
3. Tests log which database they're running against
4. No production data is affected

## Questions?

If you have any questions or concerns about the test database setup, please reach out to the development team.
