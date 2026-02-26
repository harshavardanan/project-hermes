import rateLimit from "express-rate-limit";

// ── REST API rate limiter ─────────────────────────────────────────────────────
export const hermesApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests, slow down." },
});

// ── Upload rate limiter ───────────────────────────────────────────────────────
export const hermesUploadLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20,
  message: {
    success: false,
    message: "Upload limit reached. Try again shortly.",
  },
});

// ── Socket-level in-memory rate limiter ──────────────────────────────────────
// Tracks message count per hermesId in a rolling window
const socketRateLimits = new Map<string, { count: number; resetAt: number }>();

const SOCKET_WINDOW_MS = 5000; // 5 second window
const SOCKET_MAX_MESSAGES = 10; // max 10 messages per 5 seconds

export const checkSocketRateLimit = (hermesId: string): boolean => {
  const now = Date.now();
  const record = socketRateLimits.get(hermesId);

  if (!record || now > record.resetAt) {
    socketRateLimits.set(hermesId, {
      count: 1,
      resetAt: now + SOCKET_WINDOW_MS,
    });
    return true; // allowed
  }

  if (record.count >= SOCKET_MAX_MESSAGES) {
    return false; // blocked
  }

  record.count++;
  return true; // allowed
};

// Cleanup stale entries every 30 seconds
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of socketRateLimits.entries()) {
    if (now > val.resetAt) socketRateLimits.delete(key);
  }
}, 30_000);
