import type { Socket, Server } from "socket.io";
import {
  pinMessage,
  unpinMessage,
  searchMessages,
} from "../../services/messageService.js";
import { logger } from "../../utils/logger.js";

// ── Presence ──────────────────────────────────────────────────────────────────
export const handlePresence = (socket: Socket, io: Server) => {
  const { hermesUserId, displayName } = (socket as any).hermesUser;

  socket.on("presence:ping", (data) => {
    const { roomId } = data;
    if (roomId) {
      socket
        .to(roomId)
        .emit("user:online", { userId: hermesUserId, displayName, roomId });
    }
  });
};

// ── Pinning ───────────────────────────────────────────────────────────────────
export const handlePinning = (socket: Socket, io: Server) => {
  const { hermesUserId } = (socket as any).hermesUser;

  // message:pin — Pin a message to the room
  socket.on("message:pin", async (data, ack) => {
    try {
      const { messageId, roomId } = data;
      if (!messageId || !roomId) {
        return ack?.({ success: false, error: "messageId and roomId required" });
      }

      const result = await pinMessage(messageId, hermesUserId);
      if (result.error) return ack?.({ success: false, error: result.error });

      io.to(roomId).emit("message:pinned", {
        messageId,
        roomId,
        pinnedAt: result.message?.pinnedAt,
        pinnedBy: hermesUserId,
        message: result.message,
      });

      ack?.({ success: true, message: result.message });
    } catch (err) {
      logger.error("message:pin error", err);
      ack?.({ success: false, error: "Failed to pin message" });
    }
  });

  // message:unpin — Unpin a message
  socket.on("message:unpin", async (data, ack) => {
    try {
      const { messageId, roomId } = data;
      if (!messageId || !roomId) {
        return ack?.({ success: false, error: "messageId and roomId required" });
      }

      const result = await unpinMessage(messageId, hermesUserId);
      if (!result.success)
        return ack?.({ success: false, error: result.error });

      io.to(roomId).emit("message:unpinned", { messageId, roomId });

      ack?.({ success: true });
    } catch (err) {
      logger.error("message:unpin error", err);
      ack?.({ success: false, error: "Failed to unpin message" });
    }
  });
};

// ── Search ────────────────────────────────────────────────────────────────────
export const handleSearch = (socket: Socket, io: Server) => {
  const { hermesUserId } = (socket as any).hermesUser;

  socket.on("message:search", async (data, ack) => {
    try {
      const { roomId, query, limit } = data;
      if (!roomId || !query) {
        return ack?.({ success: false, error: "roomId and query required" });
      }

      const result = await searchMessages(
        roomId,
        hermesUserId,
        query,
        limit,
      );
      if (result.error) return ack?.({ success: false, error: result.error });

      ack?.({ success: true, messages: result.messages });
    } catch (err) {
      logger.error("message:search error", err);
      ack?.({ success: false, error: "Search failed" });
    }
  });
};
