import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, Plus, User, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import FriendChat from "@/components/friend-chat";

interface FriendsProps {
  userId: number;
}

export default function Friends({ userId }: FriendsProps) {
  const [newFriendName, setNewFriendName] = useState("");
  const [isAddingFriend, setIsAddingFriend] = useState(false);
  const [activeChatFriend, setActiveChatFriend] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: friends = [] } = useQuery({
    queryKey: ["/api/friends", userId],
  });

  const addFriendMutation = useMutation({
    mutationFn: async (friendName: string) => {
      const response = await apiRequest("POST", "/api/friends", {
        userId,
        friendName,
        status: "online",
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/friends", userId] });
      setNewFriendName("");
      setIsAddingFriend(false);
      toast({
        title: "Novo amigo! 🎉",
        description: "A Lele ficou feliz em conhecer seu novo amigo!",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não consegui adicionar o amigo. Tenta de novo!",
        variant: "destructive",
      });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ friendName, status }: { friendName: string; status: string }) => {
      const response = await apiRequest("PATCH", `/api/friends/${userId}/${encodeURIComponent(friendName)}`, {
        status,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/friends", userId] });
    },
  });

  const handleAddFriend = () => {
    if (newFriendName.trim()) {
      addFriendMutation.mutate(newFriendName.trim());
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-400";
      case "offline":
        return "bg-gray-400";
      case "playing":
        return "bg-blue-400";
      default:
        return "bg-gray-400";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "online":
        return "Online";
      case "offline":
        return "Offline";
      case "playing":
        return "Jogando";
      default:
        return "Offline";
    }
  };

  return (
    <Card className="bg-white/95 backdrop-blur-sm shadow-xl" data-section="friends">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Users className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-purple-400" />
            <span className="text-xl sm:text-2xl font-bold text-gray-800">Amigos da Lele</span>
          </div>
          <Dialog open={isAddingFriend} onOpenChange={setIsAddingFriend}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-pink-400 hover:bg-pink-500 px-2 sm:px-3">
                <Plus className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Convidar</span>
                <span className="sm:hidden">+</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Novo Amigo</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    Nome do amigo
                  </label>
                  <Input
                    placeholder="Digite o nome do seu amigo..."
                    value={newFriendName}
                    onChange={(e) => setNewFriendName(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleAddFriend()}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsAddingFriend(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleAddFriend}
                    disabled={!newFriendName.trim() || addFriendMutation.isPending}
                  >
                    {addFriendMutation.isPending ? "Adicionando..." : "Adicionar"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
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
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {friends.map((friend: any) => (
            <div
              key={friend.id}
              className="bg-gradient-to-br from-pink-100 to-purple-100 rounded-2xl p-3 sm:p-4 text-center game-card-hover cursor-pointer"
            >
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-teal-400 rounded-full mx-auto mb-2 sm:mb-3 flex items-center justify-center">
                <User className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <h4 className="font-semibold text-gray-800 text-xs sm:text-sm mb-1 truncate">{friend.friend_name}</h4>
              <Badge 
                className={`${getStatusColor(friend.status)} text-white text-xs mb-2 px-2 py-1 cursor-pointer hover:opacity-80`}
                onClick={() => {
                  const newStatus = friend.status === 'online' ? 'offline' : 'online';
                  updateStatusMutation.mutate({ friendName: friend.friend_name, status: newStatus });
                }}
              >
                {getStatusText(friend.status)}
              </Badge>
              <div className="space-y-1">
                <Button
                  size="sm"
                  className="w-full bg-green-400 hover:bg-green-500 text-white text-xs px-2 py-1"
                  onClick={() => {
                    setActiveChatFriend(friend);
                  }}
                >
                  <MessageCircle className="mr-1 h-2 w-2 sm:h-3 sm:w-3" />
                  <span className="hidden sm:inline">Conversar</span>
                  <span className="sm:hidden">Chat</span>
                </Button>
                <Button
                  size="sm"
                  className="w-full bg-blue-400 hover:bg-blue-500 text-white text-xs px-2 py-1"
                  onClick={() => {
                    updateStatusMutation.mutate({ friendName: friend.friend_name, status: 'playing' });
                    toast({
                      title: `🎮 Jogando com ${friend.friend_name}`,
                      description: "Vamos jogar juntos!",
                    });
                  }}
                >
                  <span className="hidden sm:inline">Jogar</span>
                  <span className="sm:hidden">▶️</span>
                </Button>
              </div>
            </div>
          ))}
          
          {/* Add Friend Card */}
          <div
            className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-2xl p-3 sm:p-4 text-center hover:border-pink-400 transition-colors cursor-pointer"
            onClick={() => setIsAddingFriend(true)}
          >
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 rounded-full mx-auto mb-2 sm:mb-3 flex items-center justify-center">
              <Plus className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
            </div>
            <h4 className="font-semibold text-gray-600 text-xs sm:text-sm mb-1">Adicionar</h4>
            <p className="text-xs text-gray-500 mb-2">Novo amigo</p>
            <Button
              size="sm"
              className="w-full bg-pink-400 hover:bg-pink-500 text-white text-xs px-2 py-1"
            >
              Convidar
            </Button>
          </div>
          </div>
        )}
      </CardContent>
      
      {/* Friend Chat Modal */}
      {activeChatFriend && (
        <FriendChat
          friend={activeChatFriend}
          isOpen={!!activeChatFriend}
          onClose={() => setActiveChatFriend(null)}
          userId={userId}
        />
      )}
    </Card>
  );
}
