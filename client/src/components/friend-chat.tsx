import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MessageCircle, Send, X, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FriendChatProps {
  friend: {
    id: number;
    friend_name: string;
    status: string;
  };
  isOpen: boolean;
  onClose: () => void;
  userId: number;
}

interface Message {
  id: string;
  sender: 'user' | 'friend';
  content: string;
  timestamp: Date;
}

export default function FriendChat({ friend, isOpen, onClose, userId }: FriendChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Simulate friend responses
  const friendResponses = [
    "Oi! Como você está? 😊",
    "Que legal! Vamos brincar juntos!",
    "Haha, muito engraçado! 😄",
    "Eu também gosto disso!",
    "Que interessante! Me conta mais!",
    "Vamos jogar algum jogo?",
    "Estou bem, obrigado por perguntar!",
    "Que dia legal hoje, né?",
    "Adoro conversar com você! 💕",
    "Vamos ser amigos para sempre!",
    "Que ideia incrível! 🌟",
    "Estou animado para brincar!",
    "Você é muito legal!",
    "Vamos fazer algo divertido?",
    "Que história bacana! 📚"
  ];

  useEffect(() => {
    if (isOpen) {
      // Load existing messages from localStorage
      const savedMessages = localStorage.getItem(`chat_${userId}_${friend.id}`);
      if (savedMessages) {
        setMessages(JSON.parse(savedMessages));
      } else {
        // Initialize with welcome message
        const welcomeMessage: Message = {
          id: Date.now().toString(),
          sender: 'friend',
          content: `Oi! Eu sou ${friend.friend_name}! Vamos conversar? 🎉`,
          timestamp: new Date()
        };
        setMessages([welcomeMessage]);
      }
    }
  }, [isOpen, userId, friend.id, friend.friend_name]);

  useEffect(() => {
    // Save messages to localStorage whenever they change
    if (messages.length > 0) {
      localStorage.setItem(`chat_${userId}_${friend.id}`, JSON.stringify(messages));
    }
  }, [messages, userId, friend.id]);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const simulateFriendResponse = (userMessage: string) => {
    setIsTyping(true);
    
    setTimeout(() => {
      let response = friendResponses[Math.floor(Math.random() * friendResponses.length)];
      
      // Context-aware responses
      if (userMessage.toLowerCase().includes('jogo') || userMessage.toLowerCase().includes('jogar')) {
        response = "Vamos jogar! Que jogo você quer jogar? 🎮";
      } else if (userMessage.toLowerCase().includes('oi') || userMessage.toLowerCase().includes('olá')) {
        response = "Oi! Que bom te ver! Como está seu dia? 😊";
      } else if (userMessage.toLowerCase().includes('obrigad')) {
        response = "De nada! Estou sempre aqui para ajudar! 💝";
      } else if (userMessage.toLowerCase().includes('tchau') || userMessage.toLowerCase().includes('até')) {
        response = "Tchau! Foi muito legal conversar com você! Até a próxima! 👋";
      }

      const friendMessage: Message = {
        id: Date.now().toString(),
        sender: 'friend',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, friendMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 2000); // Random delay between 1-3 seconds
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      content: newMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    simulateFriendResponse(newMessage.trim());
    setNewMessage("");
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md h-[500px] p-0 overflow-hidden">
        <DialogHeader className="p-4 pb-2 bg-gradient-to-r from-pink-100 to-purple-100">
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-teal-400 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">{friend.friend_name}</h3>
                <p className="text-sm text-gray-600">
                  {friend.status === 'online' ? '🟢 Online' : '🔴 Offline'}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="hover:bg-white/50 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-white to-pink-50/30">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-3 py-2 rounded-2xl ${
                    message.sender === 'user'
                      ? 'bg-blue-500 text-white rounded-br-sm'
                      : 'bg-white text-gray-800 rounded-bl-sm shadow-sm border'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {/* Typing indicator */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="bg-gray-100 px-4 py-2 rounded-2xl rounded-bl-sm">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="p-4 bg-white border-t">
          <div className="flex space-x-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={`Escreva para ${friend.friend_name}...`}
              className="flex-1 rounded-xl border-gray-300 focus:border-pink-400"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="bg-pink-500 hover:bg-pink-600 text-white rounded-xl px-4"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}