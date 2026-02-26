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
  const { hermesId, username } = (socket as any).hermesUser;

  // ── room:create:direct ──────────────────────────────────────────────────────
  socket.on("room:create:direct", async (data, ack) => {
    try {
      const { targetHermesId } = data;
      if (!targetHermesId)
        return ack?.({ success: false, error: "targetHermesId required" });

      const room = await createDirectRoom(hermesId, targetHermesId);

      // Join both users to the room
      socket.join(room.id);
      io.to(targetHermesId).socketsJoin(room.id);

      // Notify both users
      io.to(room.id).emit("room:created", room);
      ack?.({ success: true, room });
      logger.socket("ROOM_CREATE_DM", hermesId, `with ${targetHermesId}`);
    } catch (err) {
      logger.error("room:create:direct error", err);
      ack?.({ success: false, error: "Failed to create direct room" });
    }
  });

  // ── room:create:group ───────────────────────────────────────────────────────
  socket.on("room:create:group", async (data, ack) => {
    try {
      const { name, memberIds, description, avatar } = data;
      if (!name) return ack?.({ success: false, error: "Group name required" });

      const room = await createGroupRoom(
        hermesId,
        name,
        memberIds || [],
        description,
        avatar,
      );

      // Join all members to the socket room
      socket.join(room.id);
      for (const memberId of room.members) {
        if (memberId !== hermesId) {
          io.to(memberId).socketsJoin(room.id);
        }
      }

      io.to(room.id).emit("room:created", room);
      ack?.({ success: true, room });
      logger.socket("ROOM_CREATE_GROUP", hermesId, `"${name}"`);
    } catch (err) {
      logger.error("room:create:group error", err);
      ack?.({ success: false, error: "Failed to create group" });
    }
  });

  // ── room:delete ─────────────────────────────────────────────────────────────
  socket.on("room:delete", async (data, ack) => {
    try {
      const { roomId } = data;
      const result = await deleteRoom(roomId, hermesId);
      if (!result.success)
        return ack?.({ success: false, error: result.error });

      io.to(roomId).emit("room:deleted", { roomId });
      io.socketsLeave(roomId);
      ack?.({ success: true });
      logger.socket("ROOM_DELETE", hermesId, roomId);
    } catch (err) {
      logger.error("room:delete error", err);
      ack?.({ success: false, error: "Failed to delete room" });
    }
  });

  // ── room:member:add ─────────────────────────────────────────────────────────
  socket.on("room:member:add", async (data, ack) => {
    try {
      const { roomId, newMemberId } = data;
      const result = await addMember(roomId, hermesId, newMemberId);
      if (!result.success)
        return ack?.({ success: false, error: result.error });

      io.to(newMemberId).socketsJoin(roomId);
      io.to(roomId).emit("room:member:joined", {
        roomId,
        hermesId: newMemberId,
      });
      ack?.({ success: true });
    } catch (err) {
      logger.error("room:member:add error", err);
      ack?.({ success: false, error: "Failed to add member" });
    }
  });

  // ── room:member:remove ──────────────────────────────────────────────────────
  socket.on("room:member:remove", async (data, ack) => {
    try {
      const { roomId, targetId } = data;
      const result = await removeMember(roomId, hermesId, targetId);
      if (!result.success)
        return ack?.({ success: false, error: result.error });

      io.to(targetId).socketsLeave(roomId);
      io.to(roomId).emit("room:member:left", { roomId, hermesId: targetId });
      ack?.({ success: true });
    } catch (err) {
      logger.error("room:member:remove error", err);
      ack?.({ success: false, error: "Failed to remove member" });
    }
  });

  // ── room:list ───────────────────────────────────────────────────────────────
  socket.on("room:list", async (_, ack) => {
    try {
      const rooms = await getUserRooms(hermesId);
      ack?.({ success: true, rooms });
    } catch (err) {
      logger.error("room:list error", err);
      ack?.({ success: false, error: "Failed to fetch rooms" });
    }
  });
};
