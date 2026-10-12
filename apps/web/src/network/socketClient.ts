import { io, Socket } from 'socket.io-client';
import {
  ClientToServerEvents,
  MatchFinalResults,
  MatchSnapshot,
  PlayerActionPayload,
  PlayerInput,
  RoomState,
  ServerToClientEvents,
  SOCKET_EVENTS,
  TeamId,
} from '@project-eleven/shared';
import { useLobbyStore } from '../stores/lobbyStore';
import { useMatchStore } from '../stores/matchStore';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

class SocketClient {
  private socket: AppSocket | null = null;

  public connect(): AppSocket {
    if (this.socket && this.socket.connected) {
      return this.socket;
    }

    this.socket = io(SERVER_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    this.setupListeners();
    return this.socket;
  }

  private setupListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('[Socket] Connected to server:', this.socket?.id);
      useLobbyStore.getState().setIsConnecting(false);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected from server:', reason);
      useLobbyStore.getState().setIsConnecting(true);
    });

    this.socket.on(SOCKET_EVENTS.ROOM_STATE, (roomState: RoomState) => {
      useLobbyStore.getState().setCurrentRoom(roomState);
    });

    this.socket.on(SOCKET_EVENTS.ROOM_ERROR, (error) => {
      useLobbyStore.getState().setErrorMessage(error.message);
    });

    this.socket.on(SOCKET_EVENTS.MATCH_STARTED, ({ matchId, assignedPlayerId, teamId }) => {
      useMatchStore.getState().setMatchStarted(matchId, assignedPlayerId, teamId);
    });

    this.socket.on(SOCKET_EVENTS.MATCH_SNAPSHOT, (snapshot: MatchSnapshot) => {
      useMatchStore.getState().updateSnapshot(snapshot);
    });

    this.socket.on(SOCKET_EVENTS.MATCH_EVENT, (event) => {
      useMatchStore.getState().addEvent(event);
      if (event.type === 'GOAL') {
        useMatchStore.getState().showGoalOverlay(event.description);
        setTimeout(() => {
          useMatchStore.getState().hideGoalOverlay();
        }, 3000);
      }
    });

    this.socket.on(SOCKET_EVENTS.MATCH_ENDED, (results: MatchFinalResults) => {
      useMatchStore.getState().setFinalResults(results);
    });

    this.socket.on(SOCKET_EVENTS.SERVER_ERROR, (err) => {
      console.error('[Socket Error]', err);
      useLobbyStore.getState().setErrorMessage(err.message);
    });
  }

  public getSocket(): AppSocket | null {
    return this.socket;
  }

  public createRoom(
    playerName: string,
    isSoloPractice: boolean = false
  ): Promise<{ success: boolean; roomId?: string; error?: string }> {
    return new Promise((resolve) => {
      const socket = this.connect();
      socket.emit(
        SOCKET_EVENTS.ROOM_CREATE,
        { playerName, isSoloPractice },
        (res) => {
          resolve(res);
        }
      );
    });
  }

  public joinRoom(
    roomCode: string,
    playerName: string
  ): Promise<{ success: boolean; roomId?: string; error?: string }> {
    return new Promise((resolve) => {
      const socket = this.connect();
      socket.emit(
        SOCKET_EVENTS.ROOM_JOIN,
        { roomCode, playerName },
        (res) => {
          resolve(res);
        }
      );
    });
  }

  public selectTeam(teamId: TeamId) {
    this.socket?.emit(SOCKET_EVENTS.ROOM_SELECT_TEAM, { teamId });
  }

  public toggleReady() {
    this.socket?.emit(SOCKET_EVENTS.ROOM_TOGGLE_READY);
  }

  public startMatch() {
    this.socket?.emit(SOCKET_EVENTS.ROOM_START_MATCH);
  }

  public leaveRoom() {
    this.socket?.emit(SOCKET_EVENTS.ROOM_LEAVE);
    useLobbyStore.getState().reset();
  }

  public sendInput(input: PlayerInput) {
    this.socket?.emit(SOCKET_EVENTS.INPUT_UPDATE, input);
  }

  public performAction(action: PlayerActionPayload) {
    this.socket?.emit(SOCKET_EVENTS.ACTION_PERFORM, action);
  }
}

export const socketClient = new SocketClient();
