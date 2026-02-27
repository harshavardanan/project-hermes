// ── Core ──────────────────────────────────────────────────────────────────────
export { HermesClient } from "./core/HermesClient.js";
export { EventEmitter } from "./core/EventEmitter.js";

// ── Modules (framework agnostic) ──────────────────────────────────────────────
export { Messaging } from "./modules/messaging.js";
export { Rooms } from "./modules/rooms.js";
export { Presence } from "./modules/presence.js";
export { Typing } from "./modules/typing.js";
export { Receipts } from "./modules/receipts.js";
export { Reactions } from "./modules/reactions.js";
export { Media } from "./modules/media.js";

// ── Types ─────────────────────────────────────────────────────────────────────
export type {
  HermesConfig,
  HermesUser,
  HermesEvents,
  ConnectionStatus,
  Room,
  RoomType,
  Message,
  MessageType,
  DeliveryStatus,
  Reaction,
  SendMessageInput,
  MessageHistoryResult,
  CreateDirectRoomInput,
  CreateGroupRoomInput,
  PresenceEvent,
  LastSeenEvent,
  TypingEvent,
  ReceiptEvent,
  ReactionEvent,
  UploadResult,
} from "./types/index.js";
