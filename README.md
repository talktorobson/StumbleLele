# StumbleLele - AI Companion for Children 🎮

<div align="center">
  <img src="https://ibb.co/7N1JwBY5" alt="StumbleLele Avatar" width="200"/>
  
  [![Node.js](https://img.shields.io/badge/Node.js-v22.14-green)](https://nodejs.org/)
  [![React](https://img.shields.io/badge/React-18.3-blue)](https://reactjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)](https://www.typescriptlang.org/)
  [![XAI](https://img.shields.io/badge/XAI-Grok--3-orange)](https://x.ai/)
  [![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4-blue)](https://openai.com/)
  [![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)
</div>

## 🌟 Overview

StumbleLele is an advanced interactive AI companion designed for children, featuring Lele - a friendly 7-year-old virtual friend who speaks Brazilian Portuguese. The application provides a safe, educational, and entertaining environment where children can chat, play educational games, and create memories with their emotionally intelligent AI companion.

**🎉 Version 2.0 - Enterprise Ready!** Now featuring complete game implementations, advanced voice synthesis, comprehensive avatar emotions, and intelligent level progression.

## ✨ Features

### 🤖 AI-Powered Interactions
- **Dual AI Support**: Choose between OpenAI GPT-4 and XAI Grok-3 models
- **Smart Conversations**: Lele responds intelligently with contextual awareness
- **Contextual Memory**: Remembers past conversations and creates meaningful memories
- **Emotional Intelligence**: Dynamic expressions and responses based on conversation context
- **Portuguese Language**: Native Brazilian Portuguese for authentic interactions

### 🎮 Complete Game System
- **4 Educational Mini-Games**: Memory matching, word puzzles, math challenges, and emotion recognition
- **Adaptive Difficulty**: 5 levels per game with intelligent progression requirements
- **Real-time Gameplay**: Fully interactive games with timers, scoring, and feedback
- **Achievement System**: 10+ achievements with feature unlocks and rewards
- **Progress Analytics**: Detailed tracking of accuracy, streaks, and improvement over time

### 🎭 Advanced Avatar System
- **12 Distinct Emotions**: happy, excited, sad, surprised, thinking, playful, loving, calm, encouraging, concentrating, celebrating, sleepy
- **Context-Aware Animations**: Different behaviors for conversation, gaming, learning, and idle states
- **Dynamic Visual Changes**: Eyes, mouth, gestures, and colors adapt to emotional state
- **Eye Tracking**: Avatar follows action during games and learning activities
- **Gesture Recognition**: Peace signs, tilting, bouncing based on emotions

### 🎤 Enhanced Voice Features
- **Emotion-Based Speech**: 8 different voice emotions with pitch and speed variations
- **Smart Voice Selection**: Prioritizes Brazilian Portuguese female voices
- **Contextual Emotion Detection**: Automatically selects appropriate voice tone
- **Voice Customization**: Adjustable speed, pitch, and volume settings
- **Real-time Processing**: Instant voice recognition and synthesis

### 👥 Social Features
- **Virtual Friends**: Manage friend lists with online/offline status
- **Memory Album**: Store and review special moments with Lele
- **Joke Generator**: Age-appropriate jokes in Portuguese
- **Progress Sharing**: Compare achievements and levels

## 🚀 Quick Start

### Prerequisites
- Node.js v22.14+ 
- npm or yarn
- OpenAI API key OR XAI API key (or both for dual support)

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
   OPENAI_API_KEY=your_openai_api_key_here
   XAI_API_KEY=your_xai_api_key_here
   
   # Optional: Add PostgreSQL connection
   DATABASE_URL=postgresql://user:password@host:port/database
   ```

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
- **TailwindCSS** - Styling
- **shadcn/ui** - Component library
- **Framer Motion** - Animations
- **TanStack Query** - Data fetching

### Backend
- **Express.js** - Server framework
- **TypeScript** - Type safety
- **OpenAI API** - GPT-4 AI responses
- **XAI API** - Grok-3 AI responses
- **Drizzle ORM** - Database ORM
- **PostgreSQL** - Database (optional)

## 📁 Project Structure

```
StumbleLele/
├── client/              # Frontend React application
│   ├── src/
│   │   ├── components/  # React components
│   │   │   ├── games/   # Individual game components
│   │   │   ├── lele-avatar.tsx  # Advanced avatar system
│   │   │   ├── voice-input.tsx  # Voice interaction
│   │   │   └── progress.tsx     # Progress tracking
│   │   ├── pages/       # Page components
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
| `OPENAI_API_KEY` | OpenAI API key for GPT-4 | Yes (or XAI) |
| `XAI_API_KEY` | XAI API key for Grok-3 | Yes (or OpenAI) |
| `DATABASE_URL` | PostgreSQL connection string | No (uses in-memory) |
| `PORT` | Server port (default: 5000) | No |

### Customization
- **Avatar**: Modify `client/src/components/lele-avatar.tsx`
- **AI Personality**: Edit prompts in `server/services/openai.ts`
- **Colors**: Update theme in `tailwind.config.ts`
- **Games**: Add new games in `client/src/components/games/`

## 📱 Usage

### For Children
1. **Chat with Lele**: Type or speak your message and watch her emotions change
2. **Play Educational Games**: 
   - 🧠 **Memory Game**: Match card pairs with increasing difficulty
   - 📝 **Word Puzzles**: Unscramble words and learn new vocabulary
   - 🔢 **Math Challenges**: Solve arithmetic problems at your level
   - 💝 **Emotion Recognition**: Learn about feelings through scenarios
3. **Track Progress**: See your levels, achievements, and improvement over time
4. **Make Friends**: Add virtual friends to your list
5. **Create Memories**: Special moments are saved automatically

### For Parents
- Monitor conversations through the memory system
- Track educational progress with detailed analytics
- Safe, age-appropriate content only
- No external communications
- Educational focus with skill development
- Achievement system motivates continued learning

## 🚧 Roadmap

### ✅ Recently Completed (v2.0)
- [x] **Complete game implementations** (memory, word, math, emotions)
- [x] **Enhanced voice synthesis** with 8 emotional variants
- [x] **Advanced avatar system** with 12 emotions and animations
- [x] **Intelligent level progression** with achievements
- [x] **Dual AI support** (OpenAI GPT-4 + XAI Grok-3)
- [x] **Real-time gameplay** with scoring and analytics

### In Development
- [ ] **Real-time friend interactions** with WebSocket multiplayer
- [ ] **Smart conversation memory** with personality development
- [ ] **Parental dashboard** with detailed progress reports
- [ ] **Advanced achievement system** with badges and rewards

### Future Features
- [ ] **Offline mode** with cached responses
- [ ] **Story mode adventures** with narrative gameplay
- [ ] **Multiple language support** beyond Portuguese
- [ ] **Custom avatar designs** and personalization
- [ ] **Voice cloning** for personalized Lele voice
- [ ] **AR/VR integration** for immersive experiences

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

- **OpenAI** for GPT-4 API and AI capabilities
- **XAI** for Grok-3 API and advanced AI features
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