import {
  BALL_PHYSICS,
  MatchFinalResults,
  MatchSnapshot,
  MatchState,
  PITCH_CONSTANTS,
  PLAYER_PHYSICS,
  PlayerActionPayload,
  PlayerInput,
  SIMULATION_CONSTANTS,
  TeamId,
  TeamMatchStats,
} from '@project-eleven/shared';
import { MatchStateManager, PlayerAssignment } from './MatchState';
import { PossessionSystem } from './PossessionSystem';
import { PassingSystem } from './PassingSystem';
import { ShootingSystem } from './ShootingSystem';
import { TacklingSystem } from './TacklingSystem';
import { GoalkeeperSystem } from './GoalkeeperSystem';
import { GoalDetection } from './GoalDetection';
import { MatchRules } from './MatchRules';
import { AIPlayerController } from '../ai/AIPlayerController';
import { TacticalAgent } from '../ai/TacticalAgent';
import { PhysicsWorld } from './PhysicsWorld';

export class MatchEngine {
  private state: MatchState;
  private isRunning: boolean = false;
  private intervalId: NodeJS.Timeout | null = null;
  private broadcastIntervalId: NodeJS.Timeout | null = null;

  // Independent Tactical Agents
  private blueAgent = new TacticalAgent('blue');
  private redAgent = new TacticalAgent('red');

  // Input queue
  private pendingInputs: Map<string, PlayerInput> = new Map();

  // Match Statistics
  private stats: { blue: TeamMatchStats; red: TeamMatchStats } = {
    blue: {
      goals: 0,
      shots: 0,
      shotsOnTarget: 0,
      passesAttempted: 0,
      passesCompleted: 0,
      tacklesWon: 0,
      saves: 0,
      possessionDurationSeconds: 0,
      possessionPercentage: 50,
    },
    red: {
      goals: 0,
      shots: 0,
      shotsOnTarget: 0,
      passesAttempted: 0,
      passesCompleted: 0,
      tacklesWon: 0,
      saves: 0,
      possessionDurationSeconds: 0,
      possessionPercentage: 50,
    },
  };

  constructor(
    public readonly matchId: string,
    assignments: PlayerAssignment[],
    private onSnapshot: (snapshot: MatchSnapshot) => void,
    private onEvent: (event: { type: string; description: string; timestamp: number }) => void,
    private onEnded: (results: MatchFinalResults) => void
  ) {
    this.state = MatchStateManager.createInitialState(matchId, assignments);
  }

  public start() {
    if (this.isRunning) return;
    this.isRunning = true;

    console.log(`[MatchEngine] Match ${this.matchId} started.`);
    this.onEvent({
      type: 'MATCH_START',
      description: 'Match started! 5v5 Arena.',
      timestamp: Date.now(),
    });

    const dt = SIMULATION_CONSTANTS.TIMESTEP;

    // 60Hz Authoritative Fixed-Step Simulation Loop
    this.intervalId = setInterval(() => {
      this.tick(dt);
    }, 1000 / SIMULATION_CONSTANTS.TICK_RATE);

    // 25Hz Snapshot Broadcast Loop
    this.broadcastIntervalId = setInterval(() => {
      const snapshot = MatchStateManager.createSnapshot(this.state);
      this.onSnapshot(snapshot);
    }, SIMULATION_CONSTANTS.SNAPSHOT_INTERVAL_MS);
  }

  public stop() {
    this.isRunning = false;
    if (this.intervalId) clearInterval(this.intervalId);
    if (this.broadcastIntervalId) clearInterval(this.broadcastIntervalId);
  }

  public queueInput(playerId: string, input: PlayerInput) {
    this.pendingInputs.set(playerId, input);
  }

