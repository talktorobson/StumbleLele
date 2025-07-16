import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../lib/storage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { userId } = req.query;
  const parsedUserId = parseInt(userId as string);

  try {
    if (req.method === 'GET') {
      const avatarState = await storage.getAvatarState(parsedUserId);
      if (!avatarState) {
        return res.status(404).json({ message: "Estado do avatar não encontrado" });
      }
      return res.json(avatarState);
    }

    res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Avatar API Error:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : String(error)
    });
  }
}