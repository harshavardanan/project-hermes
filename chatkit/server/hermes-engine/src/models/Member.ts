import { Schema, model, Document, Types } from "mongoose";

export interface IMember extends Document {
  roomId: Types.ObjectId; // ref to HermesRoom._id
  userId: Types.ObjectId; // ref to main User._id (NOT a separate hermesId)
  lastRead?: Types.ObjectId; // last message _id this user has read
  lastReadAt?: Date;
  unreadCount: number;
  isMuted: boolean;
  isPinned: boolean;
  joinedAt: Date;
  leftAt?: Date;
  isActive: boolean; // false = left the room
}

const memberSchema = new Schema<IMember>(
  {
    roomId: {
      type: Schema.Types.ObjectId,
      ref: "HermesRoom",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lastRead: {
      type: Schema.Types.ObjectId,
      ref: "HermesMessage",
    },
    lastReadAt: { type: Date },
    unreadCount: { type: Number, default: 0 },
    isMuted: { type: Boolean, default: false },
    isPinned: { type: Boolean, default: false },
    joinedAt: { type: Date, default: Date.now },
    leftAt: { type: Date },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

// Unique per user per room
memberSchema.index({ roomId: 1, userId: 1 }, { unique: true });
memberSchema.index({ userId: 1, isActive: 1 });

export const Member = model<IMember>("HermesMember", memberSchema);
