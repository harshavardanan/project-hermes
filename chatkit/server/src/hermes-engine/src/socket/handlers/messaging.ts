import type { Socket, Server } from "socket.io";
import { checkSocketRateLimit } from "../../middleware/rateLimit.js";
import {
  sendMessage,
  getHistory,
  deleteMessage,
  editMessage,
  getThreadReplies,
} from "../../services/messageService.js";
import { logger } from "../../utils/logger.js";

export const handleMessaging = (socket: Socket, io: Server) => {
  const { hermesUserId } = (socket as any).hermesUser;

  // ── message:send ────────────────────────────────────────────────────────────
  socket.on("message:send", async (data, ack) => {
    try {
      if (!checkSocketRateLimit(hermesUserId)) {
        return ack?.({ success: false, error: "Rate limit exceeded" });
      }

      // Check per-user token limit
      if (socket.data.dailyTokensUsed >= socket.data.planLimit) {
        socket.emit("quota:exceeded", {
          message:
            "Daily message limit reached for your plan. Upgrade your plan to send more.",
        });
        return ack?.({
          success: false,
          error: "Daily message limit reached. Upgrade your plan.",
        });
      }

      const {
        roomId,
        type,
        text,
        url,
        fileName,
        fileSize,
        mimeType,
        thumbnail,
        replyTo,
        threadParentId,
      } = data;

      if (!roomId || !type)
        return ack?.({ success: false, error: "roomId and type required" });
      if (type === "text" && !text?.trim())
        return ack?.({ success: false, error: "Text cannot be empty" });

      const result = await sendMessage({
        roomId,
        senderId: hermesUserId,
        type,
        text,
        url,
        fileName,
        fileSize,
        mimeType,
        thumbnail,
        replyTo,
        threadParentId,
      });

      if (result.error) return ack?.({ success: false, error: result.error });

      // Increment token tracking on socket (in-memory counter for current session)
      socket.data.dailyTokensUsed++;

      // Broadcast the message to the room
      io.to(roomId).emit("message:receive", result.message);
      ack?.({ success: true, message: result.message });
    } catch (err) {
      logger.error("message:send error", err);
      ack?.({ success: false, error: "Failed to send message" });
    }
  });

  // ── message:history ─────────────────────────────────────────────────────────
  socket.on("message:history", async (data, ack) => {
    try {
      const { roomId, before, limit } = data;
      const result = await getHistory(roomId, hermesUserId, before, limit);
      if (result.error) return ack?.({ success: false, error: result.error });
      ack?.({ success: true, ...result });
    } catch (err) {
      logger.error("message:history error", err);
      ack?.({ success: false, error: "Failed to fetch history" });
    }
  });

  // ── message:thread:history ──────────────────────────────────────────────────
  // Fetches paginated replies for a thread parent message
  socket.on("message:thread:history", async (data, ack) => {
    try {
      const { parentId, before, limit } = data;
      if (!parentId) {
        return ack?.({ success: false, error: "parentId required" });
      }

      const result = await getThreadReplies(
        parentId,
        hermesUserId,
        before,
        limit,
      );
      if (result.error) return ack?.({ success: false, error: result.error });
      ack?.({ success: true, ...result });
    } catch (err) {
      logger.error("message:thread:history error", err);
      ack?.({ success: false, error: "Failed to fetch thread replies" });
    }
  });

  // ── message:delete ──────────────────────────────────────────────────────────
  socket.on("message:delete", async (data, ack) => {
    try {
      const { messageId, roomId } = data;
      const result = await deleteMessage(messageId, hermesUserId);
      if (!result.success)
        return ack?.({ success: false, error: result.error });
      io.to(roomId).emit("message:deleted", { messageId, roomId });
      ack?.({ success: true });
    } catch (err) {
      logger.error("message:delete error", err);
      ack?.({ success: false, error: "Failed to delete message" });
    }
  });

  // ── message:edit ────────────────────────────────────────────────────────────
  socket.on("message:edit", async (data, ack) => {
    try {
      const { messageId, roomId, text } = data;
      const result = await editMessage(messageId, hermesUserId, text);
      if (result.error) return ack?.({ success: false, error: result.error });
      io.to(roomId).emit("message:edited", result.message);
      ack?.({ success: true, message: result.message });
    } catch (err) {
      logger.error("message:edit error", err);
      ack?.({ success: false, error: "Failed to edit message" });
    }
  });
};
