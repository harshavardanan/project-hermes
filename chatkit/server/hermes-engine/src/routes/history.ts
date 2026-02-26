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
      const userId = (req as any).hermesUser.userId;

      const result = await getHistory(
        roomId,
        userId,
        before as string | undefined,
        limit ? parseInt(limit as string) : undefined,
      );

      if (result.error) {
        return res.status(403).json({ success: false, error: result.error });
      }

      res.json({ success: true, ...result });
    } catch {
      res
        .status(500)
        .json({ success: false, error: "Failed to fetch history" });
    }
  },
);

export default router;
