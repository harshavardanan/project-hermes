import type { HermesClient } from "../core/HermesClient.js";
import type { ReactionEvent } from "../types/index.js";

// ── Reactions Module ──────────────────────────────────────────────────────────
// Usage:
//   const reactions = new Reactions(client);
//   await reactions.add("messageId", "roomId", "👍");

export class Reactions {
  constructor(private client: HermesClient) {}

  // Add or toggle a reaction on a message
  add(messageId: string, roomId: string, emoji: string): Promise<void> {
    return this.client.addReaction(messageId, roomId, emoji);
  }

  // Listen for reaction updates on any message in a room
  onUpdated(callback: (event: ReactionEvent) => void): () => void {
    this.client.on("reaction:updated", callback);
    return () => this.client.off("reaction:updated", callback);
  }
}
