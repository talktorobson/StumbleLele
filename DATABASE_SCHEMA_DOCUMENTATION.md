# StumbleLele Friends Chat System - Database Schema Documentation

## 📋 Overview
This document provides comprehensive documentation of the database schema for the StumbleLele Friends Chat System. The schema has been designed to support secure, scalable, and child-friendly chat functionality between users.

**Author:** Agent 1 - Database Architect  
**Date:** July 18, 2025  
**Version:** 1.0  

---

## 🗄️ Database Schema Overview

### Core Tables Structure

```
users (Enhanced)
├── id (PRIMARY KEY)
├── username (UNIQUE, NOT NULL)
├── display_name
├── avatar_emoji
├── is_online
├── last_seen
└── ... (existing fields)

friends
├── id (UUID PRIMARY KEY)
├── user_id (FK → users.id)
├── friend_id (FK → users.id)
├── status (pending/accepted/rejected/blocked)
├── created_at
└── updated_at

conversations
├── id (UUID PRIMARY KEY)
├── user1_id (FK → users.id)
├── user2_id (FK → users.id)
├── created_at
├── last_message_at
└── is_active

messages
├── id (UUID PRIMARY KEY)
├── conversation_id (FK → conversations.id)
├── sender_id (FK → users.id)
├── content (TEXT)
├── created_at
├── updated_at
├── is_deleted
└── message_type
```

---

## 📊 Table Relationships

### Entity Relationship Diagram (ERD)

```
users ||--o{ friends : "user_id"
users ||--o{ friends : "friend_id"
users ||--o{ conversations : "user1_id"
users ||--o{ conversations : "user2_id"
users ||--o{ messages : "sender_id"
conversations ||--o{ messages : "conversation_id"
```

### Key Relationships

1. **Users ↔ Friends**: Many-to-many relationship through friends table
2. **Users ↔ Conversations**: Two users per conversation (user1_id, user2_id)
3. **Conversations ↔ Messages**: One-to-many relationship
4. **Users ↔ Messages**: One sender per message

---

## 🔐 Security Features

### Row Level Security (RLS) Policies

#### Friends Table Policies
- **SELECT**: Users can view their own friend relationships
- **INSERT**: Users can create friend requests
- **UPDATE**: Users can update friend status
- **DELETE**: Users can remove friend relationships

#### Conversations Table Policies
- **SELECT**: Users can view conversations they participate in
- **INSERT**: Users can create conversations with friends
- **UPDATE**: Users can update conversation metadata

#### Messages Table Policies
- **SELECT**: Users can view messages in their conversations
- **INSERT**: Users can send messages to their conversations
- **UPDATE**: Users can edit their own messages
- **DELETE**: Users can delete their own messages

### Data Integrity Constraints

1. **No self-friendship**: Users cannot befriend themselves
2. **No self-conversation**: Users cannot have conversations with themselves
3. **Unique friendships**: Prevent duplicate friend relationships
4. **Unique conversations**: Prevent duplicate conversations between same users
5. **Cascade deletes**: Clean up related data when users are deleted

---

## 📈 Performance Optimizations

### Indexes Created

#### Friends Table
```sql
CREATE INDEX idx_friends_user_id ON friends(user_id);
CREATE INDEX idx_friends_friend_id ON friends(friend_id);
CREATE INDEX idx_friends_status ON friends(status);
CREATE INDEX idx_friends_created_at ON friends(created_at DESC);
```

#### Conversations Table
```sql
CREATE INDEX idx_conversations_user1_id ON conversations(user1_id);
CREATE INDEX idx_conversations_user2_id ON conversations(user2_id);
CREATE INDEX idx_conversations_users ON conversations(user1_id, user2_id);
CREATE INDEX idx_conversations_last_message_at ON conversations(last_message_at DESC);
```

#### Messages Table
```sql
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_messages_not_deleted ON messages(is_deleted) WHERE is_deleted = false;
```

#### Users Table
```sql
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_is_online ON users(is_online);
CREATE INDEX idx_users_last_seen ON users(last_seen DESC);
```

---

## 🔧 Utility Functions

### Automatic Conversation Creation
```sql
CREATE OR REPLACE FUNCTION create_conversation_if_not_exists(
    p_user1_id INTEGER, 
    p_user2_id INTEGER
) RETURNS UUID
```
Automatically creates a conversation between two users if it doesn't exist.

### Timestamp Updates
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER
```
Automatically updates the `updated_at` column when records are modified.

### Conversation Last Message Update
```sql
CREATE OR REPLACE FUNCTION update_conversation_last_message() RETURNS TRIGGER
```
Automatically updates `last_message_at` when new messages are added.

---

## 📋 Sample Queries

### 1. Get User's Friends List
```sql
SELECT 
    f.id,
    f.status,
    f.created_at,
    u.username,
    u.display_name,
    u.avatar_emoji,
    u.is_online,
    u.last_seen
