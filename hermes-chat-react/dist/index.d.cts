interface HermesConfig {
    endpoint: string;
    apiKey: string;
    secret: string;
    userId: string;
}
interface HermesUser {
    userId: string;
    displayName: string;
    avatar?: string;
    email?: string;
}
interface ConnectResponse {
    success: boolean;
    token: string;
    user: HermesUser;
}
type RoomType = "direct" | "group";
interface Room {
    _id: string;
    name?: string;
    type: RoomType;
    createdBy: string;
    members: string[];
    admins: string[];
    avatar?: string;
    description?: string;
    lastMessage?: Message;
    lastActivity: string;
    unreadCount: number;
    isMuted: boolean;
    isPinned: boolean;
    createdAt: string;
    updatedAt: string;
}
interface CreateDirectRoomInput {
    targetUserId: string;
}
interface CreateGroupRoomInput {
    name: string;
    memberIds: string[];
    description?: string;
    avatar?: string;
}
type MessageType = "text" | "link" | "image" | "video" | "audio" | "document";
type DeliveryStatus = "sent" | "delivered" | "seen";
interface Reaction {
    emoji: string;
    users: string[];
}
interface Message {
    _id: string;
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
    reactions: Reaction[];
    deliveryStatus: DeliveryStatus;
    seenBy: string[];
    isDeleted: boolean;
    deletedAt?: string;
    editedAt?: string;
    createdAt: string;
    updatedAt: string;
}
interface SendMessageInput {
    roomId: string;
    type: MessageType;
    text?: string;
    url?: string;
    fileName?: string;
    fileSize?: number;
    mimeType?: string;
    thumbnail?: string;
    replyTo?: string;
}
interface MessageHistoryResult {
    messages: Message[];
    hasMore: boolean;
}
interface PresenceEvent {
    userId: string;
    displayName: string;
    roomId?: string;
}
interface LastSeenEvent {
    userId: string;
    lastSeen: string;
}
interface TypingEvent {
    userId: string;
    displayName: string;
    roomId: string;
}
interface ReceiptEvent {
    roomId: string;
    userId: string;
    lastMessageId: string;
    seenAt: string;
}
interface ReactionEvent {
    messageId: string;
    roomId: string;
    reactions: Reaction[];
}
interface UploadResult {
    type: MessageType;
    url: string;
    thumbnail?: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
}
interface HermesEvents {
    connected: () => void;
    disconnected: (reason: string) => void;
    error: (error: Error) => void;
    "message:receive": (message: Message) => void;
    "message:deleted": (data: {
        messageId: string;
        roomId: string;
    }) => void;
    "message:edited": (message: Message) => void;
    "room:created": (room: Room) => void;
    "room:deleted": (data: {
        roomId: string;
    }) => void;
    "room:member:joined": (data: {
        roomId: string;
        userId: string;
    }) => void;
    "room:member:left": (data: {
        roomId: string;
        userId: string;
    }) => void;
    "user:online": (event: PresenceEvent) => void;
    "user:offline": (event: LastSeenEvent) => void;
    "typing:started": (event: TypingEvent) => void;
    "typing:stopped": (event: TypingEvent) => void;
    "receipt:updated": (event: ReceiptEvent) => void;
    "reaction:updated": (event: ReactionEvent) => void;
}
type ConnectionStatus = "idle" | "connecting" | "connected" | "disconnected" | "error";

type EventKey = keyof HermesEvents;
type EventCallback<K extends EventKey> = HermesEvents[K];
declare class EventEmitter {
    private listeners;
    on<K extends EventKey>(event: K, callback: EventCallback<K>): this;
    off<K extends EventKey>(event: K, callback: EventCallback<K>): void;
    once<K extends EventKey>(event: K, callback: EventCallback<K>): this;
    emit<K extends EventKey>(event: K, ...args: Parameters<EventCallback<K>>): this;
    removeAllListeners<K extends EventKey>(event?: K): this;
    listenerCount<K extends EventKey>(event: K): number;
}

declare class HermesClient extends EventEmitter {
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

export { type ConnectResponse, type ConnectionStatus, type CreateDirectRoomInput, type CreateGroupRoomInput, type DeliveryStatus, HermesClient, type HermesConfig, type HermesEvents, type HermesUser, type LastSeenEvent, type Message, type MessageHistoryResult, type MessageType, type PresenceEvent, type Reaction, type ReactionEvent, type ReceiptEvent, type Room, type RoomType, type SendMessageInput, type TypingEvent, type UploadResult };
