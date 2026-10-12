export const PITCH_CONSTANTS = {
  // Dimensions in meters
  WIDTH: 30, // X from -15 to +15
  LENGTH: 50, // Z from -25 to +25
  HALF_WIDTH: 15,
  HALF_LENGTH: 25,
  CENTER_CIRCLE_RADIUS: 4.5,
  PENALTY_AREA_WIDTH: 14,
  PENALTY_AREA_DEPTH: 8,
  PENALTY_SPOT_DISTANCE: 19, // Z = +/- 19

  // Goals
  GOAL_WIDTH: 4.5, // X from -2.25 to +2.25
  GOAL_HEIGHT: 2.2, // Y from 0 to 2.2
  GOAL_DEPTH: 1.5,
  BLUE_GOAL_Z: -25,
  RED_GOAL_Z: 25,

  // Boundary margin before ball reset
  OUT_OF_BOUNDS_MARGIN: 1.5,
} as const;

export const SIMULATION_CONSTANTS = {
  TICK_RATE: 60, // 60Hz fixed simulation step
  TIMESTEP: 1 / 60, // ~16.66ms
  SNAPSHOT_BROADCAST_RATE: 25, // 25 snapshots per second
  SNAPSHOT_INTERVAL_MS: 1000 / 25, // 40ms
  MAX_ACCUMULATED_TIME_MS: 100, // Clamp against server stalls
  DEFAULT_MATCH_DURATION_SECONDS: 180, // 3 minutes
  GOAL_PAUSE_SECONDS: 3.0,
} as const;

export const PLAYER_PHYSICS = {
  RADIUS: 0.45,
  HEIGHT: 1.8,
  BASE_SPEED: 5.5, // m/s
  SPRINT_SPEED: 7.8, // m/s (1.4x)
  ROTATION_SPEED: 12.0, // rad/s
  STAMINA_MAX: 100,
  STAMINA_DRAIN_PER_SEC: 25,
  STAMINA_RECOVERY_PER_SEC: 15,
  STAMINA_MIN_TO_SPRINT: 10,
  POSSESSION_RADIUS: 1.1, // Distance within which player controls ball
  TACKLE_RADIUS: 1.5,
  TACKLE_COOLDOWN_TICKS: 60, // 1.0 second cooldown
  TACKLE_STUN_TICKS: 45, // 0.75 second recovery if tackled
} as const;

export const BALL_PHYSICS = {
  RADIUS: 0.22,
  MASS: 0.45, // kg
  RESTITUTION_TURF: 0.65, // Bounciness
  RESTITUTION_POST: 0.4,
  TURF_FRICTION: 0.985, // Velocity damping on ground per tick
  AIR_DRAG: 0.995, // Velocity damping in air per tick
  GRAVITY: -9.81,
  MAX_SPEED: 26.0, // m/s
  PASS_SPEED: 13.5, // m/s
  SHOT_MAX_SPEED: 20.0, // m/s
  DRIBBLE_OFFSET_Z: 0.65, // Distance ball is carried in front of player
} as const;

export const ROSTER_LIMITS = {
  PLAYERS_PER_TEAM: 5,
  MAX_HUMANS_PER_TEAM: 2,
  TOTAL_PLAYERS: 10,
  GOALKEEPERS_PER_TEAM: 1,
  OUTFIELD_PER_TEAM: 4,
} as const;
