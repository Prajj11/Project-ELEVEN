import React, { useState } from 'react';
import { Bot, ChevronDown, ChevronUp, Cpu, ShieldAlert, Sparkles } from 'lucide-react';
import { useMatchStore } from '../stores/matchStore';

export const TacticalPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);
  const currentSnapshot = useMatchStore((s) => s.currentSnapshot);

  const blueTactics = currentSnapshot?.tactics.blue || {
    strategy: 'BALANCED',
    pressingIntensity: 0.5,
    explanation: 'Initial tactical baseline initialized.',
    isLLM: false,
  };

  const redTactics = currentSnapshot?.tactics.red || {
    strategy: 'BALANCED',
    pressingIntensity: 0.5,
    explanation: 'Initial tactical baseline initialized.',
    isLLM: false,
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl backdrop-blur-md overflow-hidden w-80 text-xs transition-all duration-200">
      {/* Header with Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-800/60 hover:bg-slate-800 transition-colors text-slate-200 font-semibold"
      >
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-emerald-400" />
          <span>Tactical Intelligence Panel</span>
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        )}
      </button>

      {/* Expanded Content */}
      {isOpen && (
        <div className="p-3.5 space-y-3.5">
          {/* Blue Team Strategy */}
          <div className="p-2.5 rounded-xl bg-sky-950/40 border border-sky-800/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sky-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-sky-400" />
                BLUE TACTICAL AGENT
              </span>
              <span className="px-2 py-0.5 rounded-md bg-sky-900/60 text-sky-300 font-mono text-[10px] uppercase font-bold border border-sky-700/50">
                {blueTactics.strategy}
              </span>
            </div>

            {/* Pressing Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>Pressing Intensity</span>
                <span>{Math.round(blueTactics.pressingIntensity * 100)}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-sky-500 rounded-full transition-all duration-500"
                  style={{ width: `${blueTactics.pressingIntensity * 100}%` }}
                />
              </div>
            </div>

            <p className="text-[11px] text-slate-300 italic bg-slate-900/60 p-2 rounded-lg border border-slate-800/60">
              "{blueTactics.explanation}"
            </p>
          </div>

          {/* Red Team Strategy */}
          <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-800/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-rose-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-400" />
                RED TACTICAL AGENT
              </span>
              <span className="px-2 py-0.5 rounded-md bg-rose-900/60 text-rose-300 font-mono text-[10px] uppercase font-bold border border-rose-700/50">
                {redTactics.strategy}
              </span>
            </div>

            {/* Pressing Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>Pressing Intensity</span>
                <span>{Math.round(redTactics.pressingIntensity * 100)}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-rose-500 rounded-full transition-all duration-500"
                  style={{ width: `${redTactics.pressingIntensity * 100}%` }}
                />
              </div>
            </div>

            <p className="text-[11px] text-slate-300 italic bg-slate-900/60 p-2 rounded-lg border border-slate-800/60">
              "{redTactics.explanation}"
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
