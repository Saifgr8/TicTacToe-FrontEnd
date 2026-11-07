# TIC TAC TWIST - Executive Summary

## 🎮 Application Overview

**Tic Tac Twist** is a modern, full-stack web application that transforms the classic Tic-Tac-Toe game with advanced "twist" mechanics, multiplayer modes, and real-time synchronization.

### Game Modes
- **Offline PvP**: Two players on the same device
- **Offline vs Bot**: Play against AI opponent
- **Online PvP**: Real-time multiplayer with WebSocket

### Key Features
1. ✅ **6x6 Board Gameplay** with special moves that cost points
2. ✅ **Point-Based Move System** (Normal=0, Twist=3, Override=4, etc.)
3. ✅ **Real-Time WebSocket** for online games (STOMP over SockJS)
4. ✅ **Rock-Paper-Scissors Tiebreaker** to determine symbols
5. ✅ **Dark Mode** with persistent theme storage
6. ✅ **Responsive Design** optimized for mobile & desktop
7. ✅ **Google OAuth** integration for authentication
8. ✅ **30-Second Turn Timer** for time-based gameplay

---

## 🏗️ High-Level Architecture

```
┌─────────────────────────────────────────────────┐
│              TIC TAC TWIST APPLICATION          │
├─────────────────────────────────────────────────┤
│                                                 │
│  FRONTEND (React 19 + Vite)                     │
│  ├── Page Components                            │
│  │   ├── Auth (login/register/Google OAuth)    │
│  │   ├── Homepage (game mode selection)        │
│  │   ├── Offlinepage (game setup)              │
│  │   ├── OfflineGamePage (game board)          │
│  │   ├── OnlinepvpPage (lobby)                 │
│  │   └── GameBoard (online game setup)         │
│  │                                              │
│  ├── UI Components (Reusable)                   │
│  │   ├── GamePlayingBoard (6x6 grid)           │
│  │   ├── GameSpecialMoves (move selector)      │
│  │   ├── PlayerScoreDisplay (status)           │
│  │   ├── RockPaperScissor (tiebreaker)         │
│  │   ├── Timer (30-second turn limit)          │
│  │   └── Dice (random assignment)              │
│  │                                              │
│  ├── Services Layer                             │
│  │   ├── API Services (gameApi, authAxios)     │
│  │   └── WebSocket Service (STOMP)             │
│  │                                              │
│  └── Utilities                                  │
│      ├── cellHelper (board highlighting)       │
│      ├── descriptionHelper (game constants)    │
│      └── ThemeContext (dark mode)              │
│                                                 │
├─────────────────────────────────────────────────┤
│                                                 │
│  COMMUNICATION LAYER                            │
│  ├── REST API (axios)                           │
│  │   └── localhost:8080/api/...                 │
│  │                                              │
│  └── WebSocket (STOMP)                          │
│      └── localhost:8080/gameplay                │
│                                                 │
├─────────────────────────────────────────────────┤
│                                                 │
│  BACKEND (Java Spring Boot)                     │
│  ├── Auth Service                               │
│  ├── Game Logic Engine                          │
│  ├── WebSocket Handler                          │
│  ├── AI/Bot Logic                               │
│  └── Database (persistence)                     │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## 🎯 Core Game Flow

### Offline Game (PvP/Bot)
```
User opens app
  ↓
Authenticate (login/signup/Google OAuth)
  ↓
Click "PLAY Offline"
  ↓
Offlinepage: Dice roll
  ├─ Randomly assign players 1 & 2
  ├─ Assign X/O symbols
  ├─ Choose starting player
  ├─ Select player colors
  └─ Read rules & moves (required)
  ↓
