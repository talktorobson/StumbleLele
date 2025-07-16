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
              {/* Avatar SVG - recreating the provided image */}
              <svg
                viewBox="0 0 200 200"
                className="w-full h-full"
              >
                {/* Hair */}
                <path
                  d="M50 80 Q100 40 150 80 Q160 90 150 120 Q140 130 130 125 Q120 120 110 125 Q100 130 90 125 Q80 120 70 125 Q60 130 50 120 Q40 90 50 80 Z"
                  fill="#8B4513"
                />
                
                {/* Face */}
                <circle
                  cx="100"
                  cy="110"
                  r="40"
                  fill="#FFB6C1"
                />
                
                {/* Eyes */}
                <circle cx="88" cy="100" r="8" fill="white" />
                <circle cx="112" cy="100" r="8" fill="white" />
                <circle cx="88" cy="100" r="5" fill="black" />
                <circle cx="112" cy="100" r="5" fill="black" />
                <circle cx="90" cy="98" r="2" fill="white" />
                <circle cx="114" cy="98" r="2" fill="white" />
                
                {/* Eyebrows */}
                <path d="M80 92 Q88 88 96 92" stroke="black" strokeWidth="2" fill="none" />
                <path d="M104 92 Q112 88 120 92" stroke="black" strokeWidth="2" fill="none" />
                
                {/* Nose */}
                <circle cx="100" cy="110" r="2" fill="#FFB6C1" />
                
                {/* Mouth */}
                <path 
                  d="M92 120 Q100 128 108 120" 
                  stroke="#FF69B4" 
                  strokeWidth="3" 
                  fill="none" 
                  strokeLinecap="round"
                />
                
                {/* Shirt */}
                <rect
                  x="70"
                  y="145"
                  width="60"
                  height="45"
                  fill="#4169E1"
                  rx="5"
                />
                
                {/* Shirt buttons */}
                <circle cx="100" cy="155" r="2" fill="white" />
                <circle cx="100" cy="165" r="2" fill="white" />
                <circle cx="100" cy="175" r="2" fill="white" />
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