import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

export function useSpeech() {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [synthesis, setSynthesis] = useState<SpeechSynthesis | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'pt-BR';
      
      setRecognition(recognitionInstance);
    }

    // Initialize speech synthesis
    if ('speechSynthesis' in window) {
      setSynthesis(window.speechSynthesis);
    }
  }, []);

  const startListening = useCallback((
    onResult: (transcript: string) => void,
    onError: (error: string) => void
  ) => {
    if (!recognition) {
      onError("Reconhecimento de voz não está disponível neste navegador");
      return;
    }

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
      setIsListening(false);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      onError(`Erro no reconhecimento: ${event.error}`);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    try {
      recognition.start();
      setIsListening(true);
    } catch (error) {
      onError("Não foi possível iniciar o reconhecimento de voz");
    }
  }, [recognition]);

  const stopListening = useCallback(() => {
    if (recognition && isListening) {
      recognition.stop();
      setIsListening(false);
    }
  }, [recognition, isListening]);

  const speak = useCallback((text: string) => {
    if (!synthesis) {
      toast({
        title: "Aviso",
        description: "Síntese de voz não está disponível neste navegador",
        variant: "destructive",
      });
      return;
    }

    // Cancel any ongoing speech
    synthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.rate = 0.9;
    utterance.pitch = 1.2; // Slightly higher pitch for a young girl's voice
    utterance.volume = 0.8;

    // Try to find a Portuguese female voice
    const voices = synthesis.getVoices();
    const portugueseVoice = voices.find(voice => 
      voice.lang.includes('pt') && voice.name.toLowerCase().includes('female')
    ) || voices.find(voice => 
      voice.lang.includes('pt')
    );

    if (portugueseVoice) {
      utterance.voice = portugueseVoice;
    }

    utterance.onend = () => {
      console.log("Speech finished");
    };

    utterance.onerror = (event) => {
      console.error("Speech error:", event.error);
    };

    synthesis.speak(utterance);
  }, [synthesis, toast]);

  return {
    isListening,
    startListening,
    stopListening,
    speak,
    isSupported: !!recognition && !!synthesis,
  };
}
