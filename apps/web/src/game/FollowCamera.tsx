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
  const { camera, size } = useThree();
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

    currentTarget.current.lerp(new THREE.Vector3(lookX, 0.5, lookZ), 1 - Math.exp(-5 * delta));

    if (cameraMode === 'tactical') {
      // High tactical overview
      // Fit both goals and touchlines, including narrow portrait viewports.
      const aspect = size.width / Math.max(1, size.height);
      const height = Math.max(76, 38 / aspect);
      const desiredPos = new THREE.Vector3(0, height, teamSide === 'blue' ? 16 : -16);
      camera.position.lerp(desiredPos, 1 - Math.exp(-4 * delta));
      camera.lookAt(0, 0, 0);
    } else {
      // Dynamic follow broadcast camera
      // Pull back as play stretches so long passes stay easier to follow.
      const separation = Math.hypot(ballX - targetX, ballZ - targetZ);
      const pullback = Math.min(6, separation * .22);
      const zOffset = (teamSide === 'blue' ? 1 : -1) * (15 + pullback * .6);
      const desiredX = currentTarget.current.x * 0.5;
      const desiredY = 13.5 + pullback;
      const desiredZ = currentTarget.current.z + zOffset;

      camera.position.lerp(
        new THREE.Vector3(desiredX, desiredY, desiredZ),
        1 - Math.exp(-6 * delta)
      );
      camera.lookAt(currentTarget.current);
    }
  });

  return null;
};
