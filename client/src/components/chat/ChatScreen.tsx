import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ArrowLeft, MoreVertical, Phone, Video, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useChat } from "@/hooks/useChat";
import { getOnlineStatusEmoji, getOnlineStatusText } from "@/lib/chat-api";
import MessageBubble from "@/components/chat/MessageBubble";
import MessageInput from "@/components/chat/MessageInput";
import type { User } from "@/types/chat";

interface ChatScreenProps {
  conversationId: string;
  otherUser: User;
  userId: number;
  onBack?: () => void;
  className?: string;
}

export default function ChatScreen({
  conversationId,
  otherUser,
  userId,
  onBack,
  className = ""
}: ChatScreenProps) {
  const [showUserInfo, setShowUserInfo] = useState(false);
  const { toast } = useToast();
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    loading,
    error,
    sendMessage,
    editMessage,
    deleteMessage,
    isTyping,
    messagesEndRef,
    scrollToBottom,
    retry,
    clearError
  } = useChat({
    conversationId,
    friendName: otherUser.display_name || otherUser.username,
    autoScroll: true,
    enableNotifications: true,
    enableSound: true
  });

  const handleSendMessage = async (content: string) => {
    try {
      await sendMessage(content);
    } catch (error) {
      toast({
        title: "Erro ao enviar mensagem",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    }
  };

  const handleEditMessage = async (messageId: string, newContent: string) => {
    try {
      await editMessage(messageId, newContent);
    } catch (error) {
      toast({
        title: "Erro ao editar mensagem",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await deleteMessage(messageId);
    } catch (error) {
      toast({
        title: "Erro ao deletar mensagem",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    }
  };

  const handleVoiceCall = () => {
    toast({
      title: "Em breve! 📞",
      description: "Chamadas de voz estarão disponíveis em breve!",
    });
  };

  const handleVideoCall = () => {
    toast({
      title: "Em breve! 📹",
      description: "Chamadas de vídeo estarão disponíveis em breve!",
    });
  };

  if (error) {
    return (
      <Card className={`bg-white/95 backdrop-blur-sm shadow-xl ${className}`}>
        <CardContent className="p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <ArrowLeft className="w-8 h-8 text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Erro ao carregar conversa</h3>
            <p className="text-gray-500 mb-4">Tente novamente em alguns instantes.</p>
            <Button
              onClick={retry}
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
    <Card className={`bg-white/95 backdrop-blur-sm shadow-xl flex flex-col ${className}`}>
      {/* Chat Header */}
      <CardHeader className="bg-gradient-to-r from-pink-100 to-purple-100 p-4 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Back Button */}
            {onBack && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="h-8 w-8 p-0 hover:bg-white/50 rounded-full"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}

            {/* User Avatar */}
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-300 to-purple-300 rounded-full flex items-center justify-center text-2xl shadow-md">
                {otherUser.avatar_emoji}
              </div>
              {/* Online status indicator */}
              <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                otherUser.is_online ? 'bg-green-400' : 'bg-gray-400'
              }`}>
                {getOnlineStatusEmoji(otherUser.is_online)}
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1">
              <h3 className="font-bold text-gray-800 truncate">
                {otherUser.display_name || otherUser.username}
              </h3>
              <p className="text-sm text-gray-600">
                {getOnlineStatusText(otherUser.is_online)}
                {otherUser.is_online && (
                  <span className="ml-1 text-green-600">• agora</span>
                )}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleVoiceCall}
              className="h-8 w-8 p-0 hover:bg-white/50 rounded-full"
            >
              <Phone className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleVideoCall}
              className="h-8 w-8 p-0 hover:bg-white/50 rounded-full"
            >
              <Video className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowUserInfo(!showUserInfo)}
              className="h-8 w-8 p-0 hover:bg-white/50 rounded-full"
            >
              <Info className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* User Info Panel */}
        <AnimatePresence>
          {showUserInfo && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-4 p-4 bg-white/50 rounded-lg"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-300 to-purple-300 rounded-full flex items-center justify-center text-3xl shadow-md mx-auto mb-3">
                  {otherUser.avatar_emoji}
                </div>
                <h4 className="font-bold text-gray-800">
                  {otherUser.display_name || otherUser.username}
                </h4>
                <p className="text-sm text-gray-600">@{otherUser.username}</p>
                <div className="mt-2 text-sm text-gray-500">
                  {otherUser.is_online 
                    ? "Online agora" 
                    : `Visto ${otherUser.last_seen ? new Date(otherUser.last_seen).toLocaleString('pt-BR') : 'há um tempo'}`
                  }
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardHeader>

      {/* Messages Area */}
      <CardContent className="flex-1 overflow-hidden p-0">
        <div
          ref={chatContainerRef}
          className="h-full overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-white to-pink-50/30"
        >
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin w-8 h-8 border-2 border-pink-400 border-t-transparent rounded-full" />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-pink-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">{otherUser.avatar_emoji}</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Nova conversa!
              </h3>
              <p className="text-gray-500 mb-4">
                Diga olá para {otherUser.display_name || otherUser.username}!
              </p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isOwn={message.sender_id === userId}
                  onEdit={handleEditMessage}
                  onDelete={handleDeleteMessage}
                />
              ))}
            </AnimatePresence>
          )}

          {/* Typing Indicator */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center space-x-3"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-pink-300 to-purple-300 rounded-full flex items-center justify-center text-lg">
                {otherUser.avatar_emoji}
              </div>
              <div className="bg-gray-100 px-4 py-2 rounded-2xl rounded-bl-sm">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            </motion.div>
          )}

          {/* Messages End Ref */}
          <div ref={messagesEndRef} />
        </div>
      </CardContent>

      {/* Message Input */}
      <MessageInput
        onSend={handleSendMessage}
        disabled={!otherUser.is_online}
        placeholder={
          otherUser.is_online 
            ? `Escreva para ${otherUser.display_name || otherUser.username}...` 
            : `${otherUser.display_name || otherUser.username} está offline`
        }
      />
    </Card>
  );
}