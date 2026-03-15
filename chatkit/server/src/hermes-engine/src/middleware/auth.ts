import type { Request, Response, NextFunction } from "express";
import type { Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { Project } from "../../../models/Projects.js";
import { HermesUser } from "../models/HermesUser.js";
import { logger } from "../utils/logger.js";

const HERMES_SECRET = process.env.HERMES_JWT_SECRET as string;

export interface HermesTokenPayload {
  hermesUserId: string; // Internal ID
  externalId: string; // Third-party ID
  projectId: string; // Associated Project
  displayName: string;
  apiKey: string;
}

// ── Sign a Hermes JWT ─────────────────────────────────────────────────────────
export const signHermesToken = (payload: HermesTokenPayload): string => {
  return jwt.sign(payload, HERMES_SECRET, { expiresIn: "7d" });
};

// ── Verify a Hermes JWT ───────────────────────────────────────────────────────
export const verifyHermesToken = (token: string): HermesTokenPayload => {
  return jwt.verify(token, HERMES_SECRET) as HermesTokenPayload;
};

// ── REST middleware: verify JWT on protected HTTP routes (Fixes history.ts) ───
export const hermesAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ success: false, message: "No token provided" });
    }
    const token = authHeader.split(" ")[1];
    const payload = verifyHermesToken(token);

    // Attach the payload to the request object for use in controllers
    (req as any).hermesUser = payload;

    next();
  } catch (err) {
    logger.error("REST auth failed", err);
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired token" });
  }
};

// ── Socket middleware: verify JWT on every socket connection ──────────────────
export const hermesSocketAuth = async (
  socket: Socket,
  next: (err?: Error) => void,
) => {
  try {
    const authHeader =
      socket.handshake.auth?.token || socket.handshake.headers?.authorization;

    if (!authHeader) return next(new Error("HERMES_AUTH_MISSING"));

    // Handle both "Bearer <token>" and raw token strings
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : authHeader;

    const payload = verifyHermesToken(token);

    // Verify this HermesUser still exists in DB
    const user = await HermesUser.findById(payload.hermesUserId);
    if (!user) return next(new Error("HERMES_USER_NOT_FOUND"));

    // 🚨 SYNCED ATTACHMENT: Ensures handleRooms and initHermesSocket see the same ID
    const userData = {
      hermesUserId: payload.hermesUserId,
      projectId: payload.projectId,
      displayName: payload.displayName,
      externalId: payload.externalId,
    };

    (socket as any).hermesUser = userData;
    (socket as any).hermesUserDoc = user;

    // Also attach to standard socket.data for session:init
    socket.data.user = userData;

    logger.socket("AUTH_OK", payload.hermesUserId, `@${payload.displayName}`);
    next();
  } catch (err) {
    logger.error("Socket auth failed", err);
    next(new Error("HERMES_AUTH_INVALID"));
  }
};

// ── Validate apiKey + secret against Projects collection ─────────────────────
export const validateProjectCredentials = async (
  apiKey: string,
  secret: string,
): Promise<{ valid: boolean; project?: any; error?: string }> => {
  try {
    const project = await Project.findOne({ apiKey }).populate("plan");
    if (!project) return { valid: false, error: "Invalid API key" };
    if (project.secret !== secret)
      return { valid: false, error: "Invalid secret" };
    return { valid: true, project };
  } catch (err) {
    logger.error("Credential validation failed", err);
    return { valid: false, error: "Validation error" };
  }
};
