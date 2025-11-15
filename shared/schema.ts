import { pgTable, text, serial, integer, boolean, timestamp, json, uuid, unique, check } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enhanced users table with friends chat system fields
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  age: integer("age"),
  preferredAI: text("preferred_ai").default("gemini").notNull(), // "openai" | "xai" | "anthropic" | "gemini"
  // New fields for friends chat system
  username: text("username").unique().notNull(),
  displayName: text("display_name"),
  avatarEmoji: text("avatar_emoji").default("😊"),
  isOnline: boolean("is_online").default(false),
  lastSeen: timestamp("last_seen").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// AI conversations table (renamed from conversations for clarity)
export const aiConversations = pgTable("ai_conversations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  message: text("message").notNull(),
  response: text("response").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const memories = pgTable("memories", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  content: text("content").notNull(),
  category: text("category").notNull(), // games, jokes, preferences, etc.
  timestamp: timestamp("timestamp").defaultNow(),
});

// Redesigned friends table for proper friend relationships
export const friends = pgTable("friends", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  friendId: integer("friend_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  status: text("status").default("pending").notNull(), // pending, accepted, rejected, blocked
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  // Unique constraint to prevent duplicate friend relationships
  uniqueFriendship: unique("unique_friendship").on(table.userId, table.friendId),
  // Check constraint to prevent users from befriending themselves
  noSelfFriend: check("no_self_friend", `${table.userId} != ${table.friendId}`),
}));

// New conversations table for 1-on-1 chat conversations
export const conversations = pgTable("conversations", {
  id: uuid("id").primaryKey().defaultRandom(),
  user1Id: integer("user1_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  user2Id: integer("user2_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  lastMessageAt: timestamp("last_message_at"),
  isActive: boolean("is_active").default(true),
}, (table) => ({
  // Unique constraint to prevent duplicate conversations
  uniqueConversation: unique("unique_conversation").on(table.user1Id, table.user2Id),
  // Check constraint to prevent users from having conversations with themselves
  noSelfConversation: check("no_self_conversation", `${table.user1Id} != ${table.user2Id}`),
}));

// New messages table for individual chat messages
export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  conversationId: uuid("conversation_id").references(() => conversations.id, { onDelete: "cascade" }).notNull(),
  senderId: integer("sender_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  isDeleted: boolean("is_deleted").default(false),
  messageType: text("message_type").default("text"), // text, emoji, image, audio
});

// New message reactions table
export const messageReactions = pgTable("message_reactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  messageId: uuid("message_id").references(() => messages.id, { onDelete: "cascade" }).notNull(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  emoji: text("emoji").notNull(), // ❤️ 😂 🤔 👍 🎉
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  // Unique constraint: one user can only add one reaction per message
  uniqueUserReaction: unique("unique_user_reaction").on(table.messageId, table.userId),
}));

export const gameProgress = pgTable("game_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  gameType: text("game_type").notNull(),
  level: integer("level").default(1),
  score: integer("score").default(0),
  completedAt: timestamp("completed_at"),
});

export const avatarState = pgTable("avatar_state", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  currentEmotion: text("current_emotion").default("happy"),
  personality: json("personality").default({}),
  lastInteraction: timestamp("last_interaction").defaultNow(),
});

// Enhanced user schema with friends chat system fields
export const insertUserSchema = createInsertSchema(users).pick({
  name: true,
  age: true,
  preferredAI: true,
  username: true,
  displayName: true,
  avatarEmoji: true,
  isOnline: true,
});

// AI conversations schema (renamed for clarity)
export const insertAIConversationSchema = createInsertSchema(aiConversations).pick({
  userId: true,
  message: true,
  response: true,
});

export const insertMemorySchema = createInsertSchema(memories).pick({
  userId: true,
  content: true,
  category: true,
});

// Enhanced friends schema for proper friend relationships
export const insertFriendSchema = createInsertSchema(friends).pick({
  userId: true,
  friendId: true,
  status: true,
});

// New conversations schema for 1-on-1 chat conversations
export const insertConversationSchema = createInsertSchema(conversations).pick({
  user1Id: true,
  user2Id: true,
  isActive: true,
});

// New messages schema for individual chat messages
export const insertMessageSchema = createInsertSchema(messages).pick({
  conversationId: true,
  senderId: true,
  content: true,
  messageType: true,
});

// New message reactions schema
export const insertMessageReactionSchema = createInsertSchema(messageReactions).pick({
  messageId: true,
  userId: true,
  emoji: true,
});

export const insertGameProgressSchema = createInsertSchema(gameProgress).pick({
  userId: true,
  gameType: true,
  level: true,
  score: true,
});

export const insertAvatarStateSchema = createInsertSchema(avatarState).pick({
  userId: true,
  currentEmotion: true,
  personality: true,
});

// Enhanced type definitions for friends chat system
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertAIConversation = z.infer<typeof insertAIConversationSchema>;
export type AIConversation = typeof aiConversations.$inferSelect;
export type InsertMemory = z.infer<typeof insertMemorySchema>;
export type Memory = typeof memories.$inferSelect;
export type InsertFriend = z.infer<typeof insertFriendSchema>;
export type Friend = typeof friends.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Conversation = typeof conversations.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessageReaction = z.infer<typeof insertMessageReactionSchema>;
export type MessageReaction = typeof messageReactions.$inferSelect;
export type InsertGameProgress = z.infer<typeof insertGameProgressSchema>;
export type GameProgress = typeof gameProgress.$inferSelect;
export type InsertAvatarState = z.infer<typeof insertAvatarStateSchema>;
export type AvatarState = typeof avatarState.$inferSelect;

// Additional types for friends chat functionality
export type FriendWithUser = Friend & {
  user: User;
  friend: User;
};

export type ConversationWithUsers = Conversation & {
  user1: User;
  user2: User;
  lastMessage?: Message;
};

export type MessageWithSender = Message & {
  sender: User;
  reactions?: MessageReaction[];
};

export type FriendStatus = "pending" | "accepted" | "rejected" | "blocked";
export type MessageType = "text" | "emoji" | "image" | "audio";
export type ReactionEmoji = "❤️" | "😂" | "🤔" | "👍" | "🎉";