OfflineGamePage: Main Game Loop
  ├─ API: createGameApi() → Get session
  ├─ Render 6x6 board
  ├─ Player 1 makes move
  │  ├─ Select move type (NORMAL, TWIST, etc.)
  │  ├─ Click cell
  │  ├─ API: makeMoveApi() → Submit to backend
  │  └─ Backend validates & processes
  ├─ Receive updated board state
  ├─ Display highlights, score updates
  ├─ Check for win/draw
  ├─ Switch turn (30-second timer)
  ├─ Player 2 makes move (same flow)
  └─ Loop until game ends
  ↓
Game Over
  ├─ Display winner
  └─ Option to play again
```

### Online Game (PvP with Opponent)
```
User opens app
  ↓
Authenticate
  ↓
Click "PLAY Online"
  ↓
OnlinepvpPage: Lobby
  ├─ Search opponent or accept invite
  ├─ WebSocket: Subscribe to /user/queue/lobby
  ├─ Both players ready up
  └─ Countdown begins
  ↓
GameBoard: Setup
  ├─ RockPaperScissor via WebSocket
  │  ├─ Both players make simultaneous choice
  │  ├─ Backend determines winner
  │  ├─ Winner selects X/O symbol
  │  └─ Loser gets opposite symbol
  ↓
WebSocketGameBoard: Main Game Loop
  ├─ STOMP connection to /gameplay
  ├─ Subscribe to /topic/game/{sessionId}
  ├─ Player makes move (if current turn)
  │  ├─ Select move type
  │  ├─ Click cell
  │  └─ Publish to /app/move
  ├─ Backend processes move
  ├─ Broadcast updated board to /topic/game/...
  ├─ All clients receive update
  ├─ Update UI with new board state
  ├─ Display highlights, score updates
  ├─ Check for win/draw
  └─ Switch turn
  ↓
Game Over
  ├─ Display winner
  └─ Option to play again
```

---

## 📊 Game Mechanics

### Board & Win Condition
- **Size**: 6x6 grid
- **Win**: Complete 3 consecutive cells (row, column, diagonal)
- **Points**: 1 point per completed pattern
- **Draw**: Board full, no winner

### Special Moves (The "Twist")

| Move | Cost | Effect | Turns |
|------|------|--------|-------|
| NORMAL | 0 pts | Place symbol in empty cell | 1 |
| EMPTY_CELL | 2 pts | Remove opponent's cell | 1 |
| PATTERN_BOMB | 2 pts | Clear row/column/diagonal | 1 |
| OVERRIDE | 4 pts | Replace 1 opponent symbol | 1 |
| DOUBLE_OVERRIDE | 5 pts | Replace 2 opponent symbols | 2 |
| TWIST | 3 pts | Swap symbols with opponent | 2 |

**Points accumulate** as players complete patterns. Special moves require minimum points.

---

## 🔧 Technology Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| UI Framework | React 19 | Component-based UI |
| Build Tool | Vite 7 | Fast dev & production build |
| Styling | Tailwind CSS 4 | Utility-first CSS |
| Animations | Framer Motion 12 | Smooth transitions |
| Routing | React Router 7 | Client-side navigation |
| Forms | React Hook Form 7 | Form validation |
| Real-Time | STOMP + SockJS | WebSocket messaging |
| HTTP | Axios 1 | REST API calls |
| Auth | Google OAuth 2 | SSO authentication |
| Icons | Lucide React | UI icons |
| Notifications | React Toastify 11 | Toast messages |
| Linter | ESLint 9 | Code quality |

---

## 📁 Project Organization

### Folder Structure
```
src/
├── components/           # All React components
│   ├── auth/            # Authentication (Auth, AuthUI)
│   ├── game/            # Online game (GameBoard)
│   ├── homepage/        # Landing page
│   ├── offlinePage/     # Offline game setup & play
│   ├── onlinePVPPage/   # Online lobby & matching
│   ├── Ui/              # Reusable UI components (20+ components)
│   └── utils/           # Helper functions (cellHelper, colors, descriptions)
├── api/                 # API services & networking
│   ├── axios/           # Authentication API
│   ├── game/            # Game REST & WebSocket services
│   └── player/          # Player-related APIs
├── context/             # Global state (ThemeContext for dark mode)
├── webSocket/           # WebSocket game service (STOMP client)
└── [Entry points]
    ├── App.jsx          # Main app with routing
    ├── Layout.jsx       # Navbar + main layout
    ├── main.jsx         # React root
