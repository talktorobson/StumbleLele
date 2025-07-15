import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface LeleAvatarProps {
  emotion: string;
  isAnimating: boolean;
  isListening?: boolean;
  isSpeaking?: boolean;
  className?: string;
}

export default function LeleAvatar({ 
  emotion, 
  isAnimating, 
  isListening = false, 
  isSpeaking = false,
  className = "" 
}: LeleAvatarProps) {
  const [blinkState, setBlinkState] = useState(false);
  
  // Blinking animation
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlinkState(true);
      setTimeout(() => setBlinkState(false), 150);
    }, 2000 + Math.random() * 3000);
    
    return () => clearInterval(blinkInterval);
  }, []);

  const getAvatarEmoji = () => {
    if (isSpeaking) return "😮";
    if (blinkState) return "😌";
    
    switch(emotion) {
      case "excited":
        return "🤩";
      case "thinking":
        return "🤔";
      case "surprised":
        return "😲";
      case "playful":
        return "😋";
      case "curious":
        return "🤨";
      case "sleepy":
        return "😴";
      default:
        return "😊";
    }
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <motion.div
        className="relative w-full h-full"
        animate={isAnimating ? {
          y: [0, -10, 0],
          rotate: [0, 2, -2, 0],
          scale: [1, 1.05, 1]
        } : {}}
        transition={{ 
          duration: 1.5, 
          ease: "easeInOut",
          repeat: isAnimating ? Infinity : 0
        }}
      >
        {/* Main Avatar Circle */}
        <div className="w-48 h-48 rounded-full bg-gradient-to-br from-lele-soft-pink to-lele-mint border-4 border-lele-pink shadow-2xl overflow-hidden relative">
          
          {/* Simplified Avatar for 7-year-old girl */}
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-8xl mb-2 filter drop-shadow-lg">
                {getAvatarEmoji()}
              </div>
              <div className="text-2xl font-bold text-gray-700 mb-2">Lele</div>
              <div className="text-sm text-gray-500">Sua amiga AI</div>
            </div>
          </div>
        </div>
        
        {/* Expression indicator */}
        <motion.div 
          className="absolute -top-2 -right-2 w-12 h-12 bg-gradient-to-br from-lele-yellow to-lele-pink rounded-full flex items-center justify-center shadow-lg"
          animate={isAnimating ? { rotate: [0, 10, -10, 0] } : {}}
          transition={{ duration: 0.5, repeat: isAnimating ? Infinity : 0 }}
        >
          <span className="text-xl">✨</span>
        </motion.div>
        
        {/* Voice activity indicator */}
        {(isListening || isSpeaking) && (
          <motion.div 
            className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-16 h-8 bg-gradient-to-r from-lele-turquoise to-lele-mint rounded-full flex items-center justify-center shadow-lg"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          >
            <div className="flex space-x-1">
              {[...Array(4)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1 h-4 bg-white rounded-full"
                  animate={isListening || isSpeaking ? { 
                    height: [8, 16, 8],
                    opacity: [0.5, 1, 0.5]
                  } : {}}
                  transition={{ 
                    duration: 0.6, 
                    repeat: Infinity, 
                    delay: i * 0.1 
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}