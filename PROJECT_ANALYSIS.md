# TIC TAC TWIST - Project Analysis & Architecture Overview

## 1. PROJECT PURPOSE & OVERVIEW

**Tic Tac Twist** is a modern, full-stack web application that reimagines the classic Tic-Tac-Toe game with advanced mechanics and strategic gameplay. The application supports both offline (PvP and PvBot) and online multiplayer modes with real-time WebSocket communication.

### Key Innovation
The "twist" in the game introduces special moves and mechanics that add complexity and strategy beyond traditional Tic-Tac-Toe:
- **Twist Mode**: Exchange symbols with opponent for a limited duration
- **Override**: Replace opponent's symbols with your own
- **Double Override**: Replace two opponent symbols in one turn
- **Empty Pattern**: Clear entire rows/columns/diagonals
- **Empty Cell**: Remove opponent's single cell

### Deployment Model
- **Frontend**: React 19 SPA (Single Page Application) with Vite
- **Backend**: Java Spring Boot (localhost:8080)
- **Database**: Not explicitly seen in frontend, but referenced in API calls
- **Communication**: REST API + WebSocket (STOMP over SockJS)

---

## 2. TECHNOLOGIES & DEPENDENCIES

### Frontend Stack

#### Core Framework
- **React 19.1.0**: Modern component-based UI library with hooks
- **Vite 7.0.4**: Ultra-fast build tool with HMR (Hot Module Replacement)
- **React Router DOM 7.6.3**: Client-side routing for page navigation

#### UI & Styling
- **Tailwind CSS 4.1.11**: Utility-first CSS framework (@tailwindcss/vite 4.1.11 for vite integration)
- **Framer Motion 12.23.24**: Advanced animation library for smooth transitions
- **Lucide React 0.525.0**: Icon library for UI elements (BrickWall, Scissors, ScrollText, etc.)
- **Lottie React 2.4.1**: Animation playback (supports .json lottie files)

#### Form & State Management
- **React Hook Form 7.60.0**: Efficient form validation and submission
- **React Toastify 11.0.5**: Toast notifications for user feedback

#### Real-Time Communication
- **@stomp/stompjs 7.1.1**: STOMP protocol client for WebSocket messaging
- **sockjs-client 1.6.1**: WebSocket emulation fallback
- **Axios 1.10.0**: HTTP client for REST API calls

#### Authentication
- **@react-oauth/google 0.12.2**: Google OAuth 2.0 integration for SSO

#### Development Tools
- **ESLint 9.30.1**: Code quality and style checking
- **@vitejs/plugin-react 4.6.0**: React JSX plugin for Vite
- **@types/react, @types/react-dom**: TypeScript type definitions

---

## 3. PROJECT STRUCTURE

```
tic_tac_twist/
├── src/
│   ├── components/
│   │   ├── auth/                 # Authentication components
│   │   │   ├── Auth.jsx         # Main auth container
│   │   │   ├── AuthUI.jsx       # Auth UI presentation (flip card)
│   │   │   └── GenerateRandomItem.jsx  # Homepage background animations
│   │   ├── game/
│   │   │   └── GameBoard.jsx    # Online PvP game orchestrator
│   │   ├── offlinePage/
│   │   │   ├── Offlinepage.jsx           # Offline match setup
│   │   │   └── OfflineGamePage.jsx       # Offline game player (desktop & mobile)
│   │   ├── onlinePVPPage/
│   │   │   └── OnlinepvpPage.jsx         # Online lobby & match setup
│   │   ├── homepage/
│   │   │   └── Homepage.jsx     # Landing page with game mode selection
│   │   ├── Ui/                  # Reusable UI components
│   │   │   ├── GamePlayingBoard.jsx      # Board grid rendering
│   │   │   ├── GameSpecialMoves.jsx      # Special move selector
│   │   │   ├── PlayerScoreDisplay.jsx    # Score & status display
│   │   │   ├── RockPaperScissor.jsx      # RPS tiebreaker mechanism
│   │   │   ├── Dice.jsx                  # Dice roller for turn selection
│   │   │   ├── MatchRules.jsx            # Game rules modal
│   │   │   ├── MatchMoves.jsx            # Special moves guide
│   │   │   ├── Timer.jsx                 # Turn countdown timer
│   │   │   ├── PlayerSummaryWithRules.jsx
│   │   │   ├── ColorPicker.jsx
│   │   │   └── Footer.jsx
│   │   ├── utils/
│   │   │   ├── cellHelper.js    # Board cell highlighting logic
│   │   │   ├── colors.js        # Color palette constants
│   │   │   └── descriptionHelper.js  # Move descriptions & costs
│   │   ├── DarkModeToggler.jsx  # Theme toggle control
│   │   └── Navbar.jsx           # Top navigation bar
│   ├── api/
│   │   ├── axios/
│   │   │   └── authAxios.js     # Authentication API service
│   │   ├── game/
│   │   │   ├── gameApi.js       # REST API for game operations
│   │   │   └── gameServices.js  # Game service wrapper
│   │   └── player/
│   │       └── playerServices.js # Player-related API calls
│   ├── context/
│   │   ├── ThemeContext.jsx     # Dark mode context provider
│   │   └── useDarkMode.jsx      # Dark mode hook
│   ├── webSocket/
│   │   └── webSocketService.jsx # WebSocket game orchestration (online)
│   ├── App.jsx                  # Main app with routing
│   ├── Layout.jsx               # Layout wrapper (navbar + main)
│   └── main.jsx                 # React root entry point
├── public/
├── index.html                   # HTML entry point
├── vite.config.js               # Vite configuration
├── eslint.config.js             # ESLint configuration
├── package.json                 # Dependencies
├── .env                         # Environment variables
├── .gitignore                   # Git ignore rules
└── README.md                    # Generic Vite template README
```

