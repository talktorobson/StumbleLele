import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";



export function useSpeech() {
  const [synthesis, setSynthesis] = useState<SpeechSynthesis | null>(null);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [isAudioInitialized, setIsAudioInitialized] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Initialize speech synthesis
    if ('speechSynthesis' in window) {
      setSynthesis(window.speechSynthesis);
      
      // Load available voices
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        setAvailableVoices(voices);
        
        // Log available voices for debugging on iOS
        console.log('Available voices:', voices.map(v => `${v.name} (${v.lang})`));
        
        // Find the best voice for Lele (young, female, Portuguese)
        const suitableVoice = voices.find(voice => 
          voice.lang === 'pt-BR' && 
          (voice.name.toLowerCase().includes('child') || 
           voice.name.toLowerCase().includes('young') ||
           voice.name.toLowerCase().includes('female'))
        ) || voices.find(voice => voice.lang === 'pt-BR');

        if (suitableVoice) {
          console.log('Selected voice:', suitableVoice.name, suitableVoice.lang);
          setSelectedVoice(suitableVoice);
        }
      };

      // Load voices immediately if available
      if (window.speechSynthesis.getVoices().length > 0) {
        loadVoices();
      } else {
        // Wait for voices to load
        window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
      };
      
      // iOS audio initialization - requires user interaction
      const initializeAudio = () => {
        if (!isAudioInitialized) {
          const utterance = new SpeechSynthesisUtterance('');
          utterance.volume = 0;
          window.speechSynthesis.speak(utterance);
          setIsAudioInitialized(true);
        }
      };
      
      // Listen for first user interaction to initialize audio
      const events = ['touchstart', 'click', 'mousedown'];
      events.forEach(event => {
        document.addEventListener(event, initializeAudio, { once: true });
      });
      
      return () => {
        events.forEach(event => {
          document.removeEventListener(event, initializeAudio);
        });
      };
    }
  }, [isAudioInitialized]);

  

  

  

  

  // Note: speakJoke will be defined after speak function to avoid circular dependency

  const speak = useCallback((text: string) => {
    if (!synthesis) {
      toast({
        title: "Aviso",
        description: "Síntese de voz não está disponível neste navegador",
        variant: "destructive",
      });
      return;
    }

    // iOS fix: Ensure speech synthesis is properly initialized
    if (synthesis.paused) {
      synthesis.resume();
    }

    // Cancel any ongoing speech
    synthesis.cancel();

    // Remove emojis from voice delivery (keep text clean for speech)
    const cleanText = text.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '').trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'pt-BR';
    
    // Default settings for a kid-friendly voice
    utterance.rate = 0.8; // Slower for kids
    utterance.pitch = 1.4; // Slightly higher pitch for kids
    utterance.volume = 0.8;

    // iOS fix: Always load voices fresh for each utterance
    const currentVoices = synthesis.getVoices();
    if (currentVoices.length > 0) {
      // Find a suitable voice (e.g., a child-like or friendly female voice)
      const suitableVoice = currentVoices.find(voice => 
        voice.lang === 'pt-BR' && 
        (voice.name.toLowerCase().includes('child') || 
         voice.name.toLowerCase().includes('young') ||
         voice.name.toLowerCase().includes('female'))
      ) || currentVoices.find(voice => voice.lang === 'pt-BR');

      if (suitableVoice) {
        utterance.voice = suitableVoice;
        console.log('Using voice for iOS:', suitableVoice.name);
      }
    }

    utterance.onstart = () => {
      console.log(`Speech started`);
    };

    utterance.onend = () => {
      console.log(`Speech finished`);
    };

    utterance.onerror = (event) => {
      console.error("Speech error:", event.error);
    };

    // iOS fix: Add delay before speaking to ensure proper initialization
    setTimeout(() => {
      try {
        synthesis.speak(utterance);
      } catch (error) {
        console.error('Speech synthesis error:', error);
      }
    }, 50);
  }, [synthesis, toast]);

  

  const changeVoice = useCallback((voiceIndex: number) => {
    if (availableVoices[voiceIndex]) {
      setSelectedVoice(availableVoices[voiceIndex]);
    }
  }, [availableVoices]);

  

  

  return {
    speak,
    changeVoice,
    availableVoices,
    selectedVoice,
    isSupported: !!synthesis,
    isAudioInitialized,
  };
}
