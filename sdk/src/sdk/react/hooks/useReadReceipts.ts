import { useState, useEffect, useCallback } from "react";
import type { HermesClient } from "../../core/HermesClient";
import type { ReceiptEvent } from "../../types/index";

// ── useReadReceipts ───────────────────────────────────────────────────────────
// Tracks who has seen which message in a room.
//
// Usage:
//   const { markSeen, seenBy } = useReadReceipts(client, roomId);
//   const readers = seenBy("messageId");

export const useReadReceipts = (
  client: HermesClient,
  roomId: string | null,
) => {
  // Map of messageId → Set of userIds who have seen it
  const [receipts, setReceipts] = useState<Map<string, Set<string>>>(new Map());

  useEffect(() => {
    if (!roomId) return;

    const onReceipt = (event: ReceiptEvent) => {
      if (event.roomId !== roomId) return;
      setReceipts((prev) => {
        const next = new Map(prev);
        const existing = next.get(event.lastMessageId) ?? new Set();
        existing.add(event.userId);
        next.set(event.lastMessageId, existing);
        return next;
      });
    };

    client.on("receipt:updated", onReceipt);
    return () => client.off("receipt:updated", onReceipt);
  }, [roomId, client]);

  // Mark all messages as seen up to this message
  const markSeen = useCallback(
    async (lastMessageId: string) => {
      if (!roomId) return;
      await client.markSeen(roomId, lastMessageId);
    },
    [roomId, client],
  );

  // Get list of userIds who have seen a specific message
  const seenBy = useCallback(
    (messageId: string): string[] => {
      return Array.from(receipts.get(messageId) ?? []);
    },
    [receipts],
  );

  return { markSeen, seenBy, receipts };
};
