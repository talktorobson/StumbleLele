import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Search, Users, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useConversationList } from "@/hooks/use-conversations";
import { formatConversationDate, formatMessageTime, getOtherUserInConversation, getOnlineStatusEmoji } from "@/lib/chat-api";
import type { ConversationWithUsers } from "@/types/chat";

interface ConversationsListProps {
  userId: number;
  onSelectConversation: (conversationId: string) => void;
  activeConversationId?: string | null;
}

export default function ConversationsList({ 
  userId, 
  onSelectConversation, 
  activeConversationId 
}: ConversationsListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  
  const { 
    conversations, 
    isLoading, 
    error, 
    totalCount, 
    activeCount 
  } = useConversationList(userId);

  // Filter conversations based on search query
  const filteredConversations = conversations.filter(conv => {
    const otherUser = getOtherUserInConversation(conv, userId);
    const displayName = otherUser.displayName || otherUser.username;
    const username = otherUser.username;
    
    return displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
           username.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (isLoading) {
    return (
      <Card className="bg-white/95 backdrop-blur-sm shadow-xl">
        <CardContent className="p-8">
          <div className="text-center">
            <div className="animate-spin w-12 h-12 border-4 border-pink-400 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Carregando conversas...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-white/95 backdrop-blur-sm shadow-xl">
        <CardContent className="p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <MessageCircle className="w-8 h-8 text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Erro ao carregar conversas</h3>
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
    <Card className="bg-white/95 backdrop-blur-sm shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageCircle className="h-5 w-5 text-purple-400" />
            <span className="text-xl sm:text-2xl font-bold text-gray-800">Conversas</span>
            {totalCount > 0 && (
              <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                {totalCount}
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Search Input */}
        {conversations.length > 0 && (
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Procurar conversa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:border-pink-400 focus:outline-none text-sm"
            />
          </div>
        )}

        {/* Conversations List */}
        {filteredConversations.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-purple-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <MessageCircle className="h-12 w-12 text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              {conversations.length === 0 ? "Nenhuma conversa ainda" : "Nenhuma conversa encontrada"}
            </h3>
            <p className="text-gray-500 mb-4">
              {conversations.length === 0 
                ? "Comece uma conversa com seus amigos!"
                : "Tente procurar por outro nome."
              }
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {filteredConversations.map((conversation) => (
                <ConversationCard
                  key={conversation.id}
                  conversation={conversation}
                  userId={userId}
                  isActive={activeConversationId === conversation.id}
                  onClick={() => onSelectConversation(conversation.id)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Individual Conversation Card Component
interface ConversationCardProps {
  conversation: ConversationWithUsers;
  userId: number;
  isActive: boolean;
  onClick: () => void;
}

function ConversationCard({ conversation, userId, isActive, onClick }: ConversationCardProps) {
  const otherUser = getOtherUserInConversation(conversation, userId);
  const hasLastMessage = conversation.lastMessage;
  const isOwnMessage = hasLastMessage && conversation.lastMessage?.senderId === userId;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
      layout
    >
      <Card 
        className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
          isActive 
            ? 'bg-gradient-to-br from-pink-50 to-purple-50 border-2 border-pink-300' 
            : 'bg-white border-2 border-gray-200 hover:border-pink-200'
        }`}
        onClick={onClick}
      >
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            {/* Avatar */}
            <div className="relative">
              <div className="w-14 h-14 bg-gradient-to-br from-pink-300 to-purple-300 rounded-full flex items-center justify-center text-2xl shadow-md">
                {otherUser.avatarEmoji}
              </div>
              {/* Online status indicator */}
              <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                otherUser.isOnline ? 'bg-green-400' : 'bg-gray-400'
              }`}>
                {getOnlineStatusEmoji(otherUser.isOnline)}
              </div>
            </div>

            {/* Conversation Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-bold text-gray-800 truncate">
                  {otherUser.displayName || otherUser.username}
                </h4>
                {hasLastMessage && (
                  <span className="text-xs text-gray-500 flex-shrink-0">
                    {formatConversationDate(conversation.lastMessage!.createdAt)}
                  </span>
                )}
              </div>
              
              <p className="text-sm text-gray-600 truncate">
                @{otherUser.username}
              </p>

              {/* Last Message Preview */}
              {hasLastMessage ? (
                <div className="flex items-center mt-2">
                  <p className="text-sm text-gray-600 truncate flex-1">
                    {isOwnMessage && (
                      <span className="text-blue-500 font-medium">Você: </span>
                    )}
                    {conversation.lastMessage!.content}
                  </p>
                  {/* Unread indicator (placeholder for real-time) */}
                  {/* {hasUnreadMessages && (
                    <div className="w-3 h-3 bg-pink-500 rounded-full ml-2 flex-shrink-0" />
                  )} */}
                </div>
              ) : (
                <p className="text-sm text-gray-500 mt-2">
                  Nova conversa
                </p>
              )}
            </div>

            {/* Status Indicators */}
            <div className="flex flex-col items-center space-y-1">
              <Badge 
                variant="secondary" 
                className={`text-xs ${otherUser.isOnline ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}
              >
                {otherUser.isOnline ? 'Online' : 'Offline'}
              </Badge>
              
              {/* Message time for mobile */}
              {hasLastMessage && (
                <span className="text-xs text-gray-400 sm:hidden">
                  {formatMessageTime(conversation.lastMessage!.createdAt)}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}