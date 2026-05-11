# Dhuno Frontend Design Handoff Document

Version: 1.0
Date: 2026-04-08
Prepared for: UI and UX Design Team
Product: Dhuno - Smart Music Experience
Tech Context: MERN frontend (React) with Cloudinary media delivery

## 1. Purpose of This Document
This document defines complete frontend design requirements for Dhuno so a UI designer can design every required screen without ambiguity.

It includes:
- Total screen and page count
- Full information architecture
- Per-page field placement
- UI component requirements
- Color grading and palette system
- Typography, spacing, and motion rules
- Accessibility and responsive behavior
- Design handoff checklist

## 2. Frontend Product Goals
- Deliver a smooth music playback experience with a single global player.
- Support social listening through real-time rooms.
- Build a mood and context-aware interface.
- Keep interactions fast, minimal, and immersive.
- Maintain visual consistency across all pages and states.

## 3. Design Scope and Page Count

### 3.1 Final Screen Inventory
Total unique pages and major screens: 26
Total required modals, drawers, and bottom sheets: 14
Total design surfaces for handoff: 40

Platform deliverable requirement:
- Desktop page variants required: 26
- Mobile page variants required: 26
- Minimum page frames to deliver: 52
- Modals, drawers, and sheets must include responsive specs for both desktop and mobile behavior.

### 3.2 Mandatory Design Coverage by Phase
- Phase 1 to 2 foundation and core: 13 pages
- Phase 3 real-time and rooms: 4 pages
- Phase 4 to 5 AI and advanced: 7 pages
- Phase 6 optimization and offline: 2 pages

### 3.3 Platform Coverage Rule (Mandatory)
Every page in Section 4 must be designed for both platforms:
- Desktop design: 1440-width reference frame
- Mobile design: 390-width reference frame

Designer output expectation:
- One desktop frame and one mobile frame for each of the 26 pages.
- If a page includes dynamic states, provide at least one state example per platform.

## 4. Information Architecture

### 4.1 Public Flow
1. Splash
2. Onboarding
3. Login
4. Signup
5. Forgot Password

### 4.2 Authenticated Core App Flow
6. Home
7. Search
8. Song Details
9. Full Player
10. Library
11. Playlist Detail
12. Liked Songs
13. Recently Played
14. Profile
15. Settings

### 4.3 Social and Real-Time Flow
16. Rooms Discovery
17. Create Room
18. Room Live Session
19. Smart Room Details

### 4.4 AI and Smart Experience Flow
20. Lyrics Explanation View
21. Mood and Context Insights
22. Voice Command Overlay

## 4.5 Advanced Engagement Flow
23. Clips Feed
24. Clip Creator

### 4.6 Optimization Flow
25. Offline and Downloads Center
26. Storage and Cache Control

## 5. Navigation Model

### 5.1 Desktop Navigation
- Left rail navigation:
  - Home
  - Search
  - Library
  - Rooms
  - Clips
  - Profile
- Persistent bottom mini player across all authenticated pages.
- Top utility bar for notifications, context mode, and quick actions.

### 5.2 Mobile Navigation
- Bottom tab bar:
  - Home
  - Search
  - Player
  - Rooms
  - Library
- Swipe-up full player from mini player.
- Floating quick action for voice command and create room.

## Part A - Laptop/Desktop Design Specification

Applies to: Laptop and desktop web app experience.
Reference frame: 1440 width.

### A.1 Desktop Layout Foundation
- Primary navigation: left rail with persistent visibility.
- Utility actions: top bar for search shortcut, notifications, and context indicator.
- Playback persistence: mini player anchored to bottom across all app routes.
- Primary content pattern: multi-column sections with high information density.

