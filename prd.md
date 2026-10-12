# Product Requirements Document (PRD)
## PROJECT ELEVEN: AGENTIC FOOTBALL ARENA

---

### 1. Executive Summary & Product Vision
**Project Eleven: Agentic Football Arena** is an online, real-time, 3D association-football simulation where human players compete alongside AI teammates against a team comprised of both human and AI players. 

The core differentiator is **Agentic Tactical Intelligence**: each team is captained by an independent tactical LLM agent that observes the match state, selects team strategies, assigns tactical roles, responds dynamically to opponent tactics, and provides human-readable strategic reasoning.

#### Core Product Principles
1. **Real Gameplay First**: Authentic 3D football physics, responsive controls, and solid networking take precedence over cosmetic features.
2. **Three Layers of Intelligence**:
   - **Layer 1 (Human)**: Direct player control via keyboard/mouse (WASD, Sprint, Pass, Shoot, Tackle).
   - **Layer 2 (Deterministic AI)**: 60Hz individual footballer decision-making (movement, positioning, marking, shooting, goalkeeping).
   - **Layer 3 (Agentic LLM AI)**: High-level team strategy, formation adjustments, pressing intensity, and tactical role adaptations.
3. **Resilience & Fallback**: The game must remain 100% playable at 60 FPS even when the LLM service is offline, slow, or rate-limited.
4. **Server-Authoritative Networking**: The server is the absolute source of truth for ball physics, positions, scores, and match rules.
5. **Zero Fabrication**: No fake multiplayer, no hardcoded LLM responses masquerading as live reasoning, and no non-functional UI buttons.

---

### 2. User Personas & Target Audience
- **Competitive Multiplayer Gamers**: Players seeking fast-paced 5v5 small-sided arcade/simulation football with seamless matchmaking.
- **AI & Strategy Enthusiasts**: Players intrigued by watching and directing autonomous AI agents adapting in real-time.
- **Solo Practice Players**: Gamers wanting to test skills and experiment with tactical AI setups in local sandbox or bot matches.

---

### 3. Match Format & Game Rules

#### 3.1 Match Specifications
- **Match Format**: 5-versus-5 (5v5).
- **Pitch Personnel**: Exactly 10 footballers on the pitch (5 Blue Team, 5 Red Team).
- **Player Composition**:
  - Maximum **2 Human Players** per team (4 humans total in a full lobby).
  - Minimum **3 AI Players** per team (6 AI footballers total).
  - Unoccupied human slots are automatically filled by AI players.
  - Exactly **1 Goalkeeper** per team (AI-controlled by default).
- **Match Duration**: 180 seconds (3 minutes) of real-time play, controlled strictly by the authoritative server clock.

#### 3.2 Match State Machine (FSM)
The match transitions through strictly validated states:
- `LOBBY`: Room configuration, team selection, and player readiness.
- `KICKOFF`: Players in formation, ball at center spot, awaiting kickoff whistle/pass.
- `PLAYING`: Live active gameplay.
- `GOAL_PAUSE`: Celebration freeze (3 seconds), goal announcement display, resetting player & ball positions.
- `FINISHED`: Server clock reaches 0:00, match ends, final statistics broadcast.
- `CANCELLED`: Premature termination (e.g., host disconnect or forfeit).

#### 3.3 Football Rules (MVP)
- **Included**: Kickoff, passing, shooting, dribbling, physical tackling/challenges, goalkeeper saves, boundary ball detection & reset, goal scoring, match clock.
- **Out-of-Bounds Restarts**: If the ball crosses touchlines or goal lines without a goal, it resets cleanly to the appropriate restart spot awarded to the opposing team.
- **Omitted from MVP**: Offside, fouls, penalty cards, complex throw-in choreographies.

---

### 4. Player Controls & Mechanics

