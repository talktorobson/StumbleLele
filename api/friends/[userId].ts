import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../lib/storage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { userId } = req.query;
  const userIdInt = parseInt(userId as string);

  if (req.method === 'GET') {
    try {
      const friends = await storage.getFriends(userIdInt);
      res.json(friends);
    } catch (error) {
      console.error('Error fetching friends:', error);
      res.status(500).json({ message: "Erro ao buscar amigos" });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}