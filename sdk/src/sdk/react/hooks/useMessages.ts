import { useState, useEffect, useCallback, useRef } from "react";
import type { HermesClient } from "../../core/HermesClient";
import type { Message, SendMessageInput } from "../../types/index";

// ── useMessages ───────────────────────────────────────────────────────────────
// Manages messages for a single room.
// Handles real-time updates, pagination, send, edit, delete.
//
// Usage:
//   const { messages, sendMessage, loadMore, hasMore, loading } = useMessages(client, roomId);

export const useMessages = (client: HermesClient, roomId: string | null) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const oldestMessageId = useRef<string | undefined>(undefined);

  // ── Load initial history ──────────────────────────────────────────────────
  useEffect(() => {
    if (!roomId || !client.isConnected) return;

    setMessages([]);
    setHasMore(false);
    oldestMessageId.current = undefined;
    setLoading(true);
    setError(null);

    client
      .getHistory(roomId)
      .then(({ messages: msgs, hasMore: more }) => {
        setMessages(msgs);
        setHasMore(more);
        if (msgs.length > 0) oldestMessageId.current = msgs[0]._id;
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [roomId, client.isConnected]);

  // ── Real-time incoming messages ───────────────────────────────────────────
  useEffect(() => {
    if (!roomId) return;

    const onReceive = (msg: Message) => {
      if (msg.roomId !== roomId) return;
      setMessages((prev) => {
        // Avoid duplicates
        if (prev.find((m) => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
    };

    const onDeleted = ({
      messageId,
    }: {
      messageId: string;
      roomId: string;
    }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m._id === messageId ? { ...m, isDeleted: true, text: undefined } : m,
        ),
      );
    };

    const onEdited = (msg: Message) => {
      setMessages((prev) => prev.map((m) => (m._id === msg._id ? msg : m)));
    };

    client.on("message:receive", onReceive);
    client.on("message:deleted", onDeleted);
    client.on("message:edited", onEdited);

    return () => {
      client.off("message:receive", onReceive);
      client.off("message:deleted", onDeleted);
      client.off("message:edited", onEdited);
    };
  }, [roomId, client]);

  // ── Reaction updates ──────────────────────────────────────────────────────
  useEffect(() => {
    const onReaction = ({ messageId, reactions }: any) => {
      setMessages((prev) =>
        prev.map((m) => (m._id === messageId ? { ...m, reactions } : m)),
      );
    };
    client.on("reaction:updated", onReaction);
    return () => client.off("reaction:updated", onReaction);
  }, [client]);

  // ── Load more (pagination) ────────────────────────────────────────────────
  const loadMore = useCallback(async () => {
    if (!roomId || loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const { messages: older, hasMore: more } = await client.getHistory(
        roomId,
        oldestMessageId.current,
      );
      setMessages((prev) => [...older, ...prev]);
      setHasMore(more);
      if (older.length > 0) oldestMessageId.current = older[0]._id;
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingMore(false);
    }
  }, [roomId, loadingMore, hasMore, client]);

  // ── Send ──────────────────────────────────────────────────────────────────
  const sendMessage = useCallback(
    async (input: Omit<SendMessageInput, "roomId">) => {
      if (!roomId) throw new Error("No room selected");
      return client.sendMessage({ ...input, roomId });
    },
    [roomId, client],
  );

  // ── Edit ──────────────────────────────────────────────────────────────────
  const editMessage = useCallback(
    async (messageId: string, text: string) => {
      if (!roomId) throw new Error("No room selected");
      return client.editMessage(messageId, roomId, text);
    },
    [roomId, client],
  );

  // ── Delete ────────────────────────────────────────────────────────────────
  const deleteMessage = useCallback(
    async (messageId: string) => {
      if (!roomId) throw new Error("No room selected");
      return client.deleteMessage(messageId, roomId);
    },
    [roomId, client],
  );

  // ── React ─────────────────────────────────────────────────────────────────
  const addReaction = useCallback(
    async (messageId: string, emoji: string) => {
      if (!roomId) throw new Error("No room selected");
      return client.addReaction(messageId, roomId, emoji);
    },
    [roomId, client],
  );

  return {
    messages,
    loading,
    loadingMore,
    hasMore,
    error,
    sendMessage,
    editMessage,
    deleteMessage,
    addReaction,
    loadMore,
  };
};
