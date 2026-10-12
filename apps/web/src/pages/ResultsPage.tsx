import React from 'react';
import { RotateCcw, Trophy, Users } from 'lucide-react';
import { Button } from '../components/Button';
import { useMatchStore } from '../stores/matchStore';

interface ResultsPageProps {
  onReturnToLobby: () => void;
}

export const ResultsPage: React.FC<ResultsPageProps> = ({ onReturnToLobby }) => {
  const finalResults = useMatchStore((s) => s.finalResults);
  const resetMatch = useMatchStore((s) => s.resetMatch);

  if (!finalResults) {
    return null;
  }

  const { winner, scores, stats } = finalResults;

  const handleReturn = () => {
    resetMatch();
    onReturnToLobby();
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col justify-between p-6 sm:p-10 select-none">
      <main className="max-w-2xl mx-auto w-full my-auto space-y-6">
        {/* Match Outcome Card */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-500 to-sky-400 mx-auto flex items-center justify-center shadow-2xl shadow-emerald-500/50">
            <Trophy className="w-8 h-8 text-white" />
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-slate-100 tracking-wider uppercase">
            {winner === 'draw'
              ? 'MATCH TIED — DRAW!'
              : `${winner.toUpperCase()} TEAM VICTORY!`}
          </h1>

          {/* Big Score Display */}
          <div className="flex items-center justify-center gap-6 bg-slate-900/90 border border-slate-800 rounded-2xl py-4 px-8 w-fit mx-auto shadow-2xl">
            <div className="flex items-center gap-3">
              <span className="font-black text-sky-400 text-lg">BLUE</span>
              <span className="text-4xl font-black text-white">{scores.blue}</span>
            </div>
            <span className="text-slate-600 font-bold text-2xl">-</span>
            <div className="flex items-center gap-3">
              <span className="text-4xl font-black text-white">{scores.red}</span>
              <span className="font-black text-rose-400 text-lg">RED</span>
            </div>
          </div>
        </div>

        {/* Real Statistics Comparison Table */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-md space-y-4">
          <h3 className="font-bold text-xs uppercase tracking-widest text-slate-400 text-center">
            OFFICIAL MATCH STATISTICS
          </h3>

          <div className="space-y-3 text-xs">
            {/* Possession % */}
            <div className="space-y-1">
              <div className="flex justify-between font-semibold">
                <span className="text-sky-400">{stats.blue.possessionPercentage}%</span>
                <span className="text-slate-400">Possession</span>
                <span className="text-rose-400">{stats.red.possessionPercentage}%</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full flex overflow-hidden">
                <div
                  className="bg-sky-500 h-full"
                  style={{ width: `${stats.blue.possessionPercentage}%` }}
                />
                <div
                  className="bg-rose-500 h-full"
                  style={{ width: `${stats.red.possessionPercentage}%` }}
                />
              </div>
            </div>

            {/* Shots */}
            <div className="flex justify-between items-center py-2 border-b border-slate-800/60">
              <span className="font-bold text-sky-400 w-12">{stats.blue.shots}</span>
              <span className="text-slate-400 font-medium">Total Shots</span>
              <span className="font-bold text-rose-400 w-12 text-right">{stats.red.shots}</span>
            </div>

            {/* Shots on Target */}
            <div className="flex justify-between items-center py-2 border-b border-slate-800/60">
              <span className="font-bold text-sky-400 w-12">{stats.blue.shotsOnTarget}</span>
              <span className="text-slate-400 font-medium">Shots on Target</span>
              <span className="font-bold text-rose-400 w-12 text-right">{stats.red.shotsOnTarget}</span>
            </div>

            {/* Passes Completed */}
            <div className="flex justify-between items-center py-2 border-b border-slate-800/60">
              <span className="font-bold text-sky-400 w-12">{stats.blue.passesCompleted}</span>
              <span className="text-slate-400 font-medium">Passes Completed</span>
              <span className="font-bold text-rose-400 w-12 text-right">{stats.red.passesCompleted}</span>
            </div>

            {/* Tackles Won */}
            <div className="flex justify-between items-center py-2 border-b border-slate-800/60">
              <span className="font-bold text-sky-400 w-12">{stats.blue.tacklesWon}</span>
              <span className="text-slate-400 font-medium">Tackles Won</span>
              <span className="font-bold text-rose-400 w-12 text-right">{stats.red.tacklesWon}</span>
            </div>

            {/* Goalkeeper Saves */}
            <div className="flex justify-between items-center py-2">
              <span className="font-bold text-sky-400 w-12">{stats.blue.saves}</span>
              <span className="text-slate-400 font-medium">Goalkeeper Saves</span>
              <span className="font-bold text-rose-400 w-12 text-right">{stats.red.saves}</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-center gap-4">
          <Button variant="primary" size="lg" onClick={handleReturn}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Return to Lobby
          </Button>
        </div>
      </main>
    </div>
  );
};
