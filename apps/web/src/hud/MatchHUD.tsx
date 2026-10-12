import React from 'react';
import { useMatchStore } from '../stores/matchStore';
import { Scoreboard } from './Scoreboard';
import { TacticalPanel } from './TacticalPanel';
import { ConnectionIndicator } from '../components/ConnectionIndicator';

export const MatchHUD: React.FC = () => {
  const currentSnapshot = useMatchStore((s) => s.currentSnapshot);
  const assignedPlayerId = useMatchStore((s) => s.assignedPlayerId);
  const goalOverlayText = useMatchStore((s) => s.goalOverlayText);

  const controlledPlayer = currentSnapshot?.players.find(
    (p) => p.id === assignedPlayerId
  );

  const stamina = controlledPlayer?.stamina ?? 100;
  const role = controlledPlayer?.role ?? 'FORWARD';
  const hasPossession = controlledPlayer?.hasPossession ?? false;

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 select-none z-10">
      {/* Top Header Row */}
      <div className="flex items-start justify-between w-full pointer-events-auto">
        <div className="flex items-center gap-3">
          <ConnectionIndicator />
          <div className="px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-xs text-slate-400 font-mono">
            ROLE: <span className="text-emerald-400 font-bold">{role}</span>
          </div>
        </div>

        {/* Center Scoreboard */}
        <Scoreboard />

        {/* Tactical Observability Drawer */}
        <TacticalPanel />
      </div>

      {/* Goal Celebration Overlay */}
      {goalOverlayText && (
        <div className="self-center my-auto animate-bounce pointer-events-none">
          <div className="px-10 py-5 rounded-3xl bg-emerald-600/95 border-2 border-emerald-400 shadow-2xl shadow-emerald-500/50 backdrop-blur-lg text-center">
            <h1 className="text-4xl font-black text-white tracking-widest uppercase drop-shadow-md">
              ⚽ GOAL! ⚽
            </h1>
            <p className="text-lg font-bold text-emerald-100 mt-1">
              {goalOverlayText}
            </p>
          </div>
        </div>
      )}

      {/* Bottom Controls & Stamina HUD */}
      <div className="flex items-end justify-between w-full pointer-events-auto">
        {/* Left: Player Stamina & Ball Status */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-2xl backdrop-blur-md w-72 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300">Stamina</span>
            <span className="font-mono font-bold text-emerald-400">
              {Math.round(stamina)}%
            </span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-150 ${
                stamina > 30 ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
              style={{ width: `${stamina}%` }}
            />
          </div>

          <div className="pt-1 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Possession:</span>
            {hasPossession ? (
              <span className="font-bold text-amber-400 animate-pulse">
                YOU HAVE THE BALL
              </span>
            ) : (
              <span className="text-slate-500">Contested</span>
            )}
          </div>
        </div>

        {/* Center: Quick Action Key Bindings */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl px-6 py-3 shadow-2xl backdrop-blur-md flex items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5 text-slate-300">
            <kbd className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-[10px] font-mono text-emerald-400">
              WASD
            </kbd>
            <span>Move</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <kbd className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-[10px] font-mono text-emerald-400">
              SHIFT
            </kbd>
            <span>Sprint</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <kbd className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-[10px] font-mono text-sky-400">
              E
            </kbd>
            <span>Pass</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <kbd className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-[10px] font-mono text-emerald-400">
              SPACE
            </kbd>
            <span>Shoot</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <kbd className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-[10px] font-mono text-rose-400">
              Q
            </kbd>
            <span>Tackle</span>
          </div>
        </div>

        {/* Right: Camera Notice */}
        <div className="text-right text-xs text-slate-400 bg-slate-900/80 px-4 py-2.5 rounded-xl border border-slate-800 backdrop-blur-md">
          <span className="text-slate-200 font-semibold">3D Follow Camera</span>
          <p className="text-[10px] text-slate-500">Auto-tracks action</p>
        </div>
      </div>
    </div>
  );
};
