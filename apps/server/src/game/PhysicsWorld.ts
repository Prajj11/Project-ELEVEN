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

  public static resolvePlayerCollisions(players: Record<string, { position: Vec3 }>) {
    const playerList = Object.values(players);
    const minDistance = 1.0; // Minimum distance between any two players
    const minDistanceSq = minDistance * minDistance;

    for (let i = 0; i < playerList.length; i++) {
      for (let j = i + 1; j < playerList.length; j++) {
        const p1 = playerList[i];
        const p2 = playerList[j];

        const dx = p1.position.x - p2.position.x;
        const dz = p1.position.z - p2.position.z;
        const distSq = dx * dx + dz * dz;

        if (distSq < minDistanceSq) {
          const dist = Math.sqrt(distSq);
          let nx = 1;
          let nz = 0;

          if (dist > 0.001) {
            nx = dx / dist;
            nz = dz / dist;
          } else {
            // Exactly overlapping, push apart in arbitrary direction
            const angle = Math.random() * Math.PI * 2;
            nx = Math.cos(angle);
            nz = Math.sin(angle);
          }

          const overlap = (minDistance - dist) * 0.5;

          p1.position.x += nx * overlap;
          p1.position.z += nz * overlap;
          p2.position.x -= nx * overlap;
          p2.position.z -= nz * overlap;

          p1.position = this.clampPlayerPosition(p1.position);
          p2.position = this.clampPlayerPosition(p2.position);
        }
      }
    }
  }
}
