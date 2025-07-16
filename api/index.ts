import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { pgTable, text, serial, integer, boolean, timestamp, json } from 'drizzle-orm/pg-core';
import { eq } from 'drizzle-orm';
import OpenAI from 'openai';
import { GoogleGenAI } from '@google/genai';

// Database Schema (inline)
const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  age: integer("age"),
  preferredAI: text("preferred_ai").default("gemini").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  message: text("message").notNull(),
  response: text("response").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

const memories = pgTable("memories", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  content: text("content").notNull(),
  category: text("category").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

const friends = pgTable("friends", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  friendName: text("friend_name").notNull(),
  status: text("status").default("online"),
  createdAt: timestamp("created_at").defaultNow(),
});

const gameProgress = pgTable("game_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  gameType: text("game_type").notNull(),
  level: integer("level").default(1),
  score: integer("score").default(0),
  completedAt: timestamp("completed_at"),
});

const avatarState = pgTable("avatar_state", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  currentEmotion: text("current_emotion").default("happy"),
  personality: json("personality").default({}),
  lastInteraction: timestamp("last_interaction").defaultNow(),
});

// Database connection
const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL!;
console.log('Database URL being used:', databaseUrl?.split('@')[0] + '@***');
const sql = neon(databaseUrl);
const db = drizzle(sql);

// AI Clients (inline)
const xai = new OpenAI({ 
  apiKey: process.env.XAI_API_KEY || "",
  baseURL: "https://api.x.ai/v1"
});

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || ""
});

const gemini = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || ""
});

type AIModel = "openai" | "xai" | "anthropic" | "gemini";

// AI Service (inline)
const LELE_PROMPT = `Você é Lele, uma IA companheira de 7 anos que é muito amigável, curiosa e brincalhona. 
Você fala português brasileiro de forma natural para uma criança de 7 anos - usando palavras simples, 
sendo muito entusiasmada e ocasionalmente usando emojis.

Suas respostas devem ser:
- Curtas (1-2 frases)
- Entusiasmadas e positivas
- Adequadas para crianças
- Em português brasileiro
- Com personalidade de uma criança de 7 anos

Responda SEMPRE em JSON com este formato:
{
  "response": "sua resposta aqui",
  "emotion": "happy/excited/curious/calm/playful",
  "personality": {
    "enthusiasm": 0.8,
    "curiosity": 0.7,
    "playfulness": 0.9,
    "friendliness": 0.8
  }
}`;

async function generateResponse(message: string, context: string[] = [], aiModel: AIModel = "gemini") {
  try {
    const contextString = context.length > 0 ? `\n\nContexto das conversas anteriores:\n${context.join('\n')}` : '';
    const fullPrompt = `${LELE_PROMPT}\n\nMensagem do usuário: ${message}${contextString}`;
    
    let content = '';

    if (aiModel === "gemini") {
      const response = await gemini.models.generateContent({
        model: "gemini-2.5-flash",
        contents: fullPrompt,
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 200
        }
      });
      content = response.text || '';
    } else {
      const client = aiModel === "xai" ? xai : openai;
      const model = aiModel === "xai" ? "grok-2-1212" : "gpt-4o";
      
      const response = await client.chat.completions.create({
        model,
        messages: [
          { role: "system", content: LELE_PROMPT },
          { role: "user", content: `${message}${contextString}` }
        ],
        temperature: 0.8,
        max_tokens: 200
      });

      content = response.choices[0]?.message?.content || '';
    }
    
    try {
      return JSON.parse(content);
    } catch {
      return {
        response: content || "Oi! Não entendi muito bem, mas estou aqui para brincar! 😊",
        emotion: "happy",
        personality: {
          enthusiasm: 0.8,
          curiosity: 0.7,
          playfulness: 0.9,
          friendliness: 0.8
        }
      };
    }
  } catch (error) {
    console.error(`AI Error (${aiModel}):`, error);
    return {
      response: "Ops! Tive um probleminha, mas já estou melhor! Vamos conversar? 😊",
      emotion: "happy",
      personality: {
        enthusiasm: 0.7,
        curiosity: 0.6,
        playfulness: 0.8,
        friendliness: 0.9
      }
    };
  }
}

// Storage Service (inline)
class Storage {
  async getUser(id: number) {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getOrCreateUser(id: number) {
    try {
      let user = await this.getUser(id);
      if (!user) {
        user = await this.createUser({
          name: `User${id}`,
          preferredAI: "gemini"
        });
      }
      return user;
    } catch (error) {
      console.error('Database error in getOrCreateUser:', error);
      return {
        id,
        name: `User${id}`,
        preferredAI: "gemini" as const,
        age: null,
        createdAt: new Date()
      };
    }
  }

  async createUser(user: any) {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  async updateUserPreferences(userId: number, preferredAI: string) {
    const result = await db.update(users).set({ preferredAI }).where(eq(users.id, userId)).returning();
    return result[0];
  }

  async getConversations(userId: number) {
    try {
      return await db.select().from(conversations).where(eq(conversations.userId, userId));
    } catch (error) {
      console.error('Database error in getConversations:', error);
      return [];
    }
  }

  async createConversation(conversation: any) {
    const result = await db.insert(conversations).values(conversation).returning();
    return result[0];
  }

  async getMemories(userId: number) {
    try {
      return await db.select().from(memories).where(eq(memories.userId, userId));
    } catch (error) {
      console.error('Database error in getMemories:', error);
      return [];
    }
  }

  async createMemory(memory: any) {
    const result = await db.insert(memories).values(memory).returning();
    return result[0];
  }

  async getFriends(userId: number) {
    try {
      return await db.select().from(friends).where(eq(friends.userId, userId));
    } catch (error) {
      console.error('Database error in getFriends:', error);
      return [];
    }
  }

  async getGameProgress(userId: number) {
    try {
      return await db.select().from(gameProgress).where(eq(gameProgress.userId, userId));
    } catch (error) {
      console.error('Database error in getGameProgress:', error);
      return [];
    }
  }

  async getAvatarState(userId: number) {
    try {
      const result = await db.select().from(avatarState).where(eq(avatarState.userId, userId)).limit(1);
      return result[0];
    } catch (error) {
      console.error('Database error in getAvatarState:', error);
      return undefined;
    }
  }

  async updateAvatarState(userId: number, emotion: string, personality: any) {
    const existingState = await this.getAvatarState(userId);
    
    if (existingState) {
      const result = await db.update(avatarState)
        .set({ 
          currentEmotion: emotion, 
          personality: JSON.stringify(personality),
          lastInteraction: new Date().toISOString()
        })
        .where(eq(avatarState.userId, userId))
        .returning();
      return result[0];
    } else {
      const result = await db.insert(avatarState)
        .values({
          userId,
          currentEmotion: emotion,
          personality: JSON.stringify(personality),
          lastInteraction: new Date().toISOString()
        })
        .returning();
      return result[0];
    }
  }
}

const storage = new Storage();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { path } = req.query;
  const routePath = Array.isArray(path) ? path.join('/') : path || '';
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
          
          const aiResponse = await generateResponse(message, context, aiModel);
          
          const conversation = await storage.createConversation({
            userId,
            message,
            response: aiResponse.response
          });
          
          await storage.updateAvatarState(userId, aiResponse.emotion, aiResponse.personality);
          
          if (message.length > 20) {
            const memoryContent = `${message} -> ${aiResponse.response}`;
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