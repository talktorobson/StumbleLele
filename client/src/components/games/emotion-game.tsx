import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Smile, Frown, Angry, Zap, Meh, RotateCcw, Trophy, Star } from "lucide-react";

interface EmotionGameProps {
  level: number;
  onGameComplete: (score: number) => void;
  onExit: () => void;
}

interface EmotionChallenge {
  situation: string;
  correctEmotion: string;
  options: string[];
  explanation: string;
  emoji: string;
}

const EMOTIONS = {
  feliz: { icon: Smile, color: 'text-yellow-500', emoji: '😊' },
  triste: { icon: Frown, color: 'text-blue-500', emoji: '😢' },
  bravo: { icon: Angry, color: 'text-red-500', emoji: '😠' },
  surpreso: { icon: Zap, color: 'text-purple-500', emoji: '😲' },
  normal: { icon: Meh, color: 'text-gray-500', emoji: '😐' },
  amor: { icon: Heart, color: 'text-pink-500', emoji: '🥰' },
};

const CHALLENGES = {
  1: [ // Easy - Basic emotions
    {
      situation: "Você ganhou um presente que sempre quis!",
      correctEmotion: "feliz",
      options: ["feliz", "triste", "bravo"],
      explanation: "Receber um presente especial nos deixa felizes e gratos!",
      emoji: "🎁"
    },
    {
      situation: "Seu brinquedo favorito quebrou.",
      correctEmotion: "triste",
      options: ["feliz", "triste", "surpreso"],
      explanation: "É normal ficar triste quando perdemos algo que gostamos.",
      emoji: "🧸"
    },
    {
      situation: "Alguém pegou seu lanche sem perguntar.",
      correctEmotion: "bravo",
      options: ["feliz", "bravo", "surpreso"],
      explanation: "Ficamos bravos quando alguém não respeita nossas coisas.",
      emoji: "🍎"
    },
    {
      situation: "Você encontrou um gatinho no jardim.",
      correctEmotion: "surpreso",
      options: ["surpreso", "bravo", "triste"],
      explanation: "Encontrar algo inesperado nos surpreende!",
      emoji: "🐱"
    },
  ],
  2: [ // Medium - Mixed emotions
    {
      situation: "Seu melhor amigo está se mudando para outra cidade.",
      correctEmotion: "triste",
      options: ["feliz", "triste", "bravo", "surpreso"],
      explanation: "Sentir saudade de pessoas queridas é uma tristeza normal.",
      emoji: "👋"
    },
    {
      situation: "Você ajudou alguém que estava precisando.",
      correctEmotion: "feliz",
      options: ["feliz", "normal", "surpreso", "amor"],
      explanation: "Ajudar os outros nos faz sentir bem e felizes!",
      emoji: "🤝"
    },
    {
      situation: "Você descobriu que vai ter uma festa surpresa!",
      correctEmotion: "surpreso",
      options: ["feliz", "surpreso", "normal", "amor"],
      explanation: "Surpresas boas nos deixam animados e curiosos!",
      emoji: "🎉"
    },
    {
      situation: "Você está brincando com seus amigos no parque.",
      correctEmotion: "feliz",
      options: ["feliz", "normal", "surpreso", "amor"],
      explanation: "Brincar com amigos é divertido e nos deixa alegres!",
      emoji: "🏞️"
    },
  ],
  3: [ // Hard - Complex emotions
    {
      situation: "Você viu seu irmãozinho chorando e o consolou.",
      correctEmotion: "amor",
      options: ["amor", "feliz", "triste", "normal"],
      explanation: "Cuidar de quem amamos mostra nosso carinho e amor.",
      emoji: "👶"
    },
    {
      situation: "Você está esperando o resultado de uma prova importante.",
      correctEmotion: "normal",
      options: ["normal", "feliz", "triste", "surpreso"],
      explanation: "Às vezes nos sentimos neutros, esperando para ver o que acontece.",
      emoji: "📝"
    },
    {
      situation: "Você perdeu um jogo, mas se divertiu muito jogando.",
      correctEmotion: "feliz",
      options: ["feliz", "triste", "bravo", "normal"],
      explanation: "Podemos nos sentir bem mesmo quando perdemos, se nos divertimos!",
      emoji: "🎮"
    },
    {
      situation: "Alguém disse algo que machucou seus sentimentos.",
      correctEmotion: "triste",
      options: ["triste", "bravo", "surpreso", "normal"],
      explanation: "Palavras podem machucar e nos deixar tristes.",
      emoji: "💔"
    },
  ],
  4: [ // Expert - Nuanced emotions
    {
      situation: "Você está orgulhoso de algo que conseguiu fazer sozinho.",
      correctEmotion: "feliz",
      options: ["feliz", "amor", "surpreso", "normal"],
      explanation: "Orgulho de nossas conquistas nos traz felicidade especial!",
      emoji: "🏆"
    },
    {
      situation: "Você viu alguém sendo maltratado e não sabia o que fazer.",
      correctEmotion: "triste",
      options: ["triste", "bravo", "surpreso", "normal"],
      explanation: "Ver injustiça pode nos deixar tristes e preocupados.",
      emoji: "😰"
    },
    {
      situation: "Você abraçou seus pais depois de um dia difícil.",
      correctEmotion: "amor",
      options: ["amor", "feliz", "triste", "normal"],
      explanation: "O carinho da família nos traz conforto e amor.",
      emoji: "🤗"
    },
    {
      situation: "Você está lendo um livro muito interessante.",
      correctEmotion: "feliz",
      options: ["feliz", "surpreso", "normal", "amor"],
      explanation: "Descobrir coisas novas através da leitura nos deixa felizes!",
      emoji: "📚"
    },
  ],
};

