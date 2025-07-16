import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../../server/storage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { userId } = req.query;
  const userIdInt = parseInt(userId as string);

  if (req.method === 'GET') {
    try {
      const avatarState = await storage.getAvatarState(userIdInt);
      if (!avatarState) {
        return res.status(404).json({ message: "Estado do avatar não encontrado" });
      }
      res.json(avatarState);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar estado do avatar" });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}