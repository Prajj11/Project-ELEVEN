import { describe, expect, it } from 'vitest';
import {
  MatchStateManager,
  PlayerAssignment,
} from '../../apps/server/src/game/MatchState';
import { PhysicsWorld } from '../../apps/server/src/game/PhysicsWorld';
import { PossessionSystem } from '../../apps/server/src/game/PossessionSystem';
import { PITCH_CONSTANTS, ROSTER_LIMITS } from '@project-eleven/shared';

describe('MatchState & Roster Enforcement', () => {
  it('should initialize exactly 10 footballers on pitch with 1 GK per team', () => {
    const assignments: PlayerAssignment[] = [
      {
        socketId: 'sock_1',
        name: 'Player 1',
        teamId: 'blue',
        playerId: 'blue_2',
      },
      {
        socketId: 'sock_2',
        name: 'Player 2',
        teamId: 'red',
        playerId: 'red_2',
      },
    ];

    const state = MatchStateManager.createInitialState('test_match', assignments);

    const players = Object.values(state.players);
    expect(players.length).toBe(ROSTER_LIMITS.TOTAL_PLAYERS); // 10

    const bluePlayers = players.filter((p) => p.teamId === 'blue');
    const redPlayers = players.filter((p) => p.teamId === 'red');

    expect(bluePlayers.length).toBe(5);
    expect(redPlayers.length).toBe(5);

    // Exactly 1 goalkeeper per team
    const blueGKs = bluePlayers.filter((p) => p.role === 'GOALKEEPER');
    const redGKs = redPlayers.filter((p) => p.role === 'GOALKEEPER');
    expect(blueGKs.length).toBe(1);
    expect(redGKs.length).toBe(1);

    // Human vs AI controllers correctly assigned
    expect(state.players['blue_2'].controller).toBe('HUMAN');
    expect(state.players['red_2'].controller).toBe('HUMAN');
    expect(state.players['blue_1'].controller).toBe('AI'); // GK is AI
  });

  it('should initialize the 11th body on the pitch (Match Referee for Project Eleven)', () => {
    const state = MatchStateManager.createInitialState('test_match', []);
    expect(state.referee).toBeDefined();
    expect(state.referee.position).toBeDefined();
    // Exactly 10 players + 1 referee = 11 bodies
    const totalBodies = Object.keys(state.players).length + 1;
    expect(totalBodies).toBe(11);
  });

  it('should detect goal when ball crosses valid goal line', () => {
    // Ball past Red Goal (+25.2m, within goal width)
    const redGoalScored = PhysicsWorld.checkGoal({
      x: 0,
      y: 1.0,
      z: PITCH_CONSTANTS.RED_GOAL_Z + 0.3,
    });
    expect(redGoalScored).toBe('red'); // Scored on Red (Blue team scores)

    // Ball past Blue Goal (-25.2m, within goal width)
    const blueGoalScored = PhysicsWorld.checkGoal({
      x: 0,
      y: 1.0,
      z: PITCH_CONSTANTS.BLUE_GOAL_Z - 0.3,
    });
    expect(blueGoalScored).toBe('blue'); // Scored on Blue (Red team scores)

    // Ball wide outside goalposts
    const missedShot = PhysicsWorld.checkGoal({
      x: 5.0,
      y: 1.0,
      z: PITCH_CONSTANTS.RED_GOAL_Z + 0.5,
    });
    expect(missedShot).toBeNull();
  });

  it('should acquire possession when player is within control distance', () => {
    const state = MatchStateManager.createInitialState('test_match', []);

    // Place ball next to player blue_2
    const player = state.players['blue_2'];
    state.ball.position = {
      x: player.position.x + 0.5,
      y: 0.22,
      z: player.position.z + 0.5,
    };

    PossessionSystem.update(state);

    expect(state.ball.ownerId).toBe(player.id);
    expect(player.hasPossession).toBe(true);
    expect(state.possessionTeam).toBe('blue');
  });
});