### A.2 Desktop Page Coverage
All 26 pages are mandatory in desktop variant:
1. Splash
2. Onboarding
3. Login
4. Signup
5. Forgot Password
6. Home
7. Search
8. Song Details
9. Full Player
10. Library
11. Playlist Detail
12. Liked Songs
13. Recently Played
14. Profile
15. Settings
16. Rooms Discovery
17. Create Room
18. Room Live Session
19. Smart Room Details
20. Lyrics Explanation View
21. Mood and Context Insights
22. Voice Command Overlay
23. Clips Feed
24. Clip Creator
25. Offline and Downloads Center
26. Storage and Cache Control

### A.3 Desktop Placement Guidance by Page Type
- Authentication pages: split visual and form layout with strong hierarchy.
- Home and discovery pages: 2 to 4 content columns with card rails and contextual side panels.
- Player surfaces: center-dominant media area with side queue and output controls.
- Room live session: split-screen with shared player center and participants/chat side panel.
- Settings and profile pages: left section navigation and right editable content panel.
- Clips and feed pages: masonry or dense card list optimized for wide screens.

### A.4 Desktop Component Behavior
- Hover states must be defined for all clickable elements.
- Keyboard-first focus navigation must be supported across controls and dialogs.
- Modals should appear centered with dimmed backdrop.
- Drawers should open from right side for queue, share, and details contexts.

## Part B - Mobile Design Specification

Applies to: Mobile web or PWA experience.
Reference frame: 390 width.

### B.1 Mobile Layout Foundation
- Primary navigation: bottom tab bar.
- Primary playback interaction: sticky mini player and swipe-up full player.
- Primary content pattern: single-column feeds with progressive disclosure.
- Quick actions: floating action for voice command and room creation.

### B.2 Mobile Page Coverage
All 26 pages are mandatory in mobile variant:
1. Splash
2. Onboarding
3. Login
4. Signup
5. Forgot Password
6. Home
7. Search
8. Song Details
9. Full Player
10. Library
11. Playlist Detail
12. Liked Songs
13. Recently Played
14. Profile
15. Settings
16. Rooms Discovery
17. Create Room
18. Room Live Session
19. Smart Room Details
20. Lyrics Explanation View
21. Mood and Context Insights
22. Voice Command Overlay
23. Clips Feed
24. Clip Creator
25. Offline and Downloads Center
26. Storage and Cache Control

### B.3 Mobile Placement Guidance by Page Type
- Authentication pages: single-column centered form with compact brand block.
- Home and discovery pages: stacked sections with horizontal carousels where needed.
- Player surfaces: full-screen immersive player with bottom-sheet queue.
- Room live session: vertically stacked layout with collapsible participants/chat.
- Settings and profile pages: grouped cards with sticky save actions where needed.
- Clips and feed pages: vertical immersive feed with gesture-friendly controls.

### B.4 Mobile Component Behavior
- All controls must be thumb-reachable in primary flows.
- Minimum touch target: 44 by 44 px for interactive elements.
- Bottom sheets are preferred over center modals for action-heavy interactions.
- Swipe gestures must include clear visual affordance and cancel behavior.

## 6. Shared Detailed Page Specifications (Fields and Placement)

Platform note for all pages in Section 6:
- Each page below is mandatory in both desktop and mobile versions.
- Keep field names and actions consistent across platforms; only layout and interaction patterns should adapt.

## 6.1 Splash Page
Purpose: Brand entry and app loading state.

Layout zones:
- Center: Dhuno logo and animated waveform mark
- Bottom: Loading state text and progress pulse

Fields and elements:
- Logo mark
- Product tagline
- Loading indicator

## 6.2 Onboarding Page
Purpose: Explain value and capture permissions context.

Layout zones:
- Top: Visual storytelling cards
- Middle: Feature highlights
- Bottom: Primary actions

Fields and elements:
- Slide title
- Slide description
- Skip action
- Next action
- Enable location button
- Enable notifications button

## 6.3 Login Page
Purpose: User authentication.

Layout zones:
- Left or top visual panel: Branding visual
- Form card center
- Footer links

