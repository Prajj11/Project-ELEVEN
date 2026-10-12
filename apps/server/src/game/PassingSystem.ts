import {
  BALL_PHYSICS,
  MatchState,
  PlayerState,
} from '@project-eleven/shared';
import { PossessionSystem } from './PossessionSystem';

export class PassingSystem {
  public static executePass(
    state: MatchState,
    passerId: string,
    targetDirection?: { x: number; z: number }
  ): boolean {
    const passer = state.players[passerId];
    if (!passer || !passer.hasPossession || passer.actionCooldown > 0) {
      return false;
    }

    // Release possession
    PossessionSystem.releasePossession(state);

    let passDirX = passer.facing.x;
    let passDirZ = passer.facing.z;

    if (targetDirection) {
      const len = Math.hypot(targetDirection.x, targetDirection.z);
      if (len > 0.01) {
        passDirX = targetDirection.x / len;
        passDirZ = targetDirection.z / len;
      }
    } else {
      // Find nearest teammate in general facing direction
      let bestTeammate: PlayerState | null = null;
      let bestScore = -Infinity;

      for (const p of Object.values(state.players)) {
        if (p.id !== passer.id && p.teamId === passer.teamId) {
          const dx = p.position.x - passer.position.x;
          const dz = p.position.z - passer.position.z;
          const dist = Math.hypot(dx, dz);

          if (dist > 1.0) {
            const dirX = dx / dist;
            const dirZ = dz / dist;
            const dot = dirX * passer.facing.x + dirZ * passer.facing.z;

            // Forward dot product score weighted by reasonable passing distance
            const score = dot * 2.0 - Math.abs(dist - 12.0) * 0.1;
            if (score > bestScore && dot > 0.3) {
              bestScore = score;
              bestTeammate = p;
            }
          }
        }
      }

      if (bestTeammate) {
        const dx = bestTeammate.position.x - passer.position.x;
        const dz = bestTeammate.position.z - passer.position.z;
        const dist = Math.hypot(dx, dz);
        passDirX = dx / dist;
        passDirZ = dz / dist;
      }
    }

    // Apply ground pass impulse
    const passSpeed = BALL_PHYSICS.PASS_SPEED;
    state.ball.velocity.x = passDirX * passSpeed;
    state.ball.velocity.y = 0.5; // slight hop
    state.ball.velocity.z = passDirZ * passSpeed;

    passer.actionCooldown = 30; // 0.5s cooldown
    return true;
  }
}
