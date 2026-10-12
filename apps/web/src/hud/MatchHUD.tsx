import React, { useState, useEffect } from 'react';
import { LogOut, Pause, Play } from 'lucide-react';
import { useMatchStore } from '../stores/matchStore';
import { useLobbyStore } from '../stores/lobbyStore';
import { socketClient } from '../network/socketClient';
import { Scoreboard } from './Scoreboard';
import { TacticalPanel } from './TacticalPanel';
import { ConnectionIndicator } from '../components/ConnectionIndicator';

export const MatchHUD: React.FC = () => {
  const currentSnapshot = useMatchStore((s) => s.currentSnapshot);
  const assignedPlayerId = useMatchStore((s) => s.assignedPlayerId);
  const goalOverlayText = useMatchStore((s) => s.goalOverlayText);

  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const controlledPlayer = currentSnapshot?.players.find(
    (p) => p.id === assignedPlayerId
  );

  const stamina = controlledPlayer?.stamina ?? 100;
  const role = controlledPlayer?.role ?? 'FORWARD';
  const hasPossession = controlledPlayer?.hasPossession ?? false;
  const isPaused = currentSnapshot?.phase === 'PAUSED';

  // Listen to Escape key for exit modal, and P key for Pause/Resume
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        setShowExitConfirm((prev) => !prev);
      } else if (e.code === 'KeyP') {
        socketClient.togglePause();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleExitMatch = () => {
    socketClient.leaveRoom();
    useMatchStore.getState().resetMatch();
    useLobbyStore.getState().reset();
  };

  const handleTogglePause = () => {
    socketClient.togglePause();
  };

  return (
    <>
      <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 select-none z-10">
        {/* Top Header Row */}
        <div className="flex items-start justify-between w-full pointer-events-auto">
          <div className="flex items-center gap-3">
            <ConnectionIndicator />
            <div className="px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-xs text-slate-400 font-mono">
              ROLE: <span className="text-emerald-400 font-bold">{role}</span>
            </div>

            {/* Pause / Resume Button */}
            <button
              onClick={handleTogglePause}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all duration-150 active:scale-95 shadow-md ${
                isPaused
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400 shadow-emerald-950/40'
                  : 'bg-slate-900/90 hover:bg-slate-800 text-slate-300 border-slate-700'
              }`}
            >
              {isPaused ? <Play className="w-3.5 h-3.5 fill-white" /> : <Pause className="w-3.5 h-3.5" />}
              <span>{isPaused ? 'Resume Match' : 'Pause'}</span>
            </button>

            {/* Exit Match Button */}
            <button
              onClick={() => setShowExitConfirm(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-950/80 hover:bg-rose-900 border border-rose-800/80 text-xs text-rose-300 font-semibold transition-all duration-150 active:scale-95 shadow-md shadow-rose-950/40"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Exit Match</span>
            </button>
          </div>

          {/* Center Scoreboard */}
          <Scoreboard />

          {/* Tactical Observability Drawer */}
          <TacticalPanel />
        </div>

        {/* Big Match Paused Overlay Banner */}
        {isPaused && (
          <div className="self-center my-auto pointer-events-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="px-10 py-6 rounded-3xl bg-slate-900/95 border-2 border-amber-500 shadow-2xl shadow-amber-500/20 backdrop-blur-xl text-center space-y-4">
              <div className="flex items-center justify-center gap-2 text-amber-400">
                <Pause className="w-8 h-8" />
                <h1 className="text-3xl font-black tracking-widest uppercase">
                  MATCH PAUSED
                </h1>
              </div>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Simulation clock and player physics are frozen. Click resume to continue playing.
              </p>
              <button
                onClick={handleTogglePause}
                className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm tracking-wide shadow-lg shadow-emerald-950/50 border border-emerald-400 flex items-center gap-2 mx-auto transition-transform active:scale-95"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>RESUME MATCH</span>
              </button>
            </div>
          </div>
        )}

        {/* Goal Celebration Overlay */}
        {goalOverlayText && !isPaused && (
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
            <div className="flex items-center gap-1.5 text-slate-300">
              <kbd className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-[10px] font-mono text-amber-400">
                P
              </kbd>
              <span>Pause</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <kbd className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-[10px] font-mono text-slate-400">
                ESC
              </kbd>
              <span>Exit</span>
            </div>
          </div>

          {/* Right: Camera Notice */}
          <div className="text-right text-xs text-slate-400 bg-slate-900/80 px-4 py-2.5 rounded-xl border border-slate-800 backdrop-blur-md">
            <span className="text-slate-200 font-semibold">3D Follow Camera</span>
            <p className="text-[10px] text-slate-500">Auto-tracks action</p>
          </div>
        </div>
      </div>

      {/* Exit Confirmation Modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md pointer-events-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full mx-4 shadow-2xl text-center space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-950/80 border border-rose-800/80 text-rose-400 flex items-center justify-center mx-auto">
              <LogOut className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-100 tracking-wide">
                Exit Match?
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Are you sure you want to leave the active match? An AI bot will take your place.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
              >
                Stay in Match
              </button>
              <button
                onClick={handleExitMatch}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-950/50 border border-rose-500/40 transition-colors"
              >
                Yes, Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
