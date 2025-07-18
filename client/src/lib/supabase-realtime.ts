// Supabase Realtime Manager for Friends Chat System
// Handles real-time subscriptions for messages and friend requests
// Author: Agent 4 - Real-time Specialist

import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { supabase, Database } from './supabase-client';

// Type definitions for realtime events
type MessagePayload = RealtimePostgresChangesPayload<Database['public']['Tables']['messages']['Row']>;
type FriendPayload = RealtimePostgresChangesPayload<Database['public']['Tables']['friends']['Row']>;
type ConversationPayload = RealtimePostgresChangesPayload<Database['public']['Tables']['conversations']['Row']>;

// Message event handler types
type MessageEventHandler = (message: Database['public']['Tables']['messages']['Row']) => void;
type FriendEventHandler = (friend: Database['public']['Tables']['friends']['Row']) => void;
type ConversationEventHandler = (conversation: Database['public']['Tables']['conversations']['Row']) => void;

// Real-time manager class
export class ChatRealtimeManager {
  private subscriptions: Map<string, RealtimeChannel> = new Map();
  private messageHandlers: Map<string, MessageEventHandler[]> = new Map();
  private friendHandlers: Map<string, FriendEventHandler[]> = new Map();
  private conversationHandlers: Map<string, ConversationEventHandler[]> = new Map();

  // Subscribe to messages in a specific conversation
  subscribeToConversation(
    conversationId: string, 
    onNewMessage: MessageEventHandler,
    onMessageUpdate?: MessageEventHandler,
    onMessageDelete?: MessageEventHandler
  ): RealtimeChannel {
    const channelName = `conversation:${conversationId}`;
    
    // Remove existing subscription if it exists
    this.unsubscribe(channelName);

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload: MessagePayload) => {
          console.log('New message received:', payload.new);
          onNewMessage(payload.new);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload: MessagePayload) => {
          console.log('Message updated:', payload.new);
          if (onMessageUpdate) {
            onMessageUpdate(payload.new);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload: MessagePayload) => {
          console.log('Message deleted:', payload.old);
          if (onMessageDelete && payload.old) {
            onMessageDelete(payload.old);
          }
        }
      )
      .subscribe((status) => {
        console.log(`Conversation ${conversationId} subscription status:`, status);
      });

    this.subscriptions.set(channelName, channel);
    return channel;
  }

  // Subscribe to friend requests for a user
  subscribeToFriendRequests(
    userId: number, 
    onFriendRequest: FriendEventHandler,
    onFriendUpdate?: FriendEventHandler
  ): RealtimeChannel {
    const channelName = `friend_requests:${userId}`;
    
    // Remove existing subscription if it exists
    this.unsubscribe(channelName);

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'friends',
          filter: `friend_id=eq.${userId}`,
        },
        (payload: FriendPayload) => {
          console.log('New friend request received:', payload.new);
          onFriendRequest(payload.new);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'friends',
          filter: `friend_id=eq.${userId}`,
        },
        (payload: FriendPayload) => {
          console.log('Friend request updated:', payload.new);
          if (onFriendUpdate) {
            onFriendUpdate(payload.new);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'friends',
          filter: `user_id=eq.${userId}`,
        },
        (payload: FriendPayload) => {
          console.log('Friend status updated:', payload.new);
          if (onFriendUpdate) {
            onFriendUpdate(payload.new);
          }
        }
      )
      .subscribe((status) => {
        console.log(`Friend requests ${userId} subscription status:`, status);
      });

    this.subscriptions.set(channelName, channel);
    return channel;
  }

  // Subscribe to user's conversations for new conversation notifications
  subscribeToConversations(
    userId: number,
    onNewConversation: ConversationEventHandler,
    onConversationUpdate?: ConversationEventHandler
  ): RealtimeChannel {
    const channelName = `user_conversations:${userId}`;
    
    // Remove existing subscription if it exists
    this.unsubscribe(channelName);

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'conversations',
          filter: `user1_id=eq.${userId}`,
        },
        (payload: ConversationPayload) => {
          console.log('New conversation (user1):', payload.new);
          onNewConversation(payload.new);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'conversations',
          filter: `user2_id=eq.${userId}`,
        },
        (payload: ConversationPayload) => {
          console.log('New conversation (user2):', payload.new);
          onNewConversation(payload.new);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'conversations',
          filter: `user1_id=eq.${userId}`,
        },
        (payload: ConversationPayload) => {
          console.log('Conversation updated (user1):', payload.new);
          if (onConversationUpdate) {
            onConversationUpdate(payload.new);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'conversations',
          filter: `user2_id=eq.${userId}`,
        },
        (payload: ConversationPayload) => {
          console.log('Conversation updated (user2):', payload.new);
          if (onConversationUpdate) {
            onConversationUpdate(payload.new);
          }
        }
      )
      .subscribe((status) => {
        console.log(`User conversations ${userId} subscription status:`, status);
      });

    this.subscriptions.set(channelName, channel);
    return channel;
  }

  // Subscribe to user presence/online status
  subscribeToUserPresence(
    userId: number,
    onUserStatusChange: (user: Database['public']['Tables']['users']['Row']) => void
  ): RealtimeChannel {
    const channelName = `user_presence:${userId}`;
    
    // Remove existing subscription if it exists
    this.unsubscribe(channelName);

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${userId}`,
        },
        (payload: RealtimePostgresChangesPayload<Database['public']['Tables']['users']['Row']>) => {
          console.log('User status updated:', payload.new);
          onUserStatusChange(payload.new);
        }
      )
      .subscribe((status) => {
        console.log(`User presence ${userId} subscription status:`, status);
      });

    this.subscriptions.set(channelName, channel);
    return channel;
  }

  // Subscribe to multiple conversations at once
  subscribeToMultipleConversations(
    conversationIds: string[],
    onNewMessage: MessageEventHandler,
    onMessageUpdate?: MessageEventHandler,
    onMessageDelete?: MessageEventHandler
  ): RealtimeChannel[] {
    const channels: RealtimeChannel[] = [];
    
    conversationIds.forEach(conversationId => {
      const channel = this.subscribeToConversation(
        conversationId,
        onNewMessage,
        onMessageUpdate,
        onMessageDelete
      );
      channels.push(channel);
    });

    return channels;
  }

  // Unsubscribe from a specific channel
  unsubscribe(channelName: string): void {
    const subscription = this.subscriptions.get(channelName);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(channelName);
      console.log(`Unsubscribed from ${channelName}`);
    }
  }

  // Unsubscribe from all channels
  unsubscribeAll(): void {
    this.subscriptions.forEach((subscription, channelName) => {
      subscription.unsubscribe();
      console.log(`Unsubscribed from ${channelName}`);
    });
    this.subscriptions.clear();
  }

  // Get active subscription count
  getActiveSubscriptionCount(): number {
    return this.subscriptions.size;
  }

  // Get list of active subscriptions
  getActiveSubscriptions(): string[] {
    return Array.from(this.subscriptions.keys());
  }

  // Check if a specific channel is subscribed
  isSubscribed(channelName: string): boolean {
    return this.subscriptions.has(channelName);
  }

  // Get subscription status
  getSubscriptionStatus(channelName: string): string | null {
    const subscription = this.subscriptions.get(channelName);
    return subscription ? subscription.state : null;
  }

  // Cleanup method for component unmount
  cleanup(): void {
    this.unsubscribeAll();
    this.messageHandlers.clear();
    this.friendHandlers.clear();
    this.conversationHandlers.clear();
  }
}

// Create a singleton instance
export const realtimeManager = new ChatRealtimeManager();

// Export for convenience
export default realtimeManager;