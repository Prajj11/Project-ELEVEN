import { RefObject, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3 } from 'three';
import { useMatchStore } from '../stores/matchStore';
import { useSettingsStore } from '../stores/settingsStore';

// Update the existing overlay directly; no React renders on animation frames.
export const BallTracker = ({ marker }: { marker: RefObject<HTMLDivElement> }) => {
  const projected = useRef(new Vector3());
  const viewPosition = useRef(new Vector3());
  useFrame(({ camera, size }) => {
    const element = marker.current;
    if (!element) return;
    const { currentSnapshot: snapshot, assignedPlayerId } = useMatchStore.getState();
    if (!snapshot || !useSettingsStore.getState().showBallTracker) {
      element.hidden = true;
      return;
    }
    element.hidden = false;
    camera.updateMatrixWorld();
    const { position } = snapshot.ball;
    projected.current.set(position.x, position.y, position.z);
    viewPosition.current.copy(projected.current).applyMatrix4(camera.matrixWorldInverse);
    projected.current.project(camera);
    const point = projected.current;
    const visible = viewPosition.current.z < 0 && point.z >= -1 && point.z <= 1
      && Math.abs(point.x) < .9 && Math.abs(point.y) < .84;
    let x = (point.x + 1) * size.width / 2;
    let y = (1 - point.y) * size.height / 2;
    if (!visible) {
      let dx = point.x * size.width / 2;
      let dy = -point.y * size.height / 2;
      if (viewPosition.current.z >= 0) {
        dx = viewPosition.current.x;
        dy = -viewPosition.current.y;
      }
      if (Math.abs(dx) + Math.abs(dy) < .001) dy = 1;
      // Keep edge indicators out of the scoreboard and lower player HUD.
      const halfWidth = Math.max(40, size.width / 2 - 50);
      const halfHeight = Math.max(35, size.height / 2 - Math.min(165, size.height * .3));
      const scale = Math.min(halfWidth / Math.max(Math.abs(dx), .001), halfHeight / Math.max(Math.abs(dy), .001));
      x = size.width / 2 + dx * scale;
      y = size.height / 2 + dy * scale;
      element.style.setProperty('--ball-angle', `${Math.atan2(dy, dx)}rad`);
    }
    element.dataset.offscreen = String(!visible);
    element.style.transform = `translate(${x}px, ${y}px)`;
    const player = snapshot.players.find(p => p.id === assignedPlayerId);
    const distance = player ? Math.round(Math.hypot(position.x - player.position.x, position.z - player.position.z)) : null;
    const label = element.querySelector('span');
    if (label) label.textContent = distance === null ? 'BALL' : `BALL · ${distance}m`;
  });
  return null;
};

