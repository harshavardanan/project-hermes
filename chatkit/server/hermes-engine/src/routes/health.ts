import { Router } from "express";
import type { Request, Response } from "express";

const router = Router();

const startTime = Date.now();

// ── GET /hermes/health ────────────────────────────────────────────────────────
router.get("/health", (_req: Request, res: Response) => {
  try {
    res.json({
      status: "ok",
      uptime: Math.floor((Date.now() - startTime) / 1000),
      version: "1.0.0",
      environment: process.env.NODE_ENV || "development",
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      },
      cpu: parseFloat((process.cpuUsage().user / 1000000).toFixed(2)),
      instances: 1,
    });
  } catch {
    res.status(500).json({ status: "error" });
  }
});

export default router;
