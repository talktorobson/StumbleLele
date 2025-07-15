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

### 🚧 Features In Development
- **Games**: Currently simulated - need actual game implementations
- **Voice Synthesis**: Limited to browser TTS - needs enhancement
- **Database**: Using in-memory storage - PostgreSQL ready but not configured

### 🔧 Technical Stack
- Frontend: React + TypeScript + Vite + TailwindCSS + shadcn/ui
- Backend: Express.js + TypeScript
- AI: XAI Grok-3
- Database: PostgreSQL with Drizzle ORM (ready but using in-memory fallback)
- Deployment: Configured for port 5000 (Replit/local development)

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
DATABASE_URL=postgresql://...  # Optional, falls back to in-memory
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

## Future Enhancements
1. **Real Games**: Implement memory, word, and math games
2. **Enhanced Voice**: Add emotion-based voice synthesis
3. **Multiplayer**: Allow friends to play together
4. **Parental Controls**: Add parent dashboard
5. **Offline Mode**: Cache responses for offline play
6. **Achievement System**: Badges and rewards
7. **Story Mode**: Interactive storytelling with Lele

## Debugging Tips
- Check browser console for API errors
- Verify environment variables are loaded
- Test with different Portuguese inputs
- Monitor WebSocket connections for real-time features
- Use React DevTools for component state inspection

## Contact & Support
This is a personal project by Robson Reis. For questions or issues, refer to the GitHub repository.