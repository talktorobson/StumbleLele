// TypeScript types for StumbleLele Friends Chat System
// Defines all interfaces and types for the chat system
// Author: Agent 4 - Real-time Specialist

// Base User type
export interface User {
  id: number;
  username: string;
  display_name: string | null;
  avatar_emoji: string;
  is_online: boolean;
  last_seen: string | null;
  age?: number | null;
  preferred_ai?: string;
  created_at?: string;
}

// Friend relationship types
export interface Friend {
  id: string;
  user_id: number;
  friend_id: number;
  status: 'pending' | 'accepted' | 'rejected' | 'blocked';
  created_at: string;
  updated_at: string;
}

export interface FriendWithUser extends Friend {
  friend: User;
}

// Friend request types
export interface FriendRequest {
  id: string;
  created_at: string;
  user: User;
}

// Conversation types
export interface Conversation {
  id: string;
  user1_id: number;
  user2_id: number;
  created_at: string;
  last_message_at: string | null;
  is_active: boolean;
}

export interface ConversationWithUsers extends Conversation {
  user1: User;
  user2: User;
  lastMessage?: Message;
}

// Message types
export interface Message {
  id: string;
  conversation_id: string;
  sender_id: number;
  content: string;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  message_type: 'text' | 'emoji' | 'image' | 'audio';
}

export interface MessageWithSender extends Message {
  sender: User;
}

// API Request types
export interface SendFriendRequestRequest {
  userId: number;
  friendUsername: string;
}

export interface AcceptFriendRequestRequest {
  userId: number;
  friendId: number;
}

export interface CreateConversationRequest {
  user1Id: number;
  user2Id: number;
}

export interface SendMessageRequest {
  conversationId: string;
  senderId: number;
  content: string;
  messageType?: 'text' | 'emoji' | 'image' | 'audio';
}

export interface UpdateUserStatusRequest {
  userId: number;
  isOnline: boolean;
}

export interface SearchUsersRequest {
  query: string;
  currentUserId: number;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface FriendsResponse {
  friends: FriendWithUser[];
}

export interface FriendRequestsResponse {
  requests: FriendRequest[];
}

export interface ConversationsResponse {
  conversations: ConversationWithUsers[];
}

export interface MessagesResponse {
  messages: MessageWithSender[];
}

export interface UsersSearchResponse {
  users: User[];
}

// Real-time event types
export interface RealtimeMessageEvent {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  data: Message;
  timestamp: string;
}

export interface RealtimeFriendEvent {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  data: Friend;
  timestamp: string;
}

export interface RealtimeConversationEvent {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  data: Conversation;
  timestamp: string;
}

// Notification types
export interface ChatNotification {
  id: string;
  type: 'message' | 'friend_request' | 'friend_accepted' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  data?: any;
}

// UI State types
export interface ChatState {
  activeConversationId: string | null;
  selectedFriend: User | null;
  isTyping: boolean;
  unreadCounts: Record<string, number>;
  notifications: ChatNotification[];
}

// Hook return types
export interface UseChatReturn {
  messages: MessageWithSender[];
  loading: boolean;
  error: string | null;
  sendMessage: (content: string, messageType?: string) => Promise<void>;
  editMessage: (messageId: string, content: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  isTyping: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  scrollToBottom: () => void;
  retry: () => void;
  clearError: () => void;
}

export interface UseFriendsReturn {
  friends: FriendWithUser[];
  friendRequests: FriendRequest[];
  loading: boolean;
  error: string | null;
  sendFriendRequest: (username: string) => Promise<void>;
  acceptFriendRequest: (friendId: number) => Promise<void>;
  rejectFriendRequest: (friendId: number) => Promise<void>;
  removeFriend: (friendId: number) => Promise<void>;
  searchUsers: (query: string) => Promise<UsersSearchResponse>;
  retry: () => void;
  clearError: () => void;
  refreshFriends: () => void;
  refreshRequests: () => void;
}

export interface UseConversationsReturn {
  conversations: ConversationWithUsers[];
  loading: boolean;
  error: string | null;
  createConversation: (friendId: number) => Promise<ConversationWithUsers>;
  getOrCreateConversation: (friendId: number) => Promise<ConversationWithUsers>;
  refreshConversations: () => void;
  retry: () => void;
  clearError: () => void;
}

// Component prop types
export interface ChatScreenProps {
  conversationId: string;
  friend: User;
  onBack?: () => void;
}

export interface MessageBubbleProps {
  message: MessageWithSender;
  isOwn: boolean;
  onEdit?: (messageId: string, content: string) => void;
  onDelete?: (messageId: string) => void;
}

export interface MessageInputProps {
  onSend: (content: string, messageType?: string) => void;
  placeholder?: string;
  disabled?: boolean;
  maxLength?: number;
}

export interface FriendCardProps {
  friend: FriendWithUser;
  onChat?: (friend: User) => void;
  onRemove?: (friendId: number) => void;
  showOnlineStatus?: boolean;
}

export interface FriendRequestCardProps {
  request: FriendRequest;
  onAccept?: (friendId: number) => void;
  onReject?: (friendId: number) => void;
}

export interface ConversationItemProps {
  conversation: ConversationWithUsers;
  currentUserId: number;
  onClick?: (conversationId: string, friend: User) => void;
  unreadCount?: number;
}

// Utility types
export type OnlineStatus = 'online' | 'offline' | 'away';
export type FriendStatus = 'pending' | 'accepted' | 'rejected' | 'blocked';
export type MessageType = 'text' | 'emoji' | 'image' | 'audio';
export type NotificationType = 'message' | 'friend_request' | 'friend_accepted' | 'system';

// Error types
export interface ChatError {
  code: string;
  message: string;
  details?: any;
}

// Pagination types
export interface PaginationOptions {
  limit?: number;
  offset?: number;
  cursor?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    hasMore: boolean;
    nextCursor?: string;
    total?: number;
  };
}

// Search types
export interface SearchFilters {
  query: string;
  type?: 'username' | 'display_name' | 'all';
  excludeIds?: number[];
  limit?: number;
}

// Export all types
export type * from './chat';