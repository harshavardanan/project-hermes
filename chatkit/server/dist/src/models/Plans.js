import { Schema, model, Document } from "mongoose";
const PlanSchema = new Schema({
    planId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    dailyLimit: { type: Number, required: true },
    monthlyPrice: { type: Number, required: true },
    features: [{ type: String }],
});
export const Plan = model("Plan", PlanSchema);
//# sourceMappingURL=Plans.js.map