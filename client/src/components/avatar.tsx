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

  // Function to play ba-dum-tss sound effect
  const playBaDumTssSound = async () => {
    try {
      const audio = new Audio('/ba-dum-tss.wav');
      audio.volume = 0.7;
      
      return new Promise<void>((resolve, reject) => {
        audio.onended = () => resolve();
        audio.onerror = (error) => reject(error);
        audio.play().catch(reject);
      });
    } catch (error) {
      console.error('Failed to play ba-dum-tss sound:', error);
    }
  };

  const handleJokeClick = async () => {
    setIsAnimating(true);
    setEmotion("excited");
    
    // Generate variety by randomizing joke themes and styles
    const jokeThemes = [
      "animais domésticos e bichinhos",
      "escola e vida escolar brasileira",
      "comida brasileira que as crianças adoram",
      "brincadeiras e jogos infantis",
      "desenhos animados e super-heróis",
      "família brasileira e situações engraçadas",
      "natureza e animais do Brasil",
      "esportes e diversão para crianças"
    ];
    
    const jokeStyles = [
      "piada simples com trocadilho",
      "situação engraçada de criança", 
      "comparação divertida com animais",
      "piada sobre coisas que as crianças fazem",
      "humor inocente e alegre"
    ];
    
    const randomTheme = jokeThemes[Math.floor(Math.random() * jokeThemes.length)];
    const randomStyle = jokeStyles[Math.floor(Math.random() * jokeStyles.length)];
    const randomNumber = Math.floor(Math.random() * 1000); // Add uniqueness
    
    // Use the same working Gemini Direct approach as the chat
    const jokePrompt = `Você é Lele, uma menina brasileira de 7 anos super animada e carinhosa conversando com uma amiguinha de 8 a 11 anos! 

CONFIGURAÇÃO DE VOZ:
- Use a voz Leda com sotaque brasileiro natural
- Fale como uma garotinha brasileira jovem e doce
- Voz feminina com muita energia e entusiasmo
- Entonação brasileira expressiva e fluida
- Tom agudo e alegre típico de criança
- Velocidade natural, mais rápida quando empolgada

TAREFA: Conte uma piada NOVA e HILÁRIA (#${randomNumber}) sobre ${randomTheme} no estilo ${randomStyle}. A piada deve ser:
- SUPER ENGRAÇADA e apropriada para crianças de 8 a 11 anos
- Com contexto brasileiro que criança conhece muito bem
- Inocente mas MUITO DIVERTIDA, que faça rir alto
- Use trocadilhos inteligentes e situações absurdas
- Explore o humor que crianças brasileiras adoram
- Seja criativa com palavras e situações engraçadas
- Use humor sobre coisas do cotidiano brasileiro infantil

EXEMPLOS DE HUMOR QUE FUNCIONA:
- Trocadilhos com nomes de comidas brasileiras
- Situações absurdas com animais domésticos
- Comparações engraçadas entre coisas diferentes
- Perguntas e respostas com reviravolta inesperada
- Jogos de palavras que crianças compreendem

REGRAS OBRIGATÓRIAS: 
- NUNCA use emojis, símbolos ou descrições visuais
- Fale apenas o conteúdo da piada diretamente
- Seja natural e espontânea como uma criança brasileira
- SEMPRE invente uma piada completamente nova e original
- Seja criativa e surpreenda com humor inteligente
- Termine naturalmente COM FINAL ÚNICO E ORIGINAL
- PROIBIDO usar emojis ou símbolos de qualquer tipo
- NUNCA use finais repetitivos como "hihihi" ou "hahaha"
- Cada piada deve ter seu próprio final criativo e único
- Varie completamente o estilo, estrutura e conclusão

Invente uma piada nova e MUITO ENGRAÇADA AGORA sobre ${randomTheme} para uma criança!`;
    
    try {
      // Use the same working sendMessage function from chat
      // The ba-dum-tss sound will be handled automatically by the useGeminiDirect hook
      // Add a clear marker to help identify this as a joke request
      const jokeMarker = "[JOKE_REQUEST] ";
      await sendMessage(jokeMarker + jokePrompt);
      
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
