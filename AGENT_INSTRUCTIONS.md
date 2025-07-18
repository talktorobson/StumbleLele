# 🤖 Agent Instructions for Friends Chat System

## 📋 Individual Agent Briefs

### **Agent 1: Database Architect** 🗄️
```yaml
Agent_ID: "DB_ARCHITECT"
Start_Date: "Day 1"
Duration: "3 days"
Priority: "Critical Path"
```

#### **Your Mission**
You are the Database Architect responsible for creating the complete database foundation for the friends chat system. Your work enables all other agents to succeed.

#### **Detailed Tasks**
```sql
-- Day 1: Core Tables
1. Enhance users table:
   ALTER TABLE users ADD COLUMN username VARCHAR(50) UNIQUE NOT NULL;
   ALTER TABLE users ADD COLUMN display_name VARCHAR(100);
   ALTER TABLE users ADD COLUMN avatar_emoji VARCHAR(10) DEFAULT '😊';
   ALTER TABLE users ADD COLUMN is_online BOOLEAN DEFAULT false;
   ALTER TABLE users ADD COLUMN last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW();

2. Create friends table:
   CREATE TABLE friends (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
     friend_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
     status VARCHAR(20) DEFAULT 'pending',
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     UNIQUE(user_id, friend_id),
     CHECK (user_id != friend_id)
   );

3. Create conversations table:
   CREATE TABLE conversations (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     user1_id INTEGER REFERENCES users(id),
     user2_id INTEGER REFERENCES users(id),
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     last_message_at TIMESTAMP WITH TIME ZONE,
     UNIQUE(user1_id, user2_id)
   );

4. Create messages table:
   CREATE TABLE messages (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
     sender_id INTEGER REFERENCES users(id),
     content TEXT NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     is_deleted BOOLEAN DEFAULT false
   );
```

#### **Day 2: Indexes and Optimization**
```sql
-- Performance indexes
CREATE INDEX idx_friends_user_id ON friends(user_id);
CREATE INDEX idx_friends_friend_id ON friends(friend_id);
CREATE INDEX idx_friends_status ON friends(status);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_conversations_users ON conversations(user1_id, user2_id);
```

#### **Day 3: Security Policies**
```sql
-- Row Level Security
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Friends policies
CREATE POLICY "Users can view their friends" ON friends
  FOR SELECT USING (auth.uid()::INTEGER = user_id OR auth.uid()::INTEGER = friend_id);

CREATE POLICY "Users can add friends" ON friends
  FOR INSERT WITH CHECK (auth.uid()::INTEGER = user_id);

-- Messages policies
CREATE POLICY "Users can view messages in their conversations" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
      AND (c.user1_id = auth.uid()::INTEGER OR c.user2_id = auth.uid()::INTEGER)
    )
  );
```

#### **Critical Deliverables**
- [ ] Complete database schema with all tables
- [ ] All indexes for performance optimization
- [ ] Complete RLS policies for security
- [ ] Test data for development
- [ ] Documentation of schema relationships

#### **Handoff to Agent 2**
- Provide complete database schema documentation
- Share table relationship diagram
- Provide sample queries for common operations
- Confirm all RLS policies are working

---

### **Agent 2: API Developer** 🔌
```yaml
Agent_ID: "API_DEVELOPER"
Start_Date: "Day 2"
Duration: "5 days"
Priority: "Critical Path"
```

#### **Your Mission**
You are the API Developer responsible for creating all backend endpoints and business logic for the friends chat system. Your APIs will be consumed by the frontend.

#### **Detailed Tasks**

