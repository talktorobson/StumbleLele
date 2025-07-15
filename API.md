# StumbleLele API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
No authentication required for current version. All operations are performed for the default user (Helena, ID: 1).

## API Endpoints

### User Management

#### Get User Information
```http
GET /api/user/:id
```

**Parameters:**
- `id` (number): User ID

**Response:**
```json
{
  "id": 1,
  "name": "Helena",
  "age": 7,
  "createdAt": "2025-07-15T10:00:00Z"
}
```

### Avatar State Management

#### Get Avatar State
```http
GET /api/avatar/:userId
```

**Parameters:**
- `userId` (number): User ID

**Response:**
```json
{
  "id": 1,
  "userId": 1,
  "currentEmotion": "happy",
  "personality": {
    "enthusiasm": 0.9,
    "curiosity": 0.8,
    "playfulness": 0.95,
    "friendliness": 0.9
  },
  "lastInteraction": "2025-07-15T10:00:00Z"
}
```

#### Update Avatar State
```http
POST /api/avatar/:userId
```

**Parameters:**
- `userId` (number): User ID

**Request Body:**
```json
{
  "emotion": "excited",
  "personality": {
    "enthusiasm": 0.95,
    "curiosity": 0.8,
    "playfulness": 0.98,
    "friendliness": 0.9
  }
}
```

**Response:**
```json
{
  "id": 1,
  "userId": 1,
  "currentEmotion": "excited",
  "personality": {
    "enthusiasm": 0.95,
    "curiosity": 0.8,
    "playfulness": 0.98,
    "friendliness": 0.9
  },
  "lastInteraction": "2025-07-15T10:00:00Z"
}
```

### Chat System

#### Send Message to Lele
```http
POST /api/chat
```

**Request Body:**
```json
{
  "userId": 1,
  "message": "Oi Lele! Como você está hoje?"
}
```

**Response:**
```json
{
  "conversation": {
    "id": 1,
    "userId": 1,
    "message": "Oi Lele! Como você está hoje?",
    "response": "Oi Helena! Estou super bem e animada para brincar contigo! 😊",
    "timestamp": "2025-07-15T10:00:00Z"
  },
  "avatarState": {
    "emotion": "excited",
    "personality": {
      "enthusiasm": 0.95,
      "curiosity": 0.8,
      "playfulness": 0.98,
      "friendliness": 0.9
    }
  },
  "suggestedActions": [
    "Vamos jogar um jogo?",
    "Quer que eu conte uma piada?",
    "Que tal desenharmos juntas?"
  ]
}
```

#### Get Conversation History
```http
GET /api/conversations/:userId
```

**Parameters:**
- `userId` (number): User ID

**Response:**
```json
[
  {
    "id": 1,
    "userId": 1,
    "message": "Oi Lele!",
    "response": "Oi Helena! Como você está?",
    "timestamp": "2025-07-15T10:00:00Z"
  }
]
```

### Entertainment Features

#### Get Joke from Lele
```http
POST /api/joke
```

**Request Body:**
```json
{
  "userId": 1,
  "category": "animais"
}
```

**Response:**
```json
{
  "joke": "Por que a galinha atravessou a rua? Para chegar do outro lado! 🐔",
  "setup": "Por que a galinha atravessou a rua?",
  "punchline": "Para chegar do outro lado!",
  "category": "animais"
}
```

#### Get Game Suggestion
```http
POST /api/game/suggest
```

**Request Body:**
```json
{
  "userId": 1
}
```

**Response:**
```json
{
  "gameType": "memory",
  "description": "Jogo da memória com cartas coloridas! Vamos treinar nossa memória juntas?",
  "difficulty": 2,
  "instructions": "Encontre os pares de cartas iguais! Clique em duas cartas para ver se são iguais."
}
```

### Game Progress

#### Save Game Progress
```http
POST /api/game/progress
```

