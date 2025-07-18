/**
 * Friends Management Integration Tests
 * Agent 5 - Integration & Testing Specialist
 * 
 * Tests the complete friend management workflow
 */

import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { 
  testApiCall, 
  mockUsers, 
  mockFriends, 
  setupTestDatabase, 
  cleanupTestDatabase,
  PerformanceTracker,
  securityTestCases,
  performanceTargets
} from '../setup';

describe('Friends Management Integration Tests', () => {
  const performance = new PerformanceTracker();
  
  beforeEach(async () => {
    await setupTestDatabase();
  });
  
  afterEach(async () => {
    await cleanupTestDatabase();
  });

  describe('Friend List Retrieval', () => {
    test('should retrieve user friends list correctly', async () => {
      const duration = await performance.measureAsync('getFriends', async () => {
        const { response, data } = await testApiCall('/friends?userId=1001');
        
        expect(response.status).toBe(200);
        expect(data.friends).toBeInstanceOf(Array);
        expect(data.friends.length).toBeGreaterThan(0);
        
        // Check friend structure
        const friend = data.friends[0];
        expect(friend).toHaveProperty('id');
        expect(friend).toHaveProperty('status', 'accepted');
        expect(friend).toHaveProperty('friend');
        expect(friend.friend).toHaveProperty('username');
        expect(friend.friend).toHaveProperty('displayName');
        expect(friend.friend).toHaveProperty('isOnline');
      });
      
      expect(duration).toBeLessThan(performanceTargets.apiResponse);
    });

    test('should handle empty friends list', async () => {
      const { response, data } = await testApiCall('/friends?userId=1005');
      
      expect(response.status).toBe(200);
      expect(data.friends).toBeInstanceOf(Array);
      expect(data.friends.length).toBe(0);
    });

    test('should handle invalid userId', async () => {
      const { response, data } = await testApiCall('/friends?userId=invalid');
      
      expect(response.status).toBe(400);
      expect(data.message).toContain('userId deve ser um número válido');
    });
  });

  describe('Friend Request Management', () => {
    test('should send friend request successfully', async () => {
      const duration = await performance.measureAsync('sendFriendRequest', async () => {
        const { response, data } = await testApiCall('/friends', {
          method: 'POST',
          body: JSON.stringify({
            userId: 1001,
            friendUsername: 'miguel_test'
          })
        });
        
        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.message).toContain('Pedido de amizade enviado');
      });
      
      expect(duration).toBeLessThan(performanceTargets.apiResponse);
    });

    test('should prevent duplicate friend requests', async () => {
      const { response, data } = await testApiCall('/friends', {
        method: 'POST',
        body: JSON.stringify({
          userId: 1001,
          friendUsername: 'julia_test'
        })
      });
      
      expect(response.status).toBe(400);
      expect(data.message).toContain('Friend relationship already exists');
    });

    test('should handle non-existent user', async () => {
      const { response, data } = await testApiCall('/friends', {
        method: 'POST',
        body: JSON.stringify({
          userId: 1001,
          friendUsername: 'nonexistent_user'
        })
      });
      
      expect(response.status).toBe(400);
      expect(data.message).toContain('User not found');
    });

    test('should retrieve pending friend requests', async () => {
      const { response, data } = await testApiCall('/friends/requests?userId=1001');
      
      expect(response.status).toBe(200);
      expect(data.requests).toBeInstanceOf(Array);
      
      if (data.requests.length > 0) {
        const request = data.requests[0];
        expect(request).toHaveProperty('id');
        expect(request).toHaveProperty('user');
        expect(request.user).toHaveProperty('username');
      }
    });
  });

  describe('Friend Request Actions', () => {
    test('should accept friend request successfully', async () => {
      // First ensure there's a pending request
      await testApiCall('/friends', {
        method: 'POST',
        body: JSON.stringify({
          userId: 1005,
          friendUsername: 'helena_test'
        })
      });

      const duration = await performance.measureAsync('acceptFriendRequest', async () => {
        const { response, data } = await testApiCall('/friends/accept', {
          method: 'POST',
          body: JSON.stringify({
            userId: 1001,
            friendId: 1005
          })
        });
        
        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.message).toContain('aceito');
      });
      
      expect(duration).toBeLessThan(performanceTargets.apiResponse);
    });

    test('should reject friend request successfully', async () => {
      // First ensure there's a pending request
      await testApiCall('/friends', {
        method: 'POST',
        body: JSON.stringify({
          userId: 1005,
          friendUsername: 'helena_test'
        })
      });

      const { response, data } = await testApiCall('/friends/reject', {
        method: 'POST',
        body: JSON.stringify({
          userId: 1001,
          friendId: 1005
        })
      });
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toContain('rejeitado');
    });

    test('should handle non-existent friend request', async () => {
      const { response, data } = await testApiCall('/friends/accept', {
        method: 'POST',
        body: JSON.stringify({
          userId: 1001,
          friendId: 9999
        })
      });
      
      expect(response.status).toBe(400);
      expect(data.message).toContain('not found');
    });
  });

  describe('Friend Removal', () => {
    test('should remove friend successfully', async () => {
      const duration = await performance.measureAsync('removeFriend', async () => {
        const { response, data } = await testApiCall('/friends/1002?userId=1001', {
          method: 'DELETE'
        });
        
        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.message).toContain('removido');
      });
      
      expect(duration).toBeLessThan(performanceTargets.apiResponse);
    });

    test('should handle removal of non-existent friend', async () => {
      const { response, data } = await testApiCall('/friends/9999?userId=1001', {
        method: 'DELETE'
      });
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });

  describe('User Search', () => {
    test('should search users by username', async () => {
      const duration = await performance.measureAsync('searchUsers', async () => {
        const { response, data } = await testApiCall('/users/search?q=julia&currentUserId=1001');
        
        expect(response.status).toBe(200);
        expect(data.users).toBeInstanceOf(Array);
        
        if (data.users.length > 0) {
          const user = data.users[0];
          expect(user).toHaveProperty('username');
          expect(user).toHaveProperty('displayName');
          expect(user).toHaveProperty('avatarEmoji');
          expect(user.username).toContain('julia');
        }
      });
      
      expect(duration).toBeLessThan(performanceTargets.apiResponse);
    });

    test('should handle empty search results', async () => {
      const { response, data } = await testApiCall('/users/search?q=nonexistent&currentUserId=1001');
      
      expect(response.status).toBe(200);
      expect(data.users).toBeInstanceOf(Array);
      expect(data.users.length).toBe(0);
    });

    test('should exclude current user from search results', async () => {
      const { response, data } = await testApiCall('/users/search?q=helena&currentUserId=1001');
      
      expect(response.status).toBe(200);
      expect(data.users).toBeInstanceOf(Array);
      
      // Should not include the current user
      const currentUser = data.users.find((user: any) => user.id === 1001);
      expect(currentUser).toBeUndefined();
    });
  });

  describe('Security Tests', () => {
    test('should prevent SQL injection in friend requests', async () => {
      for (const injection of securityTestCases.sqlInjection) {
        const { response, data } = await testApiCall('/friends', {
          method: 'POST',
          body: JSON.stringify({
            userId: 1001,
            friendUsername: injection
          })
        });
        
        // Should not crash the server
        expect(response.status).toBe(400);
        expect(data.message).toContain('User not found');
      }
    });

    test('should prevent XSS in user search', async () => {
      for (const xss of securityTestCases.xssAttacks) {
        const { response, data } = await testApiCall(`/users/search?q=${encodeURIComponent(xss)}&currentUserId=1001`);
        
        // Should not crash the server
        expect(response.status).toBe(200);
        expect(data.users).toBeInstanceOf(Array);
      }
    });

    test('should validate input lengths', async () => {
      const { response, data } = await testApiCall('/friends', {
        method: 'POST',
        body: JSON.stringify({
          userId: 1001,
          friendUsername: securityTestCases.oversizedData.longUsername
        })
      });
      
      expect(response.status).toBe(400);
      expect(data.message).toContain('Dados inválidos');
    });
  });

  describe('Performance Tests', () => {
    test('should handle concurrent friend requests', async () => {
      const requests = [];
      
      for (let i = 0; i < 5; i++) {
        requests.push(
          testApiCall('/friends', {
            method: 'POST',
            body: JSON.stringify({
              userId: 1001,
              friendUsername: `test_user_${i + 100}`
            })
          })
        );
      }
      
      const results = await Promise.all(requests);
      
      // All requests should complete without errors
      results.forEach(({ response }) => {
        expect(response.status).toBeLessThan(500);
      });
    });

    test('should retrieve large friends list efficiently', async () => {
      // This test assumes we have a user with many friends
      const duration = await performance.measureAsync('largeFriendsList', async () => {
        const { response, data } = await testApiCall('/friends?userId=1001');
        
        expect(response.status).toBe(200);
        expect(data.friends).toBeInstanceOf(Array);
      });
      
      expect(duration).toBeLessThan(performanceTargets.apiResponse);
    });
  });

  describe('Data Integrity Tests', () => {
    test('should maintain bidirectional friendship', async () => {
      // Send friend request
      await testApiCall('/friends', {
        method: 'POST',
        body: JSON.stringify({
          userId: 1005,
          friendUsername: 'helena_test'
        })
      });
      
      // Accept friend request
      await testApiCall('/friends/accept', {
        method: 'POST',
        body: JSON.stringify({
          userId: 1001,
          friendId: 1005
        })
      });
      
      // Check both users have the friendship
      const { data: helena } = await testApiCall('/friends?userId=1001');
      const { data: miguel } = await testApiCall('/friends?userId=1005');
      
      const helenaFriend = helena.friends.find((f: any) => f.friend.id === 1005);
      const miguelFriend = miguel.friends.find((f: any) => f.friend.id === 1001);
      
      expect(helenaFriend).toBeDefined();
      expect(miguelFriend).toBeDefined();
      expect(helenaFriend.status).toBe('accepted');
      expect(miguelFriend.status).toBe('accepted');
    });

    test('should clean up friendship on removal', async () => {
      // Remove friendship
      await testApiCall('/friends/1002?userId=1001', {
        method: 'DELETE'
      });
      
      // Check both users no longer have the friendship
      const { data: helena } = await testApiCall('/friends?userId=1001');
      const { data: julia } = await testApiCall('/friends?userId=1002');
      
      const helenaFriend = helena.friends.find((f: any) => f.friend.id === 1002);
      const juliaFriend = julia.friends.find((f: any) => f.friend.id === 1001);
      
      expect(helenaFriend).toBeUndefined();
      expect(juliaFriend).toBeUndefined();
    });
  });

  describe('Edge Cases', () => {
    test('should handle self-friend request', async () => {
      const { response, data } = await testApiCall('/friends', {
        method: 'POST',
        body: JSON.stringify({
          userId: 1001,
          friendUsername: 'helena_test'
        })
      });
      
      expect(response.status).toBe(400);
      expect(data.message).toContain('Friend relationship already exists');
    });

    test('should handle missing parameters', async () => {
      const { response, data } = await testApiCall('/friends', {
        method: 'POST',
        body: JSON.stringify({
          userId: 1001
          // Missing friendUsername
        })
      });
      
      expect(response.status).toBe(400);
      expect(data.message).toContain('Dados inválidos');
    });

    test('should handle invalid data types', async () => {
      const { response, data } = await testApiCall('/friends', {
        method: 'POST',
        body: JSON.stringify({
          userId: 'invalid',
          friendUsername: 123
        })
      });
      
      expect(response.status).toBe(400);
      expect(data.message).toContain('Dados inválidos');
    });
  });
});