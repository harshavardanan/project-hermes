import type { HermesClient } from "../core/HermesClient";
import type { ReceiptEvent } from "../types/index";
export declare class Receipts {
    private client;
    constructor(client: HermesClient);
    markSeen(roomId: string, lastMessageId: string): Promise<void>;
    onReceiptUpdated(callback: (event: ReceiptEvent) => void): () => void;
}
//# sourceMappingURL=receipts.d.ts.map