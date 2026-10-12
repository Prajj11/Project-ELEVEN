import React from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { useLobbyStore } from '../stores/lobbyStore';
export const ConnectionIndicator = () => {
  const connecting = useLobbyStore(s => s.isConnecting);
  return <div className={`connection-indicator ${connecting ? 'connection-pending' : ''}`} role="status">
    {connecting ? <WifiOff size={13} /> : <Wifi size={13} />}
    <span>{connecting ? 'CONNECTING TO ARENA' : 'ARENA ONLINE'}</span>
  </div>;
};
