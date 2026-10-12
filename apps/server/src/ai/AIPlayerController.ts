import {
  BALL_PHYSICS,
  MatchState,
  PITCH_CONSTANTS,
  PLAYER_PHYSICS,
  PlayerState,
} from '@project-eleven/shared';
import { PassingSystem } from '../game/PassingSystem';
import { ShootingSystem } from '../game/ShootingSystem';
import { TacklingSystem } from '../game/TacklingSystem';
import { PhysicsWorld } from '../game/PhysicsWorld';

export class AIPlayerController {
  public static update(state: MatchState, dt: number) {
    if (state.phase !== 'PLAYING' && state.phase !== 'KICKOFF') return;

    const ball = state.ball;

    for (const player of Object.values(state.players)) {
      // Only command AI-controlled outfielders (Goalkeepers handled by GoalkeeperSystem)
      if (player.controller !== 'AI' || player.role === 'GOALKEEPER') {
        continue;
      }

      // Decrement action cooldown
      if (player.actionCooldown > 0) {
        player.actionCooldown -= 1;
      }

      const teamTactics = state.teams[player.teamId].tactics;
      const opponentGoalZ =
        player.teamId === 'blue'
          ? PITCH_CONSTANTS.RED_GOAL_Z
          : PITCH_CONSTANTS.BLUE_GOAL_Z;

      // 1. If AI player has possession of the ball
      if (player.hasPossession) {
        const distToGoal = Math.abs(opponentGoalZ - player.position.z);

        // Within shooting range (< 16m)? Shoot!
        if (distToGoal < 16.0 && Math.abs(player.position.x) < 8.0) {
          ShootingSystem.executeShot(state, player.id, 0.85);
          continue;
        }

        // Check if under pressure by opponent
        let underPressure = false;
        for (const opp of Object.values(state.players)) {
          if (opp.teamId !== player.teamId) {
            const dist = Math.hypot(
              opp.position.x - player.position.x,
              opp.position.z - player.position.z
            );
            if (dist < 2.5) {
              underPressure = true;
              break;
            }
          }
        }

        if (underPressure && Math.random() < 0.35) {
          // Pass to teammate
          PassingSystem.executePass(state, player.id);
          continue;
        }

        // Dribble forward towards opponent goal
        const targetZ = opponentGoalZ;
        const targetX = player.position.x * 0.9; // Drift towards center
        this.moveTowards(player, targetX, targetZ, dt, false);
        continue;
      }

      // 2. Loose ball or opponent possession
      const distToBall = Math.hypot(
        ball.position.x - player.position.x,
        ball.position.z - player.position.z
      );

      // Tackling attempt if close to opponent with ball
      if (
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

      // Pressing logic: if pressing intensity is high or player is closest, chase ball
      const isAttackingRole = player.role === 'FORWARD' || player.role === 'MIDFIELDER';
      const shouldPress =
        distToBall < 10.0 * teamTactics.pressingIntensity ||
        (state.possessionTeam !== player.teamId && distToBall < 6.0);

      if (shouldPress) {
        this.moveTowards(player, ball.position.x, ball.position.z, dt, true);
      } else {
        // Return to formation home zone
        const homeZ = this.getHomeZ(player, teamTactics.strategy);
        const homeX = this.getHomeX(player);
        this.moveTowards(player, homeX, homeZ, dt, false);
      }
    }
  }

  private static moveTowards(
    player: PlayerState,
    targetX: number,
    targetZ: number,
    dt: number,
    sprint: boolean
  ) {
    const dx = targetX - player.position.x;
    const dz = targetZ - player.position.z;
    const dist = Math.hypot(dx, dz);

    if (dist < 0.2) {
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

    // Face movement direction
    player.facing.x = dirX;
    player.facing.z = dirZ;

    // Clamp inside pitch bounds
    player.position = PhysicsWorld.clampPlayerPosition(player.position);
  }

  private static getHomeZ(player: PlayerState, strategy: string): number {
    const isBlue = player.teamId === 'blue';
    const sign = isBlue ? 1 : -1;

    let baseZ = 0;
    if (player.role === 'DEFENDER') baseZ = -12 * sign;
    else if (player.role === 'MIDFIELDER') baseZ = -3 * sign;
    else if (player.role === 'FORWARD') baseZ = 4 * sign;

    if (strategy === 'ATTACK') baseZ += 4 * sign;
    if (strategy === 'DEFEND') baseZ -= 4 * sign;

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
