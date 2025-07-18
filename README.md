# StumbleLele - AI Companion for Children 🎮

<div align="center">
  <img src="https://ibb.co/7N1JwBY5" alt="StumbleLele Avatar" width="200"/>
  
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

StumbleLele is an advanced interactive AI companion designed for children, featuring Lele - a friendly 7-year-old virtual friend who speaks Brazilian Portuguese. The application provides a safe, educational, and entertaining environment where children can chat, play educational games, and create memories with their emotionally intelligent AI companion.

**🎉 Version 2.9 - Gemini Live Voice Integration!** Now featuring real-time AI voice generation with Leda voice for authentic Brazilian Portuguese female speech, plus enhanced avatar system and comprehensive security improvements!

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
- **Emotion-Based Speech**: Dynamic voice variations based on context and emotions
- **Smart Voice Selection**: Prioritizes Brazilian Portuguese female voices with fallback to TTS
- **Multi-Format Audio Support**: Handles various audio formats (MP3, WAV, PCM) with automatic detection
- **Real-time Processing**: Instant voice recognition and synthesis with comprehensive error handling
- **Voice Personality**: Enthusiastic, fluid, and vivid Brazilian Portuguese child-like speech

### 👥 Social Features
- **Virtual Friends**: Manage friend lists with online/offline status
- **Memory Album**: Store and review special moments with Lele
- **AI Joke Generator**: Age-appropriate jokes with real-time voice delivery using Gemini Live
- **Progress Sharing**: Compare achievements and levels
- **Interactive Avatar**: High-quality cartoon avatar with enhanced animations and expressions

### 📱 Kid-Friendly Interface Design
- **Vibrant Visual Design**: Colorful gradients, playful animations, and engaging background elements
- **Floating Avatar Companion**: Always-visible Lele character that follows and interacts throughout the experience
- **Child-Optimized Typography**: Fredoka One headings and Nunito body text for optimal readability
- **Celebration Effects**: Sparkle animations, rainbow gradients, and reward visuals for achievements
- **Playful Micro-Interactions**: Bounce, wiggle, float, and bubble animations that respond to user actions
- **Touch-Friendly Interface**: Large buttons with kid-friendly styling and intuitive gestures
- **Responsive Design**: Optimized for all screen sizes with mobile-first approach
- **Accessibility Features**: High contrast support, reduced motion options, and focus indicators

## 🚀 Quick Start

### Prerequisites
- Node.js v22.14+ 
- npm or yarn
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

### For Children
1. **Chat with Lele**: Type or speak your message and watch her emotions change
2. **Play Educational Games**: 
   - 🧠 **Memory Game**: Match card pairs with increasing difficulty
   - 📝 **Word Puzzles**: Unscramble words and learn new vocabulary
   - 🔢 **Math Challenges**: Solve arithmetic problems at your level
   - 💝 **Emotion Recognition**: Learn about feelings through scenarios
   - 🚀 **Cosmic Blaster**: Pilot Lele's spaceship with drag-to-move controls and automatic shooting
3. **Track Progress**: See your levels, achievements, and improvement over time
4. **Make Friends**: Add virtual friends to your list
5. **Create Memories**: Special moments are saved automatically
6. **Play Anywhere**: Full functionality on phones, tablets, and computers

### For Parents
- Monitor conversations through the memory system
- Track educational progress with detailed analytics
- Safe, age-appropriate content only
- No external communications
- Educational focus with skill development
- Achievement system motivates continued learning
- Mobile-safe design with parental-friendly controls

## 🚧 Roadmap

### ✅ Recently Completed (v2.9)
- [x] **Gemini Live Voice Integration** - Real-time AI voice generation with WebSocket streaming
- [x] **Leda Voice Configuration** - Authentic Brazilian Portuguese female voice with natural intonation
- [x] **Enhanced Audio Support** - Multi-format audio handling (MP3, WAV, PCM) with automatic detection
- [x] **Comprehensive Security** - API key protection, secure environment handling, and GitGuardian integration
- [x] **Avatar System Enhancement** - High-quality cartoon avatar with improved animations and expressions
- [x] **Voice Personality Optimization** - Enthusiastic, fluid, and vivid Brazilian Portuguese child-like speech
- [x] **Debug UI Management** - Clean separation of development tools from production interface

### ✅ Previous Milestones (v2.2)
- [x] **Kid-Friendly Design Revolution** - Complete interface redesign optimized for children
- [x] **Floating Avatar Companion** - Always-visible Lele character with interactive features
- [x] **Vibrant Visual System** - Colorful gradients, playful animations, and engaging backgrounds
- [x] **Custom Kids Theme** - Specialized CSS with bounce, wiggle, sparkle, and celebration effects
- [x] **Child-Optimized Typography** - Fredoka One and Nunito fonts for better readability
- [x] **Playful Micro-Interactions** - Hover effects, button animations, and reward visuals
- [x] **Enhanced Accessibility** - High contrast support, reduced motion, and focus indicators
- [x] **Complete game implementations** (memory, word, math, emotions)
- [x] **Enhanced voice synthesis** with 8 emotional variants
- [x] **Advanced avatar system** with 12 emotions and animations
- [x] **Dual AI support** (OpenAI GPT-4 + XAI Grok-3)

### In Development
- [ ] **Voice Input Enhancement** - Improved speech recognition with disconnect handling
- [ ] **Real-time friend interactions** with WebSocket multiplayer
- [ ] **Smart conversation memory** with personality development
- [ ] **Parental dashboard** with detailed progress reports
- [ ] **Advanced achievement system** with badges and rewards
- [ ] **Progressive Web App (PWA)** for offline functionality

### Future Features
- [ ] **Offline mode** with cached responses
- [ ] **Story mode adventures** with narrative gameplay
- [ ] **Multiple language support** beyond Portuguese
- [ ] **Custom avatar designs** and personalization
- [ ] **Voice cloning** for personalized Lele voice
- [ ] **AR/VR integration** for immersive experiences
- [ ] **Native mobile apps** for iOS and Android
- [ ] **Tablet-optimized layouts** with enhanced features

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

### Child Safety
- **All AI responses** are filtered for age-appropriate content
- **No external communications** outside the AI providers
- **Secure data storage** with encryption
- **No personal information** collected or stored
- **Offline-first design** where possible

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
- **Inspired by the need for safe, educational AI companions for children worldwide**

## 📞 Contact

Robson Reis - [@talktorobson](https://github.com/talktorobson)

Project Link: [https://github.com/talktorobson/StumbleLele](https://github.com/talktorobson/StumbleLele)

---

<div align="center">
  Made with ❤️ for children everywhere
</div>