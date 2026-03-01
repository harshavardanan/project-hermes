import { Router } from "express";
import type { Request, Response } from "express";
import { hermesAuth } from "../middleware/auth.js";
import { getHistory } from "../services/messageService.js";

const router = Router();

// ── GET /hermes/history/:roomId ───────────────────────────────────────────────
// Query params: ?before=<messageId>&limit=<number>
router.get(
  "/history/:roomId",
  hermesAuth,
  async (req: Request, res: Response) => {
    try {
      const { roomId } = req.params;
      const { before, limit } = req.query;

      // 🚨 FIX: Matches the payload from auth.ts exactly
      const hermesUserId = (req as any).hermesUser.hermesUserId;

      const result = await getHistory(
        roomId,
        hermesUserId, // Pass the corrected ID here
        before as string | undefined,
        limit ? parseInt(limit as string) : undefined,
      );

      if (result.error) {
        return res.status(403).json({ success: false, error: result.error });
      }

      res.json({ success: true, ...result });
    } catch (err) {
      console.error("History Fetch Error:", err);
      res
        .status(500)
        .json({ success: false, error: "Failed to fetch history" });
    }
  },
);

export default router;
