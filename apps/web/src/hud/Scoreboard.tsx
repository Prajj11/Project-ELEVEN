import React from 'react';
import { useMatchStore } from '../stores/matchStore';

export const Scoreboard: React.FC = () => {
  const currentSnapshot = useMatchStore((s) => s.currentSnapshot);

  const blueScore = currentSnapshot?.scores.blue ?? 0;
  const redScore = currentSnapshot?.scores.red ?? 0;
  const remainingSecs = Math.max(0, currentSnapshot?.remainingSeconds ?? 180);
  const phase = currentSnapshot?.phase ?? 'PLAYING';

  const minutes = Math.floor(remainingSecs / 60);
  const seconds = Math.floor(remainingSecs % 60);
  const timeFormatted = `${minutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}`;

  return (
    <div className="flex items-center gap-4 bg-slate-900/90 border border-slate-800/80 rounded-2xl px-6 py-2.5 shadow-2xl backdrop-blur-md">
      {/* Blue Team Score */}
      <div className="flex items-center gap-3">
        <span className="w-3.5 h-3.5 rounded-full bg-sky-500 shadow-md shadow-sky-500/50" />
        <span className="font-bold text-sky-400 tracking-wider text-sm">BLUE</span>
        <span className="font-black text-2xl text-slate-50 w-6 text-center">
          {blueScore}
        </span>
      </div>

      {/* Clock & Phase Divider */}
      <div className="flex flex-col items-center px-4 border-x border-slate-800">
        <span className="font-mono font-bold text-lg text-emerald-400 tracking-wider">
          {timeFormatted}
        </span>
        <span className="text-[10px] font-semibold tracking-widest uppercase text-slate-400">
          {phase === 'GOAL_PAUSE' ? 'GOAL!' : phase}
        </span>
      </div>

      {/* Red Team Score */}
      <div className="flex items-center gap-3">
        <span className="font-black text-2xl text-slate-50 w-6 text-center">
          {redScore}
        </span>
        <span className="font-bold text-rose-400 tracking-wider text-sm">RED</span>
        <span className="w-3.5 h-3.5 rounded-full bg-rose-500 shadow-md shadow-rose-500/50" />
      </div>
    </div>
  );
};
