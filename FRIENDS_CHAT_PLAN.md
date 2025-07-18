# 🗨️ Friends Real-Time Chat System - Architecture Plan

## 📋 Executive Summary
Transform the current static friends system into a real-time chat application where Helena can chat with her added friends, similar to WhatsApp but simplified for children aged 8-11.

## 🎯 Core Requirements
1. **User Management**: Add/save friends with persistent storage
2. **Chat History**: Keep full conversation history
3. **Real-time Notifications**: Notify about new messages
4. **Profile Integration**: Friends linked to user profiles
5. **Friend Management**: Remove friends and their conversations
6. **Text-Only**: Focus on text chat initially

## 🏗️ Architecture Decision: Supabase (Recommended)

### Why Supabase over Local Storage:
- ✅ **Real-time built-in**: Supabase Realtime for instant messages
- ✅ **Persistent**: Data survives app reinstalls/device changes
- ✅ **Scalable**: Can handle multiple users simultaneously
- ✅ **Already configured**: We have Supabase set up and working
- ✅ **Row-level security**: Built-in privacy features
- ✅ **Simple integration**: Direct SDK support

## 📊 Database Schema

### 1. Enhanced Users Table
```sql
-- Extend existing users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS
  username VARCHAR(50) UNIQUE NOT NULL,
  display_name VARCHAR(100),
  avatar_emoji VARCHAR(10) DEFAULT '😊',
  is_online BOOLEAN DEFAULT false,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW();
```

### 2. Friends Table
```sql
CREATE TABLE friends (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  friend_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending', -- pending, accepted, blocked
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, friend_id)
);

-- Index for faster queries
CREATE INDEX idx_friends_user_id ON friends(user_id);
CREATE INDEX idx_friends_friend_id ON friends(friend_id);
```

### 3. Conversations Table
```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_message TEXT,
  last_message_at TIMESTAMP WITH TIME ZONE
);
```

### 4. Conversation Participants Table
```sql
CREATE TABLE conversation_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  unread_count INTEGER DEFAULT 0,
  last_read_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(conversation_id, user_id)
);
```

### 5. Messages Table
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id INTEGER REFERENCES users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  edited_at TIMESTAMP WITH TIME ZONE,
  is_deleted BOOLEAN DEFAULT false,
  read_by JSONB DEFAULT '[]' -- Array of user IDs who read the message
);

