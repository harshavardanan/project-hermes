import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import passport from "passport";
import "dotenv/config";

const router = Router();
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (_req: Request, res: Response) => {
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

    res.send(`
  <script>
    if (window.opener) {
      window.opener.postMessage({ type: 'HERMES_AUTH_SUCCESS' }, "${frontendUrl}");
      window.close();
    } else {
      window.location.href = "${frontendUrl}";
    }
  </script>
`);
  },
);

router.get("/logout", (req: Request, res: Response, next: NextFunction) => {
  req.logout((err) => {
    if (err) return next(err);

    req.session.destroy((err) => {
      if (err) return next(err);

      res.clearCookie("connect.sid", {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        domain: process.env.NODE_ENV === "production" ? ".railway.app" : undefined, // Adjust if using custom domain
      });

      return res.redirect(process.env.FRONTEND_URL!);
    });
  });
});
router.get("/me", async (req: Request, res: Response) => {
  if (req.user) {
    const { default: User } = await import("../models/Users.js");
    const user = await User.findById((req.user as any)._id).populate("plan");
    res.json(user);
  } else {
    // 401 is standard for guest users
    res.status(401).json({ message: "Unauthorized" });
  }
});

router.put("/me", async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const { displayName } = req.body;
    
    if (!displayName || typeof displayName !== "string" || displayName.trim() === "") {
      res.status(400).json({ message: "Invalid display name" });
      return;
    }

    const { default: User } = await import("../models/Users.js");
    const updatedUser = await User.findByIdAndUpdate(
      (req.user as any)._id,
      { $set: { displayName: displayName.trim() } },
      { new: true }
    ).populate("plan");

    if (!updatedUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.json(updatedUser);
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
