import { MatchState, PLAYER_PHYSICS } from '@project-eleven/shared';
import { PossessionSystem } from './PossessionSystem';

export class TacklingSystem {
  public static executeTackle(state: MatchState, tacklerId: string): boolean {
    const tackler = state.players[tacklerId];
    if (!tackler || tackler.hasPossession || tackler.actionCooldown > 0) {
      return false;
    }

    tackler.actionCooldown = PLAYER_PHYSICS.TACKLE_COOLDOWN_TICKS;

    // Check if opponent with possession is within tackle radius
    if (state.ball.ownerId) {
      const victim = state.players[state.ball.ownerId];
      if (victim && victim.teamId !== tackler.teamId) {
        const dx = victim.position.x - tackler.position.x;
        const dz = victim.position.z - tackler.position.z;
        const dist = Math.hypot(dx, dz);

        if (dist <= PLAYER_PHYSICS.TACKLE_RADIUS) {
          // Successful challenge
          PossessionSystem.releasePossession(state);

          // Stun victim briefly
          victim.actionCooldown = PLAYER_PHYSICS.TACKLE_STUN_TICKS;

          // Dislodge ball in challenge direction
          const dirX = dist > 0.01 ? dx / dist : 0;
          const dirZ = dist > 0.01 ? dz / dist : 1;

          state.ball.velocity.x = dirX * 8.0;
          state.ball.velocity.y = 1.0;
          state.ball.velocity.z = dirZ * 8.0;

          return true;
        }
      }
    }
    return false;
  }
}
