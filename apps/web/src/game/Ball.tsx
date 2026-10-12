import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { BALL_PHYSICS, Vec3 } from '@project-eleven/shared';

interface BallProps {
  position: Vec3;
  velocity: Vec3;
}

export const Ball: React.FC<BallProps> = ({ position, velocity }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const shadowRef = useRef<THREE.Mesh>(null);
  const { RADIUS } = BALL_PHYSICS;

  useFrame((_, delta) => {
    if (!meshRef.current) return;

    // Smooth position interpolation
    meshRef.current.position.x = THREE.MathUtils.lerp(
      meshRef.current.position.x,
      position.x,
      delta * 30
    );
    meshRef.current.position.y = THREE.MathUtils.lerp(
      meshRef.current.position.y,
      Math.max(RADIUS, position.y),
      delta * 30
    );
    meshRef.current.position.z = THREE.MathUtils.lerp(
      meshRef.current.position.z,
      position.z,
      delta * 30
    );

    // Roll ball according to velocity
    const speed = Math.hypot(velocity.x, velocity.z);
    if (speed > 0.1) {
      const rollAngle = (speed / RADIUS) * delta;
      meshRef.current.rotation.x += velocity.z * delta * 4;
      meshRef.current.rotation.z -= velocity.x * delta * 4;
    }

    // Dynamic ground shadow
    if (shadowRef.current) {
      shadowRef.current.position.x = meshRef.current.position.x;
      shadowRef.current.position.z = meshRef.current.position.z;
      const height = Math.max(0, position.y - RADIUS);
      const shadowScale = Math.max(0.4, 1.0 - height * 0.15);
      shadowRef.current.scale.set(shadowScale, shadowScale, shadowScale);
    }
  });

  return (
    <group>
      {/* Ground Projection Shadow */}
      <mesh
        ref={shadowRef}
        position={[position.x, 0.015, position.z]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <circleGeometry args={[RADIUS * 1.1, 16]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.4} />
      </mesh>

      {/* 3D Soccer Ball */}
      <mesh
        ref={meshRef}
        position={[position.x, Math.max(RADIUS, position.y), position.z]}
        castShadow
      >
        <sphereGeometry args={[RADIUS, 24, 24]} />
        <meshStandardMaterial
          color="#f8fafc"
          roughness={0.25}
          metalness={0.1}
        />
      </mesh>
    </group>
  );
};
