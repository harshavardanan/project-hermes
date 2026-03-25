import type { Socket, Server } from "socket.io";
import { markSeen, addReaction } from "../../services/messageService.js";
import { logger } from "../../utils/logger.js";

// ── Presence ──────────────────────────────────────────────────────────────────
export const handlePresence = (socket: Socket, io: Server) => {
  const { hermesUserId } = (socket as any).hermesUser;

  socket.on("presence:ping", (data) => {
    const { roomId } = data;
    if (roomId) socket.to(roomId).emit("user:online", { userId: hermesUserId });
  });
};

// ── Typing ────────────────────────────────────────────────────────────────────
const typingTimers = new Map<string, NodeJS.Timeout>();

export const handleTyping = (socket: Socket, io: Server) => {
  const { hermesUserId, displayName } = (socket as any).hermesUser;

  socket.on("typing:start", (data) => {
    const { roomId } = data;
    if (!roomId) return;
    
    const key = `${hermesUserId}:${roomId}`;
    
    // Clear existing timer if any
    if (typingTimers.has(key)) {
      clearTimeout(typingTimers.get(key));
    }
    
    // Set 5s TTL
    const timer = setTimeout(() => {
      typingTimers.delete(key);
      socket.to(roomId).emit("typing:stopped", { userId: hermesUserId, displayName, roomId });
    }, 5000);
    typingTimers.set(key, timer);

    socket
      .to(roomId)
      .emit("typing:started", { userId: hermesUserId, displayName, roomId });
  });

  socket.on("typing:stop", (data) => {
    const { roomId } = data;
    if (!roomId) return;
    
    const key = `${hermesUserId}:${roomId}`;
    if (typingTimers.has(key)) {
      clearTimeout(typingTimers.get(key));
      typingTimers.delete(key);
    }
    
    socket
      .to(roomId)
      .emit("typing:stopped", { userId: hermesUserId, displayName, roomId });
  });
};

// ── Receipts ──────────────────────────────────────────────────────────────────
export const handleReceipts = (socket: Socket, io: Server) => {
  const { hermesUserId } = (socket as any).hermesUser;

  socket.on("receipt:seen", async (data, ack) => {
    try {
      const { roomId, lastMessageId } = data;
      if (!roomId || !lastMessageId) {
        return ack?.({
          success: false,
          error: "roomId and lastMessageId required",
        });
      }

      await markSeen(roomId, hermesUserId, lastMessageId);

      socket.to(roomId).emit("receipt:updated", {
        roomId,
        userId: hermesUserId,
        lastMessageId,
        seenAt: new Date(),
      });

      ack?.({ success: true });
    } catch (err) {
      logger.error("receipt:seen error", err);
      ack?.({ success: false, error: "Failed to mark seen" });
    }
  });
};

// ── Reactions ─────────────────────────────────────────────────────────────────
export const handleReactions = (socket: Socket, io: Server) => {
  const { hermesUserId } = (socket as any).hermesUser;

  socket.on("reaction:add", async (data, ack) => {
    try {
      const { messageId, roomId, emoji } = data;
      if (!messageId || !emoji) {
        return ack?.({ success: false, error: "messageId and emoji required" });
      }

      const result = await addReaction(messageId, hermesUserId, emoji);
      if (result.error) return ack?.({ success: false, error: result.error });

      io.to(roomId).emit("reaction:updated", {
        messageId,
        roomId,
        reactions: result.message?.reactions,
      });

      ack?.({ success: true, reactions: result.message?.reactions });
    } catch (err) {
      logger.error("reaction:add error", err);
      ack?.({ success: false, error: "Failed to add reaction" });
    }
  });
};
