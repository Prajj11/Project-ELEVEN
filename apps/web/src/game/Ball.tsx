import React, { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { BALL_PHYSICS, Vec3 } from '@project-eleven/shared';

interface BallProps { position: Vec3; velocity: Vec3; tracked?: boolean; }

// Local panel artwork, wrapped around the ball so its rotation is visible.
const makeBallTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 512; canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#f2f0e7'; ctx.fillRect(0, 0, 512, 256);
  ctx.strokeStyle = '#b7b8b1'; ctx.lineWidth = 1.2;
  for (let row = -1; row < 5; row++) {
    for (let col = -1; col < 9; col++) {
      const x = col * 72 + (row % 2 ? 36 : 0), y = row * 64 + 25;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = i * Math.PI / 3;
        const px = x + Math.cos(angle) * 41, py = y + Math.sin(angle) * 36;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.closePath(); ctx.stroke();
      if ((row + col) % 2 === 0) {
        ctx.fillStyle = '#202b32'; ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          const angle = i * Math.PI * 2 / 5 - Math.PI / 2;
          const px = x + Math.cos(angle) * 18, py = y + Math.sin(angle) * 18;
          if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.closePath(); ctx.fill();
      }
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  return texture;
};

export const Ball: React.FC<BallProps> = ({ position, velocity, tracked = false }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const shadowRef = useRef<THREE.Mesh>(null);
  const shadowMaterial = useRef<THREE.MeshBasicMaterial>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const target = useRef(new THREE.Vector3());
  const axis = useRef(new THREE.Vector3());
  const texture = useMemo(makeBallTexture, []);
  useEffect(() => () => texture.dispose(), [texture]);
  const { RADIUS } = BALL_PHYSICS;
  useFrame((_, delta) => {
    const ball = meshRef.current;
    if (!ball) return;
    target.current.set(position.x, Math.max(RADIUS, position.y), position.z);
    // Snap on kick-off resets; exponential damping cannot overshoot on slow frames.
    if (ball.position.distanceToSquared(target.current) > 100) ball.position.copy(target.current);
    else ball.position.lerp(target.current, 1 - Math.exp(-30 * delta));
    const speed = Math.hypot(velocity.x, velocity.z);
    if (speed > .1) {
      axis.current.set(velocity.z, 0, -velocity.x).normalize();
      ball.rotateOnWorldAxis(axis.current, speed / RADIUS * Math.min(delta, .05));
    }
    const height = Math.max(0, ball.position.y - RADIUS);
    if (shadowRef.current) {
      shadowRef.current.position.set(ball.position.x, .018, ball.position.z);
      shadowRef.current.scale.setScalar(1 + Math.min(height, 8) * .18);
    }
    if (shadowMaterial.current) shadowMaterial.current.opacity = .34 / (1 + height * .55);
    if (ringRef.current) ringRef.current.position.set(ball.position.x, .024, ball.position.z);
  });
  return <group>
    <mesh ref={shadowRef} position={[position.x, .018, position.z]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[RADIUS * 1.15, 24]} /><meshBasicMaterial ref={shadowMaterial} color="#000" transparent opacity={.34} depthWrite={false} />
    </mesh>
    {tracked && <mesh ref={ringRef} position={[position.x, .024, position.z]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[.34, .39, 40]} /><meshBasicMaterial color="#fff2ba" transparent opacity={.75} depthWrite={false} />
    </mesh>}
    <mesh ref={meshRef} position={[position.x, Math.max(RADIUS, position.y), position.z]} castShadow>
      <sphereGeometry args={[RADIUS, 32, 24]} /><meshStandardMaterial map={texture} roughness={.72} metalness={0} />
    </mesh>
  </group>;
};

