import type { HermesClient } from "../core/HermesClient";
import type { ReceiptEvent } from "../types/index";

// ── Receipts Module ───────────────────────────────────────────────────────────
// Handles read receipts — seen/delivered status.
// Usage:
//   const receipts = new Receipts(client);
//   await receipts.markSeen("roomId", "lastMessageId");

export class Receipts {
  constructor(private client: HermesClient) {}

  // Mark all messages in a room as seen up to lastMessageId
  markSeen(roomId: string, lastMessageId: string): Promise<void> {
    return this.client.markSeen(roomId, lastMessageId);
  }

  // Listen for receipt updates from others
  onReceiptUpdated(callback: (event: ReceiptEvent) => void): () => void {
    this.client.on("receipt:updated", callback);
    return () => this.client.off("receipt:updated", callback);
  }
}
