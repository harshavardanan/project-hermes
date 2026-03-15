import { Schema, model, Document, Types } from "mongoose";
const roomSchema = new Schema({
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
}, { timestamps: true });
roomSchema.index({ projectId: 1, members: 1 });
roomSchema.index({ lastActivity: -1 });
export const Room = model("HermesRoom", roomSchema);
//# sourceMappingURL=Room.js.map