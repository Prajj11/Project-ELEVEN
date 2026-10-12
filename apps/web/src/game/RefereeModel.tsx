import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Vec3 } from '@project-eleven/shared';

interface RefereeModelProps {
  position?: Vec3;
  velocity?: Vec3;
  facing?: Vec3;
}

export const RefereeModel: React.FC<RefereeModelProps> = ({
  position = { x: 4.5, y: 0, z: 0 },
  velocity = { x: 0, y: 0, z: 0 },
  facing = { x: -1, y: 0, z: 0 },
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Mesh>(null);
  const rightLegRef = useRef<THREE.Mesh>(null);
  const leftArmRef = useRef<THREE.Mesh>(null);
  const rightArmRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    // Smooth position interpolation
    groupRef.current.position.x = THREE.MathUtils.lerp(
      groupRef.current.position.x,
      position.x,
      delta * 20
    );
    groupRef.current.position.y = 0;
    groupRef.current.position.z = THREE.MathUtils.lerp(
      groupRef.current.position.z,
      position.z,
      delta * 20
    );

    // Face orientation
    if (facing.x !== 0 || facing.z !== 0) {
      const targetAngle = Math.atan2(facing.x, facing.z);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        targetAngle,
        delta * 15
      );
    }

    // Jogging animation
    const speed = Math.hypot(velocity.x, velocity.z);
    if (speed > 0.4) {
      const time = performance.now() * 0.01 * (speed / 4.0);
      const legAngle = Math.sin(time) * 0.45;
      const armAngle = -Math.sin(time) * 0.4;

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

  return (
    <group ref={groupRef} position={[position.x, 0, position.z]}>
      {/* 11th Body / Referee Floating Badge */}
      <group position={[0, 2.2, 0]}>
        <mesh>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshBasicMaterial color="#facc15" />
        </mesh>
      </group>

      {/* Shadow */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.38, 16]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.3} />
      </mesh>

      {/* Torso / Fluorescent Yellow Referee Jersey */}
      <mesh position={[0, 1.1, 0]} castShadow>
        <boxGeometry args={[0.55, 0.65, 0.3]} />
        <meshStandardMaterial color="#eab308" roughness={0.35} />
      </mesh>

      {/* Referee Collar / Black Accent */}
      <mesh position={[0, 1.38, 0.02]} castShadow>
        <boxGeometry args={[0.22, 0.1, 0.32]} />
        <meshStandardMaterial color="#090d16" roughness={0.5} />
      </mesh>

      {/* Head */}
      <mesh position={[0, 1.62, 0]} castShadow>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshStandardMaterial color="#fcd34d" roughness={0.6} />
      </mesh>

      {/* Hair */}
      <mesh position={[0, 1.72, 0]} castShadow>
        <sphereGeometry args={[0.21, 16, 16]} />
        <meshStandardMaterial color="#334155" roughness={0.8} />
      </mesh>

      {/* Left Arm */}
      <mesh ref={leftArmRef} position={[-0.38, 1.1, 0]} castShadow>
        <boxGeometry args={[0.16, 0.55, 0.16]} />
        <meshStandardMaterial color="#eab308" />
      </mesh>

      {/* Right Arm */}
      <mesh ref={rightArmRef} position={[0.38, 1.1, 0]} castShadow>
        <boxGeometry args={[0.16, 0.55, 0.16]} />
        <meshStandardMaterial color="#eab308" />
      </mesh>

      {/* Black Referee Shorts */}
      <mesh position={[0, 0.68, 0]} castShadow>
        <boxGeometry args={[0.52, 0.28, 0.28]} />
        <meshStandardMaterial color="#090d16" roughness={0.5} />
      </mesh>

      {/* Left Leg & Black Sock */}
      <mesh ref={leftLegRef} position={[-0.18, 0.35, 0]} castShadow>
        <boxGeometry args={[0.18, 0.5, 0.18]} />
        <meshStandardMaterial color="#090d16" />
      </mesh>

      {/* Right Leg & Black Sock */}
      <mesh ref={rightLegRef} position={[0.18, 0.35, 0]} castShadow>
        <boxGeometry args={[0.18, 0.5, 0.18]} />
        <meshStandardMaterial color="#090d16" />
      </mesh>

      {/* Black Boots */}
      <mesh position={[-0.18, 0.08, 0.04]} castShadow>
        <boxGeometry args={[0.18, 0.12, 0.28]} />
        <meshStandardMaterial color="#020617" roughness={0.2} />
      </mesh>
      <mesh position={[0.18, 0.08, 0.04]} castShadow>
        <boxGeometry args={[0.18, 0.12, 0.28]} />
        <meshStandardMaterial color="#020617" roughness={0.2} />
      </mesh>
    </group>
  );
};
