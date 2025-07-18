# Plan to Integrate Gemini Live AI for Chat and Voice Interaction

This document outlines the plan to transition the existing chat and voice interaction in the StumbleLele application to a fully live, dynamic experience powered by the Gemini Live API. The goal is to enable real-time, direct interaction with the Gemini AI, eliminating mocked conversations and pre-configured responses.

## Current State Overview

*   **AI Chat (`client/src/components/chat.tsx`)**: Uses a backend API (`/api/chat`) for AI responses. Integrates `useSpeech` for basic voice input and TTS.
*   **Friend Chat (`client/src/components/friend-chat.tsx`)**: Simulates conversations with pre-defined responses and stores history in `localStorage`. (This component will remain as is, as it's for simulated friend interaction).
*   **Voice Interaction (`client/src/components/voice-input.tsx`, `client/src/hooks/use-speech.ts`)**:
    *   `useSpeech`: Provides browser-based Speech-to-Text (STT) and Text-to-Speech (TTS) with emotional inflection.
    *   `voice-input.tsx`: A modal component that uses `useSpeech` for voice input.
*   **Gemini Live Integration (`client/src/components/gemini-live-voice.tsx`, `client/src/hooks/use-gemini-live.ts`)**:
    *   `useGeminiLive`: Handles real-time WebSocket connection to the Gemini Live API for continuous audio streaming and AI interaction. It also manages the personality prompt for Lele.
    *   `gemini-live-voice.tsx`: A dedicated UI for the real-time Gemini Live conversation.

## Proposed Changes

The core of this plan is to centralize all AI-driven chat and voice interactions through the `useGeminiLive` hook, making `client/src/components/chat.tsx` the primary interface for real-time AI conversation.

### 1. Integrate `useGeminiLive` into `client/src/components/chat.tsx`

*   **Remove Redundant Logic**:
    *   The existing `useSpeech` hook and its associated `startListening`, `stopListening`, and `speak` calls within `chat.tsx` will be removed.
    *   The `sendMessageMutation` that currently sends text messages to the `/api/chat` backend endpoint will be removed. This backend endpoint will no longer be used for real-time chat.
*   **Import and Initialize `useGeminiLive`**:
    *   The `useGeminiLive` hook will be imported and initialized within the `Chat` component.
*   **Update Text Input Submission**:
    *   The `handleSubmit` function (for sending text messages) will be modified to use `useGeminiLive`'s `sendTextMessage` function instead of the `sendMessageMutation`.
*   **Update Microphone Button Functionality**:
    *   The `handleVoiceInput` function (for voice input) will be updated to call `useGeminiLive`'s `startListening` and `stopListening` methods.
*   **Display AI Responses**:
    *   Lele's responses will be displayed directly from the `transcript` provided by the `useGeminiLive` hook. The audio playback will be handled automatically by `useGeminiLive` as it receives audio streams from the Gemini API.
*   **Conversation History**:
    *   The `conversations` state and its associated `useQuery` for fetching history from `/api/conversations` will need to be re-evaluated. Since Gemini Live is stateless per turn, a new mechanism for storing and retrieving conversation history will be required if persistent history is desired. For the scope of this change, the focus is on live interaction, and history might be limited to the current session or require a new backend integration. (Initial implementation will focus on live interaction, history persistence can be a follow-up).

### 2. Refactor `client/src/components/voice-input.tsx`

*   This component's functionality will be largely superseded by the direct integration of `useGeminiLive` into `chat.tsx`.
*   **Proposed Action**: Remove `client/src/components/voice-input.tsx` to simplify the architecture and avoid redundant voice input mechanisms. The `chat.tsx` component will now handle both text and voice input directly via `useGeminiLive`.

### 3. Adapt "Tell a Joke" Feature

*   The current `speakJoke` function in `useSpeech` relies on client-side logic for sound effects. To maintain this interactive element with Gemini Live:
*   **Keyword Detection**: Logic will be added within the `useGeminiLive` hook (or a new utility function it calls) to detect if Gemini's text response contains keywords indicating a joke (e.g., "piada", "joke", "engraçado").
*   **Trigger Sound Effects**: If a joke is detected, the existing drum sound (`playDrumSound`) and laugh sound (`playLaughSound`) functions (which will be moved from `useSpeech` to a more accessible utility or directly into `useGeminiLive`) will be triggered at appropriate times relative to Gemini's spoken response.

## Benefits of this Approach

*   **Real-time Interaction**: Provides a more natural and engaging conversation flow with Lele.
*   **Simplified Backend**: Eliminates the need for a custom backend endpoint (`/api/chat`) for basic chat interactions, as Gemini Live handles the AI processing directly.
*   **Consistent Voice Experience**: All AI-driven voice interactions will leverage the advanced capabilities and personality configuration of Gemini Live.
*   **Reduced Latency**: Direct streaming to Gemini Live should result in faster response times for voice interactions.

## Dependencies and Considerations

*   **API Key**: Ensure `VITE_GEMINI_API_KEY` is correctly configured and accessible.
*   **Browser Compatibility**: Gemini Live API and WebSockets require modern browser support.
*   **Conversation History**: A separate plan may be needed for persistent conversation history if required beyond the current session, as Gemini Live is stateless per turn.
*   **Error Handling**: Robust error handling for WebSocket connections and Gemini API responses will be crucial.

This plan aims to create a more immersive and dynamic AI companion experience for users of StumbleLele.