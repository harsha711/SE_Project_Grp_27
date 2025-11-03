export default {
  // Use Node's experimental VM modules for ESM support
  testEnvironment: 'node',

  // Test match patterns
  testMatch: ['**/__tests__/**/*.test.js'],

  // Global setup and teardown
  globalSetup: './src/__tests__/setup.js',
  globalTeardown: './src/__tests__/teardown.js',

  // Coverage settings
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/__tests__/**',
    '!src/scripts/**',
    '!src/server.js'
  ],

  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50
    }
  },

  // Increase timeout for database operations
  testTimeout: 10000,

  // Force exit after tests complete
  forceExit: true,

  // Detect open handles to help debug
  detectOpenHandles: false,

  // Clear mocks between tests
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,

  // Verbose output
  verbose: true,

  // Maximum number of workers (run tests serially to avoid DB conflicts)
  maxWorkers: 1
};
