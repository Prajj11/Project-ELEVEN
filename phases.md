# Implementation Roadmap & Phases
## PROJECT ELEVEN: AGENTIC FOOTBALL ARENA

---

### Phase 1: Project Foundation & Monorepo Setup
- [ ] Initialize npm workspaces monorepo: `apps/web`, `apps/server`, `packages/shared`.
- [ ] Configure root `tsconfig.base.json` and strict TypeScript configurations.
- [ ] Scaffold `packages/shared`:
  - Canonical types (`MatchState`, `PlayerState`, `BallState`, `TacticalPlan`).
  - Zod validation schemas for all network packets and LLM responses.
  - Gameplay constants (`constants.ts`) and central configuration (`gameConfig.ts`).
- [ ] Scaffold `apps/server`:
  - Express + Socket.IO server boilerplate with TypeScript.
  - Configuration loader (`env.ts`).
  - Health check endpoint (`/health`).
- [ ] Scaffold `apps/web`:
  - Vite + React + TypeScript + Tailwind CSS setup.
  - Three.js + React Three Fiber + Drei dependencies.
  - Basic page routing and state stores (Zustand).
- [ ] Create `.env.example`, `.gitignore`, and root npm scripts (`dev`, `build`, `test`).
- [ ] **Verification**: Verify that both web client and server build and start without errors.

---

### Phase 2: 3D Football Sandbox
- [ ] Construct the 3D football pitch in React Three Fiber (`Pitch.tsx`):
  - 50m x 30m turf with realistic markings (halfway line, center circle, penalty boxes).
  - 3D Goals with crossbars, posts, and nets (`Goal.tsx`).
  - Stadium arena shell with 4 floodlights (`Stadium.tsx`, `Lighting.tsx`).
- [ ] Build procedural 3D footballer character models (`PlayerModel.tsx`):
  - Distinctive Blue vs. Red team jerseys, shorts, socks, and squad numbers.
  - Visual indicator / halo for the active player.
  - Neon goalkeeper kit variants.
- [ ] Implement the football model and 3D kinematics (`Ball.tsx`):
  - Rolling, bouncing, friction, and air drag physics.
- [ ] Implement camera system (`FollowCamera.tsx`):
  - Smooth damped follow camera tracking the controlled player and ball.
- [ ] Implement local movement controls (`KeyboardControls.ts`, `InputController.ts`):
  - WASD normalized movement, Shift sprint, and stamina mechanics.
- [ ] **Verification**: Move the footballer around the 3D pitch, sprint, and interact locally with the ball.

---

### Phase 3: Football Rules & Match Engine
- [ ] Implement server-authoritative fixed-step simulation loop (`FixedStepLoop.ts`, 60Hz).
- [ ] Build the ball possession system (`PossessionSystem.ts`):
  - Proximity check, velocity criteria, and dynamic dribble positioning.
- [ ] Implement passing mechanics (`PassingSystem.ts`):
  - Target teammate selection, ground pass velocity, and lane checks.
- [ ] Implement shooting mechanics (`ShootingSystem.ts`):
  - Directional kick impulses, power scaling, and shot trajectory.
- [ ] Implement physical tackling (`TacklingSystem.ts`):
  - Challenge range, cooldown, and recovery delays.
- [ ] Implement goalkeeper behavior (`GoalkeeperSystem.ts`):
  - Lateral goal line tracking, shot interception, and saves.
- [ ] Implement goal detection & match state transitions (`GoalDetection.ts`, `MatchRules.ts`):
  - Ball crossing goal plane, score incrementing, goal pause, and kickoff reset.
  - Authoritative match clock countdown (180s).
- [ ] **Verification**: Play a full simulated match with goals, saves, score updates, and match conclusion.

---

### Phase 4: Deterministic Gameplay AI
- [ ] Build individual AI footballer controller (`AIPlayerController.ts`):
  - Finite behavior states (`RETURN_TO_POSITION`, `SUPPORT_ATTACK`, `PRESS_BALL`, `MARK_OPPONENT`, `SHOOT`, `PASS`).
- [ ] Implement role-aware spatial positioning (`UtilityScoring.ts`):
  - Defending shape, attacking width, and lane coverage.
- [ ] Implement deterministic AI goalkeeper (`GoalkeeperAI.ts`):
  - Stays positioned relative to goal angle; dives to intercept incoming shots.
- [ ] Implement AI passing & shooting decision trees:
  - Evaluates passing lanes, shot probability, and pressure before acting.
- [ ] Fill all non-human positions with active AI footballers.
- [ ] **Verification**: Play a complete offline 5v5 match where 1 human + 4 AI compete against 5 AI bots.

---

### Phase 5: Multiplayer Networking & Synchronization
- [ ] Build Socket.IO networking layer (`SocketHandlers.ts`, `socketClient.ts`):
  - Typed client-to-server and server-to-client events.
- [ ] Implement room management (`RoomManager.ts`, `MatchRoom.ts`, `RoomCode.ts`):
  - Unique 6-character room codes, host privileges, team assignment, and ready toggles.
