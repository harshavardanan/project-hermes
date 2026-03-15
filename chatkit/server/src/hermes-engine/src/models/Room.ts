import { Schema, model, Document, Types } from "mongoose";

export type RoomType = "direct" | "group";

export interface IRoom extends Document {
  name?: string;
  type: RoomType;
  projectId: Types.ObjectId; // which project this room belongs to
  createdBy: Types.ObjectId; // ref HermesUser._id
  members: Types.ObjectId[]; // ref HermesUser._id array
  admins: Types.ObjectId[]; // ref HermesUser._id array
  avatar?: string;
  description?: string;
  lastMessage?: Types.ObjectId; // ref HermesMessage._id
  lastActivity: Date;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const roomSchema = new Schema<IRoom>(
  {
    name: { type: String },
    type: { type: String, enum: ["direct", "group"], required: true },
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "HermesUser",
      required: true,
    },
    members: [{ type: Schema.Types.ObjectId, ref: "HermesUser" }],
    admins: [{ type: Schema.Types.ObjectId, ref: "HermesUser" }],
    avatar: { type: String },
    description: { type: String },
    lastMessage: { type: Schema.Types.ObjectId, ref: "HermesMessage" },
    lastActivity: { type: Date, default: Date.now },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

roomSchema.index({ projectId: 1, members: 1 });
roomSchema.index({ lastActivity: -1 });

export const Room = model<IRoom>("HermesRoom", roomSchema);