#### **Day 2-3: Friend Management APIs**
```typescript
// api/friends/index.ts
export async function GET(request: Request) {
  // Get user's friends list with status
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  
  const { data, error } = await supabase
    .from('friends')
    .select(`
      *,
      friend:friend_id(id, username, display_name, avatar_emoji, is_online)
    `)
    .eq('user_id', userId)
    .eq('status', 'accepted');
    
  return Response.json({ friends: data });
}

export async function POST(request: Request) {
  // Send friend request
  const { userId, friendUsername } = await request.json();
  
  // Find friend by username
  const { data: friend } = await supabase
    .from('users')
    .select('id')
    .eq('username', friendUsername)
    .single();
    
  if (!friend) {
    return Response.json({ error: 'User not found' }, { status: 404 });
  }
  
  // Create friend request
  const { data, error } = await supabase
    .from('friends')
    .insert({
      user_id: userId,
      friend_id: friend.id,
      status: 'pending'
    });
    
  return Response.json({ success: true });
}
```

#### **Day 4-5: Chat APIs**
```typescript
// api/conversations/index.ts
export async function GET(request: Request) {
  // Get user's conversations
  const { searchParams } = new URL(request.url);
  const userId = parseInt(searchParams.get('userId')!);
  
  const { data, error } = await supabase
    .from('conversations')
    .select(`
      *,
      messages(content, created_at, sender_id),
      user1:user1_id(username, display_name, avatar_emoji),
      user2:user2_id(username, display_name, avatar_emoji)
    `)
    .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
    .order('last_message_at', { ascending: false });
    
  return Response.json({ conversations: data });
}

// api/messages/index.ts
export async function POST(request: Request) {
  // Send message
  const { conversationId, senderId, content } = await request.json();
  
  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: senderId,
      content
    })
    .select()
    .single();
    
  if (!error) {
    // Update conversation timestamp
    await supabase
      .from('conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', conversationId);
  }
  
  return Response.json({ message: data });
}
```

#### **Day 6: Testing and Validation**
```typescript
// lib/api-validation.ts
import { z } from 'zod';

export const SendMessageSchema = z.object({
  conversationId: z.string().uuid(),
  senderId: z.number(),
  content: z.string().min(1).max(1000)
});

export const AddFriendSchema = z.object({
  userId: z.number(),
  friendUsername: z.string().min(1).max(50)
});
```

#### **Critical Deliverables**
- [ ] Complete friend management API endpoints
- [ ] Complete chat/messaging API endpoints
- [ ] Input validation and error handling
- [ ] TypeScript types for all API responses
- [ ] API documentation with examples

#### **Handoff to Agent 3**
- Provide complete API documentation
- Share TypeScript interfaces for all endpoints
- Provide Postman collection for testing
- Share error handling patterns

---

### **Agent 3: Frontend Core** 🎨
```yaml
Agent_ID: "FRONTEND_CORE"
Start_Date: "Day 3"
Duration: "6 days"
Priority: "Critical Path"
```

#### **Your Mission**
You are the Frontend Developer responsible for creating all user interface components for the friends chat system. Your components must be child-friendly and mobile-responsive.

#### **Detailed Tasks**

#### **Day 3-4: Friend Management UI**
```tsx
// components/friends/FriendsList.tsx
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface Friend {
  id: string;
  username: string;
  displayName: string;
  avatarEmoji: string;
  isOnline: boolean;
}

export default function FriendsList({ userId }: { userId: number }) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchFriends();
  }, [userId]);

  const fetchFriends = async () => {
    const response = await fetch(`/api/friends?userId=${userId}`);
    const data = await response.json();
    setFriends(data.friends);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">👥 Meus Amigos</h2>
        <Button 
          onClick={() => setShowAddModal(true)}
          className="bg-green-500 hover:bg-green-600"
        >
          ➕ Adicionar
        </Button>
      </div>

      <div className="space-y-2">
        {friends.map(friend => (
          <FriendCard key={friend.id} friend={friend} />
        ))}
      </div>

      {showAddModal && (
        <AddFriendModal 
          userId={userId}
          onClose={() => setShowAddModal(false)}
          onSuccess={fetchFriends}
        />
      )}
    </div>
  );
}

// components/friends/FriendCard.tsx
interface FriendCardProps {
  friend: Friend;
}

export default function FriendCard({ friend }: FriendCardProps) {
  return (
    <Card className="p-4 flex items-center gap-3 hover:bg-gray-50 cursor-pointer">
      <div className="text-3xl">{friend.avatarEmoji}</div>
      <div className="flex-1">
        <h3 className="font-semibold text-lg">{friend.displayName}</h3>
        <p className="text-sm text-gray-500">@{friend.username}</p>
      </div>
      <div className="text-right">
        <div className={`text-sm ${friend.isOnline ? 'text-green-500' : 'text-gray-400'}`}>
          {friend.isOnline ? '🟢 Online' : '⚪ Offline'}
        </div>
      </div>
    </Card>
  );
}
```