---

## 4. MAIN CLASSES & RESPONSIBILITIES

### A. PAGE/ROUTE COMPONENTS

#### **Auth.jsx** - Authentication Container
- **Responsibility**: Manages user login/registration flows
- **Methods**:
  - `signIn()`: Email/password login
  - `signUp()`: User registration
  - `handleGoogleLoginSuccess()`: Google OAuth callback
- **State**: Form errors, flip animation state (login ↔ signup)
- **Storage**: Sets `username` and `token` to localStorage
- **Routes to**: Homepage on successful auth

#### **Homepage.jsx** - Landing & Game Mode Selection
- **Responsibility**: Main entry point, game mode selection, visual animations
- **Features**:
  - Animated background (falling X/O symbols)
  - Two game mode sections: Online PvP, Offline Play
  - Links to onlinePVPPage, offlinePage
- **State**: Random falling items for animation
- **Uses**: Framer Motion for smooth animations

#### **GameBoard.jsx** - Online PvP Orchestrator
- **Responsibility**: Coordinates online multiplayer game setup
- **Flow**:
  1. Shows RockPaperScissor component for symbol assignment
  2. Once winner chosen, transitions to WebSocketGameBoard
- **Props Received**: `player1Username`, `player2Username` (from navigation state)
- **State Management**: Manages player symbols, current player tracking
- **Next Component**: WebSocketGameBoard (for actual game)

#### **Offlinepage.jsx** - Offline Match Setup
- **Responsibility**: Configure offline game (1v1 or 1vBot)
- **Features**:
  - Dice roller for turn & symbol assignment
  - Rules and moves modal checkboxes
  - Player color selection
- **Disabled Behavior**: "Begin match" button disabled until rules/moves read
- **Navigation**: To `/offlineGamePage` once setup complete
- **Storage**: Saves player info, symbols, colors to localStorage

#### **OfflineGamePage.jsx** - Offline Game Controller (454 lines)
- **Responsibility**: Main offline game engine and UI orchestrator
- **Key Features**:
  - 6x6 board rendering (desktop & mobile layouts)
  - Real-time board state management
  - Special move selection (NORMAL, TWIST, OVERRIDE, DOUBLE_OVERRIDE, PATTERN_BOMB)
  - Score tracking and display
  - Turn timer (30 seconds)
  - Win/draw detection
- **API Calls**:
  - `createGameApi()`: Initialize game session
  - `makeMoveApi()`: Submit moves to backend
- **State Variables** (~20+):
  - Board state, player info, symbols, move selections
  - Score tracking, timer signal, error messages
  - Special move costs and availability
- **Game Flow**:
  1. Fetch localStorage data (players, symbols)
  2. Create game session via API
  3. Wait for user input → make move → update state
  4. Handle twist/override logic
  5. Detect win/draw conditions

