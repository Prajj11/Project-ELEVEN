import {
  BALL_PHYSICS,
  MatchState,
  PLAYER_PHYSICS,
  PlayerState,
} from '@project-eleven/shared';

export class PossessionSystem {
  public static update(state: MatchState) {
    const ball = state.ball;

    // If an owner already has possession, keep ball guided in front of them
    if (ball.ownerId) {
      const owner = state.players[ball.ownerId];
      if (owner && owner.hasPossession) {
        // Guided dribble position ahead of player facing direction
        const offset = BALL_PHYSICS.DRIBBLE_OFFSET_Z;
        ball.position.x = owner.position.x + owner.facing.x * offset;
        ball.position.y = BALL_PHYSICS.RADIUS;
        ball.position.z = owner.position.z + owner.facing.z * offset;

        // Ball matches owner velocity while dribbling
        ball.velocity.x = owner.velocity.x;
        ball.velocity.y = 0;
        ball.velocity.z = owner.velocity.z;

        state.possessionTeam = owner.teamId;
        ball.lastTouchTeam = owner.teamId;
        return;
      } else {
        ball.ownerId = null;
      }
    }

    // Check for loose ball interception
    let closestPlayer: PlayerState | null = null;
    let closestDistSq = Infinity;

    for (const player of Object.values(state.players)) {
      const dx = player.position.x - ball.position.x;
      const dz = player.position.z - ball.position.z;
      const distSq = dx * dx + dz * dz;

      if (distSq < closestDistSq) {
        closestDistSq = distSq;
        closestPlayer = player;
      }
    }

    const possessionRadiusSq =
      PLAYER_PHYSICS.POSSESSION_RADIUS * PLAYER_PHYSICS.POSSESSION_RADIUS;

    if (
      closestPlayer &&
      closestDistSq <= possessionRadiusSq &&
      ball.position.y <= 1.2 &&
      closestPlayer.actionCooldown === 0
    ) {
      // Player acquires possession
      ball.ownerId = closestPlayer.id;
      closestPlayer.hasPossession = true;
      state.possessionTeam = closestPlayer.teamId;
      ball.lastTouchTeam = closestPlayer.teamId;

      // Clear possession on other players
      for (const p of Object.values(state.players)) {
        if (p.id !== closestPlayer.id) {
          p.hasPossession = false;
        }
      }
    }
  }

  public static releasePossession(state: MatchState) {
    if (state.ball.ownerId) {
      const owner = state.players[state.ball.ownerId];
      if (owner) {
        owner.hasPossession = false;
      }
      state.ball.ownerId = null;
    }
  }
}
