import { EventEmitter } from "./EventEmitter";
import type { HermesConfig, HermesUser, ConnectionStatus, Message, Room, SendMessageInput, MessageHistoryResult, CreateDirectRoomInput, CreateGroupRoomInput, UploadResult } from "../types/index";
export declare class HermesClient extends EventEmitter {
    private config;
    private socket;
    private token;
    user: HermesUser | null;
    status: ConnectionStatus;
    constructor(config: HermesConfig);
    connect(): Promise<HermesUser>;
    private _connectSocket;
    disconnect(): void;
    private _wireSocketEvents;
    _emit<T = any>(event: string, data?: any): Promise<T>;
    sendMessage(input: SendMessageInput): Promise<Message>;
    getHistory(roomId: string, before?: string, limit?: number): Promise<MessageHistoryResult>;
    deleteMessage(messageId: string, roomId: string): Promise<void>;
    editMessage(messageId: string, roomId: string, text: string): Promise<Message>;
    createDirectRoom(input: CreateDirectRoomInput): Promise<Room>;
    createGroupRoom(input: CreateGroupRoomInput): Promise<Room>;
    deleteRoom(roomId: string): Promise<void>;
    getRooms(): Promise<Room[]>;
    addMember(roomId: string, newMemberId: string): Promise<void>;
    removeMember(roomId: string, targetId: string): Promise<void>;
    pingPresence(roomId: string): void;
    startTyping(roomId: string): void;
    stopTyping(roomId: string): void;
    markSeen(roomId: string, lastMessageId: string): Promise<void>;
    addReaction(messageId: string, roomId: string, emoji: string): Promise<void>;
    uploadFile(file: File): Promise<UploadResult>;
    get isConnected(): boolean;
    get currentUser(): HermesUser | null;
}
//# sourceMappingURL=HermesClient.d.ts.map