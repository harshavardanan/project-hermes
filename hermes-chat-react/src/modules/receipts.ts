import type { HermesClient } from "../core/HermesClient";
import type { ReceiptEvent } from "../types/index";

export class Receipts {
  constructor(private client: HermesClient) {}

  
  markSeen(roomId: string, lastMessageId: string): Promise<void> {
    return this.client.markSeen(roomId, lastMessageId);
  }

  
  onReceiptUpdated(callback: (event: ReceiptEvent) => void): () => void {
    this.client.on("receipt:updated", callback);
    return () => this.client.off("receipt:updated", callback);
  }
}
