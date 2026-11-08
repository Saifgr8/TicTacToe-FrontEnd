---
aliases:
  - copilot-instructions.md
  - project guidelines
  - coding standards
---

# TIC TAC TWIST - Copilot Instructions & Development Guidelines

## 📋 PROJECT OVERVIEW

**Tic Tac Twist** is a modern React + Vite web application implementing an advanced version of Tic-Tac-Toe with special "twist" moves and real-time multiplayer support. The project uses:

- **Frontend**: React 19 with Vite, Tailwind CSS, Framer Motion
- **Real-Time**: WebSocket (STOMP/SockJS)
- **Backend**: Java Spring Boot (localhost:8080)
- **Game Modes**: Offline (PvP/Bot), Online (PvP)
- **Board Size**: 6x6 grid

See `PROJECT_ANALYSIS.md` for complete architecture details.

---

## 🏗️ ARCHITECTURE PRINCIPLES

### 1. Component Structure

**File Organization**:
```
src/
├── components/          # All React components
│   ├── auth/           # Auth-related (Auth, AuthUI)
│   ├── game/           # Online game (GameBoard)
│   ├── homepage/       # Landing page
│   ├── offlinePage/    # Offline game flow
│   ├── onlinePVPPage/  # Online lobby
│   ├── Ui/             # Reusable UI components
│   └── utils/          # Helpers (cellHelper, descriptionHelper, colors)
├── api/                # API services layer
│   ├── axios/          # Auth API
│   ├── game/           # Game REST API
│   └── player/         # Player API
├── context/            # Global state (ThemeContext for dark mode)
└── webSocket/          # WebSocket game service
```

**Component Naming**:
- PascalCase for files: `GameBoard.jsx`, `PlayerScoreDisplay.jsx`
- Pages end with `.jsx`: `Offlinepage.jsx`, `OnlinepvpPage.jsx`
- UI components in `Ui/` folder: `GamePlayingBoard.jsx`
- Utilities in `utils/`: `cellHelper.js`, `descriptionHelper.js`

### 2. Data Flow Patterns

**Offline Game** (REST + Component State):
```
User clicks → makeMove(i, j)
  → makeMoveApi(payload)
    → Backend processes
    → Returns updated session
  → setBoard(), setSession(), update state
  → Component re-renders
```

**Online Game** (WebSocket + STOMP):
```
User clicks → makeMove(i, j)
  → stompClient.publish("/app/move", movePayload)
    → Backend processes
    → Broadcasts to /topic/game/{sessionId}
  → All clients receive update
  → setBoard(), setSession(), update state
```

### 3. State Management

**Current Approach**:
- **Component State** (useState): Local game state, UI state
- **localStorage**: User data (username, token), game setup
- **Context API**: Global dark mode theme (ThemeContext)
- **WebSocket**: Real-time sync for online games

**No Redux/Zustand** — Keep it simple with hooks and context.

---

## 🎮 GAME MECHANICS REFERENCE

### Board & Winning

- **Board**: 6x6 grid (dynamic from backend)
- **Win**: 3 consecutive cells (row, column, any diagonal)
- **Points**: 1 point per completed 3-cell pattern
- **Draw**: Board full, no winner

### Special Moves (The "Twist")

| Move | Cost | Effect | Duration |
|------|------|--------|----------|
| NORMAL | 0 pts | Place symbol | 1 turn |
| EMPTY_CELL | 2 pts | Remove 1 opponent cell | 1 turn |
| PATTERN_BOMB | 2 pts | Clear row/column/diagonal | 1 turn |
| OVERRIDE | 4 pts | Replace 1 opponent symbol | 1 turn |
| DOUBLE_OVERRIDE | 5 pts | Replace 2 opponent symbols | 2 turns |
| TWIST | 1 pt | Swap symbols with opponent | 2 turns |

**Move Selection**: See `GameSpecialMoves.jsx` and `descriptionHelper.js`

### Game Flow (Offline)

```
1. Offlinepage: Dice roll → player order & symbols
2. OfflineGamePage: Create game → API createGameApi()
3. User selects move type → selects cell
4. makeMove() → makeMoveApi() → backend processes
5. Backend returns new board state
6. Display win/draw or continue to next turn
```

### Game Flow (Online)

```
1. OnlinepvpPage: Find opponent → ready up
2. GameBoard: Rock-Paper-Scissors tiebreaker → determine symbol
3. WebSocketGameBoard: Establish STOMP connection
4. User makes move → publish to /app/move
5. Backend broadcasts to /topic/game/{sessionId}
6. All clients update board in real-time
```

---

## 💾 API & SERVICE LAYER

### REST API Calls

All in `src/api/`:

