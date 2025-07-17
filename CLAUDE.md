# CLAUDE.md - StumbleLele Project Instructions

This file provides specific guidance for Claude Code when working on the StumbleLele project.

## Project Overview
StumbleLele is an interactive AI companion application for children, featuring Lele - a friendly 7-year-old AI character who speaks Portuguese and provides educational entertainment through chat, games, and interactive activities.

## Current Project Status

### ✅ Working Features
- **Multi-AI Chat System**: Supports Google Gemini (default), OpenAI GPT-4, XAI Grok, and Anthropic Claude
- **AI Model Selector**: User-friendly interface to switch between AI providers with real-time updates
- **Avatar System**: High-quality cartoon-style main avatar with new image asset + animated floating avatar
- **Joke Generation**: AI-powered joke telling feature with emotion-based responses
- **Memory System**: Stores conversations and creates contextual memories
- **Friend Management**: Basic CRUD operations for virtual friends
- **Progress Tracking**: Records game scores and achievements
- **Voice Input**: Browser-based speech recognition with iOS compatibility
- **Voice Synthesis**: Female voice selection with emotion-based variations and iOS audio fixes
- **Responsive UI**: Mobile-friendly interface optimized for iPhone and Android devices
- **Enhanced Navigation**: Clean bottom navigation with emoji labels (removed duplicate icons)
- **Cosmic Blaster Game**: Complete 1945 Air Force-style space shooter with:
  - Touch-drag movement controls (mobile-first design)
  - Automatic continuous shooting with 6-level weapon progression
  - Balanced 10-wave campaign with progressive difficulty
  - Power-up system (health, shields, weapons, helpers)
  - Boss battles and special attacks
  - Real-time HUD with health, score, wave, and weapon level

### 🚧 Features In Development
- **Additional Games**: Memory, word, and math games need implementation
- **Enhanced Voice**: Custom voice models for more natural speech

### 🔧 Technical Stack
- Frontend: React + TypeScript + Vite + TailwindCSS + shadcn/ui
- Backend: Vercel Serverless Functions + TypeScript
- AI: Google Gemini 2.5 Flash (default), OpenAI GPT-4o, XAI Grok-2, Anthropic Claude
- Database: PostgreSQL with Drizzle ORM (Supabase transaction pooler)
- Deployment: Vercel (production) + port 5000 (local development)

## Development Guidelines

### Code Style
- **Components**: Use functional React components with TypeScript
- **Styling**: TailwindCSS classes with custom Lele theme colors
- **API Routes**: RESTful endpoints with proper error handling
- **State Management**: TanStack Query for server state
- **Naming**: camelCase for functions/variables, PascalCase for components

### Lele Character Guidelines
- **Personality**: Enthusiastic, curious, playful, and friendly
- **Language**: Brazilian Portuguese, child-appropriate
- **Age**: 7 years old, speaks like a smart child
- **Responses**: Short, energetic, with occasional emojis
- **Avatar**: High-quality cartoon girl with long brown hair, blue dress with bow pattern, expressive eyes
- **Floating Avatar**: SVG-based animated version with longer hair matching main character style

### API Integration
- **Multi-AI Support**: Google Gemini (primary), OpenAI GPT-4o, XAI Grok-2, Anthropic Claude
- **Model Selection**: Users can switch AI providers via UI with real-time preference updates
- **Error Handling**: Graceful fallbacks for API failures across all providers
- **Rate Limiting**: Consider implementing for production
- **Response Format**: Always includes emotion and personality traits
- **Default Provider**: Google Gemini 2.5 Flash for optimal speed and performance

### Environment Variables
```bash
GEMINI_API_KEY=your_key_here    # Google Gemini API (primary AI)
XAI_API_KEY=your_key_here       # XAI Grok API (alternative)
OPENAI_API_KEY=your_key_here    # OpenAI GPT API (alternative)
ANTHROPIC_API_KEY=your_key_here # Anthropic Claude API (alternative)
DATABASE_URL=postgresql://postgres.vbtfaypcrupztcnbdlmf:PASSWORD@aws-0-sa-east-1.pooler.supabase.com:6543/postgres  # Supabase transaction pooler
```

### Testing Approach
- Test AI responses in Portuguese
- Verify avatar animations match emotions
- Check mobile responsiveness
- Ensure child-friendly content

## Common Tasks

### Adding New Game
1. Create game component in `client/src/components/games/`
2. Add game type to storage schema
3. Implement game logic and scoring
4. Update progress tracking
5. Add AI suggestions for the game

### Modifying Avatar Expressions
1. Edit `client/src/components/lele-avatar.tsx`
2. Update SVG paths for new expressions
3. Add emotion mappings in `useAvatar` hook
4. Test with different emotional states

### Adding New Chat Features
1. Update `api/[...route].ts` with new endpoints
2. Modify AI prompt in `api/lib/ai.ts`
3. Add UI components in `client/src/components/chat.tsx`
4. Update conversation storage logic

### Adding New AI Provider
1. Install AI provider SDK in package.json
2. Add client initialization in `api/lib/ai.ts`
3. Extend `AIModel` type to include new provider
4. Add API call logic in `generateResponse` method
5. Update UI selector in `client/src/components/ai-model-selector.tsx`
6. Add environment variable and documentation

## Important Notes

### Security
- Never commit API keys or sensitive data
- Validate all user inputs
- Sanitize chat messages
- Ensure age-appropriate content