Fields:
- Email input
- Password input
- Remember me toggle
- Login button
- Continue with provider options
- Forgot password link
- Signup redirect link

Validation requirements:
- Inline error text
- Invalid credentials feedback
- Loading state on submission

## 6.4 Signup Page
Purpose: New account creation.

Fields:
- Full name
- Email
- Password
- Confirm password
- Terms acceptance checkbox
- Create account button

Optional fields:
- Username
- Music preference chips

## 6.5 Forgot Password Page
Fields:
- Registered email input
- Send reset link button
- Return to login link

## 6.6 Home Page
Purpose: Main personalized dashboard.

Layout zones:
- Header: Greeting, mood chip, quick search
- Hero: Continue listening card
- Section 1: Recommended for you
- Section 2: Nearby active rooms
- Section 3: Mood-based mixes
- Section 4: Recently played
- Bottom: Persistent mini player

Fields and elements:
- User avatar
- Greeting text
- Time context label
- Search trigger
- Song cards with artwork, title, artist, duration
- Room cards with distance, participants, live state
- Mood chips
- Quick actions: Play, Like, Add to Playlist

## 6.7 Search Page
Purpose: Discover songs, artists, rooms, and clips.

Layout zones:
- Top sticky search bar
- Filter row
- Result tabs
- Results grid/list

Fields:
- Search input
- Voice search trigger
- Filter chips: Songs, Artists, Rooms, Clips, Mood
- Sort dropdown
- Recent searches list
- Trending query list

## 6.8 Song Details Page
Purpose: Song context and actions.

Layout zones:
- Left or top: Artwork and play controls
- Right or bottom: Lyrics, info, explanation panel trigger

Fields:
- Song title
- Artist
- Album
- Duration
- Like button
- Add to playlist button
- Share button
- Open lyrics explanation action
- Background theme preview selector

## 6.9 Full Player Page
Purpose: Primary immersive playback interface.

Layout zones:
- Center: Large artwork or video theme
- Bottom controls cluster
- Side panels for queue and device output

Fields and controls:
- Song title and artist
- Progress scrubber
- Current time and total duration
- Previous, play or pause, next
- Shuffle and repeat controls
- Volume control
- Lyrics toggle
- Visual mode toggle
- Cast or output device selector

## 6.10 Library Page
Purpose: Personal music organization.

Sections:
- Playlists
- Liked songs
- Downloads
- Recently played

Fields:
- Create playlist button
- Playlist cards
- Total tracks count
- Last updated timestamp

## 6.11 Playlist Detail Page
Purpose: Playlist viewing and management.

Fields:
- Playlist cover image
- Playlist title
- Description
- Owner
- Total duration
- Track list table or list
- Play all action
- Edit playlist action
- Remove track action
- Reorder handle

## 6.12 Liked Songs Page
Fields:
- Song list rows
- Bulk play action
- Remove from likes action
- Add selected to playlist action

## 6.13 Recently Played Page
Fields:
- Chronological grouped list
- Quick replay action
- Clear history confirmation action

## 6.14 Rooms Discovery Page
Purpose: Find social listening rooms by location and relevance.

Layout zones:
- Top: Search and radius controls
- Middle: Map and list toggle
- Bottom: Recommended rooms rail

Fields:
- Location status badge
- Radius selector
- Room type filters: Public, Friends, Genre
- Room card details: name, host, distance, listeners, current song
- Join room action

## 6.15 Create Room Page
Fields:
- Room name
- Room description
- Privacy type
- Genre tags
- Max listeners
- Allow guest control toggle
- Location visibility toggle
- Create room button

## 6.16 Room Live Session Page
Purpose: Synchronized listening room.

Layout zones:
- Header: Room metadata and host controls
- Center: Shared player and queue
- Side: Participant list and chat panel

Fields and controls:
- Room name
- Host badge
- Participant count
- Current playing song
- Sync status indicator
- Invite action
- Leave room action
- Host-only playback controls

