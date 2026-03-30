import type { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { getRedis } from "../../../config/redis.js";
import { hermesSocketAuth } from "../middleware/auth.js";
import { tokenMiddleware } from "../middleware/tokenMiddleware.js";
import { handleConnection } from "./handlers/connection.js";
import { handleMessaging } from "./handlers/messaging.js";
import { handleRooms } from "./handlers/rooms.js";
import { handlePresence, handlePinning, handleSearch } from "./handlers/presence.js";
import { handleTyping } from "./handlers/typing.js";
import { handleReceipts } from "./handlers/receipts.js";
import { handleReactions } from "./handlers/reactions.js";
import { logger } from "../utils/logger.js";

export const initHermesSocket = (io: Server) => {
  const hermes = io.of("/hermes");
  const redisClient = getRedis();

  if (redisClient) {
    // Duplicate the client for sub/pub as required by @socket.io/redis-adapter
    const pubClient = redisClient.duplicate();
    const subClient = redisClient.duplicate();
    io.adapter(createAdapter(pubClient, subClient));
    logger.info("[Socket] Redis adapter attached");
  }

  hermes.use(hermesSocketAuth);
  hermes.use(tokenMiddleware);

  hermes.on("connection", async (socket) => {
    const { hermesUserId, displayName } = (socket as any).hermesUser;
    logger.info(`New connection: ${hermesUserId} [${socket.id}]`);

    try {
      await handleConnection(socket, hermes as any);

      // ── Feature handlers ────────────────────────────────────────────────
      handleMessaging(socket, hermes as any);
      handleRooms(socket, hermes as any);
      handlePresence(socket, hermes as any);
      handleTyping(socket, hermes as any);
      handleReceipts(socket, hermes as any);
      handleReactions(socket, hermes as any);
      handlePinning(socket, hermes as any);
      handleSearch(socket, hermes as any);

      // ── Heartbeat ───────────────────────────────────────────────────────
      socket.on("ping", (data) => {
        socket.emit("pong", { timestamp: data?.timestamp ?? Date.now() });
      });

      socket.on("error", (err) => {
        logger.error(`Socket error [${hermesUserId}]`, err);
      });
    } catch (err) {
      logger.error(`Connection setup failed [${hermesUserId}]`, err);
      socket.disconnect(true);
    }
  });

  logger.info("Hermes Socket.io namespace /hermes initialized");
  return hermes;
};
