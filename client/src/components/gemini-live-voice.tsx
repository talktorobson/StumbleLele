import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Wifi, 
  WifiOff, 
  Loader2,
  MessageCircle,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useGeminiLive, LiveVoiceState } from "@/hooks/use-gemini-live";
import { useToast } from "@/hooks/use-toast";

interface GeminiLiveVoiceProps {
  userId: number;
  isOpen: boolean;
  onClose: () => void;
}

const stateColors = {
  idle: "bg-gray-500",
  connecting: "bg-yellow-500",
  connected: "bg-green-500",
  listening: "bg-blue-500",
  processing: "bg-purple-500",
  speaking: "bg-pink-500",
  error: "bg-red-500"
};

const stateMessages = {
  idle: "Desconectado",
  connecting: "Conectando...",
  connected: "Conectado - Pronto para conversar!",
  listening: "Ouvindo você...",
  processing: "Lele está pensando...",
  speaking: "Lele está falando...",
  error: "Erro na conexão"
};

export default function GeminiLiveVoice({ userId, isOpen, onClose }: GeminiLiveVoiceProps) {
  const [autoConnect, setAutoConnect] = useState(true);
  const { toast } = useToast();
  
  const {
    state,
    isListening,
    isSpeaking,
    error,
    transcript,
    connect,
    disconnect,
    startListening,
    stopListening,
    sendTextMessage,
    isConnected,
    isSupported
  } = useGeminiLive(userId);

  // Auto-connect when dialog opens
  useEffect(() => {
    if (isOpen && autoConnect && state === 'idle') {
      connect();
    }
  }, [isOpen, autoConnect, state, connect]);

  // Handle dialog close
  const handleClose = () => {
    disconnect();
    onClose();
  };

  // Handle microphone toggle
  const handleMicToggle = () => {
    if (isListening) {
      stopListening();
    } else if (isConnected) {
      startListening();
    } else {
      toast({
        title: "Não conectado",
        description: "Conecte-se primeiro para começar a conversar",
        variant: "destructive",
      });
    }
  };

  // Handle connection toggle
  const handleConnectionToggle = () => {
    if (isConnected) {
      disconnect();
    } else {
      connect();
    }
  };

  if (!isSupported) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Funcionalidade não disponível</DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <p className="text-gray-600">
              Seu navegador não suporta a conversa por voz. 
              Tente usar um navegador mais recente.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full flex items-center justify-center">
                <MessageCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold">Conversa com Lele</h3>
                <p className="text-sm text-gray-600">Voz ao vivo com Gemini</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="hover:bg-gray-100 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Indicator */}
          <div className="text-center">
            <div className="relative inline-block">
              <div className={`w-20 h-20 rounded-full ${stateColors[state]} flex items-center justify-center mb-3`}>
                {state === 'connecting' || state === 'processing' ? (
                  <Loader2 className="h-8 w-8 text-white animate-spin" />
                ) : state === 'listening' ? (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                  >
                    <Mic className="h-8 w-8 text-white" />
                  </motion.div>
                ) : state === 'speaking' ? (
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 0.5 }}
                  >
                    <Volume2 className="h-8 w-8 text-white" />
                  </motion.div>
                ) : state === 'connected' ? (
                  <Wifi className="h-8 w-8 text-white" />
                ) : state === 'error' ? (
                  <WifiOff className="h-8 w-8 text-white" />
                ) : (
                  <MicOff className="h-8 w-8 text-white" />
                )}
              </div>
              
              {/* Pulse animation for active states */}
              {(state === 'listening' || state === 'speaking') && (
                <motion.div
                  className={`absolute inset-0 rounded-full ${stateColors[state]} opacity-30`}
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                />
              )}
            </div>
            
            <p className="text-sm font-medium text-gray-700">
              {stateMessages[state]}
            </p>
            
            {error && (
              <p className="text-xs text-red-500 mt-1">
                {error}
              </p>
            )}
          </div>

          {/* Transcript Display */}
          {transcript && (
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-700 font-medium mb-1">Lele disse:</p>
              <p className="text-sm text-gray-600">{transcript}</p>
            </div>
          )}

          {/* Controls */}
          <div className="flex justify-center space-x-4">
            {/* Connection Toggle */}
            <Button
              onClick={handleConnectionToggle}
              disabled={state === 'connecting'}
              className={`px-6 py-3 rounded-full font-medium transition-all ${
                isConnected 
                  ? 'bg-green-500 hover:bg-green-600 text-white' 
                  : 'bg-gray-500 hover:bg-gray-600 text-white'
              }`}
            >
              {isConnected ? <Wifi className="h-4 w-4 mr-2" /> : <WifiOff className="h-4 w-4 mr-2" />}
              {isConnected ? 'Conectado' : 'Conectar'}
            </Button>

            {/* Microphone Toggle */}
            <Button
              onClick={handleMicToggle}
              disabled={!isConnected || state === 'processing' || state === 'speaking'}
              className={`px-6 py-3 rounded-full font-medium transition-all ${
                isListening 
                  ? 'bg-red-500 hover:bg-red-600 text-white' 
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              {isListening ? <MicOff className="h-4 w-4 mr-2" /> : <Mic className="h-4 w-4 mr-2" />}
              {isListening ? 'Parar' : 'Falar'}
            </Button>
          </div>

          {/* Instructions */}
          <div className="text-center space-y-2">
            <p className="text-xs text-gray-500">
              {!isConnected ? 'Clique em "Conectar" para começar' :
               !isListening ? 'Clique em "Falar" e conte algo para Lele' :
               'Fale agora! Lele está ouvindo você...'}
            </p>
            
            {isConnected && (
              <div className="flex justify-center space-x-4 text-xs text-gray-400">
                <span>🎤 Voz em tempo real</span>
                <span>🤖 Gemini Live</span>
                <span>🇧🇷 Português</span>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}