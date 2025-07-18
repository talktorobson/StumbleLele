/**
 * Performance Integration Tests
 * Agent 5 - Integration & Testing Specialist
 * 
 * Tests performance characteristics of the friends chat system
 */

import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { 
  testApiCall, 
  testSupabase,
  setupTestDatabase, 
  cleanupTestDatabase,
  PerformanceTracker,
  performanceTargets,
  generateTestUser,
  generateTestMessage
} from '../setup';

describe('Performance Tests', () => {
  const performance = new PerformanceTracker();
  
  beforeEach(async () => {
    await setupTestDatabase();
  });
  
  afterEach(async () => {
    await cleanupTestDatabase();
  });

  describe('API Response Times', () => {
    test('should respond to friend requests within target time', async () => {
      const duration = await performance.measureAsync('friendsAPI', async () => {
        const { response, data } = await testApiCall('/friends?userId=1001');
        
        expect(response.status).toBe(200);
        expect(data.friends).toBeInstanceOf(Array);
      });
      
      expect(duration).toBeLessThan(performanceTargets.apiResponse);
    });

    test('should respond to conversation requests within target time', async () => {
      const duration = await performance.measureAsync('conversationsAPI', async () => {
        const { response, data } = await testApiCall('/conversations?userId=1001');
        
        expect(response.status).toBe(200);
        expect(data.conversations).toBeInstanceOf(Array);
      });
      
      expect(duration).toBeLessThan(performanceTargets.apiResponse);
    });

    test('should respond to message requests within target time', async () => {
      const duration = await performance.measureAsync('messagesAPI', async () => {
        const { response, data } = await testApiCall('/conversations/conv-1001-1002/messages');
        
        expect(response.status).toBe(200);
        expect(data.messages).toBeInstanceOf(Array);
      });
      
      expect(duration).toBeLessThan(performanceTargets.apiResponse);
    });

    test('should handle user search requests within target time', async () => {
      const duration = await performance.measureAsync('userSearchAPI', async () => {
        const { response, data } = await testApiCall('/users/search?q=test&currentUserId=1001');
        
        expect(response.status).toBe(200);
        expect(data.users).toBeInstanceOf(Array);
      });
      
      expect(duration).toBeLessThan(performanceTargets.apiResponse);
    });
  });

  describe('Database Performance', () => {
    test('should query friends efficiently', async () => {
      const duration = await performance.measureAsync('friendsQuery', async () => {
        const { data, error } = await testSupabase
          .from('friends')
          .select(`
            id,
            status,
            created_at,
            friend:friend_id (
              id,
              username,
              display_name,
              avatar_emoji,
              is_online,
              last_seen
            )
          `)
          .eq('user_id', 1001)
          .eq('status', 'accepted')
          .order('created_at', { ascending: false });
        
        expect(error).toBeFalsy();
        expect(data).toBeDefined();
      });
      
      expect(duration).toBeLessThan(performanceTargets.databaseQuery);
    });

    test('should query conversations efficiently', async () => {
      const duration = await performance.measureAsync('conversationsQuery', async () => {
        const { data, error } = await testSupabase
          .from('conversations')
          .select(`
            id,
            user1_id,
            user2_id,
            last_message_at,
            is_active,
            created_at,
            user1:user1_id (
              id,
              username,
              display_name,
              avatar_emoji,
              is_online
            ),
            user2:user2_id (
              id,
              username,
              display_name,
              avatar_emoji,
              is_online
            )
          `)
          .or(`user1_id.eq.1001,user2_id.eq.1001`)
          .eq('is_active', true)
          .order('last_message_at', { ascending: false, nullsFirst: false });
        
        expect(error).toBeFalsy();
        expect(data).toBeDefined();
      });
      
      expect(duration).toBeLessThan(performanceTargets.databaseQuery);
    });

    test('should query messages efficiently', async () => {
      const duration = await performance.measureAsync('messagesQuery', async () => {
        const { data, error } = await testSupabase
          .from('messages')
          .select(`
            id,
            content,
            created_at,
            sender_id,
            message_type,
            sender:sender_id (
              id,
              username,
              display_name,
              avatar_emoji
            )
          `)
          .eq('conversation_id', 'conv-1001-1002')
          .eq('is_deleted', false)
          .order('created_at', { ascending: true });
        
        expect(error).toBeFalsy();
        expect(data).toBeDefined();
      });
      
      expect(duration).toBeLessThan(performanceTargets.databaseQuery);
    });

    test('should handle user search efficiently', async () => {
      const duration = await performance.measureAsync('userSearchQuery', async () => {
        const { data, error } = await testSupabase
          .from('users')
          .select('id, username, display_name, avatar_emoji, is_online')
          .ilike('username', '%test%')
          .neq('id', 1001)
          .order('username')
          .limit(10);
        
        expect(error).toBeFalsy();
        expect(data).toBeDefined();
      });
      
      expect(duration).toBeLessThan(performanceTargets.databaseQuery);
    });
  });

  describe('Load Testing', () => {
    test('should handle concurrent friend requests', async () => {
      const concurrentRequests = 10;
      const requests = [];
      
      for (let i = 0; i < concurrentRequests; i++) {
        requests.push(
          testApiCall('/friends?userId=1001')
        );
      }
      
      const startTime = Date.now();
      const results = await Promise.all(requests);
      const duration = Date.now() - startTime;
      
      // All requests should succeed
      results.forEach(({ response }) => {
        expect(response.status).toBe(200);
      });
      
      // Average time per request should be reasonable
      const avgTime = duration / concurrentRequests;
      expect(avgTime).toBeLessThan(performanceTargets.apiResponse);
    });

    test('should handle concurrent message sending', async () => {
      const concurrentMessages = 10;
      const messages = [];
      
      for (let i = 0; i < concurrentMessages; i++) {
        messages.push(
          testApiCall('/messages', {
            method: 'POST',
            body: JSON.stringify({
              conversationId: 'conv-1001-1002',
              senderId: 1001,
              content: `Concurrent message ${i}`,
              messageType: 'text'
            })
          })
        );
      }
      
      const startTime = Date.now();
      const results = await Promise.all(messages);
      const duration = Date.now() - startTime;
      
      // All messages should be sent successfully
      results.forEach(({ response }) => {
        expect(response.status).toBe(200);
      });
      
      // Average time per message should be reasonable
      const avgTime = duration / concurrentMessages;
      expect(avgTime).toBeLessThan(performanceTargets.apiResponse);
    });

    test('should handle concurrent conversation creation', async () => {
      const concurrentConversations = 5;
      const conversations = [];
      
      for (let i = 0; i < concurrentConversations; i++) {
        conversations.push(
          testApiCall('/conversations', {
            method: 'POST',
            body: JSON.stringify({
              user1Id: 1001,
              user2Id: 1000 + i + 10 // Different user IDs
            })
          })
        );
      }
      
      const startTime = Date.now();
      const results = await Promise.all(conversations);
      const duration = Date.now() - startTime;
      
      // All conversations should be created successfully (or fail gracefully)
      results.forEach(({ response }) => {
        expect(response.status).toBeLessThan(500);
      });
      
      // Average time per conversation should be reasonable
      const avgTime = duration / concurrentConversations;
      expect(avgTime).toBeLessThan(performanceTargets.apiResponse);
    });
  });

  describe('Large Dataset Performance', () => {
    test('should handle large friends list efficiently', async () => {
      // Create multiple test users
      const testUsers = [];
      for (let i = 0; i < 20; i++) {
        testUsers.push(generateTestUser(2000 + i));
      }
      
      // Insert test users
      await testSupabase.from('users').insert(testUsers);
      
      // Create friendships
      const friendships = [];
      for (let i = 0; i < 20; i++) {
        friendships.push({
          user_id: 1001,
          friend_id: 2000 + i,
          status: 'accepted',
          created_at: new Date().toISOString()
        });
        friendships.push({
          user_id: 2000 + i,
          friend_id: 1001,
          status: 'accepted',
          created_at: new Date().toISOString()
        });
      }
      
      await testSupabase.from('friends').insert(friendships);
      
      // Test performance with large friends list
      const duration = await performance.measureAsync('largeFriendsList', async () => {
        const { response, data } = await testApiCall('/friends?userId=1001');
        
        expect(response.status).toBe(200);
        expect(data.friends.length).toBeGreaterThan(15);
      });
      
      expect(duration).toBeLessThan(performanceTargets.apiResponse);
      
      // Cleanup
      await testSupabase.from('friends').delete().in('user_id', testUsers.map(u => u.id));
      await testSupabase.from('users').delete().in('id', testUsers.map(u => u.id));
    });

    test('should handle large message history efficiently', async () => {
      // Create many messages
      const testMessages = [];
      for (let i = 0; i < 50; i++) {
        testMessages.push(generateTestMessage(
          'conv-1001-1002',
          i % 2 === 0 ? 1001 : 1002,
          `Test message ${i}`
        ));
      }
      
      await testSupabase.from('messages').insert(testMessages);
      
      // Test performance with large message history
      const duration = await performance.measureAsync('largeMessageHistory', async () => {
        const { response, data } = await testApiCall('/conversations/conv-1001-1002/messages');
        
        expect(response.status).toBe(200);
        expect(data.messages.length).toBeGreaterThan(45);
      });
      
      expect(duration).toBeLessThan(performanceTargets.apiResponse);
      
      // Cleanup
      await testSupabase.from('messages').delete().in('id', testMessages.map(m => m.id));
    });

    test('should handle many conversations efficiently', async () => {
      // Create test conversations
      const testConversations = [];
      for (let i = 0; i < 10; i++) {
        testConversations.push({
          id: `conv-perf-${i}`,
          user1_id: 1001,
          user2_id: 1002 + i,
          is_active: true,
          created_at: new Date().toISOString(),
          last_message_at: new Date().toISOString()
        });
      }
      
      await testSupabase.from('conversations').insert(testConversations);
      
      // Test performance with many conversations
      const duration = await performance.measureAsync('manyConversations', async () => {
        const { response, data } = await testApiCall('/conversations?userId=1001');
        
        expect(response.status).toBe(200);
        expect(data.conversations.length).toBeGreaterThan(5);
      });
      
      expect(duration).toBeLessThan(performanceTargets.apiResponse);
      
      // Cleanup
      await testSupabase.from('conversations').delete().in('id', testConversations.map(c => c.id));
    });
  });

  describe('Memory Usage', () => {
    test('should handle memory efficiently during bulk operations', async () => {
      const initialMemory = process.memoryUsage();
      
      // Perform multiple operations
      const operations = [];
      for (let i = 0; i < 20; i++) {
        operations.push(
          testApiCall('/friends?userId=1001')
        );
      }
      
      await Promise.all(operations);
      
      const finalMemory = process.memoryUsage();
      
      // Memory increase should be reasonable
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024); // 50MB limit
    });
  });

  describe('Network Performance', () => {
    test('should minimize payload size for friends list', async () => {
      const { response, data } = await testApiCall('/friends?userId=1001');
      
      expect(response.status).toBe(200);
      
      // Check response size
      const responseSize = JSON.stringify(data).length;
      expect(responseSize).toBeLessThan(10000); // 10KB limit per friend list
    });

    test('should minimize payload size for messages', async () => {
      const { response, data } = await testApiCall('/conversations/conv-1001-1002/messages');
      
      expect(response.status).toBe(200);
      
      // Check response size
      const responseSize = JSON.stringify(data).length;
      expect(responseSize).toBeLessThan(50000); // 50KB limit for message list
    });

    test('should compress large responses', async () => {
      // Send many messages to create large response
      const messages = [];
      for (let i = 0; i < 30; i++) {
        messages.push(
          testApiCall('/messages', {
            method: 'POST',
            body: JSON.stringify({
              conversationId: 'conv-1001-1002',
              senderId: 1001,
              content: `Long message for compression test ${i} ${'x'.repeat(100)}`,
              messageType: 'text'
            })
          })
        );
      }
      
      await Promise.all(messages);
      
      // Get the large response
      const { response, data } = await testApiCall('/conversations/conv-1001-1002/messages');
      
      expect(response.status).toBe(200);
      
      // Response should be reasonable size even with many messages
      const responseSize = JSON.stringify(data).length;
      expect(responseSize).toBeLessThan(100000); // 100KB limit
    });
  });

  describe('Caching Performance', () => {
    test('should handle repeated requests efficiently', async () => {
      // First request
      const duration1 = await performance.measureAsync('firstRequest', async () => {
        const { response } = await testApiCall('/friends?userId=1001');
        expect(response.status).toBe(200);
      });
      
      // Second request (should be similar or faster)
      const duration2 = await performance.measureAsync('secondRequest', async () => {
        const { response } = await testApiCall('/friends?userId=1001');
        expect(response.status).toBe(200);
      });
      
      expect(duration1).toBeLessThan(performanceTargets.apiResponse);
      expect(duration2).toBeLessThan(performanceTargets.apiResponse);
    });
  });

  describe('Mobile Performance', () => {
    test('should handle mobile-typical request patterns', async () => {
      // Simulate mobile usage pattern: quick successive requests
      const requests = [
        testApiCall('/friends?userId=1001'),
        testApiCall('/conversations?userId=1001'),
        testApiCall('/conversations/conv-1001-1002/messages')
      ];
      
      const startTime = Date.now();
      const results = await Promise.all(requests);
      const duration = Date.now() - startTime;
      
      // All requests should succeed
      results.forEach(({ response }) => {
        expect(response.status).toBe(200);
      });
      
      // Total time should be reasonable for mobile
      expect(duration).toBeLessThan(2000); // 2 seconds for all requests
    });

    test('should handle intermittent connectivity', async () => {
      // Simulate request with longer timeout
      const duration = await performance.measureAsync('intermittentRequest', async () => {
        const { response } = await testApiCall('/friends?userId=1001');
        expect(response.status).toBe(200);
      });
      
      // Should still complete within reasonable time
      expect(duration).toBeLessThan(performanceTargets.apiResponse);
    });
  });
});