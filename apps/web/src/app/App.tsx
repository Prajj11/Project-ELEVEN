import React, { useState, useEffect } from 'react';
import { useMatchStore } from '../stores/matchStore';
import { useLobbyStore } from '../stores/lobbyStore';
import { LandingPage } from '../pages/LandingPage';
import { LobbyPage } from '../pages/LobbyPage';
import { MatchPage } from '../pages/MatchPage';
import { ResultsPage } from '../pages/ResultsPage';
import { socketClient } from '../network/socketClient';

type ViewState = 'LANDING' | 'LOBBY' | 'MATCH' | 'RESULTS';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('LANDING');

  const matchId = useMatchStore((s) => s.matchId);
  const finalResults = useMatchStore((s) => s.finalResults);
  const currentRoom = useLobbyStore((s) => s.currentRoom);

  // Initialize socket connection on startup
  useEffect(() => {
    socketClient.connect();
  }, []);

  // Sync view based on match/room state
  useEffect(() => {
    if (finalResults) {
      setCurrentView('RESULTS');
    } else if (matchId) {
      setCurrentView('MATCH');
    } else if (currentRoom) {
      setCurrentView('LOBBY');
    } else {
      setCurrentView('LANDING');
    }
  }, [matchId, finalResults, currentRoom]);

  switch (currentView) {
    case 'MATCH':
      return <MatchPage />;
    case 'RESULTS':
      return <ResultsPage onReturnToLobby={() => setCurrentView('LOBBY')} />;
    case 'LOBBY':
      return <LobbyPage onLeaveLobby={() => setCurrentView('LANDING')} />;
    case 'LANDING':
    default:
      return <LandingPage onEnterLobby={() => setCurrentView('LOBBY')} />;
  }
};

export default App;
