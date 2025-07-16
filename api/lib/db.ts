import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "../../shared/schema";

// Configure for Supabase/Neon compatibility
neonConfig.webSocketConstructor = ws;

// Support both Supabase and Neon database URLs
const connectionString = process.env.DATABASE_URL || process.env.SUPABASE_DATABASE_URL;

export const pool = new Pool({ 
  connectionString,
  // Additional config for Supabase
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

export const db = drizzle({ client: pool, schema });