## 6.17 Smart Room Details Page
Purpose: Show why a room is recommended.

Fields:
- Matching score
- Match reasons: mood, distance, genre, activity
- Join now action
- Save for later action

## 6.18 Lyrics Explanation View
Purpose: AI explanation and song meaning.

Fields:
- Original lyric lines
- Explanation panel
- Language selector
- Tone selector: simple, deep, poetic
- Save notes action

## 6.19 Mood and Context Insights Page
Purpose: Explain current UI and recommendation adaptation.

Fields:
- Current detected mood
- Time context
- Activity context
- Applied theme summary
- Why this recommendation panel
- Change mood manually action

## 6.20 Voice Command Overlay
Purpose: Hands-free control.

Fields:
- Listening animation
- Transcript text
- Suggested commands list
- Permission status
- Cancel and retry actions

## 6.21 Clips Feed Page
Purpose: Discover user-generated short clips.

Fields:
- Clip cards with cover, waveform, creator
- Like clip action
- Share clip action
- Open full song action
- Follow creator action

## 6.22 Clip Creator Page
Purpose: Create and publish clips.

Fields:
- Source song selector
- Timeline trimmer
- Start and end markers
- Clip title
- Clip caption
- Cover frame selector
- Publish visibility options
- Upload action

## 6.23 Profile Page
Fields:
- Avatar
- Display name
- Bio
- Followers and following counters
- Public playlists section
- Public clips section

## 6.24 Settings Page
Sections and fields:
- Account:
  - Name
  - Email
  - Password change action
- Playback:
  - Audio quality
  - Gapless playback toggle
  - Normalize volume toggle
- Privacy:
  - Location visibility
  - Room visibility
- Notifications:
  - Push toggle
  - Email toggle
- Appearance:
  - Theme mode
  - Motion intensity

## 6.25 Offline and Downloads Center
Fields:
- Downloaded songs count
- Storage used and available
- Smart cache mode toggle
- Preload on Wi-Fi toggle
- Clear cache action
- Auto-download rules

## 7. Required Modals, Drawers, and Bottom Sheets

1. Create playlist modal
2. Edit playlist modal
3. Add to playlist bottom sheet
4. Queue drawer
5. Device output picker
6. Share sheet
7. Join room confirmation
8. Leave room confirmation
9. Room invite modal
10. Lyrics explanation quick sheet
11. Voice permission modal
12. Delete clip confirmation
13. Cache clear confirmation
14. Global error and retry modal

## 8. Full Frontend Requirement Matrix

## 8.1 Functional Requirements
- Global music player persists across route changes.
- Playback controls respond within one tap without visual lag.
- Search supports songs, artists, rooms, and clips.
- Users can create and manage playlists.
- Users can like and unlike songs and clips.
- Rooms support synchronized playback and live participant updates.
- Nearby rooms are filterable by radius and type.
- Lyrics explanation supports at least one default explanation mode.
- Emotion-driven theme updates are smooth and reversible.
- Voice command overlay supports key playback commands.
- Offline center exposes cache and download control clearly.

## 8.2 Non-Functional Frontend Requirements
- First meaningful paint target on strong network: under 2.5 seconds.
- Interaction latency target for core controls: under 100 ms.
- Visual frame stability during playback screen transitions.
- Graceful fallback for low bandwidth and offline states.
- All primary flows must support dark theme baseline.

## 8.3 Accessibility Requirements
- Minimum text contrast ratio 4.5:1 for body text.
- Keyboard and focus support for all interactive controls.
- Visible focus state for all buttons and inputs.
- Touch targets minimum 44 by 44 px.
- Voice and motion alternatives for users with reduced motion preference.

## 9. Visual System

## 9.1 Brand Visual Direction
- Cinematic dark interface with expressive color accents.
- Floating glassy surfaces with soft depth.
- Music-first storytelling with animated audio-reactive elements.

## 9.2 Core Color Palette

