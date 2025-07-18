import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Send, Smile, Mic, Image, Plus, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

interface MessageInputProps {
  onSend: (content: string) => void;
  disabled?: boolean;
  placeholder?: string;
  isSending?: boolean;
}

export default function MessageInput({
  onSend,
  disabled = false,
  placeholder = "Digite sua mensagem...",
  isSending = false
}: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [showEmojis, setShowEmojis] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  // Child-friendly emoji collection
  const emojis = [
    "😊", "😂", "😍", "🤗", "😘", "😋", "😎", "🤔", "😴", "😇",
    "🥰", "😆", "😉", "😊", "😁", "🤗", "😴", "😬", "😮", "😯",
    "❤️", "💕", "💖", "💗", "💘", "💙", "💚", "💛", "💜", "🖤",
    "👍", "👎", "👏", "🙌", "👋", "🤝", "💪", "🤞", "✌️", "👌",
    "🎉", "🎊", "🎈", "🎁", "🎂", "🍰", "🎵", "🎶", "⭐", "🌟",
    "🌈", "🌸", "🌺", "🌻", "🌷", "🌹", "🦋", "🐱", "🐶", "🐰",
    "🎮", "⚽", "🏀", "🎨", "📚", "✏️", "🖍️", "📝", "💌", "📱"
  ];

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + 'px';
    }
  }, [message]);

  const handleSend = () => {
    if (message.trim() && !disabled && !isSending) {
      onSend(message.trim());
      setMessage("");
      setShowEmojis(false);
      setShowAttachments(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const addEmoji = (emoji: string) => {
    setMessage(prev => prev + emoji);
    inputRef.current?.focus();
  };

  const handleVoiceMessage = () => {
    toast({
      title: "Em breve! 🎤",
      description: "Mensagens de voz estarão disponíveis em breve!",
    });
  };

  const handleImageUpload = () => {
    toast({
      title: "Em breve! 📸",
      description: "Compartilhamento de imagens estará disponível em breve!",
    });
  };

  return (
    <div className="bg-white border-t-2 border-pink-200 p-4 relative">
      {/* Emoji Picker */}
      <AnimatePresence>
        {showEmojis && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-full left-4 right-4 bg-white border-2 border-pink-200 rounded-lg p-4 shadow-lg z-10 mb-2"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-700">Emojis</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowEmojis(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-10 gap-2 max-h-32 overflow-y-auto">
              {emojis.map((emoji, index) => (
                <button
                  key={index}
                  onClick={() => addEmoji(emoji)}
                  className="text-2xl hover:bg-pink-50 rounded-lg p-1 transition-colors"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Attachment Options */}
      <AnimatePresence>
        {showAttachments && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-full left-4 right-4 bg-white border-2 border-pink-200 rounded-lg p-4 shadow-lg z-10 mb-2"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-700">Anexar</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAttachments(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={handleImageUpload}
                className="flex items-center space-x-2 p-4 h-auto"
              >
                <Image className="h-5 w-5 text-pink-500" />
                <span className="text-sm">Imagem</span>
              </Button>
              <Button
                variant="outline"
                onClick={handleVoiceMessage}
                className="flex items-center space-x-2 p-4 h-auto"
              >
                <Mic className="h-5 w-5 text-blue-500" />
                <span className="text-sm">Áudio</span>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Input Area */}
      <div className="flex items-end space-x-2">
        {/* Attachment Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setShowAttachments(!showAttachments);
            setShowEmojis(false);
          }}
          className="h-10 w-10 p-0 text-gray-500 hover:text-pink-500 hover:bg-pink-50 rounded-full"
        >
          <Plus className="h-5 w-5" />
        </Button>

        {/* Message Input */}
        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled}
            className="w-full px-4 py-3 border-2 border-pink-200 rounded-2xl focus:border-pink-400 focus:outline-none resize-none text-base placeholder:text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
            rows={1}
            maxLength={1000}
          />
          {/* Character Counter */}
          {message.length > 800 && (
            <div className="absolute bottom-1 right-2 text-xs text-gray-500">
              {message.length}/1000
            </div>
          )}
        </div>

        {/* Emoji Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setShowEmojis(!showEmojis);
            setShowAttachments(false);
          }}
          className="h-10 w-10 p-0 text-gray-500 hover:text-pink-500 hover:bg-pink-50 rounded-full"
        >
          <Smile className="h-5 w-5" />
        </Button>

        {/* Send Button */}
        <Button
          onClick={handleSend}
          disabled={!message.trim() || disabled || isSending}
          className="h-10 w-10 p-0 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isSending ? (
            <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Helper Text */}
      <div className="mt-2 text-xs text-gray-500 text-center">
        Pressione Enter para enviar • Shift+Enter para nova linha
      </div>
    </div>
  );
}