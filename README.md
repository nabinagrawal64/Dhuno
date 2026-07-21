# 🎵 Dhuno - Smart Music Experience Platform

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-ISC-green)
![Status](https://img.shields.io/badge/status-Stable-brightgreen)

A context-aware music streaming platform that adapts the listening experience using real-time context signals, location-based social rooms, and emotion-driven interfaces.

</div>

---

## 🎯 Overview

**Dhuno** is a next-generation music streaming platform that combines personalized playback, social listening experiences, and immersive visuals. By leveraging real-time context signals (mood, location, behavior), Dhuno creates a uniquely tailored music experience for every user.

### 💡 Core Value Proposition

- **Personalized Experience** - Adaptive interface based on real-time context signals
- **Social Listening** - Location-based rooms with synchronized playback
- **Smart Discovery** - Intelligent recommendations and AI-powered features
- **Immersive Interface** - Emotion-driven UI and rich visual interactions

---

## ✨ Features

### Core Features
- 🎵 **Music Streaming** - Seamless playback with high-quality audio
- 📝 **Playlist Management** - Create, organize, and share playlists
- ❤️ **Favorites & Likes** - Save your favorite songs
- 🔍 **Smart Search** - Fast and intelligent song discovery with caching
- 📜 **Search History** - Track and manage your search history

### Unique Features
- 🏘️ **Location-Based Rooms** - Listen with nearby communities in real-time synchronized sessions
- ⚡ **Redis Caching** - Fast trending songs and room state persistence

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS 4
- **Routing**: React Router v7
- **Real-time**: Socket.io Client
- **State Management**: React Context API
- **Authentication**: JWT + Google OAuth
- **UI Components**: Lucide React Icons

### Backend
- **Runtime**: Node.js with Express.js 5
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Cache**: Redis (ioredis) for trending-song cache, room snapshots, and rate limiting
- **Real-time**: Socket.io
- **Media Storage**: Cloudinary
- **Authentication**: JWT + bcryptjs
- **Task Queue**: BullMQ
- **Validation**: Zod
- **Rate Limiting**: Express Rate Limit

### DevOps
- **Containerization**: Docker
- **Deployment**: Docker Compose ready

---

## 🧱 Architecture at a Glance

```mermaid
flowchart TB
	UI[React Frontend] --> API[Express API]
	API --> DB[(MongoDB)]
	API --> SOCKET[Socket.IO]
	SOCKET <--> REDIS[(Redis)]
	API --> QUEUE[BullMQ Jobs]
	QUEUE --> WORKERS[Workers / Background Jobs]
```

### Runtime Flow

- The React app sends requests to the Express API for auth, search, playlists, and room actions.
- MongoDB stores users, songs, playlists, rooms, clips, and search history.
- Socket.IO keeps live room playback, chat, reactions, and presence in sync.
- Redis stores fast-changing room state, queue snapshots, cache entries, and rate-limit counters.
- BullMQ is the background job layer for deferred tasks such as email, cleanup, and other non-blocking work.

---

## 🗃️ Database Schema Overview

```mermaid
classDiagram
	class User {
		+string fullName
		+string username
		+string email
		+string role
		+ObjectId[] playlists
		+ObjectId[] joinedRooms
		+string[] likedSongs
		+string[] recentlyPlayed
	}

	class Song {
		+string title
		+ObjectId artist
		+string artistName
		+string[] tags
		+string[] genre
		+number plays
		+number saves
		+boolean isTrending
	}

	class Playlist {
		+string title
		+ObjectId owner
		+string[] songs
		+string visibility
		+number totalTracks
		+number totalDuration
	}

	class Room {
		+string roomName
		+ObjectId host
		+ObjectId[] participants
		+object currentSong
		+object[] queue
		+boolean isLive
		+number participantCount
		+number totalJoins
	}

	class SearchHistory {
		+ObjectId user
		+string query
		+string category
		+string resultType
		+string clickedItemId
	}

	User "1" --> "many" Playlist : owns
	User "1" --> "many" Room : creates / joins
	User "1" --> "many" SearchHistory : writes
	Playlist "many" --> "many" Song : contains song ids
	Room "1" --> "many" User : participants
	Song "many" --> "1" User : uploaded by / liked by
```

### Main Relationships

- **User → Playlist**: a user owns one or more playlists.
- **User → Room**: a user can create and join multiple listening rooms.
- **Room → User**: rooms track participants, host, and moderators.
- **Playlist → Song**: playlists store ordered song identifiers.
- **User → SearchHistory**: search activity is tracked for recent queries and click behavior.

---

## ⚡ Redis Usage

Redis is used as a fast, ephemeral data layer around the live music experience.

### What is cached

- **Trending songs** from the song feed
- **Room state snapshots** for live Socket.IO sessions
- **Room queue snapshots** for fast reconnects and room recovery
- **Room presence/session data** to track active sockets
- **Rate-limit counters** for public API protection

### TTL values

- **Trending songs cache**: `5 minutes`
- **Room state snapshot**: `1 hour`
- **Room queue snapshot**: `1 hour`
- **Presence heartbeat**: `90 seconds`
- **Rate-limit window**: configured per route/store

### Cache invalidation strategy

- Trending-song cache is cleared when song data changes, so users do not see stale charts.
- Room queue snapshots are refreshed whenever the queue changes.
- Room state is persisted after live room updates and restored on reconnect.
- Presence keys expire automatically if a socket stops heartbeating.

### Why Redis helps

- Reduces repeat reads from MongoDB for frequently accessed song and room data.
- Keeps room join and reconnect flows fast during live sessions.
- Prevents long request times by moving transient state out of the primary database.
- Supports rate limiting without adding extra application-side bookkeeping.

---

## 📈 Performance Notes

These are the kinds of improvements worth highlighting in interviews. Replace them with measured numbers from your own environment if you have them.

- Search response times can drop from about `250 ms` to around `60 ms` for warm-cache requests.
- Redis reduces repeated database reads for trending songs and active rooms.
- Room reconnection is faster because the current session state can be restored from Redis instead of rebuilt from scratch.
- Queue snapshotting keeps live room actions responsive because state updates do not block the main request path.

---

## 🚀 Future Enhancements

- Recommendation engine based on listening history and room behavior
- AI playlist generation from mood, genre, and activity patterns
- Offline synchronization for cached songs and queued actions
- Vector search for semantic song discovery
- ML-based mood detection to drive smarter personalization
- Worker-backed background jobs for notifications, cleanup, and analytics

---

## 📁 Project Structure

```
Dhuno/
├── Backend/                          # Node.js/Express API
│   ├── src/
│   │   ├── server.ts                # Main server entry
│   │   ├── config/                  # Configuration files
│   │   │   ├── cloudinary.ts        # Cloudinary setup
│   │   │   ├── db.ts                # MongoDB connection
│   │   │   └── redis.ts             # Redis setup
│   │   ├── controllers/             # Request handlers
│   │   │   ├── auth.controller.ts
│   │   │   ├── song.controller.ts
│   │   │   ├── playlist.controller.ts
│   │   │   └── room.controller.ts
│   │   ├── models/                  # MongoDB schemas
│   │   │   ├── user.model.ts
│   │   │   ├── song.model.ts
│   │   │   ├── playlist.model.ts
│   │   │   └── room.model.ts
│   │   ├── routes/                  # API endpoints
│   │   ├── middleware/              # Custom middleware
│   │   ├── sockets/                 # Socket.io handlers
│   │   ├── utils/                   # Utility functions
│   │   └── types/                   # TypeScript types
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
│
├── Frontend/                         # React + Vite
│   ├── src/
│   │   ├── main.tsx                 # Entry point
│   │   ├── App.tsx                  # Root component
│   │   ├── pages/                   # Page components
│   │   ├── components/              # Reusable components
│   │   ├── api/                     # API service layer
│   │   ├── context/                 # React Context
│   │   ├── hooks/                   # Custom hooks
│   │   ├── utils/                   # Utilities
│   │   └── themes/                  # Theme configuration
│   ├── public/                      # Static assets
│   ├── Dockerfile
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   ├── package.json
│   └── tsconfig.json
│
├── Docs/                            # Documentation
│   ├── Dhuno-Product-Documentation.md
│   └── Dhuno-Frontend-Design-Handoff.md
│
└── readme.md                        # This file
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+ (LTS recommended)
- **npm** or **yarn** package manager
- **MongoDB** instance (local or Atlas)
- **Redis** instance (local or cloud)
- **Cloudinary** account (for media storage)
- **.env** variables configured

### Environment Setup

#### Backend Environment Variables

Create a `.env` file in the `Backend/` directory:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dhuno

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRY=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret

# CORS
FRONTEND_URL=http://localhost:5173
```

#### Frontend Environment Variables

Create a `.env` file in the `Frontend/` directory:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

### Installation & Setup

#### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/Dhuno.git
cd Dhuno
```

#### 2. Backend Setup
```bash
cd Backend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your values

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

#### 3. Frontend Setup
```bash
cd Frontend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your values

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Docker Deployment

#### Using Docker Compose
```bash
# Build and run both services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

#### Individual Docker Builds
```bash
# Backend
docker build -t dhuno-backend ./Backend
docker run -p 5000:5000 --env-file Backend/.env dhuno-backend

# Frontend
docker build -t dhuno-frontend ./Frontend
docker run -p 3000:80 dhuno-frontend
```

---

## 📖 Documentation

### Comprehensive Guides
- **[Product Documentation](./Frontend/Docs/Dhuno-Product-Documentation.md)** - Detailed product overview, features, and architecture
- **[Frontend Design Handoff](./Frontend/Docs/Dhuno-Frontend-Design-Handoff.md)** - UI/UX specifications and design system

### API Documentation
The API follows REST principles with WebSocket support for real-time features.

**Base URL**: `http://localhost:5000/api`

#### Key Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | User registration |
| POST | `/auth/login` | User login |
| GET | `/songs` | Get all songs |
| GET | `/songs/:id` | Get song details |
| POST | `/playlist` | Create playlist |
| GET | `/playlist/:id` | Get playlist |
| POST | `/room/create` | Create listening room |
| GET | `/room/:id` | Join/get room |

---

## 🧑‍💻 Development

### Available Scripts

**Backend:**
```bash
npm run dev      # Start development server with auto-reload
npm run build    # Compile TypeScript to JavaScript
npm run lint     # Run ESLint
npm run start    # Start production server
```

**Frontend:**
```bash
npm run dev         # Start Vite dev server
npm run build       # Build for production
npm run lint        # Run ESLint
npm run preview     # Preview production build
npm run generate:pages  # Generate page components
```

### Code Quality

- **Linting**: ESLint with TypeScript support
- **Type Safety**: Full TypeScript strict mode
- **Code Style**: Consistent formatting across codebase

```bash
# Lint the code
npm run lint

# Fix linting errors
npm run lint -- --fix
```

### Git Workflow

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes and commit: `git commit -m "Add feature description"`
3. Push to branch: `git push origin feature/your-feature`
4. Open a Pull Request with a clear description

---

## 🔐 Authentication & Security

- **JWT-based** authentication for stateless API calls
- **bcryptjs** for password hashing (10 rounds)
- **Google OAuth 2.0** integration for social login
- **Rate limiting** on all public endpoints
- **CORS** configuration for secure cross-origin requests
- **Cookie-based** session management options

---

<div align="center">

**⭐ If you find Dhuno useful, please star this repository!**

[Back to Top](#-dhuno---smart-music-experience-platform)

</div>
