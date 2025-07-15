import { db } from "./db";
import { users, avatarState } from "@shared/schema";
import { eq } from "drizzle-orm";

export async function initializeDatabase() {
  try {
    // Check if default user exists
    const existingUser = await db.select().from(users).where(eq(users.id, 1));
    
    let userId = 1;
    if (existingUser.length === 0) {
      // Create default user
      const [user] = await db
        .insert(users)
        .values({
          name: "Helena",
          age: 7
        })
        .returning();
      userId = user.id;
      console.log("Default user created successfully");
    }
    
    // Check if avatar state exists
    const existingAvatarState = await db.select().from(avatarState).where(eq(avatarState.userId, userId));
    
    if (existingAvatarState.length === 0) {
      // Create default avatar state
      await db
        .insert(avatarState)
        .values({
          userId: userId,
          currentEmotion: "happy",
          personality: {
            enthusiasm: 0.9,
            curiosity: 0.8,
            playfulness: 0.95,
            friendliness: 0.9
          },
          lastInteraction: new Date()
        });
      console.log("Default avatar state created successfully");
    }
  } catch (error) {
    console.error("Database initialization error:", error);
  }
}