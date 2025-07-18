/**
 * End-to-End User Workflow Tests
 * Agent 5 - Integration & Testing Specialist
 * 
 * Tests complete user workflows from start to finish
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

describe('End-to-End User Workflows', () => {
  const performance = new PerformanceTracker();
  
  beforeEach(async () => {
    await setupTestDatabase();
  });
  
  afterEach(async () => {
    await cleanupTestDatabase();
  });

  describe('Complete Friend Management Workflow', () => {
    test('should complete full friend request workflow', async () => {
      // Step 1: User searches for a friend
      const { response: searchResponse, data: searchData } = await testApiCall('/users/search?q=miguel&currentUserId=1001');
      
      expect(searchResponse.status).toBe(200);
      expect(searchData.users.length).toBeGreaterThan(0);
      
      const targetUser = searchData.users.find((u: any) => u.username === 'miguel_test');
      expect(targetUser).toBeDefined();
      
      // Step 2: User sends friend request
      const { response: requestResponse, data: requestData } = await testApiCall('/friends', {
        method: 'POST',
        body: JSON.stringify({
          userId: 1001,
          friendUsername: 'miguel_test'
        })
      });
      
      expect(requestResponse.status).toBe(200);
      expect(requestData.success).toBe(true);
      expect(requestData.message).toContain('enviado');
      
      // Step 3: Target user checks pending requests
      const { response: pendingResponse, data: pendingData } = await testApiCall('/friends/requests?userId=1005');
      
      expect(pendingResponse.status).toBe(200);
      expect(pendingData.requests.length).toBeGreaterThan(0);
      
      const friendRequest = pendingData.requests.find((r: any) => r.user.id === 1001);
      expect(friendRequest).toBeDefined();
      
      // Step 4: Target user accepts friend request
      const { response: acceptResponse, data: acceptData } = await testApiCall('/friends/accept', {
        method: 'POST',
        body: JSON.stringify({
          userId: 1005,
          friendId: 1001
        })
      });
      
      expect(acceptResponse.status).toBe(200);
      expect(acceptData.success).toBe(true);
      expect(acceptData.message).toContain('aceito');
      
      // Step 5: Both users should see each other as friends
      const { response: helena, data: helenaData } = await testApiCall('/friends?userId=1001');
      const { response: miguel, data: miguelData } = await testApiCall('/friends?userId=1005');
      
      expect(helena.status).toBe(200);
      expect(miguel.status).toBe(200);
      
      const helenaFriend = helenaData.friends.find((f: any) => f.friend.id === 1005);
      const miguelFriend = miguelData.friends.find((f: any) => f.friend.id === 1001);
      
      expect(helenaFriend).toBeDefined();
      expect(miguelFriend).toBeDefined();
      expect(helenaFriend.status).toBe('accepted');
      expect(miguelFriend.status).toBe('accepted');
    });

    test('should handle friend request rejection workflow', async () => {
      // Step 1: Send friend request
      await testApiCall('/friends', {
        method: 'POST',
        body: JSON.stringify({
          userId: 1001,
          friendUsername: 'miguel_test'
        })
      });
      
      // Step 2: Reject friend request
      const { response: rejectResponse, data: rejectData } = await testApiCall('/friends/reject', {
        method: 'POST',
        body: JSON.stringify({
          userId: 1005,
          friendId: 1001
        })
      });
      
      expect(rejectResponse.status).toBe(200);
      expect(rejectData.success).toBe(true);
      expect(rejectData.message).toContain('rejeitado');
      
      // Step 3: Users should not be friends
      const { response: helena, data: helenaData } = await testApiCall('/friends?userId=1001');
      const { response: miguel, data: miguelData } = await testApiCall('/friends?userId=1005');
      
      expect(helena.status).toBe(200);
      expect(miguel.status).toBe(200);
      
      const helenaFriend = helenaData.friends.find((f: any) => f.friend.id === 1005);
      const miguelFriend = miguelData.friends.find((f: any) => f.friend.id === 1001);
      
      expect(helenaFriend).toBeUndefined();
      expect(miguelFriend).toBeUndefined();
    });

    test('should handle friend removal workflow', async () => {
      // Step 1: Remove existing friend
      const { response: removeResponse, data: removeData } = await testApiCall('/friends/1002?userId=1001', {
        method: 'DELETE'
      });
      
      expect(removeResponse.status).toBe(200);
      expect(removeData.success).toBe(true);
      expect(removeData.message).toContain('removido');
      
      // Step 2: Both users should no longer be friends
      const { response: helena, data: helenaData } = await testApiCall('/friends?userId=1001');
      const { response: julia, data: juliaData } = await testApiCall('/friends?userId=1002');
      
      expect(helena.status).toBe(200);
      expect(julia.status).toBe(200);
      
      const helenaFriend = helenaData.friends.find((f: any) => f.friend.id === 1002);
      const juliaFriend = juliaData.friends.find((f: any) => f.friend.id === 1001);
      
      expect(helenaFriend).toBeUndefined();
      expect(juliaFriend).toBeUndefined();
    });
  });

  describe('Complete Chat Workflow', () => {
    test('should complete full chat conversation workflow', async () => {
      // Step 1: User creates or gets conversation
      const { response: convResponse, data: convData } = await testApiCall('/conversations', {
        method: 'POST',
        body: JSON.stringify({
          user1Id: 1001,
          user2Id: 1002
        })
      });
      
      expect(convResponse.status).toBe(200);
      expect(convData.success).toBe(true);
      expect(convData.conversation).toBeDefined();
      
      const conversationId = convData.conversation.id;
      
      // Step 2: User sends first message
      const { response: msg1Response, data: msg1Data } = await testApiCall('/messages', {
        method: 'POST',
        body: JSON.stringify({
          conversationId,
          senderId: 1001,
          content: 'Oi! Como você está?',
          messageType: 'text'
        })
      });
      
      expect(msg1Response.status).toBe(200);
      expect(msg1Data.success).toBe(true);
      expect(msg1Data.message.content).toBe('Oi! Como você está?');
      
      // Step 3: Second user replies
      const { response: msg2Response, data: msg2Data } = await testApiCall('/messages', {
        method: 'POST',
        body: JSON.stringify({
          conversationId,
          senderId: 1002,
          content: 'Oi! Estou bem, obrigada! E você?',
          messageType: 'text'
        })
      });
      
      expect(msg2Response.status).toBe(200);
      expect(msg2Data.success).toBe(true);
      expect(msg2Data.message.content).toBe('Oi! Estou bem, obrigada! E você?');
      
      // Step 4: First user sends another message
      const { response: msg3Response, data: msg3Data } = await testApiCall('/messages', {
        method: 'POST',
        body: JSON.stringify({
          conversationId,
          senderId: 1001,
          content: 'Também estou bem! Vamos jogar?',
          messageType: 'text'
        })
      });
      
      expect(msg3Response.status).toBe(200);
      expect(msg3Data.success).toBe(true);
      
      // Step 5: Both users should see the conversation in their list
      const { response: helena, data: helenaData } = await testApiCall('/conversations?userId=1001');
      const { response: julia, data: juliaData } = await testApiCall('/conversations?userId=1002');
      
      expect(helena.status).toBe(200);
      expect(julia.status).toBe(200);
      
      const helenaConv = helenaData.conversations.find((c: any) => c.id === conversationId);
      const juliaConv = juliaData.conversations.find((c: any) => c.id === conversationId);
      
      expect(helenaConv).toBeDefined();
      expect(juliaConv).toBeDefined();
      
      // Step 6: Both users should see all messages
      const { response: messages, data: messagesData } = await testApiCall(`/conversations/${conversationId}/messages`);
      
      expect(messages.status).toBe(200);
      expect(messagesData.messages.length).toBe(3);
      
      // Messages should be in chronological order
      expect(messagesData.messages[0].content).toBe('Oi! Como você está?');
      expect(messagesData.messages[1].content).toBe('Oi! Estou bem, obrigada! E você?');
      expect(messagesData.messages[2].content).toBe('Também estou bem! Vamos jogar?');
    });

    test('should handle message editing workflow', async () => {
      // Step 1: Send initial message
      const { response: sendResponse, data: sendData } = await testApiCall('/messages', {
        method: 'POST',
        body: JSON.stringify({
          conversationId: 'conv-1001-1002',
          senderId: 1001,
          content: 'Mensagem original',
          messageType: 'text'
        })
      });
      
      expect(sendResponse.status).toBe(200);
      const messageId = sendData.message.id;
      
      // Step 2: Edit the message
      const { response: editResponse, data: editData } = await testApiCall(`/messages/${messageId}`, {
        method: 'PUT',
        body: JSON.stringify({
          content: 'Mensagem editada',
          userId: 1001
        })
      });
      
      expect(editResponse.status).toBe(200);
      expect(editData.success).toBe(true);
      expect(editData.message.content).toBe('Mensagem editada');
      
      // Step 3: Verify edited message appears in conversation
      const { response: messages, data: messagesData } = await testApiCall('/conversations/conv-1001-1002/messages');
      
      expect(messages.status).toBe(200);
      
      const editedMessage = messagesData.messages.find((m: any) => m.id === messageId);
      expect(editedMessage).toBeDefined();
      expect(editedMessage.content).toBe('Mensagem editada');
    });

    test('should handle message deletion workflow', async () => {
      // Step 1: Send message to delete
      const { response: sendResponse, data: sendData } = await testApiCall('/messages', {
        method: 'POST',
        body: JSON.stringify({
          conversationId: 'conv-1001-1002',
          senderId: 1001,
          content: 'Mensagem para deletar',
          messageType: 'text'
        })
      });
      
      expect(sendResponse.status).toBe(200);
      const messageId = sendData.message.id;
      
      // Step 2: Delete the message
      const { response: deleteResponse, data: deleteData } = await testApiCall(`/messages/${messageId}`, {
        method: 'DELETE',
        body: JSON.stringify({
          userId: 1001
        })
      });
      
      expect(deleteResponse.status).toBe(200);
      expect(deleteData.success).toBe(true);
      
      // Step 3: Verify message is no longer in conversation
      const { response: messages, data: messagesData } = await testApiCall('/conversations/conv-1001-1002/messages');
      
      expect(messages.status).toBe(200);
      
      const deletedMessage = messagesData.messages.find((m: any) => m.id === messageId);
      expect(deletedMessage).toBeUndefined();
    });
  });

  describe('Combined Friend and Chat Workflow', () => {
    test('should complete friend-to-chat workflow', async () => {
      // Step 1: Add friend (Miguel)
      await testApiCall('/friends', {
        method: 'POST',
        body: JSON.stringify({
          userId: 1001,
          friendUsername: 'miguel_test'
        })
      });
      
      // Step 2: Accept friend request
      await testApiCall('/friends/accept', {
        method: 'POST',
        body: JSON.stringify({
          userId: 1005,
          friendId: 1001
        })
      });
      
      // Step 3: Start conversation with new friend
      const { response: convResponse, data: convData } = await testApiCall('/conversations', {
        method: 'POST',
        body: JSON.stringify({
          user1Id: 1001,
          user2Id: 1005
        })
      });
      
      expect(convResponse.status).toBe(200);
      expect(convData.success).toBe(true);
      
      const conversationId = convData.conversation.id;
      
      // Step 4: Send first message
      const { response: msgResponse, data: msgData } = await testApiCall('/messages', {
        method: 'POST',
        body: JSON.stringify({
          conversationId,
          senderId: 1001,
          content: 'Oi Miguel! Agora somos amigos!',
          messageType: 'text'
        })
      });
      
      expect(msgResponse.status).toBe(200);
      expect(msgData.success).toBe(true);
      
      // Step 5: Friend replies
      const { response: replyResponse, data: replyData } = await testApiCall('/messages', {
        method: 'POST',
        body: JSON.stringify({
          conversationId,
          senderId: 1005,
          content: 'Oi Helena! Sim, que legal!',
          messageType: 'text'
        })
      });
      
      expect(replyResponse.status).toBe(200);
      expect(replyData.success).toBe(true);
      
      // Step 6: Both users should see the conversation
      const { response: helena, data: helenaData } = await testApiCall('/conversations?userId=1001');
      const { response: miguel, data: miguelData } = await testApiCall('/conversations?userId=1005');
      
      expect(helena.status).toBe(200);
      expect(miguel.status).toBe(200);
      
      const helenaConv = helenaData.conversations.find((c: any) => c.id === conversationId);
      const miguelConv = miguelData.conversations.find((c: any) => c.id === conversationId);
      
      expect(helenaConv).toBeDefined();
      expect(miguelConv).toBeDefined();
      
      // Step 7: Verify conversation has latest message timestamp
      expect(helenaConv.lastMessageAt).toBeDefined();
      expect(miguelConv.lastMessageAt).toBeDefined();
    });
  });

  describe('Error Recovery Workflows', () => {
    test('should handle friend request to non-existent user', async () => {
      // Step 1: Try to send friend request to non-existent user
      const { response: errorResponse, data: errorData } = await testApiCall('/friends', {
        method: 'POST',
        body: JSON.stringify({
          userId: 1001,
          friendUsername: 'nonexistent_user'
        })
      });
      
      expect(errorResponse.status).toBe(400);
      expect(errorData.message).toContain('User not found');
      
      // Step 2: User should still be able to send valid friend requests
      const { response: validResponse, data: validData } = await testApiCall('/friends', {
        method: 'POST',
        body: JSON.stringify({
          userId: 1001,
          friendUsername: 'miguel_test'
        })
      });
      
      expect(validResponse.status).toBe(200);
      expect(validData.success).toBe(true);
    });

    test('should handle message to non-existent conversation', async () => {
      // Step 1: Try to send message to non-existent conversation
      const { response: errorResponse, data: errorData } = await testApiCall('/messages', {
        method: 'POST',
        body: JSON.stringify({
          conversationId: 'non-existent-conv',
          senderId: 1001,
          content: 'This should fail'
        })
      });
      
      expect(errorResponse.status).toBe(400);
      expect(errorData.message).toContain('Dados inválidos');
      
      // Step 2: User should still be able to send valid messages
      const { response: validResponse, data: validData } = await testApiCall('/messages', {
        method: 'POST',
        body: JSON.stringify({
          conversationId: 'conv-1001-1002',
          senderId: 1001,
          content: 'This should work'
        })
      });
      
      expect(validResponse.status).toBe(200);
      expect(validData.success).toBe(true);
    });
  });

  describe('Multi-User Concurrent Workflows', () => {
    test('should handle multiple users interacting simultaneously', async () => {
      // Step 1: Multiple users send messages to same conversation
      const messages = [
        {
          conversationId: 'conv-1001-1002',
          senderId: 1001,
          content: 'Mensagem de Helena'
        },
        {
          conversationId: 'conv-1001-1002',
          senderId: 1002,
          content: 'Mensagem de Julia'
        },
        {
          conversationId: 'conv-1001-1002',
          senderId: 1001,
          content: 'Segunda mensagem de Helena'
        }
      ];
      
      const results = await Promise.all(
        messages.map(msg => 
          testApiCall('/messages', {
            method: 'POST',
            body: JSON.stringify(msg)
          })
        )
      );
      
      // All messages should be sent successfully
      results.forEach(({ response }) => {
        expect(response.status).toBe(200);
      });
      
      // Step 2: Verify all messages appear in conversation
      const { response: convResponse, data: convData } = await testApiCall('/conversations/conv-1001-1002/messages');
      
      expect(convResponse.status).toBe(200);
      expect(convData.messages.length).toBeGreaterThanOrEqual(3);
    });

    test('should handle concurrent friend requests', async () => {
      // Step 1: Multiple users send friend requests
      const requests = [
        {
          userId: 1001,
          friendUsername: 'miguel_test'
        },
        {
          userId: 1002,
          friendUsername: 'sofia_test'
        },
        {
          userId: 1003,
          friendUsername: 'miguel_test'
        }
      ];
      
      const results = await Promise.all(
        requests.map(req => 
          testApiCall('/friends', {
            method: 'POST',
            body: JSON.stringify(req)
          })
        )
      );
      
      // All valid requests should succeed
      results.forEach(({ response }) => {
        expect(response.status).toBeLessThan(500);
      });
    });
  });

  describe('Performance Workflow Tests', () => {
    test('should complete typical user session within performance targets', async () => {
      const sessionDuration = await performance.measureAsync('userSession', async () => {
        // Typical user session: check friends, read messages, send message
        await testApiCall('/friends?userId=1001');
        await testApiCall('/conversations?userId=1001');
        await testApiCall('/conversations/conv-1001-1002/messages');
        await testApiCall('/messages', {
          method: 'POST',
          body: JSON.stringify({
            conversationId: 'conv-1001-1002',
            senderId: 1001,
            content: 'Session test message'
          })
        });
      });
      
      expect(sessionDuration).toBeLessThan(2000); // 2 seconds for typical session
    });

    test('should handle rapid user interactions', async () => {
      const rapidActions = await performance.measureAsync('rapidActions', async () => {
        // Rapid sequence of actions
        const actions = [
          testApiCall('/friends?userId=1001'),
          testApiCall('/messages', {
            method: 'POST',
            body: JSON.stringify({
              conversationId: 'conv-1001-1002',
              senderId: 1001,
              content: 'Quick message 1'
            })
          }),
          testApiCall('/conversations?userId=1001'),
          testApiCall('/messages', {
            method: 'POST',
            body: JSON.stringify({
              conversationId: 'conv-1001-1002',
              senderId: 1001,
              content: 'Quick message 2'
            })
          })
        ];
        
        await Promise.all(actions);
      });
      
      expect(rapidActions).toBeLessThan(1500); // 1.5 seconds for rapid actions
    });
  });
});