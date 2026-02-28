import { Schema, model, Document, Types } from "mongoose";

export interface IMember extends Document {
  roomId: Types.ObjectId;
  hermesUserId: Types.ObjectId; // ref HermesUser._id
  lastRead?: Types.ObjectId;
  lastReadAt?: Date;
  unreadCount: number;
  isMuted: boolean;
  isPinned: boolean;
  joinedAt: Date;
  leftAt?: Date;
  isActive: boolean;
}

const memberSchema = new Schema<IMember>(
  {
    roomId: { type: Schema.Types.ObjectId, ref: "HermesRoom", required: true },
    hermesUserId: {
      type: Schema.Types.ObjectId,
      ref: "HermesUser",
      required: true,
    },
    lastRead: { type: Schema.Types.ObjectId, ref: "HermesMessage" },
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

memberSchema.index({ roomId: 1, hermesUserId: 1 }, { unique: true });
memberSchema.index({ hermesUserId: 1, isActive: 1 });

export const Member = model<IMember>("HermesMember", memberSchema);
