/**
 * Test Setup and Configuration
 * Agent 5 - Integration & Testing Specialist
 * 
 * Sets up the test environment for comprehensive testing
 */

import { beforeAll, afterAll, beforeEach, afterEach } from '@jest/globals';
import { createClient } from '@supabase/supabase-js';

// Test environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'test-service-key';

// Test Supabase client
export const testSupabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Mock users for testing
export const mockUsers = [
  {
    id: 1001,
    username: 'helena_test',
    display_name: 'Helena Teste',
    avatar_emoji: '👧',
    is_online: true,
    last_seen: new Date().toISOString(),
    preferred_ai: 'gemini',
    age: 8,
    created_at: new Date().toISOString()
  },
  {
    id: 1002,
    username: 'julia_test',
    display_name: 'Julia Teste',
    avatar_emoji: '😊',
    is_online: true,
    last_seen: new Date().toISOString(),
    preferred_ai: 'gemini',
    age: 7,
    created_at: new Date().toISOString()
  },
  {
    id: 1003,
    username: 'tom_test',
    display_name: 'Tom Teste',
    avatar_emoji: '🎮',
    is_online: false,
    last_seen: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    preferred_ai: 'gemini',
    age: 9,
    created_at: new Date().toISOString()
  },
  {
    id: 1004,
    username: 'sofia_test',
    display_name: 'Sofia Teste',
    avatar_emoji: '🌟',
    is_online: true,
    last_seen: new Date().toISOString(),
    preferred_ai: 'gemini',
    age: 8,
    created_at: new Date().toISOString()
  },
  {
    id: 1005,
    username: 'miguel_test',
    display_name: 'Miguel Teste',
    avatar_emoji: '⚽',
    is_online: false,
    last_seen: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    preferred_ai: 'gemini',
    age: 10,
    created_at: new Date().toISOString()
  }
];

// Mock friend relationships
export const mockFriends = [
  {
    user_id: 1001,
    friend_id: 1002,
    status: 'accepted',
    created_at: new Date().toISOString()
  },
  {
    user_id: 1002,
    friend_id: 1001,
    status: 'accepted',
    created_at: new Date().toISOString()
  },
  {
    user_id: 1001,
    friend_id: 1003,
    status: 'accepted',
    created_at: new Date().toISOString()
  },
  {
    user_id: 1003,
    friend_id: 1001,
    status: 'accepted',
    created_at: new Date().toISOString()
  },
  {
    user_id: 1004,
    friend_id: 1001,
    status: 'pending',
    created_at: new Date().toISOString()
  }
];

// Mock conversations
export const mockConversations = [
  {
    id: 'conv-1001-1002',
    user1_id: 1001,
    user2_id: 1002,
    is_active: true,
    last_message_at: new Date().toISOString(),
    created_at: new Date().toISOString()
  },
  {
    id: 'conv-1001-1003',
    user1_id: 1001,
    user2_id: 1003,
    is_active: true,
    last_message_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    created_at: new Date().toISOString()
  }
];

// Mock messages
export const mockMessages = [
  {
    id: 'msg-1',
    conversation_id: 'conv-1001-1002',
    sender_id: 1001,
    content: 'Oi Julia! Como você está?',
    message_type: 'text',
    is_deleted: false,
    created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString()
  },
  {
    id: 'msg-2',
    conversation_id: 'conv-1001-1002',
    sender_id: 1002,
    content: 'Oi Helena! Estou bem! E você?',
    message_type: 'text',
    is_deleted: false,
    created_at: new Date(Date.now() - 1000 * 60 * 3).toISOString()
  },
  {
    id: 'msg-3',
    conversation_id: 'conv-1001-1002',
    sender_id: 1001,
    content: 'Também estou bem! Vamos jogar?',
    message_type: 'text',
    is_deleted: false,
    created_at: new Date(Date.now() - 1000 * 60 * 1).toISOString()
  },
  {
    id: 'msg-4',
    conversation_id: 'conv-1001-1003',
    sender_id: 1001,
    content: 'Tom, você quer jogar hoje?',
    message_type: 'text',
    is_deleted: false,
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString()
  }
];

