import { Router } from "express";
import type { Request, Response } from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import "dotenv/config";

const router = Router();

// --- Google OAuth (unchanged — Passport handles the redirect dance) ---
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"], session: false }),
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login", session: false }),
  (req: Request, res: Response) => {
    const user = req.user as any;
    const frontendUrl = process.env.FRONTEND_URL;

    // Sign a JWT with the user's MongoDB _id
    const token = jwt.sign(
      { _id: user._id, isAdmin: user.isAdmin },
      process.env.SESSION_SECRET!,
      { expiresIn: "7d" },
    );

    // Redirect to the frontend /auth/callback page with the token in the hash.
    // Using a hash fragment keeps the token out of server logs and referrer headers.
    // The frontend callback page handles both the popup-close and new-tab cases.
    res.redirect(`${frontendUrl}/auth/callback#token=${token}`);
  },
);

// --- Logout (client-side only — just clear localStorage) ---
router.get("/logout", (_req: Request, res: Response) => {
  const frontendUrl = process.env.FRONTEND_URL;
  res.json({ message: "Logged out", redirectUrl: frontendUrl });
});

// --- Get Current User (JWT-based) ---
router.get("/me", async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const payload = jwt.verify(
      authHeader.split(" ")[1],
      process.env.SESSION_SECRET!,
    ) as any;

    // Always fetch fresh data from DB (plan changes, admin status, etc.)
    const { default: User } = await import("../models/Users.js");
    const user = await User.findById(payload._id).populate("plan");

    if (!user) return res.status(401).json({ message: "User not found" });
    res.json(user);
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
});

// --- Update Profile (JWT-based) ---
router.put("/me", async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const payload = jwt.verify(
      authHeader.split(" ")[1],
      process.env.SESSION_SECRET!,
    ) as any;

    const { displayName } = req.body;

    if (!displayName || typeof displayName !== "string" || displayName.trim() === "") {
      return res.status(400).json({ message: "Invalid display name" });
    }

    const { default: User } = await import("../models/Users.js");
    const updatedUser = await User.findByIdAndUpdate(
      payload._id,
      { $set: { displayName: displayName.trim() } },
      { new: true },
    ).populate("plan");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
