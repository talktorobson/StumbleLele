import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle, Gamepad2, Laugh, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAvatar } from "@/hooks/use-avatar";
import { useSpeech } from "@/hooks/use-speech";
import { useGeminiDirect } from "@/hooks/use-gemini-direct";
import { motion } from "framer-motion";

interface AvatarProps {
  userId: number;
  avatarState?: {
    currentEmotion: string;
    personality: any;
    lastInteraction: string;
  };
}

export default function Avatar({ userId, avatarState }: AvatarProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currentEmotion, setEmotion, getEmotionIcon } = useAvatar(avatarState?.currentEmotion);
  const { speak } = useSpeech();
  const { sendMessage, isProcessing } = useGeminiDirect(userId);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleJokeClick = async () => {
    setIsAnimating(true);
    setEmotion("excited");
    
    // Use the same working Gemini Direct approach as the chat
    const jokePrompt = `Você é Lele, uma menina brasileira de 7 anos super animada e carinhosa! 

CONFIGURAÇÃO DE VOZ:
- Use a voz Leda com sotaque brasileiro natural
- Fale como uma garotinha brasileira jovem e doce
- Voz feminina com muita energia e entusiasmo
- Entonação brasileira expressiva e fluida
- Tom agudo e alegre típico de criança
- Velocidade natural, mais rápida quando empolgada

TAREFA: Conte uma piada MUITO divertida e apropriada para crianças brasileiras. A piada deve ser:
- Engraçada e inocente, sem nenhum conteúdo adulto
- Com contexto brasileiro (animais, comidas, cultura do Brasil)
- Simples de entender para crianças
- Que faça uma criança rir muito
- Sobre temas como: animais, comida, escola, brincadeiras
- Use linguagem bem simples e alegre
- Termine com uma risadinha natural como "hihihi" ou "hahaha"

IMPORTANTE: Fale apenas o conteúdo da piada diretamente, sem descrições ou emojis. Seja natural e espontânea como uma criança brasileira contando para um amiguinho.

Invente uma piada nova e divertida AGORA!`;
    
    try {
      // Use the same working sendMessage function from chat
      await sendMessage(jokePrompt);
      
      // Invalidate avatar queries to update state
      queryClient.invalidateQueries({ queryKey: ["/api/avatar", userId] });
      
    } catch (error) {
      console.error('❌ Joke generation failed:', error);
      toast({
        title: "Ops!",
        description: "Não consegui pensar em uma piada agora. Tenta de novo!",
        variant: "destructive",
      });
    }
    
    setTimeout(() => setIsAnimating(false), 2000);
  };


  useEffect(() => {
    // Animate avatar periodically
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 1000);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="bg-gradient-to-br from-white/95 to-pink-50/80 backdrop-blur-sm shadow-2xl border-2 border-pink-200/50 rounded-3xl overflow-hidden">
      <CardContent className="p-6 sm:p-8 text-center relative">
        {/* Decorative background elements */}
        <div className="absolute top-4 right-4 w-12 h-12 bg-yellow-200/30 rounded-full blur-lg"></div>
        <div className="absolute bottom-4 left-4 w-8 h-8 bg-purple-200/30 rounded-full blur-lg"></div>
        <div className="absolute top-1/2 left-8 w-6 h-6 bg-pink-200/30 rounded-full blur-lg"></div>
        <div className="relative inline-block">
          {/* Lele Main Avatar Image */}
          <div className="w-64 h-64 sm:w-80 sm:h-80 mx-auto mb-8 sm:mb-12 relative">
            <motion.div
              animate={isAnimating ? {
                y: [-5, 5, -5],
                rotate: [0, 1, -1, 0],
                scale: [1, 1.02, 1]
              } : {
                y: [0, -3, 0],
                rotate: [0, 0.5, -0.5, 0]
              }}
              transition={{
                y: { 
                  repeat: Infinity, 
                  duration: 3,
                  ease: "easeInOut"
                },
                rotate: {
                  repeat: Infinity,
                  duration: 4,
                  ease: "easeInOut"
                },
                scale: {
                  repeat: isAnimating ? 3 : Infinity,
                  duration: isAnimating ? 0.5 : 2,
                  ease: "easeInOut"
                }
              }}
              className="w-full h-full relative"
            >
              <img 
                src="/lele-main.png" 
                alt="Lele - Sua amiga AI" 
                className="w-full h-full object-contain rounded-2xl shadow-2xl bg-gradient-to-br from-orange-100 via-pink-50 to-blue-100"
              />
              
              {/* Glowing border effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-pink-300 via-purple-300 to-blue-300 opacity-20 blur-md"></div>
              
              {/* Sparkle effects around the image */}
              <motion.div
                animate={{
                  rotate: 360,
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  rotate: { repeat: Infinity, duration: 10, ease: "linear" },
                  scale: { repeat: Infinity, duration: 2, ease: "easeInOut" }
                }}
                className="absolute -top-4 -right-4 w-8 h-8 text-yellow-400 text-2xl"
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
                className="absolute -bottom-2 -left-2 w-6 h-6 text-pink-400 text-xl"
              >
                ⭐
              </motion.div>
              
              <motion.div
                animate={{
                  rotate: 360,
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  rotate: { repeat: Infinity, duration: 12, ease: "linear" },
                  scale: { repeat: Infinity, duration: 3, ease: "easeInOut" }
                }}
                className="absolute top-4 -left-4 w-5 h-5 text-purple-400 text-lg"
              >
                💫
              </motion.div>
            </motion.div>
          </div>
          
          {/* Avatar Status */}
          <div className="mb-6">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent mb-3"
            >
              Olá, Helena! 👋
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-lg sm:text-xl text-gray-700 px-2 font-medium"
            >
              {currentEmotion === "excited" ? "Estou super animada hoje! ✨" :
               currentEmotion === "thinking" ? "Estou pensando em algo legal... 🤔" :
               currentEmotion === "surprised" ? "Uau! Que interessante! 😮" :
               "Estou muito feliz hoje! O que vamos fazer? 😊"}
            </motion.p>
          </div>
          
          {/* Quick Actions */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-6 mb-6 px-4"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                className="px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600 text-white rounded-2xl font-bold transition-all shadow-xl text-base sm:text-lg border-2 border-white"
                onClick={() => {
                  setEmotion("excited");
                  document.querySelector('[data-section="chat"]')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                💬 Conversar
              </Button>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                className="px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-800 rounded-2xl font-bold transition-all shadow-xl text-base sm:text-lg border-2 border-white"
                onClick={handleJokeClick}
                disabled={isProcessing}
              >
                {isProcessing ? "🤔 Pensando..." : "😄 Piada"}
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </CardContent>
    </Card>
  );
}
