import { useState, useCallback, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  userId: number;
  message: string;
  response?: string;
  timestamp: string;
  emotion?: string;
  personality?: any;
  audioData?: ArrayBuffer;
  hasAudio?: boolean;
}

export function useGeminiDirect(userId: number) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState<string>('happy');
  const [logs, setLogs] = useState<string[]>([]);
  const websocketRef = useRef<WebSocket | null>(null);
  const { toast } = useToast();

  // EXACT configuration from working debug component
  const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
  const wsUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${GEMINI_API_KEY}`;

  // EXACT setup message that works for audio
  const setupMessage = {
    setup: {
      model: 'models/gemini-2.5-flash-preview-native-audio-dialog',
      generationConfig: {
        responseModalities: ['AUDIO'],
        systemInstruction: {
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
        }
      }
    }
  };

  const addLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(`[Gemini Direct] ${message}`);
  }, []);

  // EXACT audio playback logic from debug component
  const playAudioBuffer = useCallback(async (arrayBuffer: ArrayBuffer) => {
    try {
      addLog(`🎵 Playing audio data: ${arrayBuffer.byteLength} bytes`);
      
      // EXACT method from debug component
      const audioContext = new AudioContext();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      
      return new Promise<void>((resolve) => {
        source.onended = () => {
          addLog('🔊 Audio playback completed');
          resolve();
        };
        source.start();
        addLog('🔊 Audio playback started');
      });
    } catch (error) {
      console.error('Audio playback error:', error);
      addLog(`❌ Audio playback failed: ${error}`);
      throw error;
    }
  }, [addLog]);

  // EXACT message handling logic from debug component
  const handleMessage = useCallback(async (event: MessageEvent) => {
    if (event.data instanceof Blob) {
      addLog(`📨 Received Blob: ${event.data.size} bytes, type: ${event.data.type}`);
      
      // Try to read as text first (for JSON responses)
      try {
        const text = await event.data.text();
        addLog(`📝 Blob text content preview: ${text.substring(0, 100)}...`);
        
        // Try to parse as JSON
        try {
          const jsonData = JSON.parse(text);
          addLog(`✅ JSON parsed successfully`);
          
          // Check for server content and response types
          if (jsonData.serverContent) {
            addLog('✅ Server content received');
            const { modelTurn } = jsonData.serverContent;
            if (modelTurn && modelTurn.parts) {
              const textPart = modelTurn.parts.find((part: any) => part.text);
              const audioPart = modelTurn.parts.find((part: any) => part.inlineData);
              
              if (textPart) {
                addLog(`💬 TEXT response: ${textPart.text.substring(0, 50)}...`);
              }
              if (audioPart) {
                addLog(`🔊 AUDIO response detected! MIME: ${audioPart.inlineData.mimeType}`);
                // Handle audio data if present
              }
            }
          }
          
          if (jsonData.setupComplete) {
            addLog('✅ Setup complete - ready for audio responses');
          }
          
          // Check for error messages
          if (jsonData.error) {
            addLog(`❌ Error: ${jsonData.error.message || jsonData.error}`);
          }
        } catch (e) {
          addLog('❌ Not valid JSON - might be audio data');
        }
      } catch (e) {
        addLog('❌ Failed to read blob as text, trying as audio...');
        
        // Try to read as ArrayBuffer (for audio)
        try {
          const arrayBuffer = await event.data.arrayBuffer();
          addLog(`🎵 Audio data received: ${arrayBuffer.byteLength} bytes`);
          
          // Play the audio immediately
          await playAudioBuffer(arrayBuffer);
          
          // Update the last message with audio data
          setMessages(prev => {
            const updated = [...prev];
            if (updated.length > 0) {
              const lastMessage = updated[updated.length - 1];
              lastMessage.audioData = arrayBuffer;
              lastMessage.hasAudio = true;
            }
            return updated;
          });
          
        } catch (e) {
          addLog('❌ Failed to process as audio data');
        }
      }
    } else {
      addLog(`📨 Received text: ${event.data.substring(0, 100)}...`);
      try {
        const data = JSON.parse(event.data);
        
        // Check for server content and response types
        if (data.serverContent) {
          addLog('✅ Server content received');
          const { modelTurn } = data.serverContent;
          if (modelTurn && modelTurn.parts) {
            const textPart = modelTurn.parts.find((part: any) => part.text);
            const audioPart = modelTurn.parts.find((part: any) => part.inlineData);
            
            if (textPart) {
              addLog(`💬 TEXT response: ${textPart.text.substring(0, 50)}...`);
              
              // Update the last message with text response
              setMessages(prev => {
                const updated = [...prev];
                if (updated.length > 0) {
                  const lastMessage = updated[updated.length - 1];
                  lastMessage.response = textPart.text;
                }
                return updated;
              });
            }
            if (audioPart) {
              addLog(`🔊 AUDIO response detected! MIME: ${audioPart.inlineData.mimeType}`);
              // Audio data will come in a separate blob message
            }
          }
          
          setIsProcessing(false);
        }
        
        if (data.setupComplete) {
          addLog('✅ Setup complete - ready for audio responses');
        }
        
        // Check for error messages
        if (data.error) {
          addLog(`❌ Error: ${data.error.message || data.error}`);
          setIsProcessing(false);
        }
      } catch (e) {
        addLog('❌ Failed to parse text message');
      }
    }
  }, [addLog, playAudioBuffer]);

  // EXACT connection logic from debug component
  const connect = useCallback(async () => {
    if (!GEMINI_API_KEY) {
      addLog('❌ ERROR: No API key found');
      toast({
        title: "Erro de configuração",
        description: "Chave da API não encontrada",
        variant: "destructive",
      });
      return;
    }

    try {
      addLog(`🔌 Connecting to Gemini Live API...`);
      
      const ws = new WebSocket(wsUrl);
      websocketRef.current = ws;

      ws.onopen = () => {
        addLog('✅ WebSocket connected successfully');
        setIsConnected(true);
        
        addLog(`📤 Sending setup message for audio responses...`);
        ws.send(JSON.stringify(setupMessage));
      };

      ws.onmessage = handleMessage;

      ws.onclose = (event) => {
        addLog(`❌ Disconnected: ${event.code} - ${event.reason}`);
        setIsConnected(false);
        setIsProcessing(false);
      };

      ws.onerror = (error) => {
        addLog(`❌ WebSocket error: ${error}`);
        setIsConnected(false);
        setIsProcessing(false);
      };

    } catch (error) {
      addLog(`❌ Connection failed: ${error}`);
      toast({
        title: "Erro de conexão",
        description: "Falha ao conectar com Gemini",
        variant: "destructive",
      });
    }
  }, [GEMINI_API_KEY, wsUrl, handleMessage, addLog, toast]);

  // EXACT message sending logic from debug component
  const sendMessage = useCallback(async (text: string) => {
    if (!websocketRef.current || websocketRef.current.readyState !== WebSocket.OPEN) {
      addLog('❌ WebSocket not ready');
      toast({
        title: "Não conectado",
        description: "Conecte-se primeiro para enviar mensagens",
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

    // EXACT message format from debug component
    const messagePayload = {
      clientContent: {
        turns: {
          role: 'user',
          parts: [{ text }]
        },
        turnComplete: true
      }
    };

    addLog(`📤 Sending message: "${text}"`);
    websocketRef.current.send(JSON.stringify(messagePayload));
  }, [userId, addLog, toast]);

  // Disconnect function
  const disconnect = useCallback(() => {
    if (websocketRef.current) {
      websocketRef.current.close();
      websocketRef.current = null;
    }
    setIsConnected(false);
    setIsProcessing(false);
    addLog('🔌 Disconnected from Gemini Live API');
  }, [addLog]);

  // Voice recognition setup (keep from original implementation)
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
      addLog('🎤 Voice recognition started');
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      addLog(`🎤 Voice transcript: "${transcript}"`);
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
  }, [sendMessage, addLog, toast]);

  // Auto-connect on mount
  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    messages,
    isConnected,
    isProcessing,
    currentEmotion,
    logs,
    sendMessage,
    startListening,
    connect,
    disconnect
  };
}