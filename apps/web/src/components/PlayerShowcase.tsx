import React, { Component, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { PlayerModel } from '../game/PlayerModel';
import { Ball } from '../game/Ball';
class PreviewBoundary extends Component<{ children: React.ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? <div className="preview-fallback">11</div> : this.props.children; }
}
export const PlayerShowcase = ({ team = 'blue' }: { team?: 'blue' | 'red' }) => (
  <div className="player-showcase" role="img" aria-label={`${team} footballer wearing the Project Eleven match kit`}>
    <div className="showcase-orbit" /><span className="showcase-number">11</span>
    <PreviewBoundary><Suspense fallback={<div className="preview-fallback">11</div>}>
      <Canvas shadows dpr={[1, 1.5]} camera={{ position: [3.3, 2.1, 5.8], fov: 30 }} onCreated={({ camera }) => camera.lookAt(0, 1, 0)}>
        <ambientLight intensity={1.1} />
        <directionalLight position={[3, 5, 4]} intensity={3} castShadow />
        <pointLight position={[-2, 2, -1]} color="#c5f853" intensity={12} />
        <pointLight position={[2, 2, 0]} color="#6cbaff" intensity={6} />
        <group position={[0, -.12, 0]} rotation={[0, -.25, 0]}>
          <PlayerModel id="preview" number={11} teamId={team} role="FORWARD" position={{ x: 0, y: 0, z: 0 }} velocity={{ x: 0, y: 0, z: 0 }} facing={{ x: 0, y: 0, z: 1 }} isControlled={false} hasPossession={false} />
          <Ball position={{ x: .58, y: .22, z: .4 }} velocity={{ x: 0, y: 0, z: 0 }} />
          <mesh receiveShadow position={[0, -.025, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[2.4, 64]} /><meshStandardMaterial color="#17252a" roughness={.9} /></mesh>
        </group>
      </Canvas>
    </Suspense></PreviewBoundary>
    <div className="showcase-caption"><span className="live-dot" /> MATCH KIT / {team.toUpperCase()} EDITION</div>
  </div>
);
