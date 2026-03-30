import React, { useState, useCallback, useMemo, useEffect, useRef } from "react";
import type { PropsWithChildren } from "react";
import type { Message } from "../../../types/index";
import { useChatContext } from "../../context/ChatContext";
import { RoomStateProvider } from "../../context/RoomStateContext";
import { RoomActionProvider } from "../../context/RoomActionContext";
import { TypingProvider } from "../../context/TypingContext";
import { ComponentProvider } from "../../context/ComponentContext";
import type { ComponentContextValue } from "../../context/ComponentContext";
import type { TypingEvent } from "../../../types/index";

export interface RoomProps extends Partial<ComponentContextValue> {
  /** The room ID to load */
  roomId: string;
}

/**
 * Wraps a single room/channel, initialising all per-room state and making it
 * available to children via `RoomStateContext`, `RoomActionContext`, and
 * `TypingContext`.
 *
 * @example
 * ```tsx
 * <Room roomId="abc123">
 *   <Window>
 *     <MessageList />
 *     <ChatInput />
 *   </Window>
 *   <Thread />
 * </Room>
 * ```
 */
export const Room = ({
  roomId,
  children,
  // Component overrides forwarded to ComponentContext
  Avatar,
  Message: MessageOverride,
  MessageStatus,
  MessageActions,
  DateSeparator,
  EmptyStateIndicator,
  LoadingIndicator,
  LoadingErrorIndicator,
  ReactionPicker,
  TypingIndicator,
  MediaMessage,
  ThreadHeader,
  Modal,
  ChatInput,
  RoomListItem,
  Search,
  OnlineBadge,
}: PropsWithChildren<RoomProps>) => {
  const { client, customClasses } = useChatContext("Room");

  // ─── Messages state ───
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const oldestMessageId = useRef<string | undefined>(undefined);

  // ─── Thread state ───
  const [thread, setThread] = useState<Message | null>(null);
  const [threadMessages, setThreadMessages] = useState<Message[]>([]);
  const [threadHasMore, setThreadHasMore] = useState(false);
  const [threadLoadingMore, setThreadLoadingMore] = useState(false);

  // ─── Typing state ───
  const [typingUsers, setTypingUsers] = useState<Map<string, string>>(
    new Map()
  );
  const typingTimeouts = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map()
  );
  const isTypingRef = useRef(false);
  const stopTypingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ─── Fetch initial messages ───
  useEffect(() => {
    if (!roomId || !client?.isConnected) return;

    setMessages([]);
    setHasMore(false);
    setThread(null);
    setThreadMessages([]);
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
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [roomId, client?.isConnected]);

  // ─── Real-time message events ───
  useEffect(() => {
    if (!roomId || !client) return;

    const onReceive = (msg: Message) => {
      if (msg.roomId !== roomId) return;
      // Thread reply
      if (msg.threadParentId && thread && msg.threadParentId === thread._id) {
        setThreadMessages((prev) =>
          prev.find((m) => m._id === msg._id) ? prev : [...prev, msg]
        );
        // Also update reply count on parent
        setMessages((prev) =>
          prev.map((m) =>
            m._id === msg.threadParentId
              ? { ...m, replyCount: (m.replyCount || 0) + 1 }
              : m
          )
        );
        return;
      }
      // Normal message
      setMessages((prev) =>
        prev.find((m) => m._id === msg._id) ? prev : [...prev, msg]
      );
    };

    const onDeleted = ({ messageId }: { messageId: string; roomId: string }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m._id === messageId
            ? { ...m, isDeleted: true, text: undefined }
            : m
        )
      );
      setThreadMessages((prev) =>
        prev.map((m) =>
          m._id === messageId
            ? { ...m, isDeleted: true, text: undefined }
            : m
        )
      );
    };

    const onEdited = (msg: Message) => {
      setMessages((prev) => prev.map((m) => (m._id === msg._id ? msg : m)));
      setThreadMessages((prev) =>
        prev.map((m) => (m._id === msg._id ? msg : m))
      );
    };

    const onReaction = ({ messageId, reactions }: any) => {
      setMessages((prev) =>
        prev.map((m) => (m._id === messageId ? { ...m, reactions } : m))
      );
      setThreadMessages((prev) =>
        prev.map((m) => (m._id === messageId ? { ...m, reactions } : m))
      );
    };

    client.on("message:receive", onReceive);
    client.on("message:deleted", onDeleted);
    client.on("message:edited", onEdited);
    client.on("reaction:updated", onReaction);

    return () => {
      client.off("message:receive", onReceive);
      client.off("message:deleted", onDeleted);
      client.off("message:edited", onEdited);
      client.off("reaction:updated", onReaction);
    };
  }, [roomId, client, thread]);

  // ─── Typing events ───
  useEffect(() => {
    if (!roomId || !client) return;

    const onStart = (event: TypingEvent) => {
      if (event.roomId !== roomId) return;
      if (event.userId === client.currentUser?.userId) return;
      setTypingUsers((prev) =>
        new Map(prev).set(event.userId, event.displayName)
      );
      const existing = typingTimeouts.current.get(event.userId);
      if (existing) clearTimeout(existing);
      const t = setTimeout(() => {
        setTypingUsers((prev) => {
          const next = new Map(prev);
          next.delete(event.userId);
          return next;
        });
      }, 4000);
      typingTimeouts.current.set(event.userId, t);
    };

    const onStop = (event: TypingEvent) => {
      if (event.roomId !== roomId) return;
      setTypingUsers((prev) => {
        const next = new Map(prev);
        next.delete(event.userId);
        return next;
      });
      const existing = typingTimeouts.current.get(event.userId);
      if (existing) clearTimeout(existing);
    };

    client.on("typing:started", onStart);
    client.on("typing:stopped", onStop);

    return () => {
      client.off("typing:started", onStart);
      client.off("typing:stopped", onStop);
      typingTimeouts.current.forEach(clearTimeout);
      typingTimeouts.current.clear();
      setTypingUsers(new Map());
    };
  }, [roomId, client]);

  // ─── Actions ───
  const sendMessage = useCallback(
    async (input: Omit<import("../../../types/index").SendMessageInput, "roomId">) => {
      if (!roomId) throw new Error("No room selected");
      return client.sendMessage({ ...input, roomId });
    },
    [roomId, client]
  );

  const editMessage = useCallback(
    async (messageId: string, text: string) => {
      if (!roomId) throw new Error("No room selected");
      return client.editMessage(messageId, roomId, text);
    },
    [roomId, client]
  );

  const deleteMessage = useCallback(
    async (messageId: string) => {
      if (!roomId) throw new Error("No room selected");
      return client.deleteMessage(messageId, roomId);
    },
    [roomId, client]
  );

  const addReaction = useCallback(
    async (messageId: string, emoji: string) => {
      if (!roomId) throw new Error("No room selected");
      return client.addReaction(messageId, roomId, emoji);
    },
    [roomId, client]
  );

  const loadMore = useCallback(async () => {
    if (!roomId || loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const { messages: older, hasMore: more } = await client.getHistory(
        roomId,
        oldestMessageId.current
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

  const markRead = useCallback(
    async (lastMessageId: string) => {
      if (!roomId) return;
      await client.markSeen(roomId, lastMessageId);
    },
    [roomId, client]
  );

  const openThread = useCallback((message: Message) => {
    setThread(message);
    setThreadMessages([]);
    setThreadHasMore(false);
    // TODO: load thread replies from server when API supports it
  }, []);

  const closeThread = useCallback(() => {
    setThread(null);
    setThreadMessages([]);
  }, []);

  const loadMoreThread = useCallback(async () => {
    // Placeholder — will be implemented when server supports thread pagination
  }, []);

  const startTyping = useCallback(() => {
    if (!roomId) return;
    if (!isTypingRef.current) {
      client.startTyping(roomId);
      isTypingRef.current = true;
    }
    if (stopTypingTimeout.current) clearTimeout(stopTypingTimeout.current);
    stopTypingTimeout.current = setTimeout(() => {
      client.stopTyping(roomId);
      isTypingRef.current = false;
    }, 3000);
  }, [roomId, client]);

  const stopTyping = useCallback(() => {
    if (!roomId) return;
    if (stopTypingTimeout.current) clearTimeout(stopTypingTimeout.current);
    if (isTypingRef.current) {
      client.stopTyping(roomId);
      isTypingRef.current = false;
    }
  }, [roomId, client]);

  // ─── Memoized context values ───
  const typingText = useMemo(() => {
    const names = Array.from(typingUsers.values());
    if (names.length === 0) return null;
    if (names.length === 1) return `${names[0]} is typing...`;
    if (names.length === 2) return `${names[0]} and ${names[1]} are typing...`;
    return `${names[0]} and ${names.length - 1} others are typing...`;
  }, [typingUsers]);

  const roomStateValue = useMemo(
    () => ({
      room: { _id: roomId } as any,
      messages,
      loading,
      loadingMore,
      hasMore,
      error,
      members: [],
      thread,
      threadMessages,
      threadHasMore,
      threadLoadingMore,
      pinnedMessages: messages.filter((m) => m.pinnedAt),
    }),
    [messages, loading, loadingMore, hasMore, error, thread, threadMessages, threadHasMore, threadLoadingMore, roomId]
  );

  const roomActionValue = useMemo(
    () => ({
      sendMessage,
      editMessage,
      deleteMessage,
      addReaction,
      loadMore,
      markRead,
      openThread,
      closeThread,
      loadMoreThread,
    }),
    [sendMessage, editMessage, deleteMessage, addReaction, loadMore, markRead, openThread, closeThread, loadMoreThread]
  );

  const typingValue = useMemo(
    () => ({
      typingUsers,
      typingText,
      isAnyoneTyping: typingUsers.size > 0,
      startTyping,
      stopTyping,
    }),
    [typingUsers, typingText, startTyping, stopTyping]
  );

  const componentOverrides = useMemo(
    () => ({
      Avatar,
      Message: MessageOverride,
      MessageStatus,
      MessageActions,
      DateSeparator,
      EmptyStateIndicator,
      LoadingIndicator,
      LoadingErrorIndicator,
      ReactionPicker,
      TypingIndicator,
      MediaMessage,
      ThreadHeader,
      Modal,
      ChatInput,
      RoomListItem,
      Search,
      OnlineBadge,
    }),
    [Avatar, MessageOverride, MessageStatus, MessageActions, DateSeparator, EmptyStateIndicator, LoadingIndicator, LoadingErrorIndicator, ReactionPicker, TypingIndicator, MediaMessage, ThreadHeader, Modal, ChatInput, RoomListItem, Search, OnlineBadge]
  );

  const containerClass = customClasses?.room || "hermes-room";

  return (
    <RoomStateProvider value={roomStateValue}>
      <RoomActionProvider value={roomActionValue}>
        <TypingProvider value={typingValue}>
          <ComponentProvider value={componentOverrides}>
            <div className={containerClass}>{children}</div>
          </ComponentProvider>
        </TypingProvider>
      </RoomActionProvider>
    </RoomStateProvider>
  );
};
