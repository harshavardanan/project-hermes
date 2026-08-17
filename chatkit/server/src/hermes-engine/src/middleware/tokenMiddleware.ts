import type { Socket } from "socket.io";
import { Project } from "../../../models/Projects.js";
import { Plan } from "../../../models/Plans.js";
import User from "../../../models/Users.js";
import { logger } from "../utils/logger.js";

interface ExtendedError extends Error {
  data?: any;
}

/**
 * Socket middleware: ensures the project owner has a plan assigned before
 * the connection proceeds. Quota enforcement itself happens per-message
 * against the DB in messageService.sendMessage — never cached on the socket,
 * since sockets stay connected across the daily token reset.
 */
export const tokenMiddleware = async (
  socket: Socket,
  next: (err?: ExtendedError) => void,
) => {
  try {
    const hermesData = (socket as any).hermesUser;
    if (!hermesData?.projectId) {
      return next();
    }

    const project = await Project.findById(hermesData.projectId).lean();
    if (!project) {
      logger.warn(
        `[TokenMW] Project ${hermesData.projectId} not found — skipping plan check`,
      );
      return next();
    }

    const owner = await User.findById((project as any).userId);
    if (!owner) {
      logger.warn("[TokenMW] Project owner not found — skipping plan check");
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

    next();
  } catch (err) {
    logger.error("[TokenMW] Error resolving plan", err);
    next();
  }
};