### Neutral Foundation
- Background 900: #090D14
- Background 800: #101826
- Surface 700: #172235
- Surface 600: #1E2D45
- Border soft: #2A3E5E
- Text primary: #F3F7FF
- Text secondary: #B8C7E0
- Text muted: #8799B8

### Brand and Functional Colors
- Primary aqua: #2DE2C5
- Secondary sky: #53B7FF
- Accent coral: #FF6F7D
- Accent amber: #FFC857
- Success: #2ECC9A
- Warning: #FFB648
- Error: #FF5A6F
- Info: #71A8FF

## 9.3 Color Grading and Mood Themes
The UI adapts color overlays by mood state while preserving readability.

### Calm Mode
- Gradient: #0F2027 to #203A43 to #2C5364
- Accent shift: increase aqua usage
- Animation intensity: low

### Energetic Mode
- Gradient: #3A1C71 to #D76D77 to #FFAF7B
- Accent shift: coral and amber emphasis
- Animation intensity: high

### Focus Mode
- Gradient: #141E30 to #243B55
- Accent shift: sky and cool neutrals
- Animation intensity: minimal

### Reflective Mode
- Gradient: #232526 to #414345
- Accent shift: muted blue-gray and soft coral highlights
- Animation intensity: medium

Usage rule:
- Mood palette affects backgrounds, glow accents, and equalizer visuals.
- Core text and interactive contrast tokens never change below accessibility threshold.

## 9.4 Gradient and Overlay Rules
- Hero overlays: 35 to 55 percent opacity depending on artwork brightness.
- Card overlays: 12 to 18 percent opacity.
- Glass blur radius: 12 to 20 px based on density.

## 10. Typography System

Primary display typeface: Sora
Secondary text typeface: Manrope
Fallback: sans-serif

Type scale:
- Display XL: 48 px, weight 700
- Display L: 40 px, weight 700
- Heading 1: 32 px, weight 700
- Heading 2: 24 px, weight 600
- Heading 3: 20 px, weight 600
- Body L: 18 px, weight 500
- Body M: 16 px, weight 500
- Body S: 14 px, weight 500
- Caption: 12 px, weight 500

Line height guideline:
- Headlines: 120 percent
- Body: 145 percent

## 11. Spacing, Grid, and Layout

- Base spacing unit: 8 px
- Grid desktop: 12 columns, 80 px max content width per column
- Grid tablet: 8 columns
- Grid mobile: 4 columns
- Page max width desktop content: 1440 px
- Safe side padding:
  - Desktop: 32 px
  - Tablet: 24 px
  - Mobile: 16 px

## 12. Component Library Requirements

Core components required:
- Top navigation bar
- Side rail and mobile tab bar
- Song card and room card
- Artist chip and mood chip
- Primary, secondary, tertiary buttons
- Icon button states
- Input field states
- Search bar variants
- Toggle and segmented controls
- Toast and inline alert
- Modal and bottom sheet shell
- Drawer shell
- Mini player and full player controls
- Progress bars and waveform scrubber

State coverage for each component:
- Default
- Hover
- Active
- Focus
- Disabled
- Loading
- Error where applicable

## 13. Motion and Interaction Guidelines

Motion principles:
- Responsive and meaningful, never decorative noise.
- Prioritize playback continuity and orientation.

Duration guide:
- Quick interactions: 120 to 180 ms
- Standard transitions: 220 to 300 ms
- Page transitions: 300 to 420 ms

Easing guide:
- Enter: ease-out cubic
- Exit: ease-in cubic
- Emphasis: spring-like easing for player reactions

Required animations:
- Mini player to full player morph transition
- Staggered reveal for song lists
- Room participant live pulse indicators
- Audio-reactive background visual pulse

## 14. Responsive Behavior Requirements

Reference breakpoints for design:
- Desktop: 1280 to 1440 and above
- Tablet: 768 to 1279
- Mobile: 360 to 430

