import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export type AvatarEmotion = 
  | 'happy' 
  | 'excited' 
  | 'sad' 
  | 'surprised' 
  | 'thinking' 
  | 'playful' 
  | 'loving' 
  | 'calm' 
  | 'encouraging' 
  | 'concentrating' 
  | 'celebrating' 
  | 'sleepy';

interface LeleAvatarProps {
  emotion: AvatarEmotion;
  isAnimating: boolean;
  isListening?: boolean;
  isSpeaking?: boolean;
  className?: string;
  context?: 'conversation' | 'gaming' | 'learning' | 'idle';
}

export default function LeleAvatar({ 
  emotion, 
  isAnimating, 
  isListening = false, 
  isSpeaking = false,
  className = "",
  context = 'idle'
}: LeleAvatarProps) {
  const [blinkState, setBlinkState] = useState(false);
  const [showPeaceSign, setShowPeaceSign] = useState(false);
  const [eyeDirection, setEyeDirection] = useState<'center' | 'left' | 'right'>('center');
  const [currentAnimation, setCurrentAnimation] = useState<string>('idle');
  
  // Blinking animation with emotion-based frequency
  useEffect(() => {
    const getBlinkFrequency = () => {
      switch (emotion) {
        case 'excited': return 1000;
        case 'surprised': return 500;
        case 'sleepy': return 4000;
        case 'concentrating': return 3000;
        default: return 2000;
      }
    };

    const blinkInterval = setInterval(() => {
      setBlinkState(true);
      setTimeout(() => setBlinkState(false), 150);
    }, getBlinkFrequency() + Math.random() * 2000);
    
    return () => clearInterval(blinkInterval);
  }, [emotion]);

  // Eye tracking animation
  useEffect(() => {
    if (context === 'gaming' || context === 'learning') {
      const eyeMovementInterval = setInterval(() => {
        const directions: ('center' | 'left' | 'right')[] = ['center', 'left', 'right'];
        setEyeDirection(directions[Math.floor(Math.random() * directions.length)]);
      }, 2000 + Math.random() * 3000);
      
      return () => clearInterval(eyeMovementInterval);
    } else {
      setEyeDirection('center');
    }
  }, [context]);

  // Gesture animations based on emotion
  useEffect(() => {
    if (emotion === 'excited' || emotion === 'celebrating') {
      setShowPeaceSign(true);
      setCurrentAnimation('bounce');
    } else if (emotion === 'playful') {
      setShowPeaceSign(true);
      setCurrentAnimation('wiggle');
    } else if (emotion === 'thinking' || emotion === 'concentrating') {
      setShowPeaceSign(false);
      setCurrentAnimation('tilt');
    } else if (emotion === 'sleepy') {
      setShowPeaceSign(false);
      setCurrentAnimation('sway');
    } else {
      setShowPeaceSign(false);
      setCurrentAnimation('idle');
    }
  }, [emotion]);

  const getAnimationVariants = () => {
    switch (currentAnimation) {
      case 'bounce':
        return {
          y: [0, -15, 0],
          scale: [1, 1.1, 1],
          rotate: [0, 0, 0]
        };
      case 'wiggle':
        return {
          rotate: [0, 5, -5, 0],
          y: [0, -5, 0],
          scale: [1, 1.02, 1]
        };
      case 'tilt':
        return {
          rotate: [0, 10, 0],
          y: [0, -3, 0],
          scale: [1, 1.01, 1]
        };
      case 'sway':
        return {
          rotate: [0, 2, -2, 0],
          y: [0, 2, 0],
          scale: [1, 0.98, 1]
        };
      default:
        return {
          y: [0, -8, 0],
          rotate: [0, 1, -1, 0],
          scale: [1, 1.03, 1]
        };
    }
  };

  const getEyePosition = (baseX: number) => {
    switch (eyeDirection) {
      case 'left': return baseX - 2;
      case 'right': return baseX + 2;
      default: return baseX;
    }
  };

  const getEmotionColor = () => {
    switch (emotion) {
      case 'happy': return '#FFE4B5';
      case 'excited': return '#FFB6C1';
      case 'sad': return '#E6E6FA';
      case 'surprised': return '#F0E68C';
      case 'loving': return '#FFC0CB';
      case 'playful': return '#98FB98';
      case 'calm': return '#F0F8FF';
      case 'encouraging': return '#FFA500';
      case 'concentrating': return '#DDA0DD';
      case 'celebrating': return '#FFD700';
      case 'sleepy': return '#C8A2C8';
      default: return '#FFF8DC';
    }
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <motion.div
        className="relative w-full h-full"
        animate={isAnimating ? getAnimationVariants() : {}}
        transition={{ 
          duration: currentAnimation === 'bounce' ? 1.0 : 
                   currentAnimation === 'wiggle' ? 0.8 : 
                   currentAnimation === 'sway' ? 2.0 : 1.5,
          ease: "easeInOut",
          repeat: isAnimating ? Infinity : 0
        }}
      >
        {/* Main Avatar Container */}
        <div className="w-full h-full rounded-full bg-gradient-to-br from-orange-100 to-orange-200 shadow-2xl overflow-hidden relative">
          
          {/* Cartoon-style SVG Avatar */}
          <svg viewBox="0 0 200 200" className="w-full h-full">
            {/* Background warm glow - changes with emotion */}
            <circle cx="100" cy="100" r="95" fill={getEmotionColor()} opacity="0.4"/>
            
            {/* Hair - Long brown hair extending to shoulders */}
            <path d="M35 45 Q100 10 165 45 L165 135 Q160 140 155 135 L155 120 Q150 125 145 120 L145 105 Q140 110 135 105 L135 90 Q130 95 125 90 L125 80 Q120 85 115 80 L115 75 Q110 80 105 75 L105 73 Q100 77 95 73 L95 75 Q90 80 85 75 L85 80 Q80 85 75 80 L75 90 Q70 95 65 90 L65 105 Q60 110 55 105 L55 120 Q50 125 45 120 L45 135 Q40 140 35 135 Z" 
                  fill="#8B4513" stroke="#654321" strokeWidth="1.5"/>
            
            {/* Hair layers for more natural look */}
            <path d="M40 55 Q100 25 160 55 L160 125 Q155 130 150 125 L150 115 Q145 120 140 115 L140 100 Q135 105 130 100 L130 85 Q125 90 120 85 L120 80 Q115 85 110 80 L110 78 Q105 82 100 78 L100 80 Q95 85 90 80 L90 85 Q85 90 80 85 L80 100 Q75 105 70 100 L70 115 Q65 120 60 115 L60 125 Q55 130 50 125 L50 130 Q45 135 40 130 Z" 
                  fill="#A0522D" stroke="#654321" strokeWidth="1" opacity="0.7"/>
            
            {/* Hair highlights */}
            <path d="M70 40 Q80 35 90 40" stroke="#A0522D" strokeWidth="1" fill="none" opacity="0.5"/>
            <path d="M110 40 Q120 35 130 40" stroke="#A0522D" strokeWidth="1" fill="none" opacity="0.5"/>
            
            {/* Face - Rounded cartoon style */}
            <ellipse cx="100" cy="100" rx="48" ry="52" fill="#FDBCB4" stroke="#F4A460" strokeWidth="1"/>
            
            {/* Eyes - Large cartoon eyes with emotion-based changes */}
            {!blinkState ? (
              <>
                {/* Left eye */}
                <ellipse cx="82" cy="95" rx="12" ry="15" fill="white" stroke="#333" strokeWidth="1.5"/>
                <ellipse cx="82" cy="97" rx="8" ry="10" fill="#8B4513"/>
                <ellipse cx={getEyePosition(82)} cy={emotion === 'surprised' ? 95 : 98} rx="5" ry="6" fill="#333"/>
                <ellipse cx={getEyePosition(83)} cy={emotion === 'surprised' ? 93 : 96} rx="2" ry="3" fill="white"/>
                <ellipse cx={getEyePosition(81)} cy={emotion === 'surprised' ? 97 : 100} rx="1" ry="1.5" fill="white" opacity="0.7"/>
                
                {/* Right eye */}
                <ellipse cx="118" cy="95" rx="12" ry="15" fill="white" stroke="#333" strokeWidth="1.5"/>
                <ellipse cx="118" cy="97" rx="8" ry="10" fill="#8B4513"/>
                <ellipse cx={getEyePosition(118)} cy={emotion === 'surprised' ? 95 : 98} rx="5" ry="6" fill="#333"/>
                <ellipse cx={getEyePosition(119)} cy={emotion === 'surprised' ? 93 : 96} rx="2" ry="3" fill="white"/>
                <ellipse cx={getEyePosition(117)} cy={emotion === 'surprised' ? 97 : 100} rx="1" ry="1.5" fill="white" opacity="0.7"/>
                
                {/* Special eye effects for emotions */}
                {emotion === 'loving' && (
                  <>
                    <path d="M76 90 Q82 85 88 90" stroke="#FF69B4" strokeWidth="1" fill="none"/>
                    <path d="M112 90 Q118 85 124 90" stroke="#FF69B4" strokeWidth="1" fill="none"/>
                  </>
                )}
                {emotion === 'sleepy' && (
                  <>
                    <path d="M70 92 Q82 95 94 92" stroke="#333" strokeWidth="1.5" fill="none"/>
                    <path d="M106 92 Q118 95 130 92" stroke="#333" strokeWidth="1.5" fill="none"/>
                  </>
                )}
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
            
            {/* Mouth - Dynamic expressions based on emotion */}
            {(() => {
              switch (emotion) {
                case 'excited':
                case 'celebrating':
                  return (
                    <>
                      <path d="M85 120 Q100 135 115 120" stroke="#C71585" strokeWidth="2" fill="#FF69B4" opacity="0.8"/>
                      <path d="M88 122 Q100 132 112 122" stroke="white" strokeWidth="1" fill="none" opacity="0.5"/>
                    </>
                  );
                case 'playful':
                  return (
                    <>
                      <path d="M85 120 Q100 130 115 120" stroke="#C71585" strokeWidth="2" fill="#FF69B4" opacity="0.8"/>
                      <circle cx="95" cy="125" r="1" fill="#FF69B4"/>
                      <circle cx="105" cy="125" r="1" fill="#FF69B4"/>
                    </>
                  );
                case 'sad':
                  return (
                    <path d="M85 130 Q100 125 115 130" stroke="#C71585" strokeWidth="2" fill="none"/>
                  );
                case 'surprised':
                  return (
                    <ellipse cx="100" cy="125" rx="8" ry="10" fill="#FF69B4" stroke="#C71585" strokeWidth="2"/>
                  );
                case 'thinking':
                case 'concentrating':
                  return (
                    <path d="M92 125 Q100 123 108 125" stroke="#C71585" strokeWidth="2" fill="none"/>
                  );
                case 'loving':
                  return (
                    <>
                      <path d="M88 122 Q100 130 112 122" stroke="#C71585" strokeWidth="2" fill="none"/>
                      <path d="M85 119 Q100 125 115 119" stroke="#FF69B4" strokeWidth="1" fill="none" opacity="0.6"/>
                    </>
                  );
                case 'sleepy':
                  return (
                    <path d="M90 125 Q100 127 110 125" stroke="#C71585" strokeWidth="2" fill="none"/>
                  );
                case 'encouraging':
                  return (
                    <>
                      <path d="M88 122 Q100 128 112 122" stroke="#C71585" strokeWidth="2" fill="none"/>
                      <path d="M95 124 Q100 126 105 124" stroke="#FF69B4" strokeWidth="1" fill="none"/>
                    </>
                  );
                default:
                  return isSpeaking ? (
                    <ellipse cx="100" cy="125" rx="6" ry="8" fill="#FF69B4" stroke="#C71585" strokeWidth="2"/>
                  ) : (
                    <path d="M88 122 Q100 130 112 122" stroke="#C71585" strokeWidth="2" fill="none"/>
                  );
              }
            })()}
            
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
        <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 text-center">
          <div className="text-2xl font-bold text-gray-700 mb-1">Lele</div>
          <div className="text-sm text-gray-500">Sua amiga AI</div>
        </div>
        
        {/* Voice activity indicator */}
        {(isListening || isSpeaking) && (
          <motion.div 
            className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-16 h-8 bg-gradient-to-r from-lele-turquoise to-lele-mint rounded-full flex items-center justify-center shadow-lg"
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