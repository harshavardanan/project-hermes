import type { Socket, Server } from "socket.io";
import { HermesUser } from "../../models/HermesUser.js";
import { Member } from "../../models/Member.js";
import { Types } from "mongoose";
import { logger } from "../../utils/logger.js";

export const handleConnection = async (socket: Socket, io: Server) => {
  const { hermesUserId, displayName } = (socket as any).hermesUser;

  // Mark user online
  await HermesUser.findByIdAndUpdate(hermesUserId, {
    isOnline: true,
    lastSeen: new Date(),
  });

  // Join all active rooms
  const memberships = await Member.find({
    hermesUserId: new Types.ObjectId(hermesUserId),
    isActive: true,
  });

  const roomIds = memberships.map((m) => m.roomId.toString());
  socket.join(roomIds);
  socket.join(hermesUserId); // personal room for direct notifications

  // Notify rooms this user is online
  roomIds.forEach((roomId) => {
    socket
      .to(roomId)
      .emit("user:online", { userId: hermesUserId, displayName });
  });

  logger.socket(
    "CONNECT",
    hermesUserId,
    `${displayName} — joined ${roomIds.length} rooms`,
  );

  // ── Disconnect ──────────────────────────────────────────────────────────────
  socket.on("disconnect", async () => {
    await HermesUser.findByIdAndUpdate(hermesUserId, {
      isOnline: false,
      lastSeen: new Date(),
    });

    roomIds.forEach((roomId) => {
      socket.to(roomId).emit("user:offline", {
        userId: hermesUserId,
        displayName,
        lastSeen: new Date(),
      });
    });

    logger.socket("DISCONNECT", hermesUserId, displayName);
  });
};
