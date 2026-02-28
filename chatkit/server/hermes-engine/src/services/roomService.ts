import { Types } from "mongoose";
import { Room, type IRoom } from "../models/Room.js";
import { Member } from "../models/Member.js";
import { logger } from "../utils/logger.js";

// ── Create direct room ────────────────────────────────────────────────────────
export const createDirectRoom = async (
  hermesUserIdA: string,
  hermesUserIdB: string,
  projectId: string,
): Promise<IRoom> => {
  // Check if DM already exists between these two users in this project
  const existing = await Room.findOne({
    type: "direct",
    projectId: new Types.ObjectId(projectId),
    members: {
      $all: [
        new Types.ObjectId(hermesUserIdA),
        new Types.ObjectId(hermesUserIdB),
      ],
      $size: 2,
    },
    isDeleted: false,
  });
  if (existing) return existing;

  const room = await Room.create({
    type: "direct",
    projectId: new Types.ObjectId(projectId),
    createdBy: new Types.ObjectId(hermesUserIdA),
    members: [
      new Types.ObjectId(hermesUserIdA),
      new Types.ObjectId(hermesUserIdB),
    ],
    admins: [],
    lastActivity: new Date(),
  });

  await Member.insertMany([
    { roomId: room._id, hermesUserId: new Types.ObjectId(hermesUserIdA) },
    { roomId: room._id, hermesUserId: new Types.ObjectId(hermesUserIdB) },
  ]);

  logger.info(`Direct room created: ${room._id}`);
  return room;
};

// ── Create group room ─────────────────────────────────────────────────────────
export const createGroupRoom = async (
  creatorId: string,
  projectId: string,
  name: string,
  memberIds: string[],
  description?: string,
  avatar?: string,
): Promise<IRoom> => {
  const allMemberIds = Array.from(new Set([creatorId, ...memberIds]));
  const memberObjectIds = allMemberIds.map((id) => new Types.ObjectId(id));

  const room = await Room.create({
    type: "group",
    name,
    description,
    avatar,
    projectId: new Types.ObjectId(projectId),
    createdBy: new Types.ObjectId(creatorId),
    members: memberObjectIds,
    admins: [new Types.ObjectId(creatorId)],
    lastActivity: new Date(),
  });

  await Member.insertMany(
    allMemberIds.map((id) => ({
      roomId: room._id,
      hermesUserId: new Types.ObjectId(id),
    })),
  );

  logger.info(`Group room created: "${name}" (${room._id})`);
  return room;
};

// ── Delete room ───────────────────────────────────────────────────────────────
export const deleteRoom = async (
  roomId: string,
  hermesUserId: string,
): Promise<{ success: boolean; error?: string }> => {
  const room = await Room.findById(roomId);
  if (!room) return { success: false, error: "Room not found" };

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

  const isAdmin = room.admins.some((a) => a.toString() === requesterId);
  if (!isAdmin) return { success: false, error: "Only admins can add members" };

  const alreadyMember = room.members.some((m) => m.toString() === newMemberId);
  if (alreadyMember) return { success: false, error: "Already a member" };

  room.members.push(new Types.ObjectId(newMemberId));
  await room.save();

  await Member.findOneAndUpdate(
    { roomId, hermesUserId: new Types.ObjectId(newMemberId) },
    { isActive: true, joinedAt: new Date() },
    { upsert: true, new: true },
  );

  return { success: true };
};

// ── Remove member ─────────────────────────────────────────────────────────────
export const removeMember = async (
  roomId: string,
  requesterId: string,
  targetId: string,
): Promise<{ success: boolean; error?: string }> => {
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

  await Member.findOneAndUpdate(
    { roomId, hermesUserId: new Types.ObjectId(targetId) },
    { isActive: false, leftAt: new Date() },
  );

  return { success: true };
};

// ── Get user rooms ────────────────────────────────────────────────────────────
export const getUserRooms = async (hermesUserId: string) => {
  const memberships = await Member.find({
    hermesUserId: new Types.ObjectId(hermesUserId),
    isActive: true,
  });

  const roomIds = memberships.map((m) => m.roomId);

  const rooms = await Room.find({ _id: { $in: roomIds }, isDeleted: false })
    .populate("lastMessage")
    .sort({ lastActivity: -1 });

  return rooms.map((room) => {
    const membership = memberships.find(
      (m) => m.roomId.toString() === room._id.toString(),
    );
    return {
      ...room.toObject(),
      unreadCount: membership?.unreadCount ?? 0,
      isMuted: membership?.isMuted ?? false,
      isPinned: membership?.isPinned ?? false,
    };
  });
};

// ── Get single room with access check ────────────────────────────────────────
export const getRoom = async (
  roomId: string,
  hermesUserId: string,
): Promise<{ room?: IRoom; error?: string }> => {
  const room = await Room.findById(roomId);
  if (!room || room.isDeleted) return { error: "Room not found" };

  const isMember = room.members.some((m) => m.toString() === hermesUserId);
  if (!isMember) return { error: "Access denied" };

  return { room };
};
