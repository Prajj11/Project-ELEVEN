import React from 'react';
import { PITCH_CONSTANTS } from '@project-eleven/shared';

interface GoalProps {
  positionZ: number;
  rotationY?: number;
}

export const Goal: React.FC<GoalProps> = ({ positionZ, rotationY = 0 }) => {
  const { GOAL_WIDTH, GOAL_HEIGHT, GOAL_DEPTH } = PITCH_CONSTANTS;
  const postRadius = 0.08;

  return (
    <group position={[0, 0, positionZ]} rotation={[0, rotationY, 0]}>
      {/* Left Post */}
      <mesh position={[-GOAL_WIDTH / 2, GOAL_HEIGHT / 2, 0]} castShadow>
        <cylinderGeometry args={[postRadius, postRadius, GOAL_HEIGHT, 16]} />
        <meshStandardMaterial color="#ffffff" roughness={0.3} metalness={0.2} />
      </mesh>

      {/* Right Post */}
      <mesh position={[GOAL_WIDTH / 2, GOAL_HEIGHT / 2, 0]} castShadow>
        <cylinderGeometry args={[postRadius, postRadius, GOAL_HEIGHT, 16]} />
        <meshStandardMaterial color="#ffffff" roughness={0.3} metalness={0.2} />
      </mesh>

      {/* Crossbar */}
      <mesh
        position={[0, GOAL_HEIGHT, 0]}
        rotation={[0, 0, Math.PI / 2]}
        castShadow
      >
        <cylinderGeometry
          args={[postRadius, postRadius, GOAL_WIDTH + postRadius * 2, 16]}
        />
        <meshStandardMaterial color="#ffffff" roughness={0.3} metalness={0.2} />
      </mesh>

      {/* Back Support Posts */}
      <mesh
        position={[-GOAL_WIDTH / 2, GOAL_HEIGHT / 2, -GOAL_DEPTH]}
        castShadow
      >
        <cylinderGeometry args={[0.04, 0.04, GOAL_HEIGHT, 8]} />
        <meshStandardMaterial color="#94a3b8" />
      </mesh>
      <mesh
        position={[GOAL_WIDTH / 2, GOAL_HEIGHT / 2, -GOAL_DEPTH]}
        castShadow
      >
        <cylinderGeometry args={[0.04, 0.04, GOAL_HEIGHT, 8]} />
        <meshStandardMaterial color="#94a3b8" />
      </mesh>

      {/* Goal Net (Back) */}
      <mesh position={[0, GOAL_HEIGHT / 2, -GOAL_DEPTH]}>
        <planeGeometry args={[GOAL_WIDTH, GOAL_HEIGHT]} />
        <meshStandardMaterial
          color="#f8fafc"
          transparent
          opacity={0.35}
          wireframe
        />
      </mesh>

      {/* Goal Net (Top) */}
      <mesh
        position={[0, GOAL_HEIGHT, -GOAL_DEPTH / 2]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[GOAL_WIDTH, GOAL_DEPTH]} />
        <meshStandardMaterial
          color="#f8fafc"
          transparent
          opacity={0.35}
          wireframe
        />
      </mesh>

      {/* Goal Net (Left Side) */}
      <mesh
        position={[-GOAL_WIDTH / 2, GOAL_HEIGHT / 2, -GOAL_DEPTH / 2]}
        rotation={[0, Math.PI / 2, 0]}
      >
        <planeGeometry args={[GOAL_DEPTH, GOAL_HEIGHT]} />
        <meshStandardMaterial
          color="#f8fafc"
          transparent
          opacity={0.35}
          wireframe
        />
      </mesh>

      {/* Goal Net (Right Side) */}
      <mesh
        position={[GOAL_WIDTH / 2, GOAL_HEIGHT / 2, -GOAL_DEPTH / 2]}
        rotation={[0, -Math.PI / 2, 0]}
      >
        <planeGeometry args={[GOAL_DEPTH, GOAL_HEIGHT]} />
        <meshStandardMaterial
          color="#f8fafc"
          transparent
          opacity={0.35}
          wireframe
        />
      </mesh>
    </group>
  );
};
