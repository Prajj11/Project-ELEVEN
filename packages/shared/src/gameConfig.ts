import {
  BALL_PHYSICS,
  PITCH_CONSTANTS,
  PLAYER_PHYSICS,
  ROSTER_LIMITS,
  SIMULATION_CONSTANTS,
} from './constants';

export interface GameConfiguration {
  pitch: typeof PITCH_CONSTANTS;
  simulation: typeof SIMULATION_CONSTANTS;
  player: typeof PLAYER_PHYSICS;
  ball: typeof BALL_PHYSICS;
  roster: typeof ROSTER_LIMITS;
  tacticalIntervalSeconds: number;
  tacticalCooldownSeconds: number;
}

export const defaultGameConfig: GameConfiguration = {
  pitch: PITCH_CONSTANTS,
  simulation: SIMULATION_CONSTANTS,
  player: PLAYER_PHYSICS,
  ball: BALL_PHYSICS,
  roster: ROSTER_LIMITS,
  tacticalIntervalSeconds: 15,
  tacticalCooldownSeconds: 10,
};
