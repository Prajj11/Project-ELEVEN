import {
  BALL_PHYSICS,
  MatchState,
  PITCH_CONSTANTS,
} from '@project-eleven/shared';
import { PossessionSystem } from './PossessionSystem';

export class ShootingSystem {
  public static executeShot(
    state: MatchState,
    shooterId: string,
    power: number = 0.85,
    customDirection?: { x: number; z: number }
  ): boolean {
    const shooter = state.players[shooterId];
    if (!shooter || !shooter.hasPossession || shooter.actionCooldown > 0) {
      return false;
    }

    PossessionSystem.releasePossession(state);

    // Opponent goal target
    const targetGoalZ =
      shooter.teamId === 'blue'
        ? PITCH_CONSTANTS.RED_GOAL_Z
        : PITCH_CONSTANTS.BLUE_GOAL_Z;

    let shotDirX = 0;
    let shotDirZ = 0;

    if (customDirection) {
      const len = Math.hypot(customDirection.x, customDirection.z);
      if (len > 0.01) {
        shotDirX = customDirection.x / len;
        shotDirZ = customDirection.z / len;
      }
    } else {
      // Aim at opponent goal with slight variation
      const dx = (Math.random() - 0.5) * 3.0 - shooter.position.x;
      const dz = targetGoalZ - shooter.position.z;
      const dist = Math.hypot(dx, dz);
      shotDirX = dx / dist;
      shotDirZ = dz / dist;
    }

    const clampedPower = Math.max(0.4, Math.min(1.0, power));
    const shotSpeed = BALL_PHYSICS.SHOT_MAX_SPEED * clampedPower;

    state.ball.velocity.x = shotDirX * shotSpeed;
    state.ball.velocity.y = 2.0 + clampedPower * 2.5; // Vertical lift
    state.ball.velocity.z = shotDirZ * shotSpeed;

    shooter.actionCooldown = 45; // 0.75s cooldown
    return true;
  }
}
