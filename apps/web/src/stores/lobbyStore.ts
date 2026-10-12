import { create } from 'zustand';
import { RoomState, TeamId } from '@project-eleven/shared';

interface LobbyStoreState {
  playerName: string;
  roomCodeInput: string;
  currentRoom: RoomState | null;
  selectedTeam: TeamId;
  isReady: boolean;
  isConnecting: boolean;
  errorMessage: string | null;
  setPlayerName: (name: string) => void;
  setRoomCodeInput: (code: string) => void;
  setCurrentRoom: (room: RoomState | null) => void;
  setSelectedTeam: (team: TeamId) => void;
  setIsReady: (ready: boolean) => void;
  setIsConnecting: (connecting: boolean) => void;
  setErrorMessage: (msg: string | null) => void;
  reset: () => void;
}

export const useLobbyStore = create<LobbyStoreState>((set) => ({
  playerName: 'Striker_' + Math.floor(100 + Math.random() * 900),
  roomCodeInput: '',
  currentRoom: null,
  selectedTeam: 'blue',
  isReady: false,
  isConnecting: false,
  errorMessage: null,
  setPlayerName: (playerName) => set({ playerName }),
  setRoomCodeInput: (roomCodeInput) => set({ roomCodeInput }),
  setCurrentRoom: (currentRoom) => set({ currentRoom }),
  setSelectedTeam: (selectedTeam) => set({ selectedTeam }),
  setIsReady: (isReady) => set({ isReady }),
  setIsConnecting: (isConnecting) => set({ isConnecting }),
  setErrorMessage: (errorMessage) => set({ errorMessage }),
  reset: () =>
    set({
      currentRoom: null,
      isReady: false,
      isConnecting: false,
      errorMessage: null,
    }),
}));
