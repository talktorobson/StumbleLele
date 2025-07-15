import { 
  users, conversations, memories, friends, gameProgress, avatarState,
  type User, type InsertUser, type Conversation, type InsertConversation,
  type Memory, type InsertMemory, type Friend, type InsertFriend,
  type GameProgress, type InsertGameProgress, type AvatarState, type InsertAvatarState
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByName(name: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Conversation operations
  getConversations(userId: number): Promise<Conversation[]>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  
  // Memory operations
  getMemories(userId: number): Promise<Memory[]>;
  getMemoriesByCategory(userId: number, category: string): Promise<Memory[]>;
  createMemory(memory: InsertMemory): Promise<Memory>;
  
  // Friend operations
  getFriends(userId: number): Promise<Friend[]>;
  createFriend(friend: InsertFriend): Promise<Friend>;
  updateFriendStatus(userId: number, friendName: string, status: string): Promise<Friend | undefined>;
  
  // Game progress operations
  getGameProgress(userId: number): Promise<GameProgress[]>;
  getGameProgressByType(userId: number, gameType: string): Promise<GameProgress | undefined>;
  createGameProgress(progress: InsertGameProgress): Promise<GameProgress>;
  updateGameProgress(userId: number, gameType: string, level: number, score: number): Promise<GameProgress | undefined>;
  
  // Avatar state operations
  getAvatarState(userId: number): Promise<AvatarState | undefined>;
  createAvatarState(state: InsertAvatarState): Promise<AvatarState>;
  updateAvatarState(userId: number, emotion: string, personality: any): Promise<AvatarState | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private conversations: Map<number, Conversation>;
  private memories: Map<number, Memory>;
  private friends: Map<number, Friend>;
  private gameProgress: Map<number, GameProgress>;
  private avatarStates: Map<number, AvatarState>;
  private currentId: number;

  constructor() {
    this.users = new Map();
    this.conversations = new Map();
    this.memories = new Map();
    this.friends = new Map();
    this.gameProgress = new Map();
    this.avatarStates = new Map();
    this.currentId = 1;
    
    // Initialize default user (Helena)
    this.initializeDefaultUser();
  }

  private initializeDefaultUser() {
    const defaultUser: User = {
      id: 1,
      name: "Helena",
      age: 7,
      createdAt: new Date(),
    };
    this.users.set(1, defaultUser);
    
    // Initialize default avatar state
    const defaultAvatarState: AvatarState = {
      id: 1,
      userId: 1,
      currentEmotion: "happy",
      personality: { 
        enthusiasm: 0.9,
        curiosity: 0.8,
        playfulness: 0.95,
        friendliness: 0.9
      },
      lastInteraction: new Date(),
    };
    this.avatarStates.set(1, defaultAvatarState);
    
    this.currentId = 2;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByName(name: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.name === name);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { 
      ...insertUser, 
      id, 
      age: insertUser.age || null,
      createdAt: new Date() 
    };
    this.users.set(id, user);
    return user;
  }

  async getConversations(userId: number): Promise<Conversation[]> {
    return Array.from(this.conversations.values())
      .filter(conv => conv.userId === userId)
      .sort((a, b) => (a.timestamp?.getTime() || 0) - (b.timestamp?.getTime() || 0));
  }

  async createConversation(insertConversation: InsertConversation): Promise<Conversation> {
    const id = this.currentId++;
    const conversation: Conversation = {
      ...insertConversation,
      id,
      userId: insertConversation.userId || null,
      timestamp: new Date(),
    };
    this.conversations.set(id, conversation);
    return conversation;
  }

  async getMemories(userId: number): Promise<Memory[]> {
    return Array.from(this.memories.values())
      .filter(memory => memory.userId === userId)
      .sort((a, b) => (b.timestamp?.getTime() || 0) - (a.timestamp?.getTime() || 0));
  }

  async getMemoriesByCategory(userId: number, category: string): Promise<Memory[]> {
    return Array.from(this.memories.values())
      .filter(memory => memory.userId === userId && memory.category === category)
      .sort((a, b) => (b.timestamp?.getTime() || 0) - (a.timestamp?.getTime() || 0));
  }

  async createMemory(insertMemory: InsertMemory): Promise<Memory> {
    const id = this.currentId++;
    const memory: Memory = {
      ...insertMemory,
      id,
      userId: insertMemory.userId || null,
      timestamp: new Date(),
    };
    this.memories.set(id, memory);
    return memory;
  }

  async getFriends(userId: number): Promise<Friend[]> {
    return Array.from(this.friends.values())
      .filter(friend => friend.userId === userId)
      .sort((a, b) => (a.createdAt?.getTime() || 0) - (b.createdAt?.getTime() || 0));
  }

  async createFriend(insertFriend: InsertFriend): Promise<Friend> {
    const id = this.currentId++;
    const friend: Friend = {
      ...insertFriend,
      id,
      userId: insertFriend.userId || null,
      status: insertFriend.status || null,
      createdAt: new Date(),
    };
    this.friends.set(id, friend);
    return friend;
  }

  async updateFriendStatus(userId: number, friendName: string, status: string): Promise<Friend | undefined> {
    const friend = Array.from(this.friends.values())
      .find(f => f.userId === userId && f.friendName === friendName);
    if (friend) {
      friend.status = status;
      this.friends.set(friend.id, friend);
      return friend;
    }
    return undefined;
  }

  async getGameProgress(userId: number): Promise<GameProgress[]> {
    return Array.from(this.gameProgress.values())
      .filter(progress => progress.userId === userId);
  }

  async getGameProgressByType(userId: number, gameType: string): Promise<GameProgress | undefined> {
    return Array.from(this.gameProgress.values())
      .find(progress => progress.userId === userId && progress.gameType === gameType);
  }

  async createGameProgress(insertProgress: InsertGameProgress): Promise<GameProgress> {
    const id = this.currentId++;
    const progress: GameProgress = {
      ...insertProgress,
      id,
      userId: insertProgress.userId || null,
      level: insertProgress.level || null,
      score: insertProgress.score || null,
      completedAt: new Date(),
    };
    this.gameProgress.set(id, progress);
    return progress;
  }

  async updateGameProgress(userId: number, gameType: string, level: number, score: number): Promise<GameProgress | undefined> {
    const progress = Array.from(this.gameProgress.values())
      .find(p => p.userId === userId && p.gameType === gameType);
    if (progress) {
      progress.level = level;
      progress.score = score;
      progress.completedAt = new Date();
      this.gameProgress.set(progress.id, progress);
      return progress;
    }
    return undefined;
  }

  async getAvatarState(userId: number): Promise<AvatarState | undefined> {
    return Array.from(this.avatarStates.values())
      .find(state => state.userId === userId);
  }

  async createAvatarState(insertState: InsertAvatarState): Promise<AvatarState> {
    const id = this.currentId++;
    const state: AvatarState = {
      ...insertState,
      id,
      userId: insertState.userId || null,
      currentEmotion: insertState.currentEmotion || null,
      personality: insertState.personality || {},
      lastInteraction: new Date(),
    };
    this.avatarStates.set(id, state);
    return state;
  }

  async updateAvatarState(userId: number, emotion: string, personality: any): Promise<AvatarState | undefined> {
    const state = Array.from(this.avatarStates.values())
      .find(s => s.userId === userId);
    if (state) {
      state.currentEmotion = emotion;
      state.personality = personality;
      state.lastInteraction = new Date();
      this.avatarStates.set(state.id, state);
      return state;
    }
    return undefined;
  }
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByName(name: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.name, name));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getConversations(userId: number): Promise<Conversation[]> {
    return await db.select().from(conversations).where(eq(conversations.userId, userId));
  }

  async createConversation(insertConversation: InsertConversation): Promise<Conversation> {
    const [conversation] = await db
      .insert(conversations)
      .values(insertConversation)
      .returning();
    return conversation;
  }

  async getMemories(userId: number): Promise<Memory[]> {
    return await db.select().from(memories).where(eq(memories.userId, userId));
  }

  async getMemoriesByCategory(userId: number, category: string): Promise<Memory[]> {
    return await db.select().from(memories).where(
      and(eq(memories.userId, userId), eq(memories.category, category))
    );
  }

  async createMemory(insertMemory: InsertMemory): Promise<Memory> {
    const [memory] = await db
      .insert(memories)
      .values(insertMemory)
      .returning();
    return memory;
  }

  async getFriends(userId: number): Promise<Friend[]> {
    return await db.select().from(friends).where(eq(friends.userId, userId));
  }

  async createFriend(insertFriend: InsertFriend): Promise<Friend> {
    const [friend] = await db
      .insert(friends)
      .values(insertFriend)
      .returning();
    return friend;
  }

  async updateFriendStatus(userId: number, friendName: string, status: string): Promise<Friend | undefined> {
    const [updated] = await db
      .update(friends)
      .set({ status })
      .where(and(eq(friends.userId, userId), eq(friends.friendName, friendName)))
      .returning();
    return updated || undefined;
  }

  async getGameProgress(userId: number): Promise<GameProgress[]> {
    return await db.select().from(gameProgress).where(eq(gameProgress.userId, userId));
  }

  async getGameProgressByType(userId: number, gameType: string): Promise<GameProgress | undefined> {
    const [progress] = await db.select().from(gameProgress).where(
      and(eq(gameProgress.userId, userId), eq(gameProgress.gameType, gameType))
    );
    return progress || undefined;
  }

  async createGameProgress(insertProgress: InsertGameProgress): Promise<GameProgress> {
    const [progress] = await db
      .insert(gameProgress)
      .values(insertProgress)
      .returning();
    return progress;
  }

  async updateGameProgress(userId: number, gameType: string, level: number, score: number): Promise<GameProgress | undefined> {
    const [updated] = await db
      .update(gameProgress)
      .set({ level, score })
      .where(and(eq(gameProgress.userId, userId), eq(gameProgress.gameType, gameType)))
      .returning();
    return updated || undefined;
  }

  async getAvatarState(userId: number): Promise<AvatarState | undefined> {
    const [state] = await db.select().from(avatarState).where(eq(avatarState.userId, userId));
    return state || undefined;
  }

  async createAvatarState(insertState: InsertAvatarState): Promise<AvatarState> {
    const [state] = await db
      .insert(avatarState)
      .values(insertState)
      .returning();
    return state;
  }

  async updateAvatarState(userId: number, emotion: string, personality: any): Promise<AvatarState | undefined> {
    const [updated] = await db
      .update(avatarState)
      .set({ currentEmotion: emotion, personality })
      .where(eq(avatarState.userId, userId))
      .returning();
    return updated || undefined;
  }
}

// Use in-memory storage if DATABASE_URL is not set
export const storage = process.env.DATABASE_URL ? new DatabaseStorage() : new MemStorage();
