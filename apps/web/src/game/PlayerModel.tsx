import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { PlayerRole, TeamId, Vec3 } from '@project-eleven/shared';

interface PlayerModelProps {
  id: string;
  number: number;
  teamId: TeamId;
  role: PlayerRole;
  position: Vec3;
  velocity: Vec3;
  facing: Vec3;
  isControlled: boolean;
  hasPossession: boolean;
}

export const PlayerModel: React.FC<PlayerModelProps> = ({
  number,
  teamId,
  role,
  position,
  velocity,
  facing,
  isControlled,
  hasPossession,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Mesh>(null);
  const rightLegRef = useRef<THREE.Mesh>(null);
  const leftArmRef = useRef<THREE.Mesh>(null);
  const rightArmRef = useRef<THREE.Mesh>(null);

  // Smooth position and rotation interpolation
  useFrame((_, delta) => {
    if (!groupRef.current) return;

    // Smooth position lerp
    groupRef.current.position.x = THREE.MathUtils.lerp(
      groupRef.current.position.x,
      position.x,
      delta * 25
    );
    groupRef.current.position.y = THREE.MathUtils.lerp(
      groupRef.current.position.y,
      position.y,
      delta * 25
    );
    groupRef.current.position.z = THREE.MathUtils.lerp(
      groupRef.current.position.z,
      position.z,
      delta * 25
    );

    // Rotation towards facing vector
    if (facing.x !== 0 || facing.z !== 0) {
      const targetAngle = Math.atan2(facing.x, facing.z);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        targetAngle,
        delta * 20
      );
    }

    // Procedural run animation based on horizontal velocity
    const speed = Math.hypot(velocity.x, velocity.z);
    if (speed > 0.5) {
      const time = performance.now() * 0.012 * (speed / 5.0);
      const legAngle = Math.sin(time) * 0.55;
      const armAngle = -Math.sin(time) * 0.45;

      if (leftLegRef.current) leftLegRef.current.rotation.x = legAngle;
      if (rightLegRef.current) rightLegRef.current.rotation.x = -legAngle;
      if (leftArmRef.current) leftArmRef.current.rotation.x = armAngle;
      if (rightArmRef.current) rightArmRef.current.rotation.x = -armAngle;
    } else {
      if (leftLegRef.current) leftLegRef.current.rotation.x = 0;
      if (rightLegRef.current) rightLegRef.current.rotation.x = 0;
      if (leftArmRef.current) leftArmRef.current.rotation.x = 0;
      if (rightArmRef.current) rightArmRef.current.rotation.x = 0;
    }
  });

  // Determine kit colors
  let jerseyColor = teamId === 'blue' ? '#0284c7' : '#e11d48';
  let shortsColor = teamId === 'blue' ? '#0f172a' : '#1e1b4b';

  // Neon goalkeeper kits
  if (role === 'GOALKEEPER') {
    jerseyColor = teamId === 'blue' ? '#eab308' : '#a855f7';
    shortsColor = '#0f172a';
  }

  return (
    <group ref={groupRef} position={[position.x, position.y, position.z]}>
      {/* Active Controlled Player Indicator */}
      {isControlled && (
        <group position={[0, 2.3, 0]}>
          {/* Floating Chevron */}
          <mesh rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[0.22, 0.35, 4]} />
            <meshBasicMaterial color="#38bdf8" />
          </mesh>
          {/* Halo ring on ground */}
          <mesh position={[0, -2.28, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.55, 0.65, 32]} />
            <meshBasicMaterial color="#38bdf8" transparent opacity={0.8} />
          </mesh>
        </group>
      )}

      {/* Possession Glow Indicator */}
      {hasPossession && !isControlled && (
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.45, 0.52, 24]} />
          <meshBasicMaterial color="#fbbf24" transparent opacity={0.65} />
        </mesh>
      )}

      {/* Shadow underneath */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.4, 16]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.3} />
      </mesh>

      {/* Torso / Jersey */}
      <mesh position={[0, 1.1, 0]} castShadow>
        <boxGeometry args={[0.55, 0.65, 0.3]} />
        <meshStandardMaterial color={jerseyColor} roughness={0.4} />
      </mesh>

      {/* Head */}
      <mesh position={[0, 1.62, 0]} castShadow>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshStandardMaterial color="#fcd34d" roughness={0.6} />
      </mesh>

      {/* Hair / Headband */}
      <mesh position={[0, 1.72, 0]} castShadow>
        <sphereGeometry args={[0.21, 16, 16]} />
        <meshStandardMaterial color="#1e293b" roughness={0.9} />
      </mesh>

      {/* Left Arm */}
      <mesh ref={leftArmRef} position={[-0.38, 1.1, 0]} castShadow>
        <boxGeometry args={[0.16, 0.55, 0.16]} />
        <meshStandardMaterial color={jerseyColor} />
      </mesh>

      {/* Right Arm */}
      <mesh ref={rightArmRef} position={[0.38, 1.1, 0]} castShadow>
        <boxGeometry args={[0.16, 0.55, 0.16]} />
        <meshStandardMaterial color={jerseyColor} />
      </mesh>

      {/* Shorts */}
      <mesh position={[0, 0.68, 0]} castShadow>
        <boxGeometry args={[0.52, 0.28, 0.28]} />
        <meshStandardMaterial color={shortsColor} />
      </mesh>

      {/* Left Leg & Sock */}
      <mesh ref={leftLegRef} position={[-0.18, 0.35, 0]} castShadow>
        <boxGeometry args={[0.18, 0.5, 0.18]} />
        <meshStandardMaterial color={jerseyColor} />
      </mesh>

      {/* Right Leg & Sock */}
      <mesh ref={rightLegRef} position={[0.18, 0.35, 0]} castShadow>
        <boxGeometry args={[0.18, 0.5, 0.18]} />
        <meshStandardMaterial color={jerseyColor} />
      </mesh>

      {/* Boots */}
      <mesh position={[-0.18, 0.08, 0.04]} castShadow>
        <boxGeometry args={[0.18, 0.12, 0.28]} />
        <meshStandardMaterial color="#020617" roughness={0.3} />
      </mesh>
      <mesh position={[0.18, 0.08, 0.04]} castShadow>
        <boxGeometry args={[0.18, 0.12, 0.28]} />
        <meshStandardMaterial color="#020617" roughness={0.3} />
      </mesh>
    </group>
  );
};
