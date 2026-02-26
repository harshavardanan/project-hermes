import { Schema, model, Document, Types } from "mongoose";

export type RoomType = "direct" | "group";

export interface IRoom extends Document {
  name?: string; // only for group rooms
  type: RoomType;
  createdBy: Types.ObjectId; // ref to main User._id
  members: Types.ObjectId[]; // ref to main User._id array
  admins: Types.ObjectId[]; // group admins
  avatar?: string;
  description?: string;
  lastMessage?: Types.ObjectId; // ref to Message._id
  lastActivity: Date;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const roomSchema = new Schema<IRoom>(
  {
    name: { type: String },
    type: {
      type: String,
      enum: ["direct", "group"],
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    admins: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    avatar: { type: String },
    description: { type: String },
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: "HermesMessage",
    },
    lastActivity: { type: Date, default: Date.now },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

roomSchema.index({ members: 1 });
roomSchema.index({ type: 1 });
roomSchema.index({ lastActivity: -1 });

export const Room = model<IRoom>("HermesRoom", roomSchema);
