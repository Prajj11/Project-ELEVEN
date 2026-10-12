import React from 'react';

export const Lighting: React.FC = () => {
  return (
    <group>
      {/* Sky / Ground Ambient */}
      <hemisphereLight
        color="#bae6fd"
        groundColor="#064e3b"
        intensity={0.65}
      />

      {/* Main Directional Sun / Overhead Arena Light */}
      <directionalLight
        position={[0, 35, 10]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={100}
        shadow-camera-left={-25}
        shadow-camera-right={25}
        shadow-camera-top={35}
        shadow-camera-bottom={-35}
      />

      {/* 4 Corner Floodlight Spotlights */}
      {/* Top Left */}
      <spotLight
        position={[-18, 22, -28]}
        target-position={[0, 0, -10]}
        intensity={0.8}
        angle={0.7}
        penumbra={0.6}
        color="#f8fafc"
      />
      {/* Top Right */}
      <spotLight
        position={[18, 22, -28]}
        target-position={[0, 0, -10]}
        intensity={0.8}
        angle={0.7}
        penumbra={0.6}
        color="#f8fafc"
      />
      {/* Bottom Left */}
      <spotLight
        position={[-18, 22, 28]}
        target-position={[0, 0, 10]}
        intensity={0.8}
        angle={0.7}
        penumbra={0.6}
        color="#f8fafc"
      />
      {/* Bottom Right */}
      <spotLight
        position={[18, 22, 28]}
        target-position={[0, 0, 10]}
        intensity={0.8}
        angle={0.7}
        penumbra={0.6}
        color="#f8fafc"
      />
    </group>
  );
};
