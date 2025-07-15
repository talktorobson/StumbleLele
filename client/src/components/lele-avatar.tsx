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
  const [showPeaceSign, setShowPeaceSign] = useState(false);
  
  // Blinking animation
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlinkState(true);
      setTimeout(() => setBlinkState(false), 150);
    }, 2000 + Math.random() * 3000);
    
    return () => clearInterval(blinkInterval);
  }, []);

  // Peace sign animation
  useEffect(() => {
    if (emotion === "excited" || emotion === "playful") {
      setShowPeaceSign(true);
    } else {
      setShowPeaceSign(false);
    }
  }, [emotion]);

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
        {/* Main Avatar Container */}
        <div className="w-full h-full rounded-full bg-gradient-to-br from-orange-100 to-orange-200 shadow-2xl overflow-hidden relative">
          
          {/* Cartoon-style SVG Avatar */}
          <svg viewBox="0 0 200 200" className="w-full h-full">
            {/* Background warm glow */}
            <circle cx="100" cy="100" r="95" fill="#FFF8DC" opacity="0.3"/>
            
            {/* Hair - Long brown hair with side part */}
            <path d="M45 50 Q100 15 155 50 L155 120 Q150 125 145 120 L145 100 Q140 105 135 100 L135 85 Q130 90 125 85 L125 75 Q120 80 115 75 L115 70 Q110 75 105 70 L105 68 Q100 72 95 68 L95 70 Q90 75 85 70 L85 75 Q80 80 75 75 L75 85 Q70 90 65 85 L65 100 Q60 105 55 100 L55 120 Q50 125 45 120 Z" 
                  fill="#8B4513" stroke="#654321" strokeWidth="1.5"/>
            
            {/* Hair highlights */}
            <path d="M70 40 Q80 35 90 40" stroke="#A0522D" strokeWidth="1" fill="none" opacity="0.5"/>
            <path d="M110 40 Q120 35 130 40" stroke="#A0522D" strokeWidth="1" fill="none" opacity="0.5"/>
            
            {/* Face - Rounded cartoon style */}
            <ellipse cx="100" cy="100" rx="48" ry="52" fill="#FDBCB4" stroke="#F4A460" strokeWidth="1"/>
            
            {/* Eyes - Large cartoon eyes */}
            {!blinkState ? (
              <>
                {/* Left eye */}
                <ellipse cx="82" cy="95" rx="12" ry="15" fill="white" stroke="#333" strokeWidth="1.5"/>
                <ellipse cx="82" cy="97" rx="8" ry="10" fill="#8B4513"/>
                <ellipse cx="82" cy="98" rx="5" ry="6" fill="#333"/>
                <ellipse cx="83" cy="96" rx="2" ry="3" fill="white"/>
                <ellipse cx="81" cy="100" rx="1" ry="1.5" fill="white" opacity="0.7"/>
                
                {/* Right eye */}
                <ellipse cx="118" cy="95" rx="12" ry="15" fill="white" stroke="#333" strokeWidth="1.5"/>
                <ellipse cx="118" cy="97" rx="8" ry="10" fill="#8B4513"/>
                <ellipse cx="118" cy="98" rx="5" ry="6" fill="#333"/>
                <ellipse cx="119" cy="96" rx="2" ry="3" fill="white"/>
                <ellipse cx="117" cy="100" rx="1" ry="1.5" fill="white" opacity="0.7"/>
              </>
            ) : (
              <>
                {/* Closed eyes */}
                <path d="M70 95 Q82 98 94 95" stroke="#333" strokeWidth="2" fill="none"/>
                <path d="M106 95 Q118 98 130 95" stroke="#333" strokeWidth="2" fill="none"/>
              </>
            )}
            
            {/* Eyebrows */}
            <path d="M70 85 Q82 83 94 85" stroke="#654321" strokeWidth="2" fill="none"/>
            <path d="M106 85 Q118 83 130 85" stroke="#654321" strokeWidth="2" fill="none"/>
            
            {/* Nose - Small button nose */}
            <ellipse cx="100" cy="110" rx="3" ry="2" fill="#F4A460"/>
            
            {/* Mouth - Dynamic expressions */}
            {emotion === "excited" || emotion === "playful" ? (
              <>
                <path d="M85 120 Q100 135 115 120" stroke="#C71585" strokeWidth="2" fill="#FF69B4" opacity="0.8"/>
                <path d="M88 122 Q100 132 112 122" stroke="white" strokeWidth="1" fill="none" opacity="0.5"/>
              </>
            ) : emotion === "thinking" ? (
              <path d="M92 125 Q100 123 108 125" stroke="#C71585" strokeWidth="2" fill="none"/>
            ) : emotion === "surprised" ? (
              <ellipse cx="100" cy="125" rx="8" ry="10" fill="#FF69B4" stroke="#C71585" strokeWidth="2"/>
            ) : isSpeaking ? (
              <ellipse cx="100" cy="125" rx="6" ry="8" fill="#FF69B4" stroke="#C71585" strokeWidth="2"/>
            ) : (
              <path d="M88 122 Q100 130 112 122" stroke="#C71585" strokeWidth="2" fill="none"/>
            )}
            
            {/* Cheeks - Rosy cartoon cheeks */}
            <ellipse cx="65" cy="115" rx="10" ry="8" fill="#FFB6C1" opacity="0.6"/>
            <ellipse cx="135" cy="115" rx="10" ry="8" fill="#FFB6C1" opacity="0.6"/>
            
            {/* Body and dress */}
            <path d="M75 145 Q100 150 125 145 L125 180 Q100 185 75 180 Z" 
                  fill="#4169E1" stroke="#1E3A8A" strokeWidth="2"/>
            
            {/* Dress pattern - White bows */}
            <g opacity="0.8">
              <path d="M85 160 Q88 157 91 160 Q88 163 85 160" fill="white"/>
              <path d="M109 160 Q112 157 115 160 Q112 163 109 160" fill="white"/>
              <path d="M97 170 Q100 167 103 170 Q100 173 97 170" fill="white"/>
            </g>
            
            {/* Arms and peace sign (when excited) */}
            {showPeaceSign && (
              <g>
                {/* Right arm */}
                <path d="M125 155 Q140 145 145 135" stroke="#FDBCB4" strokeWidth="8" fill="none" strokeLinecap="round"/>
                {/* Hand making peace sign */}
                <g transform="translate(145, 135) rotate(-30)">
                  <ellipse cx="0" cy="0" rx="8" ry="10" fill="#FDBCB4" stroke="#F4A460" strokeWidth="1"/>
                  {/* Peace sign fingers */}
                  <rect x="-2" y="-15" width="4" height="12" fill="#FDBCB4" stroke="#F4A460" strokeWidth="0.5" rx="2"/>
                  <rect x="-6" y="-14" width="4" height="11" fill="#FDBCB4" stroke="#F4A460" strokeWidth="0.5" rx="2" transform="rotate(-15)"/>
                </g>
              </g>
            )}
            
          </svg>
        </div>
        
        {/* Name label */}
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-center">
          <div className="text-2xl font-bold text-gray-700 mb-1">Lele</div>
          <div className="text-sm text-gray-500">Sua amiga AI</div>
        </div>
        
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