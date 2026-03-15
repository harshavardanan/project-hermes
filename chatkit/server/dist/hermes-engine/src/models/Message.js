import { Schema, model, Document, Types } from "mongoose";
const reactionSchema = new Schema({
    emoji: { type: String, required: true },
    users: [{ type: Schema.Types.ObjectId, ref: "HermesUser" }],
}, { _id: false });
const messageSchema = new Schema({
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
}, { timestamps: true });
messageSchema.index({ roomId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1 });
export const Message = model("HermesMessage", messageSchema);
//# sourceMappingURL=Message.js.map