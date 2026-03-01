import type { HermesClient } from "../core/HermesClient";
import type {
  Room,
  CreateDirectRoomInput,
  CreateGroupRoomInput,
} from "../types/index";

// ── Rooms Module ──────────────────────────────────────────────────────────────
// Framework-agnostic wrapper around HermesClient room methods.
// Usage:
//   const rooms = new Rooms(client);
//   const room = await rooms.createDirect({ targetUserId: "..." });

export class Rooms {
  constructor(private client: HermesClient) {}

  list(): Promise<Room[]> {
    return this.client.getRooms();
  }

  createDirect(input: CreateDirectRoomInput): Promise<Room> {
    return this.client.createDirectRoom(input);
  }

  createGroup(input: CreateGroupRoomInput): Promise<Room> {
    return this.client.createGroupRoom(input);
  }

  delete(roomId: string): Promise<void> {
    return this.client.deleteRoom(roomId);
  }

  addMember(roomId: string, userId: string): Promise<void> {
    return this.client.addMember(roomId, userId);
  }

  removeMember(roomId: string, userId: string): Promise<void> {
    return this.client.removeMember(roomId, userId);
  }

  onCreated(callback: (room: Room) => void): () => void {
    this.client.on("room:created", callback);
    return () => this.client.off("room:created", callback);
  }

  onDeleted(callback: (data: { roomId: string }) => void): () => void {
    this.client.on("room:deleted", callback);
    return () => this.client.off("room:deleted", callback);
  }

  onMemberJoined(
    callback: (data: { roomId: string; userId: string }) => void,
  ): () => void {
    this.client.on("room:member:joined", callback);
    return () => this.client.off("room:member:joined", callback);
  }

  onMemberLeft(
    callback: (data: { roomId: string; userId: string }) => void,
  ): () => void {
    this.client.on("room:member:left", callback);
    return () => this.client.off("room:member:left", callback);
  }
}
