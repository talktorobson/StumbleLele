# CLAUDE.md - StumbleLele Project Instructions

This file provides specific guidance for Claude Code when working on the StumbleLele project.

## Project Overview
StumbleLele is an interactive AI companion application for children, featuring Lele - a friendly 7-year-old AI character who speaks Portuguese and provides educational entertainment through chat, games, and interactive activities.

## Current Project Status

### ✅ Working Features
- **AI Chat System**: Fully functional with OpenAI GPT-4 integration
- **Avatar System**: Cartoon-style animated character with dynamic expressions
- **Memory System**: Stores conversations and creates contextual memories
- **Friend Management**: Basic CRUD operations for virtual friends
- **Progress Tracking**: Records game scores and achievements
- **Voice Input**: Browser-based speech recognition
- **Responsive UI**: Mobile-friendly interface with bottom navigation
- **Cosmic Blaster Game**: Complete 1945 Air Force-style space shooter with:
  - Touch-drag movement controls (mobile-first design)
  - Automatic continuous shooting with 6-level weapon progression
  - Balanced 10-wave campaign with progressive difficulty
  - Power-up system (health, shields, weapons, helpers)
  - Boss battles and special attacks
  - Real-time HUD with health, score, wave, and weapon level

### 🚧 Features In Development
- **Additional Games**: Memory, word, and math games need implementation
- **Voice Synthesis**: Limited to browser TTS - needs enhancement

### 🔧 Technical Stack
- Frontend: React + TypeScript + Vite + TailwindCSS + shadcn/ui
- Backend: Vercel Serverless Functions + TypeScript
- AI: XAI Grok-3
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
- **Avatar**: Cartoon girl with brown hair, blue dress, expressive eyes

### API Integration
- **XAI**: Uses Grok-3 with enhanced response handling
- **Error Handling**: Graceful fallbacks for API failures
- **Rate Limiting**: Consider implementing for production
- **Response Format**: Always includes emotion and personality traits

### Environment Variables
```bash
XAI_API_KEY=your_key_here  # Required for AI features
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
1. Update `server/routes.ts` with new endpoints
2. Modify AI prompt in `server/services/openai.ts`
3. Add UI components in `client/src/components/chat.tsx`
4. Update conversation storage logic

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

## Recent Updates (July 16, 2025)

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

# API Structure
/api
├── chat.ts                    # AI conversation endpoint
├── user/[id].ts              # User management
├── conversations/[userId].ts   # Conversation history
└── avatar/[userId].ts         # Avatar state management

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