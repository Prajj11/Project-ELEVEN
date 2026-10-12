import React from 'react';
import { PITCH_CONSTANTS } from '@project-eleven/shared';

export const Stadium: React.FC = () => {
  const { HALF_WIDTH, HALF_LENGTH } = PITCH_CONSTANTS;
  const boardMargin = 2.0;
  const boardHeight = 0.9;
  const boardThickness = 0.15;

  return (
    <group>
      {/* Advertising Perimeter Boards */}
      {/* Left board */}
      <mesh
        position={[-HALF_WIDTH - boardMargin, boardHeight / 2, 0]}
        castShadow
        receiveShadow
      >
        <boxGeometry
          args={[boardThickness, boardHeight, (HALF_LENGTH + boardMargin) * 2]}
        />
        <meshStandardMaterial color="#0f172a" roughness={0.4} />
      </mesh>

      {/* Right board */}
      <mesh
        position={[HALF_WIDTH + boardMargin, boardHeight / 2, 0]}
        castShadow
        receiveShadow
      >
        <boxGeometry
          args={[boardThickness, boardHeight, (HALF_LENGTH + boardMargin) * 2]}
        />
        <meshStandardMaterial color="#0f172a" roughness={0.4} />
      </mesh>

      {/* Blue End Boards (Split around goal) */}
      <mesh
        position={[
          (-HALF_WIDTH - boardMargin + -PITCH_CONSTANTS.GOAL_WIDTH / 2) / 2,
          boardHeight / 2,
          -HALF_LENGTH - boardMargin,
        ]}
        castShadow
      >
        <boxGeometry
          args={[
            HALF_WIDTH + boardMargin - PITCH_CONSTANTS.GOAL_WIDTH / 2,
            boardHeight,
            boardThickness,
          ]}
        />
        <meshStandardMaterial color="#0369a1" roughness={0.4} />
      </mesh>
      <mesh
        position={[
          (HALF_WIDTH + boardMargin + PITCH_CONSTANTS.GOAL_WIDTH / 2) / 2,
          boardHeight / 2,
          -HALF_LENGTH - boardMargin,
        ]}
        castShadow
      >
        <boxGeometry
          args={[
            HALF_WIDTH + boardMargin - PITCH_CONSTANTS.GOAL_WIDTH / 2,
            boardHeight,
            boardThickness,
          ]}
        />
        <meshStandardMaterial color="#0369a1" roughness={0.4} />
      </mesh>

      {/* Red End Boards (Split around goal) */}
      <mesh
        position={[
          (-HALF_WIDTH - boardMargin + -PITCH_CONSTANTS.GOAL_WIDTH / 2) / 2,
          boardHeight / 2,
          HALF_LENGTH + boardMargin,
        ]}
        castShadow
      >
        <boxGeometry
          args={[
            HALF_WIDTH + boardMargin - PITCH_CONSTANTS.GOAL_WIDTH / 2,
            boardHeight,
            boardThickness,
          ]}
        />
        <meshStandardMaterial color="#be123c" roughness={0.4} />
      </mesh>
      <mesh
        position={[
          (HALF_WIDTH + boardMargin + PITCH_CONSTANTS.GOAL_WIDTH / 2) / 2,
          boardHeight / 2,
          HALF_LENGTH + boardMargin,
        ]}
        castShadow
      >
        <boxGeometry
          args={[
            HALF_WIDTH + boardMargin - PITCH_CONSTANTS.GOAL_WIDTH / 2,
            boardHeight,
            boardThickness,
          ]}
        />
        <meshStandardMaterial color="#be123c" roughness={0.4} />
      </mesh>

      {/* Grandstands / Arena Walls */}
      {/* Left Stands */}
      <mesh
        position={[-HALF_WIDTH - boardMargin - 8, 4, 0]}
        rotation={[0, 0, Math.PI / 12]}
        receiveShadow
      >
        <boxGeometry args={[14, 1.5, (HALF_LENGTH + boardMargin) * 2 + 10]} />
        <meshStandardMaterial color="#1e293b" roughness={0.7} />
      </mesh>
      {/* Right Stands */}
      <mesh
        position={[HALF_WIDTH + boardMargin + 8, 4, 0]}
        rotation={[0, 0, -Math.PI / 12]}
        receiveShadow
      >
        <boxGeometry args={[14, 1.5, (HALF_LENGTH + boardMargin) * 2 + 10]} />
        <meshStandardMaterial color="#1e293b" roughness={0.7} />
      </mesh>

      {/* 4 Corner Floodlight Poles */}
      {[
        [-18, -28],
        [18, -28],
        [-18, 28],
        [18, 28],
      ].map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh position={[0, 11, 0]} castShadow>
            <cylinderGeometry args={[0.2, 0.35, 22, 8]} />
            <meshStandardMaterial color="#475569" metalness={0.6} />
          </mesh>
          <mesh position={[0, 22, 0]}>
            <boxGeometry args={[2.5, 1.5, 0.8]} />
            <meshStandardMaterial color="#f8fafc" emissive="#ffffff" emissiveIntensity={0.8} />
          </mesh>
        </group>
      ))}
    </group>
  );
};
