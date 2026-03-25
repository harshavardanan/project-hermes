import { Router } from "express";
import type { Request, Response } from "express";
import os from "os";
import mongoose from "mongoose";
import { hermesApiLimiter } from "../middleware/rateLimit.js";
import { getCached, setCached } from "../../../config/redis.js";

const router = Router();
const startTime = Date.now();

router.get("/health", hermesApiLimiter, async (_req: Request, res: Response) => {
  try {
    const cached = await getCached("hermes:health");
    if (cached) return res.json(JSON.parse(cached));

    const mem = process.memoryUsage();
    const mongoState = [
      "disconnected",
      "connected",
      "connecting",
      "disconnecting",
    ];

    const healthData = {
      status: "ok",
      uptime: Math.floor((Date.now() - startTime) / 1000),
      version: "1.0.0",
      environment: process.env.NODE_ENV || "development",
      pid: process.pid,
      nodeVersion: process.version,
      platform: process.platform,
      memory: {
        used: Math.round(mem.rss / 1024 / 1024),
        heapUsed: Math.round(mem.heapUsed / 1024 / 1024),
        heapTotal: Math.round(mem.heapTotal / 1024 / 1024),
        external: Math.round(mem.external / 1024 / 1024),
        total: Math.round(os.totalmem() / 1024 / 1024),
        free: Math.round(os.freemem() / 1024 / 1024),
      },
      cpu: {
        usage: parseFloat((process.cpuUsage().user / 1000000).toFixed(2)),
        loadAverage: os.loadavg().map((v) => parseFloat(v.toFixed(2))),
        cores: os.cpus().length,
      },
      database: {
        status: mongoState[mongoose.connection.readyState] || "unknown",
        name: mongoose.connection.name || "hermes",
      },
      instances: 1,
    };

    await setCached("hermes:health", JSON.stringify(healthData), 3); // Cache 3s
    res.json(healthData);
  } catch {
    res.status(500).json({ status: "error" });
  }
});

export default router;
