import { Router } from "express";
import passport from "passport";
import "dotenv/config";
const router = Router();
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get("/google/callback", passport.authenticate("google", { failureRedirect: "/login" }), (_req, res) => {
    const frontendUrl = process.env.FRONTEND_URL;
    res.send(`
      <script>
        if (window.opener) {
          // Sending object to match your frontend listener
          window.opener.postMessage({ type: 'AUTH_SUCCESS' }, "${frontendUrl}");
          window.close();
        } else {
          // Fallback if popup was opened directly
          window.location.href = "${frontendUrl}/dashboard";
        }
      </script>
    `);
});
router.get("/logout", (req, res, next) => {
    req.logout((err) => {
        if (err)
            return next(err);
        req.session.destroy((err) => {
            if (err)
                return next(err);
            res.clearCookie("connect.sid", {
                path: "/",
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
            });
            return res.redirect(process.env.FRONTEND_URL || "http://localhost:5173");
        });
    });
});
router.get("/me", (req, res) => {
    if (req.user) {
        res.json(req.user);
    }
    else {
        // 401 is standard for guest users
        res.status(401).json({ message: "Unauthorized" });
    }
});
export default router;
//# sourceMappingURL=auth.js.map