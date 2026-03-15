import mongoose, { Schema, Model } from "mongoose";
// Update your interface in ../types/user.ts to include: isAdmin?: boolean;
const userSchema = new Schema({
    googleId: String,
    githubId: String,
    microsoftId: String,
    displayName: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    avatar: String,
    // --- THE ADMIN FLAG ---
    isAdmin: { type: Boolean, default: false }, // 🔒 Default is false for everyone
    createdAt: { type: Date, default: Date.now },
});
const User = mongoose.model("User", userSchema);
export default User;
//# sourceMappingURL=Users.js.map