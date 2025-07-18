import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gamepad2, Brain, Spade, Calculator, Star, Heart, Rocket } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import MemoryGame from "./games/memory-game";
import WordsGame from "./games/words-game";
import MathGame from "./games/math-game";
import EmotionGame from "./games/emotion-game";
import CosmicBlasterGame from "./games/cosmic-blaster-game";

interface GameProgress {
  gameType: string;
  level: number;
  score: number;
}

interface GamesProps {
  userId: number;
}

export default function Games({ userId }: GamesProps) {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [gameLevel, setGameLevel] = useState(1);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: gameProgress = [] } = useQuery<GameProgress[]>({
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
    {
      id: "cosmic-blaster",
      name: "Defesa Cósmica da Lele",
      description: "Proteja a galáxia com a Lele!",
      icon: Rocket,
      gradient: "from-blue-400 to-purple-400",
      level: gameProgress.find((p: any) => p.gameType === "cosmic-blaster")?.level || 1,
    },
    {
      id: "coming-soon",
      name: "Em Breve...",
      description: "Mais diversão chegando!",
      icon: Star,
      gradient: "from-gray-300 to-gray-400",
      level: 1,
      isComingSoon: true,
    },
  ];

  const handleGameStart = (gameType: string) => {
    const game = games.find(g => g.id === gameType);
    
    // Handle coming soon games
    if (game?.isComingSoon) {
      toast({
        title: "Em breve! 🚀",
        description: "Este jogo incrível está chegando em breve!",
      });
      return;
    }
    
    // Handle all games (including cosmic blaster) as internal games
    setSelectedGame(gameType);
    setGameLevel(game?.level || 1);
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
      case "cosmic-blaster":
        return <CosmicBlasterGame level={gameLevel} onGameComplete={handleGameComplete} onExit={handleGameExit} />;
      default:
        setSelectedGame(null);
        return null;
    }
  }

  return (
    <Card className="bg-gradient-to-br from-white via-pink-50 to-purple-50 backdrop-blur-sm shadow-2xl border-4 border-purple-200 rounded-3xl" data-section="games">
      <CardHeader className="bg-gradient-to-r from-purple-200 to-pink-200 rounded-t-3xl">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-teal-400 to-blue-400 rounded-full flex items-center justify-center mr-3 shadow-lg">
              <Gamepad2 className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <span className="text-xl sm:text-3xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              🎮 Mini Jogos Divertidos! 🎮
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => gameSuggestionMutation.mutate()}
            disabled={gameSuggestionMutation.isPending}
            className="px-3 sm:px-4 py-2 sm:py-3 bg-gradient-to-r from-yellow-300 to-orange-300 hover:from-yellow-400 hover:to-orange-400 rounded-full shadow-lg border-2 border-white transform hover:scale-110 transition-all"
          >
            <Star className="mr-1 h-4 w-4 sm:h-5 sm:w-5 text-white animate-pulse" />
            <span className="hidden sm:inline text-white font-bold">Sugestão</span>
            <span className="sm:hidden text-white font-bold">Dica</span>
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6">
          {games.map((game) => {
            const Icon = game.icon;
            
            return (
              <div
                key={game.id}
                className={`bg-gradient-to-br ${game.gradient} rounded-3xl p-4 sm:p-6 game-card-hover ${game.isComingSoon ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'} shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 transform border-4 border-white relative overflow-hidden`}
                onClick={() => handleGameStart(game.id)}
              >
                {/* Decorative elements */}
                <div className="absolute top-2 right-2 text-2xl animate-spin">⭐</div>
                <div className="absolute bottom-2 left-2 text-xl animate-bounce">✨</div>
                
                <div className="text-center relative z-10">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-xl border-4 border-yellow-300 transform hover:rotate-12 transition-transform">
                    <Icon className="h-8 w-8 sm:h-10 sm:w-10 text-gray-700" />
                  </div>
                  <h4 className="font-black text-lg sm:text-xl text-white mb-2 sm:mb-3 drop-shadow-lg">{game.name}</h4>
                  <p className="text-sm sm:text-base text-white/95 mb-3 sm:mb-4 font-semibold">{game.description}</p>
                  <div className="flex items-center justify-center space-x-2">
                    <Badge variant="secondary" className="bg-yellow-300 text-purple-800 text-sm font-bold px-3 py-1 rounded-full border-2 border-white shadow-lg">
                      <Star className="mr-1 h-3 w-3 sm:h-4 sm:w-4 animate-pulse" />
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
