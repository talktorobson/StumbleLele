/**
 * Chat Messaging Integration Tests
 * Agent 5 - Integration & Testing Specialist
 * 
 * Tests the complete chat messaging workflow
 */

import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { 
  testApiCall, 
  mockUsers, 
  mockConversations, 
  mockMessages,
  setupTestDatabase, 
  cleanupTestDatabase,
  PerformanceTracker,
  securityTestCases,
  performanceTargets,
  generateTestMessage
} from '../setup';

describe('Chat Messaging Integration Tests', () => {
  const performance = new PerformanceTracker();
  
  beforeEach(async () => {
    await setupTestDatabase();
  });
  
  afterEach(async () => {
    await cleanupTestDatabase();
  });

  describe('Conversation Management', () => {
    test('should retrieve user conversations correctly', async () => {
      const duration = await performance.measureAsync('getConversations', async () => {
        const { response, data } = await testApiCall('/conversations?userId=1001');
        
        expect(response.status).toBe(200);
        expect(data.conversations).toBeInstanceOf(Array);
        expect(data.conversations.length).toBeGreaterThan(0);
        
        // Check conversation structure
        const conversation = data.conversations[0];
        expect(conversation).toHaveProperty('id');
        expect(conversation).toHaveProperty('user1Id');
        expect(conversation).toHaveProperty('user2Id');
        expect(conversation).toHaveProperty('lastMessageAt');
        expect(conversation).toHaveProperty('user1');
        expect(conversation).toHaveProperty('user2');
      });
      
      expect(duration).toBeLessThan(performanceTargets.apiResponse);
    });

    test('should create new conversation successfully', async () => {
      const duration = await performance.measureAsync('createConversation', async () => {
        const { response, data } = await testApiCall('/conversations', {
          method: 'POST',
          body: JSON.stringify({
            user1Id: 1001,
            user2Id: 1004
          })
        });
        
        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.conversation).toHaveProperty('id');
        expect(data.conversation).toHaveProperty('user1Id');
        expect(data.conversation).toHaveProperty('user2Id');
        expect(data.conversation.isActive).toBe(true);
      });
      
      expect(duration).toBeLessThan(performanceTargets.apiResponse);
    });

    test('should return existing conversation when creating duplicate', async () => {
      const { response, data } = await testApiCall('/conversations', {
        method: 'POST',
        body: JSON.stringify({
          user1Id: 1001,
          user2Id: 1002
        })
      });
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.conversation.id).toBe('conv-1001-1002');
    });

    test('should prevent self-conversation', async () => {
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

    test('should handle empty conversations list', async () => {
      const { response, data } = await testApiCall('/conversations?userId=1005');
      
      expect(response.status).toBe(200);
      expect(data.conversations).toBeInstanceOf(Array);
      expect(data.conversations.length).toBe(0);
    });
  });

  describe('Message Management', () => {
    test('should retrieve conversation messages correctly', async () => {
      const duration = await performance.measureAsync('getMessages', async () => {
        const { response, data } = await testApiCall('/conversations/conv-1001-1002/messages');
        
        expect(response.status).toBe(200);
        expect(data.messages).toBeInstanceOf(Array);
        expect(data.messages.length).toBeGreaterThan(0);
        
        // Check message structure
        const message = data.messages[0];
        expect(message).toHaveProperty('id');
        expect(message).toHaveProperty('content');
        expect(message).toHaveProperty('senderId');
        expect(message).toHaveProperty('createdAt');
        expect(message).toHaveProperty('sender');
        expect(message.sender).toHaveProperty('username');
        expect(message.sender).toHaveProperty('avatarEmoji');
        
        // Messages should be ordered by creation time
        const timestamps = data.messages.map((msg: any) => new Date(msg.createdAt).getTime());
        expect(timestamps).toEqual([...timestamps].sort((a, b) => a - b));
      });
      
      expect(duration).toBeLessThan(performanceTargets.apiResponse);
    });

    test('should send message successfully', async () => {
      const testMessage = 'Olá! Esta é uma mensagem de teste! 😊';
      
      const duration = await performance.measureAsync('sendMessage', async () => {
        const { response, data } = await testApiCall('/messages', {
          method: 'POST',
          body: JSON.stringify({
            conversationId: 'conv-1001-1002',
            senderId: 1001,
            content: testMessage,
            messageType: 'text'
          })
        });
        
        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.message).toHaveProperty('id');
        expect(data.message).toHaveProperty('content', testMessage);
        expect(data.message).toHaveProperty('senderId', 1001);
        expect(data.message).toHaveProperty('messageType', 'text');
      });
      
      expect(duration).toBeLessThan(performanceTargets.apiResponse);
    });

    test('should update conversation timestamp on message send', async () => {
      // Get conversation before sending message
      const { data: beforeData } = await testApiCall('/conversations?userId=1001');
      const conversationBefore = beforeData.conversations.find((c: any) => c.id === 'conv-1001-1002');
      const timestampBefore = conversationBefore?.lastMessageAt;
      
      // Send message
      await testApiCall('/messages', {
        method: 'POST',
        body: JSON.stringify({
          conversationId: 'conv-1001-1002',
          senderId: 1001,
          content: 'Teste de timestamp',
          messageType: 'text'
        })
      });
      
      // Get conversation after sending message
      const { data: afterData } = await testApiCall('/conversations?userId=1001');
      const conversationAfter = afterData.conversations.find((c: any) => c.id === 'conv-1001-1002');
      const timestampAfter = conversationAfter?.lastMessageAt;
      
      expect(new Date(timestampAfter).getTime()).toBeGreaterThan(new Date(timestampBefore).getTime());
    });

    test('should handle empty message content', async () => {
      const { response, data } = await testApiCall('/messages', {
        method: 'POST',
        body: JSON.stringify({
          conversationId: 'conv-1001-1002',
          senderId: 1001,
          content: '',
          messageType: 'text'
        })
      });
      
      expect(response.status).toBe(400);
      expect(data.message).toContain('Dados inválidos');
    });

    test('should handle invalid conversation ID', async () => {
      const { response, data } = await testApiCall('/messages', {
        method: 'POST',
        body: JSON.stringify({
          conversationId: 'invalid-conversation',
          senderId: 1001,
          content: 'Test message',
          messageType: 'text'
        })
      });
      
      expect(response.status).toBe(400);
      expect(data.message).toContain('Dados inválidos');
    });
  });

  describe('Message Editing', () => {
    test('should edit message successfully', async () => {
      // First send a message
      const { data: sendData } = await testApiCall('/messages', {
        method: 'POST',
        body: JSON.stringify({
          conversationId: 'conv-1001-1002',
          senderId: 1001,
          content: 'Mensagem original',
          messageType: 'text'
        })
      });
      
      const messageId = sendData.message.id;
      const newContent = 'Mensagem editada';
      
      const duration = await performance.measureAsync('editMessage', async () => {
        const { response, data } = await testApiCall(`/messages/${messageId}`, {
          method: 'PUT',
          body: JSON.stringify({
            content: newContent,
            userId: 1001
          })
        });
        
        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.message).toHaveProperty('content', newContent);
      });
      
      expect(duration).toBeLessThan(performanceTargets.apiResponse);
    });

    test('should prevent editing other user messages', async () => {
      const { response, data } = await testApiCall('/messages/msg-1', {
        method: 'PUT',
        body: JSON.stringify({
          content: 'Tentativa de edição maliciosa',
          userId: 1002 // Different user
        })
      });
      
      expect(response.status).toBe(400);
    });

    test('should handle editing non-existent message', async () => {
      const { response, data } = await testApiCall('/messages/non-existent', {
        method: 'PUT',
        body: JSON.stringify({
          content: 'Edição teste',
          userId: 1001
        })
      });
      
      expect(response.status).toBe(400);
    });
  });

  describe('Message Deletion', () => {
    test('should delete message successfully (soft delete)', async () => {
      // First send a message
      const { data: sendData } = await testApiCall('/messages', {
        method: 'POST',
        body: JSON.stringify({
          conversationId: 'conv-1001-1002',
          senderId: 1001,
          content: 'Mensagem para deletar',
          messageType: 'text'
        })
      });
      
      const messageId = sendData.message.id;
      
      const duration = await performance.measureAsync('deleteMessage', async () => {
        const { response, data } = await testApiCall(`/messages/${messageId}`, {
          method: 'DELETE',
          body: JSON.stringify({
            userId: 1001
          })
        });
        
        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
      });
      
      expect(duration).toBeLessThan(performanceTargets.apiResponse);
      
      // Verify message is not returned in conversation messages
      const { data: messagesData } = await testApiCall('/conversations/conv-1001-1002/messages');
      const deletedMessage = messagesData.messages.find((m: any) => m.id === messageId);
      expect(deletedMessage).toBeUndefined();
    });

    test('should prevent deleting other user messages', async () => {
      const { response, data } = await testApiCall('/messages/msg-1', {
        method: 'DELETE',
        body: JSON.stringify({
          userId: 1002 // Different user
        })
      });
      
      expect(response.status).toBe(400);
    });
  });

  describe('Message Types', () => {
    test('should handle different message types', async () => {
      const messageTypes = ['text', 'emoji', 'image', 'audio'];
      
      for (const messageType of messageTypes) {
        const { response, data } = await testApiCall('/messages', {
          method: 'POST',
          body: JSON.stringify({
            conversationId: 'conv-1001-1002',
            senderId: 1001,
            content: `Teste ${messageType}`,
            messageType
          })
        });
        
        expect(response.status).toBe(200);
        expect(data.message.messageType).toBe(messageType);
      }
    });

    test('should default to text message type', async () => {
      const { response, data } = await testApiCall('/messages', {
        method: 'POST',
        body: JSON.stringify({
          conversationId: 'conv-1001-1002',
          senderId: 1001,
          content: 'Mensagem sem tipo especificado'
        })
      });
      
      expect(response.status).toBe(200);
      expect(data.message.messageType).toBe('text');
    });
  });

  describe('Security Tests', () => {
    test('should prevent SQL injection in message content', async () => {
      for (const injection of securityTestCases.sqlInjection) {
        const { response, data } = await testApiCall('/messages', {
          method: 'POST',
          body: JSON.stringify({
            conversationId: 'conv-1001-1002',
            senderId: 1001,
            content: injection,
            messageType: 'text'
          })
        });
        
        // Should not crash the server
        expect(response.status).toBe(200);
        expect(data.message.content).toBe(injection);
      }
    });

    test('should handle XSS attempts in message content', async () => {
      for (const xss of securityTestCases.xssAttacks) {
        const { response, data } = await testApiCall('/messages', {
          method: 'POST',
          body: JSON.stringify({
            conversationId: 'conv-1001-1002',
            senderId: 1001,
            content: xss,
            messageType: 'text'
          })
        });
        
        // Should store the content safely
        expect(response.status).toBe(200);
        expect(data.message.content).toBe(xss);
      }
    });

    test('should enforce message length limits', async () => {
      const { response, data } = await testApiCall('/messages', {
        method: 'POST',
        body: JSON.stringify({
          conversationId: 'conv-1001-1002',
          senderId: 1001,
          content: securityTestCases.oversizedData.longMessage,
          messageType: 'text'
        })
      });
      
      expect(response.status).toBe(400);
      expect(data.message).toContain('Dados inválidos');
    });
  });

  describe('Performance Tests', () => {
    test('should handle concurrent message sending', async () => {
      const messages = [];
      
      for (let i = 0; i < 10; i++) {
        messages.push(
          testApiCall('/messages', {
            method: 'POST',
            body: JSON.stringify({
              conversationId: 'conv-1001-1002',
              senderId: 1001,
              content: `Mensagem concorrente ${i}`,
              messageType: 'text'
            })
          })
        );
      }
      
      const results = await Promise.all(messages);
      
      // All messages should be sent successfully
      results.forEach(({ response }) => {
        expect(response.status).toBe(200);
      });
    });

    test('should load large message history efficiently', async () => {
      // Send multiple messages first
      const sendPromises = [];
      for (let i = 0; i < 20; i++) {
        sendPromises.push(
          testApiCall('/messages', {
            method: 'POST',
            body: JSON.stringify({
              conversationId: 'conv-1001-1002',
              senderId: i % 2 === 0 ? 1001 : 1002,
              content: `Mensagem histórica ${i}`,
              messageType: 'text'
            })
          })
        );
      }
      
      await Promise.all(sendPromises);
      
      // Now test loading the history
      const duration = await performance.measureAsync('loadMessageHistory', async () => {
        const { response, data } = await testApiCall('/conversations/conv-1001-1002/messages');
        
        expect(response.status).toBe(200);
        expect(data.messages.length).toBeGreaterThan(20);
      });
      
      expect(duration).toBeLessThan(performanceTargets.apiResponse);
    });
  });

  describe('Data Consistency Tests', () => {
    test('should maintain message order consistency', async () => {
      // Send messages in sequence
      const messages = [];
      for (let i = 0; i < 5; i++) {
        const { data } = await testApiCall('/messages', {
          method: 'POST',
          body: JSON.stringify({
            conversationId: 'conv-1001-1002',
            senderId: 1001,
            content: `Mensagem ordenada ${i}`,
            messageType: 'text'
          })
        });
        messages.push(data.message);
      }
      
      // Retrieve messages and verify order
      const { data: retrievedData } = await testApiCall('/conversations/conv-1001-1002/messages');
      
      const sentMessages = retrievedData.messages.filter((m: any) => 
        m.content.includes('Mensagem ordenada')
      );
      
      // Check order is correct
      for (let i = 0; i < sentMessages.length - 1; i++) {
        const current = new Date(sentMessages[i].createdAt).getTime();
        const next = new Date(sentMessages[i + 1].createdAt).getTime();
        expect(current).toBeLessThanOrEqual(next);
      }
    });

    test('should handle message timestamps correctly', async () => {
      const startTime = Date.now();
      
      const { data } = await testApiCall('/messages', {
        method: 'POST',
        body: JSON.stringify({
          conversationId: 'conv-1001-1002',
          senderId: 1001,
          content: 'Teste de timestamp',
          messageType: 'text'
        })
      });
      
      const messageTime = new Date(data.message.createdAt).getTime();
      const endTime = Date.now();
      
      expect(messageTime).toBeGreaterThanOrEqual(startTime);
      expect(messageTime).toBeLessThanOrEqual(endTime);
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty messages array', async () => {
      const { response, data } = await testApiCall('/conversations/conv-empty/messages');
      
      expect(response.status).toBe(200);
      expect(data.messages).toBeInstanceOf(Array);
      expect(data.messages.length).toBe(0);
    });

    test('should handle missing parameters', async () => {
      const { response, data } = await testApiCall('/messages', {
        method: 'POST',
        body: JSON.stringify({
          conversationId: 'conv-1001-1002',
          senderId: 1001
          // Missing content
        })
      });
      
      expect(response.status).toBe(400);
      expect(data.message).toContain('Dados inválidos');
    });

    test('should handle invalid data types', async () => {
      const { response, data } = await testApiCall('/messages', {
        method: 'POST',
        body: JSON.stringify({
          conversationId: 123,
          senderId: 'invalid',
          content: 'Test',
          messageType: 'text'
        })
      });
      
      expect(response.status).toBe(400);
      expect(data.message).toContain('Dados inválidos');
    });
  });
});