import type { Socket, Server } from "socket.io";
import User from "../../../../src/models/Users.js";
import { Member } from "../../models/Member.js";
import { logger } from "../../utils/logger.js";

export const handleConnection = async (socket: Socket, io: Server) => {
  const { hermesId, username } = (socket as any).hermesUser;

  // Mark user online
  await User.findOneAndUpdate(
    { hermesId },
    { isOnline: true, lastSeen: new Date() },
  );

  // Join all the user's active rooms automatically
  const memberships = await Member.find({ hermesId, isActive: true });
  const roomIds = memberships.map((m) => m.roomId);
  socket.join(roomIds);
  socket.join(hermesId); // personal room for DMs/notifications

  // Notify all rooms this user is in that they came online
  roomIds.forEach((roomId) => {
    socket.to(roomId).emit("user:online", { hermesId, username });
  });

  logger.socket("CONNECT", hermesId, `joined ${roomIds.length} rooms`);

  // ── Disconnect ──────────────────────────────────────────────────────────────
  socket.on("disconnect", async () => {
    await User.findOneAndUpdate(
      { hermesId },
      { isOnline: false, lastSeen: new Date() },
    );

    // Notify rooms user went offline
    roomIds.forEach((roomId) => {
      socket.to(roomId).emit("user:offline", {
        hermesId,
        username,
        lastSeen: new Date(),
      });
    });

    logger.socket("DISCONNECT", hermesId);
  });
};
