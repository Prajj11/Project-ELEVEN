import { Server, Socket } from 'socket.io';
import { generateRoomCode } from './RoomCode';
import { MatchRoom } from './MatchRoom';

export class RoomManager {
  private roomsById: Map<string, MatchRoom> = new Map();
  private roomsByCode: Map<string, MatchRoom> = new Map();
  private socketToRoom: Map<string, MatchRoom> = new Map();

  constructor(private io: Server) {}

  public createRoom(
    socket: Socket,
    playerName: string,
    isSoloPractice: boolean = false
  ): MatchRoom {
    // Leave previous room if any
    this.leaveRoom(socket);

    const roomId = 'room_' + Math.random().toString(36).substring(2, 9);
    let code = generateRoomCode();
    while (this.roomsByCode.has(code)) {
      code = generateRoomCode();
    }

    const room = new MatchRoom(
      roomId,
      code,
      socket.id,
      isSoloPractice,
      this.io
    );

    this.roomsById.set(roomId, room);
    this.roomsByCode.set(code, room);
    this.socketToRoom.set(socket.id, room);

    socket.join(roomId);
    room.addPlayer(socket.id, playerName);
    room.broadcastRoomState();

    console.log(
      `[RoomManager] Room created: ${roomId} (Code: ${code}) by ${playerName}`
    );
    return room;
  }

  public joinRoom(
    socket: Socket,
    roomCode: string,
    playerName: string
  ): { success: boolean; room?: MatchRoom; error?: string } {
    this.leaveRoom(socket);

    const room = this.roomsByCode.get(roomCode.toUpperCase());
    if (!room) {
      return { success: false, error: 'Room not found' };
    }

    if (room.status !== 'LOBBY') {
      return { success: false, error: 'Match already in progress' };
    }

    const added = room.addPlayer(socket.id, playerName);
    if (!added) {
      return { success: false, error: 'Failed to join room' };
    }

    this.socketToRoom.set(socket.id, room);
    socket.join(room.roomId);
    room.broadcastRoomState();

    console.log(
      `[RoomManager] Player ${playerName} (${socket.id}) joined room ${room.roomCode}`
    );
    return { success: true, room };
  }

  public leaveRoom(socket: Socket) {
    const room = this.socketToRoom.get(socket.id);
    if (!room) return;

    room.removePlayer(socket.id);
    socket.leave(room.roomId);
    this.socketToRoom.delete(socket.id);

    // If room is empty, clean up
    if (room.players.length === 0) {
      if (room.engine) {
        room.engine.stop();
      }
      this.roomsById.delete(room.roomId);
      this.roomsByCode.delete(room.roomCode);
      console.log(`[RoomManager] Room cleaned up: ${room.roomId}`);
    }
  }

  public getRoomForSocket(socketId: string): MatchRoom | undefined {
    return this.socketToRoom.get(socketId);
  }
}
