import { PITCH_CONSTANTS, TeamId, Vec3 } from '@project-eleven/shared';

export class PhysicsWorld {
  public static clampPlayerPosition(pos: Vec3): Vec3 {
    const maxX = PITCH_CONSTANTS.HALF_WIDTH - 0.5;
    const maxZ = PITCH_CONSTANTS.HALF_LENGTH - 0.5;

    return {
      x: Math.max(-maxX, Math.min(maxX, pos.x)),
      y: 0,
      z: Math.max(-maxZ, Math.min(maxZ, pos.z)),
    };
  }

  public static checkGoal(pos: Vec3): TeamId | null {
    const { GOAL_WIDTH, GOAL_HEIGHT, BLUE_GOAL_Z, RED_GOAL_Z } = PITCH_CONSTANTS;
    const halfWidth = GOAL_WIDTH / 2;

    // Check if within lateral goal width and height
    if (Math.abs(pos.x) <= halfWidth && pos.y <= GOAL_HEIGHT) {
      // Blue Goal is at -25; ball past -25.2 means Red scores on Blue!
      if (pos.z <= BLUE_GOAL_Z - 0.2 && pos.z >= BLUE_GOAL_Z - 1.5) {
        return 'blue'; // Scored on Blue team
      }
      // Red Goal is at +25; ball past +25.2 means Blue scores on Red!
      if (pos.z >= RED_GOAL_Z + 0.2 && pos.z <= RED_GOAL_Z + 1.5) {
        return 'red'; // Scored on Red team
      }
    }
    return null;
  }

  public static isOutOfBounds(pos: Vec3): boolean {
    const { HALF_WIDTH, HALF_LENGTH, OUT_OF_BOUNDS_MARGIN } = PITCH_CONSTANTS;

    // Ignore if inside goal area behind goal line
    if (
      Math.abs(pos.x) <= PITCH_CONSTANTS.GOAL_WIDTH / 2 &&
      (pos.z < -HALF_LENGTH || pos.z > HALF_LENGTH)
    ) {
      return false;
    }

    return (
      Math.abs(pos.x) > HALF_WIDTH + OUT_OF_BOUNDS_MARGIN ||
      Math.abs(pos.z) > HALF_LENGTH + OUT_OF_BOUNDS_MARGIN
    );
  }

  public static getRestartPosition(pos: Vec3): Vec3 {
    const { HALF_WIDTH, HALF_LENGTH } = PITCH_CONSTANTS;

    return {
      x: Math.max(-HALF_WIDTH + 1.5, Math.min(HALF_WIDTH - 1.5, pos.x * 0.8)),
      y: 0.22,
      z: Math.max(-HALF_LENGTH + 2.0, Math.min(HALF_LENGTH - 2.0, pos.z * 0.8)),
    };
  }
}
