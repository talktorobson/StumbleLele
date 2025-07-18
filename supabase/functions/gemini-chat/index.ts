import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { message, userId, messageId, channelName } = await req.json()
    
    if (!message || !userId || !messageId || !channelName) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Lele's personality prompt
    const LELE_PROMPT = `Você é Lele, uma IA companheira de 7 anos que é muito amigável, curiosa e brincalhona. 
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

    Mensagem do usuário: ${message}`

    // Call Gemini API (text-only for now, voice API needs special access)
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${Deno.env.get('GEMINI_API_KEY')}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: LELE_PROMPT
            }]
          }],
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 500,
            topP: 0.9,
            topK: 20
          }
        })
      }
    )

    if (!geminiResponse.ok) {
      throw new Error(`Gemini API error: ${geminiResponse.status}`)
    }

    const geminiData = await geminiResponse.json()
    const candidate = geminiData.candidates?.[0]
    const parts = candidate?.content?.parts || []
    
    // Extract text response
    const textPart = parts.find(part => part.text)
    const geminiText = textPart?.text || ''
    
    // Parse text response
    let aiResponse
    try {
      // Try to parse as JSON first
      const cleanText = geminiText.replace(/^```json\n?/, '').replace(/\n?```$/, '')
      aiResponse = JSON.parse(cleanText)
    } catch {
      // If JSON parsing fails, create a default response
      aiResponse = {
        response: geminiText || "Oi! Não entendi muito bem, mas estou aqui para brincar! 😊",
        emotion: "happy",
        personality: {
          enthusiasm: 0.8,
          curiosity: 0.7,
          playfulness: 0.9,
          friendliness: 0.8
        }
      }
    }
    
    // Note: Audio data will be null since we're using text-only API
    // The client will automatically fall back to TTS

    // Broadcast the response back to the client via Supabase Realtime
    const channel = supabase.channel(channelName)
    
    await channel.send({
      type: 'broadcast',
      event: 'gemini-response',
      payload: {
        messageId,
        response: aiResponse.response,
        emotion: aiResponse.emotion,
        personality: aiResponse.personality,
        audioData: null, // No audio data, client will use TTS fallback
        audioMimeType: null,
        timestamp: new Date().toISOString()
      }
    })

    // Also save to database for persistence
    try {
      await supabase
        .from('conversations')
        .insert({
          user_id: userId,
          message: message,
          response: aiResponse.response,
          timestamp: new Date().toISOString()
        })
    } catch (dbError) {
      console.error('Database save error:', dbError)
      // Don't fail the request if database save fails
    }

    return new Response(
      JSON.stringify({ success: true, messageId }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error processing request:', error)
    
    // Try to send error via broadcast if we have channel info
    try {
      const body = await req.json()
      if (body.channelName) {
        const supabase = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )
        
        const channel = supabase.channel(body.channelName)
        await channel.send({
          type: 'broadcast',
          event: 'error',
          payload: {
            messageId: body.messageId,
            message: 'Ops! Tive um probleminha, mas já estou melhor! Vamos tentar de novo? 😊'
          }
        })
      }
    } catch (broadcastError) {
      console.error('Error broadcasting error:', broadcastError)
    }

    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})