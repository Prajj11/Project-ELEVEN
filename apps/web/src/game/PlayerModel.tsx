import React, { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { PlayerRole, TeamId, Vec3 } from '@project-eleven/shared';

interface PlayerModelProps {
  id: string; number: number; teamId: TeamId; role: PlayerRole; position: Vec3;
  velocity: Vec3; facing: Vec3; isControlled: boolean; hasPossession: boolean;
}

export const PlayerModel: React.FC<PlayerModelProps> = ({ number, teamId, role, position, velocity, facing, isControlled, hasPossession }) => {
  const root = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const leftLeg = useRef<THREE.Group>(null);
  const rightLeg = useRef<THREE.Group>(null);
  const leftArm = useRef<THREE.Group>(null);
  const rightArm = useRef<THREE.Group>(null);
  const stride = useRef(0);
  const skin = ['#bf896a', '#865334', '#e2ac87', '#6e4634', '#ce9875'][number % 5];
  const keeper = role === 'GOALKEEPER';
  const kit = keeper ? (teamId === 'blue' ? '#d9ee48' : '#ac78ee') : teamId === 'blue' ? '#3984e4' : '#ed4f65';
  const trim = keeper ? '#17232d' : '#f4f7ed';
  const numberTexture = useMemo(() => {
    const canvas = document.createElement('canvas'); canvas.width = 128; canvas.height = 128;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = trim; ctx.font = '900 90px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(String(number), 64, 65);
    const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace; return texture;
  }, [number, trim]);
  useEffect(() => () => numberTexture.dispose(), [numberTexture]);
  useFrame((_, delta) => {
    if (!root.current) return;
    const blend = 1 - Math.exp(-25 * delta);
    root.current.position.lerp(new THREE.Vector3(position.x, position.y, position.z), blend);
    if (facing.x || facing.z) {
      const target = Math.atan2(facing.x, facing.z);
      const difference = Math.atan2(Math.sin(target - root.current.rotation.y), Math.cos(target - root.current.rotation.y));
      root.current.rotation.y += difference * (1 - Math.exp(-20 * delta));
    }
    const speed = Math.hypot(velocity.x, velocity.z);
    stride.current += delta * speed * 2.5;
    const swing = Math.sin(stride.current) * Math.min(speed / 5, 1.3);
    if (leftLeg.current) leftLeg.current.rotation.x = swing * .65;
    if (rightLeg.current) rightLeg.current.rotation.x = -swing * .65;
    if (leftArm.current) leftArm.current.rotation.x = -swing * .5 - .12;
    if (rightArm.current) rightArm.current.rotation.x = swing * .5 - .12;
    if (body.current) { body.current.position.y = Math.abs(Math.sin(stride.current)) * Math.min(speed, 6) * .007; body.current.rotation.x = Math.min(speed * .012, .1); }
  });
  return <group ref={root} position={[position.x, position.y, position.z]}>
    {isControlled && <><mesh position={[0, 2.22, 0]} rotation={[Math.PI, 0, 0]}><coneGeometry args={[.17, .27, 3]} /><meshBasicMaterial color="#d4ff60" /></mesh><mesh position={[0, .025, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[.49, .57, 40]} /><meshBasicMaterial color="#d4ff60" transparent opacity={.9} /></mesh></>}
    {hasPossession && !isControlled && <mesh position={[0, .022, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[.42, .47, 32]} /><meshBasicMaterial color="#ffffff" transparent opacity={.7} /></mesh>}
    <mesh position={[0, .014, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[.36, 24]} /><meshBasicMaterial color="#000000" transparent opacity={.24} /></mesh>
    <group ref={body}>
      <mesh position={[0, 1.18, 0]} scale={[1, 1, .64]} castShadow><capsuleGeometry args={[.26, .34, 6, 12]} /><meshStandardMaterial color={kit} roughness={.8} /></mesh>
      <mesh position={[0, 1.46, 0]}><cylinderGeometry args={[.105, .13, .055, 16]} /><meshStandardMaterial color={trim} /></mesh>
      <mesh position={[0, 1.51, 0]}><cylinderGeometry args={[.083, .085, .12, 12]} /><meshStandardMaterial color={skin} /></mesh>
      <mesh position={[0, 1.71, 0]} scale={[.86, 1.08, .92]} castShadow><sphereGeometry args={[.2, 20, 16]} /><meshStandardMaterial color={skin} roughness={.85} /></mesh>
      <mesh position={[0, 1.8, -.025]} scale={[.91, .65, .94]} castShadow><sphereGeometry args={[.195, 16, 12]} /><meshStandardMaterial color="#241d1b" roughness={1} /></mesh>
      <mesh position={[0, 1.7, .177]}><sphereGeometry args={[.035, 8, 8]} /><meshStandardMaterial color={skin} /></mesh>
      {[-1, 1].map(side => <group key={side}>
        <mesh position={[side * .071, 1.737, .168]}><sphereGeometry args={[.013, 8, 8]} /><meshStandardMaterial color="#211d1b" /></mesh>
        <mesh position={[side * .18, 1.34, .16]}><boxGeometry args={[.035, .16, .015]} /><meshStandardMaterial color={trim} /></mesh>
        <group ref={side === -1 ? leftArm : rightArm} position={[side * .29, 1.38, 0]} rotation={[0, 0, side * .12]}>
          <mesh position={[0, -.1, 0]} castShadow><capsuleGeometry args={[.093, .13, 4, 10]} /><meshStandardMaterial color={kit} /></mesh>
          <mesh position={[0, -.22, 0]}><cylinderGeometry args={[.092, .086, .04, 12]} /><meshStandardMaterial color={trim} /></mesh>
          <mesh position={[0, -.345, .025]} castShadow><capsuleGeometry args={[.065, .18, 4, 10]} /><meshStandardMaterial color={skin} /></mesh>
          <mesh position={[0, -.49, .035]} castShadow><sphereGeometry args={[.073, 10, 10]} /><meshStandardMaterial color={keeper ? '#f2f2e8' : skin} /></mesh>
        </group>
        <group ref={side === -1 ? leftLeg : rightLeg} position={[side * .145, .84, 0]}>
          <mesh position={[0, -.1, 0]} castShadow><capsuleGeometry args={[.124, .16, 4, 12]} /><meshStandardMaterial color="#142333" /></mesh>
          <mesh position={[side * .105, -.1, 0]}><boxGeometry args={[.018, .19, .09]} /><meshStandardMaterial color={kit} /></mesh>
          <mesh position={[0, -.29, 0]} castShadow><capsuleGeometry args={[.083, .18, 4, 12]} /><meshStandardMaterial color={skin} /></mesh>
          <mesh position={[0, -.53, 0]} castShadow><capsuleGeometry args={[.075, .22, 4, 12]} /><meshStandardMaterial color={kit} /></mesh>
          <mesh position={[0, -.42, 0]}><cylinderGeometry args={[.08, .079, .055, 12]} /><meshStandardMaterial color={trim} /></mesh>
          <mesh position={[0, -.75, .07]} scale={[1, .65, 1.8]} castShadow><sphereGeometry args={[.1, 12, 10]} /><meshStandardMaterial color={teamId === 'blue' ? '#d3fb59' : '#faf1df'} roughness={.5} /></mesh>
        </group>
      </group>)}
      <mesh position={[0, 1.15, .173]}><planeGeometry args={[.2, .2]} /><meshBasicMaterial map={numberTexture} transparent depthWrite={false} /></mesh>
      <mesh position={[0, 1.2, -.173]} rotation={[0, Math.PI, 0]}><planeGeometry args={[.32, .32]} /><meshBasicMaterial map={numberTexture} transparent depthWrite={false} /></mesh>
    </group>
  </group>;
};
