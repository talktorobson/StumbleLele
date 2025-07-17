import { useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function GeminiDebug() {
  const [logs, setLogs] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [currentTest, setCurrentTest] = useState<string>('');
  const websocketRef = useRef<WebSocket | null>(null);

  const addLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(`[Gemini Debug] ${message}`);
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  const disconnect = useCallback(() => {
    if (websocketRef.current) {
      websocketRef.current.close();
      websocketRef.current = null;
    }
    setIsConnected(false);
    setCurrentTest('');
  }, []);

  const testConnection = useCallback(async (testName: string, setupMessage: any) => {
    disconnect();
    setCurrentTest(testName);
    addLog(`Starting test: ${testName}`);

    const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      addLog('ERROR: No API key found');
      return;
    }

    try {
      const wsUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${GEMINI_API_KEY}`;
      addLog(`Connecting to: ${wsUrl.split('?')[0]}`);
      
      const ws = new WebSocket(wsUrl);
      websocketRef.current = ws;

      ws.onopen = () => {
        addLog('✅ WebSocket connected');
        setIsConnected(true);
        
        addLog(`Sending setup: ${JSON.stringify(setupMessage, null, 2)}`);
        ws.send(JSON.stringify(setupMessage));
      };

      ws.onmessage = async (event) => {
        if (event.data instanceof Blob) {
          addLog(`📨 Received Blob: ${event.data.size} bytes, type: ${event.data.type}`);
          
          // Try to read as text first
          try {
            const text = await event.data.text();
            addLog(`📝 Blob text content: ${text}`);
            
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
                  }
                }
              }
              
              if (jsonData.setupComplete) {
                addLog('✅ Setup complete');
              }
              
              // Check for error messages
              if (jsonData.error) {
                addLog(`❌ Error: ${jsonData.error.message || jsonData.error}`);
              }
            } catch (e) {
              addLog('❌ Not valid JSON');
            }
          } catch (e) {
            addLog('❌ Failed to read blob as text');
            
            // Try to read as ArrayBuffer (for audio)
            try {
              const arrayBuffer = await event.data.arrayBuffer();
              addLog(`🎵 Audio data: ${arrayBuffer.byteLength} bytes`);
              
              // Try to play the audio
              const audioContext = new AudioContext();
              const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
              const source = audioContext.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(audioContext.destination);
              source.start();
              addLog('🔊 Playing audio response');
            }
            catch (e) {
              addLog('❌ Failed to decode as audio');
            }
          }
        } else {
          addLog(`📨 Received text: ${event.data}`);
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
                }
                if (audioPart) {
                  addLog(`🔊 AUDIO response detected! MIME: ${audioPart.inlineData.mimeType}`);
                }
              }
            }
            
            if (data.setupComplete) {
              addLog('✅ Setup complete');
            }
            
            // Check for error messages
            if (data.error) {
              addLog(`❌ Error: ${data.error.message || data.error}`);
            }
          } catch (e) {
            addLog('❌ Failed to parse message');
          }
        }
      };

      ws.onclose = (event) => {
        addLog(`❌ Disconnected: ${event.code} - ${event.reason}`);
        setIsConnected(false);
        setCurrentTest('');
      };

      ws.onerror = (error) => {
        addLog(`❌ WebSocket error: ${error}`);
        setIsConnected(false);
      };

    } catch (error) {
      addLog(`❌ Connection failed: ${error}`);
    }
  }, [addLog, disconnect]);

  const sendTestMessage = useCallback((message: string) => {
    if (!websocketRef.current || websocketRef.current.readyState !== WebSocket.OPEN) {
      addLog('❌ WebSocket not ready');
      return;
    }

    const messagePayload = {
      clientContent: {
        turns: {
          role: 'user',
          parts: [{ text: message }]
        },
        turnComplete: true
      }
    };

    addLog(`Sending message: ${JSON.stringify(messagePayload, null, 2)}`);
    websocketRef.current.send(JSON.stringify(messagePayload));
  }, [addLog]);

  const runAllTests = useCallback(async () => {
    clearLogs();
    addLog('🚀 Running all tests systematically...');
    
    const testConfigs = [
      {
        name: 'Test 1: Minimal Setup',
        setup: {
          setup: {
            model: 'models/gemini-2.0-flash-exp'
          }
        }
      },
      {
        name: 'Test 2: With Generation Config',
        setup: {
          setup: {
            model: 'models/gemini-2.0-flash-exp',
            generationConfig: {
              responseModalities: ['TEXT']
            }
          }
        }
      },
      {
        name: 'Test 3: Audio Model',
        setup: {
          setup: {
            model: 'models/gemini-2.0-flash-exp'
          }
        }
      },
      {
        name: 'Test 4: Audio Config',
        setup: {
          setup: {
            model: 'models/gemini-2.0-flash-exp',
            generationConfig: {
              responseModalities: ['AUDIO']
            }
          }
        }
      },
      {
        name: 'Test 5: Native Audio Model',
        setup: {
          model: 'models/gemini-2.5-flash-preview-native-audio-dialog',
          audioConfig: {
            audioEncoding: 'LINEAR16',
            sampleRateHertz: 24000
          }
        }
      },
      {
        name: 'Test 6: Live Model',
        setup: {
          setup: {
            model: 'models/gemini-live-2.5-flash-preview'
          }
        }
      },
      {
        name: 'Test 7: Gemini 2.0 Audio',
        setup: {
          setup: {
            model: 'models/gemini-2.0-flash-exp',
            generationConfig: {
              responseModalities: ['AUDIO']
            }
          }
        }
      },
      {
        name: 'Test 8: Gemini Live',
        setup: {
          setup: {
            model: 'models/gemini-live-2.5-flash-preview',
            generationConfig: {
              responseModalities: ['AUDIO']
            }
          }
        }
      }
    ];
    
    for (let i = 0; i < testConfigs.length; i++) {
      const test = testConfigs[i];
      addLog(`\n=== Starting ${test.name} ===`);
      
      // Test connection
      await testConnection(test.name, test.setup);
      
      // Wait for connection to establish
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Send test message if connected
      if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
        sendTestMessage('Teste de áudio');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      disconnect();
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    addLog('\n🏁 All tests completed!');
  }, [clearLogs, addLog, testConnection, sendTestMessage, disconnect]);

  const tests = [
    {
      name: 'Test 1: Minimal Setup',
      setup: {
        setup: {
          model: 'models/gemini-2.0-flash-exp'
        }
      }
    },
    {
      name: 'Test 2: With Generation Config',
      setup: {
        setup: {
          model: 'models/gemini-2.0-flash-exp',
          generationConfig: {
            responseModalities: ['TEXT']
          }
        }
      }
    },
    {
      name: 'Test 3: Audio Model',
      setup: {
        setup: {
          model: 'models/gemini-2.0-flash-exp'
        }
      }
    },
    {
      name: 'Test 4: Audio Config',
      setup: {
        setup: {
          model: 'models/gemini-2.0-flash-exp',
          generationConfig: {
            responseModalities: ['AUDIO']
          }
        }
      }
    },
    {
      name: 'Test 5: Native Audio Model',
      setup: {
        model: 'models/gemini-2.5-flash-preview-native-audio-dialog',
        audioConfig: {
          audioEncoding: 'LINEAR16',
          sampleRateHertz: 24000
        }
      }
    },
    {
      name: 'Test 6: Live Model',
      setup: {
        setup: {
          model: 'models/gemini-live-2.5-flash-preview'
        }
      }
    },
    {
      name: 'Test 7: Gemini 2.0 Audio',
      setup: {
        setup: {
          model: 'models/gemini-2.0-flash-exp',
          generationConfig: {
            responseModalities: ['AUDIO']
          }
        }
      }
    },
    {
      name: 'Test 8: Gemini Live',
      setup: {
        setup: {
          model: 'models/gemini-live-2.5-flash-preview',
          generationConfig: {
            responseModalities: ['AUDIO']
          }
        }
      }
    }
  ];

  return (
    <div className="fixed top-4 right-4 w-96 max-h-96 bg-white border rounded-lg shadow-lg z-50 overflow-hidden">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Gemini Live Debug</CardTitle>
          <div className="flex gap-2">
            <Button size="sm" onClick={clearLogs}>Clear</Button>
            <Button size="sm" onClick={disconnect} disabled={!isConnected}>
              Disconnect
            </Button>
            <Button size="sm" onClick={runAllTests} disabled={isConnected}>
              Run All
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-xs">
            Status: {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
            {currentTest && ` - ${currentTest}`}
          </div>
          
          <div className="grid grid-cols-2 gap-1">
            {tests.map((test, i) => (
              <Button
                key={i}
                size="sm"
                variant="outline"
                className="text-xs"
                onClick={() => testConnection(test.name, test.setup)}
                disabled={isConnected}
              >
                {test.name}
              </Button>
            ))}
          </div>

          {isConnected && (
            <div className="space-y-1">
              <Button
                size="sm"
                className="w-full"
                onClick={() => sendTestMessage('Hello, can you hear me?')}
              >
                Send Test Message
              </Button>
              <Button
                size="sm"
                className="w-full"
                onClick={() => sendTestMessage('Conte uma piada em português')}
              >
                Send Portuguese Joke Request
              </Button>
            </div>
          )}

          <div className="text-xs bg-gray-100 p-2 rounded max-h-32 overflow-y-auto">
            {logs.map((log, i) => (
              <div key={i} className="font-mono text-xs">{log}</div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}