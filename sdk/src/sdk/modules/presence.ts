import type { HermesClient } from "../core/HermesClient";
import type { PresenceEvent, LastSeenEvent } from "../types/index";

export class Presence {
  
  private onlineUsers = new Map<string, boolean>();

  constructor(private client: HermesClient) {
    
    this.client.on("user:online", ({ userId }) => {
      this.onlineUsers.set(userId, true);
    });
    this.client.on("user:offline", ({ userId }) => {
      this.onlineUsers.set(userId, false);
    });
  }

  
  isOnline(userId: string): boolean {
    return this.onlineUsers.get(userId) ?? false;
  }

  
  getOnlineUsers(): string[] {
    return Array.from(this.onlineUsers.entries())
      .filter(([, online]) => online)
      .map(([userId]) => userId);
  }

  
  ping(roomId: string): void {
    this.client.pingPresence(roomId);
  }

  
  onOnline(callback: (event: PresenceEvent) => void): () => void {
    this.client.on("user:online", callback);
    return () => this.client.off("user:online", callback);
  }

  
  onOffline(callback: (event: LastSeenEvent) => void): () => void {
    this.client.on("user:offline", callback);
    return () => this.client.off("user:offline", callback);
  }
}