-- Index for faster message queries
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
```

## 🔄 Real-time Architecture

### 1. Supabase Realtime Subscriptions
```typescript
// Subscribe to new messages in a conversation
const messageSubscription = supabase
  .channel(`conversation:${conversationId}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'messages',
    filter: `conversation_id=eq.${conversationId}`
  }, handleNewMessage)
  .subscribe();

// Subscribe to friend online status
const onlineSubscription = supabase
  .channel('online_users')
  .on('presence', { event: 'sync' }, handlePresenceSync)
  .subscribe();
```

### 2. Message Flow
```
User sends message → API validates → Insert to DB → 
Realtime broadcast → All participants receive → Update UI
```

## 🎨 UI/UX Design (WhatsApp-like)

### 1. Friends List Screen
```
┌─────────────────────────┐
│ 👥 Amigos da Helena     │
├─────────────────────────┤
│ 🟢 Julia Prima          │
│    Oi! Tudo bem?        │
│    2 min atrás          │
├─────────────────────────┤
│ 🟢 TomTom               │
│    Vamos jogar?         │
│    5 min atrás          │
├─────────────────────────┤
│ ⚪ Duda                 │
│    Tchau! 👋            │
│    1 hora atrás         │
└─────────────────────────┘
[➕ Adicionar Amigo]
```

### 2. Chat Screen
```
┌─────────────────────────┐
│ ← Julia Prima 🟢        │
├─────────────────────────┤
│                         │
│         Oi Helena! 😊   │
│         14:32      ✓✓   │
│                         │
│ Oi Julia! Tudo bem?     │
│ 14:33                   │
│                         │
│         Sim! Vamos      │
│         brincar? 🎮     │
│         14:33      ✓✓   │
│                         │
└─────────────────────────┘
│ Digite uma mensagem...  │
│                    [➤]  │
└─────────────────────────┘
```

## 🔔 Notification System

### 1. In-App Notifications
- Red badge with unread count on friends tab
- Toast notifications for new messages
- Sound effect (optional, child-friendly)

### 2. Visual Indicators
- ✓ Single check: Message sent
- ✓✓ Double check: Message delivered
- ✓✓ Blue checks: Message read
- 🟢 Green dot: Friend online
- ⚪ Gray dot: Friend offline

## 🛠️ Implementation Phases

### Phase 1: Foundation (Week 1)
- [ ] Database schema creation
- [ ] User authentication enhancement
- [ ] Basic friend management CRUD
- [ ] Friend request system

### Phase 2: Core Chat (Week 2)
- [ ] Conversation creation
- [ ] Message sending/receiving
- [ ] Chat history display
- [ ] Real-time updates

### Phase 3: Polish (Week 3)
- [ ] Online/offline status
- [ ] Read receipts
- [ ] Typing indicators
- [ ] Message notifications
- [ ] Delete friend/conversation

### Phase 4: Child Safety (Week 4)
- [ ] Content filtering
- [ ] Report system
- [ ] Parent controls (optional)
- [ ] Privacy settings

## 🔐 Security Considerations

### 1. Row Level Security (RLS)
```sql
-- Users can only see their own friends
CREATE POLICY "Users can view own friends" ON friends
  FOR SELECT USING (auth.uid()::INTEGER = user_id OR auth.uid()::INTEGER = friend_id);

-- Users can only send messages in their conversations
CREATE POLICY "Users can send messages in own conversations" ON messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid()::INTEGER AND
    EXISTS (
      SELECT 1 FROM conversation_participants
      WHERE conversation_id = messages.conversation_id
      AND user_id = auth.uid()::INTEGER
    )
  );
```

### 2. Privacy Features
- Friends must be mutual (both accept)
- Can only message friends
- Can block/unblock users
- Messages deleted for everyone option

## 🚀 API Endpoints

### 1. Friend Management
```typescript
POST   /api/friends/add         // Send friend request
POST   /api/friends/accept      // Accept friend request
DELETE /api/friends/{id}        // Remove friend
GET    /api/friends             // List all friends
GET    /api/friends/requests    // List pending requests
```

### 2. Chat Management
```typescript
GET    /api/conversations                    // List all conversations
GET    /api/conversations/{id}/messages      // Get messages (paginated)
POST   /api/conversations/{id}/messages      // Send message
PUT    /api/messages/{id}                    // Edit message
DELETE /api/messages/{id}                    // Delete message
POST   /api/messages/{id}/read               // Mark as read
```

## 📱 Frontend Components

### 1. New Components Needed
```typescript
- FriendsList.tsx          // Main friends list with status
- FriendRequests.tsx       // Pending friend requests
- ChatScreen.tsx           // Individual chat interface
- MessageBubble.tsx        // Single message component
- OnlineStatus.tsx         // Online/offline indicator
- UnreadBadge.tsx          // Notification badge
- AddFriendModal.tsx       // Add new friend interface
- FriendProfile.tsx        // Friend details/options
```

### 2. Hooks
```typescript
- useFriends()             // Manage friends list
- useConversation()        // Handle single conversation
- useMessages()            // Message operations
- useRealtime()            // Supabase realtime subscriptions
- useNotifications()       // Handle notifications
- useOnlineStatus()        // Track online/offline
```

## 🎯 Success Criteria

1. **Performance**
   - Messages deliver in < 1 second
   - Chat history loads in < 2 seconds
   - Smooth scrolling with 100+ messages

2. **Reliability**
   - 99.9% message delivery rate
   - Offline message queue
   - Automatic reconnection

3. **User Experience**
   - Intuitive for 8-11 year olds
   - Clear visual feedback
   - Fun and engaging design

## 🚧 Technical Challenges & Solutions

### 1. Message Ordering
**Challenge**: Ensuring correct message order
**Solution**: Use created_at timestamp + client-side sorting

### 2. Offline Support
**Challenge**: Handle offline message sending
**Solution**: Queue messages locally, sync when online

### 3. Real-time Performance
**Challenge**: Handle multiple active chats
**Solution**: Subscribe only to active conversation

### 4. Data Privacy
**Challenge**: Ensure kids' privacy
**Solution**: No phone numbers, usernames only, parent controls

## 📈 Future Enhancements
- Voice messages
- Photo sharing (with moderation)
- Group chats
- Stickers/emojis reactions
- Games integration
- Video calls (long-term)

## 🏁 Implementation Order

1. **Start with**: Database schema + basic friend CRUD
2. **Then**: Simple message sending (no real-time)
3. **Add**: Real-time subscriptions
4. **Polish**: Notifications, read receipts, online status
5. **Finalize**: Safety features and parental controls

---

**Estimated Timeline**: 4 weeks for complete implementation
**Complexity**: Medium-High
**Risk**: Low (using proven Supabase infrastructure)