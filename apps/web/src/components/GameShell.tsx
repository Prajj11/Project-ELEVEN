import React from 'react';
import { ArrowUpRight, Shield, Zap } from 'lucide-react';
import { ConnectionIndicator } from './ConnectionIndicator';
export const Crest = ({ team = 'blue', large = false }: { team?: 'blue' | 'red'; large?: boolean }) => (
  <div className={`crest crest-${team} ${large ? 'crest-large' : ''}`} aria-label={`${team} team crest`}><Shield /><span>{team === 'blue' ? 'B' : 'R'}</span></div>
);
export const GameShell = ({ children, section, footer }: { children: React.ReactNode; section: string; footer?: React.ReactNode }) => (
  <div className="game-shell">
    <header className="game-header">
      <div className="brand"><div className="brand-mark">11<span /></div><div>PROJECT ELEVEN<small>THE BEAUTIFUL GAME. REIMAGINED.</small></div></div>
      <div className="header-section"><span className="live-dot" />{section}</div>
      <ConnectionIndicator />
    </header>
    {children}
    <footer className="game-footer"><span><Zap size={13} /> FIVE A SIDE. ALL TO PLAY FOR.</span>{footer || <span>PROJECT ELEVEN <ArrowUpRight size={14} /></span>}</footer>
  </div>
);
export const ControlGuide = () => (
  <div className="control-guide">
    { [['W A S D', 'Move your player'], ['SHIFT', 'Sprint · watch your stamina'], ['E', 'Pass to a teammate'], ['SPACE', 'Hold for power · release to shoot'], ['Q', 'Make a tackle'], ['C', 'Switch camera'], ['P', 'Pause / resume'], ['ESC', 'Match menu']].map(([key, label]) => <div key={key}><kbd>{key}</kbd><span>{label}</span></div>) }
  </div>
);
