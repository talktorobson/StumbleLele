# StumbleLele - AI Companion for Teenage Brazilian Girls 🇧🇷✨

<div align="center">
  <img src="./client/public/lele-main.png" alt="Lele Avatar" width="200"/>
  
  [![Node.js](https://img.shields.io/badge/Node.js-v22.14-green)](https://nodejs.org/)
  [![React](https://img.shields.io/badge/React-18.3-blue)](https://reactjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)](https://www.typescriptlang.org/)
  [![Gemini](https://img.shields.io/badge/Gemini-Live--2.5-green)](https://ai.google.dev/)
  [![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4-blue)](https://openai.com/)
  [![XAI](https://img.shields.io/badge/XAI-Grok--3-orange)](https://x.ai/)
  [![Vercel](https://img.shields.io/badge/Vercel-Production-black)](https://vercel.com/)
  [![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)
</div>

## 🌟 Overview

StumbleLele is an advanced interactive AI companion designed specifically for teenage Brazilian girls, featuring Lele - a friendly 7-year-old virtual friend who speaks Brazilian Portuguese. The application provides culturally relevant entertainment through intelligent humor, real-time voice chat, and interactive experiences, while maintaining a safe and age-appropriate environment.

**🎉 Version 3.0 - Teenager-Focused Experience!** Now featuring intelligent humor for teenage girls, classic ba-dum-tss sound effects, girl-focused interactions, and enhanced Gemini Live voice integration with authentic Brazilian Portuguese female voice!

## ✨ Features

### 🤖 AI-Powered Interactions
- **Quad AI Support**: Choose between Google Gemini 2.5 Flash (default), OpenAI GPT-4, XAI Grok-3, and Anthropic Claude models
- **Gemini Live Voice**: Real-time AI voice generation with Leda voice for authentic Brazilian Portuguese female speech
- **Smart Conversations**: Lele responds intelligently with contextual awareness and emotional intelligence
- **Contextual Memory**: Remembers past conversations and creates meaningful memories
- **Voice Integration**: Advanced speech synthesis with Brazilian Portuguese accent and child-like enthusiasm
- **Multi-Modal Interaction**: Text, voice input, and AI-generated voice responses

### 🎮 Complete Game System
- **5 Interactive Games**: Memory matching, word puzzles, math challenges, emotion recognition, and Cosmic Blaster
- **Cosmic Blaster (1945 Air Force Style)**: Bullet hell aircraft shooter with automatic shooting and drag-to-move controls
- **Adaptive Difficulty**: 5 levels per educational game with intelligent progression requirements
- **Real-time Gameplay**: Fully interactive games with timers, scoring, and feedback
- **Achievement System**: 10+ achievements with feature unlocks and rewards
- **Progress Analytics**: Detailed tracking of accuracy, streaks, and improvement over time
- **Mobile-Optimized**: Touch-friendly game controls with responsive layouts

#### 🚀 Cosmic Blaster Features
- **Automatic Continuous Shooting**: No manual shooting required - players focus purely on movement
- **Drag-to-Move Controls**: Touch anywhere on screen and drag to move Lele's ship smoothly
- **6-Level Weapon Progression**: Automatic weapon upgrades through pickup collection
- **Mobile-First Design**: One-finger operation optimized for phones and tablets
- **Pickup System**: Weapon, health, and shield power-ups with automatic collection
- **Visual & Audio Feedback**: Pulsing animations, explosion effects, and dedicated sound effects
- **Wave-Based Enemies**: Progressive difficulty with formation-flying space creatures
- **Child-Friendly Theme**: Colorful space adventure with Lele as the pilot

### 🎭 Advanced Avatar System
- **12 Distinct Emotions**: happy, excited, sad, surprised, thinking, playful, loving, calm, encouraging, concentrating, celebrating, sleepy
- **Context-Aware Animations**: Different behaviors for conversation, gaming, learning, and idle states
- **Dynamic Visual Changes**: Eyes, mouth, gestures, and colors adapt to emotional state
- **Eye Tracking**: Avatar follows action during games and learning activities
- **Gesture Recognition**: Peace signs, tilting, bouncing based on emotions

### 🎤 Advanced Voice Features
- **Gemini Live Integration**: Real-time AI voice generation with WebSocket streaming
- **Leda Voice**: Authentic Brazilian Portuguese female voice with natural intonation
- **Teenager-Focused Communication**: Girl-to-girl interactions with appropriate language and topics
- **Intelligent Joke System**: AI-powered humor with classic ba-dum-tss sound effects
- **Smart Voice Selection**: Prioritizes Brazilian Portuguese female voices with fallback to TTS
- **Multi-Format Audio Support**: Handles various audio formats (MP3, WAV, PCM) with automatic detection
- **Real-time Processing**: Instant voice recognition and synthesis with comprehensive error handling
- **Voice Personality**: Enthusiastic, fluid, and vivid Brazilian Portuguese speech tailored for teens

### 👥 Social Features
- **Virtual Friends**: Manage friend lists with online/offline status
- **Memory Album**: Store and review special moments with Lele
- **AI Joke Generator**: Teenager-appropriate jokes with real-time voice delivery using Gemini Live
- **Classic Ba-Dum-Tss Effects**: Professional drum roll sound effects after jokes
- **Progress Sharing**: Compare achievements and levels
- **Interactive Avatar**: High-quality cartoon avatar with enhanced animations and expressions
- **Girl-to-Girl Interactions**: Conversations tailored for teenage Brazilian girls

### 📱 Teen-Friendly Interface Design
- **Vibrant Visual Design**: Colorful gradients, playful animations, and engaging background elements
- **Floating Avatar Companion**: Always-visible Lele character that follows and interacts throughout the experience
- **Youth-Optimized Typography**: Fredoka One headings and Nunito body text for optimal readability
- **Celebration Effects**: Sparkle animations, rainbow gradients, and reward visuals for achievements
- **Dynamic Micro-Interactions**: Bounce, wiggle, float, and bubble animations that respond to user actions
- **Touch-Friendly Interface**: Large buttons with teen-friendly styling and intuitive gestures
- **Responsive Design**: Optimized for all screen sizes with mobile-first approach
- **Accessibility Features**: High contrast support, reduced motion options, and focus indicators

## 🚀 Quick Start

### Prerequisites
- Node.js v22.14+ 
- npm or yarn
- Google Gemini API key (primary for voice features)
- OpenAI API key OR XAI API key (or both for dual support)
- Modern web browser (Chrome, Firefox, Safari, Edge)
- For mobile testing: iOS 12+ or Android 8+

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/talktorobson/StumbleLele.git
   cd StumbleLele
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Create .env file
   cp .env.example .env
   
   # Add your AI API keys (at least one required)
   GEMINI_API_KEY=your_gemini_api_key_here
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   OPENAI_API_KEY=your_openai_api_key_here
   XAI_API_KEY=your_xai_api_key_here
   ANTHROPIC_API_KEY=your_anthropic_api_key_here
   
   # Optional: Add PostgreSQL connection
   DATABASE_URL=postgresql://user:password@host:port/database
   ```
   
   **⚠️ SECURITY NOTE**: Never commit your `.env` file to Git. It contains sensitive API keys.

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   ```
   http://localhost:5000
   ```

## 🛠️ Technology Stack

### Frontend
- **React 18.3** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **TailwindCSS** - Responsive styling with mobile-first approach
- **Custom Kids Theme** - Specialized CSS animations and child-friendly styling
- **shadcn/ui** - Component library with responsive components
- **Framer Motion** - Smooth animations optimized for mobile and kid interactions
- **TanStack Query** - Data fetching with offline support

### Backend
- **Vercel Serverless Functions** - Scalable API endpoints
- **TypeScript** - Type safety
- **Google Gemini Live** - Real-time AI voice generation (primary)
- **OpenAI API** - GPT-4 AI responses
- **XAI API** - Grok-3 AI responses
- **Anthropic Claude** - Additional AI support
- **Drizzle ORM** - Database ORM
- **PostgreSQL** - Database with Supabase

## 📁 Project Structure

```
StumbleLele/
├── client/              # Frontend React application
│   ├── src/
│   │   ├── components/  # React components (mobile-responsive)
│   │   │   ├── games/   # Individual game components (touch-optimized)
│   │   │   │   ├── memory-game.tsx      # Memory matching game
│   │   │   │   ├── words-game.tsx       # Word puzzle game
│   │   │   │   ├── math-game.tsx        # Math challenge game
│   │   │   │   ├── emotion-game.tsx     # Emotion recognition game
│   │   │   │   └── cosmic-blaster-game.tsx # 1945 Air Force style shooter
│   │   │   ├── lele-avatar.tsx  # Advanced avatar system
│   │   │   ├── floating-lele.tsx # Always-visible floating companion
│   │   │   ├── voice-input.tsx  # Voice interaction
│   │   │   ├── progress.tsx     # Progress tracking
│   │   │   ├── chat.tsx         # Mobile-optimized chat
│   │   │   ├── friends.tsx      # Touch-friendly friends
│   │   │   └── memories.tsx     # Responsive memory display
│   │   ├── styles/      # Custom CSS themes and animations
│   │   │   └── kids-theme.css   # Kid-friendly animations and styling
│   │   ├── pages/       # Page components (mobile-first)
│   │   ├── hooks/       # Custom React hooks (speech, etc.)
│   │   └── lib/         # Utilities and helpers
│   └── index.html
├── server/              # Backend Express server
│   ├── routes.ts        # API endpoints with progression
│   ├── services/        # Business logic
│   │   ├── openai.ts    # AI service with dual support
│   │   └── progressionService.ts  # Level progression logic
│   ├── storage.ts       # Data persistence
│   └── index.ts         # Server entry point
├── shared/              # Shared types and schemas
└── package.json
```

## 🔧 Configuration

### Environment Variables
| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Google Gemini API key for AI responses | Yes (primary) |
| `VITE_GEMINI_API_KEY` | Google Gemini API key for Live Audio | Yes (voice features) |
| `OPENAI_API_KEY` | OpenAI API key for GPT-4 | Yes (or other AI) |
| `XAI_API_KEY` | XAI API key for Grok-3 | Yes (or other AI) |
| `ANTHROPIC_API_KEY` | Anthropic API key for Claude | Yes (or other AI) |
| `DATABASE_URL` | PostgreSQL connection string | No (uses in-memory) |
| `VITE_SUPABASE_URL` | Supabase project URL | No |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | No |
| `PORT` | Server port (default: 5000) | No |

### Customization
- **Avatar**: Modify `client/src/components/lele-avatar.tsx`
- **AI Personality**: Edit prompts in `server/services/openai.ts`
- **Colors**: Update theme in `tailwind.config.ts`
- **Games**: Add new games in `client/src/components/games/`
- **Mobile Styles**: Customize responsive breakpoints in Tailwind config
- **Touch Interactions**: Modify gesture handlers in component files

## 📱 Usage

### For Teenagers
1. **Chat with Lele**: Type or speak your message and watch her emotions change
2. **Request Custom Jokes**: Get AI-powered jokes tailored for Brazilian teenage girls with classic ba-dum-tss effects
3. **Play Educational Games**: 
   - 🧠 **Memory Game**: Match card pairs with increasing difficulty
   - 📝 **Word Puzzles**: Unscramble words and learn new vocabulary
   - 🔢 **Math Challenges**: Solve arithmetic problems at your level
   - 💝 **Emotion Recognition**: Learn about feelings through scenarios
   - 🚀 **Cosmic Blaster**: Pilot Lele's spaceship with drag-to-move controls and automatic shooting
4. **Track Progress**: See your levels, achievements, and improvement over time
5. **Make Friends**: Add virtual friends to your list
6. **Create Memories**: Special moments are saved automatically
7. **Voice Interactions**: Experience real-time AI voice with authentic Brazilian Portuguese
8. **Play Anywhere**: Full functionality on phones, tablets, and computers

### For Parents
- Monitor conversations through the memory system
- Track educational progress with detailed analytics
- Safe, age-appropriate content for teenagers
- No external communications
- Educational focus with skill development
- Achievement system motivates continued learning
- Mobile-safe design with parental-friendly controls
- Teenager-focused content with appropriate humor and topics

## 🚧 Roadmap

### ✅ Recently Completed (v3.0)
- [x] **Teenager-Focused Experience** - Complete transformation for teenage Brazilian girls
- [x] **Intelligent Joke System** - AI-powered humor with variety and classic ba-dum-tss effects
- [x] **Girl-to-Girl Interactions** - Updated greetings and conversations for female users
- [x] **Enhanced Voice Features** - Leda voice with teenager-appropriate communication
- [x] **Smart Joke Generation** - Randomized themes including social media, music, and teen culture
- [x] **Audio Effects Integration** - Classic ba-dum-tss drum roll sound effects
- [x] **Emoji-Free Voice Synthesis** - Clean audio output without emoji descriptions
- [x] **Improved Button State Management** - Fixed joke button transitions and processing states

### ✅ Previous Milestones (v2.9)
- [x] **Gemini Live Voice Integration** - Real-time AI voice generation with WebSocket streaming
- [x] **Leda Voice Configuration** - Authentic Brazilian Portuguese female voice with natural intonation
- [x] **Enhanced Audio Support** - Multi-format audio handling (MP3, WAV, PCM) with automatic detection
- [x] **Comprehensive Security** - API key protection, secure environment handling, and GitGuardian integration
- [x] **Avatar System Enhancement** - High-quality cartoon avatar with improved animations and expressions
- [x] **Voice Personality Optimization** - Enthusiastic, fluid, and vivid Brazilian Portuguese speech
- [x] **Debug UI Management** - Clean separation of development tools from production interface
- [x] **Complete game implementations** (memory, word, math, emotions, cosmic blaster)
- [x] **Enhanced voice synthesis** with 8 emotional variants
- [x] **Advanced avatar system** with 12 emotions and animations
- [x] **Quad AI support** (Google Gemini + OpenAI GPT-4 + XAI Grok-3 + Anthropic Claude)

### In Development
- [ ] **Voice Input Enhancement** - Improved speech recognition with disconnect handling
- [ ] **Advanced Teen Topics** - Expanded conversation topics relevant to Brazilian teenagers
- [ ] **Social Media Integration** - Safe sharing of achievements and memories
- [ ] **Personalized Learning** - AI-driven content adaptation based on user preferences
- [ ] **Group Chat Features** - Safe multi-user conversations with friends
- [ ] **Progressive Web App (PWA)** - Offline functionality for core features

### Future Features
- [ ] **Offline mode** with cached responses and local voice synthesis
- [ ] **Story mode adventures** with teen-focused narratives
- [ ] **Multiple language support** beyond Portuguese
- [ ] **Custom avatar designs** and personalization options
- [ ] **Voice cloning** for personalized Lele voice variations
- [ ] **AR/VR integration** for immersive teen experiences
- [ ] **Native mobile apps** for iOS and Android
- [ ] **Study Helper Features** - AI-powered homework and study assistance
- [ ] **Music Integration** - Brazilian music discovery and discussion features

## 🚀 Deployment

### Production Deployment (Vercel + Supabase)
For production deployment, we recommend using Vercel with Supabase:

1. **Set up Supabase Database**:
   - Create a new project at [supabase.com](https://supabase.com)
   - Get your connection string from Settings > Database

2. **Deploy to Vercel**:
   - Import your repository at [vercel.com](https://vercel.com)
   - Add environment variables:
     ```
     DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
     GEMINI_API_KEY=your_gemini_api_key_here
     VITE_GEMINI_API_KEY=your_gemini_api_key_here
     OPENAI_API_KEY=your_openai_api_key_here
     XAI_API_KEY=your_xai_api_key_here
     ANTHROPIC_API_KEY=your_anthropic_api_key_here
     NODE_ENV=production
     ```

3. **Set up Database**:
   ```bash
   npm run db:setup
   ```

📖 **Complete deployment guide**: See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

### Alternative Platforms
- **Railway**: Works with the same configuration
- **Render**: Compatible with PostgreSQL addon
- **Heroku**: Use Heroku Postgres addon

## 🔐 Security

### API Key Security
- **Never commit `.env` files** to version control
- **Use environment variables** for all sensitive data
- **Rotate API keys regularly** (every 90 days recommended)
- **Monitor API usage** for unauthorized access
- **Use different keys** for development/production

### Deployment Security
- **Set environment variables** in hosting platform (Vercel, Railway, etc.)
- **Enable domain restrictions** where possible
- **Set usage quotas** to prevent abuse
- **Monitor logs** for suspicious activity

### Teen Safety
- **All AI responses** are filtered for age-appropriate content for teenagers
- **No external communications** outside the AI providers
- **Secure data storage** with encryption
- **No personal information** collected or stored
- **Safe interaction environment** with content monitoring
- **Appropriate humor and topics** for Brazilian teenage culture

📋 **See [SECURITY_GUIDE.md](SECURITY_GUIDE.md) for detailed security practices.**

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google** for Gemini Live API and real-time voice generation capabilities
- **OpenAI** for GPT-4 API and AI capabilities
- **XAI** for Grok-3 API and advanced AI features
- **Anthropic** for Claude API and AI assistance
- **Vercel** for seamless deployment and serverless functions
- **Supabase** for PostgreSQL database and real-time features
- **shadcn/ui** for beautiful component library
- **Framer Motion** for smooth animations
- **The React and TypeScript communities** for amazing tools
- **Inspired by the need for safe, educational AI companions for teenagers worldwide**

## 📞 Contact

Robson Reis - [@talktorobson](https://github.com/talktorobson)

Project Link: [https://github.com/talktorobson/StumbleLele](https://github.com/talktorobson/StumbleLele)

---

<div align="center">
  Made with ❤️ for Brazilian teenage girls everywhere
</div>