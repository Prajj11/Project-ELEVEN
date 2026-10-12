# PROJECT ELEVEN: AGENTIC FOOTBALL ARENA

> A 3D Online Multiplayer Association-Football Simulation powered by Three.js, React Three Fiber, Socket.IO, and Dual Independent Tactical LLM Agents.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://react.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-r164-black.svg)](https://threejs.org/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.7-010101.svg)](https://socket.io/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-5.0-729b1b.svg)](https://vitest.dev/)
[![Docker](https://img.shields.io/badge/Docker-Containerized-2496ed.svg)](https://www.docker.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 📖 Overview & The "Project Eleven" Concept

**Project Eleven** is a fast-paced 5v5 competitive 3D football arena combining real-time physics, multiplayer networking, and an innovative three-tier artificial intelligence hierarchy.

### Why "Project Eleven"?
In traditional association football, 11 players make up a squad. In **Project Eleven**, the arena features exactly **11 active bodies** sharing the pitch:
- **10 Footballers (5v5)**: 5 Blue vs. 5 Red (each team fielding 1 Goalkeeper and 4 outfielders, with up to 2 human players per team and deterministic AI bots backfilling remaining positions).
- **The 11th Body — The 3D Match Referee**: An autonomous match official in high-visibility kit that dynamically tracks the flow of play, maintaining optimal vantage angles without obstructing footballer movements or ball trajectories.

---

## 🌟 Key Features & Gameplay Highlights

- **Dynamic 3D Football Pitch & Stadium**: 50 m &times; 30 m turf pitch with regulatory markings, 3D goalposts with netting, 4 arena floodlight towers, and procedural articulated footballers with custom team kits and squad numbers.
- **Three Tiers of Intelligence**:
  1. **Tier 1 (Human Direct Control)**: Camera-aligned directional movement, normalized diagonal velocity, sprint acceleration with stamina recovery, ground passing, sliding challenges, and variable-charge shooting.
  2. **Tier 2 (Deterministic 60Hz AI)**: Behavior trees and utility scoring running at 60Hz governing bot positioning, passing lanes, loose-ball pursuit, marking, and goalkeeper diving.
  3. **Tier 3 (Agentic LLM Tactical AI)**: Blue and Red teams have independent LLM coaches (Google Gemini, OpenAI, or local heuristics) analyzing match snapshots to adjust strategies (`ATTACK`, `DEFEND`, `HIGH_PRESS`, `COUNTER_ATTACK`), formations, and pressing lines with live tactical explanations streamed to the HUD.
- **Variable Shot Charging & HUD Power Meter**: Hold `Space` to charge shot power from 40% to 100% with a live visual power gauge; release to strike with directional elevation and velocity.
- **Anti-Clumping Repulsion Physics**: Soft-body repulsion forces prevent unnatural player bunching around the ball, maintaining realistic tactical spacing and passing channels.
- **Match Flow & Controls**:
  - Full match pause/resume (`P` key or HUD button) with clock freeze.
  - In-match settings menu and safe exit confirmation modal (`Escape` key).
  - Dual broadcast camera modes (`C` key): dynamic follow camera tracking player and ball, or overhead tactical camera.
  - Live minimap radar and off-screen ball tracking indicator.
- **Server-Authoritative Multiplayer**:
  - Node.js authoritative 60Hz physics loop and 25Hz state snapshot broadcasting.
  - Client-side interpolation buffer for silky smooth entity movement.
  - Room matchmaking via 6-character room codes.
  - "Solo Practice Against AI" mode for instant single-player kickoff.
  - Disconnect resilience: disconnected humans automatically transition into AI bots without match disruption.
- **100% Resilient & Playable Offline**: Deterministic heuristic coach activates automatically when LLM keys are absent, timed out, or rate-limited.

---

## 🏗️ System Architecture

```mermaid
graph TD
    Client["Web Client (React / Three.js / R3F)"] <-->|Snapshots (25Hz) / Inputs (30Hz)| Server["Authoritative Server (Node.js / Express / Socket.IO)"]
    
    subgraph Server Match Engine [60Hz Fixed Simulation Loop]
        Server --> Loop["FixedStepLoop (60Hz)"]
        Loop --> Physics["PhysicsWorld (Ball & Player Kinematics)"]
        Loop --> Spacing["Player Separation & Repulsion Physics"]
        Loop --> Possession["Possession & Tackling System"]
        Loop --> Referee["3D Referee Autonomous Movement"]
        Loop --> Rules["GoalDetection & 180s Match Clock"]
        Loop --> Layer2["Layer 2: Deterministic AI & Goalkeepers"]
        Loop --> Layer3["Layer 3: Dual Tactical LLM Agents"]
    end
    
    subgraph Layer 3 Tactical Intelligence
        Layer3 --> BlueAgent["Blue Tactical Coach (Gemini / OpenAI / Heuristic)"]
        Layer3 --> RedAgent["Red Tactical Coach (Gemini / OpenAI / Heuristic)"]
        BlueAgent --> HUD["Live Tactical HUD Reasoning & Strategy"]
        RedAgent --> HUD
    end
```

---

## 🎮 Game Controls & Hotkeys

| Key / Input | Action | Description |
|---|---|---|
| `W`, `A`, `S`, `D` / Arrows | **Move** | Move player (camera-aligned, normalized diagonal movement) |
| `Shift` | **Sprint** | 1.4&times; sprint speed boost (consumes sprint stamina energy) |
| `Space` *(Hold & Release)* | **Shoot** | Hold to charge shot power (40%&ndash;100% power meter); release to shoot with lift |
| `E` | **Pass** | Ground pass directly to nearest teammate in open passing lane |
| `Q` | **Tackle** | Sliding challenge to dislodge the ball from opponents |
| `C` | **Camera Toggle** | Switch between dynamic Follow Camera and overhead Tactical Camera |
| `P` | **Pause / Resume** | Freeze match clock and physics simulation |
| `Escape` | **Match Menu** | Open in-match menu, camera/minimap settings, or leave match |

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** v20+ or v24+ ([Download Node.js](https://nodejs.org))
- **npm** v10+ or v11+
- **Git**

---

### Option 1: 1-Click Launcher (Windows)

On Windows, double-click `run.bat` or run:

```bat
run.bat
```

The launcher will:
1. Verify Node.js installation.
2. Install workspace dependencies (`npm install`) if missing.
3. Build shared types (`packages/shared`).
4. Start the backend server on port `3001`.
5. Start the Vite web frontend on port `5173`.
6. Automatically open your default browser to `http://localhost:5173`.

---

### Option 2: Cross-Platform Manual Setup

```bash
# 1. Clone repository
git clone https://github.com/Prajj11/Project-ELEVEN.git
cd Project-ELEVEN

# 2. Install dependencies across all monorepo workspaces
npm install

# 3. Build shared types package
npm run build -w packages/shared

# 4. Start both client and server concurrently
npm run dev
```

Alternatively, run client and server in dedicated terminals:

```bash
# Terminal 1: Backend Server (Port 3001)
npm run dev:server

# Terminal 2: Web Client (Port 5173)
npm run dev:web
```

Open [http://localhost:5173](http://localhost:5173) in your web browser.

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env` in the repository root:

```bash
cp .env.example .env
```

| Variable | Default | Description |
|---|---|---|
| `NODE_ENV` | `development` | Application environment (`development`, `production`, `test`) |
| `PORT` | `3001` | Authoritative backend server HTTP and WebSocket port |
| `CLIENT_ORIGIN` | `http://localhost:5173` | Allowed CORS origin for frontend client connections |
| `VITE_SERVER_URL` | `http://localhost:3001` | Web client endpoint for backend Socket.IO connection |
| `LLM_PROVIDER` | `fallback` | Tactical coach provider (`gemini`, `openai`, or `fallback`) |
| `LLM_API_KEY` | *(empty)* | API key for Gemini or OpenAI (optional) |
| `LLM_MODEL` | `gemini-1.5-flash` | Model identifier (e.g. `gemini-1.5-flash`, `gpt-4o-mini`) |
| `LLM_TIMEOUT_MS` | `5000` | Tactical coach evaluation timeout in milliseconds |
| `LLM_MAX_REQUESTS_PER_MATCH` | `20` | Max LLM evaluations permitted per 3-minute match |

> **Note**: Setting `LLM_PROVIDER=fallback` runs the game completely offline with the deterministic heuristic coach. No API key is required to enjoy the full experience.

---

## 🧪 Testing & Verification

Project Eleven features extensive automated test suites built with [Vitest](https://vitest.dev/):

```bash
# Run all unit and integration test suites
npm test
```

### Verified Test Suites:
- `MatchEngine.test.ts`: Exactly 10 players + 1 Referee (11 bodies on pitch), 1 GK per team, goal line crossing, ball possession acquisition.
- `MatchFlow.test.ts`: 3-second kickoff countdown, possession assignment, multi-room independence, 2-human per team roster capacity, match termination at clock zero.
- `MovementParity.test.ts`: 20/30/60 Hz input transmission parity, instant key-release stopping, diagonal velocity normalization, sprint speed and stamina parity between human and AI chasers.
- `TacticalPlan.test.ts`: Zod schema validation for LLM tactical outputs, rejection of illegal parameters, adaptive fallback strategy under trailing and leading match contexts.

### End-to-End Smoke Test:
Run the multi-client simulation script to test socket room creation, joining, kickoff, pause, resume, and full match completion:

```bash
node scripts/smoke-game.mjs http://localhost:3001
```

---

## 📦 Production Builds & Docker

### Local Production Build
```bash
# Typecheck and build all workspace packages
npm run build
```

### Docker Deployment
Build and run the authoritative match server in a containerized environment:

```bash
# Build Docker image
docker build -t project-eleven-server .

# Run container
docker run -p 3001:3001 --env-file .env project-eleven-server
```

Health check endpoint: `http://localhost:3001/health`

---

## 📁 Repository Structure

```
Project Eleven/
├── apps/
│   ├── server/             # Authoritative Node.js + Socket.IO server
│   │   ├── src/
│   │   │   ├── ai/         # Deterministic AI controllers, FallbackAI, LLM providers
│   │   │   ├── config/     # Environment configuration and schemas
│   │   │   ├── game/       # 60Hz physics, movement, rules, goal detection, referee
│   │   │   ├── networking/ # Socket event handlers and state broadcasting
│   │   │   └── rooms/      # Room matchmaking, player slots, lifecycle
│   │   └── package.json
│   └── web/                # React 18 + Three.js + React Three Fiber frontend
│       ├── src/
│       │   ├── controls/   # KeyboardControls and input mapping
│       │   ├── game/       # 3D Scene, Pitch, Ball, PlayerModel, RefereeModel, Camera
│       │   ├── hud/        # Scoreboard, Minimap, TacticalPanel, MatchHUD
│       │   ├── network/    # Typed SocketClient
│       │   ├── pages/      # LandingPage, LobbyPage, ResultsPage
│       │   └── stores/     # Zustand state stores (match, lobby, input, settings)
│       └── package.json
├── packages/
│   └── shared/             # Shared types, Zod schemas, constants, events
├── scripts/                # E2E smoke test and validation scripts
├── tests/                  # Vitest regression and parity test suites
├── Dockerfile              # Multi-stage production container definition
├── run.bat                 # 1-Click Windows launcher script
└── README.md               # Project documentation
```

---

## 📄 License

Distributed under the MIT License. See [LICENSE](LICENSE) for details.

&copy; 2026 Prajjwal / Project Eleven Team.
