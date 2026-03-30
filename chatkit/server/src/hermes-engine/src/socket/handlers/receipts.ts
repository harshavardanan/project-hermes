import type { Socket, Server } from "socket.io";
import { markSeen } from "../../services/messageService.js";
import { logger } from "../../utils/logger.js";

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
        seenAt: new Date().toISOString(),
      });

      ack?.({ success: true });
    } catch (err) {
      logger.error("receipt:seen error", err);
      ack?.({ success: false, error: "Failed to mark seen" });
    }
  });
};
