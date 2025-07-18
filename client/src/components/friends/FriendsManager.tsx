// Enhanced Friends Manager with Real-time Capabilities
// Integrates with the useFriends hook for real-time friend management
// Author: Agent 4 - Real-time Specialist

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Users, 
  UserPlus, 
  Search, 
  CheckCircle, 
  XCircle, 
  MessageCircle,
  MoreHorizontal,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { useFriends } from '@/hooks/useFriends';
import { getCurrentUserId } from '@/lib/supabase-client';
import { getOnlineStatusEmoji, getOnlineStatusColor } from '@/lib/chat-api';
import type { User, FriendWithUser, FriendRequest } from '@/types/chat';

interface FriendsManagerProps {
  onStartChat?: (friend: User) => void;
  className?: string;
}

export default function FriendsManager({ onStartChat, className = '' }: FriendsManagerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [newFriendUsername, setNewFriendUsername] = useState('');
  const [activeTab, setActiveTab] = useState('friends');
  
  const { toast } = useToast();
  const currentUserId = getCurrentUserId();
  
  const {
    friends,
    friendRequests,
    loading,
    error,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,
    searchUsers,
    retry,
    clearError,
    refreshFriends,
    refreshRequests
  } = useFriends({
    enableNotifications: true,
    enableSound: true
  });

  // Search for users
  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchUsers(query);
      setSearchResults(results.users);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Send friend request
  const handleSendFriendRequest = async (username: string) => {
    if (!username.trim()) return;

    try {
      await sendFriendRequest(username);
      setNewFriendUsername('');
      setShowAddFriend(false);
      toast({
        title: '✅ Solicitação enviada!',
        description: `Pedido de amizade enviado para ${username}`,
      });
    } catch (error) {
      console.error('Send friend request error:', error);
    }
  };

  // Accept friend request
  const handleAcceptFriend = async (friendId: number) => {
    try {
      await acceptFriendRequest(friendId);
      toast({
        title: '🎉 Amigo adicionado!',
        description: 'Pedido de amizade aceito com sucesso',
      });
    } catch (error) {
      console.error('Accept friend request error:', error);
    }
  };

  // Reject friend request
  const handleRejectFriend = async (friendId: number) => {
    try {
      await rejectFriendRequest(friendId);
      toast({
        title: '❌ Pedido rejeitado',
        description: 'Pedido de amizade rejeitado',
      });
    } catch (error) {
      console.error('Reject friend request error:', error);
    }
  };

  // Remove friend
  const handleRemoveFriend = async (friendId: number) => {
    try {
      await removeFriend(friendId);
      toast({
        title: '🗑️ Amigo removido',
        description: 'Amigo removido da sua lista',
      });
    } catch (error) {
      console.error('Remove friend error:', error);
    }
  };

  // Start chat with friend
  const handleStartChat = (friend: User) => {
    if (onStartChat) {
      onStartChat(friend);
    }
  };

  // Check if user is already a friend
  const isAlreadyFriend = (userId: number) => {
    return friends.some(friend => friend.friend.id === userId);
  };

  // Check if there's a pending request
  const hasPendingRequest = (userId: number) => {
    return friendRequests.some(request => request.user.id === userId);
  };

  if (error) {
    return (
      <Card className={`bg-white/95 backdrop-blur-sm shadow-xl ${className}`}>
        <CardContent className="p-8">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Erro ao carregar amigos
            </h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <Button onClick={retry} className="bg-pink-400 hover:bg-pink-500 text-white">
              Tentar Novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-white/95 backdrop-blur-sm shadow-xl ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="w-6 h-6 text-pink-500" />
            Amigos
          </CardTitle>
          <Dialog open={showAddFriend} onOpenChange={setShowAddFriend}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 text-white">
                <UserPlus className="w-4 h-4 mr-2" />
                Adicionar
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Adicionar Amigo</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Nome de usuário
                  </label>
                  <Input
                    value={newFriendUsername}
                    onChange={(e) => setNewFriendUsername(e.target.value)}
                    placeholder="Digite o nome de usuário"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleSendFriendRequest(newFriendUsername);
                      }
                    }}
                  />
                </div>
                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowAddFriend(false)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={() => handleSendFriendRequest(newFriendUsername)}
                    disabled={!newFriendUsername.trim()}
                    className="flex-1 bg-pink-400 hover:bg-pink-500 text-white"
                  >
                    Enviar Pedido
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="friends" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Amigos
              {friends.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {friends.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="requests" className="flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              Pedidos
              {friendRequests.length > 0 && (
                <Badge variant="destructive" className="ml-1">
                  {friendRequests.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="search" className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              Buscar
            </TabsTrigger>
          </TabsList>

          {/* Friends List */}
          <TabsContent value="friends" className="space-y-4">
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <Loader2 className="w-8 h-8 text-pink-400 animate-spin" />
              </div>
            ) : friends.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Nenhum amigo ainda
                </h3>
                <p className="text-gray-500 mb-4">
                  Adicione amigos para começar a conversar!
                </p>
                <Button
                  onClick={() => setShowAddFriend(true)}
                  className="bg-pink-400 hover:bg-pink-500 text-white"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Adicionar Primeiro Amigo
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence>
                  {friends.map((friend) => (
                    <motion.div
                      key={friend.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <FriendCard
                        friend={friend}
                        onStartChat={handleStartChat}
                        onRemove={handleRemoveFriend}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </TabsContent>

          {/* Friend Requests */}
          <TabsContent value="requests" className="space-y-4">
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <Loader2 className="w-8 h-8 text-pink-400 animate-spin" />
              </div>
            ) : friendRequests.length === 0 ? (
              <div className="text-center py-8">
                <UserPlus className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Nenhuma solicitação
                </h3>
                <p className="text-gray-500">
                  Você não tem pedidos de amizade pendentes
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence>
                  {friendRequests.map((request) => (
                    <motion.div
                      key={request.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <FriendRequestCard
                        request={request}
                        onAccept={handleAcceptFriend}
                        onReject={handleRejectFriend}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </TabsContent>

          {/* Search Users */}
          <TabsContent value="search" className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar usuários por nome..."
                className="pl-10"
              />
            </div>

            {isSearching ? (
              <div className="flex justify-center items-center h-32">
                <Loader2 className="w-8 h-8 text-pink-400 animate-spin" />
              </div>
            ) : searchResults.length === 0 && searchQuery.trim() ? (
              <div className="text-center py-8">
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Nenhum usuário encontrado
                </h3>
                <p className="text-gray-500">
                  Tente buscar com outro nome
                </p>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-3">
                <AnimatePresence>
                  {searchResults.map((user) => (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <UserSearchResult
                        user={user}
                        isAlreadyFriend={isAlreadyFriend(user.id)}
                        hasPendingRequest={hasPendingRequest(user.id)}
                        onSendRequest={() => handleSendFriendRequest(user.username)}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : null}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

// Friend Card Component
function FriendCard({ 
  friend, 
  onStartChat, 
  onRemove 
}: { 
  friend: FriendWithUser; 
  onStartChat: (friend: User) => void; 
  onRemove: (friendId: number) => void; 
}) {
  const [showActions, setShowActions] = useState(false);

  return (
    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg border border-pink-200/50 hover:border-pink-300 transition-all">
      <div className="flex items-center space-x-3">
        <div className="relative">
          <div className="w-12 h-12 bg-gradient-to-br from-pink-300 to-purple-300 rounded-full flex items-center justify-center text-2xl shadow-md">
            {friend.friend.avatar_emoji}
          </div>
          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-xs ${
            friend.friend.is_online ? 'bg-green-400' : 'bg-gray-400'
          }`}>
            {getOnlineStatusEmoji(friend.friend.is_online)}
          </div>
        </div>
        <div>
          <h3 className="font-semibold text-gray-800">
            {friend.friend.display_name || friend.friend.username}
          </h3>
          <p className="text-sm text-gray-600">
            @{friend.friend.username}
          </p>
          <p className={`text-xs ${getOnlineStatusColor(friend.friend.is_online)}`}>
            {friend.friend.is_online ? 'Online' : 'Offline'}
          </p>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <Button
          size="sm"
          onClick={() => onStartChat(friend.friend)}
          className="bg-blue-400 hover:bg-blue-500 text-white"
        >
          <MessageCircle className="w-4 h-4" />
        </Button>
        <Dialog open={showActions} onOpenChange={setShowActions}>
          <DialogTrigger asChild>
            <Button size="sm" variant="ghost">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Ações do Amigo</DialogTitle>
            </DialogHeader>
            <div className="space-y-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  onStartChat(friend.friend);
                  setShowActions(false);
                }}
                className="w-full justify-start"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Iniciar Conversa
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  onRemove(friend.friend.id);
                  setShowActions(false);
                }}
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Remover Amigo
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

// Friend Request Card Component
function FriendRequestCard({ 
  request, 
  onAccept, 
  onReject 
}: { 
  request: FriendRequest; 
  onAccept: (friendId: number) => void; 
  onReject: (friendId: number) => void; 
}) {
  return (
    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200/50">
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 bg-gradient-to-br from-yellow-300 to-orange-300 rounded-full flex items-center justify-center text-2xl shadow-md">
          {request.user.avatar_emoji}
        </div>
        <div>
          <h3 className="font-semibold text-gray-800">
            {request.user.display_name || request.user.username}
          </h3>
          <p className="text-sm text-gray-600">
            @{request.user.username}
          </p>
          <p className="text-xs text-gray-500">
            Enviado em {new Date(request.created_at).toLocaleDateString('pt-BR')}
          </p>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <Button
          size="sm"
          onClick={() => onAccept(request.user.id)}
          className="bg-green-400 hover:bg-green-500 text-white"
        >
          <CheckCircle className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          onClick={() => onReject(request.user.id)}
          variant="outline"
          className="border-red-200 text-red-600 hover:bg-red-50"
        >
          <XCircle className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

// User Search Result Component
function UserSearchResult({ 
  user, 
  isAlreadyFriend, 
  hasPendingRequest, 
  onSendRequest 
}: { 
  user: User; 
  isAlreadyFriend: boolean; 
  hasPendingRequest: boolean; 
  onSendRequest: () => void; 
}) {
  return (
    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-all">
      <div className="flex items-center space-x-3">
        <div className="relative">
          <div className="w-12 h-12 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center text-2xl shadow-md">
            {user.avatar_emoji}
          </div>
          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-xs ${
            user.is_online ? 'bg-green-400' : 'bg-gray-400'
          }`}>
            {getOnlineStatusEmoji(user.is_online)}
          </div>
        </div>
        <div>
          <h3 className="font-semibold text-gray-800">
            {user.display_name || user.username}
          </h3>
          <p className="text-sm text-gray-600">
            @{user.username}
          </p>
          <p className={`text-xs ${getOnlineStatusColor(user.is_online)}`}>
            {user.is_online ? 'Online' : 'Offline'}
          </p>
        </div>
      </div>
      
      <div>
        {isAlreadyFriend ? (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Já é amigo
          </Badge>
        ) : hasPendingRequest ? (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            Pedido pendente
          </Badge>
        ) : (
          <Button
            size="sm"
            onClick={onSendRequest}
            className="bg-pink-400 hover:bg-pink-500 text-white"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Adicionar
          </Button>
        )}
      </div>
    </div>
  );
}