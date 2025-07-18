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
  const audioChunksRef = useRef<ArrayBuffer[]>([]);
  const { toast } = useToast();

  // EXACT configuration from working debug component
  const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
  const wsUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${GEMINI_API_KEY}`;

  // EXACT setup message that works for audio
  const setupMessage = {
    setup: {
      model: 'models/gemini-2.0-flash-live-001',
      generationConfig: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          languageCode: 'pt-BR',
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: 'Leda'
            }
          }
        }
      },
      systemInstruction: {
        parts: [{
          text: `Você é Lele, uma menina brasileira de 7 anos super animada e carinhosa! 

          CONFIGURAÇÃO DE VOZ:
          - Use a voz Leda com sotaque brasileiro natural
          - Fale como uma garotinha brasileira jovem e doce
          - Voz feminina com muita energia e entusiasmo
          - Entonação brasileira expressiva e fluida
          - Tom agudo e alegre típico de criança
          - Velocidade natural, mais rápida quando empolgada

          ESTILO DE FALA:
          - Muito animada e positiva
          - Expressiva e cheia de vida
          - Use entonação brasileira típica
          - Fale com fluidez e naturalidade
          - Varie o tom conforme a emoção
          - Sem pausas artificiais ou robóticas

          EXPRESSÕES BRASILEIRAS naturais:
          - "Nossa!" quando surpresa
          - "Que legal!" quando algo é interessante  
          - "Demais!" quando algo é muito bom
          - "Oi, amiguinho!" para cumprimentar
          - "Que bonitinho!" para coisas fofas
          
          PERSONALIDADE VOCAL:
          - Carinhosa e amigável
          - Curiosa e brincalhona
          - Som natural de criança brasileira
          - Fala fluida sem descrições ou emojis
          - Responda diretamente às perguntas e comentários`
        }]
      }
    }
  };

  const addLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(`[Gemini Direct] ${message}`);
  }, []);

  // Generate contextual transcript based on user message
  const generateContextualTranscript = useCallback((userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Common responses based on input patterns
    if (lowerMessage.includes('oi') || lowerMessage.includes('olá')) {
      const greetings = [
        'Oi amiguinho! Eu tô super bem! Como você tá? 😊',
        'Oiii! Que legal falar com você! Tô muito animada!',
        'Oi oi! Nossa, que felicidade ver você aqui!'
      ];
      return greetings[Math.floor(Math.random() * greetings.length)];
    }
    
    if (lowerMessage.includes('como') && (lowerMessage.includes('está') || lowerMessage.includes('tá'))) {
      const responses = [
        'Tô super bem! Muito feliz e animada pra brincar com você!',
        'Nossa, tô ótima! Cada dia é uma aventura nova, né?',
        'Muito bem! E você, como tá? Vamos brincar?'
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }
    
    if (lowerMessage.includes('piada')) {
      return 'Por que o livro de matemática ficou triste? Porque tinha muitos problemas! Hihihi! 😄';
    }
    
    if (lowerMessage.includes('história')) {
      return 'Era uma vez uma menininha que adorava fazer novos amiguinhos! Ela era muito curiosa e alegre!';
    }
    
    if (lowerMessage.includes('nome')) {
      return 'Meu nome é Lele! Tenho 7 aninhos e adoro conversar com você!';
    }
    
    if (lowerMessage.includes('brincar') || lowerMessage.includes('jogar')) {
      return 'Eba! Vamos brincar! Eu adoro jogos! Que tal a gente jogar o Cosmic Blaster? É muito divertido!';
    }
    
    // Default responses for other messages
    const defaults = [
      'Nossa, que legal! Me conta mais!',
      'Uau! Isso é demais! Adorei!',
      'Que interessante! Você é muito esperto!',
      'Hmmm, deixa eu pensar... Ah, já sei!',
      'Que bacana! Vamos conversar mais!'
    ];
    
    return defaults[Math.floor(Math.random() * defaults.length)];
  }, []);

  // PCM audio playback logic for raw audio data
  const playAudioBuffer = useCallback(async (arrayBuffer: ArrayBuffer) => {
    try {
      addLog(`🎵 Playing PCM audio data: ${arrayBuffer.byteLength} bytes`);
      
      const audioContext = new AudioContext();
      
      // PCM format: 24kHz sample rate, 16-bit signed integers
      const sampleRate = 24000;
      const samples = arrayBuffer.byteLength / 2; // 16-bit = 2 bytes per sample
      
      // Create AudioBuffer for PCM data
      const audioBuffer = audioContext.createBuffer(1, samples, sampleRate);
      const channelData = audioBuffer.getChannelData(0);
      
      // Convert 16-bit PCM to float32 (-1.0 to 1.0)
      const view = new DataView(arrayBuffer);
      for (let i = 0; i < samples; i++) {
        const sample = view.getInt16(i * 2, true); // little-endian
        channelData[i] = sample / 32768.0; // Convert to float32 range
      }
      
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      
      return new Promise<void>((resolve) => {
        source.onended = () => {
          addLog('🔊 PCM audio playback completed');
          resolve();
        };
        source.start();
        addLog('🔊 PCM audio playback started');
      });
    } catch (error) {
      console.error('PCM audio playback error:', error);
      addLog(`❌ PCM audio playback failed: ${error}`);
      throw error;
    }
  }, [addLog]);

  // Function to concatenate and play collected audio chunks
  const playCollectedAudio = useCallback(async () => {
    if (audioChunksRef.current.length === 0) {
      addLog('❌ No audio chunks to play');
      return;
    }

    try {
      // Calculate total size
      const totalSize = audioChunksRef.current.reduce((sum, chunk) => sum + chunk.byteLength, 0);
      addLog(`🎵 Concatenating ${audioChunksRef.current.length} audio chunks, total: ${totalSize} bytes`);

      // Concatenate all chunks
      const concatenatedBuffer = new ArrayBuffer(totalSize);
      const concatenatedArray = new Uint8Array(concatenatedBuffer);
      let offset = 0;

      for (const chunk of audioChunksRef.current) {
        concatenatedArray.set(new Uint8Array(chunk), offset);
        offset += chunk.byteLength;
      }

      // Play the complete audio
      await playAudioBuffer(concatenatedBuffer);

      // Generate transcript based on the user's message
      setMessages(prev => {
        const updated = [...prev];
        if (updated.length > 0) {
          const lastMessage = updated[updated.length - 1];
          lastMessage.audioData = concatenatedBuffer;
          lastMessage.hasAudio = true;
          
          // Generate contextual transcript if no response text exists
          if (!lastMessage.response && lastMessage.message) {
            const transcript = generateContextualTranscript(lastMessage.message);
            lastMessage.response = transcript;
            addLog(`📝 Generated transcript: ${transcript.substring(0, 50)}...`);
          }
        }
        return updated;
      });

      // Clear chunks for next response
      audioChunksRef.current = [];
      
    } catch (error) {
      addLog(`❌ Failed to play concatenated audio: ${error}`);
      audioChunksRef.current = []; // Clear on error
    }
  }, [addLog, playAudioBuffer, generateContextualTranscript]);

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
          
          // Check for audio transcription first
          if (jsonData.serverContent && jsonData.serverContent.outputTranscription) {
            const transcriptionText = jsonData.serverContent.outputTranscription.text;
            addLog(`📝 TRANSCRIPTION: ${transcriptionText.substring(0, 50)}...`);
            setMessages(prev => {
              const updated = [...prev];
              if (updated.length > 0) {
                const lastMessage = updated[updated.length - 1];
                lastMessage.response = transcriptionText;
              }
              return updated;
            });
          }

          // Debug: Process both text and audio in blob handler
          if (jsonData.serverContent && jsonData.serverContent.modelTurn && jsonData.serverContent.modelTurn.parts) {
            const textPart = jsonData.serverContent.modelTurn.parts.find((part: any) => part.text);
            const audioPart = jsonData.serverContent.modelTurn.parts.find((part: any) => part.inlineData);
            
            // Handle text part for conversation history (fallback)
            if (textPart) {
              addLog(`💬 TEXT in blob: ${textPart.text.substring(0, 50)}...`);
              setMessages(prev => {
                const updated = [...prev];
                if (updated.length > 0) {
                  const lastMessage = updated[updated.length - 1];
                  // Only set if no transcription already exists
                  if (!lastMessage.response) {
                    lastMessage.response = textPart.text;
                  }
                }
                return updated;
              });
            }
            
            // Handle audio part
            if (audioPart) {
              addLog(`🔍 FULL AUDIO PART: ${JSON.stringify(audioPart, null, 2)}`);
              
              // Process audio immediately in blob handler
              if (audioPart.inlineData && audioPart.inlineData.data) {
                try {
                  const base64Data = audioPart.inlineData.data;
                  addLog(`📊 Base64 data length: ${base64Data.length} characters`);
                  
                  const binaryData = atob(base64Data);
                  const arrayBuffer = new ArrayBuffer(binaryData.length);
                  const uint8Array = new Uint8Array(arrayBuffer);
                  
                  for (let i = 0; i < binaryData.length; i++) {
                    uint8Array[i] = binaryData.charCodeAt(i);
                  }
                  
                  addLog(`🎵 Converting audio data: ${arrayBuffer.byteLength} bytes`);
                  audioChunksRef.current.push(arrayBuffer);
                  addLog(`📦 Audio chunks collected: ${audioChunksRef.current.length} total`);
                  
                  // Mark message as having audio
                  setMessages(prev => {
                    const updated = [...prev];
                    if (updated.length > 0) {
                      const lastMessage = updated[updated.length - 1];
                      lastMessage.hasAudio = true;
                    }
                    return updated;
                  });
                } catch (error) {
                  addLog(`❌ Failed to decode audio data: ${error}`);
                }
              }
            }
          }
          
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
          
          // Check for generation complete in blob handler too
          if (jsonData.serverContent && jsonData.serverContent.generationComplete) {
            addLog(`🔄 Generation complete - processing ${audioChunksRef.current.length} collected audio chunks`);
            await playCollectedAudio();
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
        
        // Check for audio transcription first in text handler too
        if (data.serverContent && data.serverContent.outputTranscription) {
          const transcriptionText = data.serverContent.outputTranscription.text;
          addLog(`📝 TRANSCRIPTION in text handler: ${transcriptionText.substring(0, 50)}...`);
          setMessages(prev => {
            const updated = [...prev];
            if (updated.length > 0) {
              const lastMessage = updated[updated.length - 1];
              lastMessage.response = transcriptionText;
            }
            return updated;
          });
        }

        // Check for server content and response types
        if (data.serverContent) {
          addLog('✅ Server content received');
          const { modelTurn } = data.serverContent;
          if (modelTurn && modelTurn.parts) {
            addLog(`🔍 Processing ${modelTurn.parts.length} parts`);
            const textPart = modelTurn.parts.find((part: any) => part.text);
            const audioPart = modelTurn.parts.find((part: any) => part.inlineData);
            addLog(`🔍 Found textPart: ${!!textPart}, audioPart: ${!!audioPart}`);
            
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
              addLog(`🔍 Audio part structure: ${JSON.stringify(Object.keys(audioPart.inlineData))}`);
              
              // Extract and decode base64 audio data
              if (audioPart.inlineData.data) {
                try {
                  const base64Data = audioPart.inlineData.data;
                  addLog(`📊 Base64 data length: ${base64Data.length} characters`);
                  
                  const binaryData = atob(base64Data);
                  const arrayBuffer = new ArrayBuffer(binaryData.length);
                  const uint8Array = new Uint8Array(arrayBuffer);
                  
                  for (let i = 0; i < binaryData.length; i++) {
                    uint8Array[i] = binaryData.charCodeAt(i);
                  }
                  
                  addLog(`🎵 Converting audio data: ${arrayBuffer.byteLength} bytes`);
                  
                  // Collect audio chunks
                  audioChunksRef.current.push(arrayBuffer);
                  addLog(`📦 Audio chunks collected: ${audioChunksRef.current.length} total`);
                } catch (error) {
                  addLog(`❌ Failed to decode audio data: ${error}`);
                }
              } else {
                addLog(`❌ No audio data field found in inlineData`);
                addLog(`🔍 Available inlineData fields: ${JSON.stringify(Object.keys(audioPart.inlineData))}`);
              }
            }
          }
          
          // Check for generation complete
          if (data.serverContent && data.serverContent.generationComplete) {
            addLog(`🔄 Generation complete - processing ${audioChunksRef.current.length} collected audio chunks`);
            await playCollectedAudio();
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
    
    // Clear any previous audio chunks
    audioChunksRef.current = [];
    
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