import { Room } from "../models/Room.js";
import { Member } from "../models/Member.js";
import { logger } from "../utils/logger.js";
// ── Create direct room ────────────────────────────────────────────────────────
export const createDirectRoom = async (hermesUserIdA, hermesUserIdB, projectId) => {
    // Check if DM already exists between these two users in this project
    const existing = await Room.findOne({
        type: "direct",
        projectId: projectId, // Mongoose auto-casts this
        members: {
            $all: [hermesUserIdA, hermesUserIdB], // Mongoose auto-casts these
            $size: 2,
        },
        isDeleted: false,
    });
    if (existing)
        return existing;
    const room = await Room.create({
        type: "direct",
        projectId: projectId,
        createdBy: hermesUserIdA,
        members: [hermesUserIdA, hermesUserIdB],
        admins: [],
        lastActivity: new Date(),
    });
    await Member.insertMany([
        { roomId: room._id, hermesUserId: hermesUserIdA },
        { roomId: room._id, hermesUserId: hermesUserIdB },
    ]);
    logger.info(`Direct room created: ${room._id}`);
    return room;
};
// ── Create group room ─────────────────────────────────────────────────────────
export const createGroupRoom = async (creatorId, projectId, name, memberIds, description, avatar) => {
    // Ensure unique members including the creator
    const allMemberIds = Array.from(new Set([creatorId, ...memberIds]));
    const room = await Room.create({
        type: "group",
        name,
        description,
        avatar,
        projectId: projectId,
        createdBy: creatorId,
        members: allMemberIds,
        admins: [creatorId],
        lastActivity: new Date(),
    });
    await Member.insertMany(allMemberIds.map((id) => ({
        roomId: room._id,
        hermesUserId: id,
    })));
    logger.info(`Group room created: "${name}" (${room._id})`);
    return room;
};
// ── Delete room ───────────────────────────────────────────────────────────────
export const deleteRoom = async (roomId, hermesUserId) => {
    const room = await Room.findById(roomId);
    if (!room)
        return { success: false, error: "Room not found" };
    const isAdmin = room.admins.some((a) => a.toString() === hermesUserId);
    if (room.type === "group" && !isAdmin) {
        return { success: false, error: "Only admins can delete groups" };
    }
    room.isDeleted = true;
    await room.save();
    await Member.updateMany({ roomId }, { isActive: false });
    logger.info(`Room deleted: ${roomId}`);
    return { success: true };
};
// ── Add member ────────────────────────────────────────────────────────────────
export const addMember = async (roomId, requesterId, newMemberId) => {
    const room = await Room.findById(roomId);
    if (!room || room.isDeleted)
        return { success: false, error: "Room not found" };
    if (room.type !== "group")
        return { success: false, error: "Can only add members to groups" };
    const isAdmin = room.admins.some((a) => a.toString() === requesterId);
    if (!isAdmin)
        return { success: false, error: "Only admins can add members" };
    const alreadyMember = room.members.some((m) => m.toString() === newMemberId);
    if (alreadyMember)
        return { success: false, error: "Already a member" };
    room.members.push(newMemberId);
    await room.save();
    await Member.findOneAndUpdate({ roomId, hermesUserId: newMemberId }, { isActive: true, joinedAt: new Date() }, { upsert: true, new: true });
    return { success: true };
};
// ── Remove member ─────────────────────────────────────────────────────────────
export const removeMember = async (roomId, requesterId, targetId) => {
    const room = await Room.findById(roomId);
    if (!room || room.isDeleted)
        return { success: false, error: "Room not found" };
    const isAdmin = room.admins.some((a) => a.toString() === requesterId);
    if (!isAdmin && requesterId !== targetId) {
        return { success: false, error: "Not authorized" };
    }
    room.members = room.members.filter((m) => m.toString() !== targetId);
    room.admins = room.admins.filter((a) => a.toString() !== targetId);
    await room.save();
    await Member.findOneAndUpdate({ roomId, hermesUserId: targetId }, { isActive: false, leftAt: new Date() });
    return { success: true };
};
// ── Get user rooms ────────────────────────────────────────────────────────────
export const getUserRooms = async (hermesUserId) => {
    try {
        const memberships = await Member.find({
            hermesUserId: hermesUserId,
            isActive: true,
        });
        if (!memberships.length)
            return [];
        const roomIds = memberships.map((m) => m.roomId);
        const rooms = await Room.find({ _id: { $in: roomIds }, isDeleted: false })
            .populate("lastMessage")
            .sort({ lastActivity: -1 });
        return rooms.map((room) => {
            const obj = room.toObject();
            const membership = memberships.find((m) => m.roomId.toString() === room._id.toString());
            return {
                ...obj,
                id: obj._id,
                unreadCount: membership?.unreadCount ?? 0,
                isMuted: membership?.isMuted ?? false,
                isPinned: membership?.isPinned ?? false,
            };
        });
    }
    catch (err) {
        console.error("[roomService] Error in getUserRooms:", err);
        throw err;
    }
};
// ── Get single room with access check ────────────────────────────────────────
export const getRoom = async (roomId, hermesUserId) => {
    const room = await Room.findById(roomId);
    if (!room || room.isDeleted)
        return { error: "Room not found" };
    const isMember = room.members.some((m) => m.toString() === hermesUserId);
    if (!isMember)
        return { error: "Access denied" };
    return { room };
};
//# sourceMappingURL=roomService.js.map