#### 4.1 Input Schema
- **Movement**: `W` (Forward), `S` (Backward), `A` (Left), `D` (Right) — normalized diagonal vectors.
- **Sprint**: `Shift` (consumes Stamina; 1.4x speed boost).
- **Pass**: `E` (context-aware ground pass to closest teammate in aim direction or target lane).
- **Shoot**: `Space` (charged/instant directional shot towards opponent goal).
- **Tackle / Challenge**: `Q` (sliding/standing challenge with cooldown and recovery delay).
- **Aim**: Optional mouse cursor aiming relative to camera perspective.
- **Menu / Pause**: `Escape` (opens local client menu; does not pause authoritative server).

#### 4.2 Possession & Dribbling
- Server calculates ball proximity (< 1.2m) and relative approach speed.
- Ball is carried physically in front of the dribbler without rigid attachment to ensure tackle eligibility.
- Loose balls and contested 50-50 challenges are determined by physical positioning and tackle timing.

---

### 5. Agentic AI & Tactical System

#### 5.1 Tactical Strategies
Both Blue and Red teams possess independent tactical controllers supporting:
1. `BALANCED`: Standard shape, balanced pressing, safe pass distribution.
2. `ATTACK`: High line, wingers/support advance forward, progressive passing bias.
3. `HIGH_PRESS`: Immediate aggressive pressure on the ball carrier, compact opponent half.
4. `DEFEND`: Low block, compact penalty box defense, safe clearances.
5. `COUNTER_ATTACK`: Quick direct forward balls into space immediately upon ball recovery.

#### 5.2 Tactical Evaluation & Triggers
- LLM evaluation triggered periodically (e.g., every 15–20s) or on major match events (Kickoff, Goals, continuous turnovers).
- Responses are debounced (min 10s cooldown per team) and rate-limited.
- Strict timeout (5000ms): If the LLM response is delayed or fails, the team seamlessly continues using its active strategy or switches to deterministic heuristics.

#### 5.3 Tactical Output Specification
LLMs must return validated JSON conforming to a strict Zod schema:
```json
{
  "strategy": "COUNTER_ATTACK",
  "formation": "COMPACT_1_2_1",
  "pressingIntensity": 0.75,
  "attackingRisk": 0.7,
  "roleAssignments": [
    { "playerId": "blue-ai-1", "role": "PRESS" },
    { "playerId": "blue-ai-2", "role": "SUPPORT" },
    { "playerId": "blue-ai-3", "role": "FORWARD" }
  ],
  "reasonCode": "EXPLOITING_HIGH_DEFENSIVE_LINE",
  "explanation": "Opponent defenders are pushed high; launching direct counters into vacant space."
}
```

---

### 6. User Interface & Experience

1. **Landing Page**:
   - Game branding and agentic overview.
   - Action buttons: "Create Room", "Join Room", "Solo Practice Against AI", "Controls Guide".
2. **Lobby Screen**:
   - Room Code display with 1-click clipboard copy.
   - Interactive 5v5 team roster (Blue vs. Red slots).
   - Human slot selection, ready toggles, host "Start Match" control.
3. **In-Match HUD**:
   - Live Scoreboard & Match Clock.
   - Active possession indicator & stamina bar.
   - Controlled player visual halo/indicator.
   - Collapsible Tactical Drawer showing live AI strategies and reasoning.
   - Match Event Feed (goals, tackles, saves).
4. **Post-Match Results Screen**:
   - Final score & outcome (Victory/Defeat/Draw).
   - Real recorded statistics: Possession %, Shots, Shots on Target, Passes Completed, Tackles Won, Saves.
   - Summary of tactical shifts throughout the match.
   - "Rematch" and "Return to Lobby" actions.

---

### 7. Non-Functional Requirements
- **Performance**: 60 FPS client rendering on integrated GPUs; 60Hz server tick loop with sub-5% CPU footprint per room.
- **Latency & Sync**: State replication at 20-30 snapshots/sec; smooth interpolation buffer (100ms) with client-side prediction.
- **Security**: No secrets or LLM keys on frontend; strict server validation on all client inputs; rate limiting on room creation and socket events.
- **Reliability**: Graceful handling of player disconnects (immediate AI takeover) and zero server crashes on unhandled socket exceptions.
