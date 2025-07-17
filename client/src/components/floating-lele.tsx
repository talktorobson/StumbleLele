import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAvatar } from "@/hooks/use-avatar";

interface FloatingLeleProps {
  isVisible?: boolean;
  emotion?: string;
  message?: string;
  onInteraction?: () => void;
}

export default function FloatingLele({ 
  isVisible = true, 
  emotion = "happy", 
  message,
  onInteraction 
}: FloatingLeleProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const { currentEmotion } = useAvatar(emotion);

  useEffect(() => {
    if (message) {
      setShowMessage(true);
      const timer = setTimeout(() => setShowMessage(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Periodic animation
  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 2000);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ 
            type: "spring", 
            stiffness: 200, 
            damping: 15,
            duration: 0.5
          }}
          className="fixed bottom-20 right-4 sm:bottom-24 sm:right-6 z-50 pointer-events-none"
        >
          {/* Speech Bubble */}
          <AnimatePresence>
            {showMessage && message && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 20 }}
                transition={{ duration: 0.3 }}
                className="absolute -top-16 -left-32 sm:-left-40 bg-white/95 backdrop-blur-sm rounded-2xl p-3 shadow-xl border-2 border-purple-200 max-w-48 sm:max-w-52"
              >
                <div className="text-sm font-medium text-purple-800 text-center">
                  {message}
                </div>
                <div className="absolute bottom-0 right-8 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-white/95 transform translate-y-full"></div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Floating Avatar Container */}
          <motion.div
            animate={{
              y: isAnimating ? [-5, 5, -5] : [0, -8, 0],
              rotate: isAnimating ? [0, 2, -2, 0] : 0,
            }}
            transition={{
              y: { 
                repeat: Infinity, 
                duration: 3,
                ease: "easeInOut"
              },
              rotate: {
                repeat: isAnimating ? 3 : 0,
                duration: 0.5,
                ease: "easeInOut"
              }
            }}
            className="relative pointer-events-auto cursor-pointer"
            onClick={onInteraction}
          >
            {/* Glowing background */}
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.4, 0.7, 0.4],
              }}
              transition={{
                repeat: Infinity,
                duration: 2,
                ease: "easeInOut"
              }}
              className="absolute inset-0 bg-gradient-to-br from-pink-300 via-purple-300 to-blue-300 rounded-full blur-md"
            />

            {/* Avatar Circle */}
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-orange-200 to-orange-300 border-4 border-white shadow-2xl overflow-hidden"
            >
              {/* Avatar SVG - matching the main avatar style with longer hair */}
              <svg
                viewBox="0 0 200 200"
                className="w-full h-full"
              >
                {/* Hair - Long brown hair extending to shoulders (longer version) */}
                <path d="M30 45 Q100 5 170 45 L170 140 Q165 145 160 140 L160 125 Q155 130 150 125 L150 110 Q145 115 140 110 L140 95 Q135 100 130 95 L130 85 Q125 90 120 85 L120 80 Q115 85 110 80 L110 78 Q105 82 100 78 L100 80 Q95 85 90 80 L90 85 Q85 90 80 85 L80 95 Q75 100 70 95 L70 110 Q65 115 60 110 L60 125 Q55 130 50 125 L50 140 Q45 145 40 140 L40 135 Q35 140 30 135 Z" 
                      fill="#8B4513" stroke="#654321" strokeWidth="1.5"/>
                
                {/* Hair layers for depth */}
                <path d="M35 55 Q100 20 165 55 L165 130 Q160 135 155 130 L155 120 Q150 125 145 120 L145 105 Q140 110 135 105 L135 90 Q130 95 125 90 L125 85 Q120 90 115 85 L115 83 Q110 87 105 83 L105 85 Q100 90 95 85 L95 90 Q90 95 85 90 L85 105 Q80 110 75 105 L75 120 Q70 125 65 120 L65 130 Q60 135 55 130 L55 135 Q50 140 45 135 L45 140 Q40 145 35 140 Z" 
                      fill="#A0522D" stroke="#654321" strokeWidth="1" opacity="0.7"/>
                
                {/* Hair highlights */}
                <path d="M65 40 Q75 35 85 40" stroke="#A0522D" strokeWidth="1" fill="none" opacity="0.5"/>
                <path d="M115 40 Q125 35 135 40" stroke="#A0522D" strokeWidth="1" fill="none" opacity="0.5"/>
                
                {/* Face - Rounded cartoon style */}
                <ellipse cx="100" cy="105" rx="45" ry="48" fill="#FDBCB4" stroke="#F4A460" strokeWidth="1"/>
                
                {/* Eyes - Large expressive eyes */}
                <ellipse cx="85" cy="95" rx="10" ry="12" fill="white" stroke="#333" strokeWidth="1.5"/>
                <ellipse cx="85" cy="97" rx="6" ry="8" fill="#8B4513"/>
                <ellipse cx="85" cy="98" rx="4" ry="5" fill="#333"/>
                <ellipse cx="86" cy="96" rx="1.5" ry="2" fill="white"/>
                
                <ellipse cx="115" cy="95" rx="10" ry="12" fill="white" stroke="#333" strokeWidth="1.5"/>
                <ellipse cx="115" cy="97" rx="6" ry="8" fill="#8B4513"/>
                <ellipse cx="115" cy="98" rx="4" ry="5" fill="#333"/>
                <ellipse cx="116" cy="96" rx="1.5" ry="2" fill="white"/>
                
                {/* Eyebrows */}
                <path d="M75 85 Q85 83 95 85" stroke="#654321" strokeWidth="2" fill="none"/>
                <path d="M105 85 Q115 83 125 85" stroke="#654321" strokeWidth="2" fill="none"/>
                
                {/* Nose */}
                <ellipse cx="100" cy="110" rx="2.5" ry="1.5" fill="#F4A460"/>
                
                {/* Mouth - Happy smile */}
                <path d="M90 125 Q100 132 110 125" stroke="#C71585" strokeWidth="2" fill="none" strokeLinecap="round"/>
                
                {/* Cheeks */}
                <ellipse cx="68" cy="115" rx="8" ry="6" fill="#FFB6C1" opacity="0.6"/>
                <ellipse cx="132" cy="115" rx="8" ry="6" fill="#FFB6C1" opacity="0.6"/>
                
                {/* Blue dress with bow pattern */}
                <path d="M75 145 Q100 150 125 145 L125 185 Q100 190 75 185 Z" 
                      fill="#4169E1" stroke="#1E3A8A" strokeWidth="2"/>
                
                {/* Dress pattern - White bows */}
                <g opacity="0.8">
                  <path d="M85 160 Q88 157 91 160 Q88 163 85 160" fill="white"/>
                  <path d="M109 160 Q112 157 115 160 Q112 163 109 160" fill="white"/>
                  <path d="M97 170 Q100 167 103 170 Q100 173 97 170" fill="white"/>
                  <path d="M88 180 Q91 177 94 180 Q91 183 88 180" fill="white"/>
                  <path d="M106 180 Q109 177 112 180 Q109 183 106 180" fill="white"/>
                </g>
                
                {/* Peace sign hand */}
                <g transform="translate(140, 135) rotate(-20)">
                  <ellipse cx="0" cy="0" rx="6" ry="8" fill="#FDBCB4" stroke="#F4A460" strokeWidth="1"/>
                  {/* Peace sign fingers */}
                  <rect x="-1.5" y="-12" width="3" height="10" fill="#FDBCB4" stroke="#F4A460" strokeWidth="0.5" rx="1.5"/>
                  <rect x="-4.5" y="-11" width="3" height="9" fill="#FDBCB4" stroke="#F4A460" strokeWidth="0.5" rx="1.5" transform="rotate(-10)"/>
                </g>
              </svg>
            </motion.div>

            {/* Sparkle effects */}
            <motion.div
              animate={{
                rotate: 360,
                scale: [1, 1.2, 1],
              }}
              transition={{
                rotate: { repeat: Infinity, duration: 10, ease: "linear" },
                scale: { repeat: Infinity, duration: 2, ease: "easeInOut" }
              }}
              className="absolute -top-2 -right-2 w-4 h-4 text-yellow-400"
            >
              ✨
            </motion.div>
            
            <motion.div
              animate={{
                rotate: -360,
                scale: [1, 1.3, 1],
              }}
              transition={{
                rotate: { repeat: Infinity, duration: 8, ease: "linear" },
                scale: { repeat: Infinity, duration: 2.5, ease: "easeInOut" }
              }}
              className="absolute -bottom-1 -left-1 w-3 h-3 text-pink-400"
            >
              ⭐
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}