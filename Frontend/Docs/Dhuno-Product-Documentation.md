# Dhuno - Smart Music Experience

Version: 1.0
Date: 2026-04-08
Status: Approved Baseline Documentation
Primary Stack: MERN (MongoDB, Express.js, React, Node.js)
Cloud Media Storage: Cloudinary

## 1. Product Overview

### 1.1 Product Vision
Dhuno is a context-aware music platform that adapts the listening experience using user mood, location, and behavior. It combines personalized playback, social listening rooms, and immersive visuals to make music discovery and listening more meaningful and engaging.

### 1.2 Core Value Proposition
- Personalized experience based on real-time context signals.
- Social listening through location-based rooms with synchronized playback.
- Smart and immersive interface driven by emotion and media visuals.

### 1.3 Problem Statement
Most music apps provide static experiences with limited contextual adaptation. Users often want:
- Better recommendations based on their current situation.
- Shared listening experiences with friends or nearby communities.
- Richer visuals and interactions that match their mood.

Dhuno addresses these gaps by building a Smart Context Engine and real-time collaborative listening features.

## 2. Product Scope (Feature Lock)

### 2.1 Core Features
- Music streaming player
- Playlist management
- Like/favorite songs
- Song search

### 2.2 Unique Features
- Location-based music rooms
- AI lyrics explanation
- Voice control
- Emotion-driven UI
- Intelligent offline caching
- User-generated clips
- Background video themes

### 2.3 Final Add-on Features
- Smart Context Engine
- Smart Room Discovery
- Auto Visual Sync

### 2.4 Out of Scope (Current Release Cycle)
- Music production tools
- Full social media feed platform
- In-app artist publishing dashboard
- Blockchain/NFT integrations

## 3. User Segments and Use Cases

### 3.1 Primary User Segments
- Casual listeners seeking smooth, personalized playback.
- Social listeners who want synchronized group sessions.
- Experience-oriented users who value visuals and mood-aware interfaces.

### 3.2 Primary Use Cases
- Play songs continuously with a global player.
- Create playlists and manage favorites.
- Discover and join nearby listening rooms.
- Ask for lyric meaning and song explanation.
- Use voice commands during hands-free sessions.
- Continue playback with intelligent offline support.

## 4. High-Level Architecture

### 4.1 Frontend
- React-based client application.
- Responsibilities:
  - Playback controls and queue management
  - Search, playlists, favorites, and profile flows
  - Real-time room interaction and sync UI
  - Mood/emotion-based theming and visual adaptation

### 4.2 Backend
- Node.js + Express.js API and business logic layer.
- Responsibilities:
  - Authentication and user/session management
  - Song metadata, playlists, favorites, and room lifecycle
  - Smart Context Engine processing
  - AI-driven features orchestration
  - Cloudinary integration for media assets

### 4.3 Database
- MongoDB for application data.
- Data domains:
  - Users
  - Songs metadata
  - Playlists
  - Likes/favorites
  - Rooms and participant state
  - Context snapshots and behavior signals
  - User-generated clips metadata

### 4.4 Storage and Media Delivery
- Cloudinary for media storage and optimized delivery.
- Recommended usage:
  - Audio file hosting and transformations
  - Clip and image asset management
  - Responsive media delivery for multiple devices
  - Signed/secured URL strategy for protected assets

### 4.5 Real-Time Layer
- Socket.IO for room and synchronization events.
- Responsibilities:
  - Join/leave room events
  - Playback state synchronization (play, pause, seek)
  - Host control broadcasting
  - Participant state updates

## 5. System Modules

### 5.1 Authentication and User Management
- Signup/login/logout
- Session management and access control
- Basic profile preferences (theme, language, listening preferences)

### 5.2 Music Player Module
- Global player instance
- Continuous playback across screens
- Queue and playback state preservation
- Media controls support including lock-screen interaction strategy

### 5.3 Playlist and Library Module
- Create, update, delete playlists
- Add/remove tracks
- Like/favorite management
- Recently played and frequently played tracking

### 5.4 Search and Discovery Module
- Search by song, artist, mood, and tags
- Relevance ranking strategy
- Smart room recommendations by context and location

### 5.5 Room and Sync Module
- Room creation and access controls
- Live participant list
- Host authority model
- Playback and position synchronization

### 5.6 Smart Context Engine (USP)
- Inputs:
  - Time
  - Location
  - User behavior
  - Song mood metadata
- Outputs:
  - UI adaptation
  - Song recommendations
  - Room suggestions
  - Offline cache priorities

### 5.7 AI Experience Module
- AI lyrics explanation and interpretation
- Mood inference from user behavior and listening pattern
- Emotion-aware visual and theme modulation

### 5.8 Voice Interaction Module
- Playback control commands
- Navigation-level commands
- Contextual command handling with fallback text controls

### 5.9 User Clips Module
- User-generated short clips from selected track segments
- Cloudinary upload and delivery lifecycle
- Clip ownership and visibility policies

### 5.10 Visual Engine Module
- Background video themes
- Auto Visual Sync aligned with playback and mood
- Performance-safe rendering strategy for low-power devices

## 6. Data Model (Conceptual)

### 6.1 Key Collections (MongoDB)
- users
- songs
- playlists
- favorites
- rooms
- roomParticipants
- playSessions
- contextSignals
- recommendations
- clips
- activityLogs

### 6.2 Data Design Principles
- Use reference-based modeling for large song libraries and room membership.
- Keep high-write event data (playback telemetry, context snapshots) separated from profile documents.
- Add geospatial indexing strategy for nearby room discovery.
- Maintain audit timestamps for key user and room actions.