// Database setup for testing
export async function setupTestDatabase() {
  console.log('Setting up test database...');
  
  try {
    // Clean up any existing test data
    await cleanupTestDatabase();
    
    // Insert test users
    const { error: usersError } = await testSupabase
      .from('users')
      .insert(mockUsers);
    
    if (usersError) {
      console.error('Error inserting test users:', usersError);
      throw usersError;
    }
    
    // Insert test friends
    const { error: friendsError } = await testSupabase
      .from('friends')
      .insert(mockFriends);
    
    if (friendsError) {
      console.error('Error inserting test friends:', friendsError);
      throw friendsError;
    }
    
    // Insert test conversations
    const { error: conversationsError } = await testSupabase
      .from('conversations')
      .insert(mockConversations);
    
    if (conversationsError) {
      console.error('Error inserting test conversations:', conversationsError);
      throw conversationsError;
    }
    
    // Insert test messages
    const { error: messagesError } = await testSupabase
      .from('messages')
      .insert(mockMessages);
    
    if (messagesError) {
      console.error('Error inserting test messages:', messagesError);
      throw messagesError;
    }
    
    console.log('Test database setup complete!');
    return true;
  } catch (error) {
    console.error('Failed to setup test database:', error);
    return false;
  }
}

// Database cleanup
export async function cleanupTestDatabase() {
  console.log('Cleaning up test database...');
  
  try {
    // Delete in reverse order to handle foreign key constraints
    await testSupabase.from('messages').delete().in('sender_id', [1001, 1002, 1003, 1004, 1005]);
    await testSupabase.from('conversations').delete().in('user1_id', [1001, 1002, 1003, 1004, 1005]);
    await testSupabase.from('friends').delete().in('user_id', [1001, 1002, 1003, 1004, 1005]);
    await testSupabase.from('users').delete().in('id', [1001, 1002, 1003, 1004, 1005]);
    
    console.log('Test database cleanup complete!');
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
}

// Test API helper functions
export async function testApiCall(endpoint: string, options: RequestInit = {}) {
  const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';
  const response = await fetch(`${baseUrl}/api${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
  
  const data = await response.json();
  return { response, data };
}

// Performance measurement helpers
export class PerformanceTracker {
  private startTime: number = 0;
  private measurements: { [key: string]: number } = {};
  
  start(label: string = 'default') {
    this.startTime = performance.now();
    this.measurements[label] = this.startTime;
  }
  
  end(label: string = 'default'): number {
    const endTime = performance.now();
    const duration = endTime - this.measurements[label];
    delete this.measurements[label];
    return duration;
  }
  
  measure(label: string, fn: () => any): number {
    this.start(label);
    fn();
    return this.end(label);
  }
  
  async measureAsync(label: string, fn: () => Promise<any>): Promise<number> {
    this.start(label);
    await fn();
    return this.end(label);
  }
}

// Test data generators
export function generateTestUser(id: number) {
  return {
    id,
    username: `test_user_${id}`,
    display_name: `Test User ${id}`,
    avatar_emoji: '🧪',
    is_online: Math.random() > 0.5,
    last_seen: new Date().toISOString(),
    preferred_ai: 'gemini',
    age: Math.floor(Math.random() * 5) + 7, // 7-11 years old
    created_at: new Date().toISOString()
  };
}

export function generateTestMessage(conversationId: string, senderId: number, content: string) {
  return {
    id: `msg-${Date.now()}-${Math.random()}`,
    conversation_id: conversationId,
    sender_id: senderId,
    content,
    message_type: 'text',
    is_deleted: false,
    created_at: new Date().toISOString()
  };
}

// Security test helpers
export const securityTestCases = {
  sqlInjection: [
    "'; DROP TABLE users; --",
    "1' OR '1'='1",
    "admin'; DELETE FROM messages; --",
    "test' UNION SELECT * FROM users; --"
  ],
  xssAttacks: [
    "<script>alert('XSS')</script>",
    "javascript:alert('XSS')",
    "<img src='x' onerror='alert(1)'>",
    "<svg onload='alert(1)'>"
  ],
  oversizedData: {
    longUsername: 'a'.repeat(1000),
    longMessage: 'a'.repeat(10000),
    longDisplayName: 'a'.repeat(500)
  }
};

// Global test setup
beforeAll(async () => {
  console.log('Starting global test setup...');
  await setupTestDatabase();
});

afterAll(async () => {
  console.log('Running global test cleanup...');
  await cleanupTestDatabase();
});

// Test performance expectations
export const performanceTargets = {
  apiResponse: 500, // 500ms max
  databaseQuery: 200, // 200ms max
  pageLoad: 2000, // 2s max
  realtimeLatency: 100 // 100ms max
};

// Test environment info
export const testEnvironment = {
  isCI: process.env.CI === 'true',
  isLocal: !process.env.VERCEL_URL,
  nodeVersion: process.version,
  timestamp: new Date().toISOString()
};

console.log('Test environment initialized:', testEnvironment);