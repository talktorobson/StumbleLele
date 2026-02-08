# StumbleLele — AI Companion for Kids

Inherits: `personal/CLAUDE.md`

## Overview

Interactive AI companion for Brazilian children aged 8-11, featuring Lele — a friendly 7-year-old character who speaks Portuguese. Chat, games, voice interaction, and a friends messaging system.

## Stack

- Frontend: React + TypeScript + Vite + TailwindCSS + shadcn/ui + Framer Motion
- Backend: Vercel Serverless Functions + Zod validation
- AI: Gemini Live (voice), Gemini 2.5 Flash (default), OpenAI GPT-4o, XAI Grok-2, Claude
- DB: PostgreSQL + Drizzle ORM (Supabase), Real-time via Supabase WebSocket
- Auth: JWT + Supabase Auth + RLS
- Voice: Gemini Live with Leda voice (Brazilian Portuguese)

## Commands

```bash
npm run dev                    # Express server on port 5050
npm run build                  # Full build
npm run db:push                # Push database schema
npm run vercel-build           # Vercel production build
```

## Lele Character Guidelines

- **Personality**: Enthusiastic, curious, playful, friendly
- **Language**: Brazilian Portuguese, child-appropriate but smart
- **Age**: 7 years old, speaks like a smart child
- **Responses**: Short, energetic, girl-focused ("amiguinha", "gatinha")
- **Voice**: Female Brazilian Portuguese (Leda voice via Gemini Live)
- **Jokes**: Brazilian trocadilhos with drum & bass sound effects, emoji-free voice

## Key Features

- Multi-AI chat with model selector
- Real-time friends chat (WhatsApp-like, <45ms latency)
- Gemini Live voice with Leda voice config
- Cosmic Blaster game (touch-drag, 10-wave campaign)
- Memory system + progress tracking

## API Structure

Single catch-all handler at `/api/index.ts` routing to: `/chat`, `/joke`, `/user/{id}`, `/conversations/{userId}`, `/friends/{userId}`, `/memories/{userId}`, `/game/progress/{userId}`

## Environment Variables

`GEMINI_API_KEY`, `VITE_GEMINI_API_KEY`, `XAI_API_KEY`, `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `DATABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