**Game API** (`game/gameApi.js`):
```javascript
// Create game session
createGameApi({
  player1Username,
  player2Username,
  player1Symbol,
  player2Symbol,
  startingPlayer,
  boardSize,
  token,
  gameMode: 'PVPOFFLINE' | 'BOTMATCH' | 'PVPONLINE'
})
// Returns: { sessionId, board, currentPlayer, ... }

// Submit a move
makeMoveApi({
  sessionId,
  x, y,
  symbol,
  moveType: 'NORMAL' | 'TWIST' | 'OVERRIDE' | ...,
  patternType: 'NONE' | 'ROW' | 'COLUMN' | 'LEFT_DIAGONAL' | 'RIGHT_DIAGONAL',
  board,
  token
})
// Returns: { board, currentPlayer, winner, threePatterns, ... }
```

**Auth API** (`axios/authAxios.js`):
```javascript
authServices.register({ email, username, password })
authServices.login({ email, password })
authServices.googleLoginSuccess(tokenResponse)
```

**Base URL**: `http://localhost:8080/api`

### WebSocket (STOMP) Endpoints

Connection: `new SockJS('http://localhost:8080/gameplay?username=...')`

**Publish To**:
- `/app/create` → Create game
- `/app/move` → Submit move
- `/app/invite` → Send player invite
- `/app/ready` → Signal player ready (implied)

**Subscribe To**:
- `/topic/game/{sessionId}` → Game state broadcasts
- `/topic/rps/{matchId}` → RPS results
- `/user/queue/rps-result` → Your RPS result
- `/user/queue/rps-winner` → Symbol selection notification
- `/user/queue/lobby` → Lobby messages (invites, readiness)

---

## 🎨 UI & STYLING CONVENTIONS

### Tailwind CSS Usage

**Consistent Patterns**:
1. **Dark Mode**: Always include both light & dark variants
   ```jsx
   className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
   ```

2. **Gradients** (preferred for cards/sections):
   ```jsx
   className="bg-gradient-to-br from-blue-100 via-white to-blue-200
              dark:from-gray-900 dark:via-gray-800 dark:to-black"
   ```

3. **Responsive Layout**:
   ```jsx
   className="flex flex-col md:flex-row md:w-1/2 gap-4 p-4"
   // Mobile: flex-col, full width
   // Desktop (md+): flex-row, half width
   ```

4. **Shadows & Borders**:
   ```jsx
   className="rounded-2xl shadow-lg border border-gray-300 dark:border-gray-700"
   ```

5. **Color Palette**:
   - Primary: Blue (blue-600, blue-700)
   - Secondary: Indigo (indigo-700, indigo-300)
   - Accent: Pink/Purple (pink-500, purple-600)
   - Neutral: Gray (gray-100 to gray-900)

### Component Layout Standards

- **Cards**: rounded-2xl, shadow-lg, border, padding
- **Buttons**: px-5 py-2, rounded-2xl, font-semibold, hover:scale-105
- **Modals**: bg-white dark:bg-gray-800, border-2, rounded-xl
- **Icons**: lucide-react, 1.5em size default

### Animation Standards

Use **Framer Motion** for all animations:
```jsx
import { motion } from "framer-motion";

<motion.div
  initial={{ opacity: 0, y: -20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
>
  Content
</motion.div>
```

**Timing**: 0.3-0.6s for UI, 1-2s for page transitions

---

## 🔌 localStorage Usage

**Keys Used** (during game setup):
```javascript
localStorage.setItem("username", playerUsername)     // Always set after auth
localStorage.setItem("token", jwtToken)              // From auth endpoint
localStorage.setItem("player1", p1Username)          // Game setup
localStorage.setItem("player2", p2Username)          // Game setup
localStorage.setItem("player1Symbol", "X" | "O")     // RPS result
localStorage.setItem("player2Symbol", "X" | "O")
localStorage.setItem("currentPlayer", username)      // Who goes first
localStorage.setItem("player1Color", colorClass)     // Tailwind class
localStorage.setItem("player2Color", colorClass)
localStorage.setItem("theme", "dark" | "light")      // Dark mode
```

**Cleanup**: Clear game-specific keys after game ends

---

## 🛠️ DEVELOPMENT WORKFLOW

### Adding a New Feature

