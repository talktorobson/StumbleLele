/**
 * Real-time Integration Tests
 * Agent 5 - Integration & Testing Specialist
 * 
 * Tests real-time functionality including WebSocket connections and live updates
 */

import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { 
  testApiCall, 
  testSupabase,
  setupTestDatabase, 
  cleanupTestDatabase,
  PerformanceTracker,
  performanceTargets
} from '../setup';
import { ChatRealtimeManager } from '../../client/src/lib/supabase-realtime';

describe('Real-time Integration Tests', () => {
  const performance = new PerformanceTracker();
  let realtimeManager: ChatRealtimeManager;
  
  beforeEach(async () => {
    await setupTestDatabase();
    realtimeManager = new ChatRealtimeManager();
  });
  
  afterEach(async () => {
    realtimeManager.cleanup();
    await cleanupTestDatabase();
  });

  describe('Real-time Connection Management', () => {
    test('should establish WebSocket connection successfully', async () => {
      let connectionEstablished = false;
      
      const channel = realtimeManager.subscribeToConversation(
        'conv-1001-1002',
        () => {},
        () => {},
        () => {}
      );
      
      // Wait for connection
      await new Promise(resolve => {
        const checkConnection = setInterval(() => {
          if (channel.state === 'joined') {
            connectionEstablished = true;
            clearInterval(checkConnection);
            resolve(true);
          }
        }, 100);
        
        setTimeout(() => {
          clearInterval(checkConnection);
          resolve(false);
        }, 5000);
      });
      
      expect(connectionEstablished).toBe(true);
      expect(realtimeManager.getActiveSubscriptionCount()).toBe(1);
    });

    test('should handle connection cleanup properly', async () => {
      realtimeManager.subscribeToConversation('conv-1001-1002', () => {});
      realtimeManager.subscribeToFriendRequests(1001, () => {});
      
      expect(realtimeManager.getActiveSubscriptionCount()).toBe(2);
      
      realtimeManager.cleanup();
      
      expect(realtimeManager.getActiveSubscriptionCount()).toBe(0);
    });

    test('should manage multiple subscriptions correctly', async () => {
      const conversationIds = ['conv-1001-1002', 'conv-1001-1003', 'conv-1002-1003'];
      
      conversationIds.forEach(id => {
        realtimeManager.subscribeToConversation(id, () => {});
      });
      
      expect(realtimeManager.getActiveSubscriptionCount()).toBe(3);
      
      // Unsubscribe from one
      realtimeManager.unsubscribe('conversation:conv-1001-1002');
      expect(realtimeManager.getActiveSubscriptionCount()).toBe(2);
    });
  });

  describe('Real-time Message Delivery', () => {
    test('should receive new messages in real-time', async () => {
      let receivedMessage: any = null;
      
      // Subscribe to conversation
      realtimeManager.subscribeToConversation(
        'conv-1001-1002',
        (message) => {
          receivedMessage = message;
        }
      );
      
      // Wait for subscription to be active
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Send a message through API
      await testApiCall('/messages', {
        method: 'POST',
        body: JSON.stringify({
          conversationId: 'conv-1001-1002',
          senderId: 1001,
          content: 'Mensagem em tempo real',
          messageType: 'text'
        })
      });
      
      // Wait for real-time delivery
      await new Promise(resolve => {
        const checkMessage = setInterval(() => {
          if (receivedMessage) {
            clearInterval(checkMessage);
            resolve(true);
          }
        }, 100);
        
        setTimeout(() => {
          clearInterval(checkMessage);
          resolve(false);
        }, 5000);
      });
      
      expect(receivedMessage).toBeTruthy();
      expect(receivedMessage.content).toBe('Mensagem em tempo real');
      expect(receivedMessage.conversation_id).toBe('conv-1001-1002');
    });

    test('should handle message updates in real-time', async () => {
      let updatedMessage: any = null;
      
      // Send initial message
      const { data } = await testApiCall('/messages', {
        method: 'POST',
        body: JSON.stringify({
          conversationId: 'conv-1001-1002',
          senderId: 1001,
          content: 'Mensagem original',
          messageType: 'text'
        })
      });
      
      const messageId = data.message.id;
      
      // Subscribe to conversation
      realtimeManager.subscribeToConversation(
        'conv-1001-1002',
        () => {},
        (message) => {
          updatedMessage = message;
        }
      );
      
      // Wait for subscription to be active
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update the message
      await testApiCall(`/messages/${messageId}`, {
        method: 'PUT',
        body: JSON.stringify({
          content: 'Mensagem editada em tempo real',
          userId: 1001
        })
      });
      
      // Wait for real-time update
      await new Promise(resolve => {
        const checkMessage = setInterval(() => {
          if (updatedMessage) {
            clearInterval(checkMessage);
            resolve(true);
          }
        }, 100);
        
        setTimeout(() => {
          clearInterval(checkMessage);
          resolve(false);
        }, 5000);
      });
      
      expect(updatedMessage).toBeTruthy();
      expect(updatedMessage.content).toBe('Mensagem editada em tempo real');
    });

    test('should handle message deletion in real-time', async () => {
      let deletedMessage: any = null;
      
      // Send initial message
      const { data } = await testApiCall('/messages', {
        method: 'POST',
        body: JSON.stringify({
          conversationId: 'conv-1001-1002',
          senderId: 1001,
          content: 'Mensagem para deletar',
          messageType: 'text'
        })
      });
      
      const messageId = data.message.id;
      
      // Subscribe to conversation
      realtimeManager.subscribeToConversation(
        'conv-1001-1002',
        () => {},
        () => {},
        (message) => {
          deletedMessage = message;
        }
      );
      
      // Wait for subscription to be active
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Delete the message
      await testApiCall(`/messages/${messageId}`, {
        method: 'DELETE',
        body: JSON.stringify({
          userId: 1001
        })
      });
      
      // Wait for real-time deletion
      await new Promise(resolve => {
        const checkMessage = setInterval(() => {
          if (deletedMessage) {
            clearInterval(checkMessage);
            resolve(true);
          }
        }, 100);
        
        setTimeout(() => {
          clearInterval(checkMessage);
          resolve(false);
        }, 5000);
      });
      
      expect(deletedMessage).toBeTruthy();
      expect(deletedMessage.id).toBe(messageId);
    });
  });

  describe('Real-time Friend Requests', () => {
    test('should receive friend requests in real-time', async () => {
      let receivedRequest: any = null;
      
      // Subscribe to friend requests
      realtimeManager.subscribeToFriendRequests(
        1001,
        (request) => {
          receivedRequest = request;
        }
      );
      
      // Wait for subscription to be active
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Send friend request
      await testApiCall('/friends', {
        method: 'POST',
        body: JSON.stringify({
          userId: 1005,
          friendUsername: 'helena_test'
        })
      });
      
      // Wait for real-time notification
      await new Promise(resolve => {
        const checkRequest = setInterval(() => {
          if (receivedRequest) {
            clearInterval(checkRequest);
            resolve(true);
          }
        }, 100);
        
        setTimeout(() => {
          clearInterval(checkRequest);
          resolve(false);
        }, 5000);
      });
      
      expect(receivedRequest).toBeTruthy();
      expect(receivedRequest.user_id).toBe(1005);
      expect(receivedRequest.friend_id).toBe(1001);
      expect(receivedRequest.status).toBe('pending');
    });

    test('should receive friend status updates in real-time', async () => {
      let updatedRequest: any = null;
      
      // Send initial friend request
      await testApiCall('/friends', {
        method: 'POST',
        body: JSON.stringify({
          userId: 1005,
          friendUsername: 'helena_test'
        })
      });
      
      // Subscribe to friend updates
      realtimeManager.subscribeToFriendRequests(
        1001,
        () => {},
        (request) => {
          updatedRequest = request;
        }
      );
      
      // Wait for subscription to be active
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Accept friend request
      await testApiCall('/friends/accept', {
        method: 'POST',
        body: JSON.stringify({
          userId: 1001,
          friendId: 1005
        })
      });
      
      // Wait for real-time update
      await new Promise(resolve => {
        const checkRequest = setInterval(() => {
          if (updatedRequest) {
            clearInterval(checkRequest);
            resolve(true);
          }
        }, 100);
        
        setTimeout(() => {
          clearInterval(checkRequest);
          resolve(false);
        }, 5000);
      });
      
      expect(updatedRequest).toBeTruthy();
      expect(updatedRequest.status).toBe('accepted');
    });
  });

  describe('Real-time Performance Tests', () => {
    test('should handle high-frequency message sending', async () => {
      const receivedMessages: any[] = [];
      
      // Subscribe to conversation
      realtimeManager.subscribeToConversation(
        'conv-1001-1002',
        (message) => {
          receivedMessages.push(message);
        }
      );
      
      // Wait for subscription to be active
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Send multiple messages rapidly
      const sendPromises = [];
      for (let i = 0; i < 10; i++) {
        sendPromises.push(
          testApiCall('/messages', {
            method: 'POST',
            body: JSON.stringify({
              conversationId: 'conv-1001-1002',
              senderId: 1001,
              content: `Mensagem rápida ${i}`,
              messageType: 'text'
            })
          })
        );
      }
      
      await Promise.all(sendPromises);
      
      // Wait for all messages to be received
      await new Promise(resolve => {
        const checkMessages = setInterval(() => {
          if (receivedMessages.length >= 10) {
            clearInterval(checkMessages);
            resolve(true);
          }
        }, 100);
        
        setTimeout(() => {
          clearInterval(checkMessages);
          resolve(false);
        }, 10000);
      });
      
      expect(receivedMessages.length).toBe(10);
    });

    test('should measure real-time message latency', async () => {
      const latencies: number[] = [];
      
      // Subscribe to conversation
      realtimeManager.subscribeToConversation(
        'conv-1001-1002',
        (message) => {
          const receiveTime = Date.now();
          const sendTime = new Date(message.created_at).getTime();
          const latency = receiveTime - sendTime;
          latencies.push(latency);
        }
      );
      
      // Wait for subscription to be active
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Send test messages
      for (let i = 0; i < 5; i++) {
        await testApiCall('/messages', {
          method: 'POST',
          body: JSON.stringify({
            conversationId: 'conv-1001-1002',
            senderId: 1001,
            content: `Teste de latência ${i}`,
            messageType: 'text'
          })
        });
        
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Wait for all messages to be received
      await new Promise(resolve => {
        const checkLatencies = setInterval(() => {
          if (latencies.length >= 5) {
            clearInterval(checkLatencies);
            resolve(true);
          }
        }, 100);
        
        setTimeout(() => {
          clearInterval(checkLatencies);
          resolve(false);
        }, 10000);
      });
      
      expect(latencies.length).toBe(5);
      
      // Calculate average latency
      const avgLatency = latencies.reduce((sum, lat) => sum + lat, 0) / latencies.length;
      expect(avgLatency).toBeLessThan(performanceTargets.realtimeLatency);
    });
  });

  describe('Real-time Error Handling', () => {
    test('should handle connection failures gracefully', async () => {
      let errorOccurred = false;
      
      // Subscribe to a non-existent conversation
      try {
        realtimeManager.subscribeToConversation('non-existent-conv', () => {});
      } catch (error) {
        errorOccurred = true;
      }
      
      // Should not crash the application
      expect(errorOccurred).toBe(false);
    });

    test('should handle subscription limit', async () => {
      // Create many subscriptions
      const subscriptions = [];
      for (let i = 0; i < 50; i++) {
        subscriptions.push(
          realtimeManager.subscribeToConversation(`conv-${i}`, () => {})
        );
      }
      
      // Should handle gracefully without crashing
      expect(realtimeManager.getActiveSubscriptionCount()).toBeLessThanOrEqual(50);
    });

    test('should handle malformed real-time data', async () => {
      let errorHandled = false;
      
      // Subscribe to conversation with error handler
      realtimeManager.subscribeToConversation(
        'conv-1001-1002',
        (message) => {
          // This should handle malformed data gracefully
          try {
            expect(message).toBeTruthy();
          } catch (error) {
            errorHandled = true;
          }
        }
      );
      
      // Send normal message to verify subscription works
      await testApiCall('/messages', {
        method: 'POST',
        body: JSON.stringify({
          conversationId: 'conv-1001-1002',
          senderId: 1001,
          content: 'Teste de erro',
          messageType: 'text'
        })
      });
      
      // Wait for message
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      expect(errorHandled).toBe(false);
    });
  });

  describe('Real-time Subscription Management', () => {
    test('should prevent duplicate subscriptions', async () => {
      // Subscribe to same conversation twice
      realtimeManager.subscribeToConversation('conv-1001-1002', () => {});
      realtimeManager.subscribeToConversation('conv-1001-1002', () => {});
      
      // Should only have one active subscription
      expect(realtimeManager.getActiveSubscriptionCount()).toBe(1);
    });

    test('should track subscription status correctly', async () => {
      realtimeManager.subscribeToConversation('conv-1001-1002', () => {});
      
      expect(realtimeManager.isSubscribed('conversation:conv-1001-1002')).toBe(true);
      expect(realtimeManager.isSubscribed('conversation:non-existent')).toBe(false);
    });

    test('should list active subscriptions', async () => {
      realtimeManager.subscribeToConversation('conv-1001-1002', () => {});
      realtimeManager.subscribeToFriendRequests(1001, () => {});
      
      const activeSubscriptions = realtimeManager.getActiveSubscriptions();
      
      expect(activeSubscriptions).toContain('conversation:conv-1001-1002');
      expect(activeSubscriptions).toContain('friend_requests:1001');
    });
  });

  describe('Multi-user Real-time Scenarios', () => {
    test('should handle messages from multiple users', async () => {
      const receivedMessages: any[] = [];
      
      // Subscribe to conversation
      realtimeManager.subscribeToConversation(
        'conv-1001-1002',
        (message) => {
          receivedMessages.push(message);
        }
      );
      
      // Wait for subscription to be active
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Send messages from both users
      await testApiCall('/messages', {
        method: 'POST',
        body: JSON.stringify({
          conversationId: 'conv-1001-1002',
          senderId: 1001,
          content: 'Mensagem do usuário 1001',
          messageType: 'text'
        })
      });
      
      await testApiCall('/messages', {
        method: 'POST',
        body: JSON.stringify({
          conversationId: 'conv-1001-1002',
          senderId: 1002,
          content: 'Mensagem do usuário 1002',
          messageType: 'text'
        })
      });
      
      // Wait for messages to be received
      await new Promise(resolve => {
        const checkMessages = setInterval(() => {
          if (receivedMessages.length >= 2) {
            clearInterval(checkMessages);
            resolve(true);
          }
        }, 100);
        
        setTimeout(() => {
          clearInterval(checkMessages);
          resolve(false);
        }, 5000);
      });
      
      expect(receivedMessages.length).toBe(2);
      expect(receivedMessages[0].sender_id).toBe(1001);
      expect(receivedMessages[1].sender_id).toBe(1002);
    });
  });
});