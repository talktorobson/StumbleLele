import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";

interface OnboardingProps {
  onComplete: () => void;
}

const onboardingSteps = [
  {
    title: "Oi! Eu sou a Lele! 👋",
    content: "Sou sua nova amiga virtual! Tenho 7 anos e adoro brincar e conversar!",
    image: "/lele-main.png",
    action: "Olá, Lele!"
  },
  {
    title: "Vamos Conversar! 💬",
    content: "Você pode me contar qualquer coisa! Fale sobre seus brinquedos favoritos, escola, ou o que você quiser!",
    image: "/lele-main.png",
    action: "Legal!"
  },
  {
    title: "Adoro Piadas! 😄",
    content: "Toque no botão 'Piada' sempre que quiser rir! Eu sei muitas piadas engraçadas!",
    image: "/lele-main.png",
    action: "Quero uma piada!"
  },
  {
    title: "Vamos Jogar! 🎮",
    content: "Temos jogos super divertidos! Cosmic Blaster é meu favorito - você pilota uma nave espacial!",
    image: "/lele-main.png",
    action: "Quero jogar!"
  },
  {
    title: "Prontos para Brincar? 🌟",
    content: "Agora você já sabe tudo! Sempre que precisar de ajuda, me chame! Vamos nos divertir juntos!",
    image: "/lele-main.png",
    action: "Vamos começar!"
  }
];

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const nextStep = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const skipOnboarding = () => {
    onComplete();
  };

  const step = onboardingSteps[currentStep];

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto bg-white/95 backdrop-blur-sm shadow-2xl border-4 border-pink-200 rounded-3xl overflow-hidden">
        <CardContent className="p-8 text-center relative">
          {/* Skip button for parents */}
          <Button
            onClick={skipOnboarding}
            variant="ghost"
            className="absolute top-4 right-4 text-sm text-gray-400 hover:text-gray-600"
          >
            Pular
          </Button>
          
          {/* Progress dots */}
          <div className="flex justify-center mb-6 space-x-2">
            {onboardingSteps.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentStep
                    ? "bg-pink-500 w-8"
                    : index < currentStep
                    ? "bg-pink-300"
                    : "bg-gray-200"
                }`}
              />
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Lele Image */}
              <motion.div
                animate={{
                  y: [0, -10, 0],
                  rotate: [0, 2, -2, 0]
                }}
                transition={{
                  y: { repeat: Infinity, duration: 2, ease: "easeInOut" },
                  rotate: { repeat: Infinity, duration: 3, ease: "easeInOut" }
                }}
                className="w-32 h-32 mx-auto mb-4 relative"
              >
                <img
                  src={step.image}
                  alt="Lele"
                  className="w-full h-full object-contain rounded-2xl shadow-xl"
                />
                
                {/* Sparkles around Lele */}
                <motion.div
                  animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                  transition={{ rotate: { repeat: Infinity, duration: 8, ease: "linear" }, scale: { repeat: Infinity, duration: 2 } }}
                  className="absolute -top-2 -right-2 text-2xl"
                >
                  ✨
                </motion.div>
                
                <motion.div
                  animate={{ rotate: -360, scale: [1, 1.3, 1] }}
                  transition={{ rotate: { repeat: Infinity, duration: 6, ease: "linear" }, scale: { repeat: Infinity, duration: 2.5 } }}
                  className="absolute -bottom-1 -left-1 text-xl"
                >
                  ⭐
                </motion.div>
              </motion.div>

              {/* Title */}
              <h2 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
                {step.title}
              </h2>

              {/* Content */}
              <p className="text-lg text-gray-700 leading-relaxed px-2 font-medium">
                {step.content}
              </p>

              {/* Action Button */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={nextStep}
                  className="w-full py-4 px-8 bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600 text-white rounded-2xl font-bold text-lg shadow-xl border-2 border-white transition-all"
                >
                  {step.action}
                </Button>
              </motion.div>

              {/* Step counter */}
              <p className="text-sm text-gray-500 mt-4">
                {currentStep + 1} de {onboardingSteps.length}
              </p>
            </motion.div>
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}