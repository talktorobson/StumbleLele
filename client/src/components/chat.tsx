import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send, Mic, History } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useSpeech } from "@/hooks/use-speech";

interface ChatProps {
  userId: number;
}

export default function Chat({ userId }: ChatProps) {
  const [message, setMessage] = useState("");
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { startListening, stopListening, speak } = useSpeech();

  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ["/api/conversations", userId],
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (messageText: string) => {
      const response = await apiRequest("POST", "/api/chat", {
        userId,
        message: messageText,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setMessage("");
      queryClient.invalidateQueries({ queryKey: ["/api/conversations", userId] });
      queryClient.invalidateQueries({ queryKey: ["/api/avatar", userId] });
      
      // Speak the response
      speak(data.conversation.response);
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não consegui enviar a mensagem. Tenta de novo!",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      sendMessageMutation.mutate(message.trim());
    }
  };

  const handleVoiceInput = () => {
    if (isListening) {
      stopListening();
      setIsListening(false);
    } else {
      startListening(
        (transcript: string) => {
          setMessage(transcript);
          setIsListening(false);
        },
        () => {
          setIsListening(false);
          toast({
            title: "Erro",
            description: "Não consegui ouvir. Tenta falar de novo!",
            variant: "destructive",
          });
        }
      );
      setIsListening(true);
    }
  };

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    const scrollArea = document.querySelector('.chat-messages .scroll-area-viewport');
    if (scrollArea) {
      scrollArea.scrollTop = scrollArea.scrollHeight;
    }
  }, [conversations]);

  return (
    <Card className="bg-white/95 backdrop-blur-sm shadow-xl" data-section="chat">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <MessageCircle className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-pink-400" />
            <span className="text-xl sm:text-2xl font-bold text-gray-800">Conversa</span>
          </div>
          <Button variant="ghost" size="sm" className="text-gray-500 px-2 sm:px-3">
            <History className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Histórico</span>
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Chat Messages */}
        <ScrollArea className="h-48 sm:h-64 mb-4 sm:mb-6 chat-messages flex flex-col-reverse">
          <div className="space-y-3 sm:space-y-4 flex flex-col-reverse">
            {conversations.slice().reverse().map((conv: any) => (
              <div key={conv.id} className="space-y-2">
                {/* User Message */}
                <div className="flex items-start space-x-2 sm:space-x-3 justify-end">
                  <div className="bg-teal-400 text-white rounded-2xl rounded-tr-sm px-3 py-2 sm:px-4 sm:py-3 max-w-xs sm:max-w-sm chat-bubble">
                    <p className="text-sm sm:text-base">{conv.message}</p>
                    <span className="text-xs text-gray-200 mt-1 block">
                      {new Date(conv.timestamp).toLocaleTimeString('pt-BR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-teal-400 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs">H</span>
                  </div>
                </div>
                
                {/* Lele's Response */}
                <div className="flex items-start space-x-2 sm:space-x-3">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-pink-400 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs">L</span>
                  </div>
                  <div className="bg-pink-100 rounded-2xl rounded-tl-sm px-3 py-2 sm:px-4 sm:py-3 max-w-xs sm:max-w-sm chat-bubble">
                    <p className="text-gray-800 text-sm sm:text-base">{conv.response}</p>
                    <span className="text-xs text-gray-500 mt-1 block">
                      Lele • {new Date(conv.timestamp).toLocaleTimeString('pt-BR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            
            {sendMessageMutation.isPending && (
              <div className="flex items-start space-x-2 sm:space-x-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-pink-400 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs">L</span>
                </div>
                <div className="bg-pink-100 rounded-2xl rounded-tl-sm px-3 py-2 sm:px-4 sm:py-3 max-w-xs">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                    <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        
        {/* Input Area */}
        <form onSubmit={handleSubmit} className="flex items-center space-x-2 sm:space-x-3">
          <Button
            type="button"
            size="icon"
            className={`rounded-full transition-all w-10 h-10 sm:w-12 sm:h-12 ${
              isListening 
                ? "bg-red-400 hover:bg-red-500 animate-pulse" 
                : "bg-purple-400 hover:bg-purple-500"
            }`}
            onClick={handleVoiceInput}
          >
            <Mic className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
          </Button>
          <div className="flex-1 relative">
            <Input
              type="text"
              placeholder="Digite sua mensagem aqui..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="pr-12 rounded-full border-2 border-transparent focus:border-pink-400 text-sm sm:text-base"
              disabled={sendMessageMutation.isPending}
            />
          </div>
          <Button
            type="submit"
            size="icon"
            className="rounded-full bg-pink-400 hover:bg-pink-500 w-10 h-10 sm:w-12 sm:h-12"
            disabled={!message.trim() || sendMessageMutation.isPending}
          >
            <Send className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
