import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../lib/storage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;
  const userId = parseInt(id as string);

  if (req.method === 'GET') {
    try {
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar usuário" });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}