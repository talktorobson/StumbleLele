// Real-time Friends Hook for StumbleLele Friends Chat System
// Provides real-time friend management with notifications
// Author: Agent 4 - Real-time Specialist

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { realtimeManager } from '../lib/supabase-realtime';
import { getCurrentUserId } from '../lib/supabase-client';
import { 
  showFriendRequestNotification, 
  showFriendAcceptedNotification,
  showSystemNotification
} from '../lib/notification-manager';
import {
  getFriends,
  getFriendRequests,
  sendFriendRequest as sendFriendRequestApi,
  acceptFriendRequest as acceptFriendRequestApi,
  rejectFriendRequest as rejectFriendRequestApi,
  removeFriend as removeFriendApi,
  searchUsers
} from '../lib/chat-api';
import type { 
  FriendWithUser, 
  FriendRequestsResponse,
  SendFriendRequestRequest,
  AcceptFriendRequestRequest,
  UsersSearchResponse
} from '../types/chat';

// Hook options
interface UseFriendsOptions {
  enableNotifications?: boolean;
  enableSound?: boolean;
}

// Hook return type
export interface UseFriendsReturn {
  friends: FriendWithUser[];
  friendRequests: FriendRequestsResponse['requests'];
  loading: boolean;
  error: string | null;
  sendFriendRequest: (username: string) => Promise<void>;
  acceptFriendRequest: (friendId: number) => Promise<void>;
  rejectFriendRequest: (friendId: number) => Promise<void>;
  removeFriend: (friendId: number) => Promise<void>;
  searchUsers: (query: string) => Promise<UsersSearchResponse>;
  retry: () => void;
  clearError: () => void;
  refreshFriends: () => void;
  refreshRequests: () => void;
}

