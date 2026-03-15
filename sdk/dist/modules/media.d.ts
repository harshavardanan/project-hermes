import type { HermesClient } from "../core/HermesClient";
import type { UploadResult, Message } from "../types/index";
export declare class Media {
    private client;
    constructor(client: HermesClient);
    upload(file: File): Promise<UploadResult>;
    sendFile(roomId: string, file: File, replyTo?: string): Promise<Message>;
    isValidSize(file: File, maxMb?: number): boolean;
    formatSize(bytes: number): string;
}
//# sourceMappingURL=media.d.ts.map