import { useEffect, useRef } from 'react';
import { PlayerInput } from '@project-eleven/shared';
import { useThree } from '@react-three/fiber';
import { Vector3 } from 'three';
import { socketClient } from '../network/socketClient';
import { useSettingsStore } from '../stores/settingsStore';
import { useMatchStore } from '../stores/matchStore';
import { useInputStore } from '../stores/inputStore';

interface KeyState {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  sprint: boolean;
}

export const useKeyboardControls = (enabled: boolean = true) => {
  const { camera } = useThree();
  const cameraForward = useRef(new Vector3(0, 0, -1));
  const keys = useRef<KeyState>({
    forward: false,
    backward: false,
    left: false,
    right: false,
    sprint: false,
  });

  const sequence = useRef(0);
  const shotStarted = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const canShoot = () => {
      const { currentSnapshot, assignedPlayerId } = useMatchStore.getState();
      return currentSnapshot?.phase === 'PLAYING' && currentSnapshot.players.some(
        p => p.id === assignedPlayerId && p.hasPossession
      );
    };
    const cancelShot = () => {
      shotStarted.current = null;
      useInputStore.getState().setShotCharge(null);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.querySelector('dialog[open]')) return;
      if (e.code === 'Space' && e.target instanceof HTMLElement && e.target.closest('button, input, select, textarea')) return;
      // Prevent browser scroll on space/arrows
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }

      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          keys.current.forward = true;
          break;
        case 'KeyS':
        case 'ArrowDown':
          keys.current.backward = true;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          keys.current.left = true;
          break;
        case 'KeyD':
        case 'ArrowRight':
          keys.current.right = true;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          keys.current.sprint = true;
          break;
        case 'KeyE':
          if (e.repeat) return;
          // Pass action
          socketClient.performAction({ type: 'PASS' });
          break;
        case 'Space':
          if (e.repeat) return;
          if (canShoot()) {
            shotStarted.current = performance.now();
            useInputStore.getState().setShotCharge(0);
          }
          break;
        case 'KeyQ':
          if (e.repeat) return;
          // Tackle action
          socketClient.performAction({ type: 'TACKLE' });
          break;
        case 'KeyC': {
          if (e.repeat) return;
          const settings = useSettingsStore.getState();
          settings.setCameraMode(settings.cameraMode === 'follow' ? 'tactical' : 'follow');
          break;
        }
        case 'Escape':
          handleBlur();
          break;
        case 'KeyP':
          cancelShot();
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'Space': {
          if (shotStarted.current !== null && !document.querySelector('dialog[open]') && canShoot()) {
            const charge = Math.min(1, (performance.now() - shotStarted.current) / 900);
            socketClient.performAction({ type: 'SHOOT', power: .4 + .6 * charge });
          }
          cancelShot();
          break;
        }
        case 'KeyW':
        case 'ArrowUp':
          keys.current.forward = false;
          break;
        case 'KeyS':
        case 'ArrowDown':
          keys.current.backward = false;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          keys.current.left = false;
          break;
        case 'KeyD':
        case 'ArrowRight':
          keys.current.right = false;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          keys.current.sprint = false;
          break;
      }
    };

    const handleBlur = () => {
      cancelShot();
      keys.current = {
        forward: false,
        backward: false,
        left: false,
        right: false,
        sprint: false,
      };
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    // Continuous input transmit loop (30Hz)
    const interval = setInterval(() => {
      if (document.querySelector('dialog[open]')) handleBlur();
      if (shotStarted.current !== null) {
        if (!canShoot()) cancelShot();
        else useInputStore.getState().setShotCharge(Math.min(1, (performance.now() - shotStarted.current) / 900));
      }
      let x = 0;
      let z = 0;

      if (keys.current.forward) z -= 1;
      if (keys.current.backward) z += 1;
      if (keys.current.left) x -= 1;
      if (keys.current.right) x += 1;

      // Diagonal normalization
      if (x !== 0 && z !== 0) {
        const len = Math.hypot(x, z);
        x /= len;
        z /= len;
      }

      // Convert screen directions to pitch directions using the actual camera.
      // This also follows camera transitions instead of assuming a team angle.
      camera.getWorldDirection(cameraForward.current);
      const forward = cameraForward.current;
      forward.y = 0;
      if (forward.lengthSq() < 0.0001) forward.set(0, 0, -1);
      forward.normalize();
      const screenX = x;
      const screenZ = z;
      x = -forward.z * screenX - forward.x * screenZ;
      z = forward.x * screenX - forward.z * screenZ;

      sequence.current += 1;
      const inputPayload: PlayerInput = {
        sequence: sequence.current,
        movement: { x, z },
        sprint: keys.current.sprint,
      };

      socketClient.sendInput(inputPayload);
    }, 1000 / 30);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
      clearInterval(interval);
      cancelShot();
    };
  }, [enabled, camera]);
};
