/**
 * Global teardown for Jest tests
 * This file runs once after all test suites complete
 */
import mongoose from 'mongoose';

export default async function globalTeardown() {
  // Close any remaining MongoDB connections
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  console.log('Global test teardown complete');
}
