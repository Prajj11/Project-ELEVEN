import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Vec3 } from '@project-eleven/shared';
import { useSettingsStore } from '../stores/settingsStore';

interface FollowCameraProps {
  targetPosition?: Vec3;
  ballPosition?: Vec3;
  teamSide?: 'blue' | 'red';
}

export const FollowCamera: React.FC<FollowCameraProps> = ({
  targetPosition,
  ballPosition,
  teamSide = 'blue',
}) => {
  const { camera } = useThree();
  const cameraMode = useSettingsStore((s) => s.cameraMode);
  const currentTarget = useRef(new THREE.Vector3(0, 0, 0));

  useFrame((_, delta) => {
    // Focus target: player position or blend between player and ball
    const targetX = targetPosition ? targetPosition.x : 0;
    const targetZ = targetPosition ? targetPosition.z : 0;

    const ballX = ballPosition ? ballPosition.x : 0;
    const ballZ = ballPosition ? ballPosition.z : 0;

    // Camera view blend
    const lookX = targetX * 0.7 + ballX * 0.3;
    const lookZ = targetZ * 0.7 + ballZ * 0.3;

    currentTarget.current.lerp(new THREE.Vector3(lookX, 0.5, lookZ), delta * 5);

    if (cameraMode === 'tactical') {
      // High tactical overview
      const desiredPos = new THREE.Vector3(0, 26, teamSide === 'blue' ? 18 : -18);
      camera.position.lerp(desiredPos, delta * 4);
      camera.lookAt(0, 0, 0);
    } else {
      // Dynamic follow broadcast camera
      const zOffset = teamSide === 'blue' ? 15 : -15;
      const desiredX = currentTarget.current.x * 0.5;
      const desiredY = 13.5;
      const desiredZ = currentTarget.current.z + zOffset;

      camera.position.lerp(
        new THREE.Vector3(desiredX, desiredY, desiredZ),
        delta * 6
      );
      camera.lookAt(currentTarget.current);
    }
  });

  return null;
};
