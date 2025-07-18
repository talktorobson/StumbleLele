-- Friends Chat System Migration
-- This migration creates the complete database foundation for the friends chat system
-- Author: Agent 1 - Database Architect
-- Date: 2025-07-18

-- Enable UUID extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Step 1: Enhance users table with friends chat system fields
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS username VARCHAR(50) UNIQUE NOT NULL DEFAULT 'user_' || id,
ADD COLUMN IF NOT EXISTS display_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS avatar_emoji VARCHAR(10) DEFAULT '😊',
ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Update display_name to use name if not set
UPDATE users SET display_name = name WHERE display_name IS NULL;

-- Rename existing conversations table to ai_conversations for clarity
ALTER TABLE conversations RENAME TO ai_conversations;

-- Step 2: Create new friends table with proper friend relationships
DROP TABLE IF EXISTS friends;
CREATE TABLE friends (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    friend_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, friend_id),
    CHECK (user_id != friend_id)
);

-- Step 3: Create conversations table for 1-on-1 chat conversations
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user1_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user2_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_message_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    UNIQUE(user1_id, user2_id),
    CHECK (user1_id != user2_id)
);

-- Step 4: Create messages table for individual chat messages
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT false,
    message_type VARCHAR(20) DEFAULT 'text'
);

-- Step 5: Create performance indexes
-- Friends table indexes
CREATE INDEX idx_friends_user_id ON friends(user_id);
CREATE INDEX idx_friends_friend_id ON friends(friend_id);
CREATE INDEX idx_friends_status ON friends(status);
CREATE INDEX idx_friends_created_at ON friends(created_at DESC);

-- Conversations table indexes
CREATE INDEX idx_conversations_user1_id ON conversations(user1_id);
CREATE INDEX idx_conversations_user2_id ON conversations(user2_id);
CREATE INDEX idx_conversations_users ON conversations(user1_id, user2_id);
CREATE INDEX idx_conversations_last_message_at ON conversations(last_message_at DESC);

-- Messages table indexes
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_messages_not_deleted ON messages(is_deleted) WHERE is_deleted = false;

-- Users table indexes for new fields
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_is_online ON users(is_online);
CREATE INDEX idx_users_last_seen ON users(last_seen DESC);

-- Step 6: Enable Row Level Security (RLS)
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Step 7: Create RLS policies for friends table
CREATE POLICY "Users can view their friend relationships" ON friends
    FOR SELECT 
    USING (
        auth.uid()::INTEGER = user_id OR 
        auth.uid()::INTEGER = friend_id
    );

CREATE POLICY "Users can create friend requests" ON friends
    FOR INSERT 
    WITH CHECK (auth.uid()::INTEGER = user_id);

CREATE POLICY "Users can update friend status" ON friends
    FOR UPDATE 
    USING (
        auth.uid()::INTEGER = user_id OR 
        auth.uid()::INTEGER = friend_id
    )
    WITH CHECK (
        auth.uid()::INTEGER = user_id OR 
        auth.uid()::INTEGER = friend_id
    );

CREATE POLICY "Users can delete their friend relationships" ON friends
    FOR DELETE 
    USING (
        auth.uid()::INTEGER = user_id OR 
        auth.uid()::INTEGER = friend_id
    );

-- Step 8: Create RLS policies for conversations table
CREATE POLICY "Users can view their conversations" ON conversations
    FOR SELECT 
    USING (
        auth.uid()::INTEGER = user1_id OR 
        auth.uid()::INTEGER = user2_id
    );

CREATE POLICY "Users can create conversations" ON conversations
    FOR INSERT 
    WITH CHECK (
        auth.uid()::INTEGER = user1_id OR 
        auth.uid()::INTEGER = user2_id
    );

CREATE POLICY "Users can update their conversations" ON conversations
    FOR UPDATE 
    USING (
        auth.uid()::INTEGER = user1_id OR 
        auth.uid()::INTEGER = user2_id
    )
    WITH CHECK (
        auth.uid()::INTEGER = user1_id OR 
        auth.uid()::INTEGER = user2_id
    );

-- Step 9: Create RLS policies for messages table
CREATE POLICY "Users can view messages in their conversations" ON messages
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM conversations c
            WHERE c.id = messages.conversation_id
            AND (c.user1_id = auth.uid()::INTEGER OR c.user2_id = auth.uid()::INTEGER)
        )
    );

