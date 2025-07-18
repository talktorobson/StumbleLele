import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, UserPlus, X, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useUserSearch } from "@/hooks/use-friends";
import { getOnlineStatusEmoji, getOnlineStatusText, getOnlineStatusColor } from "@/lib/chat-api";
import type { UserProfile } from "@/types/chat";

interface AddFriendModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
  onAddFriend: (username: string) => void;
  isAddingFriend?: boolean;
}

export default function AddFriendModal({
  isOpen,
  onClose,
  userId,
  onAddFriend,
  isAddingFriend = false
}: AddFriendModalProps) {
  const [searchInput, setSearchInput] = useState("");
  const { toast } = useToast();
  const { searchQuery, searchResults, isSearching, performSearch, clearSearch } = useUserSearch();

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchInput.trim() && searchInput.trim() !== searchQuery) {
        performSearch(searchInput.trim(), userId);
      } else if (!searchInput.trim()) {
        clearSearch();
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchInput, searchQuery, performSearch, clearSearch, userId]);

  const handleAddFriend = (username: string) => {
    onAddFriend(username);
  };

  const handleClose = () => {
    setSearchInput("");
    clearSearch();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">👥</span>
              <span>Adicionar Novo Amigo</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Digite o nome de usuário do seu amigo..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10 pr-4 py-3 text-base border-2 border-pink-200 rounded-xl focus:border-pink-400 focus:ring-pink-400"
            />
            {(isSearching || searchInput) && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {isSearching ? (
                  <div className="animate-spin w-4 h-4 border-2 border-pink-400 border-t-transparent rounded-full" />
                ) : searchInput && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchInput("");
                      clearSearch();
                    }}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Search Results */}
          <div className="max-h-96 overflow-y-auto">
            <AnimatePresence mode="wait">
              {searchInput && !isSearching && searchResults.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-center py-8"
                >
                  <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Users className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600 font-medium">Nenhum usuário encontrado</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Tente procurar por outro nome de usuário
                  </p>
                </motion.div>
              )}

              {!searchInput && !isSearching && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-center py-8"
                >
                  <div className="w-16 h-16 bg-pink-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Search className="w-8 h-8 text-pink-400" />
                  </div>
                  <p className="text-gray-600 font-medium">Procure por amigos</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Digite o nome de usuário para encontrar novos amigos
                  </p>
                </motion.div>
              )}

              {searchResults.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-3"
                >
                  <h3 className="font-semibold text-gray-700 flex items-center">
                    <Search className="w-4 h-4 mr-2" />
                    Resultados da busca ({searchResults.length})
                  </h3>
                  {searchResults.map((user) => (
                    <UserSearchResult
                      key={user.id}
                      user={user}
                      onAddFriend={handleAddFriend}
                      isAddingFriend={isAddingFriend}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Helper Text */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>Dica:</strong> Digite o nome de usuário exato do seu amigo para encontrá-lo mais facilmente!
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// User Search Result Component
interface UserSearchResultProps {
  user: UserProfile;
  onAddFriend: (username: string) => void;
  isAddingFriend?: boolean;
}

function UserSearchResult({ user, onAddFriend, isAddingFriend }: UserSearchResultProps) {
  const [isAdding, setIsAdding] = useState(false);
  const { toast } = useToast();

  const handleAddFriend = async () => {
    setIsAdding(true);
    try {
      await onAddFriend(user.username);
      toast({
        title: "Pedido enviado! 🎉",
        description: `Pedido de amizade enviado para ${user.displayName || user.username}!`,
      });
    } catch (error) {
      toast({
        title: "Erro ao enviar pedido",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="border-2 border-pink-100 hover:border-pink-200 transition-colors">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            {/* Avatar */}
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-300 to-purple-300 rounded-full flex items-center justify-center text-2xl">
                {user.avatarEmoji}
              </div>
              {/* Online status indicator */}
              <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                user.isOnline ? 'bg-green-400' : 'bg-gray-400'
              }`}>
                {getOnlineStatusEmoji(user.isOnline)}
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-gray-800 truncate">
                {user.displayName || user.username}
              </h4>
              <p className="text-sm text-gray-600 truncate">
                @{user.username}
              </p>
              <Badge 
                variant="secondary" 
                className={`text-xs mt-1 ${getOnlineStatusColor(user.isOnline)}`}
              >
                {getOnlineStatusText(user.isOnline)}
              </Badge>
            </div>

            {/* Add Friend Button */}
            <Button
              size="sm"
              onClick={handleAddFriend}
              disabled={isAdding || isAddingFriend}
              className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-full shadow-md hover:shadow-lg transition-all duration-200"
            >
              {isAdding ? (
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Adicionar</span>
                  <span className="sm:hidden">+</span>
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}