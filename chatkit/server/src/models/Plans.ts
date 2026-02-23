import { Schema, model, Document } from "mongoose";

export interface IPlan extends Document {
  planId: string; // e.g., "free", "standard", "pro"
  name: string; // e.g., "Professional"
  dailyLimit: number;
  monthlyPrice: number;
  features: string[];
}

const PlanSchema = new Schema<IPlan>({
  planId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  dailyLimit: { type: Number, required: true },
  monthlyPrice: { type: Number, required: true },
  features: [{ type: String }],
});

export const Plan = model<IPlan>("Plan", PlanSchema);
