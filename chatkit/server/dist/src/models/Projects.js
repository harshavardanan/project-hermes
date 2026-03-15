import mongoose, { Schema, model, Document, Types } from "mongoose";
const ProjectSchema = new Schema({
    projectName: { type: String, required: true },
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    projectId: { type: String, required: true, unique: true },
    apiKey: { type: String, required: true, unique: true },
    secret: { type: String, required: true },
    region: { type: String, default: "us-east-1" },
    endpoint: { type: String, default: "http://localhost:8080" },
    plan: {
        type: Schema.Types.ObjectId,
        ref: "Plan",
        required: true,
    },
    usage: {
        dailyTokens: { type: Number, default: 0 },
        totalTokensAllTime: { type: Number, default: 0 },
        lastResetDate: { type: Date, default: Date.now },
    },
    createdAt: { type: Date, default: Date.now },
});
// --- Middleware to Auto-Populate Plan ---
// This ensures that whenever you find a project, the limits/price are attached.
ProjectSchema.pre("findOne", function () {
    this.populate("plan");
});
ProjectSchema.pre("find", function () {
    this.populate("plan");
});
// --- Model Export ---
// We check if the model already exists to prevent "OverwriteModelError"
// which happens frequently with hot-reloading in dev.
export const Project = mongoose.models.Project || model("Project", ProjectSchema);
//# sourceMappingURL=Projects.js.map