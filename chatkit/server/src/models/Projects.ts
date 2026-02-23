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

// Use a standard function, NOT an arrow function
ProjectSchema.pre("validate", async function () {
  if (this.plan) return;
  try {
    const PlanModel = mongoose.model("Plan");
    const freePlan = await PlanModel.findOne({ planId: "free" });
    if (freePlan) {
      this.plan = freePlan._id as Types.ObjectId;
    } else {
      console.warn("⚠️ 'free' planId not found in DB.");
    }
  } catch (err) {
    console.error("❌ Middleware Error:", err);
    throw err;
  }
});

ProjectSchema.pre("findOne", function () {
  this.populate("plan");
});

ProjectSchema.pre("find", function () {
  this.populate("plan");
});

export const Project = model<IProject>("Project", ProjectSchema);
