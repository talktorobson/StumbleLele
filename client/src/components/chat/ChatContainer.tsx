import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, Users, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useActiveChat } from "@/hooks/use-conversations";
import { useToast } from "@/hooks/use-toast";
import ConversationsList from "@/components/chat/ConversationsList";
import ChatScreen from "@/components/chat/ChatScreen";

interface ChatContainerProps {
  userId: number;
  className?: string;
}

type ChatView = 'conversations' | 'chat';

export default function ChatContainer({ userId, className = "" }: ChatContainerProps) {
  const [currentView, setCurrentView] = useState<ChatView>('conversations');
  const { toast } = useToast();

  const {
    activeChatId,
    activeConversation,
    messages,
    isLoadingMessages,
    openChatWith,
    closeChat,
    sendMessage,
  } = useActiveChat(userId);

  const handleSelectConversation = (conversationId: string) => {
    setCurrentView('chat');
    // The conversation is already selected through the conversationId
  };

  const handleOpenChatWith = async (friendId: number) => {
    try {
      await openChatWith(friendId);
      setCurrentView('chat');
    } catch (error) {
      toast({
        title: "Erro ao abrir conversa",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    }
  };

  const handleBackToConversations = () => {
    setCurrentView('conversations');
    closeChat();
  };

  const getOtherUserFromConversation = (conversation: any) => {
    return conversation.user1Id === userId ? conversation.user2 : conversation.user1;
  };

  return (
    <div className={`${className} h-full`}>
      <AnimatePresence mode="wait">
        {currentView === 'conversations' ? (
          <motion.div
            key="conversations"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            <ConversationsList
              userId={userId}
              onSelectConversation={handleSelectConversation}
              activeConversationId={activeChatId}
            />
          </motion.div>
        ) : (
          <motion.div
            key="chat"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            {activeConversation && (
              <ChatScreen
                conversationId={activeConversation.id}
                otherUser={getOtherUserFromConversation(activeConversation)}
                userId={userId}
                onBack={handleBackToConversations}
                className="h-full"
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Standalone Chat Widget for Home Page
interface ChatWidgetProps {
  userId: number;
  onOpenFullChat: () => void;
}

export function ChatWidget({ userId, onOpenFullChat }: ChatWidgetProps) {
  const { conversations, isLoading } = useActiveChat(userId);
  const recentConversations = conversations.slice(0, 3);

  return (
    <Card className="bg-white/95 backdrop-blur-sm shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageCircle className="h-5 w-5 text-purple-400" />
            <span className="text-xl font-bold text-gray-800">Conversas</span>
          </div>
          <Button
            size="sm"
            onClick={onOpenFullChat}
            className="bg-purple-400 hover:bg-purple-500 text-white"
          >
            Ver Todas
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-6">
            <div className="animate-spin w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-600">Carregando...</p>
          </div>
        ) : recentConversations.length === 0 ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-purple-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <MessageCircle className="h-8 w-8 text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Nenhuma conversa</h3>
            <p className="text-gray-500 text-sm">
              Comece uma conversa com seus amigos!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentConversations.map((conversation) => {
              const otherUser = conversation.user1Id === userId ? conversation.user2 : conversation.user1;
              return (
                <div
                  key={conversation.id}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={onOpenFullChat}
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-300 to-pink-300 rounded-full flex items-center justify-center text-xl">
                    {otherUser.avatarEmoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-800 truncate">
                      {otherUser.displayName || otherUser.username}
                    </h4>
                    <p className="text-sm text-gray-500 truncate">
                      {conversation.lastMessage?.content || "Nova conversa"}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`w-3 h-3 rounded-full ${
                      otherUser.isOnline ? 'bg-green-400' : 'bg-gray-400'
                    }`} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}