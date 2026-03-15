import type { HermesClient } from "../../core/HermesClient";
export declare const useReadReceipts: (client: HermesClient, roomId: string | null) => {
    markSeen: (lastMessageId: string) => Promise<void>;
    seenBy: (messageId: string) => string[];
    receipts: Map<string, Set<string>>;
};
//# sourceMappingURL=useReadReceipts.d.ts.map