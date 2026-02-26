import { Message, type IMessage, type MessageType } from "../models/Message.js";
import { Room } from "../models/Room.js";
import { Member } from "../models/Member.js";
import { encrypt, decrypt } from "../utils/encryption.js";
import { logger } from "../utils/logger.js";

const PAGE_SIZE = 30;

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

// ── Send a message ────────────────────────────────────────────────────────────
export const sendMessage = async (
  input: SendMessageInput,
): Promise<{ message?: any; error?: string }> => {
  const { roomId, senderId } = input;

  // Verify sender is in the room
  const room = await Room.findById(roomId);
  if (!room || room.isDeleted) return { error: "Room not found" };
  if (!room.members.includes(senderId))
    return { error: "Not a member of this room" };

  // Encrypt text content
  const encryptedText = input.text ? encrypt(input.text) : undefined;

  const message = await Message.create({
    ...input,
    text: encryptedText,
    deliveryStatus: "sent",
    seenBy: [senderId],
  });

  // Update room last activity
  await Room.findByIdAndUpdate(roomId, {
    lastMessage: message.id,
    lastActivity: new Date(),
  });

  // Increment unread for all OTHER members
  await Member.updateMany(
    { roomId, hermesId: { $ne: senderId }, isActive: true },
    { $inc: { unreadCount: 1 } },
  );

  // Return decrypted for immediate delivery
  const plain = message.toObject();
  if (plain.text) plain.text = decrypt(plain.text);

  logger.socket("MSG_SENT", senderId, `room:${roomId} type:${input.type}`);
  return { message: plain };
};

// ── Get paginated message history ─────────────────────────────────────────────
export const getHistory = async (
  roomId: string,
  hermesId: string,
  before?: string, // message _id cursor
  limit = PAGE_SIZE,
): Promise<{ messages?: any[]; hasMore?: boolean; error?: string }> => {
  const room = await Room.findById(roomId);
  if (!room || room.isDeleted) return { error: "Room not found" };
  if (!room.members.includes(hermesId)) return { error: "Access denied" };

  const query: any = { roomId, isDeleted: false };
  if (before) {
    const cursor = await Message.findById(before);
    if (cursor) query.createdAt = { $lt: cursor.createdAt };
  }

  const messages = await Message.find(query)
    .sort({ createdAt: -1 })
    .limit(limit + 1);

  const hasMore = messages.length > limit;
  const result = messages.slice(0, limit).reverse();

  // Decrypt text fields
  const decrypted = result.map((m) => {
    const obj = m.toObject();
    if (obj.text) {
      try {
        obj.text = decrypt(obj.text);
      } catch {
        obj.text = "[encrypted]";
      }
    }
    return obj;
  });

  return { messages: decrypted, hasMore };
};

// ── Mark messages as seen ─────────────────────────────────────────────────────
export const markSeen = async (
  roomId: string,
  hermesId: string,
  lastMessageId: string,
): Promise<void> => {
  // Mark all unseen messages in room as seen by this user
  await Message.updateMany(
    {
      roomId,
      seenBy: { $ne: hermesId },
      isDeleted: false,
    },
    {
      $addToSet: { seenBy: hermesId },
      $set: { deliveryStatus: "seen" },
    },
  );

  // Reset unread count
  await Member.findOneAndUpdate(
    { roomId, hermesId },
    { unreadCount: 0, lastRead: lastMessageId, lastReadAt: new Date() },
  );
};

// ── Add reaction ──────────────────────────────────────────────────────────────
export const addReaction = async (
  messageId: string,
  hermesId: string,
  emoji: string,
): Promise<{ message?: any; error?: string }> => {
  const message = await Message.findById(messageId);
  if (!message || message.isDeleted) return { error: "Message not found" };

  const existing = message.reactions.find((r) => r.emoji === emoji);
  if (existing) {
    if (existing.users.includes(hermesId)) {
      // Toggle off
      existing.users = existing.users.filter((u) => u !== hermesId);
      if (existing.users.length === 0) {
        message.reactions = message.reactions.filter((r) => r.emoji !== emoji);
      }
    } else {
      existing.users.push(hermesId);
    }
  } else {
    message.reactions.push({ emoji, users: [hermesId] });
  }

  await message.save();
  return { message: message.toObject() };
};

// ── Soft delete message ───────────────────────────────────────────────────────
export const deleteMessage = async (
  messageId: string,
  hermesId: string,
): Promise<{ success: boolean; error?: string }> => {
  const message = await Message.findById(messageId);
  if (!message) return { success: false, error: "Message not found" };
  if (message.senderId !== hermesId)
    return { success: false, error: "Not your message" };

  message.isDeleted = true;
  message.deletedAt = new Date();
  message.text = undefined;
  message.url = undefined;
  await message.save();

  return { success: true };
};

// ── Edit message text ─────────────────────────────────────────────────────────
export const editMessage = async (
  messageId: string,
  hermesId: string,
  newText: string,
): Promise<{ message?: any; error?: string }> => {
  const message = await Message.findById(messageId);
  if (!message || message.isDeleted) return { error: "Message not found" };
  if (message.senderId !== hermesId) return { error: "Not your message" };
  if (message.type !== "text") return { error: "Can only edit text messages" };

  message.text = encrypt(newText);
  message.editedAt = new Date();
  await message.save();

  const obj = message.toObject();
  obj.text = newText; // return decrypted
  return { message: obj };
};
