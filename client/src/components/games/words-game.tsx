import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { BookOpen, Check, X, Lightbulb, RotateCcw, Trophy, Star } from "lucide-react";

interface WordsGameProps {
  level: number;
  onGameComplete: (score: number) => void;
  onExit: () => void;
}

interface WordChallenge {
  word: string;
  hint: string;
  category: string;
  scrambled: string;
}

const WORD_SETS = {
  1: [ // Easy - 3-4 letter words
    { word: "GATO", hint: "Animal que faz miau", category: "Animais", scrambled: "TOGA" },
    { word: "CASA", hint: "Lugar onde moramos", category: "Lugares", scrambled: "SACA" },
    { word: "BOLA", hint: "Usada para jogar futebol", category: "Brinquedos", scrambled: "LOBA" },
    { word: "FLOR", hint: "Bonita e cheirosa no jardim", category: "Natureza", scrambled: "FOLR" },
    { word: "LIVRO", hint: "Tem páginas e histórias", category: "Objetos", scrambled: "VRILO" },
  ],
  2: [ // Medium - 4-5 letter words
    { word: "ESCOLA", hint: "Lugar onde aprendemos", category: "Lugares", scrambled: "LOCESA" },
    { word: "AMIGO", hint: "Pessoa querida que brinca conosco", category: "Pessoas", scrambled: "GAOIM" },
    { word: "BRINCAR", hint: "O que fazemos quando nos divertimos", category: "Ações", scrambled: "CARNIRB" },
    { word: "FAMÍLIA", hint: "Papai, mamãe e irmãos", category: "Pessoas", scrambled: "LÍFAMIA" },
    { word: "JARDIM", hint: "Lugar com plantas e flores", category: "Lugares", scrambled: "DIMRAJ" },
  ],
  3: [ // Hard - 5-6 letter words
    { word: "BORBOLETA", hint: "Inseto colorido que voa", category: "Animais", scrambled: "LETABORBO" },
    { word: "AVENTURA", hint: "Jornada cheia de surpresas", category: "Conceitos", scrambled: "VENTARUA" },
    { word: "IMAGINAÇÃO", hint: "Usamos para criar histórias", category: "Conceitos", scrambled: "GINAÇÃOIMAI" },
    { word: "DESCOBRIR", hint: "Encontrar algo novo", category: "Ações", scrambled: "COBRIRSDE" },
    { word: "FELICIDADE", hint: "Sentimento de alegria", category: "Emoções", scrambled: "DADEFELICI" },
  ],
  4: [ // Expert - 6+ letter words
    { word: "CURIOSIDADE", hint: "Vontade de saber mais", category: "Conceitos", scrambled: "DADECURIOSI" },
    { word: "APRENDIZADO", hint: "Processo de ganhar conhecimento", category: "Conceitos", scrambled: "ZADOAPRENDI" },
    { word: "CRIATIVIDADE", hint: "Capacidade de criar coisas novas", category: "Conceitos", scrambled: "DECRIATIVI" },
    { word: "PERSEVERANÇA", hint: "Não desistir dos sonhos", category: "Valores", scrambled: "ÇAPERSEVAN" },
    { word: "GENEROSIDADE", hint: "Ser bondoso com os outros", category: "Valores", scrambled: "DENEGROSIDA" },
  ],
};