1. **Create component** in appropriate folder
2. **Add route** to `App.jsx` if it's a page
3. **Use API services** from `api/` (don't inline fetch)
4. **Handle errors** with toast notifications
5. **Test on mobile** (use responsive UI)
6. **Support dark mode** in all Tailwind classes

### Adding a New API Endpoint

1. Create function in `api/` service file
2. Use consistent naming: `resource + Action`, e.g., `createGameApi`
3. Include error handling and logging
4. Document expected params and return type
5. Add Authorization header if needed

### Adding a New Game Move

1. Update `descriptionHelper.js`:
   - Add to `moveDescriptions` Map
   - Add to `specialMoveCost` Map
2. Update `GameSpecialMoves.jsx` button list
3. Update backend move validation logic
4. Test in both offline & online modes

---

## ⚡ PERFORMANCE GUIDELINES

### Component Optimization

1. **Memoization** for expensive renders:
   ```jsx
   const GamePlayingBoard = React.memo(({ board, makeMove, ... }) => {
     // Component code
   });
   ```

2. **useCallback** for event handlers passed to children:
   ```jsx
   const handleClick = useCallback((i, j) => {
     makeMove(i, j);
   }, [makeMove]);
   ```

3. **Lazy load routes** for large components:
   ```jsx
   const OnlinepvpPage = lazy(() => import('./OnlinepvpPage'));
   <Suspense fallback={<Loading />}>
     <OnlinepvpPage />
   </Suspense>
   ```

### Network Optimization

1. **Batch API calls** where possible
2. **Implement loading states** for slow connections
3. **Cache game session** in component state (don't re-fetch)
4. **WebSocket debounce** if sending frequent moves

---

## 🧪 TESTING APPROACH

### Current Status

- **No test files** currently in project
- **Manual testing only**

### Recommended Testing Strategy

1. **Unit Tests** (Vitest):
   - Game logic helpers (cellHelper, descriptionHelper)
   - API service methods
   - Utility functions

2. **Component Tests** (Vitest + React Testing Library):
   - GamePlayingBoard (rendering, click handling)
   - GameSpecialMoves (move selection)
   - PlayerScoreDisplay (data display)

3. **E2E Tests** (Playwright):
   - Full game flow (offline & online)
   - Auth flow
   - Move submission & board updates

### Testing Checklist for New Features

- [ ] Responsive on mobile (320px), tablet (768px), desktop (1920px)
- [ ] Works in light & dark mode
- [ ] Works offline (no network) gracefully
- [ ] Error messages display correctly
- [ ] No console errors/warnings
- [ ] Animations smooth (60fps)
- [ ] Accessibility (keyboard nav, ARIA labels)

---

## 🚨 ERROR HANDLING CONVENTIONS

### Toast Notifications

**Error notification**:
```javascript
import { toast } from "react-toastify";

toast.error("Failed to make move. Please try again.");
```

**Success notification**:
```javascript
toast.success("Move submitted!");
```

**Info notification**:
```javascript
toast.info("Waiting for opponent...");
```

### API Error Handling

```javascript
try {
  const response = await makeMoveApi(payload);
  if (response?.error) {
    setErrorMessage(response.message);
    toast.error(response.message);
    return;
  }
  // Success handling
} catch (error) {
  console.error("API Error:", error);
  toast.error("Network error. Please try again.");
}
```

### WebSocket Connection Errors

- Log to console with emoji prefix: `❌`, `✅`, `🎯`
- Notify user via toast if critical
- Auto-reconnect with exponential backoff (not yet implemented)

---

## 📝 NAMING CONVENTIONS

### Files & Folders

- **Pages/Containers**: PascalCase, end with 'page' or 'Page'
  - `Offlinepage.jsx`, `OnlinepvpPage.jsx`, `GameBoard.jsx`
- **UI Components**: PascalCase, descriptive
  - `GamePlayingBoard.jsx`, `PlayerScoreDisplay.jsx`
- **Utilities**: camelCase
  - `cellHelper.js`, `descriptionHelper.js`
- **Services**: descriptive + 'Service' or 'Api'
  - `authAxios.js`, `gameApi.js`, `webSocketService.jsx`

### Variables & Functions

- **State variables**: camelCase
  - `const [board, setBoard] = useState([])`
  - `const [selectedMoveType, setSelectedMoveType] = useState("")`
- **Functions**: camelCase, descriptive verb
  - `makeMove(i, j)`, `createGameApi()`, `highlightCells()`
- **Constants**: UPPER_SNAKE_CASE or camelCase if Map/Object
  - `const MAX_BOARD_SIZE = 6`
  - `const moveDescriptions = new Map(...)`
- **Callbacks**: prefix with 'handle' or name describing action
  - `handleClick()`, `handleSubmit()`, `onTimeUp()`

### Component Props

- **Descriptive** and self-documenting
- Boolean props prefix with 'is' or verb
  - `isWinActive`, `isTwistActive`, `showNavbar`
- Callback props prefix with 'on' or 'set'
  - `onTimeUp()`, `setSelectedMoveType()`
- Prefix with 'player1', 'player2' for player-specific data
  - `player1Username`, `player1Points`

---

## 🔐 SECURITY PRACTICES

### Token Management

1. **Store JWT in localStorage** (temporary, frontend only)
2. **Include in Authorization header** for API calls:
   ```javascript
   headers: {
     "Authorization": `${token}`,
     "Content-Type": "application/json"
   }
   ```
3. **Clear on logout** (not yet implemented)
4. **Never log** token values to console

### Input Validation

- **Username/Email**: Validate in auth form (via react-hook-form)
- **Board coordinates**: Validate in `makeMove()` before API call
- **Special move costs**: Validate affordability in `GameSpecialMoves`
- **Backend validation**: Trust backend for final authority

---

## 📚 COMMON PATTERNS

### Game Session Pattern (Offline)

```javascript
// 1. Initialize
const [session, setSession] = useState(null);
const [board, setBoard] = useState([]);

useEffect(() => {
  // Fetch from localStorage
  const player1 = localStorage.getItem("player1");
  // ... more setup
  
  // Create game session
  createGameApi({ ... }).then(data => {
    setSession(data);
    setBoard(data.board);
  });
}, []);

// 2. Make move
const makeMove = async (i, j) => {
  if (!session) return;
  const updatedSession = await makeMoveApi({ 
    sessionId: session.sessionId,
    x: i, y: j,
    // ... more params
  });
  setSession(updatedSession);
  setBoard(updatedSession.board);
  // Update other state as needed
};
```

### WebSocket Connection Pattern (Online)

```javascript
const stompClient = useRef(null);
const [connected, setConnected] = useState(false);

useEffect(() => {
  const socket = new SockJS(`http://localhost:8080/gameplay?username=...`);
  const client = new Client({
    webSocketFactory: () => socket,
    reconnectDelay: 5000,
    onConnect: () => {
      setConnected(true);
      client.subscribe("/user/queue/game-topic", message => {
        const data = JSON.parse(message.body);
        // Handle message
      });
    }
  });
  client.activate();
  stompClient.current = client;
  
  return () => client.deactivate(); // Cleanup
}, []);
```

### Form Submission Pattern

```javascript
import { useForm } from "react-hook-form";

