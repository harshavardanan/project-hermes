import mongoose, { Schema, Model } from "mongoose";
import type { IUser } from "../types/user.js";

// Update your interface in ../types/user.ts to include: isAdmin?: boolean;

const userSchema: Schema<IUser> = new Schema({
  googleId: String,
  githubId: String,
  microsoftId: String,
  displayName: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  avatar: String,
  // --- PRIORITY 5: PER-USER PRICING ---
  plan: { type: Schema.Types.ObjectId, ref: "Plan", default: null }, // Handled in migration at login
  dailyTokensUsed: { type: Number, default: 0 },
  dailyTokensReset: { type: Date, default: Date.now },
  // --- THE ADMIN FLAG ---
  isAdmin: { type: Boolean, default: false }, // 🔒 Default is false for everyone
  createdAt: { type: Date, default: Date.now },
});

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", userSchema);
export default User;
