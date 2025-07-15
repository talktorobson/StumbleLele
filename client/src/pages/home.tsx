import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Avatar from "@/components/avatar";
import Chat from "@/components/chat";
import Games from "@/components/games";
import Friends from "@/components/friends";
import Memories from "@/components/memories";
import Progress from "@/components/progress";
import VoiceInput from "@/components/voice-input";
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
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 lele-gradient rounded-full flex items-center justify-center">
                <span className="text-white text-xl font-bold">L</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Stumble Lele</h1>
                <p className="text-sm text-gray-600">Sua amiga AI</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full bg-lele-yellow hover:bg-yellow-400"
                onClick={() => setCurrentSection("progress")}
              >
                <Settings className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full bg-lele-lavender hover:bg-purple-300"
                onClick={() => setCurrentSection("friends")}
              >
                <Users className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 max-w-4xl pb-24">
        {renderCurrentSection()}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-around items-center">
            <Button
              variant="ghost"
              size="sm"
              className={`flex flex-col items-center space-y-1 ${
                currentSection === "home" ? "text-lele-pink" : "text-gray-400"
              }`}
              onClick={() => setCurrentSection("home")}
            >
              <HomeIcon className="h-5 w-5" />
              <span className="text-xs">Início</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`flex flex-col items-center space-y-1 ${
                currentSection === "games" ? "text-lele-turquoise" : "text-gray-400"
              }`}
              onClick={() => setCurrentSection("games")}
            >
              <Gamepad2 className="h-5 w-5" />
              <span className="text-xs">Jogos</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`flex flex-col items-center space-y-1 ${
                currentSection === "memories" ? "text-lele-yellow" : "text-gray-400"
              }`}
              onClick={() => setCurrentSection("memories")}
            >
              <Heart className="h-5 w-5" />
              <span className="text-xs">Memórias</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`flex flex-col items-center space-y-1 ${
                currentSection === "friends" ? "text-lele-lavender" : "text-gray-400"
              }`}
              onClick={() => setCurrentSection("friends")}
            >
              <Users className="h-5 w-5" />
              <span className="text-xs">Amigos</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`flex flex-col items-center space-y-1 ${
                currentSection === "progress" ? "text-gray-600" : "text-gray-400"
              }`}
              onClick={() => setCurrentSection("progress")}
            >
              <Settings className="h-5 w-5" />
              <span className="text-xs">Config</span>
            </Button>
          </div>
        </div>
      </nav>

      {/* Floating Voice Button */}
      <Button
        size="lg"
        className={`fixed bottom-20 right-6 w-16 h-16 lele-gradient rounded-full shadow-xl hover:scale-110 transition-transform z-40 ${
          isVoiceActive ? "animate-pulse" : ""
        }`}
        onClick={() => setIsVoiceActive(!isVoiceActive)}
      >
        <Mic className="h-6 w-6 text-white" />
      </Button>

      {/* Voice Input Component */}
      {isVoiceActive && (
        <VoiceInput
          userId={userId}
          onClose={() => setIsVoiceActive(false)}
        />
      )}
    </div>
  );
}
