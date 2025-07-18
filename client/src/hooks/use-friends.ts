// Custom React hooks for Friends Chat System
// Based on Agent 2's API endpoints and Agent 4's real-time preparation

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import {
  getFriends,
  getFriendRequests,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
  searchUsers,
  handleApiError
} from '@/lib/chat-api';
import type { FriendWithUser, FriendRequest, UserProfile } from '@/types/chat';

// Hook for managing user's friends
export function useFriends(userId: number) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: friends = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['friends', userId],
    queryFn: () => getFriends(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const addFriendMutation = useMutation({
    mutationFn: (friendUsername: string) => sendFriendRequest({ userId, friendUsername }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends', userId] });
      toast({
        title: "Pedido enviado! 🎉",
        description: "Seu pedido de amizade foi enviado com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao enviar pedido",
        description: handleApiError(error),
        variant: "destructive",
      });
    },
  });

  const removeFriendMutation = useMutation({
    mutationFn: (friendId: number) => removeFriend(userId, friendId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends', userId] });
      toast({
        title: "Amigo removido",
        description: "Amigo foi removido da sua lista.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao remover amigo",
        description: handleApiError(error),
        variant: "destructive",
      });
    },
  });

  return {
    friends,
    isLoading,
    error,
    refetch,
    addFriend: addFriendMutation.mutate,
    removeFriend: removeFriendMutation.mutate,
    isAddingFriend: addFriendMutation.isPending,
    isRemovingFriend: removeFriendMutation.isPending,
  };
}

// Hook for managing friend requests
export function useFriendRequests(userId: number) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: requests = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['friendRequests', userId],
    queryFn: () => getFriendRequests(userId).then(res => res.requests),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes (more frequent for requests)
  });

  const acceptRequestMutation = useMutation({
    mutationFn: (friendId: number) => acceptFriendRequest({ userId, friendId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friendRequests', userId] });
      queryClient.invalidateQueries({ queryKey: ['friends', userId] });
      toast({
        title: "Novo amigo! 🎉",
        description: "Pedido de amizade aceito com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao aceitar pedido",
        description: handleApiError(error),
        variant: "destructive",
      });
    },
  });

  const rejectRequestMutation = useMutation({
    mutationFn: (friendId: number) => rejectFriendRequest({ userId, friendId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friendRequests', userId] });
      toast({
        title: "Pedido rejeitado",
        description: "Pedido de amizade foi rejeitado.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao rejeitar pedido",
        description: handleApiError(error),
        variant: "destructive",
      });
    },
  });

  return {
    requests,
    isLoading,
    error,
    refetch,
    acceptRequest: acceptRequestMutation.mutate,
    rejectRequest: rejectRequestMutation.mutate,
    isAcceptingRequest: acceptRequestMutation.isPending,
    isRejectingRequest: rejectRequestMutation.isPending,
  };
}

// Hook for user search
export function useUserSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const performSearch = useCallback(async (query: string, currentUserId: number) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const result = await searchUsers(query.trim(), currentUserId);
      setSearchResults(result.users);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResults([]);
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    performSearch,
    clearSearch,
  };
}

// Hook for online friends (filtered from all friends)
export function useOnlineFriends(userId: number) {
  const { friends, isLoading, error } = useFriends(userId);

  const onlineFriends = friends.filter(friend => friend.friend.isOnline);

  return {
    onlineFriends,
    isLoading,
    error,
    count: onlineFriends.length,
  };
}

// Hook for managing friend interactions
export function useFriendActions(userId: number) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const startConversation = useCallback(async (friendId: number) => {
    try {
      // This will be implemented when we create the conversation hooks
      // For now, we'll return a placeholder
      toast({
        title: "Iniciando conversa...",
        description: "Abrindo chat com seu amigo!",
      });
      return `conversation-${userId}-${friendId}`;
    } catch (error) {
      toast({
        title: "Erro ao iniciar conversa",
        description: handleApiError(error),
        variant: "destructive",
      });
    }
  }, [userId, toast]);

  const inviteToGame = useCallback((friendId: number) => {
    toast({
      title: "Convite enviado! 🎮",
      description: "Convite para jogar foi enviado!",
    });
  }, [toast]);

  return {
    startConversation,
    inviteToGame,
  };
}

// Hook for combined friends data (friends + requests)
export function useAllFriendsData(userId: number) {
  const friendsData = useFriends(userId);
  const requestsData = useFriendRequests(userId);

  return {
    friends: friendsData.friends,
    requests: requestsData.requests,
    isLoading: friendsData.isLoading || requestsData.isLoading,
    error: friendsData.error || requestsData.error,
    addFriend: friendsData.addFriend,
    removeFriend: friendsData.removeFriend,
    acceptRequest: requestsData.acceptRequest,
    rejectRequest: requestsData.rejectRequest,
    isAddingFriend: friendsData.isAddingFriend,
    isRemovingFriend: friendsData.isRemovingFriend,
    isAcceptingRequest: requestsData.isAcceptingRequest,
    isRejectingRequest: requestsData.isRejectingRequest,
    refetchFriends: friendsData.refetch,
    refetchRequests: requestsData.refetch,
  };
}