#### **OnlinepvpPage.jsx** - Online Lobby & Coordination
- **Responsibility**: Player matching and game readiness coordination
- **Features**:
  - Opponent search/invite functionality
  - Readiness confirmation (both players must ready up)
  - Countdown before game start
  - WebSocket subscription to lobby events
- **STOMP Messages**:
  - `/user/queue/lobby`: Game state updates
  - `/app/invite`: Send invite to opponent
  - Subscribes to: INVITE_ACCEPTED, YOU_ARE_READY, OPPONENT_READY, GAME_START
- **State**: Modal open/close, readiness flags, opponent data, countdown
- **Navigation**: To `/gameBoard` once game starts

### B. UI COMPONENTS

#### **GamePlayingBoard.jsx** - Board Rendering
- **Responsibility**: Render NxN grid, handle cell highlighting, manage clicks
- **Features**:
  - Dynamic grid sizing based on `board.length`
  - Cell highlighting for:
    - Winning patterns (permanent, green)
    - Three-in-a-row patterns (temporary, player color)
  - Prevents clicks after win
- **Props**: board, makeMove callback, current player, patterns
- **Helpers**: `getHighlightCells()`, `getWinCells()` from cellHelper.js

#### **GameSpecialMoves.jsx** - Move Selection UI
- **Responsibility**: Display & select special moves
- **Features**:
  - Move affordability check (points >= cost)
  - Disable TWIST if already active
  - Shows move descriptions dynamically
  - Pattern selector for PATTERN_BOMB
- **Special Moves**:
  - NORMAL (0 pts)
  - PATTERN_BOMB (2 pts) + pattern selection
  - TWIST (1 pt)
  - OVERRIDE (4 pts)
  - DOUBLE_OVERRIDE (5 pts)

#### **PlayerScoreDisplay.jsx** - Score & Status
- **Responsibility**: Show player info, scores, current symbols
- **Features**:
  - Adjusts displayed symbol if TWIST active
  - Color-coded player cards
  - Shows twist turn counts
- **Props**: Player names, points, symbols, colors, twist status

#### **RockPaperScissor.jsx** - Tiebreaker Game (~300+ lines)
- **Responsibility**: Determine first player and symbol assignment
- **Features**:
  - WebSocket-based real-time RPS game
  - Winner selects X or O symbol
  - Countdown before symbol modal
  - Both players make simultaneous choices
- **STOMP Topics**:
  - `/user/queue/rps-result`: Game result
  - `/user/queue/rps-winner`: Symbol selection notification
- **Flow**:
  1. Both players connect to same RPS match
  2. Each makes choice (ROCK/PAPER/SCISSORS)
  3. Backend determines winner
  4. Winner gets symbol modal
  5. Game starts after countdown

#### **Dice.jsx** - Turn & Symbol Randomizer
- **Responsibility**: Randomly assign players, symbols, and starting player
- **Features**:
  - Dice animation (1-6 rolls)
  - Assigns higher roll → starting player
  - Randomly assigns X/O symbols
  - Color assignment for each player
- **State**: Two dice rolls, determines player order

#### **Timer.jsx** - Turn Countdown
- **Responsibility**: Display and manage turn time limit
- **Features**:
  - 30-second countdown (customizable)
  - Pulse animation when time running out (≤5 sec)
  - Resets when `resetSignal` prop changes
  - Stops if game winner detected
- **Callback**: `onTimeUp()` when time expires

#### **MatchRules.jsx** - Game Rules Modal
- **Responsibility**: Display game rules (indexed subset)
- **Features**: Selective rules display, read confirmation

#### **MatchMoves.jsx** - Special Moves Guide
- **Responsibility**: Educational display of move mechanics

### C. UTILITY & SERVICE LAYERS

#### **authAxios.js** - Authentication Services
```javascript
- register(data): Email/password signup
- login(data): Email/password login
- googleLoginSuccess(token): Google OAuth
- handleGoogleLoginError(errors): Error handling
```

#### **gameApi.js** - Game REST API
```javascript
- createGameApi(data): POST /api/match/create
  Params: player1Username, player2Username, symbols, boardSize, gameMode
  Returns: Game session object
  
- makeMoveApi(data): POST /api/match/move
  Params: sessionId, x, y, symbol, moveType, patternType, board
  Returns: Updated session state
```