```

---

## 🚀 Current Implementation Status

### ✅ COMPLETED
1. ✅ Full offline game (PvP & Bot modes)
2. ✅ 6x6 board rendering with highlight effects
3. ✅ All special moves defined & working
4. ✅ Score tracking & point system
5. ✅ Win/draw detection
6. ✅ 30-second turn timer
7. ✅ Authentication (email/password + Google OAuth)
8. ✅ Dark mode toggle (persistent)
9. ✅ Responsive UI (mobile & desktop)
10. ✅ Online lobby & player matching (partially)
11. ✅ Rock-Paper-Scissors tiebreaker (via WebSocket)
12. ✅ Toast notifications & error handling

### ⚠️ PARTIALLY IMPLEMENTED
1. ⚠️ **Online Game Board** — WebSocket structure exists, but may need verification/bug fixes
2. ⚠️ **AI/Bot Logic** — Backend implements; frontend just flags `player2 = "tictacbot"`
3. ⚠️ **Error Recovery** — Basic error handling; could use auto-reconnect for WebSocket

### ❌ NOT YET IMPLEMENTED
1. ❌ **Player Statistics** — No profile/leaderboard
2. ❌ **Match History** — No past game tracking
3. ❌ **In-Game Chat** — No player messaging
4. ❌ **Unit/E2E Tests** — Manual testing only
5. ❌ **TypeScript** — Project is pure JavaScript
6. ❌ **Advanced Error Recovery** — No retry mechanism for failed API calls

---

## 🔌 API & Communication

### REST API Endpoints

**Base URL**: `http://localhost:8080/api`

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/auth/register` | POST | User signup |
| `/auth/login` | POST | User login |
| `/auth/google/callback` | POST | Google OAuth |
| `/match/create` | POST | Create game session |
| `/match/move` | POST | Submit a move |
| `/invite` | POST | Send player invite |

### WebSocket (STOMP) Endpoints

**Connection**: `ws://localhost:8080/gameplay?username=...`

| Topic | Direction | Purpose |
|-------|-----------|---------|
| `/app/create` | Publish | Create online game |
| `/app/move` | Publish | Submit move (online) |
| `/app/invite` | Publish | Send invite |
| `/app/ready` | Publish | Signal readiness |
| `/topic/game/{sessionId}` | Subscribe | Game broadcast |
| `/topic/rps/{matchId}` | Subscribe | RPS results |
| `/user/queue/rps-result` | Subscribe | Your RPS result |
| `/user/queue/lobby` | Subscribe | Lobby messages |

---

## 💾 State Management

### Storage Layers

1. **localStorage** (session setup)
   - `username`: Current logged-in user
   - `token`: JWT from auth
   - `player1`, `player2`: Game setup
   - `player1Symbol`, `player2Symbol`: Move assignments
   - `theme`: Dark/light mode preference

2. **Component State** (React useState)
   - Board state
   - Current player
   - Move selections
   - Score tracking
   - Game status (ongoing, won, draw)

3. **Context API** (Global)
   - Dark mode theme (ThemeContext)

4. **WebSocket State** (Real-time sync)
   - Game session updates from backend
   - Opponent's moves
   - Turn changes

---

## 🎨 UI/UX Highlights

### Design Principles
- **Dark Mode First**: All components support light & dark themes
- **Responsive**: Mobile (320px) → Tablet (768px) → Desktop (1920px)
- **Accessibility**: Keyboard navigation, clear error messages
- **Smooth Animations**: Framer Motion for transitions
- **Consistent Styling**: Tailwind utility classes