FROM friends f
JOIN users u ON f.friend_id = u.id
WHERE f.user_id = $1 
  AND f.status = 'accepted'
ORDER BY u.is_online DESC, u.last_seen DESC;
```

### 2. Get User's Conversations with Last Message
```sql
SELECT 
    c.id,
    c.user1_id,
    c.user2_id,
    c.last_message_at,
    c.is_active,
    u1.username as user1_username,
    u1.display_name as user1_display_name,
    u1.avatar_emoji as user1_avatar_emoji,
    u1.is_online as user1_is_online,
    u2.username as user2_username,
    u2.display_name as user2_display_name,
    u2.avatar_emoji as user2_avatar_emoji,
    u2.is_online as user2_is_online,
    m.content as last_message_content,
    m.created_at as last_message_created_at,
    m.sender_id as last_message_sender_id
FROM conversations c
JOIN users u1 ON c.user1_id = u1.id
JOIN users u2 ON c.user2_id = u2.id
LEFT JOIN messages m ON m.conversation_id = c.id 
    AND m.created_at = c.last_message_at
    AND m.is_deleted = false
WHERE (c.user1_id = $1 OR c.user2_id = $1)
  AND c.is_active = true
ORDER BY c.last_message_at DESC NULLS LAST;
```

### 3. Get Messages in a Conversation
```sql
SELECT 
    m.id,
    m.content,
    m.created_at,
    m.sender_id,
    m.message_type,
    u.username as sender_username,
    u.display_name as sender_display_name,
    u.avatar_emoji as sender_avatar_emoji
FROM messages m
JOIN users u ON m.sender_id = u.id
WHERE m.conversation_id = $1
  AND m.is_deleted = false
ORDER BY m.created_at ASC;
```

### 4. Send a Message (with Conversation Auto-Creation)
```sql
-- Step 1: Ensure conversation exists
SELECT create_conversation_if_not_exists($1, $2);

-- Step 2: Insert message
INSERT INTO messages (conversation_id, sender_id, content, message_type)
VALUES (
    (SELECT id FROM conversations 
     WHERE (user1_id = LEAST($1, $2) AND user2_id = GREATEST($1, $2))),
    $1,
    $3,
    'text'
)
RETURNING id, created_at;
```

### 5. Send Friend Request
```sql
INSERT INTO friends (user_id, friend_id, status)
VALUES ($1, $2, 'pending')
ON CONFLICT (user_id, friend_id) DO NOTHING
RETURNING id;
```

### 6. Accept Friend Request
```sql
UPDATE friends 
SET status = 'accepted', updated_at = NOW()
WHERE user_id = $2 AND friend_id = $1 AND status = 'pending'
RETURNING id;
```

### 7. Search Users by Username
```sql
SELECT id, username, display_name, avatar_emoji, is_online
FROM users
WHERE username ILIKE '%' || $1 || '%'
  AND id != $2  -- Exclude current user
ORDER BY 
    CASE WHEN username = $1 THEN 0 ELSE 1 END,  -- Exact match first
    is_online DESC,
    username ASC
LIMIT 10;
```

### 8. Get Online Friends
```sql
SELECT 
    u.id,
    u.username,
    u.display_name,
    u.avatar_emoji,
    u.last_seen
FROM users u
JOIN friends f ON (f.friend_id = u.id)
WHERE f.user_id = $1
  AND f.status = 'accepted'
  AND u.is_online = true
ORDER BY u.last_seen DESC;
```

### 9. Get Unread Messages Count
```sql
SELECT 
    c.id as conversation_id,
    COUNT(m.id) as unread_count
FROM conversations c
JOIN messages m ON m.conversation_id = c.id
WHERE (c.user1_id = $1 OR c.user2_id = $1)
  AND m.sender_id != $1
  AND m.created_at > COALESCE(
      (SELECT last_read_at FROM conversation_read_status 
       WHERE conversation_id = c.id AND user_id = $1), 
      c.created_at
  )
  AND m.is_deleted = false
