# 🔧 Friends Chat - Technical Implementation Guide

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                       │
├─────────────────────────────────────────────────────────────┤
│  Components  │      Hooks        │     Context/State         │
│  • ChatList  │  • useSupabase    │  • ChatContext           │
│  • ChatView  │  • useRealtime    │  • FriendsContext        │
│  • Messages  │  • useMessages    │  • NotificationContext   │
└──────────────┴───────────────────┴──────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Layer (Vercel)                        │
├─────────────────────────────────────────────────────────────┤
│  • /api/friends/*     │  • /api/messages/*                  │
│  • /api/conversations/*  │  • /api/notifications/*          │
└───────────────────────┴─────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  Supabase Backend                            │
├─────────────────────────────────────────────────────────────┤
│  Database (PostgreSQL) │  Realtime  │  Auth  │  Storage     │
│  • users               │  • Channels │  • RLS │  • Avatars   │
│  • friends             │  • Presence │  • JWT │  • Media     │
│  • conversations       │  • Broadcast│        │              │
│  • messages            │             │        │              │
└────────────────────────┴────────────┴────────┴──────────────┘
```

## 📁 File Structure

```
/client/src/
├── components/
│   ├── friends/
│   │   ├── FriendsList.tsx         # Main friends list
│   │   ├── FriendCard.tsx          # Individual friend item
│   │   ├── AddFriendModal.tsx      # Add friend interface
│   │   └── FriendRequests.tsx      # Pending requests
│   │
│   ├── chat/
│   │   ├── ChatList.tsx            # List of conversations
│   │   ├── ChatView.tsx            # Main chat interface
│   │   ├── MessageBubble.tsx       # Message component
│   │   ├── MessageInput.tsx        # Input with emoji
│   │   ├── TypingIndicator.tsx    # "Julia está digitando..."
│   │   └── OnlineStatus.tsx        # Online/offline badge
│   │
│   └── notifications/
│       ├── NotificationBadge.tsx   # Unread count
│       └── NotificationToast.tsx   # New message alert
│
├── hooks/
│   ├── use-friends.ts              # Friend management
│   ├── use-chat.ts                 # Chat operations
│   ├── use-realtime.ts             # Supabase realtime
│   └── use-presence.ts             # Online status
│
├── lib/
│   ├── supabase-client.ts          # Enhanced client
│   ├── chat-storage.ts             # Local cache
│   └── notification-manager.ts     # Notification logic
│
└── types/
    └── chat.ts                     # TypeScript definitions
```

## 💾 Database Implementation

### 1. Complete Schema with Indexes
```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table enhancement
ALTER TABLE users ADD COLUMN IF NOT EXISTS
  username VARCHAR(50) UNIQUE NOT NULL,
  display_name VARCHAR(100),
  avatar_emoji VARCHAR(10) DEFAULT '😊',
  status_message VARCHAR(200),
  is_online BOOLEAN DEFAULT false,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create username index for fast lookups
CREATE INDEX idx_users_username ON users(username);

-- Friends relationship table
CREATE TABLE IF NOT EXISTS friends (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  friend_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending', -- pending, accepted, blocked
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, friend_id),
  CHECK (user_id != friend_id)
);

-- Composite indexes for bidirectional queries
CREATE INDEX idx_friends_user_status ON friends(user_id, status);
CREATE INDEX idx_friends_friend_status ON friends(friend_id, status);

-- Conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type VARCHAR(20) DEFAULT 'direct', -- direct, group (future)
  name VARCHAR(100), -- For group chats
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_message_id UUID,
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conversation participants
CREATE TABLE IF NOT EXISTS conversation_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  unread_count INTEGER DEFAULT 0,
  is_muted BOOLEAN DEFAULT false,
  UNIQUE(conversation_id, user_id)
);

-- Indexes for participant queries
CREATE INDEX idx_participants_user ON conversation_participants(user_id);
CREATE INDEX idx_participants_conversation ON conversation_participants(conversation_id);

-- Messages table with soft delete
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id INTEGER REFERENCES users(id),
  content TEXT NOT NULL,
  type VARCHAR(20) DEFAULT 'text', -- text, image, audio (future)
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  edited_at TIMESTAMP WITH TIME ZONE,
  deleted_at TIMESTAMP WITH TIME ZONE,
  is_deleted BOOLEAN DEFAULT false
);

-- Indexes for message queries
CREATE INDEX idx_messages_conversation_created ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_messages_sender ON messages(sender_id);

-- Message read receipts
CREATE TABLE IF NOT EXISTS message_reads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(message_id, user_id)
);

-- Typing indicators table (ephemeral)
CREATE TABLE IF NOT EXISTS typing_indicators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(conversation_id, user_id)
);
```

### 2. Row Level Security Policies
```sql
-- Enable RLS
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_reads ENABLE ROW LEVEL SECURITY;

-- Friends policies
CREATE POLICY "Users can view their friends"
  ON friends FOR SELECT
  USING (auth.uid()::INTEGER = user_id OR auth.uid()::INTEGER = friend_id);

CREATE POLICY "Users can send friend requests"
  ON friends FOR INSERT
  WITH CHECK (auth.uid()::INTEGER = user_id);

CREATE POLICY "Users can update their friend requests"
  ON friends FOR UPDATE
  USING (auth.uid()::INTEGER = friend_id AND status = 'pending');

-- Conversation policies
CREATE POLICY "Users can view their conversations"
  ON conversations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants
      WHERE conversation_id = conversations.id
      AND user_id = auth.uid()::INTEGER
    )
  );

-- Message policies
CREATE POLICY "Users can view messages in their conversations"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants
      WHERE conversation_id = messages.conversation_id
      AND user_id = auth.uid()::INTEGER
    )
  );

CREATE POLICY "Users can send messages to their conversations"
  ON messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()::INTEGER AND
    EXISTS (
      SELECT 1 FROM conversation_participants
      WHERE conversation_id = messages.conversation_id
      AND user_id = auth.uid()::INTEGER
    )
  );
```

## 🔌 Supabase Client Setup

### Enhanced Supabase Client
```typescript
// lib/supabase-client.ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Helper for authenticated requests
export const getAuthenticatedUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error('Not authenticated');
  return user;
};
```

## 🪝 React Hooks Implementation

### 1. useFriends Hook
```typescript
// hooks/use-friends.ts
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase-client';
import { useToast } from '@/hooks/use-toast';

export interface Friend {
  id: string;
  userId: number;
  friendId: number;
  status: 'pending' | 'accepted' | 'blocked';
  friend: {
    id: number;
    username: string;
    displayName: string;
    avatarEmoji: string;
    isOnline: boolean;
    lastSeen: string;
  };
}

export function useFriends(userId: number) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!userId) return;

    // Fetch friends list
    const fetchFriends = async () => {
      const { data, error } = await supabase
        .from('friends')
        .select(`
          *,
          friend:friend_id(
            id, username, displayName: display_name, 
            avatarEmoji: avatar_emoji, isOnline: is_online, 
            lastSeen: last_seen
          )
        `)
        .eq('user_id', userId)
        .eq('status', 'accepted');

      if (!error && data) {
        setFriends(data);
      }
      setLoading(false);
    };

    fetchFriends();

    // Subscribe to friend updates
    const subscription = supabase
      .channel(`friends:${userId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'friends',
        filter: `user_id=eq.${userId}`
      }, (payload) => {
        fetchFriends(); // Refetch on changes
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId]);

  const sendFriendRequest = async (username: string) => {
    try {
      // Find user by username
      const { data: targetUser } = await supabase
        .from('users')
        .select('id')
        .eq('username', username)
        .single();

      if (!targetUser) {
        throw new Error('Usuário não encontrado');
      }

      // Check if already friends
      const { data: existing } = await supabase
        .from('friends')
        .select('id')
        .or(`user_id.eq.${userId},friend_id.eq.${userId}`)
        .or(`user_id.eq.${targetUser.id},friend_id.eq.${targetUser.id}`)
        .single();

      if (existing) {
        throw new Error('Vocês já são amigos ou têm um pedido pendente');
      }

      // Send request
      const { error } = await supabase
        .from('friends')
        .insert({
          user_id: userId,
          friend_id: targetUser.id,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Pedido enviado!",
        description: `Pedido de amizade enviado para ${username}`,
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const acceptFriendRequest = async (requestId: string) => {
    const { error } = await supabase
      .from('friends')
      .update({ 
        status: 'accepted',
        accepted_at: new Date().toISOString()
      })
      .eq('id', requestId);

    if (!error) {
      toast({
        title: "Amigo aceito!",
        description: "Agora vocês podem conversar!",
      });
    }
  };

  const removeFriend = async (friendId: string) => {
    const { error } = await supabase
      .from('friends')
      .delete()
      .eq('id', friendId);

    if (!error) {
      // Also delete conversation
      // Implementation needed
    }
  };

  return {
    friends,
    pendingRequests,
    loading,
    sendFriendRequest,
    acceptFriendRequest,
    removeFriend
  };
}
```

### 2. useChat Hook
```typescript
// hooks/use-chat.ts
import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase-client';

export interface Message {
  id: string;
  conversationId: string;
  senderId: number;
  content: string;
  createdAt: string;
  isDeleted: boolean;
  sender: {
    username: string;
    displayName: string;
    avatarEmoji: string;
  };
  isRead: boolean;
}

export function useChat(conversationId: string, userId: number) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!conversationId || !userId) return;

    // Fetch messages
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:sender_id(
            username, 
            displayName: display_name, 
            avatarEmoji: avatar_emoji
          )
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (!error && data) {
        setMessages(data);
        scrollToBottom();
      }
      setLoading(false);
    };

    fetchMessages();

    // Subscribe to new messages
    const messageSubscription = supabase
      .channel(`messages:${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`
      }, (payload) => {
        const newMessage = payload.new as Message;
        setMessages(prev => [...prev, newMessage]);
        scrollToBottom();
        
        // Play notification sound if not sender
        if (newMessage.senderId !== userId) {
          playNotificationSound();
        }
      })
      .subscribe();

    // Subscribe to typing indicators
    const typingChannel = supabase
      .channel(`typing:${conversationId}`)
      .on('presence', { event: 'sync' }, () => {
        const state = typingChannel.presenceState();
        const typingUsers = Object.values(state).filter(
          (user: any) => user[0].userId !== userId
        );
        
        if (typingUsers.length > 0) {
          setIsTyping(true);
          setTypingUser(typingUsers[0][0].username);
        } else {
          setIsTyping(false);
          setTypingUser(null);
        }
      })
      .subscribe();

    return () => {
      messageSubscription.unsubscribe();
      typingChannel.unsubscribe();
    };
  }, [conversationId, userId]);

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    try {
      // Insert message
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: userId,
          content: content.trim()
        })
        .select()
        .single();

      if (error) throw error;

      // Update conversation last activity
      await supabase
        .from('conversations')
        .update({
          last_message_id: data.id,
          last_activity_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', conversationId);

      // Update unread count for other participants
      await supabase
        .from('conversation_participants')
        .update({ unread_count: supabase.sql`unread_count + 1` })
        .eq('conversation_id', conversationId)
        .neq('user_id', userId);

    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const markAsRead = async () => {
    await supabase
      .from('conversation_participants')
      .update({ 
        last_read_at: new Date().toISOString(),
        unread_count: 0
      })
      .eq('conversation_id', conversationId)
      .eq('user_id', userId);
  };

  const deleteMessage = async (messageId: string) => {
    await supabase
      .from('messages')
      .update({ 
        is_deleted: true,
        deleted_at: new Date().toISOString()
      })
      .eq('id', messageId)
      .eq('sender_id', userId);
  };

  const startTyping = async () => {
    const channel = supabase.channel(`typing:${conversationId}`);
    await channel
      .track({ userId, username: 'Helena' })
      .subscribe();
  };

  const stopTyping = async () => {
    const channel = supabase.channel(`typing:${conversationId}`);
    await channel.untrack();
  };

  return {
    messages,
    loading,
    isTyping,
    typingUser,
    sendMessage,
    markAsRead,
    deleteMessage,
    startTyping,
    stopTyping,
    messagesEndRef
  };
}
```

### 3. useRealtime Hook for Presence
```typescript
// hooks/use-presence.ts
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase-client';

export function usePresence(userId: number) {
  const [onlineUsers, setOnlineUsers] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!userId) return;

    const channel = supabase.channel('online_presence');

    // Track user as online
    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const online = new Set<number>();
        
        Object.values(state).forEach((presences: any) => {
          presences.forEach((presence: any) => {
            online.add(presence.userId);
          });
        });
        
        setOnlineUsers(online);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ userId });
        }
      });

    // Update last seen on disconnect
    const updateLastSeen = () => {
      supabase
        .from('users')
        .update({ 
          is_online: false,
          last_seen: new Date().toISOString()
        })
        .eq('id', userId)
        .then(() => channel.untrack());
    };

    // Handle page visibility
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        updateLastSeen();
      } else {
        channel.track({ userId });
      }
    });

    // Handle window close
    window.addEventListener('beforeunload', updateLastSeen);

    return () => {
      updateLastSeen();
      channel.unsubscribe();
      window.removeEventListener('beforeunload', updateLastSeen);
    };
  }, [userId]);

  const isUserOnline = (checkUserId: number) => {
    return onlineUsers.has(checkUserId);
  };

  return { onlineUsers, isUserOnline };
}
```

## 🎨 UI Components

### 1. Chat View Component
```tsx
// components/chat/ChatView.tsx
import { useState, useEffect } from 'react';
import { useChat } from '@/hooks/use-chat';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';

interface ChatViewProps {
  conversationId: string;
  userId: number;
  friendName: string;
  friendEmoji: string;
  isOnline: boolean;
}

export default function ChatView({ 
  conversationId, 
  userId, 
  friendName,
  friendEmoji,
  isOnline 
}: ChatViewProps) {
  const {
    messages,
    loading,
    isTyping,
    typingUser,
    sendMessage,
    markAsRead,
    messagesEndRef
  } = useChat(conversationId, userId);

  useEffect(() => {
    markAsRead();
  }, [messages]);

  if (loading) {
    return <div className="flex-1 flex items-center justify-center">
      <div className="animate-spin">⏳</div>
    </div>;
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-blue-50 to-pink-50">
      {/* Header */}
      <div className="bg-white shadow-sm p-4 flex items-center gap-3">
        <button className="text-2xl">←</button>
        <div className="text-3xl">{friendEmoji}</div>
        <div className="flex-1">
          <h2 className="font-bold text-lg">{friendName}</h2>
          <p className="text-sm text-gray-500">
            {isOnline ? '🟢 Online' : '⚪ Offline'}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            isOwn={message.senderId === userId}
          />
        ))}
        
        {isTyping && <TypingIndicator name={typingUser || friendName} />}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <MessageInput onSend={sendMessage} />
    </div>
  );
}
```

### 2. Message Bubble Component
```tsx
// components/chat/MessageBubble.tsx
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MessageBubbleProps {
  message: {
    id: string;
    content: string;
    createdAt: string;
    isRead: boolean;
    sender: {
      avatarEmoji: string;
    };
  };
  isOwn: boolean;
}

