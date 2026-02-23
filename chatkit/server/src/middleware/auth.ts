import type { Request, Response, NextFunction } from "express"; // 👈 Add 'type' here

// Standard check for James and Tom
export const isAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res
    .status(401)
    .json({ error: "Unauthorized", message: "Please log in to continue." });
};

// Specialized check for YOU
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  // Check if session exists AND the user document has isAdmin: true
  const user = req.user as any;
  if (req.isAuthenticated() && user?.isAdmin === true) {
    return next();
  }

  // If they are logged in but NOT an admin
  res.status(403).json({
    error: "Forbidden",
    message: "Access denied. Administrator privileges required.",
  });
};
