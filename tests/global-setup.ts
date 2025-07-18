/**
 * Global Test Setup
 * Agent 5 - Integration & Testing Specialist
 */

import { setupTestDatabase } from './setup';

export default async function globalSetup() {
  console.log('Starting global test setup...');
  
  try {
    // Initialize test database
    const dbSetup = await setupTestDatabase();
    if (!dbSetup) {
      throw new Error('Failed to setup test database');
    }
    
    // Wait for services to be ready
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('Global test setup completed successfully');
  } catch (error) {
    console.error('Global test setup failed:', error);
    throw error;
  }
}