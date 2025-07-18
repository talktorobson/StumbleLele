// Custom React hooks for Conversations and Messages
// Based on Agent 2's API endpoints and Agent 4's real-time preparation

import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import {
  getConversations,
  createConversation,
  getConversationMessages,
  sendMessage,
  editMessage,
  deleteMessage,
  handleApiError,
  getOtherUserInConversation
} from '@/lib/chat-api';
import type { 
  ConversationWithUsers, 
  MessageWithSender, 
  CreateConversationRequest, 
  SendMessageRequest,
  UserProfile 
} from '@/types/chat';

// Hook for managing user's conversations
export function useConversations(userId: number) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: conversations = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['conversations', userId],
    queryFn: () => getConversations(userId),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const createConversationMutation = useMutation({
    mutationFn: (request: CreateConversationRequest) => createConversation(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations', userId] });
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar conversa",
        description: handleApiError(error),
        variant: "destructive",
      });
    },
  });

  const startConversationWith = useCallback(async (otherUserId: number) => {
    try {
      const conversation = await createConversationMutation.mutateAsync({
        user1Id: userId,
        user2Id: otherUserId
      });
      return conversation;
    } catch (error) {
      throw error;
    }
  }, [userId, createConversationMutation]);

  // Get conversation with specific user
  const getConversationWith = useCallback((otherUserId: number) => {
    return conversations.find(conv => 
      (conv.user1Id === userId && conv.user2Id === otherUserId) ||
      (conv.user1Id === otherUserId && conv.user2Id === userId)
    );
  }, [conversations, userId]);

  // Get other user in conversation
  const getOtherUser = useCallback((conversationId: string): UserProfile | null => {
    const conversation = conversations.find(conv => conv.id === conversationId);
    if (!conversation) return null;
    return getOtherUserInConversation(conversation, userId);
  }, [conversations, userId]);

  return {
    conversations,
    isLoading,
    error,
    refetch,
    startConversationWith,
    getConversationWith,
    getOtherUser,
    isCreatingConversation: createConversationMutation.isPending,
  };
}

// Hook for managing messages in a conversation
export function useConversationMessages(conversationId: string | null) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    data: messages = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => getConversationMessages(conversationId!),
    enabled: !!conversationId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });

  const sendMessageMutation = useMutation({
    mutationFn: (request: SendMessageRequest) => sendMessage(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      // Scroll to bottom after sending message
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    },
    onError: (error) => {
      toast({
        title: "Erro ao enviar mensagem",
        description: handleApiError(error),
        variant: "destructive",
      });
    },
  });

  const editMessageMutation = useMutation({
    mutationFn: ({ messageId, content, userId }: { messageId: string; content: string; userId: number }) => 
      editMessage(messageId, content, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      toast({
        title: "Mensagem editada",
        description: "Sua mensagem foi editada com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao editar mensagem",
        description: handleApiError(error),
        variant: "destructive",
      });
    },
  });

  const deleteMessageMutation = useMutation({
    mutationFn: ({ messageId, userId }: { messageId: string; userId: number }) => 
      deleteMessage(messageId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      toast({
        title: "Mensagem deletada",
        description: "Sua mensagem foi deletada.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao deletar mensagem",
        description: handleApiError(error),
        variant: "destructive",
      });
    },
  });

  const sendNewMessage = useCallback(async (content: string, senderId: number) => {
    if (!conversationId || !content.trim()) return;

    await sendMessageMutation.mutateAsync({
      conversationId,
      senderId,
      content: content.trim(),
      messageType: 'text'
    });
  }, [conversationId, sendMessageMutation]);

  const editExistingMessage = useCallback(async (messageId: string, content: string, userId: number) => {
    await editMessageMutation.mutateAsync({ messageId, content, userId });
  }, [editMessageMutation]);

  const deleteExistingMessage = useCallback(async (messageId: string, userId: number) => {
    await deleteMessageMutation.mutateAsync({ messageId, userId });
  }, [deleteMessageMutation]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [messages]);

  return {
    messages,
    isLoading,
    error,
    refetch,
    sendMessage: sendNewMessage,
    editMessage: editExistingMessage,
    deleteMessage: deleteExistingMessage,
    isSendingMessage: sendMessageMutation.isPending,
    isEditingMessage: editMessageMutation.isPending,
    isDeletingMessage: deleteMessageMutation.isPending,
    messagesEndRef,
  };
}

// Hook for managing active chat state
export function useActiveChat(userId: number) {
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [activeFriendId, setActiveFriendId] = useState<number | null>(null);

  const { conversations, startConversationWith, getConversationWith } = useConversations(userId);
  const { messages, sendMessage, isLoading: isLoadingMessages } = useConversationMessages(activeChatId);

  const openChatWith = useCallback(async (friendId: number) => {
    setActiveFriendId(friendId);
    
    // Check if conversation already exists
    const existingConversation = getConversationWith(friendId);
    
    if (existingConversation) {
      setActiveChatId(existingConversation.id);
    } else {
      // Create new conversation
      try {
        const newConversation = await startConversationWith(friendId);
        setActiveChatId(newConversation.id);
      } catch (error) {
        console.error('Failed to start conversation:', error);
      }
    }
  }, [getConversationWith, startConversationWith]);

  const closeChat = useCallback(() => {
    setActiveChatId(null);
    setActiveFriendId(null);
  }, []);

  const activeConversation = conversations.find(conv => conv.id === activeChatId);

  return {
    activeChatId,
    activeFriendId,
    activeConversation,
    messages,
    isLoadingMessages,
    openChatWith,
    closeChat,
    sendMessage,
  };
}

// Hook for conversation list with sorting and filtering
export function useConversationList(userId: number) {
  const { conversations, isLoading, error } = useConversations(userId);

  // Sort conversations by last message time
  const sortedConversations = [...conversations].sort((a, b) => {
    const timeA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
    const timeB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
    return timeB - timeA;
  });

  // Filter active conversations
  const activeConversations = sortedConversations.filter(conv => conv.isActive);

  // Get conversations with unread messages (placeholder for now)
  const unreadConversations = activeConversations.filter(conv => {
    // This will be implemented with real-time updates
    return false;
  });

  return {
    conversations: sortedConversations,
    activeConversations,
    unreadConversations,
    isLoading,
    error,
    totalCount: conversations.length,
    activeCount: activeConversations.length,
    unreadCount: unreadConversations.length,
  };
}

// Hook for typing indicator (preparation for real-time)
export function useTypingIndicator(conversationId: string | null) {
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<UserProfile[]>([]);

  // This will be implemented with real-time system
  const startTyping = useCallback(() => {
    setIsTyping(true);
  }, []);

  const stopTyping = useCallback(() => {
    setIsTyping(false);
  }, []);

  return {
    isTyping,
    typingUsers,
    startTyping,
    stopTyping,
  };
}

// Hook for message reactions (preparation for future features)
export function useMessageReactions(messageId: string | null) {
  const [reactions, setReactions] = useState<{[key: string]: number}>({});

  // Placeholder for future reactions feature
  const addReaction = useCallback((emoji: string) => {
    if (!messageId) return;
    // This will be implemented later
  }, [messageId]);

  const removeReaction = useCallback((emoji: string) => {
    if (!messageId) return;
    // This will be implemented later
  }, [messageId]);

  return {
    reactions,
    addReaction,
    removeReaction,
  };
}