#### **Day 5-6: Chat Interface**
```tsx
// components/chat/ChatScreen.tsx
import { useState, useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';

interface Message {
  id: string;
  content: string;
  senderId: number;
  createdAt: string;
  sender: {
    username: string;
    avatarEmoji: string;
  };
}

interface ChatScreenProps {
  conversationId: string;
  userId: number;
  friend: {
    username: string;
    displayName: string;
    avatarEmoji: string;
    isOnline: boolean;
  };
}

export default function ChatScreen({ conversationId, userId, friend }: ChatScreenProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();
  }, [conversationId]);

  const fetchMessages = async () => {
    const response = await fetch(`/api/conversations/${conversationId}/messages`);
    const data = await response.json();
    setMessages(data.messages);
    setLoading(false);
    scrollToBottom();
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async (content: string) => {
    const response = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        conversationId,
        senderId: userId,
        content
      })
    });

    if (response.ok) {
      fetchMessages(); // Refresh messages
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-blue-50 to-pink-50">
      {/* Header */}
      <div className="bg-white shadow-sm p-4 flex items-center gap-3">
        <button className="text-2xl hover:bg-gray-100 p-2 rounded">←</button>
        <div className="text-3xl">{friend.avatarEmoji}</div>
        <div>
          <h2 className="font-bold text-lg">{friend.displayName}</h2>
          <p className="text-sm text-gray-500">
            {friend.isOnline ? '🟢 Online' : '⚪ Offline'}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin text-4xl">⏳</div>
          </div>
        ) : (
          messages.map(message => (
            <MessageBubble
              key={message.id}
              message={message}
              isOwn={message.senderId === userId}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <MessageInput onSend={sendMessage} />
    </div>
  );
}
```

#### **Day 7-8: Polish and Mobile Optimization**
```tsx
// components/chat/MessageBubble.tsx
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

export default function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  return (
    <div className={`flex gap-2 ${isOwn ? 'justify-end' : 'justify-start'}`}>
      {!isOwn && (
        <div className="text-2xl">{message.sender.avatarEmoji}</div>
      )}
      
      <div className={`
        max-w-[75%] rounded-2xl px-4 py-2 shadow-sm
        ${isOwn 
          ? 'bg-blue-500 text-white rounded-br-none' 
          : 'bg-white text-gray-800 rounded-bl-none border'
        }
      `}>
        <p className="text-base leading-relaxed">{message.content}</p>
        <p className={`text-xs mt-1 ${isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
          {format(new Date(message.createdAt), 'HH:mm', { locale: ptBR })}
        </p>
      </div>
    </div>
  );
}

// components/chat/MessageInput.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface MessageInputProps {
  onSend: (content: string) => void;
}

export default function MessageInput({ onSend }: MessageInputProps) {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim()) {
      onSend(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="bg-white border-t p-4 flex gap-2">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Digite sua mensagem..."
        className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <Button
        onClick={handleSend}
        disabled={!message.trim()}
        className="bg-blue-500 hover:bg-blue-600 rounded-full p-2 w-12 h-12"
      >
        ➤
      </Button>
    </div>
  );
}
```

#### **Critical Deliverables**
- [ ] Complete friends management UI
- [ ] Complete chat interface
- [ ] Mobile-responsive design
- [ ] Child-friendly styling
- [ ] Loading states and error handling

#### **Handoff to Agent 4**
- Provide component interface documentation
- Share state management patterns
- Provide mobile testing results
- Share accessibility compliance report

---

### **Agent 4: Real-time Specialist** ⚡
```yaml
Agent_ID: "REALTIME_SPECIALIST"
Start_Date: "Day 4"
Duration: "6 days"
Priority: "Enhancement"
```

#### **Your Mission**
You are the Real-time Specialist responsible for implementing live chat features using Supabase Realtime. Your work makes the chat feel instant and responsive.

#### **Detailed Tasks**

#### **Day 4-5: Supabase Realtime Setup**
```typescript
// lib/supabase-realtime.ts
import { supabase } from '@/lib/supabase-client';

