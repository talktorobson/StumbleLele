import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { leleAI, type AIModel } from "./services/openai";
import { insertConversationSchema, insertMemorySchema, insertGameProgressSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get user info
  app.get("/api/user/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar usuário" });
    }
  });

  // Update user AI model preference
  app.post("/api/user/:id/ai-model", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { aiModel } = req.body;
      
      if (!aiModel || !["openai", "xai"].includes(aiModel)) {
        return res.status(400).json({ message: "Modelo de AI inválido. Use 'openai' ou 'xai'" });
      }
      
      const user = await storage.updateUserPreferences(userId, aiModel);
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }
      
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Erro ao atualizar preferências do usuário" });
    }
  });

  // Get avatar state
  app.get("/api/avatar/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const avatarState = await storage.getAvatarState(userId);
      if (!avatarState) {
        return res.status(404).json({ message: "Estado do avatar não encontrado" });
      }
      res.json(avatarState);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar estado do avatar" });
    }
  });

  // Update avatar state
  app.post("/api/avatar/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const { emotion, personality } = req.body;
      
      const updated = await storage.updateAvatarState(userId, emotion, personality);
      if (!updated) {
        return res.status(404).json({ message: "Avatar não encontrado" });
      }
      
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Erro ao atualizar avatar" });
    }
  });

  // Send message to Lele
  app.post("/api/chat", async (req, res) => {
    try {
      const { userId, message } = req.body;
      
      if (!userId || !message) {
        return res.status(400).json({ message: "userId e message são obrigatórios" });
      }

      // Get user preferences
      const user = await storage.getUser(userId);
      const aiModel = (user?.preferredAI || "openai") as AIModel;

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
  });

  // Get conversations
  app.get("/api/conversations/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const conversations = await storage.getConversations(userId);
      res.json(conversations);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar conversas" });
    }
  });

  // Get a joke from Lele
  app.post("/api/joke", async (req, res) => {
    try {
      const { userId, category = "geral" } = req.body;
      
      const joke = await leleAI.generateJoke(category);
      
      // Create memory of the joke
      const memoryContent = await leleAI.createMemory(
        `Lele contou uma piada: ${joke.joke}`,
        "humor"
      );
      await storage.createMemory({
        userId,
        content: memoryContent,
        category: "humor"
      });
      
      // Update avatar to happy/excited
      await storage.updateAvatarState(userId, "excited", {
        enthusiasm: 0.95,
        curiosity: 0.8,
        playfulness: 0.98,
        friendliness: 0.9
      });
      
      res.json(joke);
    } catch (error) {
      console.error("Erro ao gerar piada:", error);
      res.status(500).json({ message: "Erro ao gerar piada" });
    }
  });

  // Get game suggestion
  app.post("/api/game/suggest", async (req, res) => {
    try {
      const { userId } = req.body;
      
      // Get user's current level
      const gameProgress = await storage.getGameProgress(userId);
      const averageLevel = gameProgress.length > 0 
        ? Math.round(gameProgress.reduce((sum, p) => sum + (p.level || 1), 0) / gameProgress.length)
        : 1;
      
      const gameSuggestion = await leleAI.generateGameSuggestion(averageLevel);
      
      res.json(gameSuggestion);
    } catch (error) {
      console.error("Erro ao sugerir jogo:", error);
      res.status(500).json({ message: "Erro ao sugerir jogo" });
    }
  });

  // Save game progress
  app.post("/api/game/progress", async (req, res) => {
    try {
      const validatedData = insertGameProgressSchema.parse(req.body);
      
      // Check if progress exists
      const existing = await storage.getGameProgressByType(validatedData.userId || 0, validatedData.gameType);
      
      let progress;
      if (existing) {
        progress = await storage.updateGameProgress(
          validatedData.userId || 0,
          validatedData.gameType,
          validatedData.level || 1,
          validatedData.score || 0
        );
      } else {
        progress = await storage.createGameProgress(validatedData);
      }
      
      // Create memory of achievement
      const memoryContent = await leleAI.createMemory(
        `Helena jogou ${validatedData.gameType} e chegou no nível ${validatedData.level} com ${validatedData.score} pontos!`,
        "jogos"
      );
      await storage.createMemory({
        userId: validatedData.userId,
        content: memoryContent,
        category: "jogos"
      });
      
      res.json(progress);
    } catch (error) {
      console.error("Erro ao salvar progresso:", error);
      res.status(500).json({ message: "Erro ao salvar progresso do jogo" });
    }
  });

  // Get game progress
  app.get("/api/game/progress/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const progress = await storage.getGameProgress(userId);
      res.json(progress);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar progresso dos jogos" });
    }
  });

  // Get memories
  app.get("/api/memories/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const category = req.query.category as string;
      
      const memories = category 
        ? await storage.getMemoriesByCategory(userId, category)
        : await storage.getMemories(userId);
        
      res.json(memories);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar memórias" });
    }
  });

  // Get friends
  app.get("/api/friends/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const friends = await storage.getFriends(userId);
      res.json(friends);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar amigos" });
    }
  });

  // Add friend
  app.post("/api/friends", async (req, res) => {
    try {
      const { userId, friendName, status = "online" } = req.body;
      
      const friend = await storage.createFriend({
        userId,
        friendName,
        status
      });
      
      res.json(friend);
    } catch (error) {
      res.status(500).json({ message: "Erro ao adicionar amigo" });
    }
  });

  // Update friend status
  app.patch("/api/friends/:userId/:friendName", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const friendName = req.params.friendName;
      const { status } = req.body;
      
      const updated = await storage.updateFriendStatus(userId, friendName, status);
      if (!updated) {
        return res.status(404).json({ message: "Amigo não encontrado" });
      }
      
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Erro ao atualizar status do amigo" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
