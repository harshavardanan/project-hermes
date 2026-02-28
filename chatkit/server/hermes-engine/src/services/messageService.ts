import { Types } from "mongoose";
import { Message, type IMessage, type MessageType } from "../models/Message.js";
import { Room } from "../models/Room.js";
import { Member } from "../models/Member.js";
import { encrypt, decrypt } from "../utils/encryption.js";
import { logger } from "../utils/logger.js";

const PAGE_SIZE = 30;

interface SendMessageInput {
  roomId: string;
  senderId: string; // HermesUser._id
  type: MessageType;
  text?: string;
  url?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  thumbnail?: string;
  replyTo?: string;
}

// ── Send message ──────────────────────────────────────────────────────────────
export const sendMessage = async (
  input: SendMessageInput,
): Promise<{ message?: any; error?: string }> => {
  const { roomId, senderId } = input;

  const room = await Room.findById(roomId);
  if (!room || room.isDeleted) return { error: "Room not found" };

  const isMember = room.members.some((m) => m.toString() === senderId);
  if (!isMember) return { error: "Not a member of this room" };

  const encryptedText = input.text ? encrypt(input.text) : undefined;

  const message = await Message.create({
    roomId: new Types.ObjectId(roomId),
    senderId: new Types.ObjectId(senderId),
    type: input.type,
    text: encryptedText,
    url: input.url,
    fileName: input.fileName,
    fileSize: input.fileSize,
    mimeType: input.mimeType,
    thumbnail: input.thumbnail,
    replyTo: input.replyTo ? new Types.ObjectId(input.replyTo) : undefined,
    deliveryStatus: "sent",
    seenBy: [new Types.ObjectId(senderId)],
  });

  // Update room last activity
  await Room.findByIdAndUpdate(roomId, {
    lastMessage: message._id,
    lastActivity: new Date(),
  });

  // Increment unread for all other active members
  await Member.updateMany(
    {
      roomId: new Types.ObjectId(roomId),
      hermesUserId: { $ne: new Types.ObjectId(senderId) },
      isActive: true,
    },
    { $inc: { unreadCount: 1 } },
  );

  // Return decrypted for delivery
  const plain = message.toObject();
  if (plain.text) plain.text = decrypt(plain.text);

  logger.socket("MSG_SENT", senderId, `room:${roomId} type:${input.type}`);
  return { message: plain };
};

// ── Get paginated history ─────────────────────────────────────────────────────
export const getHistory = async (
  roomId: string,
  hermesUserId: string,
  before?: string,
  limit = PAGE_SIZE,
): Promise<{ messages?: any[]; hasMore?: boolean; error?: string }> => {
  const room = await Room.findById(roomId);
  if (!room || room.isDeleted) return { error: "Room not found" };

  const isMember = room.members.some((m) => m.toString() === hermesUserId);
  if (!isMember) return { error: "Access denied" };

  const query: any = { roomId: new Types.ObjectId(roomId), isDeleted: false };
  if (before) {
    const cursor = await Message.findById(before);
    if (cursor) query.createdAt = { $lt: cursor.createdAt };
  }

  const messages = await Message.find(query)
    .sort({ createdAt: -1 })
    .limit(limit + 1);

  const hasMore = messages.length > limit;
  const result = messages.slice(0, limit).reverse();

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

// ── Mark seen ─────────────────────────────────────────────────────────────────
export const markSeen = async (
  roomId: string,
  hermesUserId: string,
  lastMessageId: string,
): Promise<void> => {
  await Message.updateMany(
    {
      roomId: new Types.ObjectId(roomId),
      seenBy: { $ne: new Types.ObjectId(hermesUserId) },
      isDeleted: false,
    },
    {
      $addToSet: { seenBy: new Types.ObjectId(hermesUserId) },
      $set: { deliveryStatus: "seen" },
    },
  );

  await Member.findOneAndUpdate(
    {
      roomId: new Types.ObjectId(roomId),
      hermesUserId: new Types.ObjectId(hermesUserId),
    },
    {
      unreadCount: 0,
      lastRead: new Types.ObjectId(lastMessageId),
      lastReadAt: new Date(),
    },
  );
};

// ── Add/toggle reaction ───────────────────────────────────────────────────────
export const addReaction = async (
  messageId: string,
  hermesUserId: string,
  emoji: string,
): Promise<{ message?: any; error?: string }> => {
  const message = await Message.findById(messageId);
  if (!message || message.isDeleted) return { error: "Message not found" };

  const existing = message.reactions.find((r) => r.emoji === emoji);
  if (existing) {
    const hasReacted = existing.users.some(
      (u) => u.toString() === hermesUserId,
    );
    if (hasReacted) {
      existing.users = existing.users.filter(
        (u) => u.toString() !== hermesUserId,
      );
      if (existing.users.length === 0) {
        message.reactions = message.reactions.filter((r) => r.emoji !== emoji);
      }
    } else {
      existing.users.push(new Types.ObjectId(hermesUserId));
    }
  } else {
    message.reactions.push({
      emoji,
      users: [new Types.ObjectId(hermesUserId)],
    });
  }

  await message.save();
  return { message: message.toObject() };
};

// ── Soft delete message ───────────────────────────────────────────────────────
export const deleteMessage = async (
  messageId: string,
  hermesUserId: string,
): Promise<{ success: boolean; error?: string }> => {
  const message = await Message.findById(messageId);
  if (!message) return { success: false, error: "Message not found" };
  if (message.senderId.toString() !== hermesUserId) {
    return { success: false, error: "Not your message" };
  }

  message.isDeleted = true;
  message.deletedAt = new Date();
  message.text = undefined;
  message.url = undefined;
  await message.save();

  return { success: true };
};

// ── Edit message ──────────────────────────────────────────────────────────────
export const editMessage = async (
  messageId: string,
  hermesUserId: string,
  newText: string,
): Promise<{ message?: any; error?: string }> => {
  const message = await Message.findById(messageId);
  if (!message || message.isDeleted) return { error: "Message not found" };
  if (message.senderId.toString() !== hermesUserId)
    return { error: "Not your message" };
  if (message.type !== "text") return { error: "Can only edit text messages" };

  message.text = encrypt(newText);
  message.editedAt = new Date();
  await message.save();

  const obj = message.toObject();
  obj.text = newText;
  return { message: obj };
};
