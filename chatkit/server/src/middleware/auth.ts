import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// JWT-based authentication middleware
export const isAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ error: "Unauthorized", message: "Please log in to continue." });
  }

  try {
    const token = authHeader.split(" ")[1];
    const payload = jwt.verify(token, process.env.SESSION_SECRET!);
    (req as any).user = payload;
    return next();
  } catch {
    return res
      .status(401)
      .json({ error: "Unauthorized", message: "Invalid or expired token." });
  }
};

// Admin check — requires valid JWT + isAdmin flag
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  if (user?.isAdmin === true) {
    return next();
  }

  res.status(403).json({
    error: "Forbidden",
    message: "Access denied. Administrator privileges required.",
  });
};
