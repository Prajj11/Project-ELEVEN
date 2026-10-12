import React from 'react';
import { useMatchStore } from '../stores/matchStore';
export const Minimap = () => {
  const snapshot = useMatchStore(s => s.currentSnapshot);
  const team = useMatchStore(s => s.assignedTeamId);
  const assigned = useMatchStore(s => s.assignedPlayerId);
  return <div className="minimap"><svg viewBox="-17 -27 34 54" role="img" aria-label="Live pitch map: blue and red players, yellow controlled player, white ball"><g transform={team === 'red' ? 'rotate(180)' : undefined}><rect x="-15" y="-25" width="30" height="50" rx=".5" /><path d="M-15 0H15 M-7-25V-17H7V-25 M-7 25V17H7V25" /><circle r="4.5" className="pitch-circle" />{snapshot?.players.map(p => <circle key={p.id} cx={p.position.x} cy={p.position.z} r={p.id === assigned ? 1.25 : .9} className="map-player" fill={p.id === assigned ? '#d4ff60' : p.teamId === 'blue' ? '#65b6ff' : '#ff6b7e'} />)}{snapshot && <g><circle className="map-ball-ring" cx={snapshot.ball.position.x} cy={snapshot.ball.position.z} r="1.7" fill="none" stroke="#fff2ba" strokeWidth=".35" /><circle className="map-ball" cx={snapshot.ball.position.x} cy={snapshot.ball.position.z} r=".85" fill="white" stroke="#152027" strokeWidth=".25" /></g>}</g></svg><span>LIVE PITCH</span></div>;
};
