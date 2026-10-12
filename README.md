# PROJECT ELEVEN: AGENTIC FOOTBALL ARENA

> A 3D Online Multiplayer Association-Football Simulation powered by Three.js, Socket.IO, and Dual Independent Tactical LLM Agents.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://react.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-r164-black.svg)](https://threejs.org/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.7-010101.svg)](https://socket.io/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-5.0-729b1b.svg)](https://vitest.dev/)

---

## 🌟 Highlights & Key Features

- **3D Football Arena**: Real-time 3D pitch ($50\text{ m} \times 30\text{ m}$), procedural articulated footballers, rolling and bouncing ball kinematics, and a dynamic sports broadcast follow camera.
- **5-versus-5 Match Format**: Exactly 10 footballers on the pitch (max 2 humans per team, 6 deterministic AI bots, and 1 goalkeeper each).
- **Three Tiers of Intelligence**:
  1. **Human Control**: Responsive direct movement with normalized diagonal clamping, sprinting, stamina, passing, shooting, and sliding challenges.
  2. **Layer 2 (Deterministic AI)**: 60Hz utility scoring and behavior trees governing bot positioning, passing lanes, and goalkeeper dives.
  3. **Layer 3 (Agentic LLM AI)**: Blue and Red teams have independent tactical agents that analyze match conditions, select strategies (`ATTACK`, `DEFEND`, `HIGH_PRESS`, `COUNTER_ATTACK`), and provide live reasoning.
- **Server-Authoritative Multiplayer**: Node.js fixed 60Hz simulation loop with 25Hz state snapshot broadcasting, client-side interpolation, and room matchmaking via 6-character codes.
- **Resilient Fallback**: 100% playable even if the LLM provider is offline, slow, or unconfigured via deterministic heuristic strategy adaptation.

---

## 🏗️ System Architecture

```mermaid
graph TD
    Client["Web Client (React / R3F)"] <-->|Snapshots (25Hz) / Inputs (30Hz)| Server["Authoritative Server (Node.js)"]
    
    subgraph Server Match Engine
        Server --> Loop["60Hz Fixed Simulation Loop"]
        Loop --> Physics["Ball Kinematics & Possession"]
        Loop --> Layer2["Deterministic AI & Goalkeepers"]
        Loop --> Rules["Goal Detection & Match Clock"]
        Loop --> Layer3["Dual Tactical LLM Agents"]
    end
    
    subgraph Layer 3 Agentic Systems
        Layer3 --> BlueAgent["Blue Tactical Agent (LLM / Fallback)"]
        Layer3 --> RedAgent["Red Tactical Agent (LLM / Fallback)"]
    end
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** v20+ or v24+
- **npm** v10+ or v11+
- **Git**

### Installation

```bash
# Clone the repository
git clone https://github.com/Prajj11/Project-ELEVEN.git
cd Project-ELEVEN

# Install all workspace dependencies
npm install

# Build shared types package
npm run build -w packages/shared
```

### Running Locally

```bash
# Option 1: Run both frontend and backend concurrently
npm run dev

# Option 2: Run in separate terminals
npm run dev:server   # Starts backend on http://localhost:3001
npm run dev:web      # Starts frontend on http://localhost:5173
```

Open `http://localhost:5173` in your browser.

---

## 🎮 Game Controls

| Key | Action | Description |
|---|---|---|
| `W`, `A`, `S`, `D` / Arrows | Move | Move player (normalized diagonal movement) |
| `Shift` | Sprint | 1.4x speed boost (consumes stamina) |
| `E` | Pass | Ground pass to nearest eligible teammate in lane |
| `Space` | Shoot | Directional shot towards opponent goal with lift |
| `Q` | Tackle | Sliding challenge to dislodge ball from opponent |
| `C` | Camera Toggle | Switch between Follow Camera and Tactical Camera |

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env`:

```bash
NODE_ENV=development
PORT=3001
CLIENT_ORIGIN=http://localhost:5173
VITE_SERVER_URL=http://localhost:3001

# LLM Tactical Coach Configuration (Optional)
# Options: gemini | openai | fallback
LLM_PROVIDER=fallback
LLM_API_KEY=
LLM_MODEL=gemini-1.5-flash
LLM_TIMEOUT_MS=5000
```

> **Note**: If `LLM_API_KEY` is omitted or set to `fallback`, the game automatically runs with the deterministic heuristic strategy engine.

---

## 🧪 Automated Testing

Run the Vitest test suites:

```bash
npm test
```

Verifies:
- 5v5 10-player roster generation and goalkeeper counts
- Boundary and goal plane collision detection
- Possession acquisition
- Zod schema validation for structured LLM tactical plans
- Deterministic heuristic strategy adaptations under trailing / leading states

---

## 📦 Production Builds

```bash
# Build production bundle for all workspaces
npm run build
```

---

## 📄 License
MIT &copy; 2026 Prajjwal / Project Eleven Team.
