# StumbleLele - AI Companion for Children 🎮

<div align="center">
  <img src="https://ibb.co/7N1JwBY5" alt="StumbleLele Avatar" width="200"/>
  
  [![Node.js](https://img.shields.io/badge/Node.js-v22.14-green)](https://nodejs.org/)
  [![React](https://img.shields.io/badge/React-18.3-blue)](https://reactjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)](https://www.typescriptlang.org/)
  [![XAI](https://img.shields.io/badge/XAI-Grok--3-orange)](https://x.ai/)
  [![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)
</div>

## 🌟 Overview

StumbleLele is an interactive AI companion designed for children, featuring Lele - a friendly 7-year-old virtual friend who speaks Brazilian Portuguese. The application provides a safe, educational, and entertaining environment where children can chat, play games, and create memories with their AI companion.

## ✨ Features

### 🤖 AI-Powered Interactions
- **Smart Conversations**: Lele responds intelligently using XAI Grok-3
- **Contextual Memory**: Remembers past conversations and creates memories
- **Emotional Intelligence**: Dynamic expressions based on conversation context
- **Portuguese Language**: Native Brazilian Portuguese for authentic interactions

### 🎮 Interactive Elements
- **Educational Games**: Memory, word, and math games (coming soon)
- **Voice Input**: Speak to Lele using your microphone
- **Animated Avatar**: Expressive cartoon character with multiple emotions
- **Progress Tracking**: Track achievements and game scores

### 👥 Social Features
- **Virtual Friends**: Manage a list of friends with online/offline status
- **Memory Album**: Store and review special moments with Lele
- **Joke Generator**: Lele tells age-appropriate jokes in Portuguese

## 🚀 Quick Start

### Prerequisites
- Node.js v22.14+ 
- npm or yarn
- XAI API key

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
   
   # Add your XAI API key
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
- **XAI API** - AI responses
- **Drizzle ORM** - Database ORM
- **PostgreSQL** - Database (optional)

## 📁 Project Structure

```
StumbleLele/
├── client/              # Frontend React application
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── hooks/       # Custom React hooks
│   │   └── lib/         # Utilities and helpers
│   └── index.html
├── server/              # Backend Express server
│   ├── routes.ts        # API endpoints
│   ├── services/        # Business logic
│   ├── storage.ts       # Data persistence
│   └── index.ts         # Server entry point
├── shared/              # Shared types and schemas
└── package.json
```

## 🔧 Configuration

### Environment Variables
| Variable | Description | Required |
|----------|-------------|----------|
| `XAI_API_KEY` | Your XAI API key for AI features | Yes |
| `DATABASE_URL` | PostgreSQL connection string | No (uses in-memory) |
| `PORT` | Server port (default: 5000) | No |

### Customization
- **Avatar**: Modify `client/src/components/lele-avatar.tsx`
- **AI Personality**: Edit prompts in `server/services/openai.ts`
- **Colors**: Update theme in `tailwind.config.ts`
- **Games**: Add new games in `client/src/components/games/`

## 📱 Usage

### For Children
1. **Chat with Lele**: Type or speak your message
2. **Play Games**: Choose from educational mini-games
3. **Make Friends**: Add virtual friends to your list
4. **Create Memories**: Special moments are saved automatically

### For Parents
- Monitor conversations through the memory system
- Safe, age-appropriate content only
- No external communications
- Educational focus

## 🚧 Roadmap

### In Development
- [ ] Actual game implementations (memory, word, math)
- [ ] Enhanced voice synthesis with emotions
- [ ] Multiplayer friend interactions
- [ ] Parental dashboard

### Future Features
- [ ] Offline mode with cached responses
- [ ] Achievement system with badges
- [ ] Story mode adventures
- [ ] Multiple language support
- [ ] Custom avatar designs

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

- XAI for Grok-3 API
- shadcn/ui for beautiful components
- The React and TypeScript communities
- Inspired by the need for safe, educational AI companions for children

## 📞 Contact

Robson Reis - [@talktorobson](https://github.com/talktorobson)

Project Link: [https://github.com/talktorobson/StumbleLele](https://github.com/talktorobson/StumbleLele)

---

<div align="center">
  Made with ❤️ for children everywhere
</div>