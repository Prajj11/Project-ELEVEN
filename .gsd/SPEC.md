# SPEC.md — Project Specification
# PROJECT ELEVEN: AGENTIC FOOTBALL ARENA

> **Status**: `FINALIZED`
>
> ⚠️ **Planning Lock**: Spec is finalized and ready for phase planning and execution.

## Vision
An online, real-time, 3D association-football simulation where humans compete alongside AI teammates against opposing teams with human and AI players, orchestrated by two independent tactical LLM agents.

## Goals
1. **Real 3D Football Simulation** — Authoritative pitch, controllable footballers, ball dynamics, passing, shooting, tackling, goalkeeping, and goals.
2. **Three-Layer Intelligence** — Human controls, 60Hz deterministic individual AI bots, and independent team-level tactical LLM agents.
3. **5v5 Multiplayer Matchmaking** — 4 humans (2 per team max) + 6 AI bots with real-time Socket.IO synchronization.
4. **Deterministic Resilience** — Full gameplay remains responsive and playable even if the LLM is slow, rate-limited, or unavailable.

## Non-Goals (Out of Scope for MVP)
- Offside rules, yellow/red cards, fouls, and complex throw-in choreographies.
- Continuous LLM calls per frame or LLM physics calculation.
- 11-a-side large stadium matches.
- Client-authoritative score or goal reporting.

## Constraints
- Server is the single source of truth for match state, score, clock, and physics.
- Secrets (`LLM_API_KEY`) must never be exposed to client bundles.
- Human input must never be overridden by AI commands.
- Fixed 60Hz server tick loop with 20-30Hz client snapshot replication.

## Success Criteria
- [x] Full specification document finalized in `prd.md` and `.gsd/SPEC.md`.
- [ ] 3D football pitch rendered with controllable players and responsive ball physics.
- [ ] Server-authoritative 5v5 gameplay with accurate goal detection and clock management.
- [ ] Two independent tactical agents providing validated team strategies and deterministic fallback.
- [ ] Smooth multiplayer networking with room codes and state interpolation.

---

*Last updated: 2026-10-13*
