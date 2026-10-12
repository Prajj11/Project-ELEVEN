import { PLAYER_PHYSICS, PlayerState } from '@project-eleven/shared';

// Human and AI outfield players share the same sprint eligibility and energy cost.
export function movementSpeed(player: PlayerState, moving: boolean, wantsSprint: boolean, dt: number): number {
  const sprinting = moving && wantsSprint && player.stamina > PLAYER_PHYSICS.STAMINA_MIN_TO_SPRINT;
  player.stamina = sprinting
    ? Math.max(0, player.stamina - PLAYER_PHYSICS.STAMINA_DRAIN_PER_SEC * dt)
    : Math.min(PLAYER_PHYSICS.STAMINA_MAX, player.stamina + PLAYER_PHYSICS.STAMINA_RECOVERY_PER_SEC * dt);
  return sprinting ? PLAYER_PHYSICS.SPRINT_SPEED : PLAYER_PHYSICS.BASE_SPEED;
}
