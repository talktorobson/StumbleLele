import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Calculator, Check, X, RotateCcw, Trophy, Star, Plus, Minus, Divide } from "lucide-react";

interface MathGameProps {
  level: number;
  onGameComplete: (score: number) => void;
  onExit: () => void;
}

interface MathProblem {
  num1: number;
  num2: number;
  operation: '+' | '-' | '*' | '/';
  answer: number;
  display: string;
}

const OPERATIONS = {
  1: ['+'], // Easy - Addition only
  2: ['+', '-'], // Medium - Addition and subtraction
  3: ['+', '-', '*'], // Hard - Addition, subtraction, multiplication
  4: ['+', '-', '*', '/'], // Expert - All operations
};

const RANGES = {
  1: { min: 1, max: 10 }, // Easy - 1-10
  2: { min: 1, max: 20 }, // Medium - 1-20
  3: { min: 1, max: 50 }, // Hard - 1-50
  4: { min: 1, max: 100 }, // Expert - 1-100
};

export default function MathGame({ level, onGameComplete, onExit }: MathGameProps) {
  const [currentProblem, setCurrentProblem] = useState<MathProblem | null>(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120);
  const [showCelebration, setShowCelebration] = useState(false);
  const [problemsCompleted, setProblemsCompleted] = useState(0);
  const [showResult, setShowResult] = useState<'correct' | 'wrong' | null>(null);

  const targetProblems = 10 + (level * 5); // 15, 20, 25, 30 problems

  const generateProblem = (): MathProblem => {
    const operations = OPERATIONS[level as keyof typeof OPERATIONS];
    const range = RANGES[level as keyof typeof RANGES];
    
    const operation = operations[Math.floor(Math.random() * operations.length)] as '+' | '-' | '*' | '/';
    let num1 = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
    let num2 = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
    
    // Ensure positive results for subtraction
    if (operation === '-' && num2 > num1) {
      [num1, num2] = [num2, num1];
    }
    
    // For division, ensure clean division
    if (operation === '/') {
      const divisor = Math.floor(Math.random() * 9) + 2; // 2-10
      const quotient = Math.floor(Math.random() * 10) + 1; // 1-10
      num1 = divisor * quotient;
      num2 = divisor;
    }
    
    // Adjust multiplication for easier problems
    if (operation === '*') {
      num1 = Math.floor(Math.random() * 10) + 1;
      num2 = Math.floor(Math.random() * 10) + 1;
    }
    
    let answer: number;
    switch (operation) {
      case '+':
        answer = num1 + num2;
        break;
      case '-':
        answer = num1 - num2;
        break;
      case '*':
        answer = num1 * num2;
        break;
      case '/':
        answer = num1 / num2;
        break;
    }
    
    return {
      num1,
      num2,
      operation,
      answer,
      display: `${num1} ${operation} ${num2} = ?`
    };
  };

  const initializeGame = () => {
    setCurrentProblem(generateProblem());
    setUserAnswer("");
    setCorrectAnswers(0);
    setWrongAnswers(0);
    setStreak(0);
    setBestStreak(0);
    setScore(0);
    setTimeLeft(120 + (level - 1) * 30);
    setGameStatus('playing');
    setShowCelebration(false);
    setProblemsCompleted(0);
    setShowResult(null);
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
    if (problemsCompleted >= targetProblems && gameStatus === 'playing') {
      setGameStatus('won');
      setShowCelebration(true);
      
      // Calculate final score
      const accuracy = correctAnswers / (correctAnswers + wrongAnswers);
      const timeBonus = Math.max(0, timeLeft * 2);
      const accuracyBonus = Math.floor(accuracy * 100);
      const streakBonus = bestStreak * 5;
      const levelBonus = level * 50;
      const finalScore = Math.max(100, score + timeBonus + accuracyBonus + streakBonus + levelBonus);
      
      setTimeout(() => {
        onGameComplete(finalScore);
      }, 2000);
    }
  }, [problemsCompleted, targetProblems, gameStatus, correctAnswers, wrongAnswers, score, timeLeft, bestStreak, level, onGameComplete]);

  const handleSubmit = () => {
    if (!currentProblem || !userAnswer.trim()) return;
    
    const userNum = parseFloat(userAnswer);
    const isCorrect = Math.abs(userNum - currentProblem.answer) < 0.01; // Handle floating point precision
    
    setShowResult(isCorrect ? 'correct' : 'wrong');
    
    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
      setStreak(prev => {
        const newStreak = prev + 1;
        setBestStreak(current => Math.max(current, newStreak));
        return newStreak;
      });
      setScore(prev => prev + (10 + (level * 5) + (streak * 2)));
    } else {
      setWrongAnswers(prev => prev + 1);
      setStreak(0);
    }
    
    setProblemsCompleted(prev => prev + 1);
    
    // Show result for 1 second, then next problem
    setTimeout(() => {
      setShowResult(null);
      setCurrentProblem(generateProblem());
      setUserAnswer("");
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const getOperationIcon = (operation: string) => {
    switch (operation) {
      case '+':
        return <Plus className="w-6 h-6" />;
      case '-':
        return <Minus className="w-6 h-6" />;
      case '*':
        return <X className="w-6 h-6" />;
      case '/':
        return <Divide className="w-6 h-6" />;
      default:
        return <Calculator className="w-6 h-6" />;
    }
  };

  const getProgressPercentage = () => {
    return (problemsCompleted / targetProblems) * 100;
  };

  const getTimeColor = () => {
    if (timeLeft > 60) return 'text-green-600';
    if (timeLeft > 30) return 'text-yellow-600';
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
          <Badge className="bg-green-500 text-white">
            Nível {level}
          </Badge>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">Pontos:</span>
            <span className="text-lg font-bold text-green-600">{score}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">Sequência:</span>
            <span className="text-lg font-bold text-blue-600">{streak}</span>
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
      {gameStatus === 'playing' && currentProblem && (
        <div className="space-y-6">
          {/* Current Problem */}
          <Card className={`transition-all duration-300 ${
            showResult === 'correct' ? 'bg-green-50 border-green-200' :
            showResult === 'wrong' ? 'bg-red-50 border-red-200' :
            'bg-gradient-to-r from-green-50 to-blue-50'
          }`}>
            <CardContent className="p-8">
              <div className="text-center space-y-6">
                {showResult ? (
                  <div className="space-y-4">
                    {showResult === 'correct' ? (
                      <div className="flex justify-center items-center space-x-2 text-green-600">
                        <Check className="w-8 h-8" />
                        <span className="text-2xl font-bold">Correto!</span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex justify-center items-center space-x-2 text-red-600">
                          <X className="w-8 h-8" />
                          <span className="text-2xl font-bold">Incorreto</span>
                        </div>
                        <p className="text-lg text-gray-600">
                          A resposta correta é: {currentProblem.answer}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex justify-center items-center space-x-2">
                      <Calculator className="w-8 h-8 text-blue-500" />
                      <h2 className="text-2xl font-bold text-gray-800">
                        Resolva o Problema
                      </h2>
                    </div>
                    
                    {/* Problem Display */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border">
                      <div className="flex items-center justify-center space-x-4 text-4xl font-bold text-gray-800">
                        <span>{currentProblem.num1}</span>
                        <span className="text-blue-500">
                          {getOperationIcon(currentProblem.operation)}
                        </span>
                        <span>{currentProblem.num2}</span>
                        <span className="text-gray-400">=</span>
                        <span className="text-blue-500">?</span>
                      </div>
                    </div>
                    
                    {/* Answer Input */}
                    <div className="max-w-xs mx-auto">
                      <Input
                        type="number"
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Sua resposta..."
                        className="text-center text-2xl font-bold h-16"
                        step="0.1"
                      />
                    </div>
                    
                    {/* Submit Button */}
                    <Button
                      onClick={handleSubmit}
                      disabled={!userAnswer.trim()}
                      className="bg-blue-500 hover:bg-blue-600 text-lg px-8 py-3"
                    >
                      <Check className="w-5 h-5 mr-2" />
                      Confirmar
                    </Button>
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
                {problemsCompleted} / {targetProblems} problemas
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${getProgressPercentage()}%` }}
              />
            </div>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{bestStreak}</div>
                <div className="text-sm text-gray-600">Melhor Sequência</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">{getAccuracy()}%</div>
                <div className="text-sm text-gray-600">Precisão</div>
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
            Você completou {targetProblems} problemas com {getAccuracy()}% de precisão!
          </p>
          <p className="text-md text-gray-600">
            Melhor sequência: {bestStreak} | Pontuação final: {score}
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
            Você resolveu {correctAnswers} problemas corretamente!
          </p>
          <Button onClick={initializeGame} className="bg-blue-500 hover:bg-blue-600">
            Jogar Novamente
          </Button>
        </div>
      )}
    </div>
  );
}