const { register, handleSubmit, watch, formState: { errors } } = useForm();

const onSubmit = async (data) => {
  try {
    const response = await authServices.login(data);
    localStorage.setItem("username", response.username);
    navigate("/");
  } catch (error) {
    setFormErrors(error.message);
  }
};

<form onSubmit={handleSubmit(onSubmit)}>
  <input {...register("email", { required: "Email is required" })} />
  {errors.email && <span>{errors.email.message}</span>}
</form>
```

---

## 🎯 DO'S & DON'TS

### ✅ DO

- Keep components focused and small (≤200 lines ideal)
- Use meaningful variable names
- Handle all error scenarios (network, validation, game logic)
- Test responsive design across breakpoints
- Support dark mode throughout
- Use Tailwind classes consistently
- Add comments only for complex logic
- Import only what you use
- Use `const` by default, `let` if needed
- Validate user input before API calls

### ❌ DON'T

- Don't directly inline fetch() — use API services
- Don't create HTML with innerHTML
- Don't log sensitive data (tokens, passwords)
- Don't hardcode URLs/magic numbers
- Don't skip error handling
- Don't mix light/dark mode classes inconsistently
- Don't use inline styles (use Tailwind)
- Don't pass more than 5 props to components (extract into Context)
- Don't modify localStorage during game play (only setup)
- Don't forget to cleanup subscriptions/timers in useEffect

---

## 🚀 DEPLOYMENT CHECKLIST

Before pushing to production:

- [ ] All routes tested
- [ ] Responsive design verified (mobile + desktop)
- [ ] Dark mode works throughout
- [ ] Error messages user-friendly
- [ ] No console errors/warnings
- [ ] Network requests use HTTPS (update localhost URLs)
- [ ] WebSocket connection fails gracefully
- [ ] Toast notifications appear correctly
- [ ] Animations perform well (no janky behavior)
- [ ] Accessibility check (keyboard nav, ARIA labels)
- [ ] .env variables configured for production
- [ ] localStorage keys documented
- [ ] Unused imports cleaned up

---

## 📖 USEFUL REFERENCES

- **React**: https://react.dev
- **Tailwind CSS**: https://tailwindcss.com
- **Framer Motion**: https://www.framer.com/motion
- **STOMP JS**: http://jmesnil.net/stomp-websocket/doc/
- **Lucide Icons**: https://lucide.dev
- **React Hook Form**: https://react-hook-form.com
- **React Router**: https://reactrouter.com
- **React Toastify**: https://fkhadra.github.io/react-toastify/introduction

---

## 📞 QUESTIONS?

Refer to `PROJECT_ANALYSIS.md` for detailed architecture, class responsibilities, and data flow.
