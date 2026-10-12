# Architecture Documentation
See full [architecture.md](../architecture.md) for comprehensive system design.

## Core Topology
- **Frontend (`apps/web`)**: React 18 / Vite / Three.js / React Three Fiber / Tailwind CSS / Zustand / Socket.IO Client.
- **Backend (`apps/server`)**: Node.js / TypeScript / Express / Socket.IO / Authoritative Match Engine (60Hz) / Tactical LLM Orchestrator.
- **Shared (`packages/shared`)**: Canonical types, Zod validation schemas, gameplay constants.

## Three-Tier Intelligence
- **Tier 1 (Human)**: WASD + Mouse Aim + Action buttons directly controlling assigned footballer.
- **Tier 2 (Individual AI)**: 60Hz utility scoring and behavior trees (press, mark, support, save, shoot).
- **Tier 3 (Tactical LLM)**: Asynchronous team-level strategic agent evaluating match state and adjusting formation, pressing, and AI roles.
