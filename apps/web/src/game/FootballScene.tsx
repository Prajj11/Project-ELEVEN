import React from 'react';
import { Canvas } from '@react-three/fiber';
import { PITCH_CONSTANTS } from '@project-eleven/shared';
import { useMatchStore } from '../stores/matchStore';
import { useKeyboardControls } from '../controls/KeyboardControls';
import { Pitch } from './Pitch';
import { Goal } from './Goal';
import { Lighting } from './Lighting';
import { Stadium } from './Stadium';
import { PlayerModel } from './PlayerModel';
import { Ball } from './Ball';
import { FollowCamera } from './FollowCamera';

export const FootballScene: React.FC = () => {
  const currentSnapshot = useMatchStore((s) => s.currentSnapshot);
  const assignedPlayerId = useMatchStore((s) => s.assignedPlayerId);
  const assignedTeamId = useMatchStore((s) => s.assignedTeamId);

  // Enable keyboard controls during match
  useKeyboardControls(true);

  // Default ball position if snapshot is not yet received
  const ballData = currentSnapshot?.ball || {
    position: { x: 0, y: 0.22, z: 0 },
    velocity: { x: 0, y: 0, z: 0 },
    ownerId: null,
  };

  // Find assigned player to track
  const controlledPlayer = currentSnapshot?.players.find(
    (p) => p.id === assignedPlayerId
  );

  return (
    <div className="w-full h-full relative bg-slate-950">
      <Canvas
        shadows
        camera={{ position: [0, 14, 18], fov: 48 }}
        gl={{ antialias: true }}
      >
        <color attach="background" args={['#030712']} />

        {/* Scene Lighting */}
        <Lighting />

        {/* Pitch, Stadium & Goals */}
        <Pitch />
        <Stadium />
        <Goal positionZ={PITCH_CONSTANTS.BLUE_GOAL_Z} />
        <Goal positionZ={PITCH_CONSTANTS.RED_GOAL_Z} rotationY={Math.PI} />

        {/* Players */}
        {currentSnapshot?.players.map((player) => (
          <PlayerModel
            key={player.id}
            id={player.id}
            number={player.number}
            teamId={player.teamId}
            role={player.role}
            position={player.position}
            velocity={player.velocity}
            facing={player.facing}
            isControlled={player.id === assignedPlayerId}
            hasPossession={player.hasPossession}
          />
        ))}

        {/* Football */}
        <Ball position={ballData.position} velocity={ballData.velocity} />

        {/* Smooth Follow Camera */}
        <FollowCamera
          targetPosition={controlledPlayer?.position}
          ballPosition={ballData.position}
          teamSide={assignedTeamId || 'blue'}
        />
      </Canvas>
    </div>
  );
};
