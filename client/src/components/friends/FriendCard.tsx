import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MessageCircle, Gamepad2, UserMinus, MoreHorizontal } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useFriendActions } from "@/hooks/use-friends";
import { formatConversationDate, getOnlineStatusEmoji, getOnlineStatusText, getOnlineStatusColor } from "@/lib/chat-api";
import type { FriendWithUser } from "@/types/chat";

interface FriendCardProps {
  friend: FriendWithUser;
  userId: number;
  onStartChat: (friendId: number) => void;
  onRemoveFriend: (friendId: number) => void;
  isRemoving?: boolean;
}

export default function FriendCard({ 
  friend, 
  userId, 
  onStartChat, 
  onRemoveFriend, 
  isRemoving = false 
}: FriendCardProps) {
  const [showActions, setShowActions] = useState(false);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const { toast } = useToast();
  const { inviteToGame } = useFriendActions(userId);

  const handleStartChat = () => {
    onStartChat(friend.friend.id);
    toast({
      title: "Abrindo conversa! 💬",
      description: `Iniciando conversa com ${friend.friend.displayName || friend.friend.username}!`,
    });
  };

  const handleInviteToGame = () => {
    inviteToGame(friend.friend.id);
  };

  const handleRemoveFriend = () => {
    onRemoveFriend(friend.friend.id);
    setShowRemoveDialog(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <Card className="bg-gradient-to-br from-pink-50 to-purple-50 border-2 border-pink-200 hover:border-pink-300 transition-all duration-200 hover:shadow-lg cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            {/* Avatar */}
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-300 to-purple-300 rounded-full flex items-center justify-center text-3xl shadow-lg">
                {friend.friend.avatarEmoji}
              </div>
              {/* Online status indicator */}
              <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                friend.friend.isOnline ? 'bg-green-400' : 'bg-gray-400'
              }`}>
                {getOnlineStatusEmoji(friend.friend.isOnline)}
              </div>
            </div>

            {/* Friend Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg text-gray-800 truncate">
                {friend.friend.displayName || friend.friend.username}
              </h3>
              <p className="text-sm text-gray-600 truncate">
                @{friend.friend.username}
              </p>
              <Badge 
                variant="secondary" 
                className={`text-xs mt-1 ${getOnlineStatusColor(friend.friend.isOnline)}`}
              >
                {getOnlineStatusText(friend.friend.isOnline)}
              </Badge>
              {friend.friend.lastSeen && !friend.friend.isOnline && (
                <p className="text-xs text-gray-500 mt-1">
                  Visto {formatConversationDate(friend.friend.lastSeen)}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col space-y-2">
              <Button
                size="sm"
                onClick={handleStartChat}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full shadow-md hover:shadow-lg transition-all duration-200"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Conversar</span>
                <span className="sm:hidden">Chat</span>
              </Button>
              
              <Button
                size="sm"
                onClick={handleInviteToGame}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full shadow-md hover:shadow-lg transition-all duration-200"
              >
                <Gamepad2 className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Jogar</span>
                <span className="sm:hidden">🎮</span>
              </Button>

              {/* More actions */}
              <Dialog open={showActions} onOpenChange={setShowActions}>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    className="px-3 py-2 rounded-full"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-sm">
                  <DialogHeader>
                    <DialogTitle className="flex items-center space-x-2">
                      <span className="text-2xl">{friend.friend.avatarEmoji}</span>
                      <span>{friend.friend.displayName || friend.friend.username}</span>
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowActions(false);
                        setShowRemoveDialog(true);
                      }}
                      className="w-full bg-red-50 hover:bg-red-100 text-red-600 border-red-200"
                    >
                      <UserMinus className="w-4 h-4 mr-2" />
                      Remover Amigo
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Remove Friend Confirmation Dialog */}
      <Dialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-center">
              Remover {friend.friend.displayName || friend.friend.username}?
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-center text-gray-600">
              Tem certeza que quer remover este amigo? Vocês não poderão mais conversar.
            </p>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowRemoveDialog(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleRemoveFriend}
                disabled={isRemoving}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white"
              >
                {isRemoving ? "Removendo..." : "Remover"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}