import type { Socket, Server } from "socket.io";
import { markSeen, addReaction } from "../../services/messageService.js";
import { logger } from "../../utils/logger.js";

// ── Presence ──────────────────────────────────────────────────────────────────
export const handlePresence = (socket: Socket, io: Server) => {
  const { hermesId } = (socket as any).hermesUser;

  // Client can manually broadcast presence to a room
  socket.on("presence:ping", (data) => {
    const { roomId } = data;
    if (roomId) {
      socket.to(roomId).emit("user:online", { hermesId });
    }
  });
};

// ── Typing indicators ─────────────────────────────────────────────────────────
export const handleTyping = (socket: Socket, io: Server) => {
  const { hermesId, username } = (socket as any).hermesUser;

  socket.on("typing:start", (data) => {
    const { roomId } = data;
    if (!roomId) return;
    socket.to(roomId).emit("typing:started", { hermesId, username, roomId });
  });

  socket.on("typing:stop", (data) => {
    const { roomId } = data;
    if (!roomId) return;
    socket.to(roomId).emit("typing:stopped", { hermesId, username, roomId });
  });
};

// ── Read receipts ─────────────────────────────────────────────────────────────
export const handleReceipts = (socket: Socket, io: Server) => {
  const { hermesId } = (socket as any).hermesUser;

  socket.on("receipt:seen", async (data, ack) => {
    try {
      const { roomId, lastMessageId } = data;
      if (!roomId || !lastMessageId) {
        return ack?.({
          success: false,
          error: "roomId and lastMessageId required",
        });
      }

      await markSeen(roomId, hermesId, lastMessageId);

      // Notify room that this user has seen up to this message
      socket.to(roomId).emit("receipt:updated", {
        roomId,
        hermesId,
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
  const { hermesId } = (socket as any).hermesUser;

  socket.on("reaction:add", async (data, ack) => {
    try {
      const { messageId, roomId, emoji } = data;
      if (!messageId || !emoji) {
        return ack?.({ success: false, error: "messageId and emoji required" });
      }

      const result = await addReaction(messageId, hermesId, emoji);
      if (result.error) return ack?.({ success: false, error: result.error });

      // Broadcast updated reactions to the whole room
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
