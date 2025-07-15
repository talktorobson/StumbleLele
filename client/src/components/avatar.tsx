import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle, Gamepad2, Laugh, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAvatar } from "@/hooks/use-avatar";
import LeleAvatar from "@/components/lele-avatar";

interface AvatarProps {
  userId: number;
  avatarState?: {
    currentEmotion: string;
    personality: any;
    lastInteraction: string;
  };
}

export default function Avatar({ userId, avatarState }: AvatarProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currentEmotion, setEmotion, getEmotionIcon } = useAvatar(avatarState?.currentEmotion);
  const [isAnimating, setIsAnimating] = useState(false);

  const tellJokeMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/joke", { userId });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Piada da Lele! 😄",
        description: data.joke,
        duration: 8000,
      });
      setEmotion("excited");
      queryClient.invalidateQueries({ queryKey: ["/api/avatar", userId] });
    },
    onError: () => {
      toast({
        title: "Ops!",
        description: "Não consegui pensar em uma piada agora. Tenta de novo!",
        variant: "destructive",
      });
    },
  });

  const handleJokeClick = () => {
    setIsAnimating(true);
    tellJokeMutation.mutate();
    setTimeout(() => setIsAnimating(false), 2000);
  };

  useEffect(() => {
    // Animate avatar periodically
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 1000);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="bg-white/95 backdrop-blur-sm shadow-xl">
      <CardContent className="p-6 text-center">
        <div className="relative inline-block">
          {/* Lele Avatar */}
          <div className="w-64 h-64 mx-auto mb-20 relative">
            <LeleAvatar 
              emotion={currentEmotion}
              isAnimating={isAnimating}
              isListening={false}
              isSpeaking={tellJokeMutation.isPending}
              className="w-full h-full scale-110"
            />
          </div>
          
          {/* Avatar Status */}
          <div className="mb-4">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Olá, Helena! 👋</h2>
            <p className="text-lg text-gray-600">
              {currentEmotion === "excited" ? "Estou super animada hoje!" :
               currentEmotion === "thinking" ? "Estou pensando em algo legal..." :
               currentEmotion === "surprised" ? "Uau! Que interessante!" :
               "Estou muito feliz hoje! O que vamos fazer?"}
            </p>
          </div>
          
          {/* Quick Actions */}
          <div className="flex justify-center space-x-4 mb-6">
            <Button 
              className="px-6 py-3 bg-pink-400 hover:bg-pink-500 text-white rounded-full font-semibold transition-all transform hover:scale-105 shadow-lg"
              onClick={() => {
                setEmotion("excited");
                document.querySelector('[data-section="chat"]')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Conversar
            </Button>
            <Button 
              className="px-6 py-3 bg-teal-400 hover:bg-teal-500 text-white rounded-full font-semibold transition-all transform hover:scale-105 shadow-lg"
              onClick={() => {
                setEmotion("excited");
                document.querySelector('[data-section="games"]')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <Gamepad2 className="mr-2 h-4 w-4" />
              Jogar
            </Button>
            <Button 
              className="px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-gray-800 rounded-full font-semibold transition-all transform hover:scale-105 shadow-lg"
              onClick={handleJokeClick}
              disabled={tellJokeMutation.isPending}
            >
              <Laugh className="mr-2 h-4 w-4" />
              {tellJokeMutation.isPending ? "Pensando..." : "Piada"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
