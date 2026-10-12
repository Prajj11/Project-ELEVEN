import {
  BALL_PHYSICS,
  MatchState,
  PITCH_CONSTANTS,
  PlayerState,
} from '@project-eleven/shared';

export class GoalkeeperSystem {
  public static update(state: MatchState) {
    const ball = state.ball;

    for (const player of Object.values(state.players)) {
      if (player.role !== 'GOALKEEPER') continue;

      const isBlue = player.teamId === 'blue';
      const goalZ = isBlue ? PITCH_CONSTANTS.BLUE_GOAL_Z + 2.0 : PITCH_CONSTANTS.RED_GOAL_Z - 2.0;

      // Lateral tracking towards ball X, clamped within goal mouth
      const targetX = Math.max(-2.0, Math.min(2.0, ball.position.x * 0.45));
      player.position.x += (targetX - player.position.x) * 0.12;
      player.position.z = goalZ;
      player.facing = { x: 0, y: 0, z: isBlue ? 1 : -1 };

      // Shot save check: if ball is close to GK and moving towards goal
      const distToBall = Math.hypot(
        ball.position.x - player.position.x,
        ball.position.z - player.position.z
      );

      const movingTowardsGoal = isBlue
        ? ball.velocity.z < -2.0
        : ball.velocity.z > 2.0;

      if (distToBall < 2.0 && movingTowardsGoal && ball.position.y < PITCH_CONSTANTS.GOAL_HEIGHT) {
        // Goalkeeper Save! Deflect sideways
        const deflectionDirX = ball.position.x >= 0 ? 1 : -1;
        ball.velocity.x = deflectionDirX * (8.0 + Math.random() * 4.0);
        ball.velocity.y = 1.5;
        ball.velocity.z = isBlue ? 6.0 : -6.0; // Clear away from goal
        ball.ownerId = null;
      }
    }
  }
}
