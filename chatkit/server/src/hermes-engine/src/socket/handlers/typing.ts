import type { Socket, Server } from "socket.io";
import { logger } from "../../utils/logger.js";

// ── Typing ────────────────────────────────────────────────────────────────────
// Server-side TTL map ensures stale "typing" indicators are cleaned up even if
// the client disconnects mid-keystroke.
const typingTimers = new Map<string, NodeJS.Timeout>();

export const handleTyping = (socket: Socket, io: Server) => {
  const { hermesUserId, displayName } = (socket as any).hermesUser;

  socket.on("typing:start", (data) => {
    const { roomId } = data;
    if (!roomId) return;

    const key = `${hermesUserId}:${roomId}`;

    // Clear existing timer if any
    if (typingTimers.has(key)) {
      clearTimeout(typingTimers.get(key));
    }

    // Set 5s TTL — auto-stop if client doesn't send another start within 5s
    const timer = setTimeout(() => {
      typingTimers.delete(key);
      socket
        .to(roomId)
        .emit("typing:stopped", { userId: hermesUserId, displayName, roomId });
    }, 5000);
    typingTimers.set(key, timer);

    socket
      .to(roomId)
      .emit("typing:started", { userId: hermesUserId, displayName, roomId });
  });

  socket.on("typing:stop", (data) => {
    const { roomId } = data;
    if (!roomId) return;

    const key = `${hermesUserId}:${roomId}`;
    if (typingTimers.has(key)) {
      clearTimeout(typingTimers.get(key));
      typingTimers.delete(key);
    }

    socket
      .to(roomId)
      .emit("typing:stopped", { userId: hermesUserId, displayName, roomId });
  });

  // Clean up timers for this user on disconnect
  socket.on("disconnect", () => {
    for (const [key, timer] of typingTimers.entries()) {
      if (key.startsWith(`${hermesUserId}:`)) {
        clearTimeout(timer);
        typingTimers.delete(key);
      }
    }
  });
};
