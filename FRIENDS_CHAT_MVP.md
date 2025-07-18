# 🚀 Friends Chat MVP - Simplified Implementation Plan

## 📋 MVP Scope (2 Weeks)

### Core Features Only:
1. ✅ Add friends by username
2. ✅ Accept/reject friend requests  
3. ✅ Text chat between friends
4. ✅ Message history
5. ✅ Basic notifications (in-app only)
6. ✅ Delete friends and conversations

### Deferred to v2:
- ❌ Typing indicators
- ❌ Read receipts
- ❌ Online/offline status
- ❌ Voice messages
- ❌ Photo sharing
- ❌ Group chats

## 🏃 Sprint 1 (Week 1): Foundation

### Day 1-2: Database Setup
```sql
-- Simplified schema for MVP
CREATE TABLE friends (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id INTEGER REFERENCES users(id),
  friend_id INTEGER REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user1_id INTEGER REFERENCES users(id),
  user2_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user1_id, user2_id)
);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id),
  sender_id INTEGER REFERENCES users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add username to users
ALTER TABLE users ADD COLUMN username VARCHAR(50) UNIQUE;
```

### Day 3-4: API Endpoints
```typescript
// api/friends.ts
export async function POST(req: Request) {
  const { username } = await req.json();
  // Add friend logic
}

// api/messages.ts  
export async function POST(req: Request) {
  const { conversationId, content } = await req.json();
  // Send message logic
}

// api/conversations/[id]/messages.ts
export async function GET(req: Request) {
  // Get messages with pagination
}
```

### Day 5: Basic UI Components
```tsx
// Simplified Friends List
function FriendsList({ userId }) {
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">👥 Amigos</h2>
      <button className="btn-primary mb-4">
        ➕ Adicionar Amigo
      </button>
      {friends.map(friend => (
        <FriendCard key={friend.id} friend={friend} />
      ))}
    </div>
  );
}

// Basic Chat Interface
function ChatScreen({ conversation }) {
  return (
    <div className="flex flex-col h-screen">
      <ChatHeader friend={conversation.friend} />
      <MessageList messages={messages} />
      <MessageInput onSend={sendMessage} />
    </div>
  );
}
```

## 🏃 Sprint 2 (Week 2): Real-time & Polish

### Day 6-7: Supabase Realtime
```typescript
// Simple real-time subscription
useEffect(() => {
  const subscription = supabase
    .channel(`messages:${conversationId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `conversation_id=eq.${conversationId}`
    }, (payload) => {
      // Add new message to state
      setMessages(prev => [...prev, payload.new]);
    })
    .subscribe();

  return () => subscription.unsubscribe();
}, [conversationId]);
```

### Day 8-9: Notifications
```typescript
// Basic notification system
function useNotifications(userId: number) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Count unread messages
    const fetchUnread = async () => {
      const { count } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .neq('sender_id', userId)
        .is('read_at', null);
      
      setUnreadCount(count || 0);
    };

    fetchUnread();
  }, [userId]);

  return { unreadCount };
}
```

### Day 10: Testing & Polish
- Test all flows
- Fix bugs
- Improve UI/UX
- Add loading states
- Error handling

## 🎯 Implementation Priorities

### 1. Must Have (MVP)
```
✅ Add/remove friends
✅ Send/receive messages
✅ Message history
✅ Real-time updates
✅ Unread count badge
```

### 2. Should Have (v1.1)
```
⏳ Online/offline status
⏳ Typing indicators
⏳ Read receipts
⏳ Message search
```

### 3. Nice to Have (v2)
```
💭 Voice messages
💭 Photo sharing
💭 Group chats
💭 Emoji reactions
```

## 🛠️ Simplified Tech Stack

### Frontend
- **React** (already setup)
- **TanStack Query** (data fetching)
- **Zustand** (simple state for notifications)
- **date-fns** (time formatting)

### Backend
- **Supabase** (database + realtime)
- **Vercel Functions** (API routes)
- **No additional services needed**

## 📁 Minimal File Structure
```
/components/friends/
  ├── FriendsList.tsx      # List with add button
  ├── AddFriendModal.tsx   # Username input
  └── FriendRequests.tsx   # Pending requests

/components/chat/
  ├── ChatList.tsx         # Conversation list
  ├── ChatScreen.tsx       # Main chat UI
  ├── MessageBubble.tsx    # Single message
  └── MessageInput.tsx     # Text input

/hooks/
  ├── use-friends.ts       # Friend operations
  └── use-chat.ts          # Chat operations
```

## 🚢 Deployment Steps

### 1. Database Migration
```bash
# Run migrations on Supabase
supabase db push
```

### 2. Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=xxx
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
```

### 3. Deploy to Vercel
```bash
vercel --prod
```

## ⚡ Quick Start Commands

```bash
# 1. Create database tables
npm run db:migrate

# 2. Seed test data
npm run db:seed

# 3. Start development
npm run dev

# 4. Run tests
npm test
```

## 🎨 UI Mockups

### Friends List
```
┌─────────────────────┐
│ 👥 Meus Amigos (3)  │
├─────────────────────┤
│ [➕ Adicionar]      │
├─────────────────────┤
│ 😊 Julia            │
│ 💬 Nova mensagem!   │
├─────────────────────┤
│ 🎮 TomTom           │
│ Vamos jogar?        │
├─────────────────────┤
│ 🌟 Duda             │
│ Oi Helena!          │
└─────────────────────┘
```

### Chat Screen
```
┌─────────────────────┐
│ ← Julia 😊          │
├─────────────────────┤
│                     │
│      Oi Helena!     │
│      14:32     ✓    │
│                     │
│ Oi Julia! Tudo bem? │
│ 14:33               │
│                     │
└─────────────────────┘
│ [Digite aqui...]  ➤ │
└─────────────────────┘
```

## 🔑 Key Decisions for MVP

1. **No Authentication System**: Use existing user IDs
2. **Simple Friend System**: Just username-based adds
3. **Basic Chat Only**: Text messages, no media
4. **Minimal Realtime**: Just new messages
5. **In-App Notifications**: No push notifications

## 📊 Success Metrics

- **Working Chat**: Messages send/receive in < 1s
- **Friend System**: Can add friends in < 3 clicks  
- **Reliable**: 99% message delivery
- **Simple**: Kids can use without help
- **Safe**: No external user access

---

**Total Time Estimate**: 2 weeks for working MVP
**Complexity**: Low-Medium
**Risk**: Minimal (using proven Supabase)