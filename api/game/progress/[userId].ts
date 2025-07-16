import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../../lib/storage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { userId } = req.query;
  const userIdInt = parseInt(userId as string);

  if (req.method === 'GET') {
    try {
      const gameProgress = await storage.getGameProgress(userIdInt);
      res.json(gameProgress);
    } catch (error) {
      console.error('Error fetching game progress:', error);
      res.status(500).json({ message: "Erro ao buscar progresso do jogo" });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}