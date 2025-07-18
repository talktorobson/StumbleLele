import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface Message {
  id: string;
  userId: number;
  message: string;
  response?: string;
  timestamp: string;
  emotion?: string;
  personality?: any;
  saved?: boolean;
  audioData?: string;
  audioMimeType?: string;
}

export function useSupabaseGeminiLive(userId: number) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState<string>('happy');
  const channelRef = useRef<any>(null);
  const { toast } = useToast();
  
  // Audio playback setup
  const playAudioResponse = useCallback(async (audioData: string, mimeType: string = 'audio/wav') => {
    try {
      // Cancel any ongoing speech synthesis
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      
      // Convert base64 audio to blob
      const audioBytes = atob(audioData);
      const audioArray = new Uint8Array(audioBytes.length);
      
      for (let i = 0; i < audioBytes.length; i++) {
        audioArray[i] = audioBytes.charCodeAt(i);
      }
      
      const audioBlob = new Blob([audioArray], { type: mimeType });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Create and play audio element
      const audio = new Audio(audioUrl);
      audio.preload = 'auto';
      
      return new Promise<void>((resolve, reject) => {
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          resolve();
        };
        
        audio.onerror = (error) => {
          URL.revokeObjectURL(audioUrl);
          reject(error);
        };
        
        audio.play().catch(reject);
      });
      
    } catch (error) {
      console.error('Error playing audio:', error);
      throw error;
    }
  }, []);

  // Fallback TTS for when audio is not available
  const speakResponseFallback = useCallback((text: string, emotion?: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'pt-BR';
      utterance.rate = 1.1;
      utterance.pitch = 1.2;
      
      // Try to find a female Portuguese voice
      const voices = window.speechSynthesis.getVoices();
      const ptBRFemaleVoice = voices.find(voice => 
        voice.lang.includes('pt-BR') && 
        (voice.name.toLowerCase().includes('female') || 
         voice.name.toLowerCase().includes('feminina') ||
         voice.name.includes('Google português do Brasil 2') ||
         voice.name.includes('Luciana'))
      );
      
      if (ptBRFemaleVoice) {
        utterance.voice = ptBRFemaleVoice;
      }
      
      // Adjust voice parameters based on emotion
      switch (emotion) {
        case 'excited':
          utterance.rate = 1.3;
          utterance.pitch = 1.4;
          break;
        case 'curious':
          utterance.rate = 1.0;
          utterance.pitch = 1.3;
          break;
        case 'playful':
          utterance.rate = 1.2;
          utterance.pitch = 1.5;
          break;
        case 'calm':
          utterance.rate = 0.9;
          utterance.pitch = 1.0;
          break;
      }
      
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  // Initialize Supabase Realtime channel
  useEffect(() => {
    const channelName = `gemini-chat-${userId}`;
    
    channelRef.current = supabase
      .channel(channelName)
      .on('broadcast', { event: 'gemini-response' }, async (payload) => {
        console.log('Received Gemini response:', payload);
        
        const { response, emotion, personality, messageId, audioData, audioMimeType } = payload.payload;
        
        // Update the message with response
        setMessages(prev => prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, response, emotion, personality }
            : msg
        ));
        
        // Update current emotion
        if (emotion) {
          setCurrentEmotion(emotion);
        }
        
        // Play audio response if available, otherwise use TTS fallback
        if (audioData) {
          try {
            console.log('Playing Gemini audio response');
            await playAudioResponse(audioData, audioMimeType);
          } catch (error) {
            console.error('Failed to play audio, falling back to TTS:', error);
            if (response) {
              speakResponseFallback(response, emotion);
            }
          }
        } else if (response) {
          console.log('No audio data, using TTS fallback');
          speakResponseFallback(response, emotion);
        }
        
        setIsProcessing(false);
      })
      .on('broadcast', { event: 'error' }, (payload) => {
        console.error('Received error:', payload);
        toast({
          title: "Erro",
          description: payload.payload.message || "Erro ao processar mensagem",
          variant: "destructive",
        });
        setIsProcessing(false);
      })
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
        console.log('Channel status:', status);
      });

    return () => {
      channelRef.current?.unsubscribe();
    };
  }, [userId, speakResponse, toast]);

  // Send message to Supabase Edge Function
  const sendMessage = useCallback(async (text: string) => {
    if (!isConnected) {
      toast({
        title: "Não conectado",
        description: "Aguarde a conexão ser estabelecida",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    const messageId = Date.now().toString();
    const newMessage: Message = {
      id: messageId,
      userId,
      message: text,
      timestamp: new Date().toISOString()
    };
    
    // Add message to state immediately
    setMessages(prev => [...prev, newMessage]);
    
    try {
      // Call the Edge Function
      const { data, error } = await supabase.functions.invoke('gemini-chat', {
        body: {
          message: text,
          userId,
          messageId,
          channelName: `gemini-chat-${userId}`
        }
      });
      
      if (error) throw error;
      
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Erro ao enviar mensagem",
        description: "Tente novamente em alguns segundos",
        variant: "destructive",
      });
      setIsProcessing(false);
      
      // Remove the failed message
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
    }
  }, [isConnected, userId, toast]);

  // Voice recognition setup
  const startListening = useCallback(() => {
    if (!('webkitSpeechRecognition' in window)) {
      toast({
        title: "Não suportado",
        description: "Seu navegador não suporta reconhecimento de voz",
        variant: "destructive",
      });
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      console.log('Voice recognition started');
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      console.log('Voice transcript:', transcript);
      sendMessage(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error('Voice recognition error:', event.error);
      toast({
        title: "Erro no reconhecimento de voz",
        description: "Tente novamente",
        variant: "destructive",
      });
    };

    recognition.start();
    return recognition;
  }, [sendMessage, toast]);

  return {
    messages,
    isConnected,
    isProcessing,
    currentEmotion,
    sendMessage,
    startListening,
    playAudioResponse,
    speakResponseFallback
  };
}