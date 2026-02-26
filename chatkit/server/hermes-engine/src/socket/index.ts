import type { Server } from "socket.io";
import { hermesSocketAuth } from "../middleware/auth.js";
import { handleConnection } from "./handlers/connection.js";
import { handleMessaging } from "./handlers/messaging.js";
import { handleRooms } from "./handlers/rooms.js";
import {
  handlePresence,
  handleTyping,
  handleReceipts,
  handleReactions,
} from "./handlers/presence.js";
import { logger } from "../utils/logger.js";

export const initHermesSocket = (io: Server) => {
  // All Hermes socket traffic goes through the /hermes namespace
  const hermes = io.of("/hermes");

  // ── Auth middleware on every connection ─────────────────────────────────────
  hermes.use(hermesSocketAuth);

  // ── Connection handler ──────────────────────────────────────────────────────
  hermes.on("connection", async (socket) => {
    const { hermesId } = (socket as any).hermesUser;
    logger.info(`New connection: ${hermesId} [${socket.id}]`);

    try {
      // Register connection and join rooms
      await handleConnection(socket, hermes as any);

      // Wire all event handlers
      handleMessaging(socket, hermes as any);
      handleRooms(socket, hermes as any);
      handlePresence(socket, hermes as any);
      handleTyping(socket, hermes as any);
      handleReceipts(socket, hermes as any);
      handleReactions(socket, hermes as any);

      // ── Ping/pong for status page latency check ───────────────────────────
      socket.on("ping", (data) => {
        socket.emit("pong", { timestamp: data?.timestamp ?? Date.now() });
      });

      // ── Error handler ─────────────────────────────────────────────────────
      socket.on("error", (err) => {
        logger.error(`Socket error [${hermesId}]`, err);
      });
    } catch (err) {
      logger.error(`Connection setup failed [${hermesId}]`, err);
      socket.disconnect(true);
    }
  });

  logger.info("Hermes Socket.io namespace /hermes initialized");
  return hermes;
};
