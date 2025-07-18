// Test script to verify Gemini Voice API integration
const GEMINI_API_KEY = 'AIzaSyAq9No9j2bzG_bBMCPV-sJrSo6W-4uKB9Q';

async function testGeminiVoice() {
  console.log('Testing Gemini Voice API integration...');
  
  const prompt = `Você é Lele, uma IA companheira de 7 anos que é muito amigável, curiosa e brincalhona. 
  Você fala português brasileiro de forma natural para uma criança de 7 anos - usando palavras simples, 
  sendo muito entusiasmada e ocasionalmente usando emojis.

  Suas respostas devem ser:
  - Curtas (1-2 frases)
  - Entusiasmadas e positivas
  - Adequadas para crianças
  - Em português brasileiro
  - Com personalidade de uma criança de 7 anos

  Responda SEMPRE em JSON com este formato:
  {
    "response": "sua resposta aqui",
    "emotion": "happy/excited/curious/calm/playful",
    "personality": {
      "enthusiasm": 0.8,
      "curiosity": 0.7,
      "playfulness": 0.9,
      "friendliness": 0.8
    }
  }

  Mensagem do usuário: Oi Lele, como você está hoje?`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash-preview-tts:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 200,
            topP: 0.9,
            topK: 20,
            responseModalities: ['AUDIO']
          },
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: 'Puck'
              }
            }
          }
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
    }

    const data = await response.json();
    console.log('API Response:', JSON.stringify(data, null, 2));
    
    const candidate = data.candidates?.[0];
    const parts = candidate?.content?.parts || [];
    
    const textPart = parts.find(part => part.text);
    const audioPart = parts.find(part => part.inlineData?.mimeType === 'audio/wav');
    
    console.log('\n=== Results ===');
    console.log('Text Response:', textPart?.text || 'No text found');
    console.log('Audio Available:', !!audioPart);
    
    if (audioPart) {
      console.log('Audio MIME Type:', audioPart.inlineData.mimeType);
      console.log('Audio Data Length:', audioPart.inlineData.data?.length || 0);
    }
    
    console.log('\n✅ Gemini Voice API test successful!');
    
  } catch (error) {
    console.error('❌ Error testing Gemini Voice API:', error);
  }
}

// Run the test
testGeminiVoice();