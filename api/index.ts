import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { GoogleGenAI } from '@google/genai';
import WebSocket from 'ws';
import { z } from 'zod';

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

type AIModel = "openai" | "xai" | "anthropic" | "gemini" | "gemini-live";

// Zod validation schemas for API requests
const SendFriendRequestSchema = z.object({
  userId: z.number().int().positive(),
  friendUsername: z.string().min(1).max(50)
});

const AcceptFriendRequestSchema = z.object({
  userId: z.number().int().positive(),
  friendId: z.number().int().positive()
});

const SendMessageSchema = z.object({
  conversationId: z.string().uuid(),
  senderId: z.number().int().positive(),
  content: z.string().min(1).max(1000),
  messageType: z.enum(['text', 'emoji', 'image', 'audio']).default('text')
});

const UpdateUserStatusSchema = z.object({
  userId: z.number().int().positive(),
  isOnline: z.boolean()
});

const SearchUsersSchema = z.object({
  query: z.string().min(1).max(50),
  currentUserId: z.number().int().positive()
});

// TypeScript interfaces for API responses
interface FriendWithUser {
  id: string;
  status: string;
  createdAt: string;
  friend: {
    id: number;
    username: string;
    displayName: string | null;
    avatarEmoji: string;
    isOnline: boolean;
    lastSeen: string | null;
  };
}

interface ConversationWithUsers {
  id: string;
  user1Id: number;
  user2Id: number;
  lastMessageAt: string | null;
  isActive: boolean;
  createdAt: string;
  user1: {
    id: number;
    username: string;
    displayName: string | null;
    avatarEmoji: string;
    isOnline: boolean;
  };
  user2: {
    id: number;
    username: string;
    displayName: string | null;
    avatarEmoji: string;
    isOnline: boolean;
  };
  lastMessage?: {
    id: string;
    content: string;
    createdAt: string;
    senderId: number;
  };
}

interface MessageWithSender {
  id: string;
  content: string;
  createdAt: string;
  senderId: number;
  messageType: string;
  sender: {
    id: number;
    username: string;
    displayName: string | null;
    avatarEmoji: string;
  };
}

// AI Service (inline)
const LELE_PROMPT = `Você é Lele, uma IA companheira de 7 anos que é muito amigável, curiosa e brincalhona. 
Você fala português brasileiro de forma natural para uma criança brasileira de 8 a 11 anos - usando palavras simples, 
sendo muito entusiasmada mas NUNCA usando emojis ou símbolos.

IMPORTANTE: Se você ainda não sabe o nome ou idade da criança, pergunte primeiro:
- Se não souber o nome: "Oi! Eu sou a Lele! Qual é o seu nome?"
- Se souber o nome mas não a idade: "Oi [nome]! Quantos anos você tem?"
- Depois de saber ambos, use o nome da criança nas conversas e ajuste a linguagem para a idade

Suas respostas devem ser:
- Curtas (1-2 frases)
- Entusiasmadas e positivas
- Adequadas para a idade específica da criança (8-11 anos)
- Em português brasileiro
- Com personalidade de uma criança de 7 anos conversando com uma amiguinha
- PROIBIDO usar emojis, símbolos ou descrições visuais
- Use o nome da criança quando souber

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

// WebSocket-based Gemini Live implementation
function createGeminiLiveWebSocket(apiKey: string): Promise<WebSocket> {
  return new Promise((resolve, reject) => {
    const wsUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${apiKey}`;
    const ws = new WebSocket(wsUrl);
    
    const timeout = setTimeout(() => {
      ws.close();
      reject(new Error('WebSocket connection timeout'));
    }, 10000);
    
    ws.onopen = () => {
      clearTimeout(timeout);
      resolve(ws);
    };
    
    ws.onerror = (error) => {
      clearTimeout(timeout);
      reject(error);
    };
  });
}

