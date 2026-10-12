import { afterEach, describe, expect, it, vi } from 'vitest';
import { MatchState, PLAYER_PHYSICS } from '@project-eleven/shared';
import { MatchEngine } from '../../apps/server/src/game/MatchEngine';
import { MatchStateManager } from '../../apps/server/src/game/MatchState';
import { AIPlayerController } from '../../apps/server/src/ai/AIPlayerController';

// Exercise movement without starting server timers, sockets, or tactical requests.
const makeHuman = () => {
  const engine = new MatchEngine('movement-test', [{
    socketId: 'test', name: 'Runner', teamId: 'blue', playerId: 'blue_2',
  }], () => {}, () => {}, () => {});
  const internals = engine as unknown as {
    state: MatchState;
    processHumanInputs: (dt: number) => void;
  };
  internals.state.phase = 'PLAYING';
  const player = internals.state.players.blue_2;
  player.position = { x: 0, y: 0, z: 0 };
  return { engine, internals, player };
};

afterEach(() => vi.restoreAllMocks());

describe('Human and AI movement parity', () => {
  it.each([20, 30, 60])('runs at full speed with %i input messages per second', rate => {
    let now = 0;
    vi.spyOn(Date, 'now').mockImplementation(() => now);
    const { engine, internals, player } = makeHuman();
    for (let tick = 0; tick < 60; tick++) {
      now = tick * 1000 / 60;
      if (tick % (60 / rate) === 0) {
        engine.queueInput(player.id, { sequence: tick, movement: { x: 0, z: 1 }, sprint: false });
      }
      internals.processHumanInputs(1 / 60);
    }
    expect(player.position.z).toBeCloseTo(PLAYER_PHYSICS.BASE_SPEED, 6);
  });

  it('stops immediately on key release and times out missing inputs', () => {
    let now = 0;
    vi.spyOn(Date, 'now').mockImplementation(() => now);
    const { engine, internals, player } = makeHuman();
    engine.queueInput(player.id, { sequence: 1, movement: { x: 1, z: 0 }, sprint: false });
    internals.processHumanInputs(1 / 60);
    engine.queueInput(player.id, { sequence: 2, movement: { x: 0, z: 0 }, sprint: false });
    const stoppedX = player.position.x;
    internals.processHumanInputs(1 / 60);
    expect(player.position.x).toBe(stoppedX);
    engine.queueInput(player.id, { sequence: 3, movement: { x: 1, z: 0 }, sprint: false });
    now = 251;
    internals.processHumanInputs(1 / 60);
    expect(player.position.x).toBe(stoppedX);
    expect(player.velocity.x).toBe(0);
  });

  it('does not move faster diagonally', () => {
    const { engine, internals, player } = makeHuman();
    engine.queueInput(player.id, { sequence: 1, movement: { x: 1, z: 1 }, sprint: false });
    internals.processHumanInputs(1 / 60);
    expect(Math.hypot(player.velocity.x, player.velocity.z)).toBeCloseTo(PLAYER_PHYSICS.BASE_SPEED);
  });

  it('gives an AI chaser the same sprint speed and stamina cost as a human', () => {
    let now = 0;
    vi.spyOn(Date, 'now').mockImplementation(() => now);
    const { engine, internals, player } = makeHuman();
    const aiState = MatchStateManager.createInitialState('ai-speed-test', []);
    aiState.phase = 'PLAYING';
    const ai = aiState.players.blue_2;
    ai.position = { x: 0, y: 0, z: 0 };
    aiState.players = { [ai.id]: ai };
    aiState.ball.position = { x: 0, y: .22, z: 20 };
    for (let tick = 0; tick < 60; tick++) {
      now = tick * 1000 / 60;
      if (tick % 2 === 0) engine.queueInput(player.id, {
        sequence: tick, movement: { x: 0, z: 1 }, sprint: true,
      });
      internals.processHumanInputs(1 / 60);
      AIPlayerController.update(aiState, 1 / 60);
    }
    expect(player.position.z).toBeCloseTo(PLAYER_PHYSICS.SPRINT_SPEED, 6);
    expect(ai.position.z).toBeCloseTo(player.position.z, 6);
    expect(ai.stamina).toBeCloseTo(player.stamina, 6);
    expect(ai.stamina).toBeCloseTo(75, 6);

    ai.stamina = 0;
    player.stamina = 0;
    internals.processHumanInputs(1 / 60);
    AIPlayerController.update(aiState, 1 / 60);
    expect(ai.velocity.z).toBe(PLAYER_PHYSICS.BASE_SPEED);
    expect(player.velocity.z).toBe(PLAYER_PHYSICS.BASE_SPEED);
  });

  it('discards held movement when a player leaves or the match pauses', () => {
    const { engine, internals, player } = makeHuman();
    const input = { sequence: 1, movement: { x: 0, z: 1 }, sprint: true };
    engine.queueInput(player.id, input);
    engine.clearInput(player.id);
    internals.processHumanInputs(1 / 60);
    expect(player.position.z).toBe(0);
    engine.queueInput(player.id, input);
    engine.togglePause();
    engine.togglePause();
    internals.processHumanInputs(1 / 60);
    expect(player.position.z).toBe(0);
  });
});
