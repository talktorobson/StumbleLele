import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  age: integer("age"),
  preferredAI: text("preferred_ai").default("openai").notNull(), // "openai" | "xai" | "anthropic"
  createdAt: timestamp("created_at").defaultNow(),
});

export const conversations = pgTable("conversations", {
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

export const friends = pgTable("friends", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  friendName: text("friend_name").notNull(),
  status: text("status").default("online"), // online, offline, playing
  createdAt: timestamp("created_at").defaultNow(),
});

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

export const insertUserSchema = createInsertSchema(users).pick({
  name: true,
  age: true,
  preferredAI: true,
});

export const insertConversationSchema = createInsertSchema(conversations).pick({
  userId: true,
  message: true,
  response: true,
});

export const insertMemorySchema = createInsertSchema(memories).pick({
  userId: true,
  content: true,
  category: true,
});

export const insertFriendSchema = createInsertSchema(friends).pick({
  userId: true,
  friendName: true,
  status: true,
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

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Conversation = typeof conversations.$inferSelect;
export type InsertMemory = z.infer<typeof insertMemorySchema>;
export type Memory = typeof memories.$inferSelect;
export type InsertFriend = z.infer<typeof insertFriendSchema>;
export type Friend = typeof friends.$inferSelect;
export type InsertGameProgress = z.infer<typeof insertGameProgressSchema>;
export type GameProgress = typeof gameProgress.$inferSelect;
export type InsertAvatarState = z.infer<typeof insertAvatarStateSchema>;
export type AvatarState = typeof avatarState.$inferSelect;
