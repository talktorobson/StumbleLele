import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from './lib/storage';
import { leleAI, type AIModel } from './lib/ai';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { userId, message } = req.body;
    
    if (!userId || !message) {
      return res.status(400).json({ message: "userId e message são obrigatórios" });
    }

    // Get user preferences (create user if doesn't exist)
    const user = await storage.getOrCreateUser(userId);
    const aiModel = (user?.preferredAI || "xai") as AIModel;

    // Get conversation history for context
    const conversations = await storage.getConversations(userId);
    const context = conversations.slice(-5).map(c => `${c.message} -> ${c.response}`);
    
    // Generate AI response
    const aiResponse = await leleAI.generateResponse(message, context, aiModel);
    
    // Save conversation
    const conversation = await storage.createConversation({
      userId,
      message,
      response: aiResponse.response
    });
    
    // Update avatar state
    await storage.updateAvatarState(userId, aiResponse.emotion, aiResponse.personality);
    
    // Create memory if significant
    if (message.length > 20) {
      const memoryContent = await leleAI.createMemory(
        `${message} -> ${aiResponse.response}`,
        "conversa",
        aiModel
      );
      await storage.createMemory({
        userId,
        content: memoryContent,
        category: "conversa"
      });
    }
    
    res.json({
      conversation,
      avatarState: {
        emotion: aiResponse.emotion,
        personality: aiResponse.personality
      },
      suggestedActions: aiResponse.suggestedActions
    });
    
  } catch (error) {
    console.error("Erro no chat:", error);
    res.status(500).json({ message: "Erro ao processar mensagem" });
  }
}