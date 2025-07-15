import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Mic, MicOff } from "lucide-react";
import { useSpeech } from "@/hooks/use-speech";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface VoiceInputProps {
  userId: number;
  onClose: () => void;
}

export default function VoiceInput({ userId, onClose }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { startListening, stopListening, speak } = useSpeech();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const sendMessageMutation = useMutation({
    mutationFn: async (messageText: string) => {
      const response = await apiRequest("POST", "/api/chat", {
        userId,
        message: messageText,
      });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations", userId] });
      queryClient.invalidateQueries({ queryKey: ["/api/avatar", userId] });
      
      // Speak the response
      speak(data.conversation.response);
      
      // Show response in toast
      toast({
        title: "Lele respondeu:",
        description: data.conversation.response,
        duration: 5000,
      });
      
      setIsProcessing(false);
      onClose();
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não consegui processar sua fala. Tenta de novo!",
        variant: "destructive",
      });
      setIsProcessing(false);
    },
  });

  const handleStartListening = () => {
    setTranscript("");
    setIsListening(true);
    
    startListening(
      (result: string) => {
        setTranscript(result);
        setIsListening(false);
        
        if (result.trim()) {
          setIsProcessing(true);
          sendMessageMutation.mutate(result.trim());
        }
      },
      (error: string) => {
        setIsListening(false);
        toast({
          title: "Erro ao ouvir",
          description: "Não consegui ouvir sua voz. Tenta de novo!",
          variant: "destructive",
        });
      }
    );
  };

  const handleStopListening = () => {
    stopListening();
    setIsListening(false);
  };

  useEffect(() => {
    // Auto-start listening when component mounts
    handleStartListening();
    
    return () => {
      stopListening();
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Falar com a Lele</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="text-center space-y-4">
            {/* Microphone Visualization */}
            <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center ${
              isListening ? "bg-red-400 animate-pulse" : "bg-gray-200"
            }`}>
              {isListening ? (
                <Mic className="h-12 w-12 text-white" />
              ) : (
                <MicOff className="h-12 w-12 text-gray-400" />
              )}
            </div>
            
            {/* Status Text */}
            <div className="space-y-2">
              {isListening && (
                <p className="text-sm text-gray-600">
                  Estou ouvindo... Fale agora!
                </p>
              )}
              
              {transcript && (
                <div className="bg-gray-100 rounded-lg p-3">
                  <p className="text-sm text-gray-700">
                    <strong>Você disse:</strong> "{transcript}"
                  </p>
                </div>
              )}
              
              {isProcessing && (
                <div className="bg-pink-100 rounded-lg p-3">
                  <p className="text-sm text-gray-700">
                    <strong>Lele está pensando...</strong>
                  </p>
                  <div className="flex justify-center mt-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                      <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Control Buttons */}
            <div className="flex justify-center space-x-4">
              {isListening ? (
                <Button
                  onClick={handleStopListening}
                  className="bg-red-500 hover:bg-red-600"
                >
                  <MicOff className="mr-2 h-4 w-4" />
                  Parar
                </Button>
              ) : (
                <Button
                  onClick={handleStartListening}
                  className="bg-green-500 hover:bg-green-600"
                  disabled={isProcessing}
                >
                  <Mic className="mr-2 h-4 w-4" />
                  Falar
                </Button>
              )}
              
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isProcessing}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
