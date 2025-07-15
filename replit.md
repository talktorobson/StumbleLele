# Stumble Lele - AI Companion Application

## Overview

Stumble Lele is an interactive AI companion application designed for children, featuring a 7-year-old AI friend named Lele who speaks Portuguese. The application provides a safe, engaging environment for children to chat, play games, and interact with an AI companion that remembers their conversations and adapts to their personality.

## Recent Changes

### Voice Improvements (July 15, 2025)
- Fixed Brazilian Portuguese voice synthesis to use little girl voice characteristics
- Increased pitch to 1.8 for authentic child-like voice
- Added priority voice selection for Brazilian Portuguese female voices
- Improved voice loading and selection mechanism
- Fixed OpenAI API JSON response format requirement by adding "json" keyword to prompts

### Avatar Design Update (July 15, 2025)
- Recreated avatar based on Helena's picture showing a girl with brown hair using SVG
- Replaced complex CSS with clean SVG illustration matching the character design
- Added proper brown hair, facial features, and blue dress with white bow
- Implemented dynamic mouth expressions and speaking animations
- Enhanced visual accuracy with eyebrows, cheeks, and proper proportions

### Database Integration (July 15, 2025)
- Added PostgreSQL database with Drizzle ORM
- Implemented DatabaseStorage class replacing in-memory storage
- Added database initialization with default user and avatar state
- All conversations, memories, friends, and game progress now persist in database
- Maintained same API interface while upgrading backend to database storage

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a full-stack architecture with a clear separation between frontend and backend:

- **Frontend**: React-based SPA with TypeScript using Vite as the build tool
- **Backend**: Express.js REST API server with TypeScript
- **Database**: PostgreSQL with Drizzle ORM for data persistence
- **UI Framework**: Tailwind CSS with shadcn/ui components for consistent styling
- **State Management**: TanStack Query for server state management

## Key Components

### Frontend Architecture

The client-side application is built with React and TypeScript, organized into several key areas:

- **Components**: Modular React components for avatar, chat, games, friends, memories, and progress tracking
- **Pages**: Route-based page components (home, not-found)
- **Hooks**: Custom React hooks for avatar state management, speech functionality, and mobile detection
- **UI Components**: Comprehensive set of shadcn/ui components for consistent design
- **Styling**: Tailwind CSS with custom Lele-themed color variables

### Backend Architecture

The server-side follows a REST API pattern with:

- **Express Server**: Main application server with middleware for logging and error handling
- **Route Handlers**: RESTful endpoints for user management, conversations, games, friends, and memories
- **Storage Layer**: Abstract storage interface with in-memory implementation for development
- **AI Service**: OpenAI integration for generating Lele's responses and personality
- **Development Tools**: Vite integration for development mode with HMR support

### Database Schema

The application uses PostgreSQL with the following main entities:

- **Users**: Basic user information (id, name, age)
- **Conversations**: Chat history between users and Lele
- **Memories**: Categorized memories that Lele remembers about interactions
- **Friends**: User's friend list with online status
- **Game Progress**: Tracking of educational game achievements
- **Avatar State**: Lele's current emotional state and personality traits

## Data Flow

1. **User Interaction**: User inputs are captured through the React frontend
2. **API Communication**: Frontend communicates with backend via REST API calls
3. **AI Processing**: User messages are processed through OpenAI API to generate Lele's responses
4. **State Management**: TanStack Query manages server state and caching
5. **Data Persistence**: All interactions are stored in PostgreSQL database
6. **Real-time Updates**: UI updates reflect changes in avatar state, conversations, and progress

## External Dependencies

### Core Framework Dependencies
- **React**: Frontend framework with TypeScript support
- **Express**: Backend web framework
- **Drizzle ORM**: Type-safe database ORM for PostgreSQL
- **TanStack Query**: Server state management and caching

### AI and External Services
- **OpenAI API**: Powers Lele's conversational AI and personality
- **Neon Database**: PostgreSQL hosting service
- **Web Speech API**: Browser-based speech recognition and synthesis

### UI and Styling
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: High-quality React component library
- **Radix UI**: Headless UI components for accessibility
- **Lucide Icons**: Icon library for UI elements

### Development Tools
- **Vite**: Build tool and development server
- **TypeScript**: Type safety across the application
- **ESBuild**: Fast bundling for production builds

## Deployment Strategy

The application is configured for deployment with:

- **Build Process**: Vite builds the frontend, ESBuild bundles the backend
- **Production Server**: Express server serves both API and static files
- **Database**: PostgreSQL with Drizzle migrations for schema management
- **Environment Variables**: Configured for DATABASE_URL and OPENAI_API_KEY
- **Replit Integration**: Optimized for Replit development environment with banner and cartographer support

The application uses a single server architecture where Express serves both the API endpoints and the built frontend assets, making it suitable for simple deployment scenarios while maintaining development flexibility.