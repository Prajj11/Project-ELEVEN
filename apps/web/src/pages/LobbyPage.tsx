import React, { useState } from 'react';
import { Bot, Check, Copy, LogOut, Play, Shield, Users } from 'lucide-react';
import { Button } from '../components/Button';
import { socketClient } from '../network/socketClient';
import { useLobbyStore } from '../stores/lobbyStore';

interface LobbyPageProps {
  onLeaveLobby: () => void;
}

export const LobbyPage: React.FC<LobbyPageProps> = ({ onLeaveLobby }) => {
  const currentRoom = useLobbyStore((s) => s.currentRoom);
  const selectedTeam = useLobbyStore((s) => s.selectedTeam);
  const setSelectedTeam = useLobbyStore((s) => s.setSelectedTeam);
  const isReady = useLobbyStore((s) => s.isReady);
  const setIsReady = useLobbyStore((s) => s.setIsReady);
  const [copied, setCopied] = useState(false);

  if (!currentRoom) {
    return null;
  }

  const isHost = currentRoom.players.some(
    (p) => p.isHost && p.socketId === socketClient.getSocket()?.id
  );

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentRoom.roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSelectTeam = (teamId: 'blue' | 'red') => {
    setSelectedTeam(teamId);
    socketClient.selectTeam(teamId);
  };

  const handleToggleReady = () => {
    setIsReady(!isReady);
    socketClient.toggleReady();
  };

  const handleStartMatch = () => {
    socketClient.startMatch();
  };

  const handleLeave = () => {
    socketClient.leaveRoom();
    onLeaveLobby();
  };

  // Divide players by team
  const bluePlayers = currentRoom.players.filter((p) => p.teamId === 'blue');
  const redPlayers = currentRoom.players.filter((p) => p.teamId === 'red');

  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col justify-between p-6 sm:p-10 select-none">
      {/* Header with Room Code */}
      <header className="flex items-center justify-between border-b border-slate-800 pb-5">
        <div>
          <h2 className="text-xl font-black text-slate-100 tracking-wider">
            LOBBY ROOM
          </h2>
          <p className="text-xs text-slate-400">
            {currentRoom.isSoloPractice
              ? 'Solo Practice against AI Bots'
              : 'Multiplayer 5v5 Match'}
          </p>
        </div>

        {/* Room Code Chip */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2">
            <span className="text-xs text-slate-400 font-semibold">CODE:</span>
            <span className="font-mono font-black text-lg text-emerald-400 tracking-widest">
              {currentRoom.roomCode}
            </span>
            <button
              onClick={handleCopyCode}
              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            >
              {copied ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>

          <Button variant="outline" size="sm" onClick={handleLeave}>
            <LogOut className="w-4 h-4 mr-1.5" />
            Leave
          </Button>
        </div>
      </header>

      {/* Team Rosters Grid */}
      <main className="grid grid-cols-1 md:grid-cols-2 gap-6 my-auto max-w-5xl mx-auto w-full py-6">
        {/* Blue Team Card */}
        <div className="bg-slate-900/80 border border-sky-900/50 rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between border-b border-sky-950 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-sky-500 shadow-md shadow-sky-500/50" />
              <h3 className="font-black text-lg text-sky-400 tracking-wider">
                BLUE TEAM
              </h3>
            </div>
            <Button
              variant="blue"
              size="sm"
              disabled={selectedTeam === 'blue'}
              onClick={() => handleSelectTeam('blue')}
            >
              {selectedTeam === 'blue' ? 'Joined' : 'Join Blue'}
            </Button>
          </div>

          {/* Roster Slots (5 total) */}
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, index) => {
              const player = bluePlayers[index];
              const isGK = index === 0;

              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 font-mono font-bold text-slate-500 text-center">
                      #{index + 1}
                    </span>
                    <span className="font-semibold text-slate-200">
                      {player
                        ? player.name
                        : isGK
                        ? 'AI Goalkeeper'
                        : `AI Outfield Bot ${index}`}
                    </span>
                    {isGK && (
                      <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                        GK
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {player ? (
                      player.isReady ? (
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Ready
                        </span>
                      ) : (
                        <span className="text-amber-400">Waiting</span>
                      )
                    ) : (
                      <span className="text-slate-500 flex items-center gap-1">
                        <Bot className="w-3 h-3" /> Auto-AI
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Red Team Card */}
        <div className="bg-slate-900/80 border border-rose-900/50 rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between border-b border-rose-950 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-rose-500 shadow-md shadow-rose-500/50" />
              <h3 className="font-black text-lg text-rose-400 tracking-wider">
                RED TEAM
              </h3>
            </div>
            <Button
              variant="red"
              size="sm"
              disabled={selectedTeam === 'red'}
              onClick={() => handleSelectTeam('red')}
            >
              {selectedTeam === 'red' ? 'Joined' : 'Join Red'}
            </Button>
          </div>

          {/* Roster Slots (5 total) */}
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, index) => {
              const player = redPlayers[index];
              const isGK = index === 0;

              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 font-mono font-bold text-slate-500 text-center">
                      #{index + 1}
                    </span>
                    <span className="font-semibold text-slate-200">
                      {player
                        ? player.name
                        : isGK
                        ? 'AI Goalkeeper'
                        : `AI Outfield Bot ${index}`}
                    </span>
                    {isGK && (
                      <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[10px] font-bold">
                        GK
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {player ? (
                      player.isReady ? (
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Ready
                        </span>
                      ) : (
                        <span className="text-amber-400">Waiting</span>
                      )
                    ) : (
                      <span className="text-slate-500 flex items-center gap-1">
                        <Bot className="w-3 h-3" /> Auto-AI
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Footer Controls */}
      <footer className="flex items-center justify-between border-t border-slate-800 pt-5">
        <div className="text-xs text-slate-400">
          Unfilled slots will automatically be commanded by{' '}
          <span className="text-emerald-400 font-semibold">Deterministic 60Hz AI</span>.
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant={isReady ? 'secondary' : 'primary'}
            size="lg"
            onClick={handleToggleReady}
          >
            {isReady ? 'Cancel Ready' : 'Ready Up'}
          </Button>

          {isHost && (
            <Button
              variant="primary"
              size="lg"
              onClick={handleStartMatch}
              className="flex items-center gap-2 shadow-emerald-500/40"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Start Match</span>
            </Button>
          )}
        </div>
      </footer>
    </div>
  );
};
