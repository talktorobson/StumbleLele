import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from './lib/storage';
import { leleAI, type AIModel } from './lib/ai';
import { db } from './lib/db';
import * as schema from '../shared/schema';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { route } = req.query;
  const routePath = Array.isArray(route) ? route.join('/') : route || '';

  // Parse route and parameters
  const parts = routePath.split('/').filter(Boolean);
  
  console.log('API Route:', routePath, 'Parts:', parts, 'Method:', req.method);
  
  try {
    // Handle different routes
    switch (parts[0]) {
      case 'user':
        if (parts[1] && req.method === 'GET') {
          const userId = parseInt(parts[1]);
          const user = await storage.getOrCreateUser(userId);
          return res.json(user);
        }
        if (parts[1] && parts[2] === 'ai-model' && req.method === 'POST') {
          const userId = parseInt(parts[1]);
          const { aiModel } = req.body;
          
          if (!aiModel) {
            return res.status(400).json({ message: "aiModel é obrigatório" });
          }
          
          const updatedUser = await storage.updateUserPreferences(userId, aiModel);
          return res.json(updatedUser);
        }
        break;

      case 'chat':
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
        break;

      case 'conversations':
        if (parts[1] && req.method === 'GET') {
          const userId = parseInt(parts[1]);
          const conversations = await storage.getConversations(userId);
          return res.json(conversations);
        }
        break;

      case 'avatar':
        if (parts[1] && req.method === 'GET') {
          const userId = parseInt(parts[1]);
          const avatarState = await storage.getAvatarState(userId);
          if (!avatarState) {
            return res.status(404).json({ message: "Estado do avatar não encontrado" });
          }
          return res.json(avatarState);
        }
        break;

      case 'friends':
        if (parts[1] && req.method === 'GET') {
          const userId = parseInt(parts[1]);
          const friends = await storage.getFriends(userId);
          return res.json(friends);
        }
        break;

      case 'memories':
        if (parts[1] && req.method === 'GET') {
          const userId = parseInt(parts[1]);
          const memories = await storage.getMemories(userId);
          return res.json(memories);
        }
        break;

      case 'game':
        if (parts[1] === 'progress' && parts[2] && req.method === 'GET') {
          const userId = parseInt(parts[2]);
          const gameProgress = await storage.getGameProgress(userId);
          return res.json(gameProgress);
        }
        if (parts[1] === 'progressions' && parts[2] && req.method === 'GET') {
          const userId = parseInt(parts[2]);
          const progressions = await storage.getGameProgress(userId);
          return res.json(progressions || []);
        }
        break;

      case 'init':
        if (req.method === 'POST') {
          const result = await db.execute('SELECT 1 as test');
          return res.json({ 
            success: true, 
            message: "Database connection successful",
            result: result,
            env: {
              DATABASE_URL: process.env.DATABASE_URL ? 'Set' : 'Not set',
              NODE_ENV: process.env.NODE_ENV
            }
          });
        }
        break;

      case 'setup-db':
        if (req.method === 'POST') {
          // Database setup logic here
          return res.json({ 
            success: true, 
            message: 'Database already set up via local script' 
          });
        }
        break;
    }

    // If no route matched
    res.status(404).json({ message: 'Endpoint not found' });

  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : String(error)
    });
  }
}