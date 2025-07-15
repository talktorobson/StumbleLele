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
    utterance.rate = 1.1; // Slightly faster for a child's speech
    utterance.pitch = 1.8; // Much higher pitch for a little girl's voice
    utterance.volume = 0.9;

    // Wait for voices to load, then find the best Brazilian Portuguese female voice
    const setVoice = () => {
      const voices = synthesis.getVoices();
      
      // Priority order: Brazilian Portuguese female voices
      const voicePriority = [
        (voice: SpeechSynthesisVoice) => voice.lang === 'pt-BR' && (voice.name.toLowerCase().includes('female') || voice.name.toLowerCase().includes('mulher')),
        (voice: SpeechSynthesisVoice) => voice.lang === 'pt-BR' && (voice.name.toLowerCase().includes('maria') || voice.name.toLowerCase().includes('lucia')),
        (voice: SpeechSynthesisVoice) => voice.lang === 'pt-BR',
        (voice: SpeechSynthesisVoice) => voice.lang.includes('pt') && (voice.name.toLowerCase().includes('female') || voice.name.toLowerCase().includes('mulher')),
        (voice: SpeechSynthesisVoice) => voice.lang.includes('pt')
      ];

      for (const condition of voicePriority) {
        const selectedVoice = voices.find(condition);
        if (selectedVoice) {
          utterance.voice = selectedVoice;
          break;
        }
      }
    };

    // Set voice immediately if available, or wait for voices to load
    if (synthesis.getVoices().length > 0) {
      setVoice();
    } else {
      synthesis.addEventListener('voiceschanged', setVoice, { once: true });
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
