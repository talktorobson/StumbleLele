// API client functions for Friends Chat System
// Based on Agent 2's API documentation and endpoints

import { apiRequest } from './queryClient';
import type {
  FriendsResponse,
  FriendRequestsResponse,
  ConversationsResponse,
  MessagesResponse,
  UsersSearchResponse,
  SendFriendRequestRequest,
  AcceptFriendRequestRequest,
  CreateConversationRequest,
  SendMessageRequest,
  UpdateUserStatusRequest,
  ApiResponse,
  FriendWithUser,
  MessageWithSender,
  ConversationWithUsers
} from '../types/chat';

// Friend Management API Functions
export async function getFriends(userId: number): Promise<FriendWithUser[]> {
  const response = await apiRequest('GET', `/api/friends?userId=${userId}`);
  const data: FriendsResponse = await response.json();
  return data.friends;
}

export async function sendFriendRequest(request: SendFriendRequestRequest): Promise<void> {
  await apiRequest('POST', '/api/friends', request);
}

export async function getFriendRequests(userId: number): Promise<FriendRequestsResponse> {
  const response = await apiRequest('GET', `/api/friends/requests?userId=${userId}`);
  return await response.json();
}

export async function acceptFriendRequest(request: AcceptFriendRequestRequest): Promise<void> {
  await apiRequest('POST', '/api/friends/accept', request);
}

export async function rejectFriendRequest(request: AcceptFriendRequestRequest): Promise<void> {
  await apiRequest('POST', '/api/friends/reject', request);
}

export async function removeFriend(userId: number, friendId: number): Promise<void> {
  await apiRequest('DELETE', `/api/friends/${friendId}?userId=${userId}`);
}

// Chat & Conversation API Functions
export async function getConversations(userId: number): Promise<ConversationWithUsers[]> {
  const response = await apiRequest('GET', `/api/conversations?userId=${userId}`);
  const data: ConversationsResponse = await response.json();
  return data.conversations;
}

export async function createConversation(request: CreateConversationRequest): Promise<ConversationWithUsers> {
  const response = await apiRequest('POST', '/api/conversations', request);
  const data = await response.json();
  return data.conversation;
}

export async function getConversationMessages(conversationId: string): Promise<MessageWithSender[]> {
  const response = await apiRequest('GET', `/api/conversations/${conversationId}/messages`);
  const data: MessagesResponse = await response.json();
  return data.messages;
}

export async function sendMessage(request: SendMessageRequest): Promise<MessageWithSender> {
  const response = await apiRequest('POST', '/api/messages', request);
  const data = await response.json();
  return data.message;
}

export async function editMessage(messageId: string, content: string, userId: number): Promise<void> {
  await apiRequest('PUT', `/api/messages/${messageId}`, { content, userId });
}

export async function deleteMessage(messageId: string, userId: number): Promise<void> {
  await apiRequest('DELETE', `/api/messages/${messageId}`, { userId });
}

// User Management API Functions
export async function searchUsers(query: string, currentUserId: number): Promise<UsersSearchResponse> {
  const response = await apiRequest('GET', `/api/users/search?q=${encodeURIComponent(query)}&currentUserId=${currentUserId}`);
  return await response.json();
}

export async function updateUserStatus(request: UpdateUserStatusRequest): Promise<void> {
  await apiRequest('PUT', `/api/users/${request.userId}/status`, { isOnline: request.isOnline });
}

// Helper function to handle API errors
export function handleApiError(error: any): string {
  if (error.errors) {
    // Zod validation errors
    const errorMessages = error.errors.map((e: any) => e.message).join(', ');
    return `Erro de validação: ${errorMessages}`;
  } else if (error.message) {
    // General API errors
    return error.message;
  } else {
    return 'Erro desconhecido';
  }
}

// Get friend from user ID in friend list
export function getFriendFromList(friends: FriendWithUser[], friendId: number): FriendWithUser | undefined {
  return friends.find(f => f.friend.id === friendId);
}

// Get other user in conversation
export function getOtherUserInConversation(conversation: ConversationWithUsers, currentUserId: number) {
  return conversation.user1Id === currentUserId ? conversation.user2 : conversation.user1;
}

// Format time for messages
export function formatMessageTime(timestamp: string): string {
  const date = new Date(timestamp);
  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

// Format date for conversations
export function formatConversationDate(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  } else if (diffDays === 1) {
    return 'Ontem';
  } else if (diffDays < 7) {
    return new Intl.DateTimeFormat('pt-BR', {
      weekday: 'short'
    }).format(date);
  } else {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit'
    }).format(date);
  }
}

// Get online status text
export function getOnlineStatusText(isOnline: boolean): string {
  return isOnline ? 'Online' : 'Offline';
}

// Get online status color
export function getOnlineStatusColor(isOnline: boolean): string {
  return isOnline ? 'text-green-500' : 'text-gray-400';
}

// Get online status emoji
export function getOnlineStatusEmoji(isOnline: boolean): string {
  return isOnline ? '🟢' : '⚪';
}