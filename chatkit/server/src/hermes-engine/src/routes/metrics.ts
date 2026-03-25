import { Router } from "express";
import type { Request, Response } from "express";
import User from "../../../models/Users.js";
import { Room } from "../models/Room.js";
import { Message } from "../models/Message.js";
import { hermesApiLimiter } from "../middleware/rateLimit.js";
import { getCached, setCached } from "../../../config/redis.js";

const router = Router();

let messageCount = 0;
const startTime = Date.now();

export const incrementMessageCount = () => messageCount++;

// ── GET /hermes/metrics ───────────────────────────────────────────────────────
router.get("/metrics", hermesApiLimiter, async (_req: Request, res: Response) => {
  try {
    const cached = await getCached("hermes:metrics");
    if (cached) return res.json(JSON.parse(cached));

    const [activeConnections, rooms, totalMessages] = await Promise.all([
      User.countDocuments({ isOnline: true }),
      Room.countDocuments({ isDeleted: false }),
      Message.countDocuments({ isDeleted: false }),
    ]);

    const uptimeSeconds = Math.max((Date.now() - startTime) / 1000, 1);

    const metricsData = {
      activeConnections,
      rooms,
      totalMessages,
      messagesPerSecond: parseFloat((messageCount / uptimeSeconds).toFixed(2)),
    };

    await setCached("hermes:metrics", JSON.stringify(metricsData), 2); // Cache 2s
    res.json(metricsData);
  } catch {
    res.status(500).json({ error: "Metrics unavailable" });
  }
});

export default router;
