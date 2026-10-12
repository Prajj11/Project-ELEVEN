import {
  BALL_PHYSICS,
  ControllerType,
  MatchSnapshot,
  MatchState,
  PlayerRole,
  PlayerState,
  ROSTER_LIMITS,
  SIMULATION_CONSTANTS,
  TeamId,
  Vec3,
} from '@project-eleven/shared';

export interface PlayerAssignment {
  socketId: string;
  name: string;
  teamId: TeamId;
  playerId: string;
}

export class MatchStateManager {
  public static createInitialState(
    matchId: string,
    assignments: PlayerAssignment[]
  ): MatchState {
    const players: Record<string, PlayerState> = {};

    // Initial 5-a-side layout for Blue Team (facing +Z)
    const bluePositions: Array<{ role: PlayerRole; pos: Vec3 }> = [
      { role: 'GOALKEEPER', pos: { x: 0, y: 0, z: -22.5 } },
      { role: 'DEFENDER', pos: { x: -6, y: 0, z: -14 } },
      { role: 'DEFENDER', pos: { x: 6, y: 0, z: -14 } },
      { role: 'MIDFIELDER', pos: { x: -4, y: 0, z: -5 } },
      { role: 'FORWARD', pos: { x: 3, y: 0, z: -1 } },
    ];

    // Initial 5-a-side layout for Red Team (facing -Z)
    const redPositions: Array<{ role: PlayerRole; pos: Vec3 }> = [
      { role: 'GOALKEEPER', pos: { x: 0, y: 0, z: 22.5 } },
      { role: 'DEFENDER', pos: { x: 6, y: 0, z: 14 } },
      { role: 'DEFENDER', pos: { x: -6, y: 0, z: 14 } },
      { role: 'MIDFIELDER', pos: { x: 4, y: 0, z: 5 } },
      { role: 'FORWARD', pos: { x: -3, y: 0, z: 1 } },
    ];

    // Instantiate Blue Team footballers
    const bluePlayerIds: string[] = [];
    for (let i = 0; i < ROSTER_LIMITS.PLAYERS_PER_TEAM; i++) {
      const id = `blue_${i + 1}`;
      bluePlayerIds.push(id);
      const assignment = assignments.find((a) => a.playerId === id);
      const layout = bluePositions[i];

      players[id] = {
        id,
        number: i + 1,
        name: assignment ? assignment.name : `Blue AI #${i + 1}`,
        teamId: 'blue',
        controller: assignment ? 'HUMAN' : 'AI',
        role: layout.role,
        position: { ...layout.pos },
        velocity: { x: 0, y: 0, z: 0 },
        facing: { x: 0, y: 0, z: 1 },
        stamina: 100,
        tacticalAssignment: layout.role,
        socketId: assignment ? assignment.socketId : null,
        hasPossession: false,
        actionCooldown: 0,
      };
    }

    // Instantiate Red Team footballers
    const redPlayerIds: string[] = [];
    for (let i = 0; i < ROSTER_LIMITS.PLAYERS_PER_TEAM; i++) {
      const id = `red_${i + 1}`;
      redPlayerIds.push(id);
      const assignment = assignments.find((a) => a.playerId === id);
      const layout = redPositions[i];

      players[id] = {
        id,
        number: i + 1,
        name: assignment ? assignment.name : `Red AI #${i + 1}`,
        teamId: 'red',
        controller: assignment ? 'HUMAN' : 'AI',
        role: layout.role,
        position: { ...layout.pos },
        velocity: { x: 0, y: 0, z: 0 },
        facing: { x: 0, y: 0, z: -1 },
        stamina: 100,
        tacticalAssignment: layout.role,
        socketId: assignment ? assignment.socketId : null,
        hasPossession: false,
        actionCooldown: 0,
      };
    }

    return {
      matchId,
      tick: 0,
      phase: 'KICKOFF',
      elapsedSeconds: 0,
      remainingSeconds: SIMULATION_CONSTANTS.DEFAULT_MATCH_DURATION_SECONDS,
      possessionTeam: null,
      ball: {
        position: { x: 0, y: BALL_PHYSICS.RADIUS, z: 0 },
        velocity: { x: 0, y: 0, z: 0 },
        ownerId: null,
        lastTouchTeam: null,
      },
      players,
      teams: {
        blue: {
          score: 0,
          tactics: {
            strategy: 'BALANCED',
            formation: 'BALANCED_1_2_1',
            pressingIntensity: 0.5,
            attackingRisk: 0.5,
            roleAssignments: [],
            reasonCode: 'MATCH_KICKOFF',
            explanation: 'Blue team begins in structured balanced shape.',
            isLLMGenerated: false,
            lastUpdatedTick: 0,
          },
          playerIds: bluePlayerIds,
        },
        red: {
          score: 0,
          tactics: {
            strategy: 'BALANCED',
            formation: 'BALANCED_1_2_1',
            pressingIntensity: 0.5,
            attackingRisk: 0.5,
            roleAssignments: [],
            reasonCode: 'MATCH_KICKOFF',
            explanation: 'Red team begins in structured balanced shape.',
            isLLMGenerated: false,
            lastUpdatedTick: 0,
          },
          playerIds: redPlayerIds,
        },
      },
      kickoffTeam: 'blue',
      lastEventTimestamp: Date.now(),
      referee: {
        position: { x: 4.5, y: 0, z: 0 },
        velocity: { x: 0, y: 0, z: 0 },
        facing: { x: -1, y: 0, z: 0 },
      },
    };
  }

  public static createSnapshot(state: MatchState): MatchSnapshot {
    return {
      tick: state.tick,
      serverTimestamp: Date.now(),
      phase: state.phase,
      remainingSeconds: state.remainingSeconds,
      possessionTeam: state.possessionTeam,
      scores: {
        blue: state.teams.blue.score,
        red: state.teams.red.score,
      },
      ball: {
        position: { ...state.ball.position },
        velocity: { ...state.ball.velocity },
        ownerId: state.ball.ownerId,
      },
      referee: {
        position: { ...state.referee.position },
        velocity: { ...state.referee.velocity },
        facing: { ...state.referee.facing },
      },
      players: Object.values(state.players).map((p) => ({
        id: p.id,
        number: p.number,
        teamId: p.teamId,
        controller: p.controller,
        role: p.role,
        position: { ...p.position },
        velocity: { ...p.velocity },
        facing: { ...p.facing },
        stamina: p.stamina,
        hasPossession: p.hasPossession,
      })),
      tactics: {
        blue: {
          strategy: state.teams.blue.tactics.strategy,
          pressingIntensity: state.teams.blue.tactics.pressingIntensity,
          explanation: state.teams.blue.tactics.explanation,
          isLLM: state.teams.blue.tactics.isLLMGenerated,
        },
        red: {
          strategy: state.teams.red.tactics.strategy,
          pressingIntensity: state.teams.red.tactics.pressingIntensity,
          explanation: state.teams.red.tactics.explanation,
          isLLM: state.teams.red.tactics.isLLMGenerated,
        },
      },
    };
  }
}
