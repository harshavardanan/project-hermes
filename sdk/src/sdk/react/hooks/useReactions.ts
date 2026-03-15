import { useCallback } from "react";
import type { HermesClient } from "../../core/HermesClient";
import type { Reaction } from "../../types/index";

export const useReactions = (client: HermesClient, roomId: string | null) => {
  
  const react = useCallback(
    async (messageId: string, emoji: string) => {
      if (!roomId) throw new Error("No room selected");
      await client.addReaction(messageId, roomId, emoji);
    },
    [roomId, client],
  );

  
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

  
  const getCount = useCallback(
    (reactions: Reaction[], emoji: string): number => {
      return reactions.find((r) => r.emoji === emoji)?.users.length ?? 0;
    },
    [],
  );

  
  const getEmojis = useCallback((reactions: Reaction[]): string[] => {
    return reactions.filter((r) => r.users.length > 0).map((r) => r.emoji);
  }, []);

  return { react, hasReacted, getCount, getEmojis };
};
