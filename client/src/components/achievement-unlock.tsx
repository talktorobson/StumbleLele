import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Trophy, Star, Zap } from "lucide-react";
import confetti from "canvas-confetti";

interface AchievementUnlockProps {
  achievement: {
    id: number;
    name: string;
    description: string;
    icon: string;
    category: string;
    xpReward: number;
    rarity: "common" | "rare" | "epic" | "legendary";
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

const RARITY_STYLES = {
  common: {
    gradient: "from-gray-400 to-gray-600",
    border: "border-gray-300",
    glow: "shadow-gray-400/50",
    text: "Comum",
    confettiColors: ['#9CA3AF', '#6B7280', '#4B5563']
  },
  rare: {
    gradient: "from-blue-400 to-blue-600",
    border: "border-blue-300",
    glow: "shadow-blue-400/50",
    text: "Raro",
    confettiColors: ['#60A5FA', '#3B82F6', '#2563EB']
  },
  epic: {
    gradient: "from-purple-400 to-purple-600",
    border: "border-purple-300",
    glow: "shadow-purple-400/50",
    text: "Épico",
    confettiColors: ['#A78BFA', '#8B5CF6', '#7C3AED']
  },
  legendary: {
    gradient: "from-yellow-400 via-orange-400 to-red-500",
    border: "border-yellow-300",
    glow: "shadow-yellow-400/50",
    text: "Lendário",
    confettiColors: ['#FCD34D', '#F59E0B', '#EF4444']
  }
};

export default function AchievementUnlock({
  achievement,
  isOpen,
  onClose
}: AchievementUnlockProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen && achievement && !showConfetti) {
      setShowConfetti(true);

      const rarity = achievement.rarity || "common";
      const colors = RARITY_STYLES[rarity].confettiColors;
      const duration = rarity === "legendary" ? 5000 : rarity === "epic" ? 4000 : 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: rarity === "legendary" ? 10 : rarity === "epic" ? 7 : 4,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.6 },
          colors
        });
        confetti({
          particleCount: rarity === "legendary" ? 10 : rarity === "epic" ? 7 : 4,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.6 },
          colors
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };

      frame();

      // Special burst for legendary
      if (rarity === "legendary") {
        confetti({
          particleCount: 100,
          spread: 160,
          origin: { y: 0.6 },
          colors
        });
      }
    }
  }, [isOpen, achievement, showConfetti]);

  if (!isOpen || !achievement) return null;

  const rarityStyle = RARITY_STYLES[achievement.rarity];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0, rotate: 180 }}
          transition={{ type: "spring", damping: 15, stiffness: 200 }}
          onClick={(e) => e.stopPropagation()}
        >
          <Card className={`relative w-full max-w-md bg-gradient-to-br ${rarityStyle.gradient} border-4 ${rarityStyle.border} shadow-2xl ${rarityStyle.glow} overflow-hidden`}>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="absolute top-3 right-3 z-10 bg-white/80 hover:bg-white rounded-full p-2"
            >
              <X className="h-4 w-4" />
            </Button>

            <CardContent className="p-8 text-center">
              {/* Trophy Header */}
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
                className="mb-4"
              >
                <Trophy className="w-16 h-16 mx-auto text-white drop-shadow-lg" />
              </motion.div>

              {/* Achievement Unlocked Text */}
              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-2xl md:text-3xl font-black text-white mb-2 drop-shadow-lg"
              >
                🎉 Conquista Desbloqueada! 🎉
              </motion.h2>

              {/* Rarity Badge */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
                className="inline-block bg-white/90 px-4 py-1 rounded-full mb-4"
              >
                <span className={`text-sm font-bold bg-gradient-to-r ${rarityStyle.gradient} bg-clip-text text-transparent`}>
                  {rarityStyle.text.toUpperCase()}
                </span>
              </motion.div>

              {/* Achievement Icon */}
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
                className="text-8xl mb-4 drop-shadow-2xl"
              >
                {achievement.icon}
              </motion.div>

              {/* Achievement Name */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-white/90 rounded-2xl p-4 mb-4"
              >
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  {achievement.name}
                </h3>
                <p className="text-gray-600">
                  {achievement.description}
                </p>
              </motion.div>

              {/* XP Reward */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="bg-white/80 rounded-xl p-3 mb-6"
              >
                <div className="flex items-center justify-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <span className="text-lg font-bold text-gray-700">
                    +{achievement.xpReward} XP
                  </span>
                  <Zap className="h-5 w-5 text-yellow-500" />
                </div>
              </motion.div>

              {/* Continue Button */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <Button
                  onClick={onClose}
                  className="bg-white text-purple-600 hover:bg-gray-100 font-bold text-lg px-8 py-6 rounded-full shadow-lg transform hover:scale-105 transition-all"
                >
                  Incrível! 🎊
                </Button>
              </motion.div>

              {/* Motivational Message */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-white text-sm mt-4 font-medium drop-shadow"
              >
                Continue assim e desbloqueie mais conquistas! ⭐
              </motion.p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
