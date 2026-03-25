import cron from "node-cron";
import User from "../models/Users.js";
import { logger } from "../hermes-engine/src/utils/logger.js";

export const startCronJobs = (): void => {
  // Reset every user's daily token usage at midnight UTC
  cron.schedule(
    "0 0 * * *",
    async () => {
      try {
        const result = await User.updateMany(
          {},
          { $set: { dailyTokensUsed: 0, dailyTokensReset: new Date() } },
        );
        logger.info(
          `[Cron] Daily token reset: ${result.modifiedCount} users reset`,
        );
      } catch (err) {
        logger.error("[Cron] Daily token reset failed", err);
      }
    },
    { timezone: "UTC" },
  );

  logger.info("[Cron] Daily token reset job scheduled (00:00 UTC)");
};
