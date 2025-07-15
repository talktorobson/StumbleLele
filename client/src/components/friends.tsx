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

interface FriendsProps {
  userId: number;
}

export default function Friends({ userId }: FriendsProps) {
  const [newFriendName, setNewFriendName] = useState("");
  const [isAddingFriend, setIsAddingFriend] = useState(false);
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
      const response = await apiRequest("PATCH", `/api/friends/${userId}/${friendName}`, {
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
            <Users className="mr-2 h-5 w-5 text-purple-400" />
            <span className="text-2xl font-bold text-gray-800">Amigos da Lele</span>
          </div>
          <Dialog open={isAddingFriend} onOpenChange={setIsAddingFriend}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-pink-400 hover:bg-pink-500">
                <Plus className="mr-1 h-4 w-4" />
                Convidar
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {friends.map((friend: any) => (
            <div
              key={friend.id}
              className="bg-gradient-to-br from-pink-100 to-purple-100 rounded-2xl p-4 text-center game-card-hover cursor-pointer"
            >
              <div className="w-16 h-16 bg-teal-400 rounded-full mx-auto mb-3 flex items-center justify-center">
                <User className="h-8 w-8 text-white" />
              </div>
              <h4 className="font-semibold text-gray-800 text-sm mb-1">{friend.friendName}</h4>
              <Badge className={`${getStatusColor(friend.status)} text-white text-xs mb-2`}>
                {getStatusText(friend.status)}
              </Badge>
              <Button
                size="sm"
                className="w-full bg-white/80 hover:bg-white text-gray-700 text-xs"
                onClick={() => {
                  toast({
                    title: `Conversando com ${friend.friendName}`,
                    description: "A Lele está ajudando vocês a conversar!",
                  });
                }}
              >
                <MessageCircle className="mr-1 h-3 w-3" />
                Conversar
              </Button>
            </div>
          ))}
          
          {/* Add Friend Card */}
          <div
            className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-2xl p-4 text-center hover:border-pink-400 transition-colors cursor-pointer"
            onClick={() => setIsAddingFriend(true)}
          >
            <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-3 flex items-center justify-center">
              <Plus className="h-8 w-8 text-gray-400" />
            </div>
            <h4 className="font-semibold text-gray-600 text-sm mb-1">Adicionar</h4>
            <p className="text-xs text-gray-500 mb-2">Novo amigo</p>
            <Button
              size="sm"
              className="w-full bg-pink-400 hover:bg-pink-500 text-white text-xs"
            >
              Convidar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
