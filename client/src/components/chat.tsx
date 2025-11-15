import { useState, useRef, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send, Mic, History } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useGeminiDirect } from "@/hooks/use-gemini-direct";
import { useMutation } from "@tanstack/react-query";



interface ChatProps {
  userId: number;
}

export default function Chat({ userId }: ChatProps) {
  const [message, setMessage] = useState("");
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();
  const { messages, isConnected, isProcessing, sendMessage, startListening: startVoiceRecognition, logs } = useGeminiDirect(userId);

  // Save conversations to database
  const saveConversationMutation = useMutation({
    mutationFn: async (data: { userId: number; message: string; response: string }) => {
      const response = await fetch(`/api/conversations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to save conversation');
      return response.json();
    }
  });

  // Save conversations when messages are updated with responses
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.response && !lastMessage.saved) {
      saveConversationMutation.mutate({
        userId,
        message: lastMessage.message,
        response: lastMessage.response
      });
      // Mark as saved to prevent duplicate saves
      lastMessage.saved = true;
    }
  }, [messages, userId, saveConversationMutation]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isProcessing) {
      sendMessage(message.trim());
      setMessage("");
    }
  };

  const handleVoiceInput = () => {
    if (isListening) {
      // Stop listening
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
      setIsListening(false);
    } else {
      // Start listening
      const recognition = startVoiceRecognition();
      if (recognition) {
        recognitionRef.current = recognition;
        setIsListening(true);
        
        recognition.onend = () => {
          setIsListening(false);
          recognitionRef.current = null;
        };
      }
    }
  };

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <Card className="bg-white/95 backdrop-blur-sm shadow-xl" data-section="chat">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <MessageCircle className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-pink-400" />
            <span className="text-xl sm:text-2xl font-bold text-gray-800">Conversa</span>
            <div className={`ml-2 w-2 h-2 rounded-full ${
              isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'
            }`} title={isConnected ? 'Conectado ao Gemini Live' : 'Desconectado'}></div>
          </div>
          <Button variant="ghost" size="sm" className="text-gray-500 px-2 sm:px-3">
            <History className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Histórico</span>
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Chat Messages */}
        <ScrollArea className="h-48 sm:h-64 mb-4 sm:mb-6 chat-messages">
          <div className="space-y-3 sm:space-y-4">
            {messages.map((msg: any) => (
              <div key={msg.id} className="space-y-2">
                {/* User Message */}
                {msg.message && (
                  <div className="flex items-start space-x-2 sm:space-x-3 justify-end">
                    <div className="bg-teal-400 text-white rounded-2xl rounded-tr-sm px-3 py-2 sm:px-4 sm:py-3 max-w-xs sm:max-w-sm chat-bubble">
                      <p className="text-sm sm:text-base">{msg.message}</p>
                      <span className="text-xs text-gray-200 mt-1 block">
                        {new Date(msg.timestamp).toLocaleTimeString('pt-BR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-teal-400 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs">H</span>
                    </div>
                  </div>
                )}
                
                {/* Lele's Response */}
                {(msg.response || msg.hasAudio) && (
                  <div className="flex items-start space-x-2 sm:space-x-3">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-pink-400 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs">L</span>
                    </div>
                    <div className="bg-pink-100 rounded-2xl rounded-tl-sm px-3 py-2 sm:px-4 sm:py-3 max-w-xs sm:max-w-sm chat-bubble">
                      {msg.response && (
                        <p className="text-gray-800 text-sm sm:text-base">{msg.response}</p>
                      )}
                      {msg.hasAudio && (
                        <div className="flex items-center space-x-1 mt-1">
                          <span className="text-xs text-pink-600">🔊 Resposta em áudio (Gemini Live)</span>
                        </div>
                      )}
                      <span className="text-xs text-gray-500 mt-1 block">
                        Lele • {new Date(msg.timestamp).toLocaleTimeString('pt-BR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                        {msg.hasAudio && <span className="ml-1">🎵</span>}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {isProcessing && (
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

        {/* Quick Reply Buttons */}
        {messages.length === 0 || !isProcessing && (
          <div className="mb-3 sm:mb-4 flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full bg-gradient-to-r from-pink-100 to-purple-100 hover:from-pink-200 hover:to-purple-200 border-2 border-pink-300 text-purple-700 text-xs sm:text-sm font-semibold transition-all hover:scale-105"
              onClick={() => setMessage("Conte uma piada")}
              disabled={isProcessing}
            >
              😄 Conte uma piada
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full bg-gradient-to-r from-green-100 to-blue-100 hover:from-green-200 hover:to-blue-200 border-2 border-green-300 text-blue-700 text-xs sm:text-sm font-semibold transition-all hover:scale-105"
              onClick={() => setMessage("Vamos jogar")}
              disabled={isProcessing}
            >
              🎮 Vamos jogar
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full bg-gradient-to-r from-yellow-100 to-orange-100 hover:from-yellow-200 hover:to-orange-200 border-2 border-yellow-300 text-orange-700 text-xs sm:text-sm font-semibold transition-all hover:scale-105"
              onClick={() => setMessage("Me surpreenda")}
              disabled={isProcessing}
            >
              ✨ Me surpreenda
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full bg-gradient-to-r from-purple-100 to-pink-100 hover:from-purple-200 hover:to-pink-200 border-2 border-purple-300 text-pink-700 text-xs sm:text-sm font-semibold transition-all hover:scale-105"
              onClick={() => setMessage("Conta uma história")}
              disabled={isProcessing}
            >
              📚 Conta uma história
            </Button>
          </div>
        )}

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
              disabled={isProcessing}
            />
          </div>
          <Button
            type="submit"
            size="icon"
            className="rounded-full bg-pink-400 hover:bg-pink-500 w-10 h-10 sm:w-12 sm:h-12"
            disabled={!message.trim() || isProcessing || !isConnected}
          >
            <Send className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
