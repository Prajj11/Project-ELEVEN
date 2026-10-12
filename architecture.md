# System Architecture Document
## PROJECT ELEVEN: AGENTIC FOOTBALL ARENA

---

### 1. System Overview

Project Eleven is structured as a **client-server multiplayer architecture** with an **authoritative server simulation** and **isolated LLM agentic reasoning loops**.

```
               ┌────────────────────────────────────────────────────────┐
               │                     CLIENT (React)                     │
               │  - React Three Fiber (3D World, Pitch, Players, Ball)  │
               │  - Client-Side Interpolation & Prediction Buffer       │
               │  - In-Match HUD & Tactical Observability Drawer        │
               │  - Socket.IO Client                                    │
               └───────────────▲────────────────────────▲───────────────┘
                               │ Input: W,A,S,D,Space   │ Snapshots (20-30Hz)
                               │ (Client -> Server)     │ (Server -> Client)
                               ▼                        ▼
┌───────────────────────────────────────────────────────────────────────────────┐
│                           SERVER (Node.js / TypeScript)                       │
│                                                                               │
│  ┌───────────────────────┐  ┌──────────────────────────────────────────────┐  │
│  │   Room & Lobby Mgr    │  │            MatchEngine (60Hz Loop)           │  │
│  │  - Roster enforcement │  │  - Fixed-step accumulator & physics          │  │
│  │  - Team slot locking  │  │  - Ball dynamics & possession system         │  │
│  │  - Reconnection & AI  │  │  - Passing, shooting, tackling systems       │  │
│  └───────────────────────┘  │  - Goal detection & match state machine      │  │
│                             └───────────────┬──────────────────────────────┘  │
│                                             │ Match State                     │
│                             ┌───────────────▼──────────────────────────────┐  │
│                             │     Layer 2: Deterministic AI Controller     │  │
│                             │  - 60Hz utility scoring & behavior trees     │  │
│                             │  - Goalkeeper lateral tracking & saves       │  │
│                             │  - Pitch steering & role-based positioning   │  │
│                             └───────────────▲──────────────────────────────┘  │
│                                             │ Applies Tactical Plan           │
│                             ┌───────────────┴──────────────────────────────┐  │
│                             │      Layer 3: Agentic Tactical System        │  │
│                             │  - Blue Agent vs. Red Agent (Independent)    │  │
│                             │  - Serialized TacticalSnapshots (Read-Only)  │  │
│                             │  - PlanValidator & Rate Limiter / Cooldown   │  │
│                             │  - LLM Provider Adapter (Gemini/OpenAI/Local)│  │
│                             │  - Fallback Heuristic Strategy Engine        │  │
│                             └──────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────────────────┘
```

---

### 2. Monorepo Structure

The project utilizes **npm workspaces** to maintain clean boundaries between client, server, and shared logic.

```
project-eleven/
├── apps/
│   ├── web/                     # Frontend Application
│   │   ├── public/              # Audio, textures, models
│   │   ├── src/
│   │   │   ├── app/             # App shell, routing, providers
│   │   │   ├── components/      # UI primitives (Buttons, Modals, Indicators)
│   │   │   ├── pages/           # LandingPage, LobbyPage, MatchPage, ResultsPage
│   │   │   ├── game/            # R3F 3D Scene, Pitch, Ball, Player, Stadium, Camera
│   │   │   ├── controls/        # InputController, KeyboardBindings, ActionController
│   │   │   ├── hud/             # MatchHUD, Scoreboard, Clock, TacticalPanel, Radar
│   │   │   ├── network/         # socketClient, stateInterpolation, prediction
│   │   │   └── stores/          # matchStore, lobbyStore, settingsStore (Zustand)
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── vite.config.ts
│   └── server/                  # Authoritative Backend
│       ├── src/
│       │   ├── config/          # Environment & gameConfig validation
│       │   ├── rooms/           # RoomManager, MatchRoom, RoomCode
│       │   ├── networking/      # SocketHandlers, StateBroadcaster, ProtocolValidator
│       │   ├── game/            # MatchEngine, FixedStepLoop, PhysicsWorld, Possession,
│       │   │                    # Passing, Shooting, Tackling, Goalkeeper, Rules
│       │   ├── ai/              # TacticalAgent, TacticalSnapshot, PlanValidator,
│       │   │                    # AIPlayerController, BehaviorTree, LLMProvider, FallbackAI
│       │   ├── persistence/     # MatchRepository, InMemoryMatchRepository
│       │   └── observability/   # Logger, Metrics
│       ├── package.json
│       └── tsconfig.json
├── packages/
│   └── shared/                  # Universal Types & Validation Schemas
│       ├── src/
│       │   ├── types.ts         # MatchState, PlayerState, BallState, TacticalPlan
│       │   ├── events.ts        # Socket event names & payload types
│       │   ├── schemas.ts       # Zod schemas for runtime validation
│       │   ├── constants.ts     # Pitch dimensions, speeds, cooldowns, timers
│       │   └── gameConfig.ts    # Central gameplay tuning parameters
│       ├── package.json
│       └── tsconfig.json
├── tests/                       # Automated Tests (Unit, Networking, AI, Integration)
├── package.json                 # Monorepo root configuration
├── tsconfig.base.json           # Shared TypeScript compiler options
└── README.md
```

