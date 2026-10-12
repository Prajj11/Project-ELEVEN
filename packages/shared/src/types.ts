export type TeamId = 'blue' | 'red';

export type ControllerType = 'HUMAN' | 'AI';

export type MatchPhase =
  | 'LOBBY'
  | 'KICKOFF'
  | 'PLAYING'
  | 'PAUSED'
  | 'GOAL_PAUSE'
  | 'FINISHED'
  | 'CANCELLED';

export type PlayerRole = 'GOALKEEPER' | 'DEFENDER' | 'MIDFIELDER' | 'FORWARD';

export type TacticalStrategy =
  | 'BALANCED'
  | 'ATTACK'
  | 'HIGH_PRESS'
  | 'DEFEND'
  | 'COUNTER_ATTACK';

export type TacticalFormation =
  | 'COMPACT_1_2_1'
  | 'WIDE_1_1_2'
  | 'DEFENSIVE_1_3_0'
  | 'AGGRESSIVE_1_1_2'
  | 'BALANCED_1_2_1';

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface PlayerState {
  id: string;
  number: number;
  name: string;
  teamId: TeamId;
  controller: ControllerType;
  role: PlayerRole;
  position: Vec3;
  velocity: Vec3;
  facing: Vec3;
  stamina: number; // 0 - 100
  tacticalAssignment?: string;
  socketId?: string | null;
  hasPossession: boolean;
  actionCooldown: number;
}

export interface BallState {
  position: Vec3;
  velocity: Vec3;
  ownerId: string | null;
  lastTouchTeam: TeamId | null;
}

export interface TeamTactics {
  strategy: TacticalStrategy;
  formation: TacticalFormation;
  pressingIntensity: number; // 0.0 - 1.0
  attackingRisk: number; // 0.0 - 1.0
  roleAssignments: Array<{
    playerId: string;
    role: string;
  }>;
  reasonCode: string;
  explanation: string;
  isLLMGenerated: boolean;
  lastUpdatedTick: number;
}

export interface TeamState {
  score: number;
  tactics: TeamTactics;
  playerIds: string[];
}

export interface MatchState {
  matchId: string;
  tick: number;
  phase: MatchPhase;
  elapsedSeconds: number;
  remainingSeconds: number;
  possessionTeam: TeamId | null;
  ball: BallState;
  players: Record<string, PlayerState>;
  teams: Record<TeamId, TeamState>;
  kickoffTeam: TeamId;
  lastEventTimestamp: number;
  referee: {
    position: Vec3;
    velocity: Vec3;
    facing: Vec3;
  };
}

export interface MatchSnapshot {
  tick: number;
  serverTimestamp: number;
  phase: MatchPhase;
  remainingSeconds: number;
  possessionTeam: TeamId | null;
  scores: {
    blue: number;
    red: number;
  };
  ball: {
    position: Vec3;
    velocity: Vec3;
    ownerId: string | null;
  };
  referee: {
    position: Vec3;
    velocity: Vec3;
    facing: Vec3;
  };
  players: Array<{
    id: string;
    number: number;
    teamId: TeamId;
    controller: ControllerType;
    role: PlayerRole;
    position: Vec3;
    velocity: Vec3;
    facing: Vec3;
    stamina: number;
    hasPossession: boolean;
  }>;
  tactics: {
    blue: {
      strategy: TacticalStrategy;
      pressingIntensity: number;
      explanation: string;
      isLLM: boolean;
    };
    red: {
      strategy: TacticalStrategy;
      pressingIntensity: number;
      explanation: string;
      isLLM: boolean;
    };
  };
}

export type MatchEventType =
  | 'MATCH_START'
  | 'KICKOFF'
  | 'GOAL'
  | 'SAVE'
  | 'TACKLE'
  | 'PASS'
  | 'SHOT'
  | 'OUT_OF_BOUNDS'
  | 'STRATEGY_CHANGE'
  | 'MATCH_END';

export interface MatchEvent {
  id: string;
  timestamp: number;
  type: MatchEventType;
  teamId?: TeamId;
  playerId?: string;
  description: string;
}

export interface TeamMatchStats {
  goals: number;
  shots: number;
  shotsOnTarget: number;
  passesAttempted: number;
  passesCompleted: number;
  tacklesWon: number;
  saves: number;
  possessionDurationSeconds: number;
  possessionPercentage: number;
}

export interface MatchFinalResults {
  matchId: string;
  durationSeconds: number;
  winner: TeamId | 'draw';
  scores: {
    blue: number;
    red: number;
  };
  stats: {
    blue: TeamMatchStats;
    red: TeamMatchStats;
  };
  events: MatchEvent[];
}

export interface PlayerInput {
  sequence: number;
  movement: {
    x: number;
    z: number;
  };
  aim?: {
    x: number;
    z: number;
  };
  sprint: boolean;
}

export type ActionType = 'PASS' | 'SHOOT' | 'TACKLE';

export interface PlayerActionPayload {
  type: ActionType;
  power?: number; // 0.0 - 1.0
  direction?: {
    x: number;
    z: number;
  };
}

export interface RoomPlayer {
  socketId: string;
  name: string;
  teamId: TeamId;
  assignedPlayerId?: string;
  isHost: boolean;
  isReady: boolean;
  isAI: boolean;
}

export interface RoomState {
  roomId: string;
  roomCode: string;
  hostSocketId: string;
  players: RoomPlayer[];
  status: 'LOBBY' | 'IN_MATCH' | 'FINISHED';
  isSoloPractice: boolean;
  maxHumansPerTeam: number;
  createdAt: number;
}
