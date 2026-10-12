import React from 'react';
import { useMatchStore } from '../stores/matchStore';
import { Crest } from '../components/GameShell';
export const Scoreboard = () => {
  const snapshot = useMatchStore(s => s.currentSnapshot);
  const remaining = Math.max(0, snapshot?.remainingSeconds ?? 180);
  const time = `${Math.floor(remaining / 60).toString().padStart(2, '0')}:${Math.floor(remaining % 60).toString().padStart(2, '0')}`;
  const phase = snapshot?.phase;
  return <div className="scoreboard" aria-label={`Blue ${snapshot?.scores.blue ?? 0}, Red ${snapshot?.scores.red ?? 0}`}>
    <div className="score-team"><Crest /><span>BLUE</span><b>{snapshot?.scores.blue ?? 0}</b></div>
    <div className="score-clock"><strong>{time}</strong><small>{phase === 'PAUSED' ? 'PAUSED' : phase === 'GOAL_PAUSE' ? 'GOAL' : phase === 'KICKOFF' ? 'KICK OFF' : 'LIVE MATCH'}</small></div>
    <div className="score-team"><b>{snapshot?.scores.red ?? 0}</b><span>RED</span><Crest team="red" /></div>
  </div>;
};