#### **cellHelper.js** - Board Logic
```javascript
- getHighlightCells(patterns): Convert pattern strings to cell coordinates
  Parses: H (horizontal), V (vertical), MD (main diagonal), D/A (anti-diagonal)
  
- getWinCells(winPatterns, boardSize): Get winning pattern cells
  Handles: ROW, COL, MD (main diagonal), AD (anti-diagonal)
```

#### **descriptionHelper.js** - Game Constants
```javascript
moveDescriptions: Map of move type → description
specialMoveCost: Map of move type → point cost
movePatterns: ['ROW', 'COLUMN', 'LEFT_DIAGONAL', 'RIGHT_DIAGONAL']
emptyPatternMoveDescription: Map of pattern → description
```

#### **webSocketService.jsx** - Online Game Engine (~300+ lines)
- **Responsibility**: WebSocket-based real-time online game
- **STOMP Endpoints**:
  - `/app/create`: Create game session
  - `/app/move`: Submit player move
  - `/topic/game/{sessionId}`: Broadcast game updates
- **Features**:
  - Real-time synchronization
  - Move validation on backend
  - Automatic symbol toggling for TWIST
- **State**: Session, board, connected status, move selections

#### **ThemeContext.jsx** - Dark Mode Provider
- **Responsibility**: Global dark mode state management
- **Features**:
  - localStorage persistence
  - Document class toggling ("dark" class)
- **Hook**: `useContext(ThemeContext)` to access `{ darkMode, setDarkMode }`

---

## 5. APPLICATION STARTUP & EXECUTION FLOW

### Startup Sequence

```
1. main.jsx
   ├─ React.createRoot(#root)
   ├─ StrictMode enabled (for dev warnings)
   ├─ ThemeProvider (global dark mode)
   └─ Renders App.jsx

2. App.jsx
   ├─ GoogleOAuthProvider (enables Google login)
   ├─ BrowserRouter (React Router setup)
   ├─ ToastContainer (notifications)
   └─ AppRoutes (route definitions)

3. AppRoutes (conditional Layout + Routes)
   ├─ Shows Navbar/Layout on all routes except /signin
   └─ Route to appropriate component

4. Conditional Rendering
   ├─ No username in localStorage → /signin (Auth)
   ├─ Username exists → /home (Homepage)
```

### Game Flow

#### Online PvP Flow
```
Homepage
  → Click "PLAY Online"
  → OnlinepvpPage
    ├─ Search/invite opponent (localStorage username)
    ├─ WebSocket connect to lobby
    └─ Both players ready → countdown
      → /gameBoard (GameBoard.jsx)
        ├─ RockPaperScissor (determine symbol/first player)
        └─ WebSocketGameBoard (actual game with STOMP)
```

#### Offline PvP/Bot Flow
```
Homepage
  → Click "PLAY Offline"
  → Offlinepage
    ├─ Dice.jsx: Assign players, symbols, turn order
    ├─ Rules/Moves confirmation
    └─ Navigate to /offlineGamePage
      → OfflineGamePage.jsx
        ├─ Create game session (API)
        ├─ Player makes move
        ├─ makeMoveApi() submits to backend
        ├─ Update UI with response
        └─ Detect win/draw/continue
```

### Key State Management Patterns

1. **localStorage**: User data (username, token, player info during game setup)
2. **Component State**: Game state, UI state, move selections
3. **Context API**: Dark mode theme
4. **WebSocket**: Real-time online game updates

---

## 6. CLASS INTERACTIONS & DATA FLOW

### Online Game Interaction Diagram
```
OnlinepvpPage (lobby coordination)
    ↓ (both players ready)
GameBoard (RPS + setup)
    ↓ (symbols assigned)
WebSocketGameBoard (STOMP-based game)
    ├─ Client publishes: /app/move
    └─ Backend broadcasts: /topic/game/{sessionId}
        ↑ (all clients subscribe)
```

### Offline Game Interaction Diagram
```
Offlinepage (setup)
    ↓ (rules confirmed)
OfflineGamePage (main game)
    ├─ API: createGameApi()
    │  └─ Returns: session, board
    ├─ User clicks cell → makeMove()
    │  └─ API: makeMoveApi()
    │     └─ Returns: updated session
    └─ Update state, re-render board
```