  public handleAction(playerId: string, action: PlayerActionPayload) {
    if (this.state.phase !== 'PLAYING') return;

    const player = this.state.players[playerId];
    if (!player) return;

    if (action.type === 'PASS') {
      const success = PassingSystem.executePass(this.state, playerId, action.direction);
      if (success) {
        this.stats[player.teamId].passesAttempted += 1;
      }
    } else if (action.type === 'SHOOT') {
      const success = ShootingSystem.executeShot(this.state, playerId, action.power, action.direction);
      if (success) {
        this.stats[player.teamId].shots += 1;
        this.stats[player.teamId].shotsOnTarget += 1;
      }
    } else if (action.type === 'TACKLE') {
      const success = TacklingSystem.executeTackle(this.state, playerId);
      if (success) {
        this.stats[player.teamId].tacklesWon += 1;
      }
    }
  }

  public togglePause(): boolean {
    if (this.state.phase === 'PLAYING') {
      this.state.phase = 'PAUSED';
      this.onEvent({
        type: 'MATCH_EVENT',
        description: 'Match paused.',
        timestamp: Date.now(),
      });
      return true;
    } else if (this.state.phase === 'PAUSED') {
      this.state.phase = 'PLAYING';
      this.onEvent({
        type: 'MATCH_EVENT',
        description: 'Match resumed.',
        timestamp: Date.now(),
      });
      return false;
    }
    return false;
  }

  private tick(dt: number) {
    this.state.tick += 1;

    // If game is paused, skip physics and clock updates
    if (this.state.phase === 'PAUSED') {
      return;
    }

    // 1. Process Human Player Inputs
    this.processHumanInputs(dt);

    // 2. Update Ball Kinematics & Physics
    this.updateBallPhysics(dt);

    // 3. Update Possession
    PossessionSystem.update(this.state);

    // 4. Update Deterministic AI Controllers
    AIPlayerController.update(this.state, dt);

    // 5. Update Goalkeepers
    GoalkeeperSystem.update(this.state);

    // 6. Resolve Player-to-Player Collisions (Prevents players from sticking or clipping)
    PhysicsWorld.resolvePlayerCollisions(this.state.players);

    // 7. Check Goals
    GoalDetection.checkAndHandleGoal(this.state, (scoringTeam, desc) => {
      this.stats[scoringTeam].goals += 1;
      this.onEvent({
        type: 'GOAL',
        description: desc,
        timestamp: Date.now(),
      });
    });

    // 8. Update Match Referee (The 11th body on the pitch!)
    this.updateReferee(dt);

    // 9. Match Clock, Phases & Boundaries
    MatchRules.updateClockAndPhases(this.state, dt, () => {
      this.finishMatch();
    });

    // 8. Track Possession Duration
    if (this.state.possessionTeam && this.state.phase === 'PLAYING') {
      this.stats[this.state.possessionTeam].possessionDurationSeconds += dt;
      const totalTime =
        this.stats.blue.possessionDurationSeconds +
        this.stats.red.possessionDurationSeconds;
      if (totalTime > 0) {
        this.stats.blue.possessionPercentage = Math.round(
          (this.stats.blue.possessionDurationSeconds / totalTime) * 100
        );
        this.stats.red.possessionPercentage =
          100 - this.stats.blue.possessionPercentage;
      }
    }

    // 9. Independent Tactical Agents Evaluation (asynchronous every ~15s)
    if (this.state.phase === 'PLAYING') {
      this.blueAgent.evaluate(this.state);
      this.redAgent.evaluate(this.state);
    }
  }

  private processHumanInputs(dt: number) {
    for (const [playerId, input] of this.pendingInputs.entries()) {
      const player = this.state.players[playerId];
      if (!player || player.controller !== 'HUMAN') continue;

      if (player.actionCooldown > 0) {
        player.actionCooldown -= 1;
      }

      const speed =
        input.sprint && player.stamina > PLAYER_PHYSICS.STAMINA_MIN_TO_SPRINT
          ? PLAYER_PHYSICS.SPRINT_SPEED
          : PLAYER_PHYSICS.BASE_SPEED;

      // Drain / recover stamina
      if (input.sprint && (input.movement.x !== 0 || input.movement.z !== 0)) {
        player.stamina = Math.max(
          0,
          player.stamina - PLAYER_PHYSICS.STAMINA_DRAIN_PER_SEC * dt
        );
      } else {
        player.stamina = Math.min(
          PLAYER_PHYSICS.STAMINA_MAX,
          player.stamina + PLAYER_PHYSICS.STAMINA_RECOVERY_PER_SEC * dt
        );
      }

      player.velocity.x = input.movement.x * speed;
      player.velocity.z = input.movement.z * speed;

      player.position.x += player.velocity.x * dt;
      player.position.z += player.velocity.z * dt;

      if (input.movement.x !== 0 || input.movement.z !== 0) {
        player.facing.x = input.movement.x;
        player.facing.z = input.movement.z;
      }

      // Clamp inside pitch bounds
      player.position = PhysicsWorld.clampPlayerPosition(player.position);
    }
    this.pendingInputs.clear();
  }

