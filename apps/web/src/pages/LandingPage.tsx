import React, { useState } from 'react';
import { Bot, Play, Sparkles, Trophy, Users, Zap } from 'lucide-react';
import { Button } from '../components/Button';
import { ConnectionIndicator } from '../components/ConnectionIndicator';
import { socketClient } from '../network/socketClient';
import { useLobbyStore } from '../stores/lobbyStore';

interface LandingPageProps {
  onEnterLobby: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterLobby }) => {
  const playerName = useLobbyStore((s) => s.playerName);
  const setPlayerName = useLobbyStore((s) => s.setPlayerName);
  const roomCodeInput = useLobbyStore((s) => s.roomCodeInput);
  const setRoomCodeInput = useLobbyStore((s) => s.setRoomCodeInput);
  const errorMessage = useLobbyStore((s) => s.errorMessage);
  const setErrorMessage = useLobbyStore((s) => s.setErrorMessage);

  const [isLoading, setIsLoading] = useState(false);

  const handleCreateRoom = async (isSolo: boolean = false) => {
    if (!playerName.trim()) {
      setErrorMessage('Please enter your player name');
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await socketClient.createRoom(playerName.trim(), isSolo);
      if (res.success) {
        onEnterLobby();
      } else {
        setErrorMessage(res.error || 'Failed to create room');
      }
    } catch {
      setErrorMessage('Network connection error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!playerName.trim()) {
      setErrorMessage('Please enter your player name');
      return;
    }
    if (!roomCodeInput.trim() || roomCodeInput.trim().length !== 6) {
      setErrorMessage('Room code must be 6 characters');
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await socketClient.joinRoom(
        roomCodeInput.trim().toUpperCase(),
        playerName.trim()
      );
      if (res.success) {
        onEnterLobby();
      } else {
        setErrorMessage(res.error || 'Room not found or full');
      }
    } catch {
      setErrorMessage('Network connection error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col justify-between p-6 sm:p-10 relative overflow-hidden select-none">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-sky-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-sky-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-black text-xl tracking-wider text-slate-100 flex items-center gap-2">
              PROJECT ELEVEN
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Agentic 5v5
              </span>
            </span>
            <p className="text-xs text-slate-400">3D Online Multiplayer Football Arena</p>
          </div>
        </div>

        <ConnectionIndicator />
      </header>

      {/* Main Content Card */}
      <main className="max-w-xl mx-auto w-full my-auto z-10 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl sm:text-5xl font-black text-slate-50 tracking-tight leading-tight">
            Play with Humans. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-emerald-400 to-teal-300">
              Coached by Tactical AI.
            </span>
          </h1>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Experience 5v5 real-time 3D association football with individual AI
            teammates and independent tactical LLM strategy engines.
          </p>
        </div>

        {/* Player Name Input */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-xl space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Player Name
            </label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your striker name..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 font-medium text-sm focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800/60 text-xs text-rose-300">
              {errorMessage}
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <Button
              variant="primary"
              size="lg"
              fullWidth
              disabled={isLoading}
              onClick={() => handleCreateRoom(true)}
              className="flex items-center gap-2"
            >
              <Bot className="w-4 h-4" />
              <span>Practice vs AI</span>
            </Button>

            <Button
              variant="blue"
              size="lg"
              fullWidth
              disabled={isLoading}
              onClick={() => handleCreateRoom(false)}
              className="flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              <span>Create Multiplayer</span>
            </Button>
          </div>

          {/* Join Room Form */}
          <div className="pt-3 border-t border-slate-800/80 flex gap-2">
            <input
              type="text"
              maxLength={6}
              value={roomCodeInput}
              onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
              placeholder="ROOM CODE"
              className="w-1/2 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-center font-mono font-bold tracking-widest text-slate-100 text-sm focus:outline-none focus:border-sky-500"
            />
            <Button
              variant="secondary"
              fullWidth
              disabled={isLoading}
              onClick={handleJoinRoom}
            >
              Join Room
            </Button>
          </div>
        </div>

        {/* Feature Highlights Chips */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/60">
            <Zap className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
            <h4 className="text-xs font-bold text-slate-200">60Hz Physics</h4>
            <p className="text-[10px] text-slate-400">Authoritative Ball</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/60">
            <Bot className="w-4 h-4 text-sky-400 mx-auto mb-1" />
            <h4 className="text-xs font-bold text-slate-200">Dual Tactical AI</h4>
            <p className="text-[10px] text-slate-400">LLM Strategies</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/60">
            <Users className="w-4 h-4 text-rose-400 mx-auto mb-1" />
            <h4 className="text-xs font-bold text-slate-200">5v5 Arena</h4>
            <p className="text-[10px] text-slate-400">Humans + Bots</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-slate-500 z-10">
        Project Eleven: Agentic Football Arena &copy; 2026. Built with Three.js, React & Socket.IO.
      </footer>
    </div>
  );
};
