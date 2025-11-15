import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MessageCircle, Send, ArrowLeft, User, Smile } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useConversationList, useConversationMessages, useConversations } from "@/hooks/use-conversations";
import { useToast } from "@/hooks/use-toast";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ConversationsProps {
  userId: number;
}

const REACTION_EMOJIS = ["❤️", "😂", "🤔", "👍", "🎉"] as const;

export default function Conversations({ userId }: ConversationsProps) {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [messageReactions, setMessageReactions] = useState<Record<string, { emoji: string; count: number; userReacted: boolean }[]>>({});
  const { toast } = useToast();

  const {
    activeConversations,
    isLoading: isLoadingConversations,
    error: conversationsError,
  } = useConversationList(userId);

  const { getOtherUser } = useConversations(userId);

  const {
    messages,
    sendMessage,
    isSendingMessage,
    isLoading: isLoadingMessages,
    messagesEndRef,
  } = useConversationMessages(selectedConversationId);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversationId) return;

    await sendMessage(newMessage, userId);
    setNewMessage("");
  };

  const handleReaction = (messageId: string, emoji: string) => {
    setMessageReactions(prev => {
      const reactions = prev[messageId] || [];
      const existingReaction = reactions.find(r => r.emoji === emoji);

      if (existingReaction) {
        // Toggle user's reaction
        if (existingReaction.userReacted) {
          // Remove reaction
          const newCount = existingReaction.count - 1;
          if (newCount === 0) {
            return {
              ...prev,
              [messageId]: reactions.filter(r => r.emoji !== emoji)
            };
          }
          return {
            ...prev,
            [messageId]: reactions.map(r =>
              r.emoji === emoji
                ? { ...r, count: newCount, userReacted: false }
                : r
            )
          };
        } else {
          // Add reaction
          return {
            ...prev,
            [messageId]: reactions.map(r =>
              r.emoji === emoji
                ? { ...r, count: r.count + 1, userReacted: true }
                : r
            )
          };
        }
      } else {
        // Add new reaction
        return {
          ...prev,
          [messageId]: [...reactions, { emoji, count: 1, userReacted: true }]
        };
      }
    });

    toast({
      title: "Reação adicionada!",
      description: `Você reagiu com ${emoji}`,
      duration: 2000,
    });
  };

  const selectedConversation = activeConversations.find(
    (conv) => conv.id === selectedConversationId
  );
  const otherUser = selectedConversationId ? getOtherUser(selectedConversationId) : null;

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return new Intl.DateTimeFormat("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    } else {
      return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "short",
      }).format(date);
    }
  };

  // Conversation List View
  if (!selectedConversationId) {
    return (
      <Card className="bg-white/95 backdrop-blur-sm shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageCircle className="h-6 w-6 text-purple-400" />
            <span className="text-xl sm:text-2xl font-bold text-gray-800">
              Minhas Conversas
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingConversations ? (
            <div className="text-center py-12">
              <div className="animate-spin w-12 h-12 border-4 border-pink-400 border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-gray-600 font-medium">Carregando conversas...</p>
            </div>
          ) : conversationsError ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <MessageCircle className="w-8 h-8 text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Erro ao carregar conversas
              </h3>
              <p className="text-gray-500">Tente novamente em alguns instantes.</p>
            </div>
          ) : activeConversations.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-purple-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <MessageCircle className="h-12 w-12 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Nenhuma conversa ainda
              </h3>
              <p className="text-gray-500 mb-4">
                Comece uma conversa com seus amigos na aba de Amigos!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {activeConversations.map((conversation) => {
                  const otherUserInConv = getOtherUser(conversation.id);
                  const lastMessageTime = conversation.lastMessageAt
                    ? formatTime(conversation.lastMessageAt)
                    : "";

                  return (
                    <motion.div
                      key={conversation.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="cursor-pointer"
                      onClick={() => setSelectedConversationId(conversation.id)}
                    >
                      <Card className="hover:shadow-lg transition-shadow border-2 hover:border-purple-300">
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full flex items-center justify-center flex-shrink-0">
                              <User className="h-6 w-6 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-800 truncate">
                                {otherUserInConv?.name || "Usuário"}
                              </h4>
                              <p className="text-sm text-gray-500 truncate">
                                {conversation.lastMessage || "Iniciar conversa..."}
                              </p>
                            </div>
                            <div className="text-xs text-gray-400">
                              {lastMessageTime}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Chat View
  return (
    <Card className="bg-white/95 backdrop-blur-sm shadow-xl h-[calc(100vh-12rem)] flex flex-col">
      <CardHeader className="border-b bg-gradient-to-r from-pink-100 to-purple-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedConversationId(null)}
              className="hover:bg-white/50 rounded-full"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full flex items-center justify-center">
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">
                {otherUser?.name || "Usuário"}
              </h3>
              <p className="text-sm text-gray-600">
                {otherUser?.isOnline ? "🟢 Online" : "⚪ Offline"}
              </p>
            </div>
          </div>
        </div>
      </CardHeader>

      {/* Messages */}
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-white to-pink-50/30">
        {isLoadingMessages ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin w-8 h-8 border-4 border-pink-400 border-t-transparent rounded-full" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-full text-gray-400">
            <MessageCircle className="h-16 w-16 mb-4" />
            <p>Envie a primeira mensagem!</p>
          </div>
        ) : (
          <AnimatePresence>
            {messages.map((message) => {
              const isOwnMessage = message.senderId === userId;
              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                >
                  <div className="flex flex-col items-end gap-1">
                    <div
                      className={`max-w-xs px-4 py-2 rounded-2xl ${
                        isOwnMessage
                          ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-br-sm"
                          : "bg-white text-gray-800 rounded-bl-sm shadow-sm border"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          isOwnMessage ? "text-purple-100" : "text-gray-500"
                        }`}
                      >
                        {formatTime(message.createdAt)}
                      </p>
                    </div>

                    {/* Reactions Display & Picker */}
                    <div className="flex items-center gap-1">
                      {/* Existing Reactions */}
                      {messageReactions[message.id]?.map((reaction) => (
                        <button
                          key={reaction.emoji}
                          onClick={() => handleReaction(message.id, reaction.emoji)}
                          className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 transition-all ${
                            reaction.userReacted
                              ? "bg-pink-200 border-2 border-pink-400 scale-110"
                              : "bg-gray-100 border border-gray-300 hover:bg-gray-200"
                          }`}
                        >
                          <span>{reaction.emoji}</span>
                          <span className="font-semibold">{reaction.count}</span>
                        </button>
                      ))}

                      {/* Reaction Picker */}
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 rounded-full hover:bg-gray-200 p-0"
                          >
                            <Smile className="h-4 w-4 text-gray-500" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-2" align="center">
                          <div className="flex gap-1">
                            {REACTION_EMOJIS.map((emoji) => (
                              <button
                              key={emoji}
                                onClick={() => handleReaction(message.id, emoji)}
                                className="text-2xl hover:scale-125 transition-transform p-1 rounded hover:bg-gray-100"
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
        <div ref={messagesEndRef} />
      </CardContent>

      {/* Message Input */}
      <div className="p-4 bg-white border-t">
        <div className="flex space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder={`Escrever para ${otherUser?.name || "amigo"}...`}
            className="flex-1 rounded-xl border-gray-300 focus:border-pink-400"
            disabled={isSendingMessage}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || isSendingMessage}
            className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white rounded-xl px-4"
          >
            {isSendingMessage ? (
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}
