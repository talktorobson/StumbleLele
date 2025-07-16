import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from './lib/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    // Test database connection
    const result = await db.execute('SELECT 1 as test');
    
    res.json({ 
      success: true, 
      message: "Database connection successful",
      result: result,
      env: {
        DATABASE_URL: process.env.DATABASE_URL ? 'Set' : 'Not set',
        NODE_ENV: process.env.NODE_ENV
      }
    });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ 
      success: false,
      message: "Database connection failed",
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      env: {
        DATABASE_URL: process.env.DATABASE_URL ? 'Set' : 'Not set',
        NODE_ENV: process.env.NODE_ENV
      }
    });
  }
}