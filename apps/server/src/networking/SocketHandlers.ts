import { Server, Socket } from 'socket.io';
import {
  createRoomSchema,
  joinRoomSchema,
  playerActionSchema,
  playerInputSchema,
  selectTeamSchema,
  SOCKET_EVENTS,
} from '@project-eleven/shared';
import { RoomManager } from '../rooms/RoomManager';

export const registerSocketHandlers = (io: Server, roomManager: RoomManager) => {
  io.on('connection', (socket: Socket) => {
    // 1. Create Room
    socket.on(SOCKET_EVENTS.ROOM_CREATE, (data, callback) => {
      try {
        const validated = createRoomSchema.parse(data);
        const room = roomManager.createRoom(
          socket,
          validated.playerName,
          validated.isSoloPractice
        );
        if (callback) {
          callback({ success: true, roomId: room.roomId });
        }
      } catch (err) {
        if (callback) {
          callback({ success: false, error: (err as Error).message });
        }
      }
    });

    // 2. Join Room
    socket.on(SOCKET_EVENTS.ROOM_JOIN, (data, callback) => {
      try {
        const validated = joinRoomSchema.parse(data);
        const result = roomManager.joinRoom(
          socket,
          validated.roomCode,
          validated.playerName
        );
        if (callback) {
          callback(result);
        }
      } catch (err) {
        if (callback) {
          callback({ success: false, error: (err as Error).message });
        }
      }
    });

    // 3. Leave Room
    socket.on(SOCKET_EVENTS.ROOM_LEAVE, () => {
      roomManager.leaveRoom(socket);
    });

    // 4. Select Team
    socket.on(SOCKET_EVENTS.ROOM_SELECT_TEAM, (data) => {
      try {
        const validated = selectTeamSchema.parse(data);
        const room = roomManager.getRoomForSocket(socket.id);
        if (room) {
          room.selectTeam(socket.id, validated.teamId);
        }
      } catch (err) {
        socket.emit(SOCKET_EVENTS.ROOM_ERROR, { message: (err as Error).message });
      }
    });

    // 5. Toggle Ready
    socket.on(SOCKET_EVENTS.ROOM_TOGGLE_READY, () => {
      const room = roomManager.getRoomForSocket(socket.id);
      if (room) {
        room.toggleReady(socket.id);
      }
    });

    // 6. Start Match
    socket.on(SOCKET_EVENTS.ROOM_START_MATCH, () => {
      const room = roomManager.getRoomForSocket(socket.id);
      if (room && room.hostSocketId === socket.id) {
        if (room.canStartMatch()) {
          room.startMatch();
        } else {
          socket.emit(SOCKET_EVENTS.ROOM_ERROR, {
            message: 'All players must be ready before starting match.',
          });
        }
      }
    });

    // 7. Input Update
    socket.on(SOCKET_EVENTS.INPUT_UPDATE, (data) => {
      try {
        const validated = playerInputSchema.parse(data);
        const room = roomManager.getRoomForSocket(socket.id);
        if (room) {
          room.handleInput(socket.id, validated);
        }
      } catch {
        // Silently drop malformed inputs
      }
    });

    // 8. Action Perform (Pass, Shoot, Tackle)
    socket.on(SOCKET_EVENTS.ACTION_PERFORM, (data) => {
      try {
        const validated = playerActionSchema.parse(data);
        const room = roomManager.getRoomForSocket(socket.id);
        if (room) {
          room.handleAction(socket.id, validated);
        }
      } catch {
        // Drop malformed actions
      }
    });

    // 9. Disconnect
    socket.on('disconnect', () => {
      roomManager.leaveRoom(socket);
    });
  });
};
