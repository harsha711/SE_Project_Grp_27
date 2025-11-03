/**
 * Global setup for Jest tests
 * This file runs once before all test suites
 */

export default async function globalSetup() {
  // Set test environment variables if needed
  process.env.NODE_ENV = 'test';

  console.log('Global test setup complete');
}
