import type { HermesClient } from "../core/HermesClient";
import type { PresenceEvent, LastSeenEvent } from "../types/index";
export declare class Presence {
    private client;
    private onlineUsers;
    constructor(client: HermesClient);
    isOnline(userId: string): boolean;
    getOnlineUsers(): string[];
    ping(roomId: string): void;
    onOnline(callback: (event: PresenceEvent) => void): () => void;
    onOffline(callback: (event: LastSeenEvent) => void): () => void;
}
//# sourceMappingURL=presence.d.ts.map