### Data Flow for a Move (Offline)
```
User clicks cell (i, j)
    ↓
makeMove(i, j) called
    ↓
makeMoveApi({sessionId, x, y, symbol, moveType, patternType, board})
    ↓
Backend processes move logic
    ↓
Backend returns:
  - updated board
  - currentPlayer switched
  - threePatterns (for highlighting)
  - winner (if game ends)
  - player points
    ↓
setBoard(newBoard)
setSession(updatedSession)
setCurrentPlayerSymbol(newSymbol)
setPlayer1Points / setPlayer2Points
    ↓
Component re-renders with new state
```

---

## 7. EXISTING BUSINESS LOGIC & GAME MECHANICS

### Core Game Rules
1. **Board**: 6x6 grid
2. **Win Condition**: Complete 3 consecutive cells (row, column, diagonal)
3. **Points System**: Each win = 1 point
4. **Turn Limit**: 30 seconds per turn

### Special Moves (Twist Mechanics)

| Move Type | Cost | Effect | Duration |
|-----------|------|--------|----------|
| NORMAL | 0 | Place symbol in empty cell | — |
| EMPTY_CELL | 2 | Clear opponent's single cell | 1 turn |
| PATTERN_BOMB | 2 | Clear entire row/column/diagonal | 1 turn |
| OVERRIDE | 4 | Replace 1 opponent symbol | 1 turn |
| DOUBLE_OVERRIDE | 5 | Replace 2 opponent symbols | 2 turns (special duration) |
| TWIST | 1 | Exchange symbols with opponent | 2 turns |

### Move Patterns (for PATTERN_BOMB)
- ROW: Clear entire row
- COLUMN: Clear entire column
- LEFT_DIAGONAL: Clear main diagonal (↘)
- RIGHT_DIAGONAL: Clear anti-diagonal (↙)

### Game State Tracking (Session Object)
```javascript
{
  sessionId: string,
  player1Username: string,
  player2Username: string,
  player1Symbol: 'X' or 'O',
  player2Symbol: 'X' or 'O',
  currentPlayer: string,
  board: [][] (6x6),
  player1Points: number,
  player2Points: number,
  gameStatus: 'ONGOING' | 'WON' | 'DRAW',
  winner: string | null,
  twistActive: boolean,
  player1TwistTurnsLeft: number,
  player2TwistTurnsLeft: number,
  doubleOverrideActive: boolean,
  doubleOverrideTurnsLeft: number,
  threePatterns: string[], // Highlighted patterns
  winPattern: string[] | null, // Final win pattern
  gameMode: 'PVPOFFLINE' | 'BOTMATCH' | 'PVPONLINE'
}
```

---

## 8. CURRENT IMPLEMENTATION STATUS

### ✅ COMPLETED FEATURES
1. **Authentication**
   - Email/password login & signup
   - Google OAuth 2.0 integration
   - JWT token management

2. **Offline Game**
   - Full 6x6 board gameplay
   - Move validation and placement
   - Win/draw detection
   - Special moves implementation
   - Point tracking
   - 30-second timer
   - Desktop & mobile responsive UI

3. **Online Game (Partial)**
   - Lobby system (player search/invite)
   - Rock-Paper-Scissors tiebreaker (via WebSocket)
   - WebSocket connection & messaging
   - Symbol assignment for winner
   - Game session creation

4. **UI/UX**
   - Dark mode toggle (persistent)
   - Responsive design (mobile & desktop)
   - Toast notifications
   - Smooth animations (Framer Motion)
   - Color-coded player cards

5. **Game Mechanics**
   - Board rendering with highlighting
   - Three-in-a-row detection
   - All special moves defined (with costs)
   - Turn management
   - Player symbol tracking

### ⚠️ PARTIALLY IMPLEMENTED
1. **Online Game Board**
   - WebSocket structure exists (webSocketService.jsx)
   - Move submission logic present
   - **Issue**: May not have full synchronization/error handling
   - **Issue**: Real-time board updates need verification

2. **AI/Bot Opponent**
   - Game mode flag exists ("BOTMATCH")
   - Backend likely implements bot logic
   - Frontend just creates game with `player2 = "tictacbot"`

### ❌ MISSING/INCOMPLETE FEATURES
1. **Player Statistics & Leaderboard**
   - No profile/stats display
   - No match history