## 7. Development Roadmap

## 7.1 Phase 1 - Foundation (Week 1-2)
Goal: Make music play smoothly.

Scope:
- Build basic UI (home and player)
- Setup backend server
- Connect MongoDB
- Implement audio streaming flow
- Add login/signup

Done Criteria:
- Auth works reliably
- User can play songs end-to-end
- Playback remains stable across page navigation

Outcome:
- Functional baseline music playback app

## 7.2 Phase 2 - Core Features (Week 2-3)
Goal: Make the app fully usable.

Scope:
- Playlist system
- Like/favorite songs
- Search functionality
- Basic UI polish

Done Criteria:
- Users can manage personal library effectively
- Search returns useful and consistent results

Outcome:
- Fully usable music app for daily use

## 7.3 Phase 3 - Real-Time + Rooms (Week 3-4)
Goal: Add social uniqueness.

Scope:
- Create listening rooms
- Add real-time playback sync
- Add location-based filtering

Done Criteria:
- Multiple users can join a room and stay synchronized
- Nearby room discovery works with radius filtering

Outcome:
- Shared listening experience enabled

## 7.4 Phase 4 - AI + Experience (Week 4-5)
Goal: Make the app feel intelligent.

Scope:
- Lyrics explanation
- Mood detection
- Emotion-based UI

Done Criteria:
- Lyrics explanation is available and relevant
- UI adapts based on inferred mood/context

Outcome:
- Intelligent, adaptive product identity established

## 7.5 Phase 5 - Advanced Features (Week 5-6)
Goal: Deliver premium engagement.

Scope:
- Voice control
- Background video themes
- User-generated clips

Done Criteria:
- Voice commands reliably control key playback actions
- Visual and clip systems work without degrading core playback

Outcome:
- Modern, interactive, premium app experience

## 7.6 Phase 6 - Optimization (Week 6)
Goal: Production readiness.

Scope:
- Intelligent offline caching
- Performance optimization
- Bug fixing and stability hardening

Done Criteria:
- Offline strategy improves continuity for frequent listeners
- Core user journeys meet performance and reliability targets

Outcome:
- Release-ready product baseline

## 8. Subsystem Design Notes

### 8.1 Audio System Design
- Single global player architecture
- Seamless continuous playback across navigation
- Background playback support strategy
- Media controls integration strategy for lock-screen interactions

### 8.2 Location System Design
- Capture user location with consent-first design
- Store room coordinates
- Radius-based nearby room querying
- Privacy-safe location handling and retention policy

### 8.3 Real-Time System Design
- Host-driven room control model
- Participant join/leave state synchronization
- Playback event synchronization with conflict resolution policy

### 8.4 Offline System Design
- Cache frequently played songs
- Prioritize preload using behavior trends
- Context-aware prefetch logic from Smart Context Engine

### 8.5 UI/UX Strategy
- Dark theme baseline
- Smooth animations and transitions
- Emotion-driven color adaptation
- Clean, minimal, and focused interaction design

## 9. Non-Functional Requirements

### 9.1 Performance
- Fast first interaction and responsive playback controls
- Stable room synchronization under normal network variance
- Efficient media loading via Cloudinary optimization capabilities

### 9.2 Scalability
- Horizontally scalable API layer
- Event-driven room sync handling
- Database indexing and query optimization for search and location

### 9.3 Reliability
- Graceful degradation when network quality drops
- Retry/fallback handling for streaming and real-time events
- Safe session recovery for app refresh and reconnect scenarios

### 9.4 Security and Privacy
- Secure authentication and token lifecycle handling
- Access control for private rooms and protected assets
- User consent model for location and voice features
- Privacy-first handling of behavior and mood-related signals

## 10. Observability and Product Analytics

### 10.1 Operational Monitoring
- API latency and error-rate tracking
- Playback interruption and buffering metrics
- Real-time event delivery health

### 10.2 Product Metrics
- Daily/weekly active users
- Session duration and retention
- Playlist creation and like activity
- Room creation/join conversion
- AI feature engagement rates
- Offline playback success ratio

## 11. Testing and Quality Strategy

### 11.1 Functional Testing
- Playback flows
- Authentication and authorization
- Playlist and search behavior
- Room join/sync/host controls

### 11.2 Experience Testing
- Emotion-driven UI behavior consistency
- Voice command recognition quality
- Lyrics explanation usefulness and clarity

### 11.3 Performance Testing
- High-concurrency room event handling
- Search response under load
- Media delivery responsiveness across device classes

### 11.4 Release Validation
- End-to-end regression checks for all critical user journeys
- Device and network condition validation
- Rollback strategy readiness

## 12. Risks and Mitigations

- Risk: Real-time sync drift in high-latency conditions.
  - Mitigation: Host-authoritative state and periodic sync correction.

- Risk: Privacy sensitivity around location and mood inference.
  - Mitigation: Explicit consent, transparency messaging, and opt-out controls.

- Risk: Feature complexity affecting timeline.
  - Mitigation: Strict phase gates and lock scope before each sprint.

- Risk: Media cost growth.
  - Mitigation: Cloudinary optimization policies and lifecycle cleanup rules.

## 13. Success Criteria (Launch Readiness)

- Core playback, search, playlists, and likes are stable.
- Rooms synchronize reliably for typical group sizes.
- Smart Context Engine influences recommendations and UI in measurable ways.
- Offline caching improves continuity for repeat listeners.
- AI and advanced features enhance engagement without harming performance.
