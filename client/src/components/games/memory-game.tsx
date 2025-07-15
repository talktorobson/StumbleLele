import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shuffle, RotateCcw, Trophy, Star } from "lucide-react";

interface MemoryGameProps {
  level: number;
  onGameComplete: (score: number) => void;
  onExit: () => void;
}

interface GameCard {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const CARD_SETS = {
  1: ['🐶', '🐱', '🐭', '🐹'], // 4 pairs - easy
  2: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊'], // 6 pairs - medium
  3: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'], // 8 pairs - hard
  4: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐵'], // 10 pairs - expert
};

export default function MemoryGame({ level, onGameComplete, onExit }: MemoryGameProps) {
  const [cards, setCards] = useState<GameCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [moves, setMoves] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [showCelebration, setShowCelebration] = useState(false);

  const initializeGame = () => {
    const emojis = CARD_SETS[level as keyof typeof CARD_SETS] || CARD_SETS[1];
    const gameCards: GameCard[] = [];
    
    emojis.forEach((emoji, index) => {
      // Create two cards for each emoji
      gameCards.push(
        { id: index * 2, emoji, isFlipped: false, isMatched: false },
        { id: index * 2 + 1, emoji, isFlipped: false, isMatched: false }
      );
    });

    // Shuffle the cards
    const shuffledCards = gameCards.sort(() => Math.random() - 0.5);
    setCards(shuffledCards);
    setFlippedCards([]);
    setMatchedPairs(0);
    setMoves(0);
    setTimeLeft(60 + (level - 1) * 30); // More time for harder levels
    setGameStatus('playing');
    setShowCelebration(false);
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

  useEffect(() => {
    if (flippedCards.length === 2) {
      const [first, second] = flippedCards;
      const firstCard = cards.find(c => c.id === first);
      const secondCard = cards.find(c => c.id === second);

      if (firstCard && secondCard && firstCard.emoji === secondCard.emoji) {
        // Match found
        setTimeout(() => {
          setCards(prev => prev.map(card => 
            card.id === first || card.id === second 
              ? { ...card, isMatched: true }
              : card
          ));
          setMatchedPairs(prev => prev + 1);
          setFlippedCards([]);
        }, 1000);
      } else {
        // No match
        setTimeout(() => {
          setCards(prev => prev.map(card => 
            card.id === first || card.id === second
              ? { ...card, isFlipped: false }
              : card
          ));
          setFlippedCards([]);
        }, 1000);
      }
      setMoves(prev => prev + 1);
    }
  }, [flippedCards, cards]);

  useEffect(() => {
    const totalPairs = (CARD_SETS[level as keyof typeof CARD_SETS] || CARD_SETS[1]).length;
    if (matchedPairs === totalPairs && gameStatus === 'playing') {
      setGameStatus('won');
      setShowCelebration(true);
      
      // Calculate score based on moves, time, and level
      const timeBonus = Math.max(0, timeLeft * 2);
      const movesPenalty = Math.max(0, moves - totalPairs) * 5;
      const levelBonus = level * 20;
      const finalScore = Math.max(50, 100 + timeBonus - movesPenalty + levelBonus);
      
      setTimeout(() => {
        onGameComplete(finalScore);
      }, 2000);
    }
  }, [matchedPairs, level, timeLeft, moves, gameStatus, onGameComplete]);

  const handleCardClick = (cardId: number) => {
    if (gameStatus !== 'playing' || flippedCards.length >= 2) return;
    
    const card = cards.find(c => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched) return;

    setCards(prev => prev.map(c => 
      c.id === cardId ? { ...c, isFlipped: true } : c
    ));
    setFlippedCards(prev => [...prev, cardId]);
  };

  const getGridCols = () => {
    const cardCount = cards.length;
    if (cardCount <= 8) return 'grid-cols-3 sm:grid-cols-4';
    if (cardCount <= 12) return 'grid-cols-3 sm:grid-cols-4';
    return 'grid-cols-4 sm:grid-cols-5';
  };

  const getTimeColor = () => {
    if (timeLeft > 30) return 'text-green-600';
    if (timeLeft > 10) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-2 sm:p-4">
      {/* Game Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 space-y-3 sm:space-y-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
          <Badge className="bg-purple-500 text-white text-xs sm:text-sm">
            Nível {level}
          </Badge>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="flex items-center space-x-1 sm:space-x-2">
              <span className="text-xs sm:text-sm font-medium">Movimentos:</span>
              <span className="text-sm sm:text-lg font-bold text-blue-600">{moves}</span>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <span className="text-xs sm:text-sm font-medium">Tempo:</span>
              <span className={`text-sm sm:text-lg font-bold ${getTimeColor()}`}>
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </span>
            </div>
          </div>
        </div>
        <div className="flex space-x-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={initializeGame}
            disabled={gameStatus !== 'playing'}
            className="flex-1 sm:flex-none text-xs sm:text-sm px-2 sm:px-3"
          >
            <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            Reiniciar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onExit}
            className="flex-1 sm:flex-none text-xs sm:text-sm px-2 sm:px-3"
          >
            Sair
          </Button>
        </div>
      </div>

      {/* Game Board */}
      <div className={`grid ${getGridCols()} gap-2 sm:gap-3 mb-4 sm:mb-6`}>
        {cards.map((card) => (
          <Card
            key={card.id}
            className={`aspect-square cursor-pointer transition-all duration-300 hover:scale-105 ${
              card.isMatched ? 'ring-2 ring-green-400' : ''
            }`}
            onClick={() => handleCardClick(card.id)}
          >
            <CardContent className="p-0 h-full flex items-center justify-center">
              {card.isFlipped || card.isMatched ? (
                <span className="text-2xl sm:text-4xl animate-flip">{card.emoji}</span>
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-pink-400 to-purple-500 rounded-lg flex items-center justify-center">
                  <Shuffle className="w-4 h-4 sm:w-8 sm:h-8 text-white" />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Game Status */}
      {gameStatus === 'won' && (
        <div className="text-center space-y-3 sm:space-y-4">
          <div className="flex justify-center items-center space-x-2">
            <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500" />
            <h2 className="text-xl sm:text-2xl font-bold text-green-600">Parabéns!</h2>
            <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500" />
          </div>
          <p className="text-base sm:text-lg">
            Você completou o jogo em {moves} movimentos!
          </p>
          {showCelebration && (
            <div className="flex justify-center space-x-1 animate-bounce">
              <Star className="w-4 h-4 sm:w-6 sm:h-6 text-yellow-400" />
              <Star className="w-4 h-4 sm:w-6 sm:h-6 text-yellow-400" />
              <Star className="w-4 h-4 sm:w-6 sm:h-6 text-yellow-400" />
            </div>
          )}
        </div>
      )}

      {gameStatus === 'lost' && (
        <div className="text-center space-y-3 sm:space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-red-600">Tempo Esgotado!</h2>
          <p className="text-base sm:text-lg">
            Que tal tentar novamente? Você consegue!
          </p>
          <Button onClick={initializeGame} className="bg-blue-500 hover:bg-blue-600 text-sm sm:text-base">
            Jogar Novamente
          </Button>
        </div>
      )}

      {/* Progress Bar */}
      <div className="mt-4 sm:mt-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs sm:text-sm font-medium">Progresso</span>
          <span className="text-xs sm:text-sm text-gray-500">
            {matchedPairs} / {(CARD_SETS[level as keyof typeof CARD_SETS] || CARD_SETS[1]).length} pares
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3">
          <div 
            className="bg-gradient-to-r from-green-400 to-blue-500 h-2 sm:h-3 rounded-full transition-all duration-300"
            style={{ 
              width: `${(matchedPairs / (CARD_SETS[level as keyof typeof CARD_SETS] || CARD_SETS[1]).length) * 100}%` 
            }}
          />
        </div>
      </div>
    </div>
  );
}