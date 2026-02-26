import type { Application } from "express";
import type { Server } from "socket.io";
import { Router } from "express";
import type { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { initHermesSocket } from "./socket/index.js";
import { hermesApiLimiter } from "./middleware/rateLimit.js";
import {
  hermesAuth,
  validateProjectCredentials,
  signHermesToken,
} from "./middleware/auth.js";
import User from "../../src/models/Users.js";
import healthRouter from "./routes/health.js";
import historyRouter from "./routes/history.js";
import { logger } from "./utils/logger.js";
import { v2 as cloudinary } from "cloudinary";

export const initHermes = (io: Server, app: Application) => {
  // ── Cloudinary config ───────────────────────────────────────────────────────
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  // ── Socket.io namespace ─────────────────────────────────────────────────────
  initHermesSocket(io);

  // ── REST router ─────────────────────────────────────────────────────────────
  const hermesRouter = Router();
  hermesRouter.use(hermesApiLimiter);

  // ── POST /hermes/connect ────────────────────────────────────────────────────
  // SDK calls this first to exchange apiKey+secret+userId for a Hermes JWT
  hermesRouter.post("/connect", async (req: Request, res: Response) => {
    try {
      const { apiKey, secret, userId, username, avatar, email } = req.body;

      if (!apiKey || !secret || !userId) {
        return res.status(400).json({
          success: false,
          message: "apiKey, secret, and userId are required",
        });
      }

      // Validate project credentials against main DB
      const { valid, project, error } = await validateProjectCredentials(
        apiKey,
        secret,
      );
      if (!valid) {
        return res.status(401).json({ success: false, message: error });
      }

      // Find or create HermesUser linked to the external userId
      let user = await User.findOne({ externalId: userId });
      if (!user) {
        user = await User.create({
          hermesId: uuidv4(),
          externalId: userId,
          username: username || `user_${userId.slice(-6)}`,
          email: email || `${userId}@hermes.local`,
          avatar,
        });
        logger.info(`New Hermes user registered: ${user.hermesId}`);
      } else {
        // Update profile info if changed
        if (username) user.username = username;
        if (avatar) user.avatar = avatar;
        await user.save();
      }

      // Issue Hermes JWT
      const token = signHermesToken({
        hermesId: user.hermesId,
        externalId: userId,
        username: user.username,
        projectId: project._id.toString(),
        apiKey,
      });

      logger.info(
        `Hermes connect: ${user.hermesId} via project ${project.projectName}`,
      );

      res.json({
        success: true,
        token,
        hermesId: user.hermesId,
        user: {
          hermesId: user.hermesId,
          username: user.username,
          avatar: user.avatar,
          email: user.email,
        },
      });
    } catch (err) {
      logger.error("Hermes connect error", err);
      res.status(500).json({ success: false, message: "Connection failed" });
    }
  });

  // ── Mount sub-routers ────────────────────────────────────────────────────────
  hermesRouter.use("/", healthRouter);
  hermesRouter.use("/", historyRouter);

  // ── Mount all under /hermes ──────────────────────────────────────────────────
  app.use("/hermes", hermesRouter);

  logger.info("✅ Hermes Engine initialized on /hermes");
};