export default function EmotionGame({ level, onGameComplete, onExit }: EmotionGameProps) {
  const [currentChallenge, setCurrentChallenge] = useState<EmotionChallenge | null>(null);
  const [completedChallenges, setCompletedChallenges] = useState<string[]>([]);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(180);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showResult, setShowResult] = useState<'correct' | 'wrong' | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const challenges = CHALLENGES[level as keyof typeof CHALLENGES] || CHALLENGES[1];

  const getNextChallenge = () => {
    const availableChallenges = challenges.filter(
      challenge => !completedChallenges.includes(challenge.situation)
    );
    
    if (availableChallenges.length === 0) {
      setGameStatus('won');
      setShowCelebration(true);
      
      // Calculate final score
      const accuracy = correctAnswers / (correctAnswers + wrongAnswers);
      const timeBonus = Math.max(0, timeLeft * 1);
      const accuracyBonus = Math.floor(accuracy * 100);
      const levelBonus = level * 40;
      const finalScore = Math.max(100, score + timeBonus + accuracyBonus + levelBonus);
      
      setTimeout(() => {
        onGameComplete(finalScore);
      }, 2000);
      return;
    }
    
    const randomChallenge = availableChallenges[Math.floor(Math.random() * availableChallenges.length)];
    setCurrentChallenge(randomChallenge);
    setShowResult(null);
    setShowExplanation(false);
  };

  const initializeGame = () => {
    setCompletedChallenges([]);
    setCorrectAnswers(0);
    setWrongAnswers(0);
    setScore(0);
    setTimeLeft(180 + (level - 1) * 60);
    setGameStatus('playing');
    setShowCelebration(false);
    setShowResult(null);
    setShowExplanation(false);
    getNextChallenge();
  };

  useEffect(() => {
    initializeGame();
  }, [level]);

  useEffect(() => {
    if (gameStatus === 'playing' && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && gameStatus === 'playing') {
      setGameStatus('lost');
    }
  }, [timeLeft, gameStatus]);

  const handleAnswer = (selectedEmotion: string) => {
    if (!currentChallenge) return;
    
    const isCorrect = selectedEmotion === currentChallenge.correctEmotion;
    setShowResult(isCorrect ? 'correct' : 'wrong');
    
    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
      setScore(prev => prev + (20 + (level * 10)));
    } else {
      setWrongAnswers(prev => prev + 1);
    }
    
    setCompletedChallenges(prev => [...prev, currentChallenge.situation]);
    
    // Show explanation
    setTimeout(() => {
      setShowExplanation(true);
    }, 1000);
    
    // Next challenge
    setTimeout(() => {
      getNextChallenge();
    }, 4000);
  };

  const getEmotionDisplay = (emotion: string) => {
    const emotionData = EMOTIONS[emotion as keyof typeof EMOTIONS];
    if (!emotionData) return { icon: Meh, color: 'text-gray-500', emoji: '😐' };
    return emotionData;
  };

  const getProgressPercentage = () => {
    return (completedChallenges.length / challenges.length) * 100;
  };

  const getTimeColor = () => {
    if (timeLeft > 120) return 'text-green-600';
    if (timeLeft > 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAccuracy = () => {
    const total = correctAnswers + wrongAnswers;
    return total > 0 ? Math.round((correctAnswers / total) * 100) : 100;
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      {/* Game Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <Badge className="bg-pink-500 text-white">
            Nível {level}
          </Badge>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">Pontos:</span>
            <span className="text-lg font-bold text-pink-600">{score}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">Precisão:</span>
            <span className="text-lg font-bold text-purple-600">{getAccuracy()}%</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">Tempo:</span>
            <span className={`text-lg font-bold ${getTimeColor()}`}>
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </span>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={initializeGame}
            disabled={gameStatus !== 'playing'}
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            Reiniciar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onExit}
          >
            Sair
          </Button>
        </div>
      </div>

      {/* Game Content */}
      {gameStatus === 'playing' && currentChallenge && (
        <div className="space-y-6">
          {/* Current Challenge */}
          <Card className={`transition-all duration-300 ${
            showResult === 'correct' ? 'bg-green-50 border-green-200' :
            showResult === 'wrong' ? 'bg-red-50 border-red-200' :
            'bg-gradient-to-r from-pink-50 to-purple-50'
          }`}>
            <CardContent className="p-8">
              <div className="text-center space-y-6">
                <div className="flex justify-center items-center space-x-2">
                  <Heart className="w-8 h-8 text-pink-500" />
                  <h2 className="text-2xl font-bold text-gray-800">
                    Como Você Se Sentiria?
                  </h2>
                </div>
                
                {/* Situation */}
                <div className="bg-white rounded-xl p-6 shadow-sm border">
                  <div className="text-6xl mb-4">{currentChallenge.emoji}</div>
                  <p className="text-lg text-gray-700 font-medium">
                    {currentChallenge.situation}
                  </p>
                </div>
                
                {/* Options */}
                {!showResult && (
                  <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                    {currentChallenge.options.map((emotion) => {
                      const emotionData = getEmotionDisplay(emotion);
                      const Icon = emotionData.icon;
                      
                      return (
                        <Button
                          key={emotion}
                          onClick={() => handleAnswer(emotion)}
                          className="h-20 flex-col space-y-2 bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-pink-300"
                        >
                          <span className="text-2xl">{emotionData.emoji}</span>
                          <span className="capitalize font-medium">{emotion}</span>
                        </Button>
                      );
                    })}
                  </div>
                )}
                
                {/* Result */}
                {showResult && (
                  <div className="space-y-4">
                    {showResult === 'correct' ? (
                      <div className="flex justify-center items-center space-x-2 text-green-600">
                        <div className="text-4xl">✅</div>
                        <span className="text-2xl font-bold">Correto!</span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex justify-center items-center space-x-2 text-red-600">
                          <div className="text-4xl">❌</div>
                          <span className="text-2xl font-bold">Não foi dessa vez</span>
                        </div>
                        <p className="text-lg text-gray-600">
                          A resposta certa era: <strong className="capitalize">{currentChallenge.correctEmotion}</strong>
                        </p>
                      </div>
                    )}
                    
                    {showExplanation && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
                        <p className="text-sm text-blue-800">
                          💡 <strong>Explicação:</strong> {currentChallenge.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Progresso</span>
              <span className="text-sm text-gray-500">
                {completedChallenges.length} / {challenges.length} situações
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-pink-400 to-purple-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${getProgressPercentage()}%` }}
              />
            </div>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{correctAnswers}</div>
                <div className="text-sm text-gray-600">Corretas</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-600">{wrongAnswers}</div>
                <div className="text-sm text-gray-600">Incorretas</div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Game Status */}
      {gameStatus === 'won' && (
        <div className="text-center space-y-4">
          <div className="flex justify-center items-center space-x-2">
            <Trophy className="w-8 h-8 text-yellow-500" />
            <h2 className="text-2xl font-bold text-green-600">Parabéns!</h2>
            <Trophy className="w-8 h-8 text-yellow-500" />
          </div>
          <p className="text-lg">
            Você completou todas as situações com {getAccuracy()}% de precisão!
          </p>
          <p className="text-md text-gray-600">
            Você está aprendendo muito sobre sentimentos!
          </p>
          {showCelebration && (
            <div className="flex justify-center space-x-1 animate-bounce">
              <Star className="w-6 h-6 text-yellow-400" />
              <Star className="w-6 h-6 text-yellow-400" />
              <Star className="w-6 h-6 text-yellow-400" />
            </div>
          )}
        </div>
      )}

      {gameStatus === 'lost' && (
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-red-600">Tempo Esgotado!</h2>
          <p className="text-lg">
            Você reconheceu {correctAnswers} emoções corretamente!
          </p>
          <Button onClick={initializeGame} className="bg-pink-500 hover:bg-pink-600">
            Jogar Novamente
          </Button>
        </div>
      )}
    </div>
  );
}