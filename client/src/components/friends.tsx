import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Plus, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useAllFriendsData } from "@/hooks/use-friends";
import { useActiveChat } from "@/hooks/use-conversations";
import FriendCard from "@/components/friends/FriendCard";
import AddFriendModal from "@/components/friends/AddFriendModal";
import FriendRequestsList from "@/components/friends/FriendRequestsList";

interface FriendsProps {
  userId: number;
}

export default function Friends({ userId }: FriendsProps) {
  const [isAddingFriend, setIsAddingFriend] = useState(false);
  const [showExpandedRequests, setShowExpandedRequests] = useState(false);
  const { toast } = useToast();

  const {
    friends,
    requests,
    isLoading,
    error,
    addFriend,
    removeFriend,
    isAddingFriend: isAddingFriendLoading,
    isRemovingFriend,
  } = useAllFriendsData(userId);

  const { openChatWith } = useActiveChat(userId);

  const handleAddFriend = (username: string) => {
    addFriend(username);
  };

  const handleRemoveFriend = (friendId: number) => {
    removeFriend(friendId);
  };

  const handleStartChat = (friendId: number) => {
    openChatWith(friendId);
  };

  const onlineFriends = friends.filter(friend => friend.friend.isOnline);
  const offlineFriends = friends.filter(friend => !friend.friend.isOnline);

  if (isLoading) {
    return (
      <Card className="bg-white/95 backdrop-blur-sm shadow-xl" data-section="friends">
        <CardContent className="p-8">
          <div className="text-center">
            <div className="animate-spin w-12 h-12 border-4 border-pink-400 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Carregando seus amigos...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-white/95 backdrop-blur-sm shadow-xl" data-section="friends">
        <CardContent className="p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Users className="w-8 h-8 text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Erro ao carregar amigos</h3>
            <p className="text-gray-500 mb-4">Tente novamente em alguns instantes.</p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-pink-400 hover:bg-pink-500 text-white"
            >
              Tentar Novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Friend Requests Section */}
      {requests.length > 0 && (
        <FriendRequestsList
          userId={userId}
          isExpanded={showExpandedRequests}
          onToggleExpanded={() => setShowExpandedRequests(!showExpandedRequests)}
        />
      )}

      {/* Friends List Section */}
      <Card className="bg-white/95 backdrop-blur-sm shadow-xl" data-section="friends">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-purple-400" />
              <span className="text-xl sm:text-2xl font-bold text-gray-800">Meus Amigos</span>
              {friends.length > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">({friends.length} amigos)</span>
                  {onlineFriends.length > 0 && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      {onlineFriends.length} online
                    </span>
                  )}
                </div>
              )}
            </div>
            <Button 
              size="sm" 
              onClick={() => setIsAddingFriend(true)}
              className="bg-pink-400 hover:bg-pink-500 px-3 sm:px-4"
            >
              <Plus className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Adicionar Amigo</span>
              <span className="sm:hidden">+</span>
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {friends.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-purple-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Users className="h-12 w-12 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Nenhum amigo ainda</h3>
              <p className="text-gray-500 mb-4">Adicione seus primeiros amigos para começar a se divertir juntos!</p>
              <Button
                onClick={() => setIsAddingFriend(true)}
                className="bg-pink-400 hover:bg-pink-500 text-white px-6 py-2"
              >
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Primeiro Amigo
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Online Friends */}
              {onlineFriends.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
                    <span className="text-green-500 mr-2">🟢</span>
                    Online ({onlineFriends.length})
                  </h3>
                  <div className="space-y-3">
                    <AnimatePresence mode="popLayout">
                      {onlineFriends.map((friend) => (
                        <FriendCard
                          key={friend.id}
                          friend={friend}
                          userId={userId}
                          onStartChat={handleStartChat}
                          onRemoveFriend={handleRemoveFriend}
                          isRemoving={isRemovingFriend}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              {/* Offline Friends */}
              {offlineFriends.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
                    <span className="text-gray-400 mr-2">⚪</span>
                    Offline ({offlineFriends.length})
                  </h3>
                  <div className="space-y-3">
                    <AnimatePresence mode="popLayout">
                      {offlineFriends.map((friend) => (
                        <FriendCard
                          key={friend.id}
                          friend={friend}
                          userId={userId}
                          onStartChat={handleStartChat}
                          onRemoveFriend={handleRemoveFriend}
                          isRemoving={isRemovingFriend}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Friend Modal */}
      <AddFriendModal
        isOpen={isAddingFriend}
        onClose={() => setIsAddingFriend(false)}
        userId={userId}
        onAddFriend={handleAddFriend}
        isAddingFriend={isAddingFriendLoading}
      />
    </div>
  );
}