2. **Chat/Communication**
   - No in-game messaging between players
   
3. **Error Recovery**
   - Minimal error handling in WebSocket
   - No retry mechanism for failed moves

4. **Testing**
   - No test files detected (Jest, Vitest, etc.)
   - No unit/integration tests

5. **TypeScript**
   - Project is JavaScript (no .ts/.tsx files except types)
   - No type safety/intellisense

---

## 9. ARCHITECTURAL IMPROVEMENTS

### Recommended Improvements (Non-Breaking)

1. **Refactor State Management**
   - Move offline game state to Context or Reducer
   - Current: Deeply nested component state in OfflineGamePage
   - Benefit: Easier testing, reusability

2. **Extract Game Logic**
   - Create custom hook `useGameLogic()` for offline game
   - Separate UI rendering from game logic
   - Benefit: Testability, reusability between online/offline

3. **Error Handling**
   - Add error boundaries
   - Implement retry logic for API/WebSocket failures
   - Consistent error toasts

4. **WebSocket Reliability**
   - Implement connection health checks
   - Auto-reconnect with exponential backoff
   - Handle stale game sessions

5. **Code Organization**
   - Break large components (OfflineGamePage, OnlinepvpPage, RockPaperScissor)
   - Create service layer for game logic
   - Centralize API calls

6. **Type Safety**
   - Migrate to TypeScript for better DX
   - Type game session objects
   - Type STOMP message contracts

7. **Testing**
   - Add Vitest for unit tests
   - Add Playwright for E2E tests
   - Mock WebSocket in tests

8. **Performance**
   - Memoize expensive components (GamePlayingBoard)
   - Lazy load game components
   - Optimize re-renders in game loops

---

## 10. TECHNOLOGY STACK SUMMARY

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Frontend Framework** | React | 19.1.0 | UI library |
| **Build Tool** | Vite | 7.0.4 | Fast dev server & bundler |
| **Styling** | Tailwind CSS | 4.1.11 | Utility-first CSS |
| **Animations** | Framer Motion | 12.23.24 | Smooth transitions |
| **Routing** | React Router | 7.6.3 | Client-side navigation |
| **Forms** | React Hook Form | 7.60.0 | Form management |
| **Notifications** | React Toastify | 11.0.5 | Toast messages |
| **Real-Time** | STOMP + SockJS | Latest | WebSocket messaging |
| **HTTP Client** | Axios | 1.10.0 | API requests |
| **Authentication** | Google OAuth | 0.12.2 | SSO |
| **Icons** | Lucide React | 0.525.0 | Icon components |
| **Linter** | ESLint | 9.30.1 | Code quality |
| **Backend** | Spring Boot | (unknown) | Java backend |
| **Database** | (Unknown) | — | Persistence layer |

---

## 11. API ENDPOINTS USED

### Authentication API
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - Email/password login
- `POST /api/auth/google/callback` - Google OAuth callback

### Game API
- `POST /api/match/create` - Create game session (offline)
- `POST /api/match/move` - Submit move (offline)

### WebSocket Endpoints (STOMP)
- `GET /gameplay?username=...` - WebSocket connection
- `/app/create` - Create online game
- `/app/move` - Submit move (online)
- `/app/invite` - Send invite
- `/topic/game/{sessionId}` - Broadcast game updates
- `/topic/rps/{matchId}` - RPS game events
- `/user/queue/rps-result` - RPS result notification
- `/user/queue/rps-winner` - RPS winner notification
- `/user/queue/lobby` - Lobby messages

---

## NEXT STEPS FOR FEATURE DEVELOPMENT

1. **Before implementing new features**, ensure you understand:
   - How offline game state flows in OfflineGamePage
   - How WebSocket messaging works (STOMP client pattern)
   - How special moves are validated/applied on backend
   - localStorage usage for game setup

2. **Key extension points**:
   - New game modes → add route, create new page component
   - New special moves → update `descriptionHelper.js`, backend logic
   - New UI features → extend existing components or create new Ui/* component
   - New game logic → leverage existing `gameApi.js` or add new service

3. **Testing checklist** for new features:
   - Desktop & mobile responsiveness
   - Dark mode compatibility
   - Error scenarios (network, invalid moves)
   - WebSocket connection recovery (for online features)
