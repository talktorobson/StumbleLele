import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { GoogleGenAI } from '@google/genai';

// Supabase client connection
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
console.log('Supabase URL:', supabaseUrl);
console.log('Service role key present:', !!supabaseKey);

const supabase = createClient(supabaseUrl, supabaseKey);

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

// Storage Service (Supabase)
class Storage {
  async getUser(id: number) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Database error in getUser:', error);
      return null;
    }
  }

  async getOrCreateUser(id: number) {
    try {
      let user = await this.getUser(id);
      if (!user) {
        user = await this.createUser({
          id,
          name: `User${id}`,
          preferred_ai: "gemini"
        });
      }
      return user;
    } catch (error) {
      console.error('Database error in getOrCreateUser:', error);
      return {
        id,
        name: `User${id}`,
        preferred_ai: "gemini" as const,
        age: null,
        created_at: new Date().toISOString()
      };
    }
  }

  async createUser(user: any) {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert(user)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Database error in createUser:', error);
      throw error;
    }
  }

  async updateUserPreferences(userId: number, preferredAI: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({ preferred_ai: preferredAI })
        .eq('id', userId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Database error in updateUserPreferences:', error);
      throw error;
    }
  }

  async getConversations(userId: number) {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Database error in getConversations:', error);
      return [];
    }
  }

  async createConversation(conversation: any) {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          user_id: conversation.userId,
          message: conversation.message,
          response: conversation.response
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Database error in createConversation:', error);
      throw error;
    }
  }

  async getMemories(userId: number) {
    try {
      const { data, error } = await supabase
        .from('memories')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Database error in getMemories:', error);
      return [];
    }
  }

  async createMemory(memory: any) {
    try {
      const { data, error } = await supabase
        .from('memories')
        .insert({
          user_id: memory.userId,
          content: memory.content,
          category: memory.category
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Database error in createMemory:', error);
      throw error;
    }
  }

  async getFriends(userId: number) {
    try {
      const { data, error } = await supabase
        .from('friends')
        .select('*')
        .eq('user_id', userId);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Database error in getFriends:', error);
      return [];
    }
  }

  async getGameProgress(userId: number) {
    try {
      const { data, error } = await supabase
        .from('game_progress')
        .select('*')
        .eq('user_id', userId);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Database error in getGameProgress:', error);
      return [];
    }
  }

  async getAvatarState(userId: number) {
    try {
      const { data, error } = await supabase
        .from('avatar_state')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "not found"
      return data;
    } catch (error) {
      console.error('Database error in getAvatarState:', error);
      return undefined;
    }
  }

  async updateAvatarState(userId: number, emotion: string, personality: any) {
    try {
      // Try to update first
      const { data, error } = await supabase
        .from('avatar_state')
        .update({
          current_emotion: emotion,
          personality: personality,
          last_interaction: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single();
      
      if (error && error.code === 'PGRST116') {
        // Record doesn't exist, create it
        const { data: insertData, error: insertError } = await supabase
          .from('avatar_state')
          .insert({
            user_id: userId,
            current_emotion: emotion,
            personality: personality,
            last_interaction: new Date().toISOString()
          })
          .select()
          .single();
        
        if (insertError) throw insertError;
        return insertData;
      }
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Database error in updateAvatarState:', error);
      throw error;
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
          const aiModel = (user?.preferred_ai || "gemini") as AIModel;
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