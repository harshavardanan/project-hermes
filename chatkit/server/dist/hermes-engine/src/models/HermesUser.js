import { Schema, model, Document, Types } from "mongoose";
const hermesUserSchema = new Schema({
    externalId: { type: String, required: true },
    projectId: {
        type: Schema.Types.ObjectId,
        ref: "Project",
        required: true,
    },
    displayName: { type: String, required: true },
    avatar: { type: String },
    email: { type: String },
    isOnline: { type: Boolean, default: false },
    lastSeen: { type: Date, default: Date.now },
}, { timestamps: true });
// A user is unique per project — Dan in Joe's app ≠ Dan in another app
hermesUserSchema.index({ externalId: 1, projectId: 1 }, { unique: true });
hermesUserSchema.index({ projectId: 1 });
export const HermesUser = model("HermesUser", hermesUserSchema);
//# sourceMappingURL=HermesUser.js.map