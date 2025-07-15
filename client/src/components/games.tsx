import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gamepad2, Brain, Spade, Calculator, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface GamesProps {
  userId: number;
}

export default function Games({ userId }: GamesProps) {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [gameLevel, setGameLevel] = useState(1);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: gameProgress = [] } = useQuery({
    queryKey: ["/api/game/progress", userId],
  });

  const gameSuggestionMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/game/suggest", { userId });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Sugestão da Lele! 🎮",
        description: data.description,
        duration: 5000,
      });
    },
  });

  const saveProgressMutation = useMutation({
    mutationFn: async (progress: { gameType: string; level: number; score: number }) => {
      const response = await apiRequest("POST", "/api/game/progress", {
        userId,
        ...progress,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/game/progress", userId] });
      toast({
        title: "Parabéns! 🎉",
        description: "Seu progresso foi salvo!",
      });
    },
  });

  const games = [
    {
      id: "memory",
      name: "Jogo da Memória",
      description: "Encontre os pares com a Lele!",
      icon: Brain,
      gradient: "from-yellow-400 to-orange-400",
      level: gameProgress.find((p: any) => p.gameType === "memory")?.level || 1,
    },
    {
      id: "words",
      name: "Palavras Divertidas",
      description: "Aprenda novas palavras brincando!",
      icon: Spade,
      gradient: "from-pink-400 to-purple-400",
      level: gameProgress.find((p: any) => p.gameType === "words")?.level || 1,
    },
    {
      id: "math",
      name: "Matemática Legal",
      description: "Resolva problemas com a Lele!",
      icon: Calculator,
      gradient: "from-teal-400 to-green-400",
      level: gameProgress.find((p: any) => p.gameType === "math")?.level || 1,
    },
  ];

  const handleGameStart = (gameType: string) => {
    setSelectedGame(gameType);
    toast({
      title: "Vamos jogar! 🎮",
      description: "A Lele está preparando o jogo para você!",
    });
    
    // Simulate game completion after 5 seconds
    setTimeout(() => {
      const score = Math.floor(Math.random() * 100) + 50;
      saveProgressMutation.mutate({
        gameType,
        level: gameLevel,
        score,
      });
      setSelectedGame(null);
    }, 5000);
  };

  return (
    <Card className="bg-white/95 backdrop-blur-sm shadow-xl" data-section="games">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Gamepad2 className="mr-2 h-5 w-5 text-teal-400" />
            <span className="text-2xl font-bold text-gray-800">Mini Jogos</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => gameSuggestionMutation.mutate()}
            disabled={gameSuggestionMutation.isPending}
          >
            <Star className="mr-1 h-4 w-4" />
            Sugestão
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {games.map((game) => {
            const Icon = game.icon;
            const isPlaying = selectedGame === game.id;
            
            return (
              <div
                key={game.id}
                className={`bg-gradient-to-br ${game.gradient} rounded-2xl p-4 game-card-hover cursor-pointer shadow-lg ${
                  isPlaying ? "animate-pulse" : ""
                }`}
                onClick={() => !isPlaying && handleGameStart(game.id)}
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3">
                    <Icon className="h-8 w-8 text-gray-700" />
                  </div>
                  <h4 className="font-bold text-lg text-white mb-2">{game.name}</h4>
                  <p className="text-sm text-white/90 mb-3">{game.description}</p>
                  <div className="flex items-center justify-center space-x-2">
                    <Badge variant="secondary" className="bg-white/80 text-gray-700">
                      <Star className="mr-1 h-3 w-3" />
                      Nível {game.level}
                    </Badge>
                  </div>
                  {isPlaying && (
                    <div className="mt-3 text-white text-sm">
                      A Lele está preparando...
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