GROUP BY c.id;
```

### 10. Update User Online Status
```sql
UPDATE users 
SET is_online = $2, last_seen = NOW()
WHERE id = $1
RETURNING id, is_online, last_seen;
```

---

## 🎯 Common Use Cases

### Friend Management
1. **Add Friend**: Search user → Send friend request → Notification
2. **Accept Friend**: View pending requests → Accept → Create conversation
3. **Remove Friend**: Delete friend relationship → Deactivate conversation

### Chat Functionality
1. **Start Chat**: Select friend → Auto-create conversation → Send message
2. **Send Message**: Validate conversation access → Insert message → Update timestamp
3. **View Messages**: Load conversation → Display messages with sender info

### User Presence
1. **Online Status**: Update on login/logout → Show to friends
2. **Last Seen**: Track activity → Display to friends when offline

---

## 🚀 Performance Considerations

### Query Optimization
- All frequently accessed columns are indexed
- Composite indexes for common query patterns
- Partial indexes for filtered queries (e.g., non-deleted messages)

### Scalability Features
- UUID primary keys for distributed systems
- Efficient pagination with timestamp-based ordering
- Optimized foreign key relationships

### Memory Usage
- Reasonable text limits for messages (no enforced limit but monitored)
- JSON columns for flexible data storage
- Proper data types for optimal storage

---

## 📝 Test Data Summary

### Test Users (10 total)
- **Helena** (helena) - 8 years, online, 4 friends
- **Julia** (julia) - 7 years, online, 4 friends  
- **TomTom** (tomtom) - 9 years, offline, 4 friends
- **Sofia** (sofia) - 8 years, online, 4 friends
- **Miguel** (miguel) - 10 years, offline, 3 friends
- **Ana** (ana) - 7 years, online, 4 friends
- **Pedro** (pedro) - 9 years, online, 4 friends
- **Clara** (clara) - 8 years, offline, 3 friends
- **Bruno** (bruno) - 10 years, online, 4 friends
- **Lara** (lara) - 7 years, online, 6 friends

### Test Data Statistics
- **25 friend relationships** (mix of accepted and pending)
- **21 active conversations** between friends
- **50+ sample messages** with realistic child conversations
- **8 memory entries** for user personalization
- **5 AI conversation samples** for context

---

## 🔗 Views for Common Queries

### friends_with_users
Pre-joined view showing friend relationships with user details.

### conversations_with_users  
Pre-joined view showing conversations with participant details.

### messages_with_sender
Pre-joined view showing messages with sender information (excludes deleted messages).

---

## 📋 Migration Commands

### Apply Schema
```bash
# Apply main schema migration
psql -h localhost -p 5432 -U postgres -d stumblelele -f migrations/0001_friends_chat_system.sql

# Apply test data
psql -h localhost -p 5432 -U postgres -d stumblelele -f migrations/0002_test_data.sql
```

### Drizzle Commands
```bash
# Push schema changes
npm run db:push

# Generate and run migrations
npm run db:migrate
```

---

## 🎯 Agent 2 Handoff Information

### API Development Requirements
The database schema provides the foundation for these API endpoints:

#### Friend Management APIs
- `GET /api/friends?userId={id}` - Get user's friends
- `POST /api/friends` - Send friend request
- `PUT /api/friends/{id}` - Accept/reject friend request
- `DELETE /api/friends/{id}` - Remove friend

#### Chat APIs
- `GET /api/conversations?userId={id}` - Get user's conversations
- `GET /api/conversations/{id}/messages` - Get messages in conversation
- `POST /api/messages` - Send message
- `PUT /api/messages/{id}` - Edit message
- `DELETE /api/messages/{id}` - Delete message

#### User APIs
- `GET /api/users/search?q={query}` - Search users
- `PUT /api/users/{id}/status` - Update online status
- `GET /api/users/{id}/friends` - Get user's friends with status

### Database Connection
The schema is designed to work with the existing Supabase PostgreSQL connection:
- Connection URL: `DATABASE_URL` environment variable
- Uses transaction pooler for optimal performance
- Row Level Security enabled for all chat tables

### Critical Security Notes
- All chat tables have RLS enabled
- Policies prevent unauthorized access to conversations
- CASCADE deletes ensure data consistency
- Input validation should be implemented in API layer

---

## 📊 Success Metrics

### Database Performance
- ✅ All queries optimized with appropriate indexes
- ✅ RLS policies implemented for security
- ✅ Automatic timestamp management
- ✅ Constraint-based data integrity

### Test Coverage
- ✅ 10 diverse test users created
- ✅ Comprehensive friend relationship scenarios
- ✅ Realistic conversation patterns
- ✅ Mixed online/offline status distribution

### Schema Completeness
- ✅ Enhanced users table with chat fields
- ✅ Proper friend relationship management
- ✅ Scalable conversation structure
- ✅ Flexible message storage system

---

**Database foundation is ready for Agent 2 to begin API development!** 🚀

The schema provides a robust, secure, and scalable foundation for the StumbleLele Friends Chat System, with comprehensive test data and documentation to support the development team.