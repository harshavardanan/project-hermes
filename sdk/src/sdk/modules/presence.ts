import type { HermesClient } from "../core/HermesClient";
import type { PresenceEvent, LastSeenEvent } from "../types/index";

// ── Presence Module ───────────────────────────────────────────────────────────
// Tracks who is online/offline across rooms.
// Usage:
//   const presence = new Presence(client);
//   presence.onOnline((e) => console.log(e.userId, "is online"));

export class Presence {
  // Map of userId → isOnline
  private onlineUsers = new Map<string, boolean>();

  constructor(private client: HermesClient) {
    // Keep internal map in sync
    this.client.on("user:online", ({ userId }) => {
      this.onlineUsers.set(userId, true);
    });
    this.client.on("user:offline", ({ userId }) => {
      this.onlineUsers.set(userId, false);
    });
  }

  // Check if a specific user is online
  isOnline(userId: string): boolean {
    return this.onlineUsers.get(userId) ?? false;
  }

  // Get all currently tracked online user IDs
  getOnlineUsers(): string[] {
    return Array.from(this.onlineUsers.entries())
      .filter(([, online]) => online)
      .map(([userId]) => userId);
  }

  // Manually ping presence in a room
  ping(roomId: string): void {
    this.client.pingPresence(roomId);
  }

  // Listen for user coming online
  onOnline(callback: (event: PresenceEvent) => void): () => void {
    this.client.on("user:online", callback);
    return () => this.client.off("user:online", callback);
  }

  // Listen for user going offline
  onOffline(callback: (event: LastSeenEvent) => void): () => void {
    this.client.on("user:offline", callback);
    return () => this.client.off("user:offline", callback);
  }
}
