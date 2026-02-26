import { Room, type IRoom } from "../models/Room.js";
import { Member } from "../models/Member.js";
import { logger } from "../utils/logger.js";

// ── Create a direct (1-1) room ────────────────────────────────────────────────
export const createDirectRoom = async (
  hermesIdA: string,
  hermesIdB: string,
): Promise<IRoom> => {
  // Check if DM already exists between these two users
  const existing = await Room.findOne({
    type: "direct",
    members: { $all: [hermesIdA, hermesIdB], $size: 2 },
    isDeleted: false,
  });
  if (existing) return existing;

  const room = await Room.create({
    type: "direct",
    createdBy: hermesIdA,
    members: [hermesIdA, hermesIdB],
    admins: [],
    lastActivity: new Date(),
  });

  // Create member entries for both
  await Member.insertMany([
    { roomId: room.id, hermesId: hermesIdA },
    { roomId: room.id, hermesId: hermesIdB },
  ]);

  logger.info(
    `Direct room created: ${room.id} between ${hermesIdA} & ${hermesIdB}`,
  );
  return room;
};

// ── Create a group room ───────────────────────────────────────────────────────
export const createGroupRoom = async (
  creatorId: string,
  name: string,
  memberIds: string[],
  description?: string,
  avatar?: string,
): Promise<IRoom> => {
  const allMembers = Array.from(new Set([creatorId, ...memberIds]));

  const room = await Room.create({
    type: "group",
    name,
    description,
    avatar,
    createdBy: creatorId,
    members: allMembers,
    admins: [creatorId],
    lastActivity: new Date(),
  });

  await Member.insertMany(
    allMembers.map((id) => ({ roomId: room.id, hermesId: id })),
  );

  logger.info(`Group room created: "${name}" (${room.id}) by ${creatorId}`);
  return room;
};

// ── Delete a group room ───────────────────────────────────────────────────────
export const deleteRoom = async (
  roomId: string,
  requesterId: string,
): Promise<{ success: boolean; error?: string }> => {
  const room = await Room.findById(roomId);
  if (!room) return { success: false, error: "Room not found" };
  if (room.type === "group" && !room.admins.includes(requesterId)) {
    return { success: false, error: "Only admins can delete groups" };
  }

  room.isDeleted = true;
  await room.save();

  await Member.updateMany({ roomId }, { isActive: false });

  logger.info(`Room deleted: ${roomId} by ${requesterId}`);
  return { success: true };
};

// ── Add member to group ───────────────────────────────────────────────────────
export const addMember = async (
  roomId: string,
  requesterId: string,
  newMemberId: string,
): Promise<{ success: boolean; error?: string }> => {
  const room = await Room.findById(roomId);
  if (!room || room.isDeleted)
    return { success: false, error: "Room not found" };
  if (room.type !== "group")
    return { success: false, error: "Can only add members to groups" };
  if (!room.admins.includes(requesterId))
    return { success: false, error: "Only admins can add members" };
  if (room.members.includes(newMemberId))
    return { success: false, error: "Already a member" };

  room.members.push(newMemberId);
  await room.save();

  await Member.findOneAndUpdate(
    { roomId, hermesId: newMemberId },
    { isActive: true, joinedAt: new Date() },
    { upsert: true, new: true },
  );

  return { success: true };
};

// ── Remove member from group ──────────────────────────────────────────────────
export const removeMember = async (
  roomId: string,
  requesterId: string,
  targetId: string,
): Promise<{ success: boolean; error?: string }> => {
  const room = await Room.findById(roomId);
  if (!room || room.isDeleted)
    return { success: false, error: "Room not found" };
  if (!room.admins.includes(requesterId) && requesterId !== targetId) {
    return { success: false, error: "Not authorized" };
  }

  room.members = room.members.filter((m) => m !== targetId);
  room.admins = room.admins.filter((a) => a !== targetId);
  await room.save();

  await Member.findOneAndUpdate(
    { roomId, hermesId: targetId },
    { isActive: false, leftAt: new Date() },
  );

  return { success: true };
};

// ── Get all rooms for a user ──────────────────────────────────────────────────
export const getUserRooms = async (hermesId: string) => {
  const memberships = await Member.find({ hermesId, isActive: true });
  const roomIds = memberships.map((m) => m.roomId);

  const rooms = await Room.find({
    _id: { $in: roomIds },
    isDeleted: false,
  }).sort({ lastActivity: -1 });

  // Attach unread count from member record
  return rooms.map((room) => {
    const membership = memberships.find((m) => m.roomId === room.id);
    return {
      ...room.toObject(),
      unreadCount: membership?.unreadCount ?? 0,
      isMuted: membership?.isMuted ?? false,
      isPinned: membership?.isPinned ?? false,
    };
  });
};

// ── Get single room (with access check) ──────────────────────────────────────
export const getRoom = async (
  roomId: string,
  hermesId: string,
): Promise<{ room?: IRoom; error?: string }> => {
  const room = await Room.findById(roomId);
  if (!room || room.isDeleted) return { error: "Room not found" };
  if (!room.members.includes(hermesId)) return { error: "Access denied" };
  return { room };
};
