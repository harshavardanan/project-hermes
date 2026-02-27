import { useState, useEffect, useCallback } from "react";
import type { HermesClient } from "../../core/HermesClient.js";

// ── usePresence ───────────────────────────────────────────────────────────────
// Tracks online/offline status of users.
//
// Usage:
//   const { isOnline, onlineUsers } = usePresence(client);
//   const online = isOnline("userId123");

export const usePresence = (client: HermesClient) => {
  const [onlineMap, setOnlineMap] = useState<Map<string, boolean>>(new Map());

  useEffect(() => {
    const onOnline = ({ userId }: { userId: string }) => {
      setOnlineMap((prev) => new Map(prev).set(userId, true));
    };

    const onOffline = ({ userId }: { userId: string }) => {
      setOnlineMap((prev) => new Map(prev).set(userId, false));
    };

    client.on("user:online", onOnline);
    client.on("user:offline", onOffline);

    return () => {
      client.off("user:online", onOnline);
      client.off("user:offline", onOffline);
    };
  }, [client]);

  const isOnline = useCallback(
    (userId: string): boolean => onlineMap.get(userId) ?? false,
    [onlineMap],
  );

  const onlineUsers = Array.from(onlineMap.entries())
    .filter(([, online]) => online)
    .map(([userId]) => userId);

  return { isOnline, onlineUsers, onlineMap };
};
