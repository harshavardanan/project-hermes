// ── Connection ────────────────────────────────────────────────────────────────

export interface HermesConfig {
  endpoint: string; // e.g. "https://yoursite.com"
  apiKey: string;
  secret: string;
  userId: string;
}

export interface HermesUser {
  userId: string;
  displayName: string;
  avatar?: string;
  email?: string;
}

export interface ConnectResponse {
  success: boolean;
  token: string;
  user: HermesUser;
}

// ── Rooms ─────────────────────────────────────────────────────────────────────

export type RoomType = "direct" | "group";

export interface Room {
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

export interface CreateDirectRoomInput {
  targetUserId: string;
}

export interface CreateGroupRoomInput {
  name: string;
  memberIds: string[];
  description?: string;
  avatar?: string;
}

// ── Messages ──────────────────────────────────────────────────────────────────

export type MessageType =
  | "text"
  | "link"
  | "image"
  | "video"
  | "audio"
  | "document";
export type DeliveryStatus = "sent" | "delivered" | "seen";

export interface Reaction {
  emoji: string;
  users: string[];
}

export interface Message {
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

export interface SendMessageInput {
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

export interface MessageHistoryResult {
  messages: Message[];
  hasMore: boolean;
}

// ── Presence ──────────────────────────────────────────────────────────────────

export interface PresenceEvent {
  userId: string;
  displayName: string;
  roomId?: string;
}

export interface LastSeenEvent {
  userId: string;
  lastSeen: string;
}

// ── Typing ────────────────────────────────────────────────────────────────────

export interface TypingEvent {
  userId: string;
  displayName: string;
  roomId: string;
}

// ── Receipts ──────────────────────────────────────────────────────────────────

export interface ReceiptEvent {
  roomId: string;
  userId: string;
  lastMessageId: string;
  seenAt: string;
}

// ── Reactions ─────────────────────────────────────────────────────────────────

export interface ReactionEvent {
  messageId: string;
  roomId: string;
  reactions: Reaction[];
}

// ── Upload ────────────────────────────────────────────────────────────────────

export interface UploadResult {
  type: MessageType;
  url: string;
  thumbnail?: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

// ── Events ────────────────────────────────────────────────────────────────────
// All events the SDK can emit or listen to

export interface HermesEvents {
  // Connection
  connected: () => void;
  disconnected: (reason: string) => void;
  error: (error: Error) => void;

  // Messages
  "message:receive": (message: Message) => void;
  "message:deleted": (data: { messageId: string; roomId: string }) => void;
  "message:edited": (message: Message) => void;

  // Rooms
  "room:created": (room: Room) => void;
  "room:deleted": (data: { roomId: string }) => void;
  "room:member:joined": (data: { roomId: string; userId: string }) => void;
  "room:member:left": (data: { roomId: string; userId: string }) => void;

  // Presence
  "user:online": (event: PresenceEvent) => void;
  "user:offline": (event: LastSeenEvent) => void;

  // Typing
  "typing:started": (event: TypingEvent) => void;
  "typing:stopped": (event: TypingEvent) => void;

  // Receipts
  "receipt:updated": (event: ReceiptEvent) => void;

  // Reactions
  "reaction:updated": (event: ReactionEvent) => void;
}

// ── SDK State ─────────────────────────────────────────────────────────────────

export type ConnectionStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "disconnected"
  | "error";
