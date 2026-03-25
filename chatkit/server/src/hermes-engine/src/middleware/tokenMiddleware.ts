import type { Socket } from "socket.io";
import { Plan } from "../../../models/Plans.js";
import User from "../../../models/Users.js";
import { logger } from "../utils/logger.js";

interface ExtendedError extends Error {
  data?: any;
}

export const tokenMiddleware = async (
  socket: Socket,
  next: (err?: ExtendedError) => void,
) => {
  try {
    const user = await User.findById(socket.data.userId).populate("plan");
    if (!user) {
      return next(new Error("Authentication error: User not found"));
    }

    if (!user.plan) {
      // Free migration logic handled at login in production, but fallback here
      const freePlan = await Plan.findOne({ planId: "free" });
      if (freePlan) {
        user.plan = freePlan._id;
        await user.save();
      }
    }

    // Attach user and plan details to the socket data
    socket.data.user = user;
    socket.data.planLimit = (user.plan as any)?.dailyLimit || 1000; // fallback limit
    socket.data.dailyTokensUsed = user.dailyTokensUsed || 0;

    next();
  } catch (err) {
    logger.error("[Socket Auth] Token middleware error", err);
    next(new Error("Authentication error"));
  }
};
