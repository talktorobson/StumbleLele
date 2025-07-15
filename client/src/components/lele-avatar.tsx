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
        <div className="w-48 h-48 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 border-4 border-lele-pink shadow-2xl overflow-hidden relative">
          
          {/* Avatar based on Helena's picture */}
          <div className="flex items-center justify-center h-full relative">
            {/* Hair */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-40 h-24 bg-gradient-to-b from-amber-800 to-amber-700 rounded-t-full border-2 border-amber-900">
              {/* Hair strands */}
              <div className="absolute top-2 left-8 w-6 h-8 bg-amber-700 rounded-full transform rotate-12"></div>
              <div className="absolute top-2 right-8 w-6 h-8 bg-amber-700 rounded-full transform -rotate-12"></div>
              <div className="absolute top-6 left-12 w-4 h-6 bg-amber-600 rounded-full transform rotate-6"></div>
              <div className="absolute top-6 right-12 w-4 h-6 bg-amber-600 rounded-full transform -rotate-6"></div>
            </div>
            
            {/* Face */}
            <div className="absolute top-16 left-1/2 transform -translate-x-1/2 w-32 h-32 bg-gradient-to-b from-orange-200 to-orange-300 rounded-full border-2 border-orange-400 z-10">
              
              {/* Eyes */}
              <div className="absolute top-8 left-7 w-6 h-6 bg-white rounded-full border border-gray-300">
                <div className="absolute top-1 left-1 w-4 h-4 bg-black rounded-full">
                  <div className="absolute top-1 left-1 w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
              
              <div className="absolute top-8 right-7 w-6 h-6 bg-white rounded-full border border-gray-300">
                <div className="absolute top-1 left-1 w-4 h-4 bg-black rounded-full">
                  <div className="absolute top-1 left-1 w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
              
              {/* Nose */}
              <div className="absolute top-16 left-1/2 transform -translate-x-1/2 w-1 h-2 bg-orange-400 rounded-full"></div>
              
              {/* Mouth */}
              <div className="absolute top-20 left-1/2 transform -translate-x-1/2">
                {emotion === "excited" || emotion === "playful" ? (
                  <div className="w-8 h-6 bg-red-400 rounded-full relative overflow-hidden">
                    <div className="absolute bottom-0 w-full h-2 bg-red-500 rounded-b-full"></div>
                    <div className="absolute top-1 left-1 w-2 h-2 bg-white rounded-full"></div>
                    <div className="absolute top-1 right-1 w-2 h-2 bg-white rounded-full"></div>
                  </div>
                ) : emotion === "thinking" ? (
                  <div className="w-4 h-2 bg-red-400 rounded-full"></div>
                ) : emotion === "surprised" ? (
                  <div className="w-4 h-6 bg-red-400 rounded-full"></div>
                ) : (
                  <div className="w-6 h-3 bg-red-400 rounded-full relative overflow-hidden">
                    <div className="absolute bottom-0 w-full h-1 bg-red-500"></div>
                    {isSpeaking && (
                      <motion.div
                        className="absolute inset-0 bg-red-500 rounded-full"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.3, repeat: Infinity }}
                      />
                    )}
                  </div>
                )}
              </div>
              
              {/* Cheeks */}
              <div className="absolute top-14 left-3 w-4 h-4 bg-pink-300 rounded-full opacity-60"></div>
              <div className="absolute top-14 right-3 w-4 h-4 bg-pink-300 rounded-full opacity-60"></div>
            </div>
            
            {/* Blue dress collar */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-20 h-16 bg-blue-600 rounded-t-full border-2 border-blue-700 z-5">
              {/* Bow pattern on dress */}
              <div className="absolute top-2 left-3 w-3 h-2 bg-white rounded-sm opacity-80"></div>
              <div className="absolute top-2 right-3 w-3 h-2 bg-white rounded-sm opacity-80"></div>
              <div className="absolute top-6 left-6 w-2 h-1 bg-white rounded-sm opacity-80"></div>
            </div>
            
            {/* Hair highlights */}
            <div className="absolute top-6 left-12 w-3 h-3 bg-amber-600 rounded-full opacity-80"></div>
            <div className="absolute top-8 right-12 w-2 h-2 bg-amber-600 rounded-full opacity-80"></div>
          </div>
        </div>
        
        {/* Name label */}
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-center">
          <div className="text-2xl font-bold text-gray-700 mb-1">Lele</div>
          <div className="text-sm text-gray-500">Sua amiga AI</div>
        </div>
        
        {/* Expression indicator */}
        <motion.div 
          className="absolute -top-2 -right-2 w-12 h-12 bg-gradient-to-br from-lele-yellow to-lele-pink rounded-full flex items-center justify-center shadow-lg"
          animate={isAnimating ? { rotate: [0, 10, -10, 0] } : {}}
          transition={{ duration: 0.5, repeat: isAnimating ? Infinity : 0 }}
        >
          <span className="text-xl">{getAvatarEmoji()}</span>
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