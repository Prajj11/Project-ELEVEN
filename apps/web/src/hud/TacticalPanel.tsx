import React, { useState } from 'react';
import { ChevronDown, Radio } from 'lucide-react';
import { useMatchStore } from '../stores/matchStore';
export const TacticalPanel = () => {
  const [open, setOpen] = useState(false);
  const snapshot = useMatchStore(s => s.currentSnapshot);
  return <div className="tactical-panel"><button onClick={() => setOpen(!open)} aria-expanded={open}><Radio size={16} /><span>THE DUGOUT</span><ChevronDown size={15} style={{ transform: open ? 'rotate(180deg)' : undefined }} /></button>
    {open && <div className="tactical-content">{(['blue', 'red'] as const).map(team => {
      const tactics = snapshot?.tactics[team];
      return <div className={`coach coach-${team}`} key={team}><div><strong>{team.toUpperCase()} COACH</strong><span>{(tactics?.strategy || 'BALANCED').replace(/_/g, ' ')}</span></div><p>{tactics?.explanation || 'Find space, keep the ball, and move together.'}</p><label>PRESSURE <span>{Math.round((tactics?.pressingIntensity ?? .5) * 100)}%</span></label><div className="pressure-track"><i style={{ width: `${(tactics?.pressingIntensity ?? .5) * 100}%` }} /></div></div>;
    })}</div>}
  </div>;
};
