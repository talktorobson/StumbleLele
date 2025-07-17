import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Avatar from "@/components/avatar";
import Chat from "@/components/chat";
import Games from "@/components/games";
import Friends from "@/components/friends";
import Memories from "@/components/memories";
import Progress from "@/components/progress";
import GeminiLiveVoice from "@/components/gemini-live-voice";
import GeminiDebug from "@/components/gemini-debug";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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

  useEffect(() => {
    document.title = "Stumble Lele - Sua Amiga AI";
  }, []);

  const renderCurrentSection = () => {
    switch (currentSection) {
      case "games":
        return <Games userId={userId} />;
      case "friends":
        return <Friends userId={userId} />;
      case "progress":
        return <Progress userId={userId} />;
      default:
        return (
          <div className="space-y-8">
            <Avatar userId={userId} avatarState={avatarState} />
            <Chat userId={userId} />
          </div>
        );
    }
  };


  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 relative">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-20 h-20 bg-yellow-200 rounded-full opacity-50 animate-pulse"></div>
        <div className="absolute top-32 right-20 w-16 h-16 bg-pink-300 rounded-full opacity-40 animate-bounce"></div>
        <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-purple-200 rounded-full opacity-30"></div>
        <div className="absolute top-1/2 right-10 w-12 h-12 bg-blue-300 rounded-full opacity-50"></div>
        <div className="absolute bottom-40 right-1/3 w-18 h-18 bg-green-200 rounded-full opacity-40 animate-pulse"></div>
        
        {/* Floating stars */}
        <div className="absolute top-20 left-1/3 text-2xl animate-spin">⭐</div>
        <div className="absolute top-40 right-1/4 text-xl animate-bounce">🌟</div>
        <div className="absolute bottom-60 left-20 text-lg animate-pulse">✨</div>
        <div className="absolute top-60 right-40 text-2xl animate-spin">💫</div>
      </div>
      {/* Header */}
      <header className="bg-gradient-to-r from-pink-200 via-purple-200 to-blue-200 backdrop-blur-sm shadow-xl sticky top-0 z-50 border-b-4 border-rainbow-gradient">
        <div className="container mx-auto px-3 py-3 sm:px-4 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-pink-400 via-purple-400 to-blue-400 rounded-full flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform">
                <span className="text-white text-xl sm:text-2xl font-bold animate-pulse">L</span>
              </div>
              <div>
                <h1 className="text-xl sm:text-3xl font-black bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                  Stumble Lele
                </h1>
                <p className="text-sm sm:text-base text-purple-700 font-semibold hidden sm:block">
                  🌟 Sua amiga AI mais divertida! 🌟
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full bg-gradient-to-r from-yellow-300 to-orange-300 hover:from-yellow-400 hover:to-orange-400 p-3 sm:p-4 shadow-lg transform hover:scale-110 transition-all border-2 border-white"
                onClick={() => setCurrentSection("progress")}
              >
                <Settings className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Full scroll capability */}
      <main className="flex-1 container mx-auto px-3 py-4 sm:px-4 sm:py-6 max-w-4xl w-full mb-32">
        <div className="space-y-8">
          {renderCurrentSection()}
        </div>
      </main>

      {/* Bottom Navigation - Bigger buttons for kids */}
      <nav className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-pink-200 via-purple-200 to-blue-200 backdrop-blur-sm border-t-4 border-white shadow-2xl z-50">
        <div className="container mx-auto px-2 py-4 sm:px-4 sm:py-5">
          <div className="flex justify-around items-center">
            <Button
              variant="ghost"
              size="lg"
              className={`flex flex-col items-center space-y-2 px-4 py-4 sm:px-6 sm:py-5 rounded-3xl transform hover:scale-110 transition-all min-w-16 min-h-16 ${
                currentSection === "home" 
                  ? "bg-gradient-to-br from-pink-400 to-purple-400 text-white shadow-lg scale-105" 
                  : "text-purple-600 hover:bg-white/50"
              }`}
              onClick={() => setCurrentSection("home")}
            >
              <span className="text-2xl">🏠</span>
              <span className="text-sm font-bold">Início</span>
            </Button>
            <Button
              variant="ghost"
              size="lg"
              className={`flex flex-col items-center space-y-2 px-4 py-4 sm:px-6 sm:py-5 rounded-3xl transform hover:scale-110 transition-all min-w-16 min-h-16 ${
                currentSection === "games" 
                  ? "bg-gradient-to-br from-green-400 to-blue-400 text-white shadow-lg scale-105" 
                  : "text-purple-600 hover:bg-white/50"
              }`}
              onClick={() => setCurrentSection("games")}
            >
              <span className="text-2xl">🎮</span>
              <span className="text-sm font-bold">Jogos</span>
            </Button>
            <Button
              variant="ghost"
              size="lg"
              className={`flex flex-col items-center space-y-2 px-4 py-4 sm:px-6 sm:py-5 rounded-3xl transform hover:scale-110 transition-all min-w-16 min-h-16 ${
                currentSection === "friends" 
                  ? "bg-gradient-to-br from-purple-400 to-pink-400 text-white shadow-lg scale-105" 
                  : "text-purple-600 hover:bg-white/50"
              }`}
              onClick={() => setCurrentSection("friends")}
            >
              <span className="text-2xl">👥</span>
              <span className="text-sm font-bold">Amigos</span>
            </Button>
            <Button
              variant="ghost"
              size="lg"
              className={`flex flex-col items-center space-y-2 px-4 py-4 sm:px-6 sm:py-5 rounded-3xl transform hover:scale-110 transition-all min-w-16 min-h-16 ${
                currentSection === "progress" 
                  ? "bg-gradient-to-br from-orange-400 to-red-400 text-white shadow-lg scale-105" 
                  : "text-purple-600 hover:bg-white/50"
              }`}
              onClick={() => setCurrentSection("progress")}
            >
              <span className="text-2xl">⚙️</span>
              <span className="text-sm font-bold">Config</span>
            </Button>
          </div>
        </div>
      </nav>

      {/* Floating Voice Button - Bigger for kids */}
      <Button
        size="lg"
        className={`fixed bottom-32 left-4 w-20 h-20 sm:left-6 sm:w-24 sm:h-24 bg-gradient-to-br from-red-400 to-pink-500 rounded-full shadow-2xl hover:scale-110 transition-all z-40 border-4 border-white ${
          isVoiceActive ? "animate-pulse from-green-400 to-blue-500" : ""
        }`}
        onClick={() => setIsVoiceActive(!isVoiceActive)}
      >
        <div className="flex flex-col items-center">
          <Mic className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
          <span className="text-xs text-white font-bold mt-1">Falar</span>
        </div>
      </Button>

      {/* Gemini Live Voice Component */}
      {isVoiceActive && (
        <GeminiLiveVoice
          userId={userId}
          isOpen={isVoiceActive}
          onClose={() => setIsVoiceActive(false)}
        />
      )}

      {/* Debug Component */}
      <GeminiDebug />

    </div>
  );
}
