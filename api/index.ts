import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { GoogleGenAI } from '@google/genai';
import WebSocket from 'ws';

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
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: 'Leda',
                  languageCode: 'pt-BR'
                }
              }
            }
          },
          systemInstruction: {
            parts: [{
              text: `Você é Lele, uma menina brasileira de 7 anos super animada e carinhosa! 

              CONFIGURAÇÃO DE VOZ:
              - Use a voz Leda com sotaque brasileiro
              - Fale como uma garotinha brasileira jovem e doce
              - Voz feminina com muita energia e entusiasmo
              - Entonação brasileira natural e expressiva
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
              - "Oi, amiguinho!" para cumprimentar
              - "Que bonitinho!" para coisas fofas
              
              PERSONALIDADE VOCAL:
              - Carinhosa e amigável
              - Curiosa e brincalhona
              - Som natural de criança brasileira
              - Fala fluida sem descrições ou emojis
              - Apenas fale o conteúdo da piada diretamente`
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

  async createFriend(friend: any) {
    try {
      const { data, error } = await supabase
        .from('friends')
        .insert({
          user_id: friend.userId,
          friend_name: friend.friendName,
          status: friend.status
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Database error in createFriend:', error);
      throw error;
    }
  }

  async updateFriendStatus(userId: number, friendName: string, status: string) {
    try {
      const { data, error } = await supabase
        .from('friends')
        .update({ status })
        .eq('user_id', userId)
        .eq('friend_name', friendName)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Database error in updateFriendStatus:', error);
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
        if (req.method === 'POST') {
          const { userId, message, response } = req.body;
          
          if (!userId || !message || !response) {
            return res.status(400).json({ message: "userId, message e response são obrigatórios" });
          }
          
          const conversation = await storage.createConversation({
            userId,
            message,
            response
          });
          
          return res.json(conversation);
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
        if (req.method === 'POST') {
          const { userId, friendName, status } = req.body;
          
          if (!userId || !friendName) {
            return res.status(400).json({ message: "userId e friendName são obrigatórios" });
          }
          
          const newFriend = await storage.createFriend({
            userId,
            friendName,
            status: status || "online"
          });
          
          return res.json(newFriend);
        }
        if (parts[1] && parts[2] && req.method === 'PATCH') {
          const userId = parseInt(parts[1]);
          const friendName = decodeURIComponent(parts[2]);
          const { status } = req.body;
          
          if (!status) {
            return res.status(400).json({ message: "status é obrigatório" });
          }
          
          const updatedFriend = await storage.updateFriendStatus(userId, friendName, status);
          return res.json(updatedFriend);
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
          
          const jokePrompt = `Você é Lele, uma menina brasileira de 7 anos super animada e carinhosa! 

          CONFIGURAÇÃO DE VOZ:
          - Use a voz Leda com sotaque brasileiro natural
          - Fale como uma garotinha brasileira jovem e doce
          - Voz feminina com muita energia e entusiasmo
          - Entonação brasileira expressiva e fluida
          - Tom agudo e alegre típico de criança
          - Velocidade natural, mais rápida quando empolgada

          TAREFA: Conte uma piada MUITO divertida e apropriada para crianças brasileiras. A piada deve ser:
          - Engraçada e inocente, sem nenhum conteúdo adulto
          - Com contexto brasileiro (animais, comidas, cultura do Brasil)
          - Simples de entender para crianças
          - Que faça uma criança rir muito
          - Sobre temas como: animais, comida, escola, brincadeiras
          - Use linguagem bem simples e alegre
          - Termine com uma risadinha natural como "hihihi" ou "hahaha"

          IMPORTANTE: Fale apenas o conteúdo da piada diretamente, sem descrições ou emojis. Seja natural e espontânea como uma criança brasileira contando para um amiguinho.
          
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