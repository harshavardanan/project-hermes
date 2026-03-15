import { Schema, model, Document } from "mongoose";
const docSchema = new Schema({
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    content: { type: Schema.Types.Mixed, required: true },
    status: { type: String, enum: ["draft", "published"], default: "draft" },
    lastUpdated: { type: Date, default: Date.now },
    order: { type: Number, default: 0 },
    category: { type: String, default: "General" },
}, {
    timestamps: true,
});
export const Doc = model("Doc", docSchema);
//# sourceMappingURL=Document.js.map