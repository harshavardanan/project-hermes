import type { Socket } from "socket.io";
import { Project } from "../../../models/Projects.js";
import { Plan } from "../../../models/Plans.js";
import User from "../../../models/Users.js";
import { logger } from "../utils/logger.js";

interface ExtendedError extends Error {
  data?: any;
}

/**
 * Socket middleware: resolves the project owner's plan and daily token usage
 * for quota enforcement. Works with the Hermes JWT payload (hermesUserId,
 * projectId) rather than the platform User._id, fixing the SDK compatibility
 * bug where `socket.data.userId` was undefined.
 */
export const tokenMiddleware = async (
  socket: Socket,
  next: (err?: ExtendedError) => void,
) => {
  try {
    const hermesData = (socket as any).hermesUser;
    if (!hermesData?.projectId) {
      logger.warn("[TokenMW] No projectId on socket — skipping quota attach");
      // Allow connection but without quota tracking (e.g., admin sockets)
      socket.data.planLimit = Infinity;
      socket.data.dailyTokensUsed = 0;
      return next();
    }

    // Look up the project → owner → plan chain
    const project = await Project.findById(hermesData.projectId).lean();
    if (!project) {
      logger.warn(
        `[TokenMW] Project ${hermesData.projectId} not found — using defaults`,
      );
      socket.data.planLimit = 1000;
      socket.data.dailyTokensUsed = 0;
      return next();
    }

    const owner = await User.findById((project as any).userId).populate("plan");
    if (!owner) {
      logger.warn(
        `[TokenMW] Project owner not found — using default limits`,
      );
      socket.data.planLimit = 1000;
      socket.data.dailyTokensUsed = 0;
      return next();
    }

    // If owner has no plan, assign the free plan
    if (!owner.plan) {
      const freePlan = await Plan.findOne({ planId: "free" });
      if (freePlan) {
        owner.plan = freePlan._id;
        await owner.save();
      }
    }

    // Attach quota data for downstream handlers
    socket.data.owner = owner;
    socket.data.planLimit = (owner.plan as any)?.dailyLimit || 1000;
    socket.data.dailyTokensUsed = owner.dailyTokensUsed || 0;

    next();
  } catch (err) {
    logger.error("[TokenMW] Error resolving quota", err);
    // Non-fatal: allow connection with conservative defaults
    socket.data.planLimit = 1000;
    socket.data.dailyTokensUsed = 0;
    next();
  }
};
