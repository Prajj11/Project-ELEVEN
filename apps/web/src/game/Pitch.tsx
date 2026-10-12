import React from 'react';
import { PITCH_CONSTANTS } from '@project-eleven/shared';

export const Pitch: React.FC = () => {
  const {
    WIDTH,
    LENGTH,
    HALF_WIDTH,
    HALF_LENGTH,
    CENTER_CIRCLE_RADIUS,
    PENALTY_AREA_WIDTH,
    PENALTY_AREA_DEPTH,
  } = PITCH_CONSTANTS;

  const lineWidth = 0.12;
  const lineY = 0.01; // Slightly above turf plane to prevent z-fighting

  return (
    <group>
      {/* Grass Turf Plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[WIDTH + 8, LENGTH + 8]} />
        <meshStandardMaterial color="#244b30" roughness={1} />
      </mesh>

      {/* Outer Pitch Border Turf */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]} receiveShadow>
        <planeGeometry args={[WIDTH, LENGTH]} />
        <meshStandardMaterial color="#376c3e" roughness={1} />
      </mesh>

      {/* Alternating mowing directions; painted lines stay above the turf. */}
      {Array.from({ length: 10 }, (_, i) => (
        <mesh key={i} position={[0, .006, -HALF_LENGTH + (i + .5) * LENGTH / 10]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[WIDTH, LENGTH / 10]} />
          <meshStandardMaterial color={i % 2 === 0 ? '#3b7044' : '#32633c'} roughness={1} />
        </mesh>
      ))}
      {[-1, 1].map(side => <mesh key={side} position={[0, lineY, side * PITCH_CONSTANTS.PENALTY_SPOT_DISTANCE]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[.14, 20]} /><meshBasicMaterial color="#f2f2e6" />
      </mesh>)}
      {[-1, 1].flatMap(x => [-1, 1].map(z => <group key={`${x}:${z}`} position={[x * HALF_WIDTH, 0, z * HALF_LENGTH]}>
        <mesh position={[0, .65, 0]} castShadow><cylinderGeometry args={[.025, .025, 1.3, 8]} /><meshStandardMaterial color="#f1eddf" /></mesh>
        <mesh position={[.16, 1.13, 0]}><planeGeometry args={[.32, .25]} /><meshStandardMaterial color="#f5cd60" side={2} /></mesh>
      </group>))}

      {/* Boundary Lines */}
      {/* Side Lines (Touchlines) */}
      <mesh position={[-HALF_WIDTH, lineY, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[lineWidth, LENGTH]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh position={[HALF_WIDTH, lineY, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[lineWidth, LENGTH]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* End Lines (Goal lines) */}
      <mesh position={[0, lineY, -HALF_LENGTH]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[WIDTH, lineWidth]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0, lineY, HALF_LENGTH]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[WIDTH, lineWidth]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* Halfway Line */}
      <mesh position={[0, lineY, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[WIDTH, lineWidth]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* Center Spot */}
      <mesh position={[0, lineY + 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.25, 32]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* Center Circle */}
      <mesh position={[0, lineY, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry
          args={[
            CENTER_CIRCLE_RADIUS - lineWidth / 2,
            CENTER_CIRCLE_RADIUS + lineWidth / 2,
            64,
          ]}
        />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* Blue Team Penalty Box (Z = -HALF_LENGTH) */}
      {/* Front line */}
      <mesh
        position={[0, lineY, -HALF_LENGTH + PENALTY_AREA_DEPTH]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[PENALTY_AREA_WIDTH, lineWidth]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      {/* Left side line */}
      <mesh
        position={[-PENALTY_AREA_WIDTH / 2, lineY, -HALF_LENGTH + PENALTY_AREA_DEPTH / 2]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[lineWidth, PENALTY_AREA_DEPTH]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      {/* Right side line */}
      <mesh
        position={[PENALTY_AREA_WIDTH / 2, lineY, -HALF_LENGTH + PENALTY_AREA_DEPTH / 2]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[lineWidth, PENALTY_AREA_DEPTH]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* Red Team Penalty Box (Z = +HALF_LENGTH) */}
      {/* Front line */}
      <mesh
        position={[0, lineY, HALF_LENGTH - PENALTY_AREA_DEPTH]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[PENALTY_AREA_WIDTH, lineWidth]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      {/* Left side line */}
      <mesh
        position={[-PENALTY_AREA_WIDTH / 2, lineY, HALF_LENGTH - PENALTY_AREA_DEPTH / 2]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[lineWidth, PENALTY_AREA_DEPTH]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      {/* Right side line */}
      <mesh
        position={[PENALTY_AREA_WIDTH / 2, lineY, HALF_LENGTH - PENALTY_AREA_DEPTH / 2]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[lineWidth, PENALTY_AREA_DEPTH]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </group>
  );
};