Desktop behavior:
- Side rail visible
- Multi-column content sections
- Split-screen room session layout

Tablet behavior:
- Collapsible side rail
- Two-column home sections
- Compact live room participant panel

Mobile behavior:
- Bottom navigation only
- Single-column feed patterns
- Sticky mini player always visible
- Swipe gestures for player and queue

## 15. Empty, Loading, Error, and Offline States

Each key page must include all four states:
- Empty state with action prompt
- Skeleton loading state
- Error state with retry action
- Offline state with cached fallback where possible

Required pages for full state design:
- Home
- Search
- Playlist Detail
- Rooms Discovery
- Room Live Session
- Clips Feed
- Offline Center

## 16. Content and Microcopy Guidelines

Tone:
- Friendly, clear, and human.
- Avoid technical wording in user-facing labels.

Label style:
- Action-first button labels such as Play Now, Join Room, Save Clip.
- Avoid ambiguous labels such as Submit or Confirm where context is unclear.

## 17. Designer Handoff Checklist

The UI team must deliver:
1. Full page designs for all 26 pages in both desktop and mobile variants (minimum 52 frames).
2. Light and dark review screens if future light mode is considered.
3. Component library with all interaction states.
4. Design tokens file for color, spacing, typography, radii, and shadows.
5. Prototype for critical flows:
   - Authentication flow
   - Play and queue flow
   - Room join and sync flow
   - Clip creation flow
   - Offline control flow
6. Accessibility contrast verification report.
7. Responsive breakpoints demonstration for desktop, tablet, and mobile.
8. Platform behavior notes for every modal, drawer, and bottom sheet.

## 18. Priority for Designer Execution

Priority 1:
- Login, Signup, Home, Full Player, Search, Library, Playlist Detail

Priority 2:
- Rooms Discovery, Create Room, Room Live Session, Lyrics Explanation

Priority 3:
- Clips Feed, Clip Creator, Mood and Context Insights, Offline Center, Settings

## 19. Acceptance Criteria for UI Signoff

Design can be approved for implementation when:
- All pages and required states are complete.
- Every field listed in this document is represented with clear placement.
- Color grading and mood palettes are mapped to real page surfaces.
- Component state consistency is validated.
- Responsive and accessibility criteria are satisfied.

## 20. Figma Frame Naming Template (Page-by-Page)

Use this naming syntax for every frame:
- [Page]-[Platform]-[Variant]-[State]-[Theme]-v01

Naming token reference:
- Platform: Desktop or Mobile
- Variant: Default, Alternate, Modal, Drawer, Sheet
- State: Default, Loading, Empty, Error, Offline
- Theme: Dark or Light

