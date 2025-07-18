/**
 * Test Environment Configuration
 * Agent 5 - Integration & Testing Specialist
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.CI = 'true';

// Mock API endpoints for testing
process.env.NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
process.env.SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'test-service-key';

// Test database configuration
process.env.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL;

// Performance test configuration
process.env.PERFORMANCE_TEST_ENABLED = 'true';
process.env.LOAD_TEST_CONCURRENCY = '10';

// Security test configuration
process.env.SECURITY_TEST_ENABLED = 'true';

// Real-time test configuration
process.env.REALTIME_TEST_ENABLED = 'true';
process.env.REALTIME_TEST_TIMEOUT = '10000';

// Mock external services
process.env.MOCK_EXTERNAL_APIS = 'true';

// Test data configuration
process.env.TEST_DATA_CLEANUP = 'true';
process.env.TEST_DATA_SEED = 'true';

// Console log level for tests
process.env.LOG_LEVEL = 'error';

console.log('Test environment initialized with configuration:', {
  NODE_ENV: process.env.NODE_ENV,
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  HAS_SERVICE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
  PERFORMANCE_TESTS: process.env.PERFORMANCE_TEST_ENABLED,
  SECURITY_TESTS: process.env.SECURITY_TEST_ENABLED,
  REALTIME_TESTS: process.env.REALTIME_TEST_ENABLED
});