### Key UI Components
- **GamePlayingBoard**: 6x6 grid with cell highlighting
- **GameSpecialMoves**: Move selector with affordability checks
- **PlayerScoreDisplay**: Score cards with player info
- **RockPaperScissor**: Tiebreaker game UI
- **Timer**: 30-second countdown display
- **Dice**: Random assignment animation

---

## 🚨 Key Architectural Considerations

### Online vs Offline Game Differences

**Offline Game**:
- Uses REST API (`createGameApi`, `makeMoveApi`)
- Component state manages game flow
- Backend validates moves & updates board
- Frontend gets complete updated state after each move

**Online Game**:
- Uses WebSocket (STOMP) for real-time sync
- STOMP client manages game connection
- Backend broadcasts to all players
- Lower latency, better UX for multiplayer

### Error Handling
- **API Errors**: Toast notifications + user feedback
- **Network Errors**: Retry mechanism (not yet implemented)
- **Validation Errors**: Display in UI
- **WebSocket Disconnect**: Auto-reconnect (planned)

---

## 🔄 Data Flow Example: Making a Move (Offline)

```javascript
// User clicks cell (i=2, j=3)
makeMove(2, 3)
  ↓
const payload = {
  sessionId,
  x: 2, y: 3,
  symbol: currentPlayerSymbol,
  moveType: "NORMAL" or "TWIST" etc.,
  patternType: "NONE" or "ROW" etc.,
  board: currentBoard,
  token: localStorage.getItem("token")
}
  ↓
makeMoveApi(payload)  // HTTP POST /api/match/move
  ↓
Backend:
  ├─ Validate move (cell empty, player turn, etc.)
  ├─ Apply move logic
  ├─ Check for win/draw
  ├─ Update board state
  └─ Return updated session
  ↓
Frontend receives:
{
  board: [[...], [...], ...],        // Updated 6x6 board
  currentPlayer: "player2",          // Turn switched
  player1Points: 2,
  player2Points: 1,
  threePatterns: ["H-2-1-2-3", ...], // Patterns to highlight
  winner: null,                      // No winner yet
  gameStatus: "ONGOING",
  twistActive: false,
  ...
}
  ↓
setBoard(newBoard)
setSession(updatedSession)
setCurrentPlayerSymbol(newSymbol)
setPlayer1Points(...)
setPlayer2Points(...)
  ↓
Component re-renders with new state
User sees:
  ├─ Updated board with new symbol
  ├─ Highlighted cells (threePatterns)
  ├─ Updated scores
  ├─ Turn switched to Player 2
  └─ Waits for Player 2's move
```

---

## 📋 Checklist for Adding New Features

Before implementing new features:

- [ ] Understand existing game flow
- [ ] Check if data persists in localStorage or state
- [ ] Plan API changes (if needed) with backend
- [ ] Ensure mobile & desktop responsiveness
- [ ] Support dark mode in all UI
- [ ] Add error handling & toast notifications
- [ ] Test with WebSocket connection (if online feature)
- [ ] Verify in both offline & online modes

---

## 🎓 Quick Learning Paths

**To understand the project:**
1. Start with `App.jsx` → routing structure
2. Read `Homepage.jsx` → game mode selection
3. Study `Offlinepage.jsx` → game setup flow
4. Deep dive into `OfflineGamePage.jsx` → main game logic
5. Check `webSocketService.jsx` → online game synchronization
6. Review `gameApi.js` & `authAxios.js` → API layer

**To add a new feature:**
1. Check `PROJECT_ANALYSIS.md` for similar existing features
2. Follow patterns in `copilot-instructions.md`
3. Refer to `descriptionHelper.js` for game constants
4. Use existing API services as templates
5. Test on mobile + desktop, light + dark modes

---

## 📞 Documentation

- **PROJECT_ANALYSIS.md** — Detailed architecture, class breakdown, data flow
- **copilot-instructions.md** — Development guidelines, patterns, conventions
- **This File** — Quick reference for stakeholders

---

**Project Status**: 🟢 Core game fully functional. Online multiplayer & special features in testing.