// Custom hook for real-time friends management
export function useFriends(options: UseFriendsOptions = {}): UseFriendsReturn {
  const { enableNotifications = true, enableSound = true } = options;
  
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const currentUserId = getCurrentUserId();

  // Fetch friends list
  const { 
    data: friends = [], 
    isLoading: friendsLoading, 
    refetch: refetchFriends,
    error: friendsError
  } = useQuery({
    queryKey: ['friends', currentUserId],
    queryFn: () => getFriends(currentUserId),
    enabled: !!currentUserId,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Fetch friend requests
  const { 
    data: friendRequestsData, 
    isLoading: requestsLoading, 
    refetch: refetchRequests,
    error: requestsError
  } = useQuery({
    queryKey: ['friend-requests', currentUserId],
    queryFn: () => getFriendRequests(currentUserId),
    enabled: !!currentUserId,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 2, // 2 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const friendRequests = friendRequestsData?.requests || [];
  const loading = friendsLoading || requestsLoading;

  // Handle errors
  useEffect(() => {
    if (friendsError) {
      setError(friendsError.message || 'Erro ao carregar amigos');
    } else if (requestsError) {
      setError(requestsError.message || 'Erro ao carregar solicitações');
    }
  }, [friendsError, requestsError]);

  // Real-time subscription for friend requests
  useEffect(() => {
    if (!currentUserId) return;

    console.log('Setting up real-time subscription for friend requests:', currentUserId);

    const subscription = realtimeManager.subscribeToFriendRequests(
      currentUserId,
      // On new friend request
      (newFriend) => {
        console.log('New friend request received:', newFriend);
        
        // Only show notification for incoming requests
        if (newFriend.friend_id === currentUserId && newFriend.status === 'pending') {
          // Refresh friend requests to get complete data
          queryClient.invalidateQueries({ queryKey: ['friend-requests', currentUserId] });
          
          // Show notification if enabled
          if (enableNotifications) {
            showFriendRequestNotification(
              `Usuario ${newFriend.user_id}`, // Username will be fetched when data refreshes
              () => {
                // Focus the app when notification is clicked
                window.focus();
                // Could navigate to friends tab here
              }
            );
          }
        }
      },
      // On friend request update (accept/reject)
      (updatedFriend) => {
        console.log('Friend request updated:', updatedFriend);
        
        // If our outgoing request was accepted
        if (updatedFriend.user_id === currentUserId && updatedFriend.status === 'accepted') {
          // Refresh both friends and requests
          queryClient.invalidateQueries({ queryKey: ['friends', currentUserId] });
          queryClient.invalidateQueries({ queryKey: ['friend-requests', currentUserId] });
          
          // Show notification if enabled
          if (enableNotifications) {
            showFriendAcceptedNotification(
              `Usuario ${updatedFriend.friend_id}`, // Username will be fetched when data refreshes
              () => {
                window.focus();
                // Could navigate to chat with new friend
              }
            );
          }
        }
        // If our incoming request was processed
        else if (updatedFriend.friend_id === currentUserId) {
          // Refresh requests
          queryClient.invalidateQueries({ queryKey: ['friend-requests', currentUserId] });
          
          // If we accepted, also refresh friends
          if (updatedFriend.status === 'accepted') {
            queryClient.invalidateQueries({ queryKey: ['friends', currentUserId] });
          }
        }
      }
    );

    return () => {
      realtimeManager.unsubscribe(`friend_requests:${currentUserId}`);
    };
  }, [currentUserId, enableNotifications, queryClient]);

  // Send friend request mutation
  const sendFriendRequestMutation = useMutation({
    mutationFn: async (username: string) => {
      const request: SendFriendRequestRequest = {
        userId: currentUserId,
        friendUsername: username
      };
      return await sendFriendRequestApi(request);
    },
    onSuccess: () => {
      console.log('Friend request sent successfully');
      // Show success notification
      showSystemNotification(
        'Solicitação enviada',
        'Pedido de amizade enviado com sucesso!'
      );
    },
    onError: (error: any) => {
      console.error('Error sending friend request:', error);
      setError(error.message || 'Erro ao enviar solicitação de amizade');
    }
  });

  // Accept friend request mutation
  const acceptFriendRequestMutation = useMutation({
    mutationFn: async (friendId: number) => {
      const request: AcceptFriendRequestRequest = {
        userId: currentUserId,
        friendId
      };
      return await acceptFriendRequestApi(request);
    },
    onSuccess: () => {
      console.log('Friend request accepted successfully');
      // Refresh both friends and requests
      queryClient.invalidateQueries({ queryKey: ['friends', currentUserId] });
      queryClient.invalidateQueries({ queryKey: ['friend-requests', currentUserId] });
      
      // Show success notification
      showSystemNotification(
        'Amizade aceita',
        'Pedido de amizade aceito com sucesso!'
      );
    },
    onError: (error: any) => {
      console.error('Error accepting friend request:', error);
      setError(error.message || 'Erro ao aceitar solicitação de amizade');
    }
  });

  // Reject friend request mutation
  const rejectFriendRequestMutation = useMutation({
    mutationFn: async (friendId: number) => {
      const request: AcceptFriendRequestRequest = {
        userId: currentUserId,
        friendId
      };
      return await rejectFriendRequestApi(request);
    },
    onSuccess: () => {
      console.log('Friend request rejected successfully');
      // Refresh requests
      queryClient.invalidateQueries({ queryKey: ['friend-requests', currentUserId] });
      
      // Show success notification
      showSystemNotification(
        'Pedido rejeitado',
        'Pedido de amizade rejeitado'
      );
    },
    onError: (error: any) => {
      console.error('Error rejecting friend request:', error);
      setError(error.message || 'Erro ao rejeitar solicitação de amizade');
    }
  });

  // Remove friend mutation
  const removeFriendMutation = useMutation({
    mutationFn: async (friendId: number) => {
      return await removeFriendApi(currentUserId, friendId);
    },
    onSuccess: () => {
      console.log('Friend removed successfully');
      // Refresh friends
      queryClient.invalidateQueries({ queryKey: ['friends', currentUserId] });
      
      // Show success notification
      showSystemNotification(
        'Amigo removido',
        'Amigo removido da sua lista'
      );
    },
    onError: (error: any) => {
      console.error('Error removing friend:', error);
      setError(error.message || 'Erro ao remover amigo');
    }
  });

  // Search users mutation
  const searchUsersMutation = useMutation({
    mutationFn: async (query: string) => {
      return await searchUsers(query, currentUserId);
    },
    onError: (error: any) => {
      console.error('Error searching users:', error);
      setError(error.message || 'Erro ao buscar usuários');
    }
  });

  // Action functions
  const sendFriendRequest = useCallback(async (username: string) => {
    if (!username.trim()) return;
    
    try {
      setError(null);
      await sendFriendRequestMutation.mutateAsync(username.trim());
    } catch (error) {
      console.error('Error in sendFriendRequest:', error);
    }
  }, [sendFriendRequestMutation]);

  const acceptFriendRequest = useCallback(async (friendId: number) => {
    try {
      setError(null);
      await acceptFriendRequestMutation.mutateAsync(friendId);
    } catch (error) {
      console.error('Error in acceptFriendRequest:', error);
    }
  }, [acceptFriendRequestMutation]);

  const rejectFriendRequest = useCallback(async (friendId: number) => {
    try {
      setError(null);
      await rejectFriendRequestMutation.mutateAsync(friendId);
    } catch (error) {
      console.error('Error in rejectFriendRequest:', error);
    }
  }, [rejectFriendRequestMutation]);

  const removeFriend = useCallback(async (friendId: number) => {
    try {
      setError(null);
      await removeFriendMutation.mutateAsync(friendId);
    } catch (error) {
      console.error('Error in removeFriend:', error);
    }
  }, [removeFriendMutation]);

  const searchUsersAction = useCallback(async (query: string): Promise<UsersSearchResponse> => {
    if (!query.trim()) {
      return { users: [] };
    }
    
    try {
      setError(null);
      return await searchUsersMutation.mutateAsync(query.trim());
    } catch (error) {
      console.error('Error in searchUsers:', error);
      return { users: [] };
    }
  }, [searchUsersMutation]);

  // Utility functions
  const retry = useCallback(() => {
    setError(null);
    refetchFriends();
    refetchRequests();
  }, [refetchFriends, refetchRequests]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const refreshFriends = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['friends', currentUserId] });
  }, [queryClient, currentUserId]);

  const refreshRequests = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['friend-requests', currentUserId] });
  }, [queryClient, currentUserId]);

  return {
    friends,
    friendRequests,
    loading,
    error,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,
    searchUsers: searchUsersAction,
    retry,
    clearError,
    refreshFriends,
    refreshRequests
  };
}

// Export default
export default useFriends;