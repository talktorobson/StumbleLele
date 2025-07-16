import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../../lib/storage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query;
  const userId = parseInt(id as string);

  try {
    if (req.method === 'POST') {
      const { aiModel } = req.body;
      
      if (!aiModel) {
        return res.status(400).json({ message: "aiModel é obrigatório" });
      }
      
      const updatedUser = await storage.updateUserPreferences(userId, aiModel);
      return res.json(updatedUser);
    }

    res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('AI Model API Error:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : String(error)
    });
  }
}