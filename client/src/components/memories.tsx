import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Smile, Gamepad2, Laugh, Tag } from "lucide-react";

interface Memory {
  id: string;
  content: string;
  category: string;
  timestamp: string;
}

interface MemoriesProps {
  userId: number;
}

export default function Memories({ userId }: MemoriesProps) {
  const { data: memories = [] } = useQuery<Memory[]>({
    queryKey: ["/api/memories", userId],
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "conversa":
        return Smile;
      case "jogos":
        return Gamepad2;
      case "humor":
        return Laugh;
      default:
        return Heart;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "conversa":
        return "from-pink-200 to-purple-200 border-pink-400";
      case "jogos":
        return "from-teal-200 to-green-200 border-teal-400";
      case "humor":
        return "from-yellow-200 to-orange-200 border-yellow-400";
      default:
        return "from-gray-200 to-gray-300 border-gray-400";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return "Agora mesmo";
    } else if (diffInHours < 24) {
      return `${diffInHours}h atrás`;
    } else {
      return date.toLocaleDateString('pt-BR', { 
        day: 'numeric', 
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  return (
    <Card className="bg-white/95 backdrop-blur-sm shadow-xl" data-section="memories">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Heart className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-pink-400" />
          <span className="text-xl sm:text-2xl font-bold text-gray-800">Memórias da Lele</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 sm:space-y-4">
          {memories.length === 0 ? (
            <div className="text-center py-6 sm:py-8 text-gray-500">
              <Heart className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-gray-300 mb-3 sm:mb-4" />
              <p className="text-sm sm:text-base">A Lele ainda não criou nenhuma memória.</p>
              <p className="text-xs sm:text-sm mt-2">Continue conversando e jogando para criar lindas memórias!</p>
            </div>
          ) : (
            memories.map((memory: any) => {
              const Icon = getCategoryIcon(memory.category);
              const colorClasses = getCategoryColor(memory.category);
              
              return (
                <div
                  key={memory.id}
                  className={`bg-gradient-to-r ${colorClasses} rounded-2xl p-3 sm:p-4 border-l-4 chat-bubble`}
                >
                  <div className="flex items-start space-x-2 sm:space-x-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                      <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-800 font-medium mb-2 text-sm sm:text-base">{memory.content}</p>
                      <div className="flex items-center space-x-2 sm:space-x-4 text-xs text-gray-600">
                        <span>{formatDate(memory.timestamp)}</span>
                        <Badge variant="secondary" className="bg-white/60 text-xs px-2 py-1">
                          <Tag className="mr-1 h-2 w-2 sm:h-3 sm:w-3" />
                          {memory.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