  private updateBallPhysics(dt: number) {
    const ball = this.state.ball;

    // If held by dribbler, kinematics are handled by PossessionSystem
    if (ball.ownerId) return;

    // Apply Velocity
    ball.position.x += ball.velocity.x * dt;
    ball.position.y += ball.velocity.y * dt;
    ball.position.z += ball.velocity.z * dt;

    // Gravity
    if (ball.position.y > BALL_PHYSICS.RADIUS) {
      ball.velocity.y += BALL_PHYSICS.GRAVITY * dt;
      // Air Drag
      ball.velocity.x *= BALL_PHYSICS.AIR_DRAG;
      ball.velocity.z *= BALL_PHYSICS.AIR_DRAG;
    } else {
      // Ground Contact
      ball.position.y = BALL_PHYSICS.RADIUS;
      if (ball.velocity.y < -1.0) {
        // Bounce
        ball.velocity.y = -ball.velocity.y * BALL_PHYSICS.RESTITUTION_TURF;
      } else {
        ball.velocity.y = 0;
      }
      // Turf Friction
      ball.velocity.x *= BALL_PHYSICS.TURF_FRICTION;
      ball.velocity.z *= BALL_PHYSICS.TURF_FRICTION;
    }
  }

  private updateReferee(dt: number) {
    const ball = this.state.ball;
    const ref = this.state.referee;

    // The referee stays on a viewing flank (~5m to the side of the play)
    // and keeps an angle with the ball without obstructing goals or passes.
    let targetX = ball.position.x > 0 ? ball.position.x - 6.0 : ball.position.x + 6.0;
    targetX = Math.max(-12, Math.min(12, targetX));

    // Stays slightly behind ball progression
    let targetZ = ball.position.z * 0.7;
    targetZ = Math.max(-18, Math.min(18, targetZ));

    const dx = targetX - ref.position.x;
    const dz = targetZ - ref.position.z;
    const dist = Math.hypot(dx, dz);

    if (dist > 0.4) {
      const dirX = dx / dist;
      const dirZ = dz / dist;
      const speed = Math.min(4.8, dist * 1.5);

      ref.velocity.x = dirX * speed;
      ref.velocity.z = dirZ * speed;

      ref.position.x += ref.velocity.x * dt;
      ref.position.z += ref.velocity.z * dt;
    } else {
      ref.velocity.x = 0;
      ref.velocity.z = 0;
    }

    // Always faces towards the football to referee the match
    const fdx = ball.position.x - ref.position.x;
    const fdz = ball.position.z - ref.position.z;
    const fdist = Math.hypot(fdx, fdz);
    if (fdist > 0.1) {
      ref.facing.x = fdx / fdist;
      ref.facing.z = fdz / fdist;
    }
  }

  private finishMatch() {
    this.stop();

    const blueScore = this.state.teams.blue.score;
    const redScore = this.state.teams.red.score;

    let winner: TeamId | 'draw' = 'draw';
    if (blueScore > redScore) winner = 'blue';
    if (redScore > blueScore) winner = 'red';

    const results: MatchFinalResults = {
      matchId: this.matchId,
      durationSeconds: this.state.elapsedSeconds,
      winner,
      scores: { blue: blueScore, red: redScore },
      stats: this.stats,
      events: [],
    };

    console.log(`[MatchEngine] Match ${this.matchId} ended. Winner: ${winner}`);
    this.onEnded(results);
  }
}
