import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gamepad2, Brain, Spade, Calculator, Star, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import MemoryGame from "./games/memory-game";
import WordsGame from "./games/words-game";
import MathGame from "./games/math-game";
import EmotionGame from "./games/emotion-game";

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
    {
      id: "emotions",
      name: "Jogo das Emoções",
      description: "Explore sentimentos com a Lele!",
      icon: Heart,
      gradient: "from-rose-400 to-pink-400",
      level: gameProgress.find((p: any) => p.gameType === "emotions")?.level || 1,
    },
  ];

  const handleGameStart = (gameType: string) => {
    setSelectedGame(gameType);
    setGameLevel(games.find(g => g.id === gameType)?.level || 1);
    toast({
      title: "Vamos jogar! 🎮",
      description: "A Lele está preparando o jogo para você!",
    });
  };

  const handleGameComplete = (score: number) => {
    if (selectedGame) {
      saveProgressMutation.mutate({
        gameType: selectedGame,
        level: gameLevel,
        score,
      });
      setSelectedGame(null);
    }
  };

  const handleGameExit = () => {
    setSelectedGame(null);
    toast({
      title: "Até logo! 👋",
      description: "A Lele está esperando você voltar!",
    });
  };

  // If a game is selected, render the game component
  if (selectedGame) {
    switch (selectedGame) {
      case "memory":
        return <MemoryGame level={gameLevel} onGameComplete={handleGameComplete} onExit={handleGameExit} />;
      case "words":
        return <WordsGame level={gameLevel} onGameComplete={handleGameComplete} onExit={handleGameExit} />;
      case "math":
        return <MathGame level={gameLevel} onGameComplete={handleGameComplete} onExit={handleGameExit} />;
      case "emotions":
        return <EmotionGame level={gameLevel} onGameComplete={handleGameComplete} onExit={handleGameExit} />;
      default:
        setSelectedGame(null);
        return null;
    }
  }

  return (
    <Card className="bg-white/95 backdrop-blur-sm shadow-xl" data-section="games">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Gamepad2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-teal-400" />
            <span className="text-xl sm:text-2xl font-bold text-gray-800">Mini Jogos</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => gameSuggestionMutation.mutate()}
            disabled={gameSuggestionMutation.isPending}
            className="px-2 sm:px-3"
          >
            <Star className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Sugestão</span>
            <span className="sm:hidden">Dica</span>
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {games.map((game) => {
            const Icon = game.icon;
            
            return (
              <div
                key={game.id}
                className={`bg-gradient-to-br ${game.gradient} rounded-2xl p-3 sm:p-4 game-card-hover cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105`}
                onClick={() => handleGameStart(game.id)}
              >
                <div className="text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                    <Icon className="h-6 w-6 sm:h-8 sm:w-8 text-gray-700" />
                  </div>
                  <h4 className="font-bold text-base sm:text-lg text-white mb-1 sm:mb-2">{game.name}</h4>
                  <p className="text-xs sm:text-sm text-white/90 mb-2 sm:mb-3">{game.description}</p>
                  <div className="flex items-center justify-center space-x-2">
                    <Badge variant="secondary" className="bg-white/80 text-gray-700 text-xs">
                      <Star className="mr-1 h-2 w-2 sm:h-3 sm:w-3" />
                      Nível {game.level}
                    </Badge>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
