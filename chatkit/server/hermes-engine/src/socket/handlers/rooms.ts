import type { Socket, Server } from "socket.io";
import {
  createDirectRoom,
  createGroupRoom,
  deleteRoom,
  addMember,
  removeMember,
  getUserRooms,
} from "../../services/roomService.js";
import { logger } from "../../utils/logger.js";

export const handleRooms = (socket: Socket, io: Server) => {
  const { hermesUserId, displayName, projectId } = (socket as any).hermesUser;
  if (!hermesUserId) {
    console.error(
      "❌ handleRooms: hermesUserId is undefined!",
      (socket as any).hermesUser,
    );
    return;
  }
  // ── room:create:direct ──────────────────────────────────────────────────────
  socket.on("room:create:direct", async (...args) => {
    // Dynamically find the callback, even if the frontend sends an empty object
    const ack =
      typeof args[args.length - 1] === "function"
        ? args[args.length - 1]
        : undefined;
    const data =
      args.length > 1 && typeof args[0] !== "function" ? args[0] : {};

    try {
      const { targetHermesUserId } = data;
      if (!targetHermesUserId)
        return ack?.({ success: false, error: "targetHermesUserId required" });

      const room = await createDirectRoom(
        hermesUserId,
        targetHermesUserId,
        projectId,
      );

      socket.join(room.id);
      io.to(targetHermesUserId).socketsJoin(room.id);
      io.to(room.id).emit("room:created", room);

      ack?.({ success: true, room });
      logger.socket("ROOM_DM", hermesUserId, `with ${targetHermesUserId}`);
    } catch (err) {
      logger.error("room:create:direct error", err);
      ack?.({ success: false, error: "Failed to create direct room" });
    }
  });

  // ── room:create:group ───────────────────────────────────────────────────────
  socket.on("room:create:group", async (...args) => {
    const ack =
      typeof args[args.length - 1] === "function"
        ? args[args.length - 1]
        : undefined;
    const data =
      args.length > 1 && typeof args[0] !== "function" ? args[0] : {};

    try {
      const { name, memberIds, description, avatar } = data;
      if (!name) return ack?.({ success: false, error: "Group name required" });

      const room = await createGroupRoom(
        hermesUserId,
        projectId,
        name,
        memberIds || [],
        description,
        avatar,
      );

      socket.join(room.id);
      for (const memberId of room.members as any[]) {
        const id = memberId.toString();
        if (id !== hermesUserId) io.to(id).socketsJoin(room.id);
      }

      io.to(room.id).emit("room:created", room);
      ack?.({ success: true, room });
      logger.socket("ROOM_GROUP", hermesUserId, `"${name}"`);
    } catch (err) {
      logger.error("room:create:group error", err);
      ack?.({ success: false, error: "Failed to create group" });
    }
  });

  // ── room:delete ─────────────────────────────────────────────────────────────
  socket.on("room:delete", async (...args) => {
    const ack =
      typeof args[args.length - 1] === "function"
        ? args[args.length - 1]
        : undefined;
    const data =
      args.length > 1 && typeof args[0] !== "function" ? args[0] : {};

    try {
      const { roomId } = data;
      if (!roomId) return ack?.({ success: false, error: "roomId required" });

      const result = await deleteRoom(roomId, hermesUserId);
      if (!result.success)
        return ack?.({ success: false, error: result.error });

      io.to(roomId).emit("room:deleted", { roomId });
      io.socketsLeave(roomId);
      ack?.({ success: true });
    } catch (err) {
      logger.error("room:delete error", err);
      ack?.({ success: false, error: "Failed to delete room" });
    }
  });

  // ── room:list ───────────────────────────────────────────────────────────────
  socket.on("room:list", async (...args) => {
    // 🚨 BULLETPROOF ACK EXTRACTION
    const ack =
      typeof args[args.length - 1] === "function"
        ? args[args.length - 1]
        : undefined;

    console.log(`📋 room:list hit for User ID: ${hermesUserId}`);

    try {
      if (!hermesUserId) {
        console.error("❌ room:list failed: hermesUserId is undefined");
        return ack?.({ success: false, error: "Unauthenticated socket" });
      }

      const rooms = await getUserRooms(hermesUserId);
      console.log(`✅ getUserRooms returned ${rooms?.length || 0} rooms`);

      // Always guarantee we return an array, fixing the React mapping issue
      ack?.({ success: true, rooms: rooms || [] });
    } catch (err) {
      console.error("❌ getUserRooms threw an error:", err);
      logger.error("room:list error", err);
      ack?.({ success: false, error: "Failed to fetch rooms" });
    }
  });
};
