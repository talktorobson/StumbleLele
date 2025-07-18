/**
 * Global Test Teardown
 * Agent 5 - Integration & Testing Specialist
 */

import { cleanupTestDatabase } from './setup';

export default async function globalTeardown() {
  console.log('Starting global test teardown...');
  
  try {
    // Clean up test database
    await cleanupTestDatabase();
    
    console.log('Global test teardown completed successfully');
  } catch (error) {
    console.error('Global test teardown failed:', error);
    // Don't throw error on teardown to avoid masking test failures
  }
}