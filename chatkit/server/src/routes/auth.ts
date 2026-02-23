import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import passport from "passport";
import "dotenv/config"; // Using modern import instead of require

const router = Router();

// Google Routes
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (_req: Request, res: Response) => {
    res.send(`
      <script>
        window.opener.postMessage({ type: 'AUTH_SUCCESS' }, "*");
        window.close();
      </script>
    `);
  },
);

/**
 * GET /auth/logout
 * Destroys session and handles cross-origin cleanup
 */
router.get("/logout", (req: Request, res: Response, next: NextFunction) => {
  // 1. Passport Logout
  req.logout((err) => {
    if (err) return next(err);

    // 2. Destroy the Session Store entry
    req.session.destroy((err) => {
      if (err) return next(err);

      // 3. Clear the Browser Cookie
      res.clearCookie("connect.sid", {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });

      // 4. Final Redirect to Frontend
      // Note: We don't use res.json here because the redirect handles the response
      return res.redirect(process.env.FRONTEND_URL || "http://localhost:5173");
    });
  });
});

/**
 * GET /auth/me
 * Returns current user including isAdmin status for frontend logic
 */
router.get("/me", (req: Request, res: Response) => {
  if (req.user) {
    res.json(req.user);
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
});

export default router;
