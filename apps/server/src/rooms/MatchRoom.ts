import { Server, Socket } from 'socket.io';
import {
  MatchFinalResults,
  MatchSnapshot,
  PlayerActionPayload,
  PlayerInput,
  ROSTER_LIMITS,
  RoomPlayer,
  RoomState,
  SOCKET_EVENTS,
  TeamId,
} from '@project-eleven/shared';
import { MatchEngine } from '../game/MatchEngine';
import { PlayerAssignment } from '../game/MatchState';

export class MatchRoom {
  public players: RoomPlayer[] = [];
  public status: 'LOBBY' | 'IN_MATCH' | 'FINISHED' = 'LOBBY';
  public engine: MatchEngine | null = null;
  public createdAt: number = Date.now();

  constructor(
    public readonly roomId: string,
    public readonly roomCode: string,
    public hostSocketId: string,
    public readonly isSoloPractice: boolean,
    private io: Server
  ) {}

  public addPlayer(socketId: string, name: string): boolean {
    if (this.status !== 'LOBBY') return false;

    // Default team balance
    const blueCount = this.players.filter((p) => p.teamId === 'blue').length;
    const redCount = this.players.filter((p) => p.teamId === 'red').length;
    const teamId: TeamId = blueCount <= redCount ? 'blue' : 'red';

    const isHost = this.players.length === 0;

    this.players.push({
      socketId,
      name,
      teamId,
      isHost,
      isReady: this.isSoloPractice,
      isAI: false,
    });

    return true;
  }

  public removePlayer(socketId: string) {
    this.players = this.players.filter((p) => p.socketId !== socketId);
    if (this.players.length > 0 && !this.players.some((p) => p.isHost)) {
      this.players[0].isHost = true;
      this.hostSocketId = this.players[0].socketId;
    }
    if (this.status === 'LOBBY') {
      this.broadcastRoomState();
    }
  }

  public selectTeam(socketId: string, teamId: TeamId): boolean {
    const player = this.players.find((p) => p.socketId === socketId);
    if (!player || this.status !== 'LOBBY') return false;

    const teamCount = this.players.filter((p) => p.teamId === teamId).length;
    if (teamCount >= ROSTER_LIMITS.MAX_HUMANS_PER_TEAM) {
      return false;
    }

    player.teamId = teamId;
    this.broadcastRoomState();
    return true;
  }

  public toggleReady(socketId: string) {
    const player = this.players.find((p) => p.socketId === socketId);
    if (!player || this.status !== 'LOBBY') return;

    player.isReady = !player.isReady;
    this.broadcastRoomState();
  }

  public canStartMatch(): boolean {
    if (this.status !== 'LOBBY') return false;
    if (this.isSoloPractice) return true;

    // All connected human players must be ready
    return this.players.length > 0 && this.players.every((p) => p.isReady);
  }

  public startMatch() {
    this.status = 'IN_MATCH';

    // Build slot assignments for human players
    const assignments: PlayerAssignment[] = [];
    let blueHumanIdx = 2; // Human outfield slots start at #2 (#1 is AI GK)
    let redHumanIdx = 2;

    for (const player of this.players) {
      const assignedSlot =
        player.teamId === 'blue'
          ? `blue_${blueHumanIdx++}`
          : `red_${redHumanIdx++}`;

      player.assignedPlayerId = assignedSlot;
      assignments.push({
        socketId: player.socketId,
        name: player.name,
        teamId: player.teamId,
        playerId: assignedSlot,
      });

      // Notify player of their assigned slot
      this.io.to(player.socketId).emit(SOCKET_EVENTS.MATCH_STARTED, {
        matchId: this.roomId,
        assignedPlayerId: assignedSlot,
        teamId: player.teamId,
      });
    }

    // Instantiate MatchEngine
    this.engine = new MatchEngine(
      this.roomId,
      assignments,
      (snapshot: MatchSnapshot) => {
        this.io.to(this.roomId).emit(SOCKET_EVENTS.MATCH_SNAPSHOT, snapshot);
      },
      (event) => {
        this.io.to(this.roomId).emit(SOCKET_EVENTS.MATCH_EVENT, event);
      },
      (results: MatchFinalResults) => {
        this.status = 'FINISHED';
        this.io.to(this.roomId).emit(SOCKET_EVENTS.MATCH_ENDED, results);
      }
    );

    this.engine.start();
    this.broadcastRoomState();
  }

  public handleInput(socketId: string, input: PlayerInput) {
    if (!this.engine) return;
    const player = this.players.find((p) => p.socketId === socketId);
    if (player && player.assignedPlayerId) {
      this.engine.queueInput(player.assignedPlayerId, input);
    }
  }

  public handleAction(socketId: string, action: PlayerActionPayload) {
    if (!this.engine) return;
    const player = this.players.find((p) => p.socketId === socketId);
    if (player && player.assignedPlayerId) {
      this.engine.handleAction(player.assignedPlayerId, action);
    }
  }

  public broadcastRoomState() {
    const roomState: RoomState = {
      roomId: this.roomId,
      roomCode: this.roomCode,
      hostSocketId: this.hostSocketId,
      players: this.players,
      status: this.status,
      isSoloPractice: this.isSoloPractice,
      maxHumansPerTeam: ROSTER_LIMITS.MAX_HUMANS_PER_TEAM,
      createdAt: this.createdAt,
    };

    this.io.to(this.roomId).emit(SOCKET_EVENTS.ROOM_STATE, roomState);
  }
}
