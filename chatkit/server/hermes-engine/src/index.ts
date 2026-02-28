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
import { HermesUser } from "./models/HermesUser.js";
import healthRouter from "./routes/health.js";
import metricsRouter from "./routes/metrics.js";
import historyRouter from "./routes/history.js";
import uploadRouter from "./routes/upload.js";
import { logger } from "./utils/logger.js";
import { v2 as cloudinary } from "cloudinary";

export const initHermes = (io: Server, app: Application) => {
  // ── Cloudinary ──────────────────────────────────────────────────────────────
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  // ── Socket namespace ────────────────────────────────────────────────────────
  initHermesSocket(io);

  // ── REST router ─────────────────────────────────────────────────────────────
  const hermesRouter = Router();
  hermesRouter.use(hermesApiLimiter);

  // ── POST /hermes/connect ────────────────────────────────────────────────────
  // Joe's backend calls this on behalf of Dan/John/Romeo
  // apiKey + secret = Joe's credentials
  // userId = Dan's ID in Joe's own database
  // displayName, avatar, email = Dan's profile info from Joe's database
  hermesRouter.post("/connect", async (req: Request, res: Response) => {
    try {
      const { apiKey, secret, userId, displayName, avatar, email } = req.body;

      if (!apiKey || !secret || !userId) {
        return res.status(400).json({
          success: false,
          message: "apiKey, secret, and userId are required",
        });
      }

      if (!displayName) {
        return res.status(400).json({
          success: false,
          message: "displayName is required",
        });
      }

      // Validate Joe's project credentials
      const { valid, project, error } = await validateProjectCredentials(
        apiKey,
        secret,
      );
      if (!valid)
        return res.status(401).json({ success: false, message: error });

      // Find or create a HermesUser for Dan under Joe's project
      // Dan is identified by his ID in Joe's system + Joe's projectId
      // With this:
      const hermesUser = await HermesUser.findOneAndUpdate(
        { externalId: userId, projectId: project._id },
        {
          $set: {
            displayName,
            ...(avatar && { avatar }),
            ...(email && { email }),
          },
          $setOnInsert: {
            externalId: userId,
            projectId: project._id,
          },
        },
        { upsert: true, new: true },
      );

      // Issue Hermes JWT
      const token = signHermesToken({
        hermesUserId: hermesUser._id.toString(),
        externalId: userId,
        projectId: project._id.toString(),
        displayName: hermesUser.displayName,
        apiKey,
      });

      logger.info(
        `Hermes connect: ${displayName} (${hermesUser._id}) via "${project.projectName}"`,
      );

      res.json({
        success: true,
        token,
        user: {
          hermesUserId: hermesUser._id.toString(),
          externalId: userId,
          displayName: hermesUser.displayName,
          avatar: hermesUser.avatar,
          email: hermesUser.email,
        },
      });
    } catch (err) {
      logger.error("Hermes connect error", err);
      res.status(500).json({ success: false, message: "Connection failed" });
    }
  });

  // ── Sub-routers ─────────────────────────────────────────────────────────────
  hermesRouter.use("/", healthRouter);
  hermesRouter.use("/", metricsRouter);
  hermesRouter.use("/", historyRouter);
  hermesRouter.use("/", uploadRouter);

  app.use("/hermes", hermesRouter);
  logger.info("✅ Hermes Engine initialized on /hermes");
};
