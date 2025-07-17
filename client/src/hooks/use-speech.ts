import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

export type VoiceEmotion = 'happy' | 'sad' | 'excited' | 'calm' | 'surprised' | 'loving' | 'playful' | 'encouraging';

export type VoiceSettings = {
  emotion: VoiceEmotion;
  speed: number;
  pitch: number;
  volume: number;
};

export function useSpeech() {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [synthesis, setSynthesis] = useState<SpeechSynthesis | null>(null);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [isAudioInitialized, setIsAudioInitialized] = useState(false);
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
      
      // Load available voices
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        setAvailableVoices(voices);
        
        // Log available voices for debugging on iOS
        console.log('Available voices:', voices.map(v => `${v.name} (${v.lang})`));
        
        // Find the best voice for Lele (young, female, Portuguese)
        const bestVoice = findBestVoice(voices);
        if (bestVoice) {
          console.log('Selected voice:', bestVoice.name, bestVoice.lang);
          setSelectedVoice(bestVoice);
        }
      };

      // Load voices immediately if available
      if (window.speechSynthesis.getVoices().length > 0) {
        loadVoices();
      } else {
        // Wait for voices to load
        window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
      }
      
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

  const findBestVoice = (voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null => {
    // Priority order for finding the best voice for Lele
    const voicePriority = [
      // Priority 1: Brazilian Portuguese female voices (iOS specific names)
      (voice: SpeechSynthesisVoice) => 
        voice.lang === 'pt-BR' && 
        (voice.name.toLowerCase().includes('luciana') || 
         voice.name.toLowerCase().includes('alice') ||
         voice.name.toLowerCase().includes('helena') ||
         voice.name.toLowerCase().includes('female') || 
         voice.name.toLowerCase().includes('mulher') ||
         voice.name.toLowerCase().includes('woman')),
      
      // Priority 2: Brazilian Portuguese voices with child-like or female names
      (voice: SpeechSynthesisVoice) => 
        voice.lang === 'pt-BR' && 
        (voice.name.toLowerCase().includes('maria') || 
         voice.name.toLowerCase().includes('lucia') ||
         voice.name.toLowerCase().includes('ana') ||
         voice.name.toLowerCase().includes('clara') ||
         voice.name.toLowerCase().includes('sara') ||
         voice.name.toLowerCase().includes('vitoria')),
      
      // Priority 3: Any Brazilian Portuguese voice that's not explicitly male
      (voice: SpeechSynthesisVoice) => 
        voice.lang === 'pt-BR' && 
        !voice.name.toLowerCase().includes('diego') &&
        !voice.name.toLowerCase().includes('felipe') &&
        !voice.name.toLowerCase().includes('ricardo') &&
        !voice.name.toLowerCase().includes('daniel'),
      
      // Priority 4: Portuguese female voices
      (voice: SpeechSynthesisVoice) => 
        voice.lang.includes('pt') && 
        (voice.name.toLowerCase().includes('female') || 
         voice.name.toLowerCase().includes('mulher') ||
         voice.name.toLowerCase().includes('catarina') ||
         voice.name.toLowerCase().includes('joana')),
      
      // Priority 5: Any Portuguese voice that's not male
      (voice: SpeechSynthesisVoice) => 
        voice.lang.includes('pt') &&
        !voice.name.toLowerCase().includes('male') &&
        !voice.name.toLowerCase().includes('homem'),
      
      // Priority 6: English female voices as fallback (iOS specific)
      (voice: SpeechSynthesisVoice) => 
        voice.lang.includes('en') && 
        (voice.name.toLowerCase().includes('samantha') ||
         voice.name.toLowerCase().includes('victoria') ||
         voice.name.toLowerCase().includes('siri') ||
         voice.name.toLowerCase().includes('female') || 
         voice.name.toLowerCase().includes('woman')),
    ];

    for (const condition of voicePriority) {
      const selectedVoice = voices.find(condition);
      if (selectedVoice) {
        return selectedVoice;
      }
    }
    
    return voices[0] || null;
  };

  const getEmotionSettings = (emotion: VoiceEmotion): Partial<VoiceSettings> => {
    // Slower speeds optimized for children's comprehension (5-10 years old)
    switch (emotion) {
      case 'happy':
        return { speed: 0.8, pitch: 1.6, volume: 0.9 };
      case 'excited':
        return { speed: 0.9, pitch: 1.8, volume: 1.0 };
      case 'sad':
        return { speed: 0.7, pitch: 1.2, volume: 0.7 };
      case 'calm':
        return { speed: 0.7, pitch: 1.4, volume: 0.8 };
      case 'surprised':
        return { speed: 0.8, pitch: 1.9, volume: 0.9 };
      case 'loving':
        return { speed: 0.7, pitch: 1.5, volume: 0.8 };
      case 'playful':
        return { speed: 0.8, pitch: 1.7, volume: 0.9 };
      case 'encouraging':
        return { speed: 0.8, pitch: 1.6, volume: 0.9 };
      default:
        return { speed: 0.8, pitch: 1.6, volume: 0.9 };
    }
  };

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

  const speak = useCallback((text: string, emotion: VoiceEmotion = 'happy') => {
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

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    
    // Apply emotion-based settings
    const emotionSettings = getEmotionSettings(emotion);
    utterance.rate = emotionSettings.speed || 1.1;
    utterance.pitch = emotionSettings.pitch || 1.8;
    utterance.volume = emotionSettings.volume || 0.9;

    // iOS fix: Always load voices fresh for each utterance
    const currentVoices = synthesis.getVoices();
    if (currentVoices.length > 0) {
      if (selectedVoice && currentVoices.includes(selectedVoice)) {
        utterance.voice = selectedVoice;
      } else {
        // Find the best voice again
        const bestVoice = findBestVoice(currentVoices);
        if (bestVoice) {
          utterance.voice = bestVoice;
          console.log('Using voice for iOS:', bestVoice.name);
        }
      }
    }

    // Add emotional pauses and emphasis
    const emotionalText = addEmotionalInflection(text, emotion);
    utterance.text = emotionalText;

    utterance.onstart = () => {
      console.log(`Speech started with emotion: ${emotion}, voice: ${utterance.voice?.name || 'default'}`);
    };

    utterance.onend = () => {
      console.log(`Speech finished with emotion: ${emotion}`);
    };

    utterance.onerror = (event) => {
      console.error("Speech error:", event.error);
      // iOS fallback: Try again with simpler settings
      if (event.error === 'not-allowed' || event.error === 'synthesis-unavailable') {
        setTimeout(() => {
          const simpleUtterance = new SpeechSynthesisUtterance(text);
          simpleUtterance.lang = 'pt-BR';
          simpleUtterance.rate = 0.8; // Slower for kids
          simpleUtterance.pitch = 1.4; // Slightly higher pitch for kids
          simpleUtterance.volume = 0.8;
          synthesis.speak(simpleUtterance);
        }, 100);
      }
    };

    // iOS fix: Add delay before speaking to ensure proper initialization
    setTimeout(() => {
      try {
        synthesis.speak(utterance);
      } catch (error) {
        console.error('Speech synthesis error:', error);
        // Final fallback for iOS - slower for kids
        const fallbackUtterance = new SpeechSynthesisUtterance(text);
        fallbackUtterance.rate = 0.8; // Slower for kids
        fallbackUtterance.pitch = 1.4; // Kid-friendly pitch
        fallbackUtterance.volume = 0.8;
        synthesis.speak(fallbackUtterance);
      }
    }, 50);
  }, [synthesis, toast, selectedVoice]);

  const addEmotionalInflection = (text: string, emotion: VoiceEmotion): string => {
    switch (emotion) {
      case 'excited':
        return text.replace(/[.!?]$/, '!').replace(/\./g, '!');
      case 'sad':
        return text.replace(/[!?]$/, '...').replace(/!/g, '.');
      case 'surprised':
        return text.replace(/[.!]$/, '?!').replace(/\./g, '!');
      case 'loving':
        return text.replace(/\b(você|voce)\b/gi, 'querido').replace(/[.!?]$/, ' ♥');
      case 'playful':
        return text.replace(/\b(olá|oi)\b/gi, 'oi oi').replace(/[.!?]$/, ' hehe');
      case 'encouraging':
        return text.replace(/\b(sim|pode|consegue)\b/gi, 'isso mesmo').replace(/[.!?]$/, '! Você é incrível!');
      default:
        return text;
    }
  };

  const changeVoice = useCallback((voiceIndex: number) => {
    if (availableVoices[voiceIndex]) {
      setSelectedVoice(availableVoices[voiceIndex]);
    }
  }, [availableVoices]);

  const speakWithCustomSettings = useCallback((text: string, settings: Partial<VoiceSettings>) => {
    if (!synthesis) {
      toast({
        title: "Aviso",
        description: "Síntese de voz não está disponível neste navegador",
        variant: "destructive",
      });
      return;
    }

    synthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.rate = settings.speed || 1.1;
    utterance.pitch = settings.pitch || 1.8;
    utterance.volume = settings.volume || 0.9;

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    if (settings.emotion) {
      utterance.text = addEmotionalInflection(text, settings.emotion);
    }

    synthesis.speak(utterance);
  }, [synthesis, toast, selectedVoice]);

  return {
    isListening,
    startListening,
    stopListening,
    speak,
    speakWithCustomSettings,
    changeVoice,
    availableVoices,
    selectedVoice,
    isSupported: !!recognition && !!synthesis,
    isAudioInitialized,
  };
}
