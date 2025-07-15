import { useState, useEffect } from "react";

export function useAvatar(initialEmotion: string = "happy") {
  const [currentEmotion, setCurrentEmotion] = useState(initialEmotion);
  const [isAnimating, setIsAnimating] = useState(false);

  const emotions = {
    happy: "😊",
    excited: "😄",
    thinking: "🤔",
    surprised: "😲",
    playful: "😋",
    proud: "😌",
    curious: "🤨",
    sleepy: "😴",
  };

  const setEmotion = (emotion: string) => {
    setCurrentEmotion(emotion);
    setIsAnimating(true);
    
    // Reset animation after 2 seconds
    setTimeout(() => {
      setIsAnimating(false);
    }, 2000);
  };

  const getEmotionIcon = () => {
    return emotions[currentEmotion as keyof typeof emotions] || emotions.happy;
  };

  const getEmotionClass = () => {
    const baseClass = "transition-all duration-500";
    
    if (isAnimating) {
      switch (currentEmotion) {
        case "excited":
          return `${baseClass} animate-bounce`;
        case "thinking":
          return `${baseClass} animate-pulse`;
        case "surprised":
          return `${baseClass} scale-110`;
        case "playful":
          return `${baseClass} avatar-wiggle`;
        default:
          return `${baseClass} avatar-bounce`;
      }
    }
    
    return baseClass;
  };

  // Auto-return to happy emotion after some time
  useEffect(() => {
    if (currentEmotion !== "happy") {
      const timeout = setTimeout(() => {
        setCurrentEmotion("happy");
      }, 30000); // Return to happy after 30 seconds

      return () => clearTimeout(timeout);
    }
  }, [currentEmotion]);

  return {
    currentEmotion,
    setEmotion,
    getEmotionIcon,
    getEmotionClass,
    isAnimating,
  };
}
