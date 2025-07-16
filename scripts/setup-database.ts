import 'dotenv/config';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import { migrate } from 'drizzle-orm/neon-serverless/migrator';
import * as schema from '../shared/schema';

async function setupDatabase() {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.error('DATABASE_URL is required');
    process.exit(1);
  }

  console.log('Setting up database...');

  try {
    const pool = new Pool({ connectionString });
    const db = drizzle({ client: pool, schema });

    // Run migrations if they exist
    try {
      await migrate(db, { migrationsFolder: './migrations' });
      console.log('✅ Database migrations completed successfully');
    } catch (error) {
      console.log('ℹ️  No migrations found, creating tables directly...');
      
      // Create tables manually if no migrations exist
      await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          age INTEGER,
          preferred_ai TEXT DEFAULT 'openai' NOT NULL,
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
      
      console.log('✅ Database tables created successfully');
    }

    // Insert default data if needed
    const existingUsers = await db.select().from(schema.users);
    if (existingUsers.length === 0) {
      await db.insert(schema.users).values({
        name: 'Lele',
        age: 7,
        preferredAI: 'openai'
      });
      console.log('✅ Default user data inserted');
    }

    console.log('🚀 Database setup completed successfully');
    
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