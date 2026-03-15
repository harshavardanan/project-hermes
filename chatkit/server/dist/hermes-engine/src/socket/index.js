import { hermesSocketAuth } from "../middleware/auth.js";
import { handleConnection } from "./handlers/connection.js";
import { handleMessaging } from "./handlers/messaging.js";
import { handleRooms } from "./handlers/rooms.js";
import { handlePresence, handleTyping, handleReceipts, handleReactions, } from "./handlers/presence.js";
import { logger } from "../utils/logger.js";
export const initHermesSocket = (io) => {
    const hermes = io.of("/hermes");
    hermes.use(hermesSocketAuth);
    hermes.on("connection", async (socket) => {
        // ✅ Use hermesUserId — matches what auth middleware sets
        const { hermesUserId, displayName } = socket.hermesUser;
        logger.info(`New connection: ${hermesUserId} [${socket.id}]`);
        try {
            await handleConnection(socket, hermes);
            handleMessaging(socket, hermes);
            handleRooms(socket, hermes);
            handlePresence(socket, hermes);
            handleTyping(socket, hermes);
            handleReceipts(socket, hermes);
            handleReactions(socket, hermes);
            socket.on("ping", (data) => {
                socket.emit("pong", { timestamp: data?.timestamp ?? Date.now() });
            });
            socket.on("error", (err) => {
                logger.error(`Socket error [${hermesUserId}]`, err);
            });
        }
        catch (err) {
            logger.error(`Connection setup failed [${hermesUserId}]`, err);
            socket.disconnect(true);
        }
    });
    logger.info("Hermes Socket.io namespace /hermes initialized");
    return hermes;
};
//# sourceMappingURL=index.js.map