export class ChatRealtimeManager {
  private subscriptions: Map<string, any> = new Map();

  subscribeToConversation(conversationId: string, onMessage: (message: any) => void) {
    const subscription = supabase
      .channel(`conversation:${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`
      }, (payload) => {
        onMessage(payload.new);
      })
      .subscribe();

    this.subscriptions.set(conversationId, subscription);
    return subscription;
  }

  subscribeToFriendRequests(userId: number, onRequest: (request: any) => void) {
    const subscription = supabase
      .channel(`friend_requests:${userId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'friends',
        filter: `friend_id=eq.${userId}`
      }, (payload) => {
        onRequest(payload.new);
      })
      .subscribe();

    this.subscriptions.set(`requests:${userId}`, subscription);
    return subscription;
  }

  unsubscribe(key: string) {
    const subscription = this.subscriptions.get(key);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(key);
    }
  }

  unsubscribeAll() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
    this.subscriptions.clear();
  }
}

export const realtimeManager = new ChatRealtimeManager();
```

#### **Day 6-7: React Hooks for Real-time**
```typescript
// hooks/useChat.ts
import { useState, useEffect, useRef } from 'react';
import { realtimeManager } from '@/lib/supabase-realtime';

export function useChat(conversationId: string, userId: number) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!conversationId) return;

    // Fetch initial messages
    const fetchMessages = async () => {
      const response = await fetch(`/api/conversations/${conversationId}/messages`);
      const data = await response.json();
      setMessages(data.messages);
      setLoading(false);
    };

    fetchMessages();

    // Subscribe to new messages
    const subscription = realtimeManager.subscribeToConversation(
      conversationId,
      (newMessage) => {
        setMessages(prev => [...prev, newMessage]);
        
        // Play notification sound if not from current user
        if (newMessage.sender_id !== userId) {
          playNotificationSound();
        }
        
        // Scroll to bottom
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    );

    return () => {
      realtimeManager.unsubscribe(conversationId);
    };
  }, [conversationId, userId]);

  const sendMessage = async (content: string) => {
    const response = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        conversationId,
        senderId: userId,
        content
      })
    });

    // Don't add to state here - let realtime handle it
    return response.ok;
  };

  return {
    messages,
    loading,
    sendMessage,
    messagesEndRef
  };
}

// hooks/useFriends.ts
import { useState, useEffect } from 'react';
import { realtimeManager } from '@/lib/supabase-realtime';

export function useFriends(userId: number) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);

  useEffect(() => {
    if (!userId) return;

    // Fetch initial data
    const fetchFriends = async () => {
      const response = await fetch(`/api/friends?userId=${userId}`);
      const data = await response.json();
      setFriends(data.friends);
    };

    const fetchRequests = async () => {
      const response = await fetch(`/api/friends/requests?userId=${userId}`);
      const data = await response.json();
      setPendingRequests(data.requests);
    };

    fetchFriends();
    fetchRequests();

    // Subscribe to new friend requests
    const subscription = realtimeManager.subscribeToFriendRequests(
      userId,
      (newRequest) => {
        setPendingRequests(prev => [...prev, newRequest]);
        
        // Show notification
        showNotification(
          'Nova solicitação de amizade!',
          `${newRequest.sender.username} quer ser seu amigo`
        );
      }
    );

    return () => {
      realtimeManager.unsubscribe(`requests:${userId}`);
    };
  }, [userId]);

  return {
    friends,
    pendingRequests,
    // ... other methods
  };
}
```

#### **Day 8-9: Notification System**
```typescript
// lib/notification-manager.ts
class NotificationManager {
  private audio: HTMLAudioElement;
  private permission: NotificationPermission = 'default';

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

  showNotification(title: string, body: string, onClick?: () => void) {
    // Visual notification (toast)
    this.showToast(title, body);

    // Native notification if permitted and app is in background
    if (this.permission === 'granted' && document.hidden) {
      const notification = new Notification(title, {
        body,
        icon: '/lele-icon.png',
        badge: '/badge.png',
        tag: 'stumblelele-chat'
      });

      if (onClick) {
        notification.onclick = onClick;
      }

      // Auto-close after 5 seconds
      setTimeout(() => notification.close(), 5000);
    }

    // Play sound
    this.playSound();
  }

  playSound() {
    this.audio.play().catch(() => {
      // Handle autoplay restrictions
      console.log('Could not play notification sound');
    });
  }

  showToast(title: string, body: string) {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-blue-500 text-white p-4 rounded-lg shadow-lg z-50';
    toast.innerHTML = `
      <div class="font-bold">${title}</div>
      <div class="text-sm">${body}</div>
    `;

    document.body.appendChild(toast);

    // Auto-remove after 3 seconds
    setTimeout(() => {
      toast.remove();
    }, 3000);
  }
}

export const notificationManager = new NotificationManager();

// Global function for easy use
export function showNotification(title: string, body: string, onClick?: () => void) {
  notificationManager.showNotification(title, body, onClick);
}

export function playNotificationSound() {
  notificationManager.playSound();
}
```

#### **Critical Deliverables**
- [ ] Complete realtime messaging system
- [ ] Real-time friend request notifications
- [ ] Sound and visual notification system
- [ ] Reliable connection management
- [ ] Performance optimization for multiple subscriptions

#### **Handoff to Agent 5**
- Provide realtime system documentation
- Share performance testing results
- Provide connection handling patterns
- Share notification testing procedures

---

### **Agent 5: Integration & Testing** 🔧
```yaml
Agent_ID: "INTEGRATION_TESTER"
Start_Date: "Day 6"
Duration: "5 days"
Priority: "Quality Assurance"
```

#### **Your Mission**
You are the Integration & Testing Specialist responsible for ensuring all components work together seamlessly and the system is ready for production.

#### **Detailed Tasks**

#### **Day 6-7: Test Framework Setup**
```typescript
// tests/setup.ts
import { beforeAll, afterAll, beforeEach, afterEach } from '@jest/globals';
import { supabase } from '@/lib/supabase-client';

// Mock data for testing
export const mockUsers = [
  { id: 1, username: 'helena', display_name: 'Helena', avatar_emoji: '👧' },
  { id: 2, username: 'julia', display_name: 'Julia Prima', avatar_emoji: '😊' },
  { id: 3, username: 'tomtom', display_name: 'TomTom', avatar_emoji: '🎮' }
];

export const mockFriends = [
  { user_id: 1, friend_id: 2, status: 'accepted' },
  { user_id: 1, friend_id: 3, status: 'pending' }
];

// Database setup for testing
beforeAll(async () => {
  // Create test users
  await supabase.from('users').insert(mockUsers);
  
  // Create test friend relationships
  await supabase.from('friends').insert(mockFriends);
});

afterAll(async () => {
  // Clean up test data
  await supabase.from('messages').delete().neq('id', '');
  await supabase.from('conversations').delete().neq('id', '');
  await supabase.from('friends').delete().neq('id', '');
  await supabase.from('users').delete().in('id', [1, 2, 3]);
});

// tests/friends.test.ts
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FriendsList from '@/components/friends/FriendsList';
import { mockUsers } from './setup';

describe('Friends System', () => {
  test('displays friends list correctly', async () => {
    render(<FriendsList userId={1} />);
    
    await waitFor(() => {
      expect(screen.getByText('Julia Prima')).toBeInTheDocument();
      expect(screen.getByText('@julia')).toBeInTheDocument();
    });
  });

  test('can add new friend', async () => {
    render(<FriendsList userId={1} />);
    
    // Click add friend button
    fireEvent.click(screen.getByText('➕ Adicionar'));
    
    // Fill in username
    const input = screen.getByPlaceholderText('Digite o username');
    fireEvent.change(input, { target: { value: 'newuser' } });
    
    // Submit
    fireEvent.click(screen.getByText('Enviar Pedido'));
    
    await waitFor(() => {
      expect(screen.getByText('Pedido enviado!')).toBeInTheDocument();
    });
  });

  test('can remove friend', async () => {
    render(<FriendsList userId={1} />);
    
    // Find and click remove button
    const removeButton = screen.getByTestId('remove-friend-2');
    fireEvent.click(removeButton);
    
    // Confirm removal
    fireEvent.click(screen.getByText('Confirmar'));
    
    await waitFor(() => {
      expect(screen.queryByText('Julia Prima')).not.toBeInTheDocument();
    });
  });
});
```

#### **Day 8: End-to-End Testing**
```typescript
// tests/e2e/chat-flow.test.ts
import { test, expect } from '@playwright/test';

test.describe('Complete Chat Flow', () => {
  test('user can send and receive messages', async ({ page }) => {
    // Navigate to app
    await page.goto('/');
    
    // Login as Helena
    await page.fill('[data-testid="username"]', 'helena');
    await page.click('[data-testid="login"]');
    
    // Go to friends section
    await page.click('[data-testid="friends-tab"]');
    
    // Click on a friend to open chat
    await page.click('[data-testid="friend-julia"]');
    
    // Send a message
    await page.fill('[data-testid="message-input"]', 'Oi Julia! Como você está?');
    await page.click('[data-testid="send-button"]');
    
    // Verify message appears
    await expect(page.locator('[data-testid="message-bubble"]')).toContainText('Oi Julia! Como você está?');
    
    // Verify timestamp is shown
    await expect(page.locator('[data-testid="message-time"]')).toBeVisible();
  });

  test('user receives real-time notifications', async ({ page, context }) => {
    // Open two browser tabs
    const page1 = await context.newPage();
    const page2 = await context.newPage();
    
    // Login as Helena in first tab
    await page1.goto('/');
    await page1.fill('[data-testid="username"]', 'helena');
    await page1.click('[data-testid="login"]');
    
    // Login as Julia in second tab
    await page2.goto('/');
    await page2.fill('[data-testid="username"]', 'julia');
    await page2.click('[data-testid="login"]');
    
    // Helena opens chat with Julia
    await page1.click('[data-testid="friends-tab"]');
    await page1.click('[data-testid="friend-julia"]');
    
    // Julia opens chat with Helena
    await page2.click('[data-testid="friends-tab"]');
    await page2.click('[data-testid="friend-helena"]');
    
    // Helena sends message
    await page1.fill('[data-testid="message-input"]', 'Teste de mensagem em tempo real!');
    await page1.click('[data-testid="send-button"]');
    
    // Julia should receive the message instantly
    await expect(page2.locator('[data-testid="message-bubble"]')).toContainText('Teste de mensagem em tempo real!');
  });
});
```

#### **Day 9: Performance and Security Testing**
```typescript
// tests/performance.test.ts
import { describe, test, expect } from '@jest/globals';

describe('Performance Tests', () => {
  test('API responses are fast', async () => {
    const start = Date.now();
    
    const response = await fetch('/api/friends?userId=1');
    const data = await response.json();
    
    const duration = Date.now() - start;
    
    expect(duration).toBeLessThan(200); // Should respond in under 200ms
    expect(data.friends).toBeDefined();
  });

  test('message sending is fast', async () => {
    const start = Date.now();
    
    const response = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        conversationId: 'test-conversation',
        senderId: 1,
        content: 'Performance test message'
      })
    });
    
    const duration = Date.now() - start;
    
    expect(duration).toBeLessThan(500); // Should send in under 500ms
    expect(response.ok).toBe(true);
  });

  test('handles large message history', async () => {
    // Create 100 test messages
    const messages = Array.from({ length: 100 }, (_, i) => ({
      conversation_id: 'test-conversation',
      sender_id: i % 2 === 0 ? 1 : 2,
      content: `Test message ${i + 1}`
    }));
    
    await supabase.from('messages').insert(messages);
    
    const start = Date.now();
    const response = await fetch('/api/conversations/test-conversation/messages');
    const data = await response.json();
    const duration = Date.now() - start;
    
    expect(duration).toBeLessThan(1000); // Should load in under 1 second
    expect(data.messages).toHaveLength(100);
  });
});

// tests/security.test.ts
describe('Security Tests', () => {
  test('prevents SQL injection', async () => {
    const maliciousInput = "'; DROP TABLE users; --";
    
    const response = await fetch('/api/friends/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 1,
        friendUsername: maliciousInput
      })
    });
    
    // Should handle gracefully without error
    expect(response.status).toBe(404); // User not found
    
    // Verify users table still exists
    const usersResponse = await fetch('/api/users');
    expect(usersResponse.ok).toBe(true);
  });

  test('prevents XSS attacks', async () => {
    const xssScript = '<script>alert("XSS")</script>';
    
    const response = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        conversationId: 'test-conversation',
        senderId: 1,
        content: xssScript
      })
    });
    
    expect(response.ok).toBe(true);
    
    // Verify message is stored safely
    const messagesResponse = await fetch('/api/conversations/test-conversation/messages');
    const data = await messagesResponse.json();
    const lastMessage = data.messages[data.messages.length - 1];
    
    // Content should be escaped/sanitized
    expect(lastMessage.content).not.toContain('<script>');
  });
});
```

#### **Day 10: Deployment and Monitoring**
```typescript
// scripts/deploy.ts
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function deploy() {
  console.log('🚀 Starting deployment...');
  
  // Run tests first
  console.log('📋 Running tests...');
  await execAsync('npm test');
  
  // Build the application
  console.log('🔨 Building application...');
  await execAsync('npm run build');
  
  // Deploy database migrations
  console.log('🗄️ Deploying database migrations...');
  await execAsync('supabase db push');
  
  // Deploy to Vercel
  console.log('☁️ Deploying to Vercel...');
  await execAsync('vercel --prod');
  
  console.log('✅ Deployment complete!');
}

deploy().catch(console.error);

// lib/monitoring.ts
export function setupErrorMonitoring() {
  // Log errors to console and external service
  window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    
    // Send to monitoring service
    fetch('/api/errors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: event.error.message,
        stack: event.error.stack,
        url: window.location.href,
        timestamp: new Date().toISOString()
      })
    });
  });
}
```

#### **Critical Deliverables**
- [ ] Complete test suite (unit, integration, e2e)
- [ ] Performance benchmarks and optimization
- [ ] Security testing and vulnerability assessment
- [ ] Deployment scripts and monitoring setup
- [ ] Documentation for maintenance and troubleshooting

#### **Final Integration Report**
- System health: 99.5% uptime
- Performance: All endpoints < 200ms
- Security: No critical vulnerabilities
- User experience: Child-friendly and intuitive
- Ready for production launch

---

## 📊 Agent Success Metrics

### **Collective Goals**
- [ ] Complete friends chat system in 10 days
- [ ] All components work together seamlessly
- [ ] Performance meets child-friendly standards
- [ ] Security passes all safety requirements
- [ ] Mobile-responsive on all devices

### **Individual KPIs**
- **Agent 1**: Schema integrity and security
- **Agent 2**: API performance and reliability
- **Agent 3**: UI/UX quality and accessibility
- **Agent 4**: Real-time responsiveness
- **Agent 5**: System quality and stability

---

**Ready for parallel agent deployment! 🚀**