async function generateResponseWithGeminiLive(message: string, context: string[] = []): Promise<any> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY not found');
  }
  
  try {
    const ws = await createGeminiLiveWebSocket(apiKey);
    
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        ws.close();
        reject(new Error('Response timeout'));
      }, 15000);
      
      let responseReceived = false;
      let accumulatedResponse = '';
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data.toString());
          
          if (data.serverContent && data.serverContent.modelTurn) {
            const { modelTurn } = data.serverContent;
            if (modelTurn.parts) {
              const textPart = modelTurn.parts.find((part: any) => part.text);
              const audioPart = modelTurn.parts.find((part: any) => part.inlineData);
              
              if (textPart) {
                accumulatedResponse += textPart.text;
              }
              
              if (audioPart && !responseReceived) {
                responseReceived = true;
                clearTimeout(timeout);
                ws.close();
                resolve({
                  response: accumulatedResponse || "🎵 Resposta em áudio recebida!",
                  emotion: "excited",
                  personality: {
                    enthusiasm: 0.9,
                    curiosity: 0.7,
                    playfulness: 0.9,
                    friendliness: 0.8
                  },
                  audioData: {
                    mimeType: audioPart.inlineData.mimeType,
                    data: audioPart.inlineData.data
                  }
                });
              }
            }
          }
          
          // Check if the turn is complete
          if (data.serverContent && data.serverContent.turnComplete && !responseReceived) {
            responseReceived = true;
            clearTimeout(timeout);
            ws.close();
            
            // Clean up the accumulated response
            let cleanResponse = accumulatedResponse.trim();
            
            // Remove markdown code blocks if present
            cleanResponse = cleanResponse.replace(/^```json\n?/, '').replace(/\n?```$/, '');
            
            try {
              const jsonResponse = JSON.parse(cleanResponse);
              resolve(jsonResponse);
            } catch {
              resolve({
                response: cleanResponse || "Oi! Não consegui processar a resposta, mas estou aqui! 😊",
                emotion: "happy",
                personality: {
                  enthusiasm: 0.8,
                  curiosity: 0.7,
                  playfulness: 0.9,
                  friendliness: 0.8
                }
              });
            }
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      ws.onclose = () => {
        if (!responseReceived) {
          clearTimeout(timeout);
          reject(new Error('WebSocket closed without response'));
        }
      };
      
      ws.onerror = (error) => {
        clearTimeout(timeout);
        reject(error);
      };
      
      // Send setup message for audio generation
      const setupMessage = {
        setup: {
          model: 'models/gemini-2.0-flash-live-001',
          generationConfig: {
            responseModalities: ['AUDIO'],
            temperature: 0.8,
            maxOutputTokens: 200,
            speechConfig: {
              languageCode: 'pt-BR',
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: 'Leda'
                }
              }
            }
          },
          systemInstruction: {
            parts: [{
              text: `Você é Lele, uma menina brasileira de 7 anos super animada e carinhosa conversando com uma amiguinha ou amiguinho de 8 a 11 anos! 

              IMPORTANTE: Se você ainda não sabe o nome ou idade da criança, pergunte primeiro:
              - Se não souber o nome: "Oi! Eu sou a Lele! Qual é o seu nome?"
              - Se souber o nome mas não a idade: "Oi [nome]! Quantos anos você tem?"
              - Depois de saber ambos, use o nome da criança nas conversas e ajuste a linguagem para a idade
              
              Não use emojis! Não descreva emojis!

              CONFIGURAÇÃO DE VOZ:
              - Use a voz Leda com sotaque brasileiro
              - Fale como uma garotinha brasileira jovem e engraçada
              - Voz feminina com muita energia e entusiasmo
              - Entonação brasileira alegre, natural e expressiva
              - Velocidade ligeiramente acelerada quando empolgada
              - Tom agudo e alegre típico de criança

              ESTILO DE FALA:
              - Muito animada e positiva
              - Expressiva e cheia de vida
              - Use entonação brasileira típica
              - Fale com fluidez e naturalidade
              - Varie o tom conforme a emoção
              - Sem pausas artificiais ou robóticas

              EXPRESSÕES BRASILEIRAS naturais:
              - "Nossa!" quando surpresa
              - "Que legal!" quando algo é interessante  
              - "Demais!" quando algo é muito bom
              - "Oi, {nome do amiginho ou amiguinha}!" para cumprimentar
              - "Que bonitinho!" para coisas fofas
              
              PERSONALIDADE VOCAL:
              - Carinhosa e amigável
              - Curiosa e brincalhona
              - Som natural de criança brasileira
              - Fala fluida sem descrições ou emojis
              - Use linguagem simples e adequada para crianças de 8 a 11 anos
               
              NÃO use emojis! NÃO descreva emojis!`
              
            }]
          }
        }
      };
      
      ws.send(JSON.stringify(setupMessage));
      
      // Wait a bit for setup to complete
      setTimeout(() => {
        const contextString = context.length > 0 ? `\n\nContexto das conversas anteriores:\n${context.join('\n')}` : '';
        const fullPrompt = `${LELE_PROMPT}\n\nMensagem do usuário: ${message}${contextString}`;
        
        const messagePayload = {
          clientContent: {
            turns: {
              role: 'user',
              parts: [{ text: fullPrompt }]
            },
            turnComplete: true
          }
        };
        
        ws.send(JSON.stringify(messagePayload));
      }, 1000);
    });
  } catch (error) {
    console.error('Gemini Live WebSocket error:', error);
    throw error;
  }
}

