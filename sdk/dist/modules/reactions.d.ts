import type { HermesClient } from "../core/HermesClient";
import type { ReactionEvent } from "../types/index";
export declare class Reactions {
    private client;
    constructor(client: HermesClient);
    add(messageId: string, roomId: string, emoji: string): Promise<void>;
    onUpdated(callback: (event: ReactionEvent) => void): () => void;
}
//# sourceMappingURL=reactions.d.ts.map