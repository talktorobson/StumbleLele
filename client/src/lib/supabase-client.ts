// Supabase Client Configuration for StumbleLele Friends Chat System
// Real-time capabilities for messaging and friend requests
// Author: Agent 4 - Real-time Specialist

import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create Supabase client with realtime enabled
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// Database types for TypeScript
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: number;
          name: string;
          username: string;
          display_name: string | null;
          avatar_emoji: string;
          is_online: boolean;
          last_seen: string | null;
          age: number | null;
          preferred_ai: string;
          created_at: string;
        };
        Insert: {
          id?: number;
          name: string;
          username: string;
          display_name?: string | null;
          avatar_emoji?: string;
          is_online?: boolean;
          last_seen?: string | null;
          age?: number | null;
          preferred_ai?: string;
          created_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          username?: string;
          display_name?: string | null;
          avatar_emoji?: string;
          is_online?: boolean;
          last_seen?: string | null;
          age?: number | null;
          preferred_ai?: string;
          created_at?: string;
        };
      };
      friends: {
        Row: {
          id: string;
          user_id: number;
          friend_id: number;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: number;
          friend_id: number;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: number;
          friend_id?: number;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      conversations: {
        Row: {
          id: string;
          user1_id: number;
          user2_id: number;
          created_at: string;
          last_message_at: string | null;
          is_active: boolean;
        };
        Insert: {
          id?: string;
          user1_id: number;
          user2_id: number;
          created_at?: string;
          last_message_at?: string | null;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          user1_id?: number;
          user2_id?: number;
          created_at?: string;
          last_message_at?: string | null;
          is_active?: boolean;
        };
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_id: number;
          content: string;
          created_at: string;
          updated_at: string;
          is_deleted: boolean;
          message_type: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          sender_id: number;
          content: string;
          created_at?: string;
          updated_at?: string;
          is_deleted?: boolean;
          message_type?: string;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          sender_id?: number;
          content?: string;
          created_at?: string;
          updated_at?: string;
          is_deleted?: boolean;
          message_type?: string;
        };
      };
    };
  };
};

// Helper function to get current user ID (mock implementation)
export function getCurrentUserId(): number {
  // In a real app, this would get the authenticated user ID
  // For now, we'll use a stored value or default to user 1
  const storedUserId = localStorage.getItem('currentUserId');
  return storedUserId ? parseInt(storedUserId) : 1;
}

// Helper function to set current user ID
export function setCurrentUserId(userId: number): void {
  localStorage.setItem('currentUserId', userId.toString());
}

// Helper function to check if user is authenticated
export function isAuthenticated(): boolean {
  return getCurrentUserId() > 0;
}

// Export the client as default for convenience
export default supabase;