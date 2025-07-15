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
        
        // Find the best voice for Lele (young, female, Portuguese)
        const bestVoice = findBestVoice(voices);
        if (bestVoice) {
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
    }
  }, []);

  const findBestVoice = (voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null => {
    // Priority order for finding the best voice for Lele
    const voicePriority = [
      // Priority 1: Brazilian Portuguese female voices
      (voice: SpeechSynthesisVoice) => 
        voice.lang === 'pt-BR' && 
        (voice.name.toLowerCase().includes('female') || 
         voice.name.toLowerCase().includes('mulher') ||
         voice.name.toLowerCase().includes('woman')),
      
      // Priority 2: Brazilian Portuguese voices with child-like names
      (voice: SpeechSynthesisVoice) => 
        voice.lang === 'pt-BR' && 
        (voice.name.toLowerCase().includes('maria') || 
         voice.name.toLowerCase().includes('lucia') ||
         voice.name.toLowerCase().includes('ana') ||
         voice.name.toLowerCase().includes('clara')),
      
      // Priority 3: Any Brazilian Portuguese voice
      (voice: SpeechSynthesisVoice) => voice.lang === 'pt-BR',
      
      // Priority 4: Portuguese female voices
      (voice: SpeechSynthesisVoice) => 
        voice.lang.includes('pt') && 
        (voice.name.toLowerCase().includes('female') || 
         voice.name.toLowerCase().includes('mulher')),
      
      // Priority 5: Any Portuguese voice
      (voice: SpeechSynthesisVoice) => voice.lang.includes('pt'),
      
      // Priority 6: English female voices as fallback
      (voice: SpeechSynthesisVoice) => 
        voice.lang.includes('en') && 
        (voice.name.toLowerCase().includes('female') || 
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
    switch (emotion) {
      case 'happy':
        return { speed: 1.1, pitch: 1.8, volume: 0.9 };
      case 'excited':
        return { speed: 1.3, pitch: 2.0, volume: 1.0 };
      case 'sad':
        return { speed: 0.8, pitch: 1.2, volume: 0.7 };
      case 'calm':
        return { speed: 0.9, pitch: 1.5, volume: 0.8 };
      case 'surprised':
        return { speed: 1.2, pitch: 2.2, volume: 0.9 };
      case 'loving':
        return { speed: 0.9, pitch: 1.6, volume: 0.8 };
      case 'playful':
        return { speed: 1.2, pitch: 1.9, volume: 0.9 };
      case 'encouraging':
        return { speed: 1.0, pitch: 1.7, volume: 0.9 };
      default:
        return { speed: 1.1, pitch: 1.8, volume: 0.9 };
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

    // Cancel any ongoing speech
    synthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    
    // Apply emotion-based settings
    const emotionSettings = getEmotionSettings(emotion);
    utterance.rate = emotionSettings.speed || 1.1;
    utterance.pitch = emotionSettings.pitch || 1.8;
    utterance.volume = emotionSettings.volume || 0.9;

    // Use the selected voice if available
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    } else {
      // Fallback to finding the best voice
      const voices = synthesis.getVoices();
      const bestVoice = findBestVoice(voices);
      if (bestVoice) {
        utterance.voice = bestVoice;
      }
    }

    // Add emotional pauses and emphasis
    const emotionalText = addEmotionalInflection(text, emotion);
    utterance.text = emotionalText;

    utterance.onend = () => {
      console.log(`Speech finished with emotion: ${emotion}`);
    };

    utterance.onerror = (event) => {
      console.error("Speech error:", event.error);
    };

    synthesis.speak(utterance);
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
  };
}
