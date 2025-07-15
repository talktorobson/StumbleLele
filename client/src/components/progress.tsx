import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress as ProgressBar } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Trophy, Star, Gamepad2, Heart, Smile } from "lucide-react";

interface ProgressProps {
  userId: number;
}

export default function Progress({ userId }: ProgressProps) {
  const { data: gameProgress = [] } = useQuery({
    queryKey: ["/api/game/progress", userId],
  });

  const { data: memories = [] } = useQuery({
    queryKey: ["/api/memories", userId],
  });

  const { data: conversations = [] } = useQuery({
    queryKey: ["/api/conversations", userId],
  });

  const calculateProgress = () => {
    const totalGames = gameProgress.length;
    const avgLevel = totalGames > 0 
      ? gameProgress.reduce((sum: number, p: any) => sum + p.level, 0) / totalGames 
      : 0;
    
    return {
      vocabulary: Math.min(100, Math.max(0, (conversations.length * 5) + (avgLevel * 10))),
      math: Math.min(100, Math.max(0, (gameProgress.find((p: any) => p.gameType === "math")?.level || 0) * 20)),
      creativity: Math.min(100, Math.max(0, (memories.length * 8) + (conversations.length * 3))),
      social: Math.min(100, Math.max(0, conversations.length * 4)),
    };
  };

  const progress = calculateProgress();

  const achievements = [
    {
      id: "first_chat",
      title: "Primeira Conversa",
      description: "Completou sua primeira conversa com a Lele",
      icon: Smile,
      color: "bg-yellow-400",
      earned: conversations.length > 0,
    },
    {
      id: "game_master",
      title: "Mestre dos Jogos",
      description: "Jogou 3 mini jogos diferentes",
      icon: Gamepad2,
      color: "bg-teal-400",
      earned: gameProgress.length >= 3,
    },
    {
      id: "best_friend",
      title: "Melhor Amiga",
      description: "Conversou com a Lele 10 vezes",
      icon: Heart,
      color: "bg-pink-400",
      earned: conversations.length >= 10,
    },
    {
      id: "memory_keeper",
      title: "Guardiã de Memórias",
      description: "Criou 5 memórias especiais",
      icon: Star,
      color: "bg-purple-400",
      earned: memories.length >= 5,
    },
  ];

  return (
    <Card className="bg-white/95 backdrop-blur-sm shadow-xl" data-section="progress">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Trophy className="mr-2 h-5 w-5 text-yellow-400" />
          <span className="text-2xl font-bold text-gray-800">Progresso da Helena</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Learning Progress */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg text-gray-800">Aprendizado</h4>
            
            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-semibold text-gray-700">Vocabulário</span>
                  <span className="text-sm text-gray-500">{Math.round(progress.vocabulary)}%</span>
                </div>
                <ProgressBar value={progress.vocabulary} className="h-3" />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-semibold text-gray-700">Matemática</span>
                  <span className="text-sm text-gray-500">{Math.round(progress.math)}%</span>
                </div>
                <ProgressBar value={progress.math} className="h-3" />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-semibold text-gray-700">Criatividade</span>
                  <span className="text-sm text-gray-500">{Math.round(progress.creativity)}%</span>
                </div>
                <ProgressBar value={progress.creativity} className="h-3" />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-semibold text-gray-700">Social</span>
                  <span className="text-sm text-gray-500">{Math.round(progress.social)}%</span>
                </div>
                <ProgressBar value={progress.social} className="h-3" />
              </div>
            </div>
          </div>
          
          {/* Achievements */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg text-gray-800">Conquistas</h4>
            
            <div className="space-y-3">
              {achievements.map((achievement) => {
                const Icon = achievement.icon;
                return (
                  <div
                    key={achievement.id}
                    className={`flex items-center space-x-3 p-3 rounded-2xl ${
                      achievement.earned 
                        ? "bg-gradient-to-r from-yellow-100 to-orange-100" 
                        : "bg-gray-100"
                    }`}
                  >
                    <div className={`w-12 h-12 ${achievement.color} rounded-full flex items-center justify-center ${
                      !achievement.earned ? "grayscale opacity-50" : ""
                    }`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h5 className="font-semibold text-gray-800 text-sm">{achievement.title}</h5>
                      <p className="text-xs text-gray-600">{achievement.description}</p>
                    </div>
                    {achievement.earned && (
                      <Badge className="bg-green-400 text-white">
                        <Star className="mr-1 h-3 w-3" />
                        Conquistado
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
