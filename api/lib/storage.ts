import { 
  users, conversations, memories, friends, gameProgress, avatarState,
  type User, type InsertUser, type Conversation, type InsertConversation,
  type Memory, type InsertMemory, type Friend, type InsertFriend,
  type GameProgress, type InsertGameProgress, type AvatarState, type InsertAvatarState
} from "../../shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

class Storage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getOrCreateUser(id: number): Promise<User> {
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
      // Return a default user if database fails
      return {
        id,
        name: `User${id}`,
        preferredAI: "gemini",
        age: null,
        createdAt: new Date()
      };
    }
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  async updateUserPreferences(userId: number, preferredAI: string): Promise<User | undefined> {
    const result = await db.update(users).set({ preferredAI }).where(eq(users.id, userId)).returning();
    return result[0];
  }

  // Conversation operations
  async getConversations(userId: number): Promise<Conversation[]> {
    try {
      return await db.select().from(conversations).where(eq(conversations.userId, userId));
    } catch (error) {
      console.error('Database error in getConversations:', error);
      return [];
    }
  }

  async createConversation(conversation: InsertConversation): Promise<Conversation> {
    const result = await db.insert(conversations).values(conversation).returning();
    return result[0];
  }

  // Memory operations
  async getMemories(userId: number): Promise<Memory[]> {
    try {
      return await db.select().from(memories).where(eq(memories.userId, userId));
    } catch (error) {
      console.error('Database error in getMemories:', error);
      return [];
    }
  }

  async createMemory(memory: InsertMemory): Promise<Memory> {
    const result = await db.insert(memories).values(memory).returning();
    return result[0];
  }

  // Friend operations
  async getFriends(userId: number): Promise<Friend[]> {
    try {
      return await db.select().from(friends).where(eq(friends.userId, userId));
    } catch (error) {
      console.error('Database error in getFriends:', error);
      return [];
    }
  }

  async createFriend(friend: InsertFriend): Promise<Friend> {
    const result = await db.insert(friends).values(friend).returning();
    return result[0];
  }

  // Game progress operations
  async getGameProgress(userId: number): Promise<GameProgress[]> {
    try {
      return await db.select().from(gameProgress).where(eq(gameProgress.userId, userId));
    } catch (error) {
      console.error('Database error in getGameProgress:', error);
      return [];
    }
  }

  async createGameProgress(progress: InsertGameProgress): Promise<GameProgress> {
    const result = await db.insert(gameProgress).values(progress).returning();
    return result[0];
  }

  // Avatar state operations
  async getAvatarState(userId: number): Promise<AvatarState | undefined> {
    try {
      const result = await db.select().from(avatarState).where(eq(avatarState.userId, userId)).limit(1);
      return result[0];
    } catch (error) {
      console.error('Database error in getAvatarState:', error);
      return undefined;
    }
  }

  async updateAvatarState(userId: number, emotion: string, personality: any): Promise<AvatarState> {
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

export const storage = new Storage();