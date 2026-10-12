import {
  MatchFinalResults,
  MatchSnapshot,
  PlayerActionPayload,
  PlayerInput,
  RoomState,
  TeamId,
} from './types';

export const SOCKET_EVENTS = {
  // Client -> Server
  ROOM_CREATE: 'room:create',
  ROOM_JOIN: 'room:join',
  ROOM_LEAVE: 'room:leave',
  ROOM_SELECT_TEAM: 'room:select-team',
  ROOM_TOGGLE_READY: 'room:toggle-ready',
  ROOM_START_MATCH: 'room:start-match',
  INPUT_UPDATE: 'input:update',
  ACTION_PERFORM: 'action:perform',
  MATCH_REQUEST_RESYNC: 'match:request-resync',

  // Server -> Client
  ROOM_STATE: 'room:state',
  ROOM_ERROR: 'room:error',
  MATCH_STARTED: 'match:started',
  MATCH_SNAPSHOT: 'match:snapshot',
  MATCH_EVENT: 'match:event',
  MATCH_ENDED: 'match:ended',
  SERVER_ERROR: 'server:error',
} as const;

export interface ClientToServerEvents {
  [SOCKET_EVENTS.ROOM_CREATE]: (
    payload: { playerName: string; isSoloPractice?: boolean },
    callback: (response: { success: boolean; roomId?: string; error?: string }) => void
  ) => void;
  [SOCKET_EVENTS.ROOM_JOIN]: (
    payload: { roomCode: string; playerName: string },
    callback: (response: { success: boolean; roomId?: string; error?: string }) => void
  ) => void;
  [SOCKET_EVENTS.ROOM_LEAVE]: () => void;
  [SOCKET_EVENTS.ROOM_SELECT_TEAM]: (payload: { teamId: TeamId }) => void;
  [SOCKET_EVENTS.ROOM_TOGGLE_READY]: () => void;
  [SOCKET_EVENTS.ROOM_START_MATCH]: () => void;
  [SOCKET_EVENTS.INPUT_UPDATE]: (payload: PlayerInput) => void;
  [SOCKET_EVENTS.ACTION_PERFORM]: (payload: PlayerActionPayload) => void;
  [SOCKET_EVENTS.MATCH_REQUEST_RESYNC]: () => void;
}

export interface ServerToClientEvents {
  [SOCKET_EVENTS.ROOM_STATE]: (roomState: RoomState) => void;
  [SOCKET_EVENTS.ROOM_ERROR]: (error: { message: string }) => void;
  [SOCKET_EVENTS.MATCH_STARTED]: (payload: {
    matchId: string;
    assignedPlayerId: string;
    teamId: TeamId;
  }) => void;
  [SOCKET_EVENTS.MATCH_SNAPSHOT]: (snapshot: MatchSnapshot) => void;
  [SOCKET_EVENTS.MATCH_EVENT]: (event: {
    type: string;
    description: string;
    timestamp: number;
  }) => void;
  [SOCKET_EVENTS.MATCH_ENDED]: (results: MatchFinalResults) => void;
  [SOCKET_EVENTS.SERVER_ERROR]: (error: { code: string; message: string }) => void;
}