---

### 3. Simulation & Networking Architecture

#### 3.1 Fixed-Step Simulation Loop (60Hz)
- The server runs on a fixed timestep: $\Delta t = 16.66\text{ ms}$ (`SIMULATION_RATE = 60`).
- An accumulator consumes real elapsed time; in the event of severe server lag, accumulated time is clamped to $100\text{ ms}$ to prevent catch-up cascades ("spiral of death").
- Physics and football rules update authoritatively every tick.

#### 3.2 State Synchronization & Snapshots (20–30Hz)
- The server serializes the authoritative match state into lightweight `MatchSnapshot` payloads broadcast at $25\text{ Hz}$.
- Payloads omit sensitive server memory and contain only:
  - `tick`, `serverTimestamp`, `phase`, `remainingSeconds`, `score`, `possessionTeam`
  - Compact arrays/maps for `players` (position, velocity, facing, stamina, role) and `ball` (position, velocity, ownerId).
  - Active `teamTactics` (strategy, pressing intensity, public explanation).

#### 3.3 Client-Side Interpolation & Prediction
- Remote entities (opponents, AI teammates, ball) are rendered using a 100ms snapshot interpolation buffer (`lerp` for positions, `slerp` for rotations).
- The locally controlled human player runs client-side prediction for instant responsive movement, smoothly reconciled with server state updates via sequence numbers.

---

### 4. Agentic AI & Tactical Intelligence Architecture

Project Eleven separates immediate gameplay reflexes from high-level tactical reasoning into three distinct tiers:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ LAYER C: TEAM TACTICAL AGENT (LLM / Fallback)                               │
│ - Runs asynchronously every 15-20s or on major events.                      │
│ - Operates on sanitized, read-only `TacticalSnapshot`.                      │
│ - Selects: Strategy, Formation, Pressing Intensity, AI Role Assignments.    │
│ - Enforces: Strict Zod validation, timeouts (5s), rate limits.              │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ Applies Tactical Directives
┌──────────────────────────────────────▼──────────────────────────────────────┐
│ LAYER B: DETERMINISTIC INDIVIDUAL AI CONTROLLERS                            │
│ - Evaluates at 60Hz per AI footballer.                                      │
│ - Utility scoring and behavior trees (Press, Mark, Support, Shoot, Save).   │
│ - Goalkeeper lateral positioning and shot-stopping calculation.            │
│ - Never overrides human player movement inputs.                             │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ Translates to movement/kicks
┌──────────────────────────────────────▼──────────────────────────────────────┐
│ LAYER A: AUTHORITATIVE SIMULATION & PHYSICS (MatchEngine)                   │
│ - 60Hz deterministic physics step, ball kinematics, and collision bounds.  │
│ - Possession transfer, pass trajectory, goal detection, and match FSM.      │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### 4.1 Independent Agents
- Blue Team and Red Team each instantiate an independent `TacticalAgent`.
- Each agent maintains private tactical memory (recent turnover patterns, shot counts, defensive exploits).
- No shared memory exists between opposing tactical agents.

#### 4.2 Security & Sandbox Boundaries
- **Read-Only Snapshots**: The LLM receives a serialized clone of public match facts; it has no references to active memory or game instances.
- **Strict PlanValidator**:
  - Rejects plans with unauthorized player IDs (e.g., trying to control opposing players).
  - Prohibits assigning roles to human-controlled footballers.
  - Clamps numerical attributes ($0.0 \le \text{pressing} \le 1.0$).
  - Rejects non-existent strategies.
- **Deterministic Local Fallback**: When LLM calls timeout, fail, or lack API keys, `FallbackAI` evaluates match statistics (trailing score, high possession loss) and picks mathematically sound strategies deterministically.

---

### 5. Data & State Management

#### 5.1 Shared State Schema (Zod & TypeScript)
- Canonical types reside in `packages/shared/src/types.ts`.
- Validated schemas in `packages/shared/src/schemas.ts` govern every incoming socket packet and LLM response.
- Immutable update patterns prevent state corruption across simulation ticks.

#### 5.2 Persistence Strategy
- **Phase 1 MVP**: In-memory storage for active rooms, match instances, and real-time sessions.
- **Repository Pattern**: `MatchRepository` defines storage contracts (`saveMatchSummary`, `getPlayerStats`).
- **Production Readiness**: Pluggable adapter pattern allows swapping `InMemoryMatchRepository` for PostgreSQL/Supabase without touching the `MatchEngine`.

---

### 6. Security & Infrastructure Boundaries

1. **Server Authority**: The client never informs the server that a goal was scored or possession was gained; the client only sends intention (`input:update`, `action:pass`, `action:shoot`, `action:tackle`).
2. **Secrets Isolation**:
   - `LLM_API_KEY` exists strictly in the server environment.
   - Vite client builds expose only `VITE_` prefixed public variables (e.g., `VITE_SERVER_URL`).
3. **Connection & Resource Defense**:
   - Rooms expire automatically after inactivity.
   - Socket connections are rate-limited.
   - Disconnections safely transition human slots to AI bot controllers without match interruption.