CREATE POLICY "Users can send messages to their conversations" ON messages
    FOR INSERT 
    WITH CHECK (
        auth.uid()::INTEGER = sender_id AND
        EXISTS (
            SELECT 1 FROM conversations c
            WHERE c.id = messages.conversation_id
            AND (c.user1_id = auth.uid()::INTEGER OR c.user2_id = auth.uid()::INTEGER)
        )
    );

CREATE POLICY "Users can update their own messages" ON messages
    FOR UPDATE 
    USING (auth.uid()::INTEGER = sender_id)
    WITH CHECK (auth.uid()::INTEGER = sender_id);

CREATE POLICY "Users can delete their own messages" ON messages
    FOR DELETE 
    USING (auth.uid()::INTEGER = sender_id);

-- Step 10: Create trigger functions for automatic timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_friends_updated_at 
    BEFORE UPDATE ON friends 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at 
    BEFORE UPDATE ON messages 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Step 11: Create function to automatically create conversation
CREATE OR REPLACE FUNCTION create_conversation_if_not_exists(p_user1_id INTEGER, p_user2_id INTEGER)
RETURNS UUID AS $$
DECLARE
    v_conversation_id UUID;
    v_min_user_id INTEGER;
    v_max_user_id INTEGER;
BEGIN
    -- Ensure user1_id is always the smaller ID for consistency
    IF p_user1_id < p_user2_id THEN
        v_min_user_id := p_user1_id;
        v_max_user_id := p_user2_id;
    ELSE
        v_min_user_id := p_user2_id;
        v_max_user_id := p_user1_id;
    END IF;
    
    -- Try to find existing conversation
    SELECT id INTO v_conversation_id
    FROM conversations
    WHERE user1_id = v_min_user_id AND user2_id = v_max_user_id;
    
    -- If no conversation exists, create one
    IF v_conversation_id IS NULL THEN
        INSERT INTO conversations (user1_id, user2_id)
        VALUES (v_min_user_id, v_max_user_id)
        RETURNING id INTO v_conversation_id;
    END IF;
    
    RETURN v_conversation_id;
END;
$$ LANGUAGE plpgsql;

-- Step 12: Create trigger to update conversation last_message_at
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE conversations
    SET last_message_at = NEW.created_at
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_conversation_last_message_trigger
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_last_message();

-- Step 13: Create views for common queries
CREATE VIEW friends_with_users AS
SELECT 
    f.*,
    u1.username as user_username,
    u1.display_name as user_display_name,
    u1.avatar_emoji as user_avatar_emoji,
    u1.is_online as user_is_online,
    u2.username as friend_username,
    u2.display_name as friend_display_name,
    u2.avatar_emoji as friend_avatar_emoji,
    u2.is_online as friend_is_online
FROM friends f
JOIN users u1 ON f.user_id = u1.id
JOIN users u2 ON f.friend_id = u2.id;

CREATE VIEW conversations_with_users AS
SELECT 
    c.*,
    u1.username as user1_username,
    u1.display_name as user1_display_name,
    u1.avatar_emoji as user1_avatar_emoji,
    u1.is_online as user1_is_online,
    u2.username as user2_username,
    u2.display_name as user2_display_name,
    u2.avatar_emoji as user2_avatar_emoji,
    u2.is_online as user2_is_online
FROM conversations c
JOIN users u1 ON c.user1_id = u1.id
JOIN users u2 ON c.user2_id = u2.id;

CREATE VIEW messages_with_sender AS
SELECT 
    m.*,
    u.username as sender_username,
    u.display_name as sender_display_name,
    u.avatar_emoji as sender_avatar_emoji
FROM messages m
JOIN users u ON m.sender_id = u.id
WHERE m.is_deleted = false;

-- Migration completed successfully
COMMENT ON TABLE friends IS 'Friend relationships between users with status tracking';
COMMENT ON TABLE conversations IS 'One-on-one chat conversations between users';
COMMENT ON TABLE messages IS 'Individual chat messages within conversations';
COMMENT ON COLUMN friends.status IS 'Friend status: pending, accepted, rejected, blocked';
COMMENT ON COLUMN messages.message_type IS 'Message type: text, emoji, image, audio';