import type { Application } from "express";
import type { Server } from "socket.io";
import { Router } from "express";
import type { Request, Response } from "express";
import { initHermesSocket } from "./socket/index.js";
import { hermesApiLimiter } from "./middleware/rateLimit.js";
import {
  hermesAuth,
  validateProjectCredentials,
  signHermesToken,
} from "./middleware/auth.js";
import User from "../../src/models/Users.js";
import healthRouter from "./routes/health.js";
import metricsRouter from "./routes/metrics.js";
import historyRouter from "./routes/history.js";
import uploadRouter from "./routes/upload.js";
import { logger } from "./utils/logger.js";
import { v2 as cloudinary } from "cloudinary";
import "dotenv/config";

export const initHermes = (io: Server, app: Application) => {
  // ── Cloudinary config ───────────────────────────────────────────────────────
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  // ── Socket.io /hermes namespace ─────────────────────────────────────────────
  initHermesSocket(io);

  // ── REST router ─────────────────────────────────────────────────────────────
  const hermesRouter = Router();
  hermesRouter.use(hermesApiLimiter);

  // ── POST /hermes/connect ────────────────────────────────────────────────────
  // SDK calls this first — exchanges apiKey + secret + userId for a Hermes JWT
  hermesRouter.post("/connect", async (req: Request, res: Response) => {
    try {
      const { apiKey, secret, userId, username, avatar } = req.body;

      if (!apiKey || !secret || !userId) {
        return res.status(400).json({
          success: false,
          message: "apiKey, secret, and userId are required",
        });
      }

      // Validate project credentials against Projects collection
      const { valid, project, error } = await validateProjectCredentials(
        apiKey,
        secret,
      );
      if (!valid) {
        return res.status(401).json({ success: false, message: error });
      }

      // Find user in main Users collection by their _id
      const user = await User.findById(userId);
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      // Issue Hermes JWT using the existing User._id as identifier
      const token = signHermesToken({
        userId: user._id.toString(),
        displayName: user.displayName,
        projectId: project._id.toString(),
        apiKey,
      });

      logger.info(
        `Hermes connect: ${user._id} via project "${project.projectName}"`,
      );

      res.json({
        success: true,
        token,
        user: {
          userId: user._id.toString(),
          displayName: user.displayName,
          avatar: user.avatar,
          email: user.email,
        },
      });
    } catch (err) {
      logger.error("Hermes connect error", err);
      res.status(500).json({ success: false, message: "Connection failed" });
    }
  });

  // ── Mount all sub-routers ───────────────────────────────────────────────────
  hermesRouter.use("/", healthRouter); // GET /hermes/health
  hermesRouter.use("/", metricsRouter); // GET /hermes/metrics
  hermesRouter.use("/", historyRouter); // GET /hermes/history/:roomId
  hermesRouter.use("/", uploadRouter); // POST /hermes/upload

  // ── Mount everything under /hermes ──────────────────────────────────────────
  app.use("/hermes", hermesRouter);

  logger.info("✅ Hermes Engine initialized on /hermes");
};
