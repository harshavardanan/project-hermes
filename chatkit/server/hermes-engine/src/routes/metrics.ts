import { Router } from "express";
import type { Request, Response } from "express";
import User from "../../../src/models/Users.js";
import { Room } from "../models/Room.js";
import { Message } from "../models/Message.js";

const router = Router();

let messageCount = 0;
const startTime = Date.now();

export const incrementMessageCount = () => messageCount++;

// ── GET /hermes/metrics ───────────────────────────────────────────────────────
router.get("/metrics", async (_req: Request, res: Response) => {
  try {
    const [activeConnections, rooms, totalMessages] = await Promise.all([
      User.countDocuments({ isOnline: true }),
      Room.countDocuments({ isDeleted: false }),
      Message.countDocuments({ isDeleted: false }),
    ]);

    const uptimeSeconds = Math.max((Date.now() - startTime) / 1000, 1);

    res.json({
      activeConnections,
      rooms,
      totalMessages,
      messagesPerSecond: parseFloat((messageCount / uptimeSeconds).toFixed(2)),
    });
  } catch {
    res.status(500).json({ error: "Metrics unavailable" });
  }
});

export default router;
