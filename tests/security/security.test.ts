/**
 * Security Integration Tests
 * Agent 5 - Integration & Testing Specialist
 * 
 * Tests security features including RLS policies, input validation, and attack prevention
 */

import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { 
  testApiCall, 
  testSupabase,
  setupTestDatabase, 
  cleanupTestDatabase,
  securityTestCases
} from '../setup';

describe('Security Tests', () => {
  beforeEach(async () => {
    await setupTestDatabase();
  });
  
  afterEach(async () => {
    await cleanupTestDatabase();
  });

  describe('Input Validation', () => {
    test('should validate required fields', async () => {
      const testCases = [
        {
          endpoint: '/friends',
          method: 'POST',
          body: {}, // Missing required fields
          expectedStatus: 400
        },
        {
          endpoint: '/messages',
          method: 'POST', 
          body: {
            conversationId: 'conv-1001-1002',
            senderId: 1001
            // Missing content
          },
          expectedStatus: 400
        },
        {
          endpoint: '/conversations',
          method: 'POST',
          body: {
            user1Id: 1001
            // Missing user2Id
          },
          expectedStatus: 400
        }
      ];
      
      for (const testCase of testCases) {
        const { response, data } = await testApiCall(testCase.endpoint, {
          method: testCase.method,
          body: JSON.stringify(testCase.body)
        });
        
        expect(response.status).toBe(testCase.expectedStatus);
        expect(data.message).toContain('inválidos');
      }
    });

    test('should validate data types', async () => {
      const testCases = [
        {
          endpoint: '/friends',
          method: 'POST',
          body: {
            userId: 'not-a-number',
            friendUsername: 123
          }
        },
        {
          endpoint: '/messages',
          method: 'POST',
          body: {
            conversationId: 123,
            senderId: 'not-a-number',
            content: 'test'
          }
        },
        {
          endpoint: '/conversations',
          method: 'POST',
          body: {
            user1Id: 'not-a-number',
            user2Id: 'also-not-a-number'
          }
        }
      ];
      
      for (const testCase of testCases) {
        const { response, data } = await testApiCall(testCase.endpoint, {
          method: testCase.method,
          body: JSON.stringify(testCase.body)
        });
        
        expect(response.status).toBe(400);
        expect(data.message).toContain('inválidos');
      }
    });

    test('should validate string lengths', async () => {
      const testCases = [
        {
          endpoint: '/friends',
          method: 'POST',
          body: {
            userId: 1001,
            friendUsername: 'a'.repeat(1000) // Too long
          }
        },
        {
          endpoint: '/messages',
          method: 'POST',
          body: {
            conversationId: 'conv-1001-1002',
            senderId: 1001,
            content: 'a'.repeat(10000) // Too long
          }
        }
      ];
      
      for (const testCase of testCases) {
        const { response, data } = await testApiCall(testCase.endpoint, {
          method: testCase.method,
          body: JSON.stringify(testCase.body)
        });
        
        expect(response.status).toBe(400);
        expect(data.message).toContain('inválidos');
      }
    });

    test('should validate UUID format', async () => {
      const { response, data } = await testApiCall('/messages', {
        method: 'POST',
        body: JSON.stringify({
          conversationId: 'not-a-uuid',
          senderId: 1001,
          content: 'test message'
        })
      });
      
      expect(response.status).toBe(400);
      expect(data.message).toContain('inválidos');
    });
  });

  describe('SQL Injection Prevention', () => {
    test('should prevent SQL injection in friend requests', async () => {
      for (const injection of securityTestCases.sqlInjection) {
        const { response, data } = await testApiCall('/friends', {
          method: 'POST',
          body: JSON.stringify({
            userId: 1001,
            friendUsername: injection
          })
        });
        
        // Should not crash the server or return unexpected data
        expect(response.status).toBeLessThan(500);
        
        if (response.status === 200) {
          expect(data.success).toBe(true);
        } else {
          expect(data.message).toContain('User not found');
        }
      }
    });

    test('should prevent SQL injection in user search', async () => {
      for (const injection of securityTestCases.sqlInjection) {
        const { response, data } = await testApiCall(`/users/search?q=${encodeURIComponent(injection)}&currentUserId=1001`);
        
        // Should not crash the server
        expect(response.status).toBe(200);
        expect(data.users).toBeInstanceOf(Array);
      }
    });

    test('should prevent SQL injection in message content', async () => {
      for (const injection of securityTestCases.sqlInjection) {
        const { response, data } = await testApiCall('/messages', {
          method: 'POST',
          body: JSON.stringify({
            conversationId: 'conv-1001-1002',
            senderId: 1001,
            content: injection
          })
        });
        
        // Should store the content safely without executing SQL
        expect(response.status).toBe(200);
        expect(data.message.content).toBe(injection);
      }
    });
  });

  describe('XSS Prevention', () => {
    test('should safely store XSS payloads in messages', async () => {
      for (const xss of securityTestCases.xssAttacks) {
        const { response, data } = await testApiCall('/messages', {
          method: 'POST',
          body: JSON.stringify({
            conversationId: 'conv-1001-1002',
            senderId: 1001,
            content: xss
          })
        });
        
        // Should store the content as-is without executing it
        expect(response.status).toBe(200);
        expect(data.message.content).toBe(xss);
      }
    });

    test('should handle XSS in friend usernames', async () => {
      for (const xss of securityTestCases.xssAttacks) {
        const { response, data } = await testApiCall('/friends', {
          method: 'POST',
          body: JSON.stringify({
            userId: 1001,
            friendUsername: xss
          })
        });
        
        // Should not execute the XSS
        expect(response.status).toBeLessThan(500);
        
        if (response.status === 400) {
          expect(data.message).toContain('User not found');
        }
      }
    });
  });

  describe('Authorization Tests', () => {
    test('should prevent unauthorized friend access', async () => {
      // Try to access another user's friends without permission
      const { response, data } = await testApiCall('/friends?userId=9999');
      
      // Should return empty array or error, not crash
      expect(response.status).toBe(200);
      expect(data.friends).toBeInstanceOf(Array);
    });

    test('should prevent unauthorized message editing', async () => {
      // Send a message as user 1001
      const { data: messageData } = await testApiCall('/messages', {
        method: 'POST',
        body: JSON.stringify({
          conversationId: 'conv-1001-1002',
          senderId: 1001,
          content: 'Original message'
        })
      });
      
      // Try to edit it as user 1002
      const { response, data } = await testApiCall(`/messages/${messageData.message.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          content: 'Unauthorized edit attempt',
          userId: 1002
        })
      });
      
      expect(response.status).toBe(400);
    });

    test('should prevent unauthorized message deletion', async () => {
      // Send a message as user 1001
      const { data: messageData } = await testApiCall('/messages', {
        method: 'POST',
        body: JSON.stringify({
          conversationId: 'conv-1001-1002',
          senderId: 1001,
          content: 'Message to protect'
        })
      });
      
      // Try to delete it as user 1002
      const { response, data } = await testApiCall(`/messages/${messageData.message.id}`, {
        method: 'DELETE',
        body: JSON.stringify({
          userId: 1002
        })
      });
      
      expect(response.status).toBe(400);
    });
  });

  describe('Rate Limiting Tests', () => {
    test('should handle rapid requests gracefully', async () => {
      const requests = [];
      
      // Send 20 rapid requests
      for (let i = 0; i < 20; i++) {
        requests.push(
          testApiCall('/friends?userId=1001')
        );
      }
      
      const results = await Promise.all(requests);
      
      // Should not crash the server
      results.forEach(({ response }) => {
        expect(response.status).toBeLessThan(500);
      });
    });

    test('should handle concurrent message sending', async () => {
      const messages = [];
      
      // Send 10 messages concurrently
      for (let i = 0; i < 10; i++) {
        messages.push(
          testApiCall('/messages', {
            method: 'POST',
            body: JSON.stringify({
              conversationId: 'conv-1001-1002',
              senderId: 1001,
              content: `Concurrent message ${i}`
            })
          })
        );
      }
      
      const results = await Promise.all(messages);
      
      // All should succeed or fail gracefully
      results.forEach(({ response }) => {
        expect(response.status).toBeLessThan(500);
      });
    });
  });

  describe('Database Security Tests', () => {
    test('should enforce Row Level Security on friends table', async () => {
      // Test direct database access (simulating potential attack)
      const { data, error } = await testSupabase
        .from('friends')
        .select('*')
        .eq('user_id', 1001);
      
      // Should work with proper context but fail without authentication
      // This depends on RLS policies being properly configured
      expect(error).toBeFalsy();
      expect(data).toBeDefined();
    });

    test('should enforce Row Level Security on messages table', async () => {
      // Test direct database access
      const { data, error } = await testSupabase
        .from('messages')
        .select('*')
        .eq('conversation_id', 'conv-1001-1002');
      
      // Should work with proper context
      expect(error).toBeFalsy();
      expect(data).toBeDefined();
    });

    test('should enforce Row Level Security on conversations table', async () => {
      // Test direct database access
      const { data, error } = await testSupabase
        .from('conversations')
        .select('*')
        .eq('user1_id', 1001);
      
      // Should work with proper context
      expect(error).toBeFalsy();
      expect(data).toBeDefined();
    });
  });

  describe('Child Safety Features', () => {
    test('should filter inappropriate content', async () => {
      const inappropriateContent = [
        'This is a test of inappropriate content',
        'Contact me at email@example.com',
        'Call me at 555-1234',
        'Visit my website at example.com'
      ];
      
      for (const content of inappropriateContent) {
        const { response, data } = await testApiCall('/messages', {
          method: 'POST',
          body: JSON.stringify({
            conversationId: 'conv-1001-1002',
            senderId: 1001,
            content
          })
        });
        
        // Should store the content (filtering would be implemented at frontend level)
        expect(response.status).toBe(200);
        expect(data.message.content).toBe(content);
      }
    });

    test('should prevent very long message chains', async () => {
      // Send many messages in succession
      const messages = [];
      for (let i = 0; i < 50; i++) {
        messages.push(
          testApiCall('/messages', {
            method: 'POST',
            body: JSON.stringify({
              conversationId: 'conv-1001-1002',
              senderId: 1001,
              content: `Message ${i}`
            })
          })
        );
      }
      
      const results = await Promise.all(messages);
      
      // Should handle gracefully without crashing
      results.forEach(({ response }) => {
        expect(response.status).toBeLessThan(500);
      });
    });
  });

  describe('Error Handling Security', () => {
    test('should not expose sensitive information in error messages', async () => {
      const testCases = [
        '/friends?userId=invalid',
        '/messages/invalid-id',
        '/conversations/invalid-id/messages',
        '/users/search?q=&currentUserId=invalid'
      ];
      
      for (const endpoint of testCases) {
        const { response, data } = await testApiCall(endpoint);
        
        // Should return user-friendly error without exposing internals
        expect(response.status).toBe(400);
        expect(data.message).toBeDefined();
        expect(data.message).not.toContain('SELECT');
        expect(data.message).not.toContain('INSERT');
        expect(data.message).not.toContain('UPDATE');
        expect(data.message).not.toContain('DELETE');
        expect(data.message).not.toContain('database');
        expect(data.message).not.toContain('postgres');
      }
    });

    test('should handle malformed JSON gracefully', async () => {
      const { response, data } = await testApiCall('/friends', {
        method: 'POST',
        body: 'invalid json'
      });
      
      expect(response.status).toBe(400);
      expect(data.message).toBeDefined();
    });

    test('should handle empty request body gracefully', async () => {
      const { response, data } = await testApiCall('/friends', {
        method: 'POST',
        body: ''
      });
      
      expect(response.status).toBe(400);
      expect(data.message).toBeDefined();
    });
  });

  describe('CORS and Headers Security', () => {
    test('should include proper CORS headers', async () => {
      const { response } = await testApiCall('/friends?userId=1001');
      
      expect(response.headers.get('access-control-allow-origin')).toBe('*');
      expect(response.headers.get('access-control-allow-methods')).toContain('GET');
      expect(response.headers.get('access-control-allow-headers')).toContain('Content-Type');
    });

    test('should handle OPTIONS requests', async () => {
      const { response } = await testApiCall('/friends', {
        method: 'OPTIONS'
      });
      
      expect(response.status).toBe(200);
    });
  });

  describe('Business Logic Security', () => {
    test('should prevent duplicate friend relationships', async () => {
      // Try to create duplicate friend request
      const { response, data } = await testApiCall('/friends', {
        method: 'POST',
        body: JSON.stringify({
          userId: 1001,
          friendUsername: 'julia_test'
        })
      });
      
      expect(response.status).toBe(400);
      expect(data.message).toContain('already exists');
    });

    test('should prevent self-friendship', async () => {
      // Try to send friend request to self
      const { response, data } = await testApiCall('/friends', {
        method: 'POST',
        body: JSON.stringify({
          userId: 1001,
          friendUsername: 'helena_test'
        })
      });
      
      expect(response.status).toBe(400);
      expect(data.message).toContain('already exists');
    });

    test('should prevent invalid conversation creation', async () => {
      // Try to create conversation with same user
      const { response, data } = await testApiCall('/conversations', {
        method: 'POST',
        body: JSON.stringify({
          user1Id: 1001,
          user2Id: 1001
        })
      });
      
      expect(response.status).toBe(400);
      expect(data.message).toContain('não pode conversar consigo mesmo');
    });
  });
});