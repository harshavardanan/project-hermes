import type { HermesClient } from "../core/HermesClient";
import type { ReactionEvent } from "../types/index";

export class Reactions {
  constructor(private client: HermesClient) {}

  
  add(messageId: string, roomId: string, emoji: string): Promise<void> {
    return this.client.addReaction(messageId, roomId, emoji);
  }

  
  onUpdated(callback: (event: ReactionEvent) => void): () => void {
    this.client.on("reaction:updated", callback);
    return () => this.client.off("reaction:updated", callback);
  }
}