Page-by-page base frame names:
1. Splash-Desktop-Default-Default-Dark-v01 and Splash-Mobile-Default-Default-Dark-v01
2. Onboarding-Desktop-Default-Default-Dark-v01 and Onboarding-Mobile-Default-Default-Dark-v01
3. Login-Desktop-Default-Default-Dark-v01 and Login-Mobile-Default-Default-Dark-v01
4. Signup-Desktop-Default-Default-Dark-v01 and Signup-Mobile-Default-Default-Dark-v01
5. ForgotPassword-Desktop-Default-Default-Dark-v01 and ForgotPassword-Mobile-Default-Default-Dark-v01
6. Home-Desktop-Default-Default-Dark-v01 and Home-Mobile-Default-Default-Dark-v01
7. Search-Desktop-Default-Default-Dark-v01 and Search-Mobile-Default-Default-Dark-v01
8. SongDetails-Desktop-Default-Default-Dark-v01 and SongDetails-Mobile-Default-Default-Dark-v01
9. FullPlayer-Desktop-Default-Default-Dark-v01 and FullPlayer-Mobile-Default-Default-Dark-v01
10. Library-Desktop-Default-Default-Dark-v01 and Library-Mobile-Default-Default-Dark-v01
11. PlaylistDetail-Desktop-Default-Default-Dark-v01 and PlaylistDetail-Mobile-Default-Default-Dark-v01
12. LikedSongs-Desktop-Default-Default-Dark-v01 and LikedSongs-Mobile-Default-Default-Dark-v01
13. RecentlyPlayed-Desktop-Default-Default-Dark-v01 and RecentlyPlayed-Mobile-Default-Default-Dark-v01
14. Profile-Desktop-Default-Default-Dark-v01 and Profile-Mobile-Default-Default-Dark-v01
15. Settings-Desktop-Default-Default-Dark-v01 and Settings-Mobile-Default-Default-Dark-v01
16. RoomsDiscovery-Desktop-Default-Default-Dark-v01 and RoomsDiscovery-Mobile-Default-Default-Dark-v01
17. CreateRoom-Desktop-Default-Default-Dark-v01 and CreateRoom-Mobile-Default-Default-Dark-v01
18. RoomLiveSession-Desktop-Default-Default-Dark-v01 and RoomLiveSession-Mobile-Default-Default-Dark-v01
19. SmartRoomDetails-Desktop-Default-Default-Dark-v01 and SmartRoomDetails-Mobile-Default-Default-Dark-v01
20. LyricsExplanation-Desktop-Default-Default-Dark-v01 and LyricsExplanation-Mobile-Default-Default-Dark-v01
21. MoodContextInsights-Desktop-Default-Default-Dark-v01 and MoodContextInsights-Mobile-Default-Default-Dark-v01
22. VoiceCommandOverlay-Desktop-Default-Default-Dark-v01 and VoiceCommandOverlay-Mobile-Default-Default-Dark-v01
23. ClipsFeed-Desktop-Default-Default-Dark-v01 and ClipsFeed-Mobile-Default-Default-Dark-v01
24. ClipCreator-Desktop-Default-Default-Dark-v01 and ClipCreator-Mobile-Default-Default-Dark-v01
25. OfflineDownloadsCenter-Desktop-Default-Default-Dark-v01 and OfflineDownloadsCenter-Mobile-Default-Default-Dark-v01
26. StorageCacheControl-Desktop-Default-Default-Dark-v01 and StorageCacheControl-Mobile-Default-Default-Dark-v01

Required state frame examples for key pages:
- Home-Desktop-Default-Loading-Dark-v01 and Home-Mobile-Default-Loading-Dark-v01
- Home-Desktop-Default-Empty-Dark-v01 and Home-Mobile-Default-Empty-Dark-v01
- Search-Desktop-Default-Error-Dark-v01 and Search-Mobile-Default-Error-Dark-v01
- PlaylistDetail-Desktop-Default-Offline-Dark-v01 and PlaylistDetail-Mobile-Default-Offline-Dark-v01
- RoomsDiscovery-Desktop-Default-Loading-Dark-v01 and RoomsDiscovery-Mobile-Default-Loading-Dark-v01
- RoomLiveSession-Desktop-Default-Error-Dark-v01 and RoomLiveSession-Mobile-Default-Error-Dark-v01

Modal, drawer, and sheet naming format:
- [ParentPage]-[ComponentName]-[Platform]-[Variant]-[State]-[Theme]-v01

Examples:
- Home-CreatePlaylist-Desktop-Modal-Default-Dark-v01
- FullPlayer-Queue-Mobile-Sheet-Default-Dark-v01
- RoomLiveSession-Invite-Desktop-Modal-Default-Dark-v01

Figma page structure recommendation:
1. 00_Cover
2. 01_Foundations
3. 02_Components
4. 03_Desktop_Pages
5. 04_Mobile_Pages
6. 05_Modals_Drawers_Sheets
7. 06_States
8. 07_Prototypes
9. 08_Handoff

---

This is the official frontend design handoff for Dhuno and should be used by the UI and UX team as the baseline design contract.
