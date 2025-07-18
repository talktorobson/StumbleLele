# Plan to Complete Gemini Live Integration

## Goal
Complete the transition to Gemini Live as the sole AI provider for StumbleLele, with real-time voice and text chat capabilities.

## Current Issues
1. Backend `/api/chat` endpoint still exists (redundant)
2. No conversation persistence with Gemini Live
3. Multi-AI model selector creates confusion
4. WebSocket message format needs fixes

## Implementation Steps

### Step 1: Fix WebSocket Communication (Priority: HIGH)
**File**: `client/src/hooks/use-gemini-live.ts`

**Changes**:
- Fix the message format for text messages (current format incorrect)
- Ensure proper audio streaming for voice responses
- Add proper error recovery for connection drops

### Step 2: Remove Backend Chat Logic (Priority: HIGH)
**File**: `api/index.ts`

**Changes**:
- Remove the `/chat` endpoint handler
- Remove AI client initializations (OpenAI, XAI, Anthropic)
- Remove `generateResponse` function
- Keep only user, conversation storage, and other non-chat endpoints

### Step 3: Add Conversation Persistence (Priority: HIGH)
**File**: `client/src/components/chat.tsx`

**Changes**:
- Add mutation to save conversations to database after each exchange
- Load conversation history on component mount
- Pass last 5 conversations as context to Gemini Live

### Step 4: Remove Multi-AI Support (Priority: MEDIUM)
**Files**: Multiple components

**Changes**:
- Remove AI model selector component
- Remove `preferred_ai` field usage
- Update user settings to remove AI selection
- Simplify to Gemini Live only

### Step 5: Update UI/UX (Priority: LOW)
**Files**: `client/src/components/chat.tsx`, navigation components

**Changes**:
- Remove references to multiple AI providers
- Update help text to mention Gemini Live
- Ensure consistent experience

## Technical Details

### Correct WebSocket Message Format
```javascript
// For text input
{
  "client_content": {
    "turns": [{
      "role": "user",
      "parts": [{
        "text": "message content"
      }]
    }],
    "turn_complete": true
  }
}

// For audio input
{
  "realtime_input": {
    "media_chunks": [{
      "mime_type": "audio/pcm",
      "data": "base64_audio_data"
    }]
  }
}
```

### Conversation Storage
```javascript
// After receiving Gemini response
const savedConversation = await saveConversationMutation.mutateAsync({
  userId,
  message: userMessage,
  response: geminiResponse
});
```

## Success Criteria
1. All chat interactions go through Gemini Live WebSocket
2. Conversations are persisted in database
3. Voice and text chat work seamlessly
4. No references to other AI providers
5. Clean, simple user experience

## Testing Checklist
- [ ] Text message sends and receives response
- [ ] Voice input captures and gets response
- [ ] Conversations save to database
- [ ] History loads on page refresh
- [ ] Connection recovers from drops
- [ ] Error states handled gracefully

## Notes
- Keep it simple - one AI provider, one chat interface
- No mocks, no TTS workarounds - use real Gemini Live features
- Focus on reliability over features