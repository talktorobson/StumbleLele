import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Avatar from "@/components/avatar";
import Chat from "@/components/chat";
import Games from "@/components/games";
import Friends from "@/components/friends";
import Memories from "@/components/memories";
import Progress from "@/components/progress";
import VoiceInput from "@/components/voice-input";
import LeleAvatar from "@/components/lele-avatar";
import AIModelSelector from "@/components/ai-model-selector";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { useAvatar } from "@/hooks/use-avatar";
import { 
  Home as HomeIcon, 
  Gamepad2, 
  Heart, 
  Users, 
  Settings, 
  Mic 
} from "lucide-react";

export default function Home() {
  const [currentSection, setCurrentSection] = useState("home");
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  
  const userId = 1; // Default user Helena

  const { data: user } = useQuery({
    queryKey: ["/api/user", userId],
  });

  const { data: avatarState } = useQuery({
    queryKey: ["/api/avatar", userId],
  });

  const { currentEmotion } = useAvatar(avatarState?.currentEmotion);
  
  // Show sticky avatar when not on home section
  const showStickyAvatar = currentSection !== "home";

  useEffect(() => {
    document.title = "Stumble Lele - Sua Amiga AI";
  }, []);

  const renderCurrentSection = () => {
    switch (currentSection) {
      case "games":
        return <Games userId={userId} />;
      case "memories":
        return <Memories userId={userId} />;
      case "friends":
        return <Friends userId={userId} />;
      case "progress":
        return <Progress userId={userId} />;
      default:
        return (
          <div className="space-y-6">
            <Avatar userId={userId} avatarState={avatarState} />
            <Chat userId={userId} />
            <Games userId={userId} />
            <Friends userId={userId} />
            <Memories userId={userId} />
            <Progress userId={userId} />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-lele-soft-pink via-lele-mint to-lele-turquoise">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-3 py-2 sm:px-4 sm:py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 lele-gradient rounded-full flex items-center justify-center">
                <span className="text-white text-lg sm:text-xl font-bold">L</span>
              </div>
              <div>
                <h1 className="text-lg sm:text-2xl font-bold text-gray-800">Stumble Lele</h1>
                <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">Sua amiga AI</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <AIModelSelector userId={userId} currentModel={user?.aiModel} />
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full bg-lele-yellow hover:bg-yellow-400 p-2 sm:p-3"
                onClick={() => setCurrentSection("progress")}
              >
                <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-3 py-4 sm:px-4 sm:py-6 max-w-4xl pb-24">
        {renderCurrentSection()}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 z-50">
        <div className="container mx-auto px-2 py-2 sm:px-4 sm:py-3">
          <div className="flex justify-around items-center">
            <Button
              variant="ghost"
              size="sm"
              className={`flex flex-col items-center space-y-1 px-2 py-2 sm:px-3 sm:py-2 ${
                currentSection === "home" ? "text-lele-pink" : "text-gray-400"
              }`}
              onClick={() => setCurrentSection("home")}
            >
              <HomeIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-xs">Início</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`flex flex-col items-center space-y-1 px-2 py-2 sm:px-3 sm:py-2 ${
                currentSection === "games" ? "text-lele-turquoise" : "text-gray-400"
              }`}
              onClick={() => setCurrentSection("games")}
            >
              <Gamepad2 className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-xs">Jogos</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`flex flex-col items-center space-y-1 px-2 py-2 sm:px-3 sm:py-2 ${
                currentSection === "memories" ? "text-lele-yellow" : "text-gray-400"
              }`}
              onClick={() => setCurrentSection("memories")}
            >
              <Heart className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-xs">Memórias</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`flex flex-col items-center space-y-1 px-2 py-2 sm:px-3 sm:py-2 ${
                currentSection === "friends" ? "text-lele-lavender" : "text-gray-400"
              }`}
              onClick={() => setCurrentSection("friends")}
            >
              <Users className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-xs">Amigos</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`flex flex-col items-center space-y-1 px-2 py-2 sm:px-3 sm:py-2 ${
                currentSection === "progress" ? "text-gray-600" : "text-gray-400"
              }`}
              onClick={() => setCurrentSection("progress")}
            >
              <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-xs">Config</span>
            </Button>
          </div>
        </div>
      </nav>

      {/* Floating Voice Button */}
      <Button
        size="lg"
        className={`fixed bottom-20 right-4 w-14 h-14 sm:right-6 sm:w-16 sm:h-16 lele-gradient rounded-full shadow-xl hover:scale-110 transition-transform z-40 ${
          isVoiceActive ? "animate-pulse" : ""
        }`}
        onClick={() => setIsVoiceActive(!isVoiceActive)}
      >
        <Mic className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
      </Button>

      {/* Voice Input Component */}
      {isVoiceActive && (
        <VoiceInput
          userId={userId}
          onClose={() => setIsVoiceActive(false)}
        />
      )}

      {/* Sticky Avatar - Shows when not on home section */}
      <AnimatePresence>
        {showStickyAvatar && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.3 }}
            className="fixed top-20 right-4 sm:right-6 z-40"
          >
            <div 
              className="bg-white/95 backdrop-blur-sm rounded-full p-2 sm:p-3 shadow-xl border-2 border-lele-pink/20 cursor-pointer hover:scale-105 transition-transform"
              onClick={() => setCurrentSection("home")}
            >
              <div className="w-12 h-12 sm:w-16 sm:h-16 relative">
                <LeleAvatar
                  emotion={currentEmotion}
                  isAnimating={true}
                  isListening={isVoiceActive}
                  isSpeaking={false}
                  className="w-full h-full"
                />
              </div>
            </div>
            {/* Speech bubble for encouragement */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.3 }}
              className="absolute -left-24 sm:-left-32 top-1 sm:top-2 bg-white/95 backdrop-blur-sm rounded-2xl p-1.5 sm:p-2 shadow-lg border border-lele-pink/20 max-w-20 sm:max-w-28"
            >
              <div className="text-xs text-gray-700 font-medium">
                {currentSection === "games" ? "Vamos jogar!" : 
                 currentSection === "memories" ? "Que legal!" : 
                 currentSection === "friends" ? "Oi amigos!" : 
                 "Estou aqui!"}
              </div>
              <div className="absolute right-1 sm:right-2 top-2 sm:top-3 w-0 h-0 border-l-3 sm:border-l-4 border-l-white/95 border-t-3 sm:border-t-4 border-t-transparent border-b-3 sm:border-b-4 border-b-transparent"></div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
