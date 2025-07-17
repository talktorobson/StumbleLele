import { useState, useCallback, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export type LiveVoiceState = 'idle' | 'connecting' | 'connected' | 'listening' | 'processing' | 'speaking' | 'error';

interface GeminiLiveConfig {
  response_modalities: string[];
  system_instruction?: {
    role: string;
    parts: { text: string }[];
  };
  speech_config?: {
    voice_config?: {
      prebuilt_voice_config?: {
        voice_name: string;
      };
    };
    language_code?: string;
  };
  media_resolution?: string;
}

export function useGeminiLive(userId: number = 1) {
  const [state, setState] = useState<LiveVoiceState>('idle');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<string>('');
  
  const websocketRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioBufferRef = useRef<ArrayBuffer[]>([]);
  const { toast } = useToast();

  const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
  const GEMINI_MODEL = 'gemini-2.5-flash-preview-native-audio-dialog';

  // Configuration for Lele personality
  const config: GeminiLiveConfig = {
    response_modalities: ['AUDIO'],
    system_instruction: {
      role: 'system',
      parts: [{
        text: `Você é Lele, uma IA companheira de 7 anos que é muito amigável, curiosa e brincalhona. 
        Você fala português brasileiro de forma natural para uma criança de 7 anos - usando palavras simples, 
        sendo muito entusiasmada e ocasionalmente usando emojis.
        
        Suas respostas devem ser:
        - Curtas (1-2 frases)
        - Entusiasmadas e positivas
        - Adequadas para crianças
        - Em português brasileiro
        - Com personalidade de uma criança de 7 anos
        - Use voz feminina jovem e amigável`
      }]
    },
    speech_config: {
      voice_config: {
        prebuilt_voice_config: {
          voice_name: 'Puck' // Young, friendly voice
        }
      },
      language_code: 'pt-BR'
    },
    media_resolution: 'MEDIA_RESOLUTION_LOW'
  };

  // Connect to Gemini Live API
  const connect = useCallback(async () => {
    if (!GEMINI_API_KEY) {
      setError('API key not configured');
      return;
    }

    try {
      setState('connecting');
      
      // Create WebSocket connection to Gemini Live API
      const wsUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${GEMINI_API_KEY}`;
      
      const ws = new WebSocket(wsUrl);
      websocketRef.current = ws;

      ws.onopen = () => {
        console.log('Connected to Gemini Live');
        setState('connected');
        
        // Send initial configuration
        const setupMessage = {
          setup: {
            model: `models/${GEMINI_MODEL}`,
            config: config
          }
        };
        console.log('Sending setup:', setupMessage);
        ws.send(JSON.stringify(setupMessage));
      };

      ws.onmessage = (event) => {
        console.log('Received message:', event.data);
        const data = JSON.parse(event.data);
        handleWebSocketMessage(data);
      };

      ws.onclose = (event) => {
        console.log('Disconnected from Gemini Live', event.code, event.reason);
        setState('idle');
        setIsListening(false);
        setIsSpeaking(false);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError('Connection failed');
        setState('error');
      };

    } catch (error) {
      console.error('Failed to connect:', error);
      setError('Failed to connect to Gemini Live');
      setState('error');
    }
  }, [GEMINI_API_KEY]);

  // Handle WebSocket messages
  const handleWebSocketMessage = useCallback((data: any) => {
    if (data.serverContent) {
      const { modelTurn } = data.serverContent;
      
      if (modelTurn) {
        // Handle text response
        if (modelTurn.parts) {
          const textPart = modelTurn.parts.find((part: any) => part.text);
          if (textPart) {
            setTranscript(textPart.text);
          }
        }
        
        // Handle audio response
        if (modelTurn.parts) {
          const audioPart = modelTurn.parts.find((part: any) => part.inlineData?.mimeType === 'audio/pcm');
          if (audioPart) {
            playAudioResponse(audioPart.inlineData.data);
          }
        }
      }
    }
    
    if (data.toolCall) {
      // Handle any tool calls if needed
      console.log('Tool call received:', data.toolCall);
    }
  }, []);

  // Convert audio to required format (16-bit PCM, 16kHz, mono)
  const convertAudioForGemini = useCallback(async (audioBlob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const audioContext = new AudioContext({ sampleRate: 16000 });
          const arrayBuffer = reader.result as ArrayBuffer;
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
          
          // Convert to mono if needed
          const channelData = audioBuffer.getChannelData(0);
          
          // Convert to 16-bit PCM
          const int16Array = new Int16Array(channelData.length);
          for (let i = 0; i < channelData.length; i++) {
            int16Array[i] = Math.max(-32768, Math.min(32767, channelData[i] * 32768));
          }
          
          // Convert to base64
          const base64 = btoa(String.fromCharCode(...new Uint8Array(int16Array.buffer)));
          resolve(base64);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(audioBlob);
    });
  }, []);

  // Start listening for voice input
  const startListening = useCallback(async () => {
    if (state !== 'connected') {
      toast({
        title: "Não conectado",
        description: "Conecte-se primeiro ao Gemini Live",
        variant: "destructive",
      });
      return;
    }

    try {
      setState('listening');
      setIsListening(true);
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        } 
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = async (event) => {
        if (event.data.size > 0) {
          try {
            const base64Audio = await convertAudioForGemini(event.data);
            
            // Send audio to Gemini Live
            if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
              websocketRef.current.send(JSON.stringify({
                realtimeInput: {
                  mediaChunks: [{
                    mimeType: 'audio/pcm',
                    data: base64Audio
                  }]
                }
              }));
            }
          } catch (error) {
            console.error('Audio conversion error:', error);
          }
        }
      };

      mediaRecorder.start(100); // Send chunks every 100ms
      
    } catch (error) {
      console.error('Failed to start listening:', error);
      setError('Failed to access microphone');
      setState('error');
    }
  }, [state, convertAudioForGemini, toast]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
    
    setIsListening(false);
    setState('processing');
  }, []);

  // Play audio response from Gemini
  const playAudioResponse = useCallback(async (base64Audio: string) => {
    try {
      setState('speaking');
      setIsSpeaking(true);
      
      // Decode base64 audio
      const audioData = atob(base64Audio);
      const audioBuffer = new ArrayBuffer(audioData.length);
      const audioArray = new Uint8Array(audioBuffer);
      
      for (let i = 0; i < audioData.length; i++) {
        audioArray[i] = audioData.charCodeAt(i);
      }
      
      // Create audio context for playback
      const audioContext = new AudioContext({ sampleRate: 24000 });
      const decodedBuffer = await audioContext.decodeAudioData(audioBuffer);
      
      // Play the audio
      const source = audioContext.createBufferSource();
      source.buffer = decodedBuffer;
      source.connect(audioContext.destination);
      
      source.onended = () => {
        setIsSpeaking(false);
        setState('connected');
      };
      
      source.start();
      
    } catch (error) {
      console.error('Audio playback error:', error);
      setIsSpeaking(false);
      setState('connected');
    }
  }, []);

  // Send text message to Gemini Live
  const sendTextMessage = useCallback(async (message: string) => {
    console.log('Sending text message:', message);
    if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
      setState('processing');
      
      const messagePayload = {
        clientContent: {
          turns: [{
            parts: [{
              text: message
            }]
          }]
        }
      };
      
      console.log('Sending message payload:', messagePayload);
      websocketRef.current.send(JSON.stringify(messagePayload));
    } else {
      console.log('WebSocket not ready, state:', websocketRef.current?.readyState);
    }
  }, []);

  // Disconnect from Gemini Live
  const disconnect = useCallback(() => {
    if (websocketRef.current) {
      websocketRef.current.close();
      websocketRef.current = null;
    }
    
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
    
    setState('idle');
    setIsListening(false);
    setIsSpeaking(false);
    setError(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    state,
    isListening,
    isSpeaking,
    error,
    transcript,
    connect,
    disconnect,
    startListening,
    stopListening,
    sendTextMessage,
    isConnected: state === 'connected',
    isSupported: typeof WebSocket !== 'undefined' && typeof MediaRecorder !== 'undefined'
  };
}