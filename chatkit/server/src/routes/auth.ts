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
    const frontendUrl = process.env.FRONTEND_URL;

    res.send(`
  <script>
    if (window.opener) {
      window.opener.postMessage({ type: 'AUTH_SUCCESS' }, "${frontendUrl}");
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
        secure: true,
        sameSite: "none", // 👈 must match how cookie was set
      });

      return res.redirect(process.env.FRONTEND_URL!);
    });
  });
});
router.get("/me", (req: Request, res: Response) => {
  if (req.user) {
    res.json(req.user);
  } else {
    // 401 is standard for guest users
    res.status(401).json({ message: "Unauthorized" });
  }
});

export default router;
