import { useCallback } from "react";
import type { HermesClient } from "../../core/HermesClient";
import type { Reaction } from "../../types/index";

// ── useReactions ──────────────────────────────────────────────────────────────
// Handles adding/toggling reactions on messages.
// Real-time updates are handled inside useMessages automatically.
//
// Usage:
//   const { react, hasReacted, getCount } = useReactions(client, roomId);
//   await react("messageId", "👍");

export const useReactions = (client: HermesClient, roomId: string | null) => {
  // Add or toggle a reaction
  const react = useCallback(
    async (messageId: string, emoji: string) => {
      if (!roomId) throw new Error("No room selected");
      await client.addReaction(messageId, roomId, emoji);
    },
    [roomId, client],
  );

  // Check if the current user has reacted with a specific emoji
  const hasReacted = useCallback(
    (reactions: Reaction[], emoji: string): boolean => {
      const userId = client.currentUser?.userId;
      if (!userId) return false;
      return (
        reactions.find((r) => r.emoji === emoji)?.users.includes(userId) ??
        false
      );
    },
    [client],
  );

  // Get total count of a specific emoji reaction
  const getCount = useCallback(
    (reactions: Reaction[], emoji: string): number => {
      return reactions.find((r) => r.emoji === emoji)?.users.length ?? 0;
    },
    [],
  );

  // Get all unique emojis used on a message
  const getEmojis = useCallback((reactions: Reaction[]): string[] => {
    return reactions.filter((r) => r.users.length > 0).map((r) => r.emoji);
  }, []);

  return { react, hasReacted, getCount, getEmojis };
};