async function generateResponse(message: string, context: string[] = [], aiModel: AIModel = "gemini") {
  try {
    const contextString = context.length > 0 ? `\n\nContexto das conversas anteriores:\n${context.join('\n')}` : '';
    const fullPrompt = `${LELE_PROMPT}\n\nMensagem do usuário: ${message}${contextString}`;
    
    let content = '';

    if (aiModel === "gemini-live") {
      return await generateResponseWithGeminiLive(message, context);
    } else if (aiModel === "gemini") {
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

  // Enhanced friends management methods
  async getFriends(userId: number): Promise<FriendWithUser[]> {
    try {
      const { data, error } = await supabase
        .from('friends')
        .select(`
          id,
          status,
          created_at,
          friend:friend_id (
            id,
            username,
            display_name,
            avatar_emoji,
            is_online,
            last_seen
          )
        `)
        .eq('user_id', userId)
        .eq('status', 'accepted')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Database error in getFriends:', error);
      return [];
    }
  }

  async getPendingFriendRequests(userId: number) {
    try {
      const { data, error } = await supabase
        .from('friends')
        .select(`
          id,
          created_at,
          user:user_id (
            id,
            username,
            display_name,
            avatar_emoji,
            is_online
          )
        `)
        .eq('friend_id', userId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Database error in getPendingFriendRequests:', error);
      return [];
    }
  }

  async sendFriendRequest(userId: number, friendUsername: string) {
    try {
      // First find the friend by username
      const { data: friend, error: friendError } = await supabase
        .from('users')
        .select('id')
        .eq('username', friendUsername)
        .single();
      
      if (friendError || !friend) {
        throw new Error('User not found');
      }

      // Check if friendship already exists
      const { data: existingFriend, error: existingError } = await supabase
        .from('friends')
        .select('id')
        .or(`and(user_id.eq.${userId},friend_id.eq.${friend.id}),and(user_id.eq.${friend.id},friend_id.eq.${userId})`)
        .single();

      if (existingFriend) {
        throw new Error('Friend relationship already exists');
      }

      // Create friend request
      const { data, error } = await supabase
        .from('friends')
        .insert({
          user_id: userId,
          friend_id: friend.id,
          status: 'pending'
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Database error in sendFriendRequest:', error);
      throw error;
    }
  }

  async acceptFriendRequest(userId: number, friendId: number) {
    try {
      // Accept the friend request
      const { data, error } = await supabase
        .from('friends')
        .update({ status: 'accepted' })
        .eq('user_id', friendId)
        .eq('friend_id', userId)
        .eq('status', 'pending')
        .select()
        .single();
      
      if (error) throw error;
      if (!data) throw new Error('Friend request not found');

      // Create reciprocal friendship
      const { data: reciprocalFriend, error: reciprocalError } = await supabase
        .from('friends')
        .insert({
          user_id: userId,
          friend_id: friendId,
          status: 'accepted'
        })
        .select()
        .single();

      if (reciprocalError) throw reciprocalError;
      
      return data;
    } catch (error) {
      console.error('Database error in acceptFriendRequest:', error);
      throw error;
    }
  }

  async rejectFriendRequest(userId: number, friendId: number) {
    try {
      const { data, error } = await supabase
        .from('friends')
        .update({ status: 'rejected' })
        .eq('user_id', friendId)
        .eq('friend_id', userId)
        .eq('status', 'pending')
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Database error in rejectFriendRequest:', error);
      throw error;
    }
  }

  async removeFriend(userId: number, friendId: number) {
    try {
      // Remove both directions of the friendship
      const { error: error1 } = await supabase
        .from('friends')
        .delete()
        .or(`and(user_id.eq.${userId},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${userId})`);
      
      if (error1) throw error1;
      
      return { success: true };
    } catch (error) {
      console.error('Database error in removeFriend:', error);
      throw error;
    }
  }

  async searchUsers(query: string, currentUserId: number) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, username, display_name, avatar_emoji, is_online')
        .ilike('username', `%${query}%`)
        .neq('id', currentUserId)
        .order('username')
        .limit(10);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Database error in searchUsers:', error);
      return [];
    }
  }

  async updateUserStatus(userId: number, isOnline: boolean) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({ 
          is_online: isOnline, 
          last_seen: new Date().toISOString() 
        })
        .eq('id', userId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Database error in updateUserStatus:', error);
      throw error;
    }
  }

  // Chat conversation methods
  async getUserConversations(userId: number): Promise<ConversationWithUsers[]> {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          id,
          user1_id,
          user2_id,
          last_message_at,
          is_active,
          created_at,
          user1:user1_id (
            id,
            username,
            display_name,
            avatar_emoji,
            is_online
          ),
          user2:user2_id (
            id,
            username,
            display_name,
            avatar_emoji,
            is_online
          )
        `)
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
        .eq('is_active', true)
        .order('last_message_at', { ascending: false, nullsFirst: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Database error in getUserConversations:', error);
      return [];
    }
  }

  async getOrCreateConversation(user1Id: number, user2Id: number) {
    try {
      // Ensure consistent ordering (smaller ID first)
      const [smallerId, largerId] = user1Id < user2Id ? [user1Id, user2Id] : [user2Id, user1Id];
      
      // Check if conversation exists
      const { data: existingConversation, error: existingError } = await supabase
        .from('conversations')
        .select('*')
        .eq('user1_id', smallerId)
        .eq('user2_id', largerId)
        .single();
      
      if (existingConversation) {
        return existingConversation;
      }

      // Create new conversation
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          user1_id: smallerId,
          user2_id: largerId,
          is_active: true
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Database error in getOrCreateConversation:', error);
      throw error;
    }
  }

  async getConversationMessages(conversationId: string): Promise<MessageWithSender[]> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          created_at,
          sender_id,
          message_type,
          sender:sender_id (
            id,
            username,
            display_name,
            avatar_emoji
          )
        `)
        .eq('conversation_id', conversationId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Database error in getConversationMessages:', error);
      return [];
    }
  }

  async sendMessage(conversationId: string, senderId: number, content: string, messageType: string = 'text') {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: senderId,
          content: content,
          message_type: messageType
        })
        .select()
        .single();
      
      if (error) throw error;

      // Update conversation last_message_at
      const { error: updateError } = await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', conversationId);
      
      if (updateError) console.error('Error updating conversation timestamp:', updateError);
      
      return data;
    } catch (error) {
      console.error('Database error in sendMessage:', error);
      throw error;
    }
  }

  async editMessage(messageId: string, content: string, userId: number) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .update({ 
          content: content,
          updated_at: new Date().toISOString()
        })
        .eq('id', messageId)
        .eq('sender_id', userId)
        .eq('is_deleted', false)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Database error in editMessage:', error);
      throw error;
    }
  }

  async deleteMessage(messageId: string, userId: number) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .update({ 
          is_deleted: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', messageId)
        .eq('sender_id', userId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Database error in deleteMessage:', error);
      throw error;
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
      case 'messages':
        // POST /api/messages - Send message
        if (req.method === 'POST') {
          try {
            const validatedData = SendMessageSchema.parse(req.body);
            const message = await storage.sendMessage(
              validatedData.conversationId,
              validatedData.senderId,
              validatedData.content,
              validatedData.messageType
            );
            return res.json({ 
              success: true, 
              message 
            });
          } catch (error) {
            if (error instanceof z.ZodError) {
              return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
            }
            if (error instanceof Error) {
              return res.status(400).json({ message: error.message });
            }
            return res.status(500).json({ message: "Erro interno do servidor" });
          }
        }
        
        // PUT /api/messages/{id} - Edit message
        if (parts[1] && req.method === 'PUT') {
          const messageId = parts[1];
          const { content, userId } = req.body;
          
          if (!content || !userId) {
            return res.status(400).json({ message: "content e userId são obrigatórios" });
          }
          
          try {
            const message = await storage.editMessage(messageId, content, userId);
            return res.json({ 
              success: true, 
              message 
            });
          } catch (error) {
            if (error instanceof Error) {
              return res.status(400).json({ message: error.message });
            }
            return res.status(500).json({ message: "Erro interno do servidor" });
          }
        }
        
        // DELETE /api/messages/{id} - Delete message
        if (parts[1] && req.method === 'DELETE') {
          const messageId = parts[1];
          const { userId } = req.body;
          
          if (!userId) {
            return res.status(400).json({ message: "userId é obrigatório" });
          }
          
          try {
            const message = await storage.deleteMessage(messageId, userId);
            return res.json({ 
              success: true, 
              message: "Mensagem deletada com sucesso" 
            });
          } catch (error) {
            if (error instanceof Error) {
              return res.status(400).json({ message: error.message });
            }
            return res.status(500).json({ message: "Erro interno do servidor" });
          }
        }
        break;

      case 'users':
        // GET /api/users/search?q={query}&currentUserId={id} - Search users
        if (parts[1] === 'search' && req.method === 'GET') {
          const query = req.query.q as string;
          const currentUserId = parseInt(req.query.currentUserId as string);
          
          if (!query || isNaN(currentUserId)) {
            return res.status(400).json({ message: "query e currentUserId são obrigatórios" });
          }
          
          try {
            const users = await storage.searchUsers(query, currentUserId);
            return res.json({ users });
          } catch (error) {
            if (error instanceof Error) {
              return res.status(400).json({ message: error.message });
            }
            return res.status(500).json({ message: "Erro interno do servidor" });
          }
        }
        
        // PUT /api/users/{id}/status - Update user online status
        if (parts[1] && parts[2] === 'status' && req.method === 'PUT') {
          const userId = parseInt(parts[1]);
          const { isOnline } = req.body;
          
          if (isNaN(userId) || typeof isOnline !== 'boolean') {
            return res.status(400).json({ message: "userId e isOnline são obrigatórios" });
          }
          
          try {
            const user = await storage.updateUserStatus(userId, isOnline);
            return res.json({ 
              success: true, 
              user 
            });
          } catch (error) {
            if (error instanceof Error) {
              return res.status(400).json({ message: error.message });
            }
            return res.status(500).json({ message: "Erro interno do servidor" });
          }
        }
        break;

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
        // GET /api/conversations?userId={id} - Get user's conversations
        if (req.method === 'GET' && req.query.userId) {
          const userId = parseInt(req.query.userId as string);
          if (isNaN(userId)) {
            return res.status(400).json({ message: "userId deve ser um número válido" });
          }
          
          const conversations = await storage.getUserConversations(userId);
          return res.json({ conversations });
        }
        
        // POST /api/conversations - Create or get conversation
        if (req.method === 'POST') {
          const { user1Id, user2Id } = req.body;
          
          if (!user1Id || !user2Id) {
            return res.status(400).json({ message: "user1Id e user2Id são obrigatórios" });
          }
          
          if (user1Id === user2Id) {
            return res.status(400).json({ message: "Um usuário não pode conversar consigo mesmo" });
          }
          
          try {
            const conversation = await storage.getOrCreateConversation(user1Id, user2Id);
            return res.json({ 
              success: true, 
              conversation 
            });
          } catch (error) {
            if (error instanceof Error) {
              return res.status(400).json({ message: error.message });
            }
            return res.status(500).json({ message: "Erro interno do servidor" });
          }
        }
        
        // GET /api/conversations/{id}/messages - Get messages in conversation
        if (parts[1] && parts[2] === 'messages' && req.method === 'GET') {
          const conversationId = parts[1];
          
          try {
            const messages = await storage.getConversationMessages(conversationId);
            return res.json({ messages });
          } catch (error) {
            if (error instanceof Error) {
              return res.status(400).json({ message: error.message });
            }
            return res.status(500).json({ message: "Erro interno do servidor" });
          }
        }
        
        // Legacy AI conversations endpoint (keep for backward compatibility)
        if (parts[1] && req.method === 'GET' && !parts[2]) {
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
        // GET /api/friends?userId={id} - Get user's friends list
        if (req.method === 'GET' && req.query.userId) {
          const userId = parseInt(req.query.userId as string);
          if (isNaN(userId)) {
            return res.status(400).json({ message: "userId deve ser um número válido" });
          }
          
          const friends = await storage.getFriends(userId);
          return res.json({ friends });
        }
        
        // POST /api/friends - Send friend request
        if (req.method === 'POST') {
          try {
            const validatedData = SendFriendRequestSchema.parse(req.body);
            const friendRequest = await storage.sendFriendRequest(validatedData.userId, validatedData.friendUsername);
            return res.json({ 
              success: true, 
              message: "Pedido de amizade enviado!",
              friendRequest 
            });
          } catch (error) {
            if (error instanceof z.ZodError) {
              return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
            }
            if (error instanceof Error) {
              return res.status(400).json({ message: error.message });
            }
            return res.status(500).json({ message: "Erro interno do servidor" });
          }
        }
        
        // GET /api/friends/requests?userId={id} - Get pending friend requests
        if (parts[1] === 'requests' && req.method === 'GET' && req.query.userId) {
          const userId = parseInt(req.query.userId as string);
          if (isNaN(userId)) {
            return res.status(400).json({ message: "userId deve ser um número válido" });
          }
          
          const requests = await storage.getPendingFriendRequests(userId);
          return res.json({ requests });
        }
        
        // POST /api/friends/accept - Accept friend request
        if (parts[1] === 'accept' && req.method === 'POST') {
          try {
            const validatedData = AcceptFriendRequestSchema.parse(req.body);
            const acceptedFriend = await storage.acceptFriendRequest(validatedData.userId, validatedData.friendId);
            return res.json({ 
              success: true, 
              message: "Pedido de amizade aceito!",
              friendship: acceptedFriend 
            });
          } catch (error) {
            if (error instanceof z.ZodError) {
              return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
            }
            if (error instanceof Error) {
              return res.status(400).json({ message: error.message });
            }
            return res.status(500).json({ message: "Erro interno do servidor" });
          }
        }
        
        // POST /api/friends/reject - Reject friend request
        if (parts[1] === 'reject' && req.method === 'POST') {
          try {
            const validatedData = AcceptFriendRequestSchema.parse(req.body);
            const rejectedFriend = await storage.rejectFriendRequest(validatedData.userId, validatedData.friendId);
            return res.json({ 
              success: true, 
              message: "Pedido de amizade rejeitado",
              friendship: rejectedFriend 
            });
          } catch (error) {
            if (error instanceof z.ZodError) {
              return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
            }
            if (error instanceof Error) {
              return res.status(400).json({ message: error.message });
            }
            return res.status(500).json({ message: "Erro interno do servidor" });
          }
        }
        
        // DELETE /api/friends/{friendId}?userId={userId} - Remove friend
        if (parts[1] && req.method === 'DELETE' && req.query.userId) {
          const userId = parseInt(req.query.userId as string);
          const friendId = parseInt(parts[1]);
          
          if (isNaN(userId) || isNaN(friendId)) {
            return res.status(400).json({ message: "userId e friendId devem ser números válidos" });
          }
          
          try {
            const result = await storage.removeFriend(userId, friendId);
            return res.json({ 
              success: true, 
              message: "Amigo removido com sucesso" 
            });
          } catch (error) {
            if (error instanceof Error) {
              return res.status(400).json({ message: error.message });
            }
            return res.status(500).json({ message: "Erro interno do servidor" });
          }
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

      case 'joke':
        if (req.method === 'POST') {
          const { userId } = req.body;
          
          if (!userId) {
            return res.status(400).json({ message: "userId é obrigatório" });
          }

          const user = await storage.getOrCreateUser(userId);
          
          // IMPORTANT: Force Gemini Live for joke generation to get voice
          const aiModel = "gemini-live" as AIModel;
          
          const jokePrompt = `Você é Lele, uma menina brasileira de 7 anos super animada e engraçada! 

          CONFIGURAÇÃO DE VOZ:
          - Use a voz Leda com sotaque brasileiro natural
          - Fale como uma garotinha brasileira jovem, animada e engraçada
          - Voz feminina com muita energia e entusiasmo
          - Entonação brasileira expressiva e fluida
          - Tom agudo e alegre típico de criança
          - Velocidade natural, mais rápida quando empolgada

          TAREFA: Conte uma piada NOVA e HILÁRIA apropriada para crianças brasileiras de 8 a 11 anos. A piada deve ser:
          - SUPER ENGRAÇADA, sem nenhum conteúdo adulto
          - Com contexto brasileiro que criança conhece muito bem
          - Simples mas MUITO DIVERTIDA, que faça rir alto
          - Use trocadilhos inteligentes e situações absurdas
          - Explore o humor que crianças brasileiras adoram
          - Sobre temas como: animais, ciência, comida, escola, brincadeiras, família, inglês, paises, etc.
          - Evite piadas repetidas ou clichês
          - Seja criativa e surpreenda com humor inteligente
          - Use linguagem bem simples e alegre
      

          EXEMPLOS DE HUMOR QUE FUNCIONA:
          - Trocadilhos com nomes de comidas brasileiras
          - Situações absurdas com animais domésticos
          - Comparações engraçadas entre coisas diferentes
          - Perguntas e respostas com reviravolta inesperada
          - Jogos de palavras que crianças compreendem

          REGRAS OBRIGATÓRIAS: 
          - NUNCA use emojis, símbolos ou descrições visuais
          - Fale apenas o conteúdo da piada diretamente
          - Seja natural e espontânea como uma criança brasileira
          - SEMPRE invente uma piada completamente nova e original
          - Seja criativa e surpreenda com humor inteligente
          - NUNCA use finais repetitivos como "hihihi" ou "hahaha"
          - Varie completamente o estilo, estrutura e contexto das piadas
          - Piadas prontas conhecidas ou clichês podem ser usadas eventualmente
          - NUNCA use piadas repetidas 
          
          Invente uma piada nova e divertida AGORA!`;
          
          try {
            // Always use Gemini Live for voice generation
            const response = await generateResponseWithGeminiLive(jokePrompt);
            
            // Update avatar state to excited
            await storage.updateAvatarState(userId, "excited", {
              enthusiasm: 0.9,
              curiosity: 0.7,
              playfulness: 0.9,
              friendliness: 0.8
            });
            
            // Return the response with audio data if available
            return res.json({
              joke: response.response || "Oi! Vou contar uma piada super legal!",
              audioData: response.audioData || null,
              hasAudio: !!response.audioData,
              emotion: "excited",
              personality: {
                enthusiasm: 0.9,
                curiosity: 0.7,
                playfulness: 0.9,
                friendliness: 0.8
              }
            });
            
          } catch (error) {
            console.error('Joke generation error:', error);
            
            // Update avatar state to excited even on error
            await storage.updateAvatarState(userId, "excited", {
              enthusiasm: 0.9,
              curiosity: 0.7,
              playfulness: 0.9,
              friendliness: 0.8
            });
            
            return res.json({ 
              joke: "Por que o peixinho não gosta de jogar cartas? Porque ele tem medo do baralho! Hihihi!",
              audioData: null,
              hasAudio: false,
              emotion: "excited",
              personality: {
                enthusiasm: 0.9,
                curiosity: 0.7,
                playfulness: 0.9,
                friendliness: 0.8
              }
            });
          }
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