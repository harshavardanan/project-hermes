import { Redis } from "ioredis";
import { logger } from "../hermes-engine/src/utils/logger.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let redisClient: any = null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getRedis = (): any => redisClient;

export const connectRedis = (): void => {
  const url = process.env.REDIS_URL;
  if (!url) {
    console.warn(
      "[Redis] REDIS_URL not set — caching disabled. Set REDIS_URL for production.",
    );
    return;
  }
  try {
    redisClient = new Redis(url, {
      maxRetriesPerRequest: 3,
      enableOfflineQueue: false,
    });
    redisClient.on("connect", () => logger.info("[Redis] Connected ✅"));
    redisClient.on("error", (err: Error) =>
      console.warn("[Redis] Error (non-fatal):", err.message),
    );
  } catch (err) {
    console.warn("[Redis] Failed to initialise (non-fatal):", err);
    redisClient = null;
  }
};

// ── Helpers ──────────────────────────────────────────────────────────────────
export const getCached = async (key: string): Promise<string | null> => {
  if (!redisClient) return null;
  try {
    return await redisClient.get(key);
  } catch {
    return null;
  }
};

export const setCached = async (
  key: string,
  value: string,
  ttlSeconds: number,
): Promise<void> => {
  if (!redisClient) return;
  try {
    await redisClient.set(key, value, "EX", ttlSeconds);
  } catch { /* silent */ }
};

export const delCached = async (...keys: string[]): Promise<void> => {
  if (!redisClient) return;
  try {
    await redisClient.del(...keys);
  } catch { /* silent */ }
};
