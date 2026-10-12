import { useEffect, useRef } from 'react';
import { PlayerActionPayload, PlayerInput } from '@project-eleven/shared';
import { socketClient } from '../network/socketClient';

interface KeyState {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  sprint: boolean;
}

export const useKeyboardControls = (enabled: boolean = true) => {
  const keys = useRef<KeyState>({
    forward: false,
    backward: false,
    left: false,
    right: false,
    sprint: false,
  });

  const sequence = useRef(0);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
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
          // Pass action
          socketClient.performAction({ type: 'PASS' });
          break;
        case 'Space':
          // Shoot action
          socketClient.performAction({ type: 'SHOOT', power: 0.85 });
          break;
        case 'KeyQ':
          // Tackle action
          socketClient.performAction({ type: 'TACKLE' });
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
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
    };
  }, [enabled]);
};
