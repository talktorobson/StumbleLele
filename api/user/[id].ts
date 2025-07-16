import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../lib/storage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;
  const userId = parseInt(id as string);

  if (req.method === 'GET') {
    try {
      const user = await storage.getOrCreateUser(userId);
      res.json(user);
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ 
        message: "Erro ao buscar usuário",
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}