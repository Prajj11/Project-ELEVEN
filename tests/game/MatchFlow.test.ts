import { describe, expect, it } from 'vitest';
import { MatchStateManager } from '../../apps/server/src/game/MatchState';
import { MatchRules } from '../../apps/server/src/game/MatchRules';
import { GoalDetection } from '../../apps/server/src/game/GoalDetection';
import { MatchRoom } from '../../apps/server/src/rooms/MatchRoom';
import { Server } from 'socket.io';

describe('Match flow regressions', () => {
  it('starts automatically after three seconds and gives the kickoff team possession', () => {
    const state = MatchStateManager.createInitialState('countdown', []);
    for (let i = 0; i < 179; i++) MatchRules.updateClockAndPhases(state, 1 / 60, () => {});
    expect(state.phase).toBe('KICKOFF');
    MatchRules.updateClockAndPhases(state, 1 / 60, () => {});
    expect(state.phase).toBe('PLAYING');
    expect(state.ball.ownerId).toBe('blue_5');
    expect(state.players.blue_5.hasPossession).toBe(true);
    expect(state.remainingSeconds).toBe(180);
  });

  it('keeps simultaneous room goal timers independent and restarts with the conceding team', () => {
    const first = MatchStateManager.createInitialState('first', []);
    const second = MatchStateManager.createInitialState('second', []);
    for (const state of [first, second]) {
      state.phase = 'PLAYING';
      state.ball.position = { x: 0, y: .22, z: 26 };
      GoalDetection.checkAndHandleGoal(state, () => {});
      expect(state.kickoffTeam).toBe('red');
    }
    for (let i = 0; i < 120; i++) {
      MatchRules.updateClockAndPhases(first, 1 / 60, () => {});
      MatchRules.updateClockAndPhases(second, 1 / 60, () => {});
    }
    expect(first.phase).toBe('GOAL_PAUSE');
    expect(second.phase).toBe('GOAL_PAUSE');
    for (let i = 0; i < 60; i++) MatchRules.updateClockAndPhases(first, 1 / 60, () => {});
    expect(first.phase).toBe('KICKOFF');
    expect(first.kickoffTeam).toBe('red');
    expect(second.phase).toBe('GOAL_PAUSE');
  });

  it('limits multiplayer to two humans per side', () => {
    const room = new MatchRoom('room', 'ABCDEF', 'one', false, {} as Server);
    for (let i = 0; i < 4; i++) expect(room.addPlayer(String(i), 'Tester')).toBe(true);
    expect(room.addPlayer('fifth', 'Overflow')).toBe(false);
    expect(room.players.filter(p => p.teamId === 'blue')).toHaveLength(2);
    expect(room.players.filter(p => p.teamId === 'red')).toHaveLength(2);
  });

  it('ends a match once when its clock reaches zero', () => {
    const state = MatchStateManager.createInitialState('end', []);
    state.phase = 'PLAYING'; state.remainingSeconds = 1 / 60;
    let ended = 0;
    MatchRules.updateClockAndPhases(state, 1 / 60, () => { ended++; });
    MatchRules.updateClockAndPhases(state, 1 / 60, () => { ended++; });
    expect(state.phase).toBe('FINISHED');
    expect(ended).toBe(1);
  });
});
