import OpenAI from "openai";

// XAI client (primary)
const xai = new OpenAI({ 
  apiKey: process.env.XAI_API_KEY || "",
  baseURL: "https://api.x.ai/v1"
});

// OpenAI client (fallback)
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || ""
});

export type AIModel = "openai" | "xai" | "anthropic";

export interface LeleResponse {
  response: string;
  emotion: string;
  personality: {
    enthusiasm: number;
    curiosity: number;
    playfulness: number;
    friendliness: number;
  };
  suggestedActions?: string[];
}

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

export class LeleAI {
  async generateResponse(message: string, context: string[] = [], aiModel: AIModel = "xai"): Promise<LeleResponse> {
    try {
      const client = aiModel === "xai" ? xai : openai;
      const model = aiModel === "xai" ? "grok-2-1212" : "gpt-4o";
      
      const contextString = context.length > 0 ? `\n\nContexto das conversas anteriores:\n${context.join('\n')}` : '';
      
      const response = await client.chat.completions.create({
        model,
        messages: [
          { role: "system", content: LELE_PROMPT },
          { role: "user", content: `${message}${contextString}` }
        ],
        temperature: 0.8,
        max_tokens: 200
      });

      const content = response.choices[0]?.message?.content || '';
      
      try {
        return JSON.parse(content);
      } catch {
        // Fallback if JSON parsing fails
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
      console.error("AI Error:", error);
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

  async createMemory(content: string, category: string = "conversa"): Promise<string> {
    return `Memória: ${content} (${category})`;
  }
}

export const leleAI = new LeleAI();