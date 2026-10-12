import React from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { useLobbyStore } from '../stores/lobbyStore';

export const ConnectionIndicator: React.FC = () => {
  const isConnecting = useLobbyStore((s) => s.isConnecting);

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-xs text-slate-300 backdrop-blur-md">
      {isConnecting ? (
        <>
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          <WifiOff className="w-3.5 h-3.5 text-amber-400" />
          <span>Connecting to Server...</span>
        </>
      ) : (
        <>
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <Wifi className="w-3.5 h-3.5 text-emerald-400" />
          <span>Server Online</span>
        </>
      )}
    </div>
  );
};
