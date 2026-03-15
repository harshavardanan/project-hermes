import type { HermesClient } from "../core/HermesClient";
import type { TypingEvent } from "../types/index";
export declare class Typing {
    private client;
    private timeouts;
    private AUTO_STOP_MS;
    constructor(client: HermesClient);
    start(roomId: string): void;
    stop(roomId: string): void;
    onTypingStart(callback: (event: TypingEvent) => void): () => void;
    onTypingStop(callback: (event: TypingEvent) => void): () => void;
}
//# sourceMappingURL=typing.d.ts.map