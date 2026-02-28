import type { Request, Response, NextFunction } from "express";
import type { Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { Project } from "../../../src/models/Projects.js";
import { HermesUser } from "../models/HermesUser.js";
import { logger } from "../utils/logger.js";

const HERMES_SECRET = process.env.HERMES_JWT_SECRET as string;

export interface HermesTokenPayload {
  hermesUserId: string; // HermesUser._id (our internal ID)
  externalId: string; // Dan's ID in Joe's system
  projectId: string; // Joe's project _id
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

// ── REST middleware: verify JWT on protected HTTP routes ──────────────────────
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
    (req as any).hermesUser = payload;
    next();
  } catch {
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
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.split(" ")[1];

    if (!token)
      return next(new Error("HERMES_AUTH_MISSING: No token provided"));

    const payload = verifyHermesToken(token);

    // Verify this HermesUser still exists
    const user = await HermesUser.findById(payload.hermesUserId);
    if (!user) return next(new Error("HERMES_AUTH_INVALID: User not found"));

    // Attach full payload + user to socket
    (socket as any).hermesUser = payload;
    (socket as any).hermesUserDoc = user;

    logger.socket("AUTH_OK", payload.hermesUserId, `@${payload.displayName}`);
    next();
  } catch (err) {
    logger.error("Socket auth failed", err);
    next(new Error("HERMES_AUTH_FAILED: Invalid token"));
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