- [ ] Implement authoritative input transmission & validation:
  - Input sequences (`sequence`, `movement`, `aim`, `sprint`) validated on server.
  - Non-finite numbers rejected; rate limits enforced.
- [ ] Implement server snapshot broadcasting (`StateBroadcaster.ts`, 25Hz).
- [ ] Build client interpolation & prediction (`stateInterpolation.ts`, `prediction.ts`):
  - Smooth entity movement buffer preventing jitter or snapping.
- [ ] Implement disconnection resilience:
  - Disconnected human players instantly convert to deterministic AI bots without crashing the match.
- [ ] **Verification**: Connect two browser windows to the same room; move both players and verify synced ball and player states.

---

### Phase 6: Full 5v5 Mode & Roster Enforcement
- [ ] Enforce 5v5 team constraints:
  - Max 2 human slots per team (4 humans max per match).
  - 6 AI slots filling the rest (10 footballers on the pitch total).
  - Exactly 1 Goalkeeper per team.
- [ ] Build complete lobby workflow:
  - Team selection (Blue vs. Red), slot reservation, and ready checks.
  - "Start Match" enabled only when conditions are met.
- [ ] Provide "Solo Practice Against AI" mode:
  - 1 human controls their player; 9 AI bots fill the rest immediately.
- [ ] Validate that human players never have their movement overwritten by AI.
- [ ] **Verification**: Run standard lobby and solo practice mode with verified 10-player pitch roster.

---

### Phase 7: Agentic AI & Tactical Intelligence
- [ ] Build LLM provider adapter (`LLMProvider.ts`):
  - Pluggable provider interface (Google Gemini / OpenAI / Local).
  - Safe credential management from server environment.
- [ ] Implement read-only `TacticalSnapshot` builder (`TacticalSnapshot.ts`):
  - Sanitized match data (score, clock, positions, turnover patterns).
- [ ] Implement structured output validation (`PlanValidator.ts`, `schemas.ts`):
  - Strict Zod schema enforcing strategy, formation, pressing intensity, and AI roles.
  - Rejection of invalid player IDs, human overrides, or physics tampering.
- [ ] Build restricted tool registry (`ToolRegistry.ts`):
  - Safe tactical tools (`get_match_summary`, `set_team_strategy`, `assign_ai_role`).
- [ ] Instantiate two independent tactical agents:
  - Blue Tactical Agent vs. Red Tactical Agent with isolated memories (`TacticalMemory.ts`).
- [ ] Connect tactical plans to gameplay behavior:
  - `BALANCED`, `ATTACK`, `HIGH_PRESS`, `DEFEND`, `COUNTER_ATTACK` altering AI pressing, positioning, and line height.
- [ ] Implement robust fallback & resilience (`FallbackAI.ts`):
  - Timeout (5s), rate limiting (15s cooldown), and deterministic heuristic fallback when LLM is unavailable.
- [ ] **Verification**: Observe tactical plan updates logged and visible in gameplay when LLM is connected, and seamless fallback when disabled.

---

### Phase 8: UI/UX & Polish
- [ ] Build Landing Page (`LandingPage.tsx`):
  - Modern esports visual identity, game modes ("Play Online", "Practice vs AI", "How to Play").
- [ ] Build Room & Lobby UI (`LobbyPage.tsx`):
  - 5v5 slot cards, copy room code, team switchers, ready indicators.
- [ ] Build In-Match HUD (`MatchHUD.tsx`):
  - Scoreboard, countdown match clock, active possession badge.
  - Stamina bar, role indicator, and key binding hints.
- [ ] Build Collapsible Tactical Observability Panel (`TacticalPanel.tsx`):
  - Active Blue & Red strategies, pressing meters, and recent AI tactical reasoning.
- [ ] Build Goal Announcement & Celebration Banner (`GoalOverlay.tsx`).
- [ ] Build Post-Match Results Screen (`ResultsPage.tsx`):
  - Match winner, real statistics (shots, possession %, tackles, saves), tactical timeline.
- [ ] Build Settings Modal (`Settings.tsx`):
  - Audio volumes, graphics quality, camera toggle.
- [ ] **Verification**: Test the full UI flow from Landing -> Lobby -> Match -> Results with responsive interactions.

---

### Phase 9: Verification, Testing & Deployment Preparation
- [ ] Write and run automated unit tests with Vitest:
  - Simulation loop, possession acquisition, goal detection, PlanValidator, FallbackAI.
- [ ] Write networking & room integration tests:
  - Room lifecycle, roster limits, socket validation, disconnect handling.
- [ ] Build production assets:
  - Execute frontend production build (`npm run build -w apps/web`).
  - Execute backend production build (`npm run build -w apps/server`).
- [ ] Prepare deployment configuration:
  - Production `Dockerfile` for backend server.
  - Environment variable guidelines and static deployment setup for web client.
- [ ] Complete documentation:
  - Comprehensive `README.md` with architecture diagrams, setup commands, and manual verification checklists.
- [ ] **Verification**: Run all automated tests, confirm production builds pass cleanly, and verify game readiness.
