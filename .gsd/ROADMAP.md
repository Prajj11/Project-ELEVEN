---
milestone: v1.0-mvp
version: 1.0.0
updated: 2026-10-13T00:20:00Z
---

# Roadmap

> **Current Phase:** 1 - Project Foundation & Monorepo Setup
> **Status:** planning

## Must-Haves (from SPEC)

- [ ] 3D football pitch with goals, lighting, and camera
- [ ] Responsive player movement, sprinting, kicking, and tackling
- [ ] Server-authoritative physics, possession, and goal detection
- [ ] 5v5 Match structure (4 human slots max, 6 AI slots, 1 GK each)
- [ ] Layer 2 Deterministic AI controllers for individual footballers
- [ ] Layer 3 Independent Tactical LLM Agents for Blue & Red teams
- [ ] Real-time Socket.IO multiplayer with room codes and state interpolation
- [ ] In-match HUD, tactical observability panel, and post-match analytics

---

## Phases

### Phase 1: Project Foundation & Monorepo Setup
**Status:** 🔄 In Progress
**Objective:** Setup npm workspaces monorepo, shared schemas, server shell, and client shell.
**Dependencies:** None

### Phase 2: 3D Football Sandbox
**Status:** ⬜ Not Started
**Objective:** Render 3D pitch, procedural players, ball kinematics, and follow camera.
**Dependencies:** Phase 1

### Phase 3: Football Rules & Match Engine
**Status:** ⬜ Not Started
**Objective:** Implement authoritative 60Hz loop, ball possession, passing, shooting, tackling, goalkeeper saves, and goal detection.
**Dependencies:** Phase 2

### Phase 4: Deterministic Gameplay AI
**Status:** ⬜ Not Started
**Objective:** Implement 60Hz utility scoring and behavior states for outfield bots and goalkeepers.
**Dependencies:** Phase 3

### Phase 5: Multiplayer Networking & Synchronization
**Status:** ⬜ Not Started
**Objective:** Implement Socket.IO room manager, state broadcaster (25Hz), and client interpolation buffer.
**Dependencies:** Phase 4

### Phase 6: Full 5v5 Mode & Roster Enforcement
**Status:** ⬜ Not Started
**Objective:** Enforce 2 humans max per team, 6 AI bots, team assignment, and solo practice mode.
**Dependencies:** Phase 5

### Phase 7: Agentic AI & Tactical Intelligence
**Status:** ⬜ Not Started
**Objective:** Build independent Blue & Red LLM tactical agents, structured output validation, and fallback AI.
**Dependencies:** Phase 6

### Phase 8: UI/UX & Polish
**Status:** ⬜ Not Started
**Objective:** Complete Landing page, Lobby, In-Match HUD, Tactical Drawer, Goal banners, and Results screen.
**Dependencies:** Phase 7

### Phase 9: Verification, Testing & Deployment Preparation
**Status:** ⬜ Not Started
**Objective:** Run Vitest test suites, verify production builds, containerize server, and finalize documentation.
**Dependencies:** Phase 8

---

## Progress Summary

| Phase | Status | Objective |
|---|---|---|
| 1 | 🔄 | Monorepo Setup & Foundation |
| 2 | ⬜ | 3D Football Sandbox |
| 3 | ⬜ | Football Rules & Match Engine |
| 4 | ⬜ | Deterministic Gameplay AI |
| 5 | ⬜ | Multiplayer Networking |
| 6 | ⬜ | Full 5v5 Mode & Roster |
| 7 | ⬜ | Agentic Tactical Intelligence |
| 8 | ⬜ | UI/UX & Polish |
| 9 | ⬜ | Verification & Deployment |
