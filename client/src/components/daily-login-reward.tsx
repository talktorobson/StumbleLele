import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Star, Zap, Trophy, Gift } from "lucide-react";
import confetti from "canvas-confetti";

interface DailyLoginRewardProps {
  userId: number;
  isOpen: boolean;
  onClose: () => void;
  streak: number;
  xpEarned: number;
  level: number;
}

const STREAK_REWARDS = [
  { day: 1, xp: 10, icon: "⭐", title: "Primeiro Dia!", color: "from-blue-400 to-cyan-400" },
  { day: 2, xp: 15, icon: "🎯", title: "Dois Dias!", color: "from-green-400 to-teal-400" },
  { day: 3, xp: 20, icon: "🔥", title: "Pegando Fogo!", color: "from-orange-400 to-red-400" },
  { day: 4, xp: 25, icon: "💎", title: "Brilhando!", color: "from-purple-400 to-pink-400" },
  { day: 5, xp: 30, icon: "🌟", title: "Semana Completa!", color: "from-yellow-400 to-orange-400" },
  { day: 6, xp: 35, icon: "🎨", title: "Artista!", color: "from-pink-400 to-purple-400" },
  { day: 7, xp: 50, icon: "🏆", title: "Campeão da Semana!", color: "from-yellow-300 to-yellow-500", special: true },
];

export default function DailyLoginReward({
  userId,
  isOpen,
  onClose,
  streak,
  xpEarned,
  level
}: DailyLoginRewardProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  const currentReward = STREAK_REWARDS.find(r => r.day === Math.min(streak, 7)) || STREAK_REWARDS[0];
  const isSpecialReward = currentReward.special || streak >= 7;

  useEffect(() => {
    if (isOpen && !showConfetti) {
      setShowConfetti(true);

      // Trigger confetti
      const duration = isSpecialReward ? 5000 : 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: isSpecialReward ? 7 : 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#FF69B4', '#FF1493', '#FFB6C1', '#FFC0CB']
        });
        confetti({
          particleCount: isSpecialReward ? 7 : 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#9370DB', '#8A2BE2', '#BA55D3', '#DDA0DD']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };

      frame();
    }
  }, [isOpen, showConfetti, isSpecialReward]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.5, opacity: 0, y: 50 }}
          transition={{ type: "spring", damping: 15 }}
          onClick={(e) => e.stopPropagation()}
        >
          <Card className={`relative w-full max-w-md bg-gradient-to-br ${currentReward.color} border-4 border-white shadow-2xl overflow-hidden`}>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="absolute top-3 right-3 z-10 bg-white/80 hover:bg-white rounded-full p-2"
            >
              <X className="h-4 w-4" />
            </Button>

            <CardContent className="p-8 text-center">
              {/* Main Icon with Animation */}
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
                className="text-9xl mb-4"
              >
                {currentReward.icon}
              </motion.div>

              {/* Title */}
              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-3xl md:text-4xl font-black text-white mb-2 drop-shadow-lg"
              >
                {currentReward.title}
              </motion.h2>

              {/* Streak Info */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-white/90 rounded-2xl p-4 mb-4"
              >
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Zap className="h-6 w-6 text-yellow-500" />
                  <span className="text-2xl font-bold text-gray-800">
                    {streak} {streak === 1 ? "Dia" : "Dias"} Seguidos!
                  </span>
                </div>

                {/* XP Earned */}
                <div className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-3">
                  <Star className="h-5 w-5 text-purple-600" />
                  <span className="text-xl font-bold text-purple-700">
                    +{xpEarned} XP
                  </span>
                </div>
              </motion.div>

              {/* Level Display */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-white/80 rounded-xl p-3 mb-4"
              >
                <div className="flex items-center justify-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-600" />
                  <span className="text-lg font-semibold text-gray-700">
                    Nível {level}
                  </span>
                </div>
              </motion.div>

              {/* Streak Progress */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mb-6"
              >
                <p className="text-white text-sm mb-3 font-semibold">Progresso Semanal</p>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                    <div
                      key={day}
                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all ${
                        day <= streak
                          ? "bg-white text-purple-600 font-bold scale-110 shadow-lg"
                          : "bg-white/30 text-white/50"
                      }`}
                    >
                      {day <= streak ? "✓" : day}
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Special Milestone Message */}
              {isSpecialReward && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.6, type: "spring" }}
                  className="bg-yellow-300 text-yellow-900 rounded-xl p-4 mb-4"
                >
                  <Gift className="h-6 w-6 mx-auto mb-2" />
                  <p className="font-bold">
                    Parabéns! Você ganhou um bônus especial! 🎁
                  </p>
                </motion.div>
              )}

              {/* Continue Button */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <Button
                  onClick={onClose}
                  className="bg-white text-purple-600 hover:bg-purple-50 font-bold text-lg px-8 py-6 rounded-full shadow-lg transform hover:scale-105 transition-all"
                >
                  Continuar Brincando! 🎮
                </Button>
              </motion.div>

              {/* Motivational Message */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-white text-sm mt-4 font-medium"
              >
                {streak < 7
                  ? `Volte amanhã para manter sua sequência! 🔥`
                  : `Você é incrível! Continue assim! ⭐`
                }
              </motion.p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
