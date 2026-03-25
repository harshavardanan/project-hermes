import mongoose, { Schema, model, Document, Types } from "mongoose";

export interface IProject extends Document {
  projectName: string;
  userId: Types.ObjectId;
  projectId: string;
  apiKey: string;
  secret: string;
  endpoint: string;
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
  endpoint: { type: String, default: "" },
  usage: {
    dailyTokens: { type: Number, default: 0 },
    totalTokensAllTime: { type: Number, default: 0 },
    lastResetDate: { type: Date, default: Date.now },
  },
  createdAt: { type: Date, default: Date.now },
});

// --- Model Export ---
// We check if the model already exists to prevent "OverwriteModelError"
// which happens frequently with hot-reloading in dev.
export const Project =
  mongoose.models.Project || model<IProject>("Project", ProjectSchema);