### Performance
- Lazy load game components
- Optimize avatar animations for mobile
- Cache API responses where appropriate
- Minimize re-renders in chat component

### Accessibility
- Maintain ARIA labels for screen readers
- Ensure keyboard navigation works
- Provide visual feedback for all actions
- Support high contrast modes

## Recent Updates (July 17, 2025)

### Avatar System Enhancement v2.8
- **New Main Avatar**: Replaced SVG avatar with high-quality cartoon image asset (`lele-main.png`)
- **Enhanced Floating Avatar**: Updated with longer hair to match main character + blue dress with bow pattern
- **Improved Animations**: Added smooth motion effects, sparkle animations, and glowing borders
- **Better UI Design**: Enhanced main avatar section with gradient backgrounds and motion effects
- **Clean Navigation**: Removed redundant icons from bottom bar, kept only emoji labels
- **Joke Feature**: Added `/api/joke` endpoint with AI-powered joke generation
- **iOS Compatibility**: Fixed voice synthesis and UI layout issues for iPhone users

### UX Improvements v2.7.1
- **Chat Auto-scroll**: Fixed message ordering to show newest at bottom with proper scroll behavior
- **Female Voice**: Enhanced voice selection algorithm prioritizing female voices for iOS and Android
- **Mobile Optimization**: Added iOS-specific meta tags and CSS fixes for better compatibility
- **Audio Initialization**: Implemented user interaction requirement for iOS audio playback

## Previous Updates (July 16, 2025)

### Google Gemini Integration v2.7
- **Primary AI Provider**: Google Gemini 2.5 Flash now default for all new users
- **Multi-AI Architecture**: Complete support for 4 AI providers (Gemini, OpenAI, XAI, Anthropic)
- **User AI Selection**: Interactive UI component allows real-time AI model switching
- **API Integration**: @google/genai package with proper error handling and fallbacks
- **Performance Optimization**: Gemini provides faster responses with maintained quality
- **UI Enhancement**: Added Gem icon with green styling and "Recomendado" label
- **Database Schema**: Updated to reflect Gemini as default preferredAI option
- **API Endpoint**: Created `/api/user/{id}/ai-model` for preference updates

### Vercel Deployment Fixed v2.6
- **Full-Stack Deployment**: Successfully deployed to Vercel with working backend
- **File-Based API Routes**: Converted Express routes to Vercel serverless functions
- **Frontend Build**: Static assets served from dist/public directory
- **Backend API**: Serverless functions in /api directory with 30s timeout
- **Database Integration**: Supabase PostgreSQL working in production environment
- **Deployment Strategy**: Staged approach (static first, then API) resolved complex issues

### Database Configuration Fixed v2.5
- **Supabase Integration**: Successfully configured PostgreSQL connection
- **Transaction Pooler**: Using sa-east-1 region pooler for optimal performance
- **Connection String**: Updated to use transaction mode on port 6543
- **Drizzle ORM**: Schema push working correctly with Supabase
- **Database Operations**: All CRUD operations tested and verified

### Cosmic Blaster Game Balance Improvements v2.4
- **Health System**: Increased starting health from 100 to 150 HP
- **Damage Reduction**: All damage sources reduced by 50-60% for longer gameplay
- **Power-up Improvements**: 
  - More frequent spawns (5s instead of 8s)
  - Health pickups restore 30 HP (was 20 HP)
  - 30% chance for double pickup spawns
  - Weighted distribution favoring health pickups
- **Weapon Progression**: 
  - Extended to 6 levels (was 3)
  - Auto-upgrades every 10 seconds
  - Visual indicator in HUD
- **Campaign Extension**: Game continues to wave 10 before victory
- **Shield Mechanics**: Fixed timer implementation for proper protection

## Deployment Architecture

### Production Deployment (Vercel)
```bash
# Frontend Build
npm run vercel-build  # Builds React app to dist/public

# API Structure (Consolidated)
/api
└── index.ts                   # Single catch-all handler for all endpoints
    ├── /chat                  # AI conversation endpoint
    ├── /joke                  # AI-powered joke generation
    ├── /user/{id}             # User management
    ├── /user/{id}/ai-model    # AI model preference updates
    ├── /conversations/{userId} # Conversation history
    ├── /friends/{userId}      # Friend management
    ├── /memories/{userId}     # Memory storage
    ├── /game/progress/{userId} # Game progress tracking
    └── /avatar/{userId}       # Avatar state management

# Configuration
vercel.json                    # Deployment settings
```

### Local Development
```bash
npm run dev                    # Starts Express server on port 5000
npm run build                  # Full build (frontend + backend)
npm run db:push               # Push database schema
```

### Environment Variables
- **Production**: Set in Vercel dashboard
- **Local**: Use .env file in project root

## Future Enhancements
1. **Additional Games**: Implement memory, word, and math games
2. **Enhanced Voice**: Add emotion-based voice synthesis
3. **Multiplayer**: Allow friends to play together
4. **Parental Controls**: Add parent dashboard
5. **Offline Mode**: Cache responses for offline play
6. **Achievement System**: Badges and rewards
7. **Story Mode**: Interactive storytelling with Lele
8. **Game Improvements**: Add more enemy types, special weapons, and boss varieties

## Debugging Tips
- Check browser console for API errors
- Verify environment variables are loaded
- Test with different Portuguese inputs
- Monitor WebSocket connections for real-time features
- Use React DevTools for component state inspection

## Contact & Support
This is a personal project by Robson Reis. For questions or issues, refer to the GitHub repository.