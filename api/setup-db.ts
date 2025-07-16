import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from '../shared/schema';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    return res.status(500).json({ 
      success: false, 
      message: 'DATABASE_URL not configured' 
    });
  }

  try {
    console.log('Starting database setup...');
    const pool = new Pool({ 
      connectionString,
      ssl: { rejectUnauthorized: false }
    });
    const db = drizzle({ client: pool, schema });

    // Create tables directly
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        age INTEGER,
        preferred_ai TEXT DEFAULT 'xai' NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS conversations (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        message TEXT NOT NULL,
        response TEXT NOT NULL,
        timestamp TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS memories (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        content TEXT NOT NULL,
        category TEXT NOT NULL,
        timestamp TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS friends (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        friend_name TEXT NOT NULL,
        status TEXT DEFAULT 'online',
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS game_progress (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        game_type TEXT NOT NULL,
        level INTEGER DEFAULT 1,
        score INTEGER DEFAULT 0,
        completed_at TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS avatar_state (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        current_emotion TEXT DEFAULT 'happy',
        personality JSONB DEFAULT '{}',
        last_interaction TIMESTAMP DEFAULT NOW()
      );
    `);
    
    console.log('Database tables created successfully');

    // Insert default user if none exist
    const existingUsers = await db.select().from(schema.users);
    if (existingUsers.length === 0) {
      await db.insert(schema.users).values({
        name: 'Default User',
        age: null,
        preferredAI: 'xai'
      });
      console.log('Default user data inserted');
    }

    await pool.end();

    res.json({ 
      success: true, 
      message: 'Database setup completed successfully',
      tablesCreated: [
        'users', 'conversations', 'memories', 
        'friends', 'game_progress', 'avatar_state'
      ],
      existingUsers: existingUsers.length
    });

  } catch (error) {
    console.error('Database setup failed:', error);
    res.status(500).json({ 
      success: false,
      message: 'Database setup failed',
      error: error instanceof Error ? error.message : String(error)
    });
  }
}