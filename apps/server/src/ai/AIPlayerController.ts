import {
  BALL_PHYSICS,
  MatchState,
  PITCH_CONSTANTS,
  PLAYER_PHYSICS,
  PlayerState,
  TeamId,
} from '@project-eleven/shared';
import { PassingSystem } from '../game/PassingSystem';
import { ShootingSystem } from '../game/ShootingSystem';
import { TacklingSystem } from '../game/TacklingSystem';
import { PhysicsWorld } from '../game/PhysicsWorld';

export class AIPlayerController {
  public static update(state: MatchState, dt: number) {
    // During PAUSED, GOAL_PAUSE, FINISHED, do not move
    if (state.phase !== 'PLAYING' && state.phase !== 'KICKOFF') return;

    const ball = state.ball;

    // During KICKOFF, hold formation until the ball is kicked
    if (state.phase === 'KICKOFF') {
      for (const player of Object.values(state.players)) {
        if (player.controller === 'AI' && player.role !== 'GOALKEEPER') {
          const homeZ = this.getHomeZ(player, 'BALANCED');
          const homeX = this.getHomeX(player);
          this.moveTowards(player, homeX, homeZ, dt, false, state);
        }
      }
      return;
    }

    // Identify the single closest outfield player to the ball for each team
    const closestBlueId = this.findClosestOutfielderToBall(state, 'blue');
    const closestRedId = this.findClosestOutfielderToBall(state, 'red');

    for (const player of Object.values(state.players)) {
      if (player.controller !== 'AI' || player.role === 'GOALKEEPER') {
        continue;
      }

      if (player.actionCooldown > 0) {
        player.actionCooldown -= 1;
      }

      const teamTactics = state.teams[player.teamId].tactics;
      const opponentGoalZ =
        player.teamId === 'blue'
          ? PITCH_CONSTANTS.RED_GOAL_Z
          : PITCH_CONSTANTS.BLUE_GOAL_Z;

      // 1. AI Player currently in possession of the ball
      if (player.hasPossession) {
        const distToGoal = Math.abs(opponentGoalZ - player.position.z);

        // Within shooting range (< 16m)? Shoot!
        if (distToGoal < 16.0 && Math.abs(player.position.x) < 8.0) {
          ShootingSystem.executeShot(state, player.id, 0.85);
          continue;
        }

        // Check if under pressure by an opponent
        let underPressure = false;
        for (const opp of Object.values(state.players)) {
          if (opp.teamId !== player.teamId) {
            const dist = Math.hypot(
              opp.position.x - player.position.x,
              opp.position.z - player.position.z
            );
            if (dist < 2.2) {
              underPressure = true;
              break;
            }
          }
        }

        if (underPressure) {
          // Look for safe pass to teammate
          const passed = PassingSystem.executePass(state, player.id);
          if (passed) continue;
        }

        // Dribble forward towards opponent goal with width variation
        const targetZ = opponentGoalZ * 0.9;
        const targetX = player.position.x * 0.7;
        this.moveTowards(player, targetX, targetZ, dt, false, state);
        continue;
      }

      // 2. Outfield Player without ball
      const isChallenger =
        player.teamId === 'blue'
          ? player.id === closestBlueId
          : player.id === closestRedId;

      const distToBall = Math.hypot(
        ball.position.x - player.position.x,
        ball.position.z - player.position.z
      );

      // Attempt tackle if challenger and within reach of opponent ball-carrier
      if (
        isChallenger &&
        state.ball.ownerId &&
        distToBall <= PLAYER_PHYSICS.TACKLE_RADIUS &&
        player.actionCooldown === 0
      ) {
        const owner = state.players[state.ball.ownerId];
        if (owner && owner.teamId !== player.teamId) {
          TacklingSystem.executeTackle(state, player.id);
          continue;
        }
      }

      // ONLY the designated challenger directly chases the ball!
      if (isChallenger) {
        this.moveTowards(player, ball.position.x, ball.position.z, dt, true, state);
        continue;
      }

      // All OTHER teammates spread out and hold tactical positioning
      if (state.possessionTeam === player.teamId) {
        // Our team has possession: spread out to provide attacking lanes
        const supportPos = this.getAttackingSupportPosition(player, ball.position);
        this.moveTowards(player, supportPos.x, supportPos.z, dt, false, state);
      } else {
        // Opponent has possession or loose ball: hold defensive zone
        const defensivePos = this.getDefensivePosition(
          player,
          ball.position,
          teamTactics.strategy
        );
        this.moveTowards(player, defensivePos.x, defensivePos.z, dt, false, state);
      }
    }
  }

