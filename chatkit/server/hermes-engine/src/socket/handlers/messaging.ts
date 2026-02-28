import type { Socket, Server } from "socket.io";
import { checkSocketRateLimit } from "../../middleware/rateLimit.js";
import {
  sendMessage,
  getHistory,
  deleteMessage,
  editMessage,
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
      });

      if (result.error) return ack?.({ success: false, error: result.error });

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
