import { type MessageType } from "../models/Message.js";
interface SendMessageInput {
    roomId: string;
    senderId: string;
    type: MessageType;
    text?: string;
    url?: string;
    fileName?: string;
    fileSize?: number;
    mimeType?: string;
    thumbnail?: string;
    replyTo?: string;
}
export declare const sendMessage: (input: SendMessageInput) => Promise<{
    message?: any;
    error?: string;
}>;
export declare const getHistory: (roomId: string, hermesUserId: string, before?: string, limit?: number) => Promise<{
    messages?: any[];
    hasMore?: boolean;
    error?: string;
}>;
export declare const markSeen: (roomId: string, hermesUserId: string, lastMessageId: string) => Promise<void>;
export declare const addReaction: (messageId: string, hermesUserId: string, emoji: string) => Promise<{
    message?: any;
    error?: string;
}>;
export declare const deleteMessage: (messageId: string, hermesUserId: string) => Promise<{
    success: boolean;
    error?: string;
}>;
export declare const editMessage: (messageId: string, hermesUserId: string, newText: string) => Promise<{
    message?: any;
    error?: string;
}>;
export {};
//# sourceMappingURL=messageService.d.ts.map