  private static findClosestOutfielderToBall(
    state: MatchState,
    teamId: TeamId
  ): string | null {
    let closestId: string | null = null;
    let closestDistSq = Infinity;

    for (const player of Object.values(state.players)) {
      if (player.teamId === teamId && player.role !== 'GOALKEEPER') {
        const dx = player.position.x - state.ball.position.x;
        const dz = player.position.z - state.ball.position.z;
        const distSq = dx * dx + dz * dz;

        if (distSq < closestDistSq) {
          closestDistSq = distSq;
          closestId = player.id;
        }
      }
    }
    return closestId;
  }

  private static getAttackingSupportPosition(
    player: PlayerState,
    ballPos: { x: number; z: number }
  ): { x: number; z: number } {
    const isBlue = player.teamId === 'blue';
    const forwardSign = isBlue ? 1 : -1;

    let targetX = this.getHomeX(player);
    let targetZ = ballPos.z + 5 * forwardSign;

    if (player.role === 'FORWARD') {
      // Forwards make runs into opponent penalty box
      targetZ = isBlue ? 18 : -18;
      targetX = player.number === 5 ? 4 : -4;
    } else if (player.role === 'MIDFIELDER') {
      // Midfielders stay in support triangle behind / beside the ball
      targetZ = ballPos.z - 3 * forwardSign;
      targetX = ballPos.x > 0 ? -6 : 6;
    } else if (player.role === 'DEFENDER') {
      // Defenders stay behind to prevent counter attacks
      targetZ = isBlue ? -10 : 10;
      targetX = player.number === 2 ? -6 : 6;
    }

    return { x: targetX, z: targetZ };
  }

  private static getDefensivePosition(
    player: PlayerState,
    ballPos: { x: number; z: number },
    strategy: string
  ): { x: number; z: number } {
    const isBlue = player.teamId === 'blue';
    const ownGoalZ = isBlue ? -25 : 25;

    let baseZ = this.getHomeZ(player, strategy);
    let baseX = this.getHomeX(player);

    if (player.role === 'DEFENDER') {
      // Defenders shift between ball and own goal
      baseZ = (ownGoalZ + ballPos.z) * 0.45;
      baseX = (baseX + ballPos.x * 0.3);
    } else if (player.role === 'MIDFIELDER') {
      // Midfielders cover central passing channels
      baseZ = (ownGoalZ * 0.2 + ballPos.z * 0.6);
      baseX = ballPos.x * 0.5;
    }

    return { x: baseX, z: baseZ };
  }

  private static moveTowards(
    player: PlayerState,
    targetX: number,
    targetZ: number,
    dt: number,
    sprint: boolean,
    state: MatchState
  ) {
    // Add avoidance repulsion from nearby players to prevent crowding
    let avoidX = 0;
    let avoidZ = 0;

    for (const other of Object.values(state.players)) {
      if (other.id !== player.id) {
        const dx = player.position.x - other.position.x;
        const dz = player.position.z - other.position.z;
        const distSq = dx * dx + dz * dz;

        if (distSq < 4.0 && distSq > 0.01) {
          const dist = Math.sqrt(distSq);
          const force = (2.0 - dist) / dist;
          avoidX += dx * force * 1.5;
          avoidZ += dz * force * 1.5;
        }
      }
    }

    const desiredX = targetX + avoidX;
    const desiredZ = targetZ + avoidZ;

    const dx = desiredX - player.position.x;
    const dz = desiredZ - player.position.z;
    const dist = Math.hypot(dx, dz);

    if (dist < 0.25) {
      player.velocity.x = 0;
      player.velocity.z = 0;
      return;
    }

    const dirX = dx / dist;
    const dirZ = dz / dist;

    const speed = sprint ? PLAYER_PHYSICS.SPRINT_SPEED : PLAYER_PHYSICS.BASE_SPEED;

    player.velocity.x = dirX * speed;
    player.velocity.z = dirZ * speed;

    player.position.x += player.velocity.x * dt;
    player.position.z += player.velocity.z * dt;

    player.facing.x = dirX;
    player.facing.z = dirZ;

    player.position = PhysicsWorld.clampPlayerPosition(player.position);
  }

  private static getHomeZ(player: PlayerState, strategy: string): number {
    const isBlue = player.teamId === 'blue';
    const sign = isBlue ? 1 : -1;

    let baseZ = 0;
    if (player.role === 'DEFENDER') baseZ = -14 * sign;
    else if (player.role === 'MIDFIELDER') baseZ = -6 * sign;
    else if (player.role === 'FORWARD') baseZ = -2 * sign;

    if (strategy === 'ATTACK') baseZ += 3 * sign;
    if (strategy === 'DEFEND') baseZ -= 3 * sign;

    return baseZ;
  }

  private static getHomeX(player: PlayerState): number {
    if (player.number === 2) return -7;
    if (player.number === 3) return 7;
    if (player.number === 4) return -3;
    if (player.number === 5) return 3;
    return 0;
  }
}