**Request Body:**
```json
{
  "userId": 1,
  "gameType": "memory",
  "level": 3,
  "score": 150
}
```

**Response:**
```json
{
  "id": 1,
  "userId": 1,
  "gameType": "memory",
  "level": 3,
  "score": 150,
  "completedAt": "2025-07-15T10:00:00Z"
}
```

#### Get Game Progress
```http
GET /api/game/progress/:userId
```

**Parameters:**
- `userId` (number): User ID

**Response:**
```json
[
  {
    "id": 1,
    "userId": 1,
    "gameType": "memory",
    "level": 3,
    "score": 150,
    "completedAt": "2025-07-15T10:00:00Z"
  }
]
```

### Memory System

#### Get Memories
```http
GET /api/memories/:userId
```

**Parameters:**
- `userId` (number): User ID
- `category` (string, optional): Filter by category

**Response:**
```json
[
  {
    "id": 1,
    "userId": 1,
    "content": "Helena e eu jogamos um jogo da memória super divertido! Ela conseguiu lembrar de todos os pares!",
    "category": "jogos",
    "timestamp": "2025-07-15T10:00:00Z"
  }
]
```

### Friends Management

#### Get Friends List
```http
GET /api/friends/:userId
```

**Parameters:**
- `userId` (number): User ID

**Response:**
```json
[
  {
    "id": 1,
    "userId": 1,
    "friendName": "Ana",
    "status": "online",
    "createdAt": "2025-07-15T10:00:00Z"
  }
]
```

#### Add Friend
```http
POST /api/friends
```

**Request Body:**
```json
{
  "userId": 1,
  "friendName": "Pedro",
  "status": "online"
}
```

**Response:**
```json
{
  "id": 2,
  "userId": 1,
  "friendName": "Pedro",
  "status": "online",
  "createdAt": "2025-07-15T10:00:00Z"
}
```

#### Update Friend Status
```http
PATCH /api/friends/:userId/:friendName
```

**Parameters:**
- `userId` (number): User ID
- `friendName` (string): Friend's name

**Request Body:**
```json
{
  "status": "offline"
}
```

**Response:**
```json
{
  "id": 1,
  "userId": 1,
  "friendName": "Ana",
  "status": "offline",
  "createdAt": "2025-07-15T10:00:00Z"
}
```

## Error Responses

### Standard Error Format
```json
{
  "message": "Error description"
}
```

### Common HTTP Status Codes
- `200` - Success
- `400` - Bad Request (missing required fields)
- `404` - Not Found (user/resource not found)
- `500` - Internal Server Error

## Data Types

### Emotions
Available emotion states for avatar:
- `happy` - Default cheerful state
- `excited` - High energy, enthusiastic
- `thinking` - Contemplative, processing
- `surprised` - Unexpected reaction
- `playful` - Fun, game-ready
- `curious` - Interested, questioning
- `sleepy` - Tired, low energy

### Game Types
Available game types:
- `memory` - Memory matching game
- `words` - Word learning game
- `math` - Mathematical challenges

### Memory Categories
Memory storage categories:
- `conversa` - General conversations
- `jogos` - Game-related memories
- `humor` - Jokes and funny moments
- `aprendizado` - Learning activities

## Rate Limiting
Currently no rate limiting implemented. Consider implementing for production use.

## WebSocket Events
WebSocket functionality is planned for future releases to support real-time features.

## Example Usage

### JavaScript/TypeScript
```typescript
// Send message to Lele
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    userId: 1,
    message: 'Oi Lele! Vamos brincar?'
  })
});

const data = await response.json();
console.log(data.conversation.response);
```

### cURL
```bash
# Get user info
curl -X GET http://localhost:5000/api/user/1

# Send chat message
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"userId": 1, "message": "Olá Lele!"}'

# Get a joke
curl -X POST http://localhost:5000/api/joke \
  -H "Content-Type: application/json" \
  -d '{"userId": 1, "category": "animais"}'
```