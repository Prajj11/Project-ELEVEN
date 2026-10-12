import {
  BALL_PHYSICS,
  MatchState,
  ROSTER_LIMITS,
  SIMULATION_CONSTANTS,
  TeamId,
} from '@project-eleven/shared';
import { PhysicsWorld } from './PhysicsWorld';

export class MatchRules {
  private static goalPauseTimers = new WeakMap<MatchState, number>();
  private static kickoffTimers = new WeakMap<MatchState, number>();

  public static resetToKickoff(state: MatchState, concedingTeam: TeamId) {
    state.phase = 'KICKOFF';
    state.kickoffTeam = concedingTeam;
    this.kickoffTimers.set(state, 0);

    // Reset ball to center spot
    state.ball.position = { x: 0, y: BALL_PHYSICS.RADIUS, z: 0 };
    state.ball.velocity = { x: 0, y: 0, z: 0 };
    state.ball.ownerId = null;
    state.possessionTeam = null;

    // Reset players to their starting halves
    const blueBaseZ = [-22.5, -14, -14, -5, -1];
    const blueBaseX = [0, -6, 6, -4, 3];

    const redBaseZ = [22.5, 14, 14, 5, 1];
    const redBaseX = [0, 6, -6, 4, -3];

    for (let i = 0; i < ROSTER_LIMITS.PLAYERS_PER_TEAM; i++) {
      const blueId = `blue_${i + 1}`;
      if (state.players[blueId]) {
        state.players[blueId].position = { x: blueBaseX[i], y: 0, z: blueBaseZ[i] };
        state.players[blueId].velocity = { x: 0, y: 0, z: 0 };
        state.players[blueId].facing = { x: 0, y: 0, z: 1 };
        state.players[blueId].hasPossession = false;
        state.players[blueId].actionCooldown = 0;
      }

      const redId = `red_${i + 1}`;
      if (state.players[redId]) {
        state.players[redId].position = { x: redBaseX[i], y: 0, z: redBaseZ[i] };
        state.players[redId].velocity = { x: 0, y: 0, z: 0 };
        state.players[redId].facing = { x: 0, y: 0, z: -1 };
        state.players[redId].hasPossession = false;
        state.players[redId].actionCooldown = 0;
      }
    }
  }

  public static updateClockAndPhases(
    state: MatchState,
    dt: number,
    onMatchEnd: () => void
  ) {
    if (state.phase === 'PLAYING') {
      state.remainingSeconds = Math.max(0, state.remainingSeconds - dt);
      state.elapsedSeconds += dt;

      if (state.remainingSeconds <= 0) {
        state.phase = 'FINISHED';
        onMatchEnd();
        return;
      }

      // Check out of bounds
      if (PhysicsWorld.isOutOfBounds(state.ball.position)) {
        const restartPos = PhysicsWorld.getRestartPosition(state.ball.position);
        state.ball.position = restartPos;
        state.ball.velocity = { x: 0, y: 0, z: 0 };
        state.ball.ownerId = null;
      }
    } else if (state.phase === 'GOAL_PAUSE') {
      const elapsed = (this.goalPauseTimers.get(state) ?? 0) + dt;
      this.goalPauseTimers.set(state, elapsed);
      if (elapsed + 1e-9 >= SIMULATION_CONSTANTS.GOAL_PAUSE_SECONDS) {
        this.goalPauseTimers.delete(state);
        this.resetToKickoff(state, state.kickoffTeam);
      }
    } else if (state.phase === 'KICKOFF') {
      const elapsed = (this.kickoffTimers.get(state) ?? 0) + dt;
      this.kickoffTimers.set(state, elapsed);
      if (elapsed + 1e-9 >= 3) {
        this.kickoffTimers.delete(state);
        const taker = state.players[`${state.kickoffTeam}_5`];
        if (taker) {
          const forward = state.kickoffTeam === 'blue' ? 1 : -1;
          taker.position = { x: 0, y: 0, z: -forward * BALL_PHYSICS.DRIBBLE_OFFSET_Z };
          taker.facing = { x: 0, y: 0, z: forward };
          for (const player of Object.values(state.players)) player.hasPossession = player.id === taker.id;
          state.ball.ownerId = taker.id;
          state.ball.lastTouchTeam = state.kickoffTeam;
          state.possessionTeam = state.kickoffTeam;
        }
        state.phase = 'PLAYING';
      }
    }
  }
}
