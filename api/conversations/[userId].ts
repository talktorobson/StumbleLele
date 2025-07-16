import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../lib/storage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { userId } = req.query;
  const userIdInt = parseInt(userId as string);

  if (req.method === 'GET') {
    try {
      const conversations = await storage.getConversations(userIdInt);
      res.json(conversations);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar conversas" });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}