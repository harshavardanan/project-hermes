import { Schema, model, Document, Types } from "mongoose";
const memberSchema = new Schema({
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
}, { timestamps: true });
memberSchema.index({ roomId: 1, hermesUserId: 1 }, { unique: true });
memberSchema.index({ hermesUserId: 1, isActive: 1 });
export const Member = model("HermesMember", memberSchema);
// 👇 ADD THIS AT THE VERY BOTTOM 👇
// This forces MongoDB to delete the old broken index.
Member.collection.dropIndex("roomId_1_userId_1").catch((err) => {
    console.log(err);
});
//# sourceMappingURL=Member.js.map