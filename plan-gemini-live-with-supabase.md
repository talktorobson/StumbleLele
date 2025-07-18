# Plan: Gemini Live Integration Using Supabase Realtime

## Solution: Use Supabase Realtime as WebSocket Bridge

Since Vercel doesn't support WebSockets but **Supabase is officially recommended by Vercel** for real-time features, we can use Supabase Realtime to enable live chat with Gemini.

## Architecture Overview

```
Client (Browser)
    ↓ WebSocket
Supabase Realtime (Broadcast Channel)
    ↓ Database Trigger / Edge Function
Supabase Edge Function
    ↓ HTTPS
Gemini API
    ↓ Response
Back through Supabase Realtime to Client
```

## Implementation Steps

### Step 1: Set Up Supabase Realtime Channel
Create a dedicated channel for live chat communication.

```typescript
// client/src/hooks/use-supabase-gemini-live.ts
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export function useSupabaseGeminiLive(userId: number) {
  const channel = supabase
    .channel(`gemini-chat-${userId}`)
    .on('broadcast', { event: 'gemini-response' }, (payload) => {
      // Handle Gemini's response
      console.log('Received:', payload)
    })
    .subscribe()

  const sendMessage = async (message: string) => {
    await channel.send({
      type: 'broadcast',
      event: 'user-message',
      payload: { message, userId }
    })
  }

  return { sendMessage, channel }
}
```

### Step 2: Create Supabase Edge Function
Deploy an Edge Function to handle Gemini API calls.

```typescript
// supabase/functions/gemini-chat/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const { message, userId, channelName } = await req.json()
  
  // Initialize Supabase client
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )
  
  // Call Gemini API
  const geminiResponse = await fetch('https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash-exp:generateContent', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': Deno.env.get('GEMINI_API_KEY')!
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: `You are Lele... ${message}`
        }]
      }]
    })
  })
  
  const data = await geminiResponse.json()
  
  // Broadcast response back to client
  await supabase
    .channel(channelName)
    .send({
      type: 'broadcast',
      event: 'gemini-response',
      payload: {
        response: data.candidates[0].content.parts[0].text,
        timestamp: new Date().toISOString()
      }
    })
  
  return new Response('OK', { status: 200 })
})
```

### Step 3: Update Chat Component
Modify chat.tsx to use Supabase Realtime instead of direct WebSocket.

```typescript
// client/src/components/chat.tsx
import { useSupabaseGeminiLive } from '@/hooks/use-supabase-gemini-live'

export default function Chat({ userId }: ChatProps) {
  const { sendMessage } = useSupabaseGeminiLive(userId)
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim()) {
      await sendMessage(message.trim())
      setMessage('')
    }
  }
  
  // Rest of component...
}
```

### Step 4: Voice Features (Browser-Based)
Since we're using Supabase for WebSocket communication, we can still implement voice features using browser APIs:

```typescript
// Voice input using Web Speech API
const recognition = new (window as any).webkitSpeechRecognition()
recognition.lang = 'pt-BR'
recognition.onresult = (event: any) => {
  const transcript = event.results[0][0].transcript
  sendMessage(transcript)
}

// Voice output using Speech Synthesis
const speak = (text: string) => {
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'pt-BR'
  utterance.voice = speechSynthesis.getVoices().find(v => v.lang.includes('pt-BR') && v.name.includes('female'))
  speechSynthesis.speak(utterance)
}
```

## Advantages of This Approach

1. ✅ **Works on Vercel** - Uses Supabase as recommended by Vercel
2. ✅ **Real WebSockets** - True real-time communication
3. ✅ **Scalable** - Supabase handles WebSocket infrastructure
4. ✅ **Simple Integration** - Uses existing Supabase setup
5. ✅ **No Additional Cost** - Included in Supabase plan
6. ✅ **Voice Support** - Browser APIs for speech

## Database Schema Update (Optional)
Store chat messages for persistence:

```sql
CREATE TABLE chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id INTEGER NOT NULL,
  message TEXT NOT NULL,
  response TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Realtime
ALTER TABLE chat_messages REPLICA IDENTITY FULL;
```

## Deployment Steps

1. Deploy Supabase Edge Function:
```bash
supabase functions deploy gemini-chat
```

2. Set environment variables in Supabase:
```bash
supabase secrets set GEMINI_API_KEY=your_key_here
```

3. Update client code and deploy to Vercel:
```bash
vercel --prod
```

## Testing Checklist
- [ ] Supabase Realtime connection established
- [ ] Messages sent through broadcast channel
- [ ] Edge Function receives and processes messages
- [ ] Gemini API responds correctly
- [ ] Responses broadcast back to client
- [ ] Voice input captures speech
- [ ] Voice output speaks responses

## Notes
- This approach uses Supabase as a WebSocket proxy
- Edge Functions run on Deno runtime (not Node.js)
- Consider rate limiting for production use
- Monitor Supabase Realtime quotas