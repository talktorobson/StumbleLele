import 'dotenv/config';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import { migrate } from 'drizzle-orm/neon-serverless/migrator';
import * as schema from '../shared/schema';
import { readFileSync } from 'fs';
import { join } from 'path';

async function setupDatabase() {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.error('DATABASE_URL is required');
    process.exit(1);
  }

  console.log('Setting up StumbleLele Friends Chat System database...');

  try {
    const pool = new Pool({ connectionString });
    const db = drizzle({ client: pool, schema });

    // Run migrations if they exist
    try {
      await migrate(db, { migrationsFolder: './migrations' });
      console.log('✅ Database migrations completed successfully');
    } catch (error) {
      console.log('ℹ️  No migrations found, running SQL scripts directly...');
      
      // Run the friends chat system migration script
      try {
        const migrationPath = join(__dirname, '..', 'migrations', '0001_friends_chat_system.sql');
        const migrationSQL = readFileSync(migrationPath, 'utf8');
        await pool.query(migrationSQL);
        console.log('✅ Friends chat system schema created successfully');
      } catch (migrationError) {
        console.log('ℹ️  Migration file not found, creating basic schema...');
        
        // Basic schema creation as fallback
        await pool.query(`
          -- Enable UUID extension
          CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
          
          -- Enhanced users table
          CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            age INTEGER,
            preferred_ai TEXT DEFAULT 'gemini' NOT NULL,
            username VARCHAR(50) UNIQUE NOT NULL DEFAULT 'user_' || nextval('users_id_seq'::regclass),
            display_name VARCHAR(100),
            avatar_emoji VARCHAR(10) DEFAULT '😊',
            is_online BOOLEAN DEFAULT false,
            last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            created_at TIMESTAMP DEFAULT NOW()
          );

          -- AI conversations table (renamed from conversations)
          CREATE TABLE IF NOT EXISTS ai_conversations (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id),
            message TEXT NOT NULL,
            response TEXT NOT NULL,
            timestamp TIMESTAMP DEFAULT NOW()
          );

          -- Memories table
          CREATE TABLE IF NOT EXISTS memories (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id),
            content TEXT NOT NULL,
            category TEXT NOT NULL,
            timestamp TIMESTAMP DEFAULT NOW()
          );

          -- Friends table with proper relationships
          CREATE TABLE IF NOT EXISTS friends (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            friend_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            status VARCHAR(20) DEFAULT 'pending' NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(user_id, friend_id),
            CHECK (user_id != friend_id)
          );

          -- Conversations table for 1-on-1 chats
          CREATE TABLE IF NOT EXISTS conversations (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user1_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            user2_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            last_message_at TIMESTAMP WITH TIME ZONE,
            is_active BOOLEAN DEFAULT true,
            UNIQUE(user1_id, user2_id),
            CHECK (user1_id != user2_id)
          );

          -- Messages table
          CREATE TABLE IF NOT EXISTS messages (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
            sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            content TEXT NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            is_deleted BOOLEAN DEFAULT false,
            message_type VARCHAR(20) DEFAULT 'text'
          );

          -- Game progress table
          CREATE TABLE IF NOT EXISTS game_progress (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id),
            game_type TEXT NOT NULL,
            level INTEGER DEFAULT 1,
            score INTEGER DEFAULT 0,
            completed_at TIMESTAMP
          );

          -- Avatar state table
          CREATE TABLE IF NOT EXISTS avatar_state (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id),
            current_emotion TEXT DEFAULT 'happy',
            personality JSONB DEFAULT '{}',
            last_interaction TIMESTAMP DEFAULT NOW()
          );

          -- Create basic indexes
          CREATE INDEX IF NOT EXISTS idx_friends_user_id ON friends(user_id);
          CREATE INDEX IF NOT EXISTS idx_friends_friend_id ON friends(friend_id);
          CREATE INDEX IF NOT EXISTS idx_conversations_users ON conversations(user1_id, user2_id);
          CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
          CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
        `);
        
        console.log('✅ Basic database schema created successfully');
      }
    }

    // Insert default data if needed
    const existingUsers = await db.select().from(schema.users);
    if (existingUsers.length === 0) {
      await db.insert(schema.users).values({
        name: 'Lele',
        age: 7,
        preferredAI: 'gemini',
        username: 'lele',
        displayName: 'Lele AI',
        avatarEmoji: '🤖',
        isOnline: true
      });
      console.log('✅ Default user data inserted');
    }

    // Optionally run test data if in development
    if (process.env.NODE_ENV === 'development') {
      try {
        const testDataPath = join(__dirname, '..', 'migrations', '0002_test_data.sql');
        const testDataSQL = readFileSync(testDataPath, 'utf8');
        await pool.query(testDataSQL);
        console.log('✅ Test data inserted for development');
      } catch (testError) {
        console.log('ℹ️  Test data script not found, skipping...');
      }
    }

    console.log('🚀 StumbleLele Friends Chat System database setup completed successfully');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupDatabase();
}

export default setupDatabase;