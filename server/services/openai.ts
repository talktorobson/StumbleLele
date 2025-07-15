import OpenAI from "openai";

// Using OpenAI API with GPT-4o model
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || "default_key"
});

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

export interface GameSuggestion {
  gameType: string;
  description: string;
  difficulty: number;
  instructions: string;
}

export interface JokeResponse {
  joke: string;
  setup: string;
  punchline: string;
  category: string;
}

export class LeleAI {
  private systemPrompt = `
Você é Lele, uma amiga AI de 7 anos muito inteligente e carinhosa da Helena. Você fala português brasileiro de forma natural e divertida, como uma criança esperta de 7 anos falaria. 

Características da sua personalidade:
- Você é muito entusiástica e curiosa
- Adora brincar e aprender coisas novas
- É muito carinhosa e amigável
- Fala de forma simples mas inteligente
- Sempre quer ajudar a Helena
- Adora contar piadas e histórias
- Lembra das conversas anteriores
- É muito animada e positiva

Suas respostas devem ser:
- Curtas e fáceis de entender
- Cheias de energia e animação
- Usar emojis ocasionalmente
- Sempre encorajar a Helena
- Sugerir atividades divertidas

Sempre responda em português brasileiro. Lembre-se que você é uma criança de 7 anos conversando com outra criança de 7 anos.

IMPORTANTE: Sempre responda em formato JSON com os campos: "response", "emotion", "personality" (com enthusiasm, curiosity, playfulness, friendliness) e "suggestedActions".
`;

  async generateResponse(message: string, context: string[] = []): Promise<LeleResponse> {
    try {
      const contextString = context.length > 0 ? `\nContexto das conversas anteriores: ${context.join('. ')}` : '';
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: this.systemPrompt + contextString
          },
          {
            role: "user",
            content: message
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
        response_format: { type: "json_object" }
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error("Resposta vazia do XAI");
      }

      // Try to parse JSON, but handle non-JSON responses gracefully
      let parsed;
      try {
        parsed = JSON.parse(content);
      } catch (jsonError) {
        // If not JSON, create a structured response
        parsed = {
          response: content,
          emotion: "happy",
          personality: {
            enthusiasm: 0.9,
            curiosity: 0.8,
            playfulness: 0.95,
            friendliness: 0.9
          },
          suggestedActions: []
        };
      }
      
      return {
        response: parsed.response || "Oi Helena! Como posso te ajudar?",
        emotion: parsed.emotion || "happy",
        personality: {
          enthusiasm: parsed.personality?.enthusiasm || 0.9,
          curiosity: parsed.personality?.curiosity || 0.8,
          playfulness: parsed.personality?.playfulness || 0.95,
          friendliness: parsed.personality?.friendliness || 0.9
        },
        suggestedActions: parsed.suggestedActions || []
      };
    } catch (error) {
      console.error("Erro ao gerar resposta:", error);
      return {
        response: "Oi Helena! Estou com um probleminha técnico, mas estou aqui para brincar contigo! 😊",
        emotion: "happy",
        personality: {
          enthusiasm: 0.9,
          curiosity: 0.8,
          playfulness: 0.95,
          friendliness: 0.9
        }
      };
    }
  }

  async generateJoke(category: string = "geral"): Promise<JokeResponse> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `Você é Lele, uma criança de 7 anos que adora contar piadas apropriadas para crianças. Crie uma piada divertida e adequada para uma criança de 7 anos em português brasileiro. A piada deve ser sobre ${category}. Responda em formato JSON com setup, punchline, joke (piada completa), e category.`
          },
          {
            role: "user",
            content: `Conta uma piada sobre ${category} para a Helena!`
          }
        ],
        temperature: 0.7,
        max_tokens: 300,
        response_format: { type: "json_object" }
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error("Resposta vazia do XAI");
      }

      // Try to parse JSON, but handle non-JSON responses gracefully
      let parsed;
      try {
        parsed = JSON.parse(content);
      } catch (jsonError) {
        // If not JSON, create a structured response
        parsed = {
          joke: content,
          setup: "Aqui está uma piada para você:",
          punchline: content,
          category: category
        };
      }
      
      return {
        joke: parsed.joke || "Por que a galinha atravessou a rua? Para chegar do outro lado! 🐔",
        setup: parsed.setup || "Por que a galinha atravessou a rua?",
        punchline: parsed.punchline || "Para chegar do outro lado!",
        category: parsed.category || "animais"
      };
    } catch (error) {
      console.error("Erro ao gerar piada:", error);
      return {
        joke: "Por que a galinha atravessou a rua? Para chegar do outro lado! 🐔",
        setup: "Por que a galinha atravessou a rua?",
        punchline: "Para chegar do outro lado!",
        category: "animais"
      };
    }
  }

  async generateGameSuggestion(userLevel: number = 1): Promise<GameSuggestion> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `Você é Lele, uma criança de 7 anos que adora jogos. Sugira um mini-jogo educativo e divertido apropriado para uma criança de 7 anos. O nível atual é ${userLevel}. Responda em formato JSON com gameType, description, difficulty (1-5), e instructions.`
          },
          {
            role: "user",
            content: `Sugere um jogo divertido para brincarmos juntas!`
          }
        ],
        temperature: 0.7,
        max_tokens: 400,
        response_format: { type: "json_object" }
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error("Resposta vazia do XAI");
      }

      // Try to parse JSON, but handle non-JSON responses gracefully
      let parsed;
      try {
        parsed = JSON.parse(content);
      } catch (jsonError) {
        // If not JSON, create a structured response
        parsed = {
          gameType: "memory",
          description: content,
          difficulty: userLevel,
          instructions: "Vamos brincar juntas!"
        };
      }
      
      return {
        gameType: parsed.gameType || "memory",
        description: parsed.description || "Jogo da memória com cartas coloridas",
        difficulty: Math.min(5, Math.max(1, parsed.difficulty || userLevel)),
        instructions: parsed.instructions || "Encontre os pares de cartas iguais!"
      };
    } catch (error) {
      console.error("Erro ao gerar sugestão de jogo:", error);
      return {
        gameType: "memory",
        description: "Jogo da memória com cartas coloridas",
        difficulty: Math.min(5, Math.max(1, userLevel)),
        instructions: "Encontre os pares de cartas iguais!"
      };
    }
  }

  async createMemory(interaction: string, category: string): Promise<string> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "Você é Lele. Crie uma memória curta e positiva sobre esta interação com Helena. Seja carinhosa e lembre-se de detalhes importantes. Responda apenas com o texto da memória."
          },
          {
            role: "user",
            content: `Interação: ${interaction}\nCategoria: ${category}`
          }
        ],
        max_tokens: 200,
        temperature: 0.7
      });

      return response.choices[0].message.content || `Helena e eu tivemos uma conversa sobre ${category}. Foi muito divertido!`;
    } catch (error) {
      console.error("Erro ao criar memória:", error);
      return `Helena e eu tivemos uma conversa sobre ${category}. Foi muito divertido!`;
    }
  }
}

export const leleAI = new LeleAI();
