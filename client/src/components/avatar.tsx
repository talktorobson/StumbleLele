import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle, Gamepad2, Laugh, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAvatar } from "@/hooks/use-avatar";
import { useSpeech } from "@/hooks/use-speech";
import { motion } from "framer-motion";

interface AvatarProps {
  userId: number;
  avatarState?: {
    currentEmotion: string;
    personality: any;
    lastInteraction: string;
  };
}

export default function Avatar({ userId, avatarState }: AvatarProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currentEmotion, setEmotion, getEmotionIcon } = useAvatar(avatarState?.currentEmotion);
  // Note: Using regular TTS for now since Gemini Live is integrated via Supabase Realtime
  const { speak } = useSpeech();
  const [isAnimating, setIsAnimating] = useState(false);

  const tellJokeMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/joke", { userId });
      return response.json();
    },
    onSuccess: async (data) => {
      setEmotion("excited");
      queryClient.invalidateQueries({ queryKey: ["/api/avatar", userId] });
      
      console.log('Joke received:', data);
      
      // Check if we have audio data from Gemini Live
      if (data.hasAudio && data.audioData) {
        console.log('🎵 Playing Gemini Live audio joke');
        console.log('Audio data:', data.audioData);
        
        try {
          // Decode base64 audio data
          const audioData = data.audioData;
          const base64Data = audioData.data;
          const mimeType = audioData.mimeType;
          
          console.log('🎵 Audio format:', mimeType);
          console.log('🎵 Audio data length:', base64Data.length);
          
          // Handle PCM audio data directly (Gemini Live sends PCM)
          if (mimeType && mimeType.includes('audio/pcm')) {
            console.log('🎵 Processing PCM audio from Gemini Live...');
            
            try {
              // Decode base64 PCM data
              const binaryData = atob(base64Data);
              const arrayBuffer = new ArrayBuffer(binaryData.length);
              const uint8Array = new Uint8Array(arrayBuffer);
              
              for (let i = 0; i < binaryData.length; i++) {
                uint8Array[i] = binaryData.charCodeAt(i);
              }
              
              // Create AudioContext for PCM playback
              const audioContext = new AudioContext();
              
              console.log('🔊 AudioContext state:', audioContext.state);
              console.log('🔊 AudioContext sample rate:', audioContext.sampleRate);
              
              // Ensure audio context is running
              if (audioContext.state === 'suspended') {
                console.log('🔊 Resuming suspended audio context...');
                await audioContext.resume();
                console.log('🔊 AudioContext resumed, new state:', audioContext.state);
              }
              
              // PCM format: 24kHz sample rate, 16-bit signed integers
              const pcmSampleRate = 24000;
              const inputSamples = arrayBuffer.byteLength / 2;
              
              // Use AudioContext's native sample rate for proper playback
              const outputSampleRate = audioContext.sampleRate;
              
              // Calculate resampling ratio and output sample count
              const resampleRatio = outputSampleRate / pcmSampleRate;
              const outputSamples = Math.floor(inputSamples * resampleRatio);
              
              console.log('🔊 PCM audio details:', {
                pcmSampleRate,
                outputSampleRate,
                inputSamples,
                outputSamples,
                resampleRatio,
                duration: inputSamples / pcmSampleRate,
                bytes: arrayBuffer.byteLength
              });
              
              // Create AudioBuffer using the AudioContext's native sample rate
              const audioBuffer = audioContext.createBuffer(1, outputSamples, outputSampleRate);
              const channelData = audioBuffer.getChannelData(0);
              
              // Convert 16-bit PCM to float32 and resample
              const view = new DataView(arrayBuffer);
              let maxSample = 0;
              let minSample = 0;
              let nonZeroSamples = 0;
              
              for (let i = 0; i < outputSamples; i++) {
                // Linear interpolation for resampling
                const sourceIndex = i / resampleRatio;
                const lowerIndex = Math.floor(sourceIndex);
                const upperIndex = Math.min(lowerIndex + 1, inputSamples - 1);
                const fraction = sourceIndex - lowerIndex;
                
                // Get samples from PCM data
                const lowerSample = lowerIndex < inputSamples ? view.getInt16(lowerIndex * 2, true) / 32768.0 : 0;
                const upperSample = upperIndex < inputSamples ? view.getInt16(upperIndex * 2, true) / 32768.0 : 0;
                
                // Linear interpolation
                const interpolatedSample = lowerSample + (upperSample - lowerSample) * fraction;
                channelData[i] = interpolatedSample;
                
                // Track min/max for debugging
                maxSample = Math.max(maxSample, interpolatedSample);
                minSample = Math.min(minSample, interpolatedSample);
                
                // Count non-zero samples
                if (Math.abs(interpolatedSample) > 0.0001) {
                  nonZeroSamples++;
                }
              }
              
              console.log('🔊 Audio data range:', { minSample, maxSample, nonZeroSamples, totalSamples: outputSamples });
              
              // Check if audio is just silence
              if (nonZeroSamples === 0) {
                console.log('⚠️ WARNING: Audio data appears to be all zeros (silence)');
                // Fallback to TTS
                speak(`Olá! Aqui está uma piada para você: ${data.joke}`);
                return;
              }
              
              // Calculate dynamic volume boost based on audio level
              const maxAbsValue = Math.max(Math.abs(maxSample), Math.abs(minSample));
              const volumeBoost = maxAbsValue < 0.01 ? 100.0 : (maxAbsValue < 0.1 ? 50.0 : 20.0);
              
              console.log('🔊 Volume boost calculated:', { maxAbsValue, volumeBoost });
              
              // Apply volume boost to all samples
              for (let i = 0; i < outputSamples; i++) {
                channelData[i] = Math.min(0.95, Math.max(-0.95, channelData[i] * volumeBoost));
              }
              
              // Log some sample values after boost for debugging
              console.log('🔊 Sample values after boost:', {
                first10: Array.from(channelData.slice(0, 10)),
                last10: Array.from(channelData.slice(-10)),
                maxAfterBoost: Math.max(...channelData),
                minAfterBoost: Math.min(...channelData)
              });
              
              // Create and play audio
              const source = audioContext.createBufferSource();
              source.buffer = audioBuffer;
              
              // Add gain control for additional volume
              const gainNode = audioContext.createGain();
              gainNode.gain.value = 1.0; // Normal gain since we already boosted samples
              
              source.connect(gainNode);
              gainNode.connect(audioContext.destination);
              
              source.start();
              console.log('🔊 PCM audio playback started successfully');
              
              // Debug: Check if audio is actually playing
              setTimeout(() => {
                console.log('🔊 Audio context state after 100ms:', audioContext.state);
                console.log('🔊 Current time:', audioContext.currentTime);
              }, 100);
              
              // Test: Generate a simple sine wave to verify audio system works
              source.onended = () => {
                console.log('🎵 PCM audio playback completed');
                
                // Generate a test sine wave after PCM audio ends
                setTimeout(() => {
                  const testContext = new AudioContext();
                  if (testContext.state === 'suspended') {
                    testContext.resume();
                  }
                  
                  const testBuffer = testContext.createBuffer(1, testContext.sampleRate * 0.5, testContext.sampleRate);
                  const testData = testBuffer.getChannelData(0);
                  
                  // Generate a 440Hz sine wave
                  for (let i = 0; i < testData.length; i++) {
                    testData[i] = Math.sin(2 * Math.PI * 440 * i / testContext.sampleRate) * 0.3;
                  }
                  
                  const testSource = testContext.createBufferSource();
                  testSource.buffer = testBuffer;
                  testSource.connect(testContext.destination);
                  testSource.start();
                  
                  console.log('🔊 Test sine wave played after PCM audio');
                }, 500);
              };
              
            } catch (error) {
              console.error('❌ PCM audio processing failed:', error);
              // Fallback to TTS
              speak(`Olá! Aqui está uma piada para você: ${data.joke}`);
            }
            
          } else if (mimeType && mimeType.includes('audio/')) {
            // Try regular audio formats (mp3, wav, etc.)
            console.log('🎵 Processing regular audio format...');
            
            const audioBlob = new Blob([Uint8Array.from(atob(base64Data), c => c.charCodeAt(0))], { type: mimeType });
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);
            
            // Set volume and ensure audio is audible
            audio.volume = 1.0;
            audio.preload = 'auto';
            
            audio.onloadeddata = () => {
              console.log('🔊 Audio loaded, attempting to play...');
              console.log('🔊 Audio duration:', audio.duration);
              console.log('🔊 Audio ready state:', audio.readyState);
              
              const playPromise = audio.play();
              if (playPromise !== undefined) {
                playPromise
                  .then(() => {
                    console.log('🎵 Audio playback started successfully');
                  })
                  .catch(error => {
                    console.error('❌ Audio play failed:', error);
                    // Fallback to TTS
                    speak(`Olá! Aqui está uma piada para você: ${data.joke}`);
                  });
              }
            };
            
            audio.onerror = (error) => {
              console.error('❌ Audio element failed:', error);
              // Fallback to TTS
              speak(`Olá! Aqui está uma piada para você: ${data.joke}`);
            };
            
            audio.onended = () => {
              URL.revokeObjectURL(audioUrl);
              console.log('🎵 Audio playback completed');
            };
            
          } else {
            // Fallback to PCM decoding
            console.log('🎵 Trying PCM audio decoding...');
            const binaryData = atob(base64Data);
            const arrayBuffer = new ArrayBuffer(binaryData.length);
            const uint8Array = new Uint8Array(arrayBuffer);
            
            for (let i = 0; i < binaryData.length; i++) {
              uint8Array[i] = binaryData.charCodeAt(i);
            }
            
            // Try Web Audio API with different sample rates
            const audioContext = new AudioContext();
            
            // Ensure audio context is running
            if (audioContext.state === 'suspended') {
              await audioContext.resume();
            }
            
            // First try decoding as a complete audio file
            audioContext.decodeAudioData(arrayBuffer.slice(0))
              .then(audioBuffer => {
                console.log('🔊 Audio decoded successfully, playing...');
                console.log('🔊 Audio buffer duration:', audioBuffer.duration);
                console.log('🔊 Audio buffer channels:', audioBuffer.numberOfChannels);
                console.log('🔊 Audio buffer sample rate:', audioBuffer.sampleRate);
                
                const source = audioContext.createBufferSource();
                source.buffer = audioBuffer;
                
                // Create a gain node to control volume
                const gainNode = audioContext.createGain();
                gainNode.gain.value = 1.0;
                
                source.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                source.onended = () => {
                  console.log('🎵 Web Audio playback completed');
                };
                
                source.start();
                console.log('🎵 Web Audio playback started');
              })
              .catch(error => {
                console.log('❌ Audio decoding failed, trying PCM...', error);
                
                // Fallback to PCM interpretation
                const sampleRate = 24000;
                const samples = arrayBuffer.byteLength / 2;
                console.log('🔊 PCM samples:', samples, 'Sample rate:', sampleRate);
                
                if (samples > 0) {
                  const audioBuffer = audioContext.createBuffer(1, samples, sampleRate);
                  const channelData = audioBuffer.getChannelData(0);
                  
                  const view = new DataView(arrayBuffer);
                  for (let i = 0; i < samples; i++) {
                    const sample = view.getInt16(i * 2, true);
                    channelData[i] = sample / 32768.0;
                  }
                  
                  const source = audioContext.createBufferSource();
                  source.buffer = audioBuffer;
                  
                  // Create a gain node to control volume
                  const gainNode = audioContext.createGain();
                  gainNode.gain.value = 1.0;
                  
                  source.connect(gainNode);
                  gainNode.connect(audioContext.destination);
                  
                  source.onended = () => {
                    console.log('🎵 PCM audio playback completed');
                  };
                  
                  source.start();
                  console.log('🔊 PCM audio playback started');
                } else {
                  console.error('❌ No PCM samples to play');
                  speak(`Olá! Aqui está uma piada para você: ${data.joke}`);
                }
              });
          }
          
        } catch (error) {
          console.error('❌ Audio playback failed:', error);
          // Fallback to TTS
          speak(`Olá! Aqui está uma piada para você: ${data.joke}`);
        }
      } else {
        console.log('📢 Using TTS fallback for joke delivery');
        // Use speech synthesis for voice delivery
        speak(`Olá! Aqui está uma piada para você: ${data.joke}`);
      }
    },
    onError: () => {
      toast({
        title: "Ops!",
        description: "Não consegui pensar em uma piada agora. Tenta de novo!",
        variant: "destructive",
      });
    },
  });

  const handleJokeClick = () => {
    setIsAnimating(true);
    tellJokeMutation.mutate();
    setTimeout(() => setIsAnimating(false), 2000);
  };

  useEffect(() => {
    // Animate avatar periodically
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 1000);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="bg-gradient-to-br from-white/95 to-pink-50/80 backdrop-blur-sm shadow-2xl border-2 border-pink-200/50 rounded-3xl overflow-hidden">
      <CardContent className="p-6 sm:p-8 text-center relative">
        {/* Decorative background elements */}
        <div className="absolute top-4 right-4 w-12 h-12 bg-yellow-200/30 rounded-full blur-lg"></div>
        <div className="absolute bottom-4 left-4 w-8 h-8 bg-purple-200/30 rounded-full blur-lg"></div>
        <div className="absolute top-1/2 left-8 w-6 h-6 bg-pink-200/30 rounded-full blur-lg"></div>
        <div className="relative inline-block">
          {/* Lele Main Avatar Image */}
          <div className="w-64 h-64 sm:w-80 sm:h-80 mx-auto mb-8 sm:mb-12 relative">
            <motion.div
              animate={isAnimating ? {
                y: [-5, 5, -5],
                rotate: [0, 1, -1, 0],
                scale: [1, 1.02, 1]
              } : {
                y: [0, -3, 0],
                rotate: [0, 0.5, -0.5, 0]
              }}
              transition={{
                y: { 
                  repeat: Infinity, 
                  duration: 3,
                  ease: "easeInOut"
                },
                rotate: {
                  repeat: Infinity,
                  duration: 4,
                  ease: "easeInOut"
                },
                scale: {
                  repeat: isAnimating ? 3 : Infinity,
                  duration: isAnimating ? 0.5 : 2,
                  ease: "easeInOut"
                }
              }}
              className="w-full h-full relative"
            >
              <img 
                src="/lele-main.png" 
                alt="Lele - Sua amiga AI" 
                className="w-full h-full object-contain rounded-2xl shadow-2xl bg-gradient-to-br from-orange-100 via-pink-50 to-blue-100"
              />
              
              {/* Glowing border effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-pink-300 via-purple-300 to-blue-300 opacity-20 blur-md"></div>
              
              {/* Sparkle effects around the image */}
              <motion.div
                animate={{
                  rotate: 360,
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  rotate: { repeat: Infinity, duration: 10, ease: "linear" },
                  scale: { repeat: Infinity, duration: 2, ease: "easeInOut" }
                }}
                className="absolute -top-4 -right-4 w-8 h-8 text-yellow-400 text-2xl"
              >
                ✨
              </motion.div>
              
              <motion.div
                animate={{
                  rotate: -360,
                  scale: [1, 1.3, 1],
                }}
                transition={{
                  rotate: { repeat: Infinity, duration: 8, ease: "linear" },
                  scale: { repeat: Infinity, duration: 2.5, ease: "easeInOut" }
                }}
                className="absolute -bottom-2 -left-2 w-6 h-6 text-pink-400 text-xl"
              >
                ⭐
              </motion.div>
              
              <motion.div
                animate={{
                  rotate: 360,
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  rotate: { repeat: Infinity, duration: 12, ease: "linear" },
                  scale: { repeat: Infinity, duration: 3, ease: "easeInOut" }
                }}
                className="absolute top-4 -left-4 w-5 h-5 text-purple-400 text-lg"
              >
                💫
              </motion.div>
            </motion.div>
          </div>
          
          {/* Avatar Status */}
          <div className="mb-6">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent mb-3"
            >
              Olá, Helena! 👋
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-lg sm:text-xl text-gray-700 px-2 font-medium"
            >
              {currentEmotion === "excited" ? "Estou super animada hoje! ✨" :
               currentEmotion === "thinking" ? "Estou pensando em algo legal... 🤔" :
               currentEmotion === "surprised" ? "Uau! Que interessante! 😮" :
               "Estou muito feliz hoje! O que vamos fazer? 😊"}
            </motion.p>
          </div>
          
          {/* Quick Actions */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-6 mb-6 px-4"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                className="px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600 text-white rounded-2xl font-bold transition-all shadow-xl text-base sm:text-lg border-2 border-white"
                onClick={() => {
                  setEmotion("excited");
                  document.querySelector('[data-section="chat"]')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                💬 Conversar
              </Button>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                className="px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-800 rounded-2xl font-bold transition-all shadow-xl text-base sm:text-lg border-2 border-white"
                onClick={handleJokeClick}
                disabled={tellJokeMutation.isPending}
              >
                {tellJokeMutation.isPending ? "🤔 Pensando..." : "😄 Piada"}
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </CardContent>
    </Card>
  );
}
