import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from './lib/storage';
import { leleAI, type AIModel } from './lib/ai';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'POST') {
      const { userId, message } = req.body;
      
      if (!userId || !message) {
        return res.status(400).json({ message: "userId e message são obrigatórios" });
      }

      const user = await storage.getOrCreateUser(userId);
      const aiModel = (user?.preferredAI || "gemini") as AIModel;
      const conversations = await storage.getConversations(userId);
      const context = conversations.slice(-5).map(c => `${c.message} -> ${c.response}`);
      
      const aiResponse = await leleAI.generateResponse(message, context, aiModel);
      
      const conversation = await storage.createConversation({
        userId,
        message,
        response: aiResponse.response
      });
      
      await storage.updateAvatarState(userId, aiResponse.emotion, aiResponse.personality);
      
      if (message.length > 20) {
        const memoryContent = await leleAI.createMemory(
          `${message} -> ${aiResponse.response}`,
          "conversa"
        );
        await storage.createMemory({
          userId,
          content: memoryContent,
          category: "conversa"
        });
      }
      
      return res.json({
        conversation,
        avatarState: {
          emotion: aiResponse.emotion,
          personality: aiResponse.personality
        },
        suggestedActions: aiResponse.suggestedActions
      });
    }

    res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Chat API Error:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : String(error)
    });
  }
}