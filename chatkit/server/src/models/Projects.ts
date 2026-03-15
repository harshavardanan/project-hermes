import mongoose, { Schema, model, Document, Types } from "mongoose";

export interface IProject extends Document {
  projectName: string;
  userId: Types.ObjectId;
  projectId: string;
  apiKey: string;
  secret: string;
  region: string;
  endpoint: string;
  plan: Types.ObjectId;
  usage: {
    dailyTokens: number;
    totalTokensAllTime: number;
    lastResetDate: Date;
  };
  createdAt: Date;
}

const ProjectSchema = new Schema<IProject>({
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
  endpoint: { type: String, default: "" },
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
export const Project =
  mongoose.models.Project || model<IProject>("Project", ProjectSchema);
