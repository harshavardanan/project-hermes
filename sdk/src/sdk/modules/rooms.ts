import type { HermesClient } from "../core/HermesClient.js";
import type {
  Room,
  CreateDirectRoomInput,
  CreateGroupRoomInput,
} from "../types/index.js";

// ── Rooms Module ──────────────────────────────────────────────────────────────
// Usage:
//   const rooms = new Rooms(client);
//   const room = await rooms.createDirect({ targetUserId: "..." });

export class Rooms {
  constructor(private client: HermesClient) {}

  // Get all rooms for the current user
  list(): Promise<Room[]> {
    return this.client.getRooms();
  }

  // Create a 1-1 direct room
  createDirect(input: CreateDirectRoomInput): Promise<Room> {
    return this.client.createDirectRoom(input);
  }

  // Create a group room
  createGroup(input: CreateGroupRoomInput): Promise<Room> {
    return this.client.createGroupRoom(input);
  }

  // Delete a room (admin only for groups)
  delete(roomId: string): Promise<void> {
    return this.client.deleteRoom(roomId);
  }

  // Add a member to a group
  addMember(roomId: string, userId: string): Promise<void> {
    return this.client.addMember(roomId, userId);
  }

  // Remove a member from a group
  removeMember(roomId: string, userId: string): Promise<void> {
    return this.client.removeMember(roomId, userId);
  }

  // Listen for new rooms created
  onCreated(callback: (room: Room) => void): () => void {
    this.client.on("room:created", callback);
    return () => this.client.off("room:created", callback);
  }

  // Listen for rooms deleted
  onDeleted(callback: (data: { roomId: string }) => void): () => void {
    this.client.on("room:deleted", callback);
    return () => this.client.off("room:deleted", callback);
  }

  // Listen for member joining
  onMemberJoined(
    callback: (data: { roomId: string; userId: string }) => void,
  ): () => void {
    this.client.on("room:member:joined", callback);
    return () => this.client.off("room:member:joined", callback);
  }

  // Listen for member leaving
  onMemberLeft(
    callback: (data: { roomId: string; userId: string }) => void,
  ): () => void {
    this.client.on("room:member:left", callback);
    return () => this.client.off("room:member:left", callback);
  }
}