export default function WordsGame({ level, onGameComplete, onExit }: WordsGameProps) {
  const [currentChallenge, setCurrentChallenge] = useState<WordChallenge | null>(null);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [completedWords, setCompletedWords] = useState<string[]>([]);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120);
  const [showCelebration, setShowCelebration] = useState(false);

  const wordSet = WORD_SETS[level as keyof typeof WORD_SETS] || WORD_SETS[1];

  const getNextWord = () => {
    const availableWords = wordSet.filter(word => !completedWords.includes(word.word));
    if (availableWords.length === 0) {
      setGameStatus('won');
      setShowCelebration(true);
      
      // Calculate final score
      const timeBonus = Math.max(0, timeLeft * 2);
      const accuracyBonus = Math.max(0, (completedWords.length * 50) - (wrongAttempts * 10));
      const levelBonus = level * 30;
      const finalScore = Math.max(100, score + timeBonus + accuracyBonus + levelBonus);
      
      setTimeout(() => {
        onGameComplete(finalScore);
      }, 2000);
      return;
    }
    
    const randomWord = availableWords[Math.floor(Math.random() * availableWords.length)];
    setCurrentChallenge(randomWord);
    setCurrentAnswer("");
    setShowHint(false);
  };

  const initializeGame = () => {
    setCompletedWords([]);
    setWrongAttempts(0);
    setScore(0);
    setTimeLeft(120 + (level - 1) * 30);
    setGameStatus('playing');
    setShowCelebration(false);
    getNextWord();
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

  const handleSubmit = () => {
    if (!currentChallenge) return;
    
    const normalizedAnswer = currentAnswer.toUpperCase().trim();
    const normalizedTarget = currentChallenge.word.toUpperCase().trim();
    
    if (normalizedAnswer === normalizedTarget) {
      // Correct answer
      setCompletedWords(prev => [...prev, currentChallenge.word]);
      setScore(prev => prev + (50 + (level * 10) - (wrongAttempts * 5)));
      getNextWord();
    } else {
      // Wrong answer
      setWrongAttempts(prev => prev + 1);
      setCurrentAnswer("");
      
      if (wrongAttempts >= 2) {
        setShowHint(true);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const getScrambledLetters = () => {
    if (!currentChallenge) return [];
    return currentChallenge.scrambled.split('').map((letter, index) => ({
      letter,
      id: index,
      isUsed: false
    }));
  };

  const getProgressPercentage = () => {
    return (completedWords.length / wordSet.length) * 100;
  };

  const getTimeColor = () => {
    if (timeLeft > 60) return 'text-green-600';
    if (timeLeft > 30) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      {/* Game Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <Badge className="bg-blue-500 text-white">
            Nível {level}
          </Badge>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">Pontos:</span>
            <span className="text-lg font-bold text-blue-600">{score}</span>
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
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div className="flex justify-center items-center space-x-2">
                  <BookOpen className="w-6 h-6 text-blue-500" />
                  <h2 className="text-2xl font-bold text-gray-800">
                    Monte a Palavra
                  </h2>
                </div>
                
                <Badge className="bg-purple-100 text-purple-800">
                  {currentChallenge.category}
                </Badge>
                
                {/* Scrambled Letters */}
                <div className="flex justify-center space-x-2 mb-4">
                  {getScrambledLetters().map((item) => (
                    <div
                      key={item.id}
                      className="w-12 h-12 bg-white border-2 border-purple-300 rounded-lg flex items-center justify-center text-xl font-bold text-purple-600 shadow-sm"
                    >
                      {item.letter}
                    </div>
                  ))}
                </div>
                
                {/* Input Field */}
                <div className="max-w-md mx-auto">
                  <Input
                    value={currentAnswer}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Digite a palavra..."
                    className="text-center text-lg font-medium"
                    maxLength={currentChallenge.word.length}
                  />
                </div>
                
                {/* Hint Button and Display */}
                <div className="space-y-2">
                  {!showHint && wrongAttempts < 2 && (
                    <Button
                      variant="outline"
                      onClick={() => setShowHint(true)}
                      className="bg-yellow-100 hover:bg-yellow-200"
                    >
                      <Lightbulb className="w-4 h-4 mr-2" />
                      Dica
                    </Button>
                  )}
                  
                  {showHint && (
                    <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-3">
                      <p className="text-sm text-yellow-800">
                        💡 <strong>Dica:</strong> {currentChallenge.hint}
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Action Buttons */}
                <Button
                  onClick={handleSubmit}
                  disabled={!currentAnswer.trim()}
                  className="bg-green-500 hover:bg-green-600"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Confirmar
                </Button>
                
                {/* Wrong Attempts Indicator */}
                {wrongAttempts > 0 && (
                  <div className="flex justify-center items-center space-x-2 text-red-600">
                    <X className="w-4 h-4" />
                    <span className="text-sm">
                      {wrongAttempts} tentativa{wrongAttempts > 1 ? 's' : ''} incorreta{wrongAttempts > 1 ? 's' : ''}
                    </span>
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
                {completedWords.length} / {wordSet.length} palavras
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${getProgressPercentage()}%` }}
              />
            </div>
          </div>
          
          {/* Completed Words */}
          {completedWords.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">Palavras Completadas:</h3>
                <div className="flex flex-wrap gap-2">
                  {completedWords.map((word, index) => (
                    <Badge key={index} className="bg-green-100 text-green-800">
                      {word}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
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
            Você completou todas as palavras! Pontuação: {score}
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
            Você completou {completedWords.length} palavras. Que tal tentar novamente?
          </p>
          <Button onClick={initializeGame} className="bg-blue-500 hover:bg-blue-600">
            Jogar Novamente
          </Button>
        </div>
      )}
    </div>
  );
}