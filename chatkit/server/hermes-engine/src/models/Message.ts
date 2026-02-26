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
  users: Types.ObjectId[]; // ref to main User._id
}

export interface IMessage extends Document {
  roomId: Types.ObjectId; // ref to HermesRoom._id
  senderId: Types.ObjectId; // ref to main User._id
  type: MessageType;
  text?: string; // encrypted at rest
  url?: string; // for link/media/doc
  fileName?: string;
  fileSize?: number; // bytes
  mimeType?: string;
  thumbnail?: string; // video/image preview url
  replyTo?: Types.ObjectId; // ref to another Message._id
  reactions: IReaction[];
  deliveryStatus: DeliveryStatus;
  seenBy: Types.ObjectId[]; // ref to main User._id array
  isDeleted: boolean;
  deletedAt?: Date;
  editedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const reactionSchema = new Schema<IReaction>(
  {
    emoji: { type: String, required: true },
    users: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { _id: false },
);

const messageSchema = new Schema<IMessage>(
  {
    roomId: {
      type: Schema.Types.ObjectId,
      ref: "HermesRoom",
      required: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["text", "link", "image", "video", "audio", "document"],
      required: true,
    },
    text: { type: String }, // stored encrypted
    url: { type: String },
    fileName: { type: String },
    fileSize: { type: Number },
    mimeType: { type: String },
    thumbnail: { type: String },
    replyTo: {
      type: Schema.Types.ObjectId,
      ref: "HermesMessage",
    },
    reactions: [reactionSchema],
    deliveryStatus: {
      type: String,
      enum: ["sent", "delivered", "seen"],
      default: "sent",
    },
    seenBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
    editedAt: { type: Date },
  },
  { timestamps: true },
);

messageSchema.index({ roomId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1 });
messageSchema.index({ replyTo: 1 });

export const Message = model<IMessage>("HermesMessage", messageSchema);
