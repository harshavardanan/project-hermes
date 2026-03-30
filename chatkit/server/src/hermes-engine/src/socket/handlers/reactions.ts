import type { Socket, Server } from "socket.io";
import { addReaction } from "../../services/messageService.js";
import { logger } from "../../utils/logger.js";

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
