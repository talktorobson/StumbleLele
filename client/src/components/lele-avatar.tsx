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
        <div className="w-48 h-48 rounded-full bg-gradient-to-br from-yellow-100 to-yellow-200 border-4 border-lele-pink shadow-2xl overflow-hidden relative">
          
          {/* SVG Avatar based on Helena's picture */}
          <svg viewBox="0 0 200 200" className="w-full h-full">
            {/* Hair */}
            <path d="M40 60 Q100 20 160 60 L160 90 Q140 95 120 90 Q100 85 80 90 Q60 95 40 90 Z" 
                  fill="#8B4513" stroke="#654321" strokeWidth="2"/>
            
            {/* Face */}
            <circle cx="100" cy="110" r="45" fill="#F4C2A1" stroke="#E6A373" strokeWidth="2"/>
            
            {/* Eyes */}
            <circle cx="85" cy="100" r="8" fill="white" stroke="#333"/>
            <circle cx="115" cy="100" r="8" fill="white" stroke="#333"/>
            <circle cx="85" cy="100" r="4" fill="#333"/>
            <circle cx="115" cy="100" r="4" fill="#333"/>
            <circle cx="86" cy="99" r="1" fill="white"/>
            <circle cx="116" cy="99" r="1" fill="white"/>
            
            {/* Eyebrows */}
            <path d="M77 92 Q85 90 92 92" stroke="#654321" strokeWidth="2" fill="none"/>
            <path d="M108 92 Q115 90 123 92" stroke="#654321" strokeWidth="2" fill="none"/>
            
            {/* Nose */}
            <circle cx="100" cy="112" r="2" fill="#E6A373"/>
            
            {/* Mouth - changes based on emotion */}
            {emotion === "excited" || emotion === "playful" ? (
              <path d="M90 125 Q100 135 110 125" stroke="#CC4444" strokeWidth="3" fill="#FF6666" opacity="0.8"/>
            ) : emotion === "thinking" ? (
              <line x1="95" y1="125" x2="105" y2="125" stroke="#CC4444" strokeWidth="2"/>
            ) : emotion === "surprised" ? (
              <circle cx="100" cy="125" r="6" fill="#FF6666" stroke="#CC4444" strokeWidth="2"/>
            ) : (
              <path d="M92 125 Q100 130 108 125" stroke="#CC4444" strokeWidth="2" fill="none"/>
            )}
            
            {/* Cheeks */}
            <circle cx="70" cy="115" r="8" fill="#FFB6C1" opacity="0.6"/>
            <circle cx="130" cy="115" r="8" fill="#FFB6C1" opacity="0.6"/>
            
            {/* Blue dress */}
            <path d="M70 150 Q100 160 130 150 L130 190 Q100 195 70 190 Z" 
                  fill="#4169E1" stroke="#1E3A8A" strokeWidth="2"/>
            
            {/* White bow on dress */}
            <rect x="95" y="165" width="10" height="6" fill="white" rx="1"/>
            <rect x="98" y="162" width="4" height="12" fill="white" rx="1"/>
            
            {/* Hair details */}
            <path d="M60 70 Q70 65 80 70" stroke="#654321" strokeWidth="2" fill="none"/>
            <path d="M120 70 Q130 65 140 70" stroke="#654321" strokeWidth="2" fill="none"/>
            
            {/* Speaking animation overlay */}
            {isSpeaking && (
              <circle cx="100" cy="125" r="8" fill="#FF8888" opacity="0.6">
                <animate attributeName="r" values="6;10;6" dur="0.5s" repeatCount="indefinite"/>
                <animate attributeName="opacity" values="0.4;0.8;0.4" dur="0.5s" repeatCount="indefinite"/>
              </circle>
            )}
          </svg>
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