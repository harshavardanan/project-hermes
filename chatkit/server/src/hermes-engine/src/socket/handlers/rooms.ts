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
    logger.error(
      "handleRooms: hermesUserId is undefined!",
      (socket as any).hermesUser,
    );
    return;
  }

  // ── room:join ───────────────────────────────────────────────────────────────
  socket.on("room:join", async (data: { roomId: string }, ack?: Function) => {
    try {
      const { roomId } = data;
      if (!roomId) return ack?.({ success: false, error: "roomId required" });
      await socket.join(roomId);
      logger.socket("ROOM_JOIN", hermesUserId, `joined ${roomId}`);
      ack?.({ success: true, roomId });
    } catch (err) {
      logger.error("room:join error", err);
      ack?.({ success: false, error: "Failed to join room" });
    }
  });

  // ── room:leave ──────────────────────────────────────────────────────────────
  socket.on("room:leave", async (data: { roomId: string }, ack?: Function) => {
    try {
      const { roomId } = data;
      if (!roomId) return ack?.({ success: false, error: "roomId required" });
      await socket.leave(roomId);
      logger.socket("ROOM_LEAVE", hermesUserId, `left ${roomId}`);
      ack?.({ success: true });
    } catch (err) {
      logger.error("room:leave error", err);
      ack?.({ success: false, error: "Failed to leave room" });
    }
  });

  // ── room:create:direct ──────────────────────────────────────────────────────
  socket.on("room:create:direct", async (...args) => {
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

      const roomId = (room._id as any).toString();
      socket.join(roomId);
      io.to(targetHermesUserId).socketsJoin(roomId);
      io.to(roomId).emit("room:created", room);

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

      const roomId = (room._id as any).toString();
      socket.join(roomId);
      for (const memberId of room.members as any[]) {
        const id = memberId.toString();
        if (id !== hermesUserId) io.to(id).socketsJoin(roomId);
      }

      io.to(roomId).emit("room:created", room);
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

  // ── room:member:add ─────────────────────────────────────────────────────────
  // SDK emits: client._emit("room:member:add", { roomId, newMemberId })
  socket.on("room:member:add", async (...args) => {
    const ack =
      typeof args[args.length - 1] === "function"
        ? args[args.length - 1]
        : undefined;
    const data =
      args.length > 1 && typeof args[0] !== "function" ? args[0] : {};

    try {
      const { roomId, newMemberId } = data;
      if (!roomId || !newMemberId) {
        return ack?.({
          success: false,
          error: "roomId and newMemberId required",
        });
      }

      const result = await addMember(roomId, hermesUserId, newMemberId);
      if (!result.success)
        return ack?.({ success: false, error: result.error });

      // Auto-join the new member's sockets to the room
      io.to(newMemberId).socketsJoin(roomId);

      // Broadcast to the room so all clients (including the SDK's useRooms hook)
      // can update their member list in real time
      io.to(roomId).emit("room:member:joined", {
        roomId,
        userId: newMemberId,
      });

      ack?.({ success: true });
      logger.socket(
        "MEMBER_ADD",
        hermesUserId,
        `added ${newMemberId} to ${roomId}`,
      );
    } catch (err) {
      logger.error("room:member:add error", err);
      ack?.({ success: false, error: "Failed to add member" });
    }
  });

  // ── room:member:remove ──────────────────────────────────────────────────────
  // SDK emits: client._emit("room:member:remove", { roomId, targetId })
  socket.on("room:member:remove", async (...args) => {
    const ack =
      typeof args[args.length - 1] === "function"
        ? args[args.length - 1]
        : undefined;
    const data =
      args.length > 1 && typeof args[0] !== "function" ? args[0] : {};

    try {
      const { roomId, targetId } = data;
      if (!roomId || !targetId) {
        return ack?.({
          success: false,
          error: "roomId and targetId required",
        });
      }

      const result = await removeMember(roomId, hermesUserId, targetId);
      if (!result.success)
        return ack?.({ success: false, error: result.error });

      // Broadcast before removing so the target gets the event
      io.to(roomId).emit("room:member:left", {
        roomId,
        userId: targetId,
      });

      // Remove the target's sockets from the room
      io.to(targetId).socketsLeave(roomId);

      ack?.({ success: true });
      logger.socket(
        "MEMBER_REMOVE",
        hermesUserId,
        `removed ${targetId} from ${roomId}`,
      );
    } catch (err) {
      logger.error("room:member:remove error", err);
      ack?.({ success: false, error: "Failed to remove member" });
    }
  });

  // ── room:list ───────────────────────────────────────────────────────────────
  socket.on("room:list", async (...args) => {
    const ack =
      typeof args[args.length - 1] === "function"
        ? args[args.length - 1]
        : undefined;

    try {
      if (!hermesUserId) {
        return ack?.({ success: false, error: "Unauthenticated socket" });
      }

      const rooms = await getUserRooms(hermesUserId);
      ack?.({ success: true, rooms: rooms || [] });
    } catch (err) {
      logger.error("room:list error", err);
      ack?.({ success: false, error: "Failed to fetch rooms" });
    }
  });
};