export default function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  return (
    <div className={`flex gap-2 ${isOwn ? 'justify-end' : 'justify-start'}`}>
      {!isOwn && (
        <div className="text-2xl flex-shrink-0">{message.sender.avatarEmoji}</div>
      )}
      
      <div className={`
        max-w-[70%] rounded-2xl px-4 py-2 shadow-sm
        ${isOwn 
          ? 'bg-blue-500 text-white rounded-br-none' 
          : 'bg-white text-gray-800 rounded-bl-none'
        }
      `}>
        <p className="text-base">{message.content}</p>
        <div className={`text-xs mt-1 flex items-center gap-1 
          ${isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
          <span>
            {format(new Date(message.createdAt), 'HH:mm', { locale: ptBR })}
          </span>
          {isOwn && (
            <span>{message.isRead ? '✓✓' : '✓'}</span>
          )}
        </div>
      </div>
    </div>
  );
}
```

### 3. Notification System
```typescript
// lib/notification-manager.ts
class NotificationManager {
  private permission: NotificationPermission = 'default';
  private audio: HTMLAudioElement;

  constructor() {
    this.audio = new Audio('/notification.mp3');
    this.audio.volume = 0.5;
    this.requestPermission();
  }

  async requestPermission() {
    if ('Notification' in window) {
      this.permission = await Notification.requestPermission();
    }
  }

  async showNotification(title: string, body: string, icon?: string) {
    // In-app toast
    this.showToast(title, body);

    // Native notification if permitted
    if (this.permission === 'granted' && document.hidden) {
      new Notification(title, {
        body,
        icon: icon || '/lele-icon.png',
        badge: '/badge.png',
        tag: 'stumblelele-chat'
      });
    }

    // Play sound
    this.playSound();
  }

  playSound() {
    this.audio.play().catch(() => {
      // Handle autoplay restrictions
    });
  }

  showToast(title: string, body: string) {
    // Implementation using your toast component
  }
}

export const notificationManager = new NotificationManager();
```

## 🔒 Safety Features

### 1. Content Moderation
```typescript
// lib/content-filter.ts
const bannedWords = [
  // Add child-inappropriate words
];

export function filterMessage(content: string): {
  isClean: boolean;
  filtered: string;
} {
  let filtered = content;
  let isClean = true;

  bannedWords.forEach(word => {
    const regex = new RegExp(word, 'gi');
    if (regex.test(content)) {
      isClean = false;
      filtered = filtered.replace(regex, '***');
    }
  });

  return { isClean, filtered };
}
```

### 2. Parent Dashboard (Optional)
```tsx
// components/parent/ParentDashboard.tsx
// - View child's friends list
// - Review chat history
// - Block/unblock friends
// - Set chat time limits
// - Content filtering settings
```

## 🚀 Deployment Considerations

### 1. Environment Variables
```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
```

### 2. Performance Optimizations
- Message pagination (load 50 at a time)
- Virtual scrolling for long chats
- Debounced typing indicators
- Optimistic UI updates
- Local message caching

### 3. Error Handling
- Offline queue for messages
- Retry failed sends
- Connection status indicator
- Graceful degradation

## 📱 Mobile Considerations
- Touch-friendly message selection
- Swipe to reply (future)
- Pull to refresh
- Keyboard-aware scroll
- App-like navigation

---

**This technical guide provides the foundation for implementing a production-ready chat system tailored for children.**