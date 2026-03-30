import { Schema, model, Document, Types } from "mongoose";

export type MessageType =
  | "text"
  | "link"
  | "image"
  | "video"
  | "audio"
  | "document";
export type DeliveryStatus = "sent" | "delivered" | "seen";

export interface IReaction {
  emoji: string;
  users: Types.ObjectId[]; // ref HermesUser._id
}

export interface IMessage extends Document {
  roomId: Types.ObjectId;
  senderId: Types.ObjectId; // ref HermesUser._id
  type: MessageType;
  text?: string; // encrypted at rest
  url?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  thumbnail?: string;
  replyTo?: Types.ObjectId;
  threadParentId?: Types.ObjectId; // ref to parent message for threaded replies
  replyCount: number; // cached count of thread replies
  pinnedAt?: Date;
  pinnedBy?: Types.ObjectId; // ref HermesUser._id — who pinned the message
  reactions: IReaction[];
  deliveryStatus: DeliveryStatus;
  seenBy: Types.ObjectId[]; // ref HermesUser._id array
  isDeleted: boolean;
  deletedAt?: Date;
  editedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const reactionSchema = new Schema<IReaction>(
  {
    emoji: { type: String, required: true },
    users: [{ type: Schema.Types.ObjectId, ref: "HermesUser" }],
  },
  { _id: false },
);

const messageSchema = new Schema<IMessage>(
  {
    roomId: { type: Schema.Types.ObjectId, ref: "HermesRoom", required: true },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "HermesUser",
      required: true,
    },
    type: {
      type: String,
      enum: ["text", "link", "image", "video", "audio", "document"],
      required: true,
    },
    text: { type: String },
    url: { type: String },
    fileName: { type: String },
    fileSize: { type: Number },
    mimeType: { type: String },
    thumbnail: { type: String },
    replyTo: { type: Schema.Types.ObjectId, ref: "HermesMessage" },
    threadParentId: { type: Schema.Types.ObjectId, ref: "HermesMessage" },
    replyCount: { type: Number, default: 0 },
    pinnedAt: { type: Date },
    pinnedBy: { type: Schema.Types.ObjectId, ref: "HermesUser" },
    reactions: [reactionSchema],
    deliveryStatus: {
      type: String,
      enum: ["sent", "delivered", "seen"],
      default: "sent",
    },
    seenBy: [{ type: Schema.Types.ObjectId, ref: "HermesUser" }],
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
    editedAt: { type: Date },
  },
  { timestamps: true },
);

// ── Indexes ───────────────────────────────────────────────────────────────────
messageSchema.index({ roomId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1 });
messageSchema.index({ threadParentId: 1, createdAt: -1 }); // thread replies
messageSchema.index({ roomId: 1, pinnedAt: 1 }); // pinned messages per room
messageSchema.index({ roomId: 1, text: "text" }); // text search index

export const Message = model<IMessage>("HermesMessage", messageSchema);
