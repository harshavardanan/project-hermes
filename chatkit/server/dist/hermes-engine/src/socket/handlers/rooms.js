import { createDirectRoom, createGroupRoom, deleteRoom, addMember, removeMember, getUserRooms, } from "../../services/roomService.js";
import { logger } from "../../utils/logger.js";
export const handleRooms = (socket, io) => {
    const { hermesUserId, displayName, projectId } = socket.hermesUser;
    if (!hermesUserId) {
        console.error("❌ handleRooms: hermesUserId is undefined!", socket.hermesUser);
        return;
    }
    // ── room:join ───────────────────────────────────────────────────────────────
    socket.on("room:join", async (data, ack) => {
        try {
            const { roomId } = data;
            if (!roomId)
                return ack?.({ success: false, error: "roomId required" });
            await socket.join(roomId);
            logger.socket("ROOM_JOIN", hermesUserId, `joined ${roomId}`);
            ack?.({ success: true, roomId });
        }
        catch (err) {
            logger.error("room:join error", err);
            ack?.({ success: false, error: "Failed to join room" });
        }
    });
    // ── room:leave ──────────────────────────────────────────────────────────────
    socket.on("room:leave", async (data, ack) => {
        try {
            const { roomId } = data;
            if (!roomId)
                return ack?.({ success: false, error: "roomId required" });
            await socket.leave(roomId);
            logger.socket("ROOM_LEAVE", hermesUserId, `left ${roomId}`);
            ack?.({ success: true });
        }
        catch (err) {
            logger.error("room:leave error", err);
            ack?.({ success: false, error: "Failed to leave room" });
        }
    });
    // ── room:create:direct ──────────────────────────────────────────────────────
    socket.on("room:create:direct", async (...args) => {
        const ack = typeof args[args.length - 1] === "function"
            ? args[args.length - 1]
            : undefined;
        const data = args.length > 1 && typeof args[0] !== "function" ? args[0] : {};
        try {
            const { targetHermesUserId } = data;
            if (!targetHermesUserId)
                return ack?.({ success: false, error: "targetHermesUserId required" });
            const room = await createDirectRoom(hermesUserId, targetHermesUserId, projectId);
            const roomId = room._id.toString();
            socket.join(roomId);
            io.to(targetHermesUserId).socketsJoin(roomId);
            io.to(roomId).emit("room:created", room);
            ack?.({ success: true, room });
            logger.socket("ROOM_DM", hermesUserId, `with ${targetHermesUserId}`);
        }
        catch (err) {
            logger.error("room:create:direct error", err);
            ack?.({ success: false, error: "Failed to create direct room" });
        }
    });
    // ── room:create:group ───────────────────────────────────────────────────────
    socket.on("room:create:group", async (...args) => {
        const ack = typeof args[args.length - 1] === "function"
            ? args[args.length - 1]
            : undefined;
        const data = args.length > 1 && typeof args[0] !== "function" ? args[0] : {};
        try {
            const { name, memberIds, description, avatar } = data;
            if (!name)
                return ack?.({ success: false, error: "Group name required" });
            const room = await createGroupRoom(hermesUserId, projectId, name, memberIds || [], description, avatar);
            const roomId = room._id.toString();
            socket.join(roomId);
            for (const memberId of room.members) {
                const id = memberId.toString();
                if (id !== hermesUserId)
                    io.to(id).socketsJoin(roomId);
            }
            io.to(roomId).emit("room:created", room);
            ack?.({ success: true, room });
            logger.socket("ROOM_GROUP", hermesUserId, `"${name}"`);
        }
        catch (err) {
            logger.error("room:create:group error", err);
            ack?.({ success: false, error: "Failed to create group" });
        }
    });
    // ── room:delete ─────────────────────────────────────────────────────────────
    socket.on("room:delete", async (...args) => {
        const ack = typeof args[args.length - 1] === "function"
            ? args[args.length - 1]
            : undefined;
        const data = args.length > 1 && typeof args[0] !== "function" ? args[0] : {};
        try {
            const { roomId } = data;
            if (!roomId)
                return ack?.({ success: false, error: "roomId required" });
            const result = await deleteRoom(roomId, hermesUserId);
            if (!result.success)
                return ack?.({ success: false, error: result.error });
            io.to(roomId).emit("room:deleted", { roomId });
            io.socketsLeave(roomId);
            ack?.({ success: true });
        }
        catch (err) {
            logger.error("room:delete error", err);
            ack?.({ success: false, error: "Failed to delete room" });
        }
    });
    // ── room:list ───────────────────────────────────────────────────────────────
    socket.on("room:list", async (...args) => {
        const ack = typeof args[args.length - 1] === "function"
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
            ack?.({ success: true, rooms: rooms || [] });
        }
        catch (err) {
            console.error("❌ getUserRooms threw an error:", err);
            logger.error("room:list error", err);
            ack?.({ success: false, error: "Failed to fetch rooms" });
        }
    });
};
//# sourceMappingURL=rooms.js.map