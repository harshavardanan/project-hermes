import type { HermesClient } from "../core/HermesClient";
import type { Message, SendMessageInput, MessageHistoryResult } from "../types/index";
export declare class Messaging {
    private client;
    constructor(client: HermesClient);
    send(input: SendMessageInput): Promise<Message>;
    sendText(roomId: string, text: string): Promise<Message>;
    sendLink(roomId: string, url: string, text?: string): Promise<Message>;
    sendMedia(roomId: string, upload: {
        type: "image" | "video" | "audio" | "document";
        url: string;
        fileName: string;
        fileSize: number;
        mimeType: string;
        thumbnail?: string;
    }, replyTo?: string): Promise<Message>;
    reply(roomId: string, text: string, replyTo: string): Promise<Message>;
    edit(messageId: string, roomId: string, text: string): Promise<Message>;
    delete(messageId: string, roomId: string): Promise<void>;
    history(roomId: string, before?: string, limit?: number): Promise<MessageHistoryResult>;
    onMessage(callback: (message: Message) => void): () => void;
    onDelete(callback: (data: {
        messageId: string;
        roomId: string;
    }) => void): () => void;
    onEdit(callback: (message: Message) => void): () => void;
}
//# sourceMappingURL=messaging.d.ts.map