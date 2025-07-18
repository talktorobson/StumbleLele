// Real-time Chat Hook for StumbleLele Friends Chat System
// Provides real-time messaging capabilities with notifications
// Author: Agent 4 - Real-time Specialist

import { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { realtimeManager } from '../lib/supabase-realtime';
import { getCurrentUserId } from '../lib/supabase-client';
import { showMessageNotification } from '../lib/notification-manager';
import { 
  getConversationMessages, 
  sendMessage as sendMessageApi,
  editMessage as editMessageApi,
  deleteMessage as deleteMessageApi
} from '../lib/chat-api';
import type { MessageWithSender, SendMessageRequest } from '../types/chat';

// Hook options
interface UseChatOptions {
  conversationId: string;
  friendName?: string;
  autoScroll?: boolean;
  enableNotifications?: boolean;
  enableSound?: boolean;
}

// Hook return type
export interface UseChatReturn {
  messages: MessageWithSender[];
  loading: boolean;
  error: string | null;
  sendMessage: (content: string, messageType?: string) => Promise<void>;
  editMessage: (messageId: string, content: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  isTyping: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  scrollToBottom: () => void;
  retry: () => void;
  clearError: () => void;
}

// Custom hook for real-time chat
export function useChat(options: UseChatOptions): UseChatReturn {
  const { 
    conversationId, 
    friendName = 'Amigo',
    autoScroll = true,
    enableNotifications = true,
    enableSound = true
  } = options;

  const [messages, setMessages] = useState<MessageWithSender[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const currentUserId = getCurrentUserId();

  // Fetch initial messages
  const { data: initialMessages, isLoading: loading, refetch } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => getConversationMessages(conversationId),
    enabled: !!conversationId,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Update messages state when initial messages are loaded
  useEffect(() => {
    if (initialMessages) {
      setMessages(initialMessages);
    }
  }, [initialMessages]);

  // Scroll to bottom function
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current && autoScroll) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end'
      });
    }
  }, [autoScroll]);

  // Scroll to bottom when messages change
  useEffect(() => {
    const timeoutId = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timeoutId);
  }, [messages, scrollToBottom]);

  // Real-time subscription for new messages
  useEffect(() => {
    if (!conversationId) return;

    console.log('Setting up real-time subscription for conversation:', conversationId);

    const subscription = realtimeManager.subscribeToConversation(
      conversationId,
      // On new message
      (newMessage) => {
        console.log('New message received:', newMessage);
        
        // Create a full message object with sender info
        const fullMessage: MessageWithSender = {
          id: newMessage.id,
          content: newMessage.content,
          created_at: newMessage.created_at,
          sender_id: newMessage.sender_id,
          message_type: newMessage.message_type,
          sender: {
            id: newMessage.sender_id,
            username: 'loading...',
            display_name: 'Loading...',
            avatar_emoji: '😊'
          }
        };

        // Add message to state
        setMessages(prevMessages => {
          // Check if message already exists (prevent duplicates)
          const existingMessage = prevMessages.find(msg => msg.id === newMessage.id);
          if (existingMessage) {
            return prevMessages;
          }

          // Add new message
          const newMessages = [...prevMessages, fullMessage];
          
          // Show notification if message is not from current user
          if (newMessage.sender_id !== currentUserId && enableNotifications) {
            showMessageNotification(
              friendName,
              newMessage.content,
              () => {
                // Focus the conversation when notification is clicked
                window.focus();
                scrollToBottom();
              }
            );
          }

          return newMessages;
        });

        // Invalidate and refetch to get complete message data
        queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      },
      // On message update
      (updatedMessage) => {
        console.log('Message updated:', updatedMessage);
        
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg.id === updatedMessage.id 
              ? { ...msg, content: updatedMessage.content, updated_at: updatedMessage.updated_at }
              : msg
          )
        );
      },
      // On message delete
      (deletedMessage) => {
        console.log('Message deleted:', deletedMessage);
        
        setMessages(prevMessages =>
          prevMessages.map(msg =>
            msg.id === deletedMessage.id
              ? { ...msg, is_deleted: true, content: '[Mensagem deletada]' }
              : msg
          )
        );
      }
    );

    return () => {
      realtimeManager.unsubscribe(`conversation:${conversationId}`);
    };
  }, [conversationId, currentUserId, friendName, enableNotifications, queryClient, scrollToBottom]);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (request: SendMessageRequest) => {
      return await sendMessageApi(request);
    },
    onSuccess: (newMessage) => {
      console.log('Message sent successfully:', newMessage);
      // Real-time subscription will handle adding the message to state
    },
    onError: (error: any) => {
      console.error('Error sending message:', error);
      setError(error.message || 'Erro ao enviar mensagem');
    }
  });

  // Edit message mutation
  const editMessageMutation = useMutation({
    mutationFn: async ({ messageId, content }: { messageId: string; content: string }) => {
      return await editMessageApi(messageId, content, currentUserId);
    },
    onSuccess: () => {
      console.log('Message edited successfully');
      // Real-time subscription will handle updating the message in state
    },
    onError: (error: any) => {
      console.error('Error editing message:', error);
      setError(error.message || 'Erro ao editar mensagem');
    }
  });

  // Delete message mutation
  const deleteMessageMutation = useMutation({
    mutationFn: async (messageId: string) => {
      return await deleteMessageApi(messageId, currentUserId);
    },
    onSuccess: () => {
      console.log('Message deleted successfully');
      // Real-time subscription will handle updating the message in state
    },
    onError: (error: any) => {
      console.error('Error deleting message:', error);
      setError(error.message || 'Erro ao deletar mensagem');
    }
  });

  // Send message function
  const sendMessage = useCallback(async (content: string, messageType: string = 'text') => {
    if (!content.trim()) return;

    try {
      setError(null);
      await sendMessageMutation.mutateAsync({
        conversationId,
        senderId: currentUserId,
        content: content.trim(),
        messageType
      });
    } catch (error) {
      console.error('Error in sendMessage:', error);
    }
  }, [conversationId, currentUserId, sendMessageMutation]);

  // Edit message function
  const editMessage = useCallback(async (messageId: string, content: string) => {
    if (!content.trim()) return;

    try {
      setError(null);
      await editMessageMutation.mutateAsync({ messageId, content: content.trim() });
    } catch (error) {
      console.error('Error in editMessage:', error);
    }
  }, [editMessageMutation]);

  // Delete message function
  const deleteMessage = useCallback(async (messageId: string) => {
    try {
      setError(null);
      await deleteMessageMutation.mutateAsync(messageId);
    } catch (error) {
      console.error('Error in deleteMessage:', error);
    }
  }, [deleteMessageMutation]);

  // Retry function
  const retry = useCallback(() => {
    setError(null);
    refetch();
  }, [refetch]);

  // Clear error function
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Determine if someone is typing (placeholder for future implementation)
  useEffect(() => {
    // This would be implemented with real-time typing indicators
    // For now, we'll just set it to false
    setIsTyping(false);
  }, []);

  return {
    messages,
    loading,
    error,
    sendMessage,
    editMessage,
    deleteMessage,
    isTyping,
    messagesEndRef,
    scrollToBottom,
    retry,
    clearError
  };
}

// Export default
export default useChat;