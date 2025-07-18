/**
 * Jest Configuration for StumbleLele Friends Chat System Tests
 * Agent 5 - Integration & Testing Specialist
 */

module.exports = {
  // Test environment
  testEnvironment: 'node',
  
  // Test file patterns
  testMatch: [
    '**/tests/**/*.test.ts',
    '**/tests/**/*.test.js'
  ],
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  
  // TypeScript support
  preset: 'ts-jest',
  
  // Module resolution
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/client/src/$1'
  },
  
  // Test timeout
  testTimeout: 30000,
  
  // Coverage settings
  collectCoverage: true,
  collectCoverageFrom: [
    'api/**/*.ts',
    'client/src/**/*.ts',
    'client/src/**/*.tsx',
    '!client/src/**/*.d.ts',
    '!client/src/main.tsx',
    '!client/src/vite-env.d.ts'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  
  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  
  // Test execution
  maxWorkers: 1, // Run tests sequentially to avoid database conflicts
  
  // Verbose output
  verbose: true,
  
  // Reporter configuration
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: 'test-results',
      outputName: 'junit.xml'
    }]
  ],
  
  // Global setup/teardown
  globalSetup: '<rootDir>/tests/global-setup.ts',
  globalTeardown: '<rootDir>/tests/global-teardown.ts',
  
  // Transform configuration
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  },
  
  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  
  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/',
    '/coverage/'
  ],
  
  // Environment variables
  setupFiles: ['<rootDir>/tests/test-env.ts']
};