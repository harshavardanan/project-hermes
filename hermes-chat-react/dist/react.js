import {
  HermesClient
} from "./chunk-OMLFDWYU.js";

// src/react/hooks/useMessages.ts
import { useState, useEffect, useCallback, useRef } from "react";
var useMessages = (client, roomId) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState(null);
  const [typingUsers, setTypingUsers] = useState([]);
  const oldestMessageId = useRef(void 0);
  useEffect(() => {
    if (!roomId || !client.isConnected) return;
    setMessages([]);
    setHasMore(false);
    oldestMessageId.current = void 0;
    setLoading(true);
    setError(null);
    client.getHistory(roomId).then(({ messages: msgs, hasMore: more }) => {
      setMessages(msgs);
      setHasMore(more);
      if (msgs.length > 0) oldestMessageId.current = msgs[0]._id;
    }).catch((err) => setError(err.message)).finally(() => setLoading(false));
  }, [roomId, client.isConnected]);
  useEffect(() => {
    if (!roomId) return;
    const onReceive = (msg) => {
      if (msg.roomId !== roomId) return;
      setMessages((prev) => {
        if (prev.find((m) => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
    };
    const onDeleted = ({
      messageId
    }) => {
      setMessages(
        (prev) => prev.map(
          (m) => m._id === messageId ? { ...m, isDeleted: true, text: void 0 } : m
        )
      );
    };
    const onEdited = (msg) => {
      setMessages((prev) => prev.map((m) => m._id === msg._id ? msg : m));
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
  useEffect(() => {
    const onReaction = ({ messageId, reactions }) => {
      setMessages(
        (prev) => prev.map((m) => m._id === messageId ? { ...m, reactions } : m)
      );
    };
    client.on("reaction:updated", onReaction);
    return () => {
      client.off("reaction:updated", onReaction);
    };
  }, [client]);
  useEffect(() => {
    if (!roomId) return;
    const onStarted = ({ userId, displayName, roomId: rid }) => {
      if (rid !== roomId) return;
      setTypingUsers((prev) => [
        ...prev.filter((u) => u.userId !== userId),
        { userId, displayName }
      ]);
    };
    const onStopped = ({ userId, roomId: rid }) => {
      if (rid !== roomId) return;
      setTypingUsers((prev) => prev.filter((u) => u.userId !== userId));
    };
    client.on("typing:started", onStarted);
    client.on("typing:stopped", onStopped);
    return () => {
      client.off("typing:started", onStarted);
      client.off("typing:stopped", onStopped);
      setTypingUsers([]);
    };
  }, [roomId, client]);
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
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingMore(false);
    }
  }, [roomId, loadingMore, hasMore, client]);
  const sendMessage = useCallback(
    async (input) => {
      if (!roomId) throw new Error("No room selected");
      return client.sendMessage({ ...input, roomId });
    },
    [roomId, client]
  );
  const editMessage = useCallback(
    async (messageId, text) => {
      if (!roomId) throw new Error("No room selected");
      return client.editMessage(messageId, roomId, text);
    },
    [roomId, client]
  );
  const deleteMessage = useCallback(
    async (messageId) => {
      if (!roomId) throw new Error("No room selected");
      return client.deleteMessage(messageId, roomId);
    },
    [roomId, client]
  );
  const addReaction = useCallback(
    async (messageId, emoji) => {
      if (!roomId) throw new Error("No room selected");
      return client.addReaction(messageId, roomId, emoji);
    },
    [roomId, client]
  );
  return {
    messages,
    loading,
    loadingMore,
    hasMore,
    error,
    typingUsers,
    sendMessage,
    editMessage,
    deleteMessage,
    addReaction,
    loadMore
  };
};

// src/react/hooks/useRooms.ts
import { useState as useState2, useEffect as useEffect2, useCallback as useCallback2, useRef as useRef2 } from "react";
var useRooms = (client) => {
  const [rooms, setRooms] = useState2([]);
  const [loading, setLoading] = useState2(true);
  const [error, setError] = useState2(null);
  const fetchedRef = useRef2(false);
  const fetchRooms = useCallback2(async () => {
    setLoading(true);
    setError(null);
    await new Promise((resolve, reject) => {
      if (client.isConnected) return resolve();
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        if (client.isConnected) {
          clearInterval(interval);
          resolve();
        } else if (attempts > 50) {
          clearInterval(interval);
          reject(new Error("Connection timeout"));
        }
      }, 100);
    });
    try {
      const data = await client.getRooms();
      console.log("[useRooms] fetched:", data.length, "rooms");
      setRooms(data);
      fetchedRef.current = true;
    } catch (err) {
      console.error("[useRooms] fetch error:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [client]);
  useEffect2(() => {
    fetchRooms();
    const onConnected = () => {
      if (!fetchedRef.current) fetchRooms();
    };
    client.on("connected", onConnected);
    return () => {
      client.off("connected", onConnected);
    };
  }, [fetchRooms, client]);
  useEffect2(() => {
    const onCreated = (room) => {
      setRooms((prev) => {
        if (prev.find((r) => r._id === room._id)) return prev;
        return [{ ...room, unreadCount: 0 }, ...prev];
      });
    };
    const onDeleted = ({ roomId }) => setRooms((prev) => prev.filter((r) => r._id !== roomId));
    const onMemberJoined = ({
      roomId,
      userId
    }) => setRooms(
      (prev) => prev.map(
        (r) => r._id === roomId ? { ...r, members: [...r.members, userId] } : r
      )
    );
    const onMemberLeft = ({
      roomId,
      userId
    }) => setRooms(
      (prev) => prev.map(
        (r) => r._id === roomId ? { ...r, members: r.members.filter((m) => m !== userId) } : r
      )
    );
    const onMessage = (msg) => setRooms((prev) => {
      const idx = prev.findIndex((r) => r._id === msg.roomId);
      if (idx === -1) return prev;
      const updated = {
        ...prev[idx],
        lastMessage: msg,
        lastActivity: msg.createdAt
      };
      return [updated, ...prev.filter((r) => r._id !== msg.roomId)];
    });
    client.on("room:created", onCreated);
    client.on("room:deleted", onDeleted);
    client.on("room:member:joined", onMemberJoined);
    client.on("room:member:left", onMemberLeft);
    client.on("message:receive", onMessage);
    return () => {
      client.off("room:created", onCreated);
      client.off("room:deleted", onDeleted);
      client.off("room:member:joined", onMemberJoined);
      client.off("room:member:left", onMemberLeft);
      client.off("message:receive", onMessage);
    };
  }, [client]);
  const createDirect = useCallback2(
    async (input) => {
      const room = await client.createDirectRoom(input);
      setRooms((prev) => {
        if (prev.find((r) => r._id === room._id)) return prev;
        return [{ ...room, unreadCount: 0 }, ...prev];
      });
      return room;
    },
    [client]
  );
  const createGroup = useCallback2(
    async (input) => {
      const room = await client.createGroupRoom(input);
      setRooms((prev) => {
        if (prev.find((r) => r._id === room._id)) return prev;
        return [{ ...room, unreadCount: 0 }, ...prev];
      });
      return room;
    },
    [client]
  );
  const deleteRoom = useCallback2(
    async (roomId) => {
      await client.deleteRoom(roomId);
      setRooms((prev) => prev.filter((r) => r._id !== roomId));
    },
    [client]
  );
  const addMember = useCallback2(
    (roomId, userId) => client.addMember(roomId, userId),
    [client]
  );
  const removeMember = useCallback2(
    (roomId, userId) => client.removeMember(roomId, userId),
    [client]
  );
  return {
    rooms,
    loading,
    error,
    createDirect,
    createGroup,
    deleteRoom,
    addMember,
    removeMember,
    refetch: fetchRooms
  };
};

// src/react/hooks/usePresence.ts
import { useState as useState3, useEffect as useEffect3, useCallback as useCallback3 } from "react";
var usePresence = (client) => {
  const [onlineMap, setOnlineMap] = useState3(/* @__PURE__ */ new Map());
  useEffect3(() => {
    const onOnline = ({ userId }) => {
      setOnlineMap((prev) => new Map(prev).set(userId, true));
    };
    const onOffline = ({ userId }) => {
      setOnlineMap((prev) => new Map(prev).set(userId, false));
    };
    client.on("user:online", onOnline);
    client.on("user:offline", onOffline);
    return () => {
      client.off("user:online", onOnline);
      client.off("user:offline", onOffline);
    };
  }, [client]);
  const isOnline = useCallback3(
    (userId) => onlineMap.get(userId) ?? false,
    [onlineMap]
  );
  const onlineUsers = Array.from(onlineMap.entries()).filter(([, online]) => online).map(([userId]) => userId);
  return { isOnline, onlineUsers, onlineMap };
};

// src/react/hooks/useTyping.ts
import { useState as useState4, useEffect as useEffect4, useCallback as useCallback4, useRef as useRef3 } from "react";
var useTyping = (client, roomId) => {
  const [typingUsers, setTypingUsers] = useState4(
    /* @__PURE__ */ new Map()
  );
  const timeouts = useRef3(
    /* @__PURE__ */ new Map()
  );
  const typingRef = useRef3(false);
  const stopTimeout = useRef3(null);
  useEffect4(() => {
    if (!roomId) return;
    const onStart = (event) => {
      if (event.roomId !== roomId) return;
      if (event.userId === client.currentUser?.userId) return;
      setTypingUsers(
        (prev) => new Map(prev).set(event.userId, event.displayName)
      );
      const existing = timeouts.current.get(event.userId);
      if (existing) clearTimeout(existing);
      const t = setTimeout(() => {
        setTypingUsers((prev) => {
          const next = new Map(prev);
          next.delete(event.userId);
          return next;
        });
      }, 4e3);
      timeouts.current.set(event.userId, t);
    };
    const onStop = (event) => {
      if (event.roomId !== roomId) return;
      setTypingUsers((prev) => {
        const next = new Map(prev);
        next.delete(event.userId);
        return next;
      });
      const existing = timeouts.current.get(event.userId);
      if (existing) clearTimeout(existing);
      timeouts.current.delete(event.userId);
    };
    client.on("typing:started", onStart);
    client.on("typing:stopped", onStop);
    return () => {
      client.off("typing:started", onStart);
      client.off("typing:stopped", onStop);
      timeouts.current.forEach(clearTimeout);
      timeouts.current.clear();
    };
  }, [roomId, client]);
  const startTyping = useCallback4(() => {
    if (!roomId) return;
    if (!typingRef.current) {
      client.startTyping(roomId);
      typingRef.current = true;
    }
    if (stopTimeout.current) clearTimeout(stopTimeout.current);
    stopTimeout.current = setTimeout(() => {
      client.stopTyping(roomId);
      typingRef.current = false;
    }, 3e3);
  }, [roomId, client]);
  const stopTyping = useCallback4(() => {
    if (!roomId) return;
    if (stopTimeout.current) clearTimeout(stopTimeout.current);
    if (typingRef.current) {
      client.stopTyping(roomId);
      typingRef.current = false;
    }
  }, [roomId, client]);
  const typingText = (() => {
    const names = Array.from(typingUsers.values());
    if (names.length === 0) return null;
    if (names.length === 1) return `${names[0]} is typing...`;
    if (names.length === 2) return `${names[0]} and ${names[1]} are typing...`;
    return `${names[0]} and ${names.length - 1} others are typing...`;
  })();
  return {
    typingUsers,
    typingText,
    isAnyoneTyping: typingUsers.size > 0,
    startTyping,
    stopTyping
  };
};

// src/react/hooks/useReadReceipts.ts
import { useState as useState5, useEffect as useEffect5, useCallback as useCallback5 } from "react";
var useReadReceipts = (client, roomId) => {
  const [receipts, setReceipts] = useState5(/* @__PURE__ */ new Map());
  useEffect5(() => {
    if (!roomId) return;
    const onReceipt = (event) => {
      if (event.roomId !== roomId) return;
      setReceipts((prev) => {
        const next = new Map(prev);
        const existing = next.get(event.lastMessageId) ?? /* @__PURE__ */ new Set();
        existing.add(event.userId);
        next.set(event.lastMessageId, existing);
        return next;
      });
    };
    client.on("receipt:updated", onReceipt);
    return () => client.off("receipt:updated", onReceipt);
  }, [roomId, client]);
  const markSeen = useCallback5(
    async (lastMessageId) => {
      if (!roomId) return;
      await client.markSeen(roomId, lastMessageId);
    },
    [roomId, client]
  );
  const seenBy = useCallback5(
    (messageId) => {
      return Array.from(receipts.get(messageId) ?? []);
    },
    [receipts]
  );
  return { markSeen, seenBy, receipts };
};

// src/react/hooks/useReactions.ts
import { useCallback as useCallback6 } from "react";
var useReactions = (client, roomId) => {
  const react = useCallback6(
    async (messageId, emoji) => {
      if (!roomId) throw new Error("No room selected");
      await client.addReaction(messageId, roomId, emoji);
    },
    [roomId, client]
  );
  const hasReacted = useCallback6(
    (reactions, emoji) => {
      const userId = client.currentUser?.userId;
      if (!userId) return false;
      return reactions.find((r) => r.emoji === emoji)?.users.includes(userId) ?? false;
    },
    [client]
  );
  const getCount = useCallback6(
    (reactions, emoji) => {
      return reactions.find((r) => r.emoji === emoji)?.users.length ?? 0;
    },
    []
  );
  const getEmojis = useCallback6((reactions) => {
    return reactions.filter((r) => r.users.length > 0).map((r) => r.emoji);
  }, []);
  return { react, hasReacted, getCount, getEmojis };
};

// src/react/hooks/useUpload.ts
import { useState as useState6, useCallback as useCallback7 } from "react";
var useUpload = (client) => {
  const [uploading, setUploading] = useState6(false);
  const [error, setError] = useState6(null);
  const [lastUpload, setLastUpload] = useState6(null);
  const upload = useCallback7(
    async (file) => {
      setUploading(true);
      setError(null);
      try {
        const result = await client.uploadFile(file);
        setLastUpload(result);
        return result;
      } catch (err) {
        setError(err.message);
        return null;
      } finally {
        setUploading(false);
      }
    },
    [client]
  );
  const sendFile = useCallback7(
    async (roomId, file, replyTo) => {
      setUploading(true);
      setError(null);
      try {
        const uploaded = await client.uploadFile(file);
        setLastUpload(uploaded);
        const message = await client.sendMessage({
          roomId,
          type: uploaded.type,
          url: uploaded.url,
          fileName: uploaded.fileName,
          fileSize: uploaded.fileSize,
          mimeType: uploaded.mimeType,
          thumbnail: uploaded.thumbnail,
          replyTo
        });
        return message;
      } catch (err) {
        setError(err.message);
        return null;
      } finally {
        setUploading(false);
      }
    },
    [client]
  );
  const validate = useCallback7((file, maxMb = 50) => {
    if (file.size > maxMb * 1024 * 1024) {
      return `File too large. Max size is ${maxMb}MB.`;
    }
    const allowed = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "video/mp4",
      "video/webm",
      "audio/mpeg",
      "audio/ogg",
      "audio/wav",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain"
    ];
    if (!allowed.includes(file.type)) {
      return `File type not supported: ${file.type}`;
    }
    return null;
  }, []);
  return { upload, sendFile, validate, uploading, error, lastUpload };
};

// src/react/components/MessageList.tsx
import { useEffect as useEffect6, useRef as useRef4, useState as useState7 } from "react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
var formatTime = (iso) => new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
var formatFileSize = (bytes) => {
  if (!bytes) return "";
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${bytes} B`;
};
var REACTION_EMOJIS = [
  "\u{1FAE0}",
  "\u{1F979}",
  "\u{1FAE1}",
  "\u{1F90C}",
  "\u{1FAF6}",
  "\u{1F480}",
  "\u{1F525}",
  "\u2728",
  "\u{1FAE3}",
  "\u{1F62E}\u200D\u{1F4A8}",
  "\u{1FA84}",
  "\u{1F972}",
  "\u{1F485}",
  "\u{1FAE6}",
  "\u{1F92F}",
  "\u{1F31A}",
  "\u{1F441}\uFE0F",
  "\u{1FAC0}",
  "\u{1F98B}",
  "\u{1FA90}"
];
var EmojiPicker = ({ onPick, onClose, isOwn }) => {
  const ref = useRef4(null);
  useEffect6(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);
  return /* @__PURE__ */ jsx(
    "div",
    {
      ref,
      style: {
        position: "absolute",
        bottom: "calc(100% + 8px)",
        [isOwn ? "right" : "left"]: 0,
        zIndex: 100,
        background: "#1a1a2e",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 14,
        padding: "8px 10px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        display: "grid",
        gridTemplateColumns: "repeat(5, 1fr)",
        gap: 4,
        animation: "hermes-pop 0.15s ease"
      },
      children: REACTION_EMOJIS.map((emoji) => /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => {
            onPick(emoji);
            onClose();
          },
          style: {
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: 20,
            padding: "4px",
            borderRadius: 8,
            lineHeight: 1,
            transition: "transform 0.1s, background 0.1s"
          },
          onMouseEnter: (e) => {
            e.currentTarget.style.transform = "scale(1.3)";
            e.currentTarget.style.background = "rgba(255,255,255,0.08)";
          },
          onMouseLeave: (e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.background = "none";
          },
          children: emoji
        },
        emoji
      ))
    }
  );
};
var TypingIndicator = ({ typingUsers }) => {
  if (!typingUsers.length) return null;
  const text = typingUsers.length === 1 ? `${typingUsers[0].displayName} is typing` : typingUsers.length === 2 ? `${typingUsers[0].displayName} and ${typingUsers[1].displayName} are typing` : `${typingUsers[0].displayName} and ${typingUsers.length - 1} others are typing`;
  return /* @__PURE__ */ jsxs(
    "div",
    {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 16px 2px",
        minHeight: 28
      },
      children: [
        /* @__PURE__ */ jsx(
          "div",
          {
            style: {
              display: "flex",
              alignItems: "center",
              gap: 3,
              background: "#f0f0f0",
              borderRadius: 12,
              padding: "6px 10px"
            },
            children: [0, 1, 2].map((i) => /* @__PURE__ */ jsx(
              "span",
              {
                style: {
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#999",
                  display: "block",
                  animation: `hermes-bounce 1.2s ease-in-out ${i * 0.18}s infinite`
                }
              },
              i
            ))
          }
        ),
        /* @__PURE__ */ jsx("span", { style: { fontSize: 11, color: "#999" }, children: text })
      ]
    }
  );
};
var DefaultMessage = ({ message, isOwn, onEdit, onDelete, onReact, onReply, renderAvatar }) => {
  const [hovered, setHovered] = useState7(false);
  const [pickerOpen, setPickerOpen] = useState7(false);
  if (message.isDeleted) {
    return /* @__PURE__ */ jsx(
      "div",
      {
        style: {
          opacity: 0.5,
          fontStyle: "italic",
          padding: "4px 16px",
          fontSize: 13
        },
        children: "This message was deleted."
      }
    );
  }
  return /* @__PURE__ */ jsxs(
    "div",
    {
      onMouseEnter: () => setHovered(true),
      onMouseLeave: () => {
        setHovered(false);
      },
      style: {
        display: "flex",
        flexDirection: isOwn ? "row-reverse" : "row",
        alignItems: "flex-end",
        gap: 8,
        marginBottom: 4,
        position: "relative"
      },
      children: [
        !isOwn && /* @__PURE__ */ jsx("div", { style: { flexShrink: 0 }, children: renderAvatar ? renderAvatar(message.senderId) : /* @__PURE__ */ jsx(
          "div",
          {
            style: {
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "#e0e0e0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              fontWeight: 600
            },
            children: message.senderId.slice(-2).toUpperCase()
          }
        ) }),
        /* @__PURE__ */ jsxs(
          "div",
          {
            style: {
              maxWidth: "70%",
              display: "flex",
              flexDirection: "column",
              alignItems: isOwn ? "flex-end" : "flex-start"
            },
            children: [
              (onEdit || onDelete || onReact || onReply) && /* @__PURE__ */ jsxs(
                "div",
                {
                  style: {
                    display: "flex",
                    flexDirection: isOwn ? "row-reverse" : "row",
                    gap: 2,
                    marginBottom: 4,
                    opacity: hovered ? 1 : 0,
                    pointerEvents: hovered ? "auto" : "none",
                    transition: "opacity 0.15s ease",
                    position: "relative"
                  },
                  children: [
                    onReact && /* @__PURE__ */ jsxs("div", { style: { position: "relative" }, children: [
                      /* @__PURE__ */ jsx(
                        ActionBtn,
                        {
                          onClick: () => setPickerOpen((p) => !p),
                          title: "React",
                          children: "\u{1FAE0}"
                        }
                      ),
                      pickerOpen && /* @__PURE__ */ jsx(
                        EmojiPicker,
                        {
                          isOwn,
                          onPick: (emoji) => onReact(message._id, emoji),
                          onClose: () => setPickerOpen(false)
                        }
                      )
                    ] }),
                    onReply && /* @__PURE__ */ jsx(ActionBtn, { onClick: () => onReply(message), title: "Reply", children: "\u21A9" }),
                    isOwn && onEdit && message.type === "text" && /* @__PURE__ */ jsx(
                      ActionBtn,
                      {
                        onClick: () => {
                          const text = window.prompt("Edit message:", message.text);
                          if (text) onEdit(message._id, text);
                        },
                        title: "Edit",
                        children: "\u270F\uFE0F"
                      }
                    ),
                    isOwn && onDelete && /* @__PURE__ */ jsx(ActionBtn, { onClick: () => onDelete(message._id), title: "Delete", children: "\u{1F5D1}" })
                  ]
                }
              ),
              /* @__PURE__ */ jsxs(
                "div",
                {
                  style: {
                    padding: "8px 12px",
                    borderRadius: isOwn ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                    background: isOwn ? "#0084ff" : "#f0f0f0",
                    color: isOwn ? "#fff" : "#000"
                  },
                  children: [
                    message.replyTo && /* @__PURE__ */ jsx(
                      "div",
                      {
                        style: {
                          borderLeft: "3px solid rgba(255,255,255,0.4)",
                          paddingLeft: 8,
                          marginBottom: 6,
                          fontSize: 12,
                          opacity: 0.75
                        },
                        children: "Replying to a message"
                      }
                    ),
                    message.type === "text" && /* @__PURE__ */ jsxs("p", { style: { margin: 0, wordBreak: "break-word" }, children: [
                      message.text,
                      message.editedAt && /* @__PURE__ */ jsx("span", { style: { fontSize: 10, opacity: 0.6, marginLeft: 6 }, children: "(edited)" })
                    ] }),
                    message.type === "link" && /* @__PURE__ */ jsxs("div", { children: [
                      message.text && /* @__PURE__ */ jsx("p", { style: { margin: "0 0 4px" }, children: message.text }),
                      /* @__PURE__ */ jsx(
                        "a",
                        {
                          href: message.url,
                          target: "_blank",
                          rel: "noopener noreferrer",
                          style: {
                            color: isOwn ? "#cce4ff" : "#0084ff",
                            wordBreak: "break-all"
                          },
                          children: message.url
                        }
                      )
                    ] }),
                    message.type === "image" && /* @__PURE__ */ jsx(
                      "img",
                      {
                        src: message.url,
                        alt: message.fileName || "image",
                        style: { maxWidth: "100%", borderRadius: 8, display: "block" }
                      }
                    ),
                    message.type === "video" && /* @__PURE__ */ jsx(
                      "video",
                      {
                        src: message.url,
                        controls: true,
                        style: { maxWidth: "100%", borderRadius: 8 }
                      }
                    ),
                    message.type === "audio" && /* @__PURE__ */ jsx("audio", { src: message.url, controls: true, style: { width: "100%" } }),
                    message.type === "document" && /* @__PURE__ */ jsxs(
                      "a",
                      {
                        href: message.url,
                        target: "_blank",
                        rel: "noopener noreferrer",
                        style: {
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          color: isOwn ? "#fff" : "#333",
                          textDecoration: "none"
                        },
                        children: [
                          /* @__PURE__ */ jsx("span", { style: { fontSize: 24 }, children: "\u{1F4C4}" }),
                          /* @__PURE__ */ jsxs("div", { children: [
                            /* @__PURE__ */ jsx("div", { style: { fontWeight: 600, fontSize: 13 }, children: message.fileName }),
                            /* @__PURE__ */ jsx("div", { style: { fontSize: 11, opacity: 0.7 }, children: formatFileSize(message.fileSize) })
                          ] })
                        ]
                      }
                    ),
                    /* @__PURE__ */ jsx(
                      "div",
                      {
                        style: {
                          fontSize: 10,
                          opacity: 0.6,
                          textAlign: "right",
                          marginTop: 4
                        },
                        children: formatTime(message.createdAt)
                      }
                    )
                  ]
                }
              ),
              message.reactions?.filter((r) => r.users.length > 0).length > 0 && /* @__PURE__ */ jsx(
                "div",
                {
                  style: { display: "flex", gap: 4, flexWrap: "wrap", marginTop: 4 },
                  children: message.reactions.filter((r) => r.users.length > 0).map((r) => /* @__PURE__ */ jsxs(
                    "span",
                    {
                      onClick: () => onReact?.(message._id, r.emoji),
                      style: {
                        background: "#f0f0f0",
                        border: "1px solid rgba(0,0,0,0.08)",
                        borderRadius: 20,
                        padding: "2px 8px",
                        fontSize: 13,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        transition: "transform 0.1s",
                        userSelect: "none"
                      },
                      onMouseEnter: (e) => e.currentTarget.style.transform = "scale(1.1)",
                      onMouseLeave: (e) => e.currentTarget.style.transform = "scale(1)",
                      children: [
                        r.emoji,
                        /* @__PURE__ */ jsx(
                          "span",
                          {
                            style: { fontSize: 11, fontWeight: 600, color: "#555" },
                            children: r.users.length
                          }
                        )
                      ]
                    },
                    r.emoji
                  ))
                }
              )
            ]
          }
        )
      ]
    }
  );
};
var ActionBtn = ({ onClick, title, children }) => /* @__PURE__ */ jsx(
  "button",
  {
    onClick,
    title,
    style: {
      background: "#fff",
      border: "1px solid rgba(0,0,0,0.1)",
      borderRadius: 8,
      cursor: "pointer",
      fontSize: 14,
      padding: "3px 6px",
      lineHeight: 1,
      boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
      transition: "transform 0.1s"
    },
    onMouseEnter: (e) => e.currentTarget.style.transform = "scale(1.15)",
    onMouseLeave: (e) => e.currentTarget.style.transform = "scale(1)",
    children
  }
);
var MessageList = ({
  messages,
  currentUser,
  loading = false,
  loadingMore = false,
  hasMore = false,
  onLoadMore,
  onEdit,
  onDelete,
  onReact,
  onReply,
  renderMessage,
  renderAvatar,
  className = "",
  autoScroll = true,
  typingUsers = []
}) => {
  const bottomRef = useRef4(null);
  const containerRef = useRef4(null);
  useEffect6(() => {
    if (autoScroll && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, autoScroll]);
  useEffect6(() => {
    const container = containerRef.current;
    if (!container || !onLoadMore) return;
    const onScroll = () => {
      if (container.scrollTop === 0 && hasMore && !loadingMore) onLoadMore();
    };
    container.addEventListener("scroll", onScroll);
    return () => container.removeEventListener("scroll", onScroll);
  }, [hasMore, loadingMore, onLoadMore]);
  if (loading) {
    return /* @__PURE__ */ jsx(
      "div",
      {
        style: {
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%"
        },
        children: "Loading messages..."
      }
    );
  }
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("style", { children: `
        @keyframes hermes-bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40%            { transform: translateY(-5px); }
        }
        @keyframes hermes-pop {
          from { opacity: 0; transform: scale(0.85); }
          to   { opacity: 1; transform: scale(1); }
        }
      ` }),
    /* @__PURE__ */ jsxs(
      "div",
      {
        ref: containerRef,
        className: `hermes-message-list ${className}`,
        style: {
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          padding: "16px"
        },
        children: [
          hasMore && /* @__PURE__ */ jsx("div", { style: { textAlign: "center", marginBottom: 12 }, children: loadingMore ? /* @__PURE__ */ jsx("span", { style: { fontSize: 12, opacity: 0.5 }, children: "Loading older messages..." }) : /* @__PURE__ */ jsx(
            "button",
            {
              onClick: onLoadMore,
              style: {
                background: "none",
                border: "1px solid #ddd",
                borderRadius: 12,
                padding: "4px 12px",
                cursor: "pointer",
                fontSize: 12
              },
              children: "Load older messages"
            }
          ) }),
          messages.length === 0 && /* @__PURE__ */ jsx(
            "div",
            {
              style: {
                textAlign: "center",
                opacity: 0.4,
                margin: "auto",
                fontSize: 14
              },
              children: "No messages yet. Say hello! \u{1F44B}"
            }
          ),
          messages.map((message) => {
            const isOwn = message.senderId === currentUser.userId;
            return /* @__PURE__ */ jsx("div", { style: { marginBottom: 8 }, children: renderMessage ? renderMessage(message, isOwn) : /* @__PURE__ */ jsx(
              DefaultMessage,
              {
                message,
                isOwn,
                onEdit,
                onDelete,
                onReact,
                onReply,
                renderAvatar
              }
            ) }, message._id);
          }),
          /* @__PURE__ */ jsx(TypingIndicator, { typingUsers }),
          /* @__PURE__ */ jsx("div", { ref: bottomRef })
        ]
      }
    )
  ] });
};

// src/react/components/ChatInput.tsx
import { useState as useState8, useRef as useRef5, useCallback as useCallback8 } from "react";
import { Fragment as Fragment2, jsx as jsx2, jsxs as jsxs2 } from "react/jsx-runtime";
var ChatInput = ({
  onSendText,
  onSendFile,
  onTypingStart,
  onTypingStop,
  replyingTo,
  onCancelReply,
  disabled = false,
  placeholder = "Type a message...",
  maxLength = 4e3,
  className = "",
  inputClassName = "",
  renderAttachIcon,
  renderSendIcon
}) => {
  const [text, setText] = useState8("");
  const [sending, setSending] = useState8(false);
  const fileRef = useRef5(null);
  const textareaRef = useRef5(null);
  const resizeTextarea = useCallback8(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, []);
  const handleChange = (e) => {
    setText(e.target.value);
    resizeTextarea();
    onTypingStart?.();
  };
  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || sending || disabled) return;
    setSending(true);
    try {
      await onSendText(trimmed);
      setText("");
      if (textareaRef.current) textareaRef.current.style.height = "auto";
      onTypingStop?.();
    } finally {
      setSending(false);
    }
  };
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !onSendFile) return;
    await onSendFile(file);
    if (fileRef.current) fileRef.current.value = "";
  };
  return /* @__PURE__ */ jsxs2(
    "div",
    {
      className: `hermes-chat-input ${className}`,
      style: {
        display: "flex",
        flexDirection: "column",
        padding: "8px 12px",
        borderTop: "1px solid #e0e0e0"
      },
      children: [
        replyingTo && /* @__PURE__ */ jsxs2(
          "div",
          {
            className: "hermes-chat-input__reply",
            style: {
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "6px 10px",
              marginBottom: 6,
              background: "#f5f5f5",
              borderRadius: 8,
              borderLeft: "3px solid #0084ff",
              fontSize: 12
            },
            children: [
              /* @__PURE__ */ jsxs2("div", { style: { overflow: "hidden" }, children: [
                /* @__PURE__ */ jsx2("span", { style: { fontWeight: 600, marginRight: 4 }, children: "Replying to:" }),
                /* @__PURE__ */ jsx2("span", { style: { opacity: 0.7 }, children: replyingTo.type === "text" ? replyingTo.text?.slice(0, 60) : `[${replyingTo.type}]` })
              ] }),
              /* @__PURE__ */ jsx2(
                "button",
                {
                  onClick: onCancelReply,
                  style: {
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 16,
                    lineHeight: 1
                  },
                  children: "\u2715"
                }
              )
            ]
          }
        ),
        /* @__PURE__ */ jsxs2(
          "div",
          {
            className: "hermes-chat-input__row",
            style: { display: "flex", alignItems: "flex-end", gap: 8 },
            children: [
              onSendFile && /* @__PURE__ */ jsxs2(Fragment2, { children: [
                /* @__PURE__ */ jsx2(
                  "button",
                  {
                    onClick: () => fileRef.current?.click(),
                    disabled,
                    className: "hermes-chat-input__attach",
                    style: {
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 6,
                      flexShrink: 0,
                      opacity: disabled ? 0.4 : 1
                    },
                    children: renderAttachIcon ? renderAttachIcon() : /* @__PURE__ */ jsx2(
                      "svg",
                      {
                        width: "20",
                        height: "20",
                        viewBox: "0 0 24 24",
                        fill: "none",
                        stroke: "currentColor",
                        strokeWidth: "2",
                        strokeLinecap: "round",
                        strokeLinejoin: "round",
                        children: /* @__PURE__ */ jsx2("path", { d: "m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" })
                      }
                    )
                  }
                ),
                /* @__PURE__ */ jsx2(
                  "input",
                  {
                    ref: fileRef,
                    type: "file",
                    style: { display: "none" },
                    onChange: handleFileChange,
                    accept: "image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
                  }
                )
              ] }),
              /* @__PURE__ */ jsx2(
                "textarea",
                {
                  ref: textareaRef,
                  value: text,
                  onChange: handleChange,
                  onKeyDown: handleKeyDown,
                  onBlur: () => onTypingStop?.(),
                  placeholder,
                  disabled,
                  maxLength,
                  rows: 1,
                  className: `hermes-chat-input__textarea ${inputClassName}`,
                  style: {
                    flex: 1,
                    resize: "none",
                    border: "1px solid #e0e0e0",
                    borderRadius: 20,
                    padding: "8px 14px",
                    fontSize: 14,
                    lineHeight: 1.5,
                    outline: "none",
                    overflow: "hidden",
                    background: disabled ? "#f5f5f5" : "#fff"
                  }
                }
              ),
              /* @__PURE__ */ jsx2(
                "button",
                {
                  onClick: handleSend,
                  disabled: !text.trim() || sending || disabled,
                  className: "hermes-chat-input__send",
                  style: {
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 6,
                    flexShrink: 0,
                    opacity: !text.trim() || sending || disabled ? 0.4 : 1
                  },
                  children: renderSendIcon ? renderSendIcon() : /* @__PURE__ */ jsx2("svg", { width: "22", height: "22", viewBox: "0 0 24 24", fill: "currentColor", children: /* @__PURE__ */ jsx2("path", { d: "M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" }) })
                }
              )
            ]
          }
        ),
        text.length > maxLength * 0.8 && /* @__PURE__ */ jsxs2(
          "div",
          {
            style: {
              fontSize: 10,
              textAlign: "right",
              opacity: 0.5,
              marginTop: 2
            },
            children: [
              text.length,
              "/",
              maxLength
            ]
          }
        )
      ]
    }
  );
};

// src/react/components/RoomList.tsx
import { jsx as jsx3, jsxs as jsxs3 } from "react/jsx-runtime";
var formatLastActivity = (iso) => {
  const date = new Date(iso);
  const now = /* @__PURE__ */ new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 6e4);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  if (diffMins < 1) return "now";
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  return date.toLocaleDateString();
};
var getRoomName = (room, currentUserId) => {
  if (room.type === "group") return room.name ?? "Group";
  const other = room.members.find((m) => m !== currentUserId);
  return other ?? "Direct Message";
};
var getLastMessagePreview = (room) => {
  const msg = room.lastMessage;
  if (!msg) return "No messages yet";
  if (msg.isDeleted) return "Message deleted";
  if (msg.type === "text") return msg.text?.slice(0, 50) ?? "";
  if (msg.type === "image") return "\u{1F4F7} Image";
  if (msg.type === "video") return "\u{1F3A5} Video";
  if (msg.type === "audio") return "\u{1F3B5} Audio";
  if (msg.type === "document") return `\u{1F4C4} ${msg.fileName ?? "File"}`;
  if (msg.type === "link") return `\u{1F517} ${msg.url}`;
  return "";
};
var DefaultRoomItem = ({ room, isActive, currentUserId, renderAvatar, itemClassName }) => /* @__PURE__ */ jsxs3(
  "div",
  {
    className: `hermes-room-item ${isActive ? "hermes-room-item--active" : ""} ${itemClassName ?? ""}`,
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "10px 12px",
      cursor: "pointer",
      background: isActive ? "rgba(0,132,255,0.08)" : "transparent",
      borderLeft: isActive ? "3px solid #0084ff" : "3px solid transparent"
    },
    children: [
      /* @__PURE__ */ jsx3("div", { style: { flexShrink: 0 }, children: renderAvatar ? renderAvatar(room) : /* @__PURE__ */ jsx3(
        "div",
        {
          style: {
            width: 42,
            height: 42,
            borderRadius: "50%",
            background: "#e0e0e0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            fontSize: 16
          },
          children: room.type === "group" ? "G" : "D"
        }
      ) }),
      /* @__PURE__ */ jsxs3("div", { style: { flex: 1, overflow: "hidden" }, children: [
        /* @__PURE__ */ jsxs3(
          "div",
          {
            style: {
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline"
            },
            children: [
              /* @__PURE__ */ jsx3(
                "span",
                {
                  style: {
                    fontWeight: 600,
                    fontSize: 14,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap"
                  },
                  children: getRoomName(room, currentUserId)
                }
              ),
              /* @__PURE__ */ jsx3(
                "span",
                {
                  style: { fontSize: 11, opacity: 0.5, flexShrink: 0, marginLeft: 4 },
                  children: formatLastActivity(room.lastActivity)
                }
              )
            ]
          }
        ),
        /* @__PURE__ */ jsxs3(
          "div",
          {
            style: {
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 2
            },
            children: [
              /* @__PURE__ */ jsx3(
                "span",
                {
                  style: {
                    fontSize: 13,
                    opacity: 0.6,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap"
                  },
                  children: getLastMessagePreview(room)
                }
              ),
              room.unreadCount > 0 && /* @__PURE__ */ jsx3(
                "span",
                {
                  style: {
                    background: "#0084ff",
                    color: "#fff",
                    borderRadius: 10,
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "1px 7px",
                    flexShrink: 0,
                    marginLeft: 4
                  },
                  children: room.unreadCount > 99 ? "99+" : room.unreadCount
                }
              )
            ]
          }
        )
      ] })
    ]
  }
);
var RoomList = ({
  rooms,
  activeRoomId,
  currentUserId,
  loading = false,
  onSelectRoom,
  onCreateDirect,
  onCreateGroup,
  renderRoomItem,
  renderAvatar,
  renderEmpty,
  className = "",
  itemClassName = ""
}) => {
  return /* @__PURE__ */ jsxs3(
    "div",
    {
      className: `hermes-room-list ${className}`,
      style: {
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflowY: "auto"
      },
      children: [
        (onCreateDirect || onCreateGroup) && /* @__PURE__ */ jsxs3(
          "div",
          {
            style: {
              display: "flex",
              gap: 8,
              padding: "10px 12px",
              borderBottom: "1px solid #e0e0e0"
            },
            children: [
              onCreateDirect && /* @__PURE__ */ jsx3(
                "button",
                {
                  onClick: onCreateDirect,
                  style: {
                    flex: 1,
                    background: "#0084ff",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    padding: "8px 10px",
                    cursor: "pointer",
                    fontSize: 13,
                    fontWeight: 600
                  },
                  children: "+ Direct"
                }
              ),
              onCreateGroup && /* @__PURE__ */ jsx3(
                "button",
                {
                  onClick: onCreateGroup,
                  style: {
                    flex: 1,
                    background: "none",
                    border: "1px solid #e0e0e0",
                    borderRadius: 8,
                    padding: "8px 10px",
                    cursor: "pointer",
                    fontSize: 13,
                    fontWeight: 600
                  },
                  children: "+ Group"
                }
              )
            ]
          }
        ),
        loading && /* @__PURE__ */ jsx3("div", { style: { padding: "12px 16px", opacity: 0.5, fontSize: 13 }, children: "Loading rooms..." }),
        !loading && rooms.length === 0 && /* @__PURE__ */ jsx3(
          "div",
          {
            style: {
              textAlign: "center",
              padding: 24,
              opacity: 0.4,
              fontSize: 13
            },
            children: renderEmpty ? renderEmpty() : "No conversations yet."
          }
        ),
        !loading && rooms.map((room) => {
          const isActive = room._id === activeRoomId;
          return /* @__PURE__ */ jsx3("div", { onClick: () => onSelectRoom(room), children: renderRoomItem ? renderRoomItem(room, isActive) : /* @__PURE__ */ jsx3(
            DefaultRoomItem,
            {
              room,
              isActive,
              currentUserId,
              renderAvatar,
              itemClassName
            }
          ) }, room._id);
        })
      ]
    }
  );
};

// src/react/components/TypingIndicator.tsx
import { jsx as jsx4, jsxs as jsxs4 } from "react/jsx-runtime";
var TypingIndicator2 = ({
  typingText,
  className = ""
}) => {
  if (!typingText) return null;
  return /* @__PURE__ */ jsxs4(
    "div",
    {
      className: `hermes-typing-indicator ${className}`,
      style: {
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "4px 16px",
        minHeight: 24
      },
      children: [
        /* @__PURE__ */ jsx4("div", { style: { display: "flex", gap: 3 }, children: [0, 1, 2].map((i) => /* @__PURE__ */ jsx4(
          "span",
          {
            style: {
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#aaa",
              display: "block",
              animation: `hermes-bounce 1.2s ease-in-out ${i * 0.2}s infinite`
            }
          },
          i
        )) }),
        /* @__PURE__ */ jsx4("span", { style: { fontSize: 12, opacity: 0.6 }, children: typingText }),
        /* @__PURE__ */ jsx4("style", { children: `
        @keyframes hermes-bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-4px); }
        }
      ` })
      ]
    }
  );
};

// src/react/components/OnlineBadge.tsx
import { jsx as jsx5 } from "react/jsx-runtime";
var OnlineBadge = ({
  isOnline,
  size = 10,
  className = ""
}) => /* @__PURE__ */ jsx5(
  "span",
  {
    className: `hermes-online-badge ${isOnline ? "hermes-online-badge--online" : "hermes-online-badge--offline"} ${className}`,
    "data-online": isOnline,
    style: {
      display: "inline-block",
      width: size,
      height: size,
      borderRadius: "50%",
      background: isOnline ? "#22c55e" : "#d1d5db",
      boxShadow: isOnline ? "0 0 0 2px #fff" : "none",
      flexShrink: 0
    }
  }
);

// src/react/components/ReactionPicker.tsx
import { useState as useState9, useRef as useRef6, useEffect as useEffect7 } from "react";
import EmojiPicker2, { Theme } from "emoji-picker-react";
import { jsx as jsx6, jsxs as jsxs5 } from "react/jsx-runtime";
var DEFAULT_EMOJIS = ["\u{1F44D}", "\u2764\uFE0F", "\u{1F602}", "\u{1F62E}", "\u{1F622}", "\u{1F525}", "\u{1F389}", "\u{1F44F}"];
var ReactionPicker = ({
  onSelect,
  currentReactions = [],
  currentUserId,
  emojis = DEFAULT_EMOJIS,
  className = "",
  align = "left"
}) => {
  const [showPicker, setShowPicker] = useState9(false);
  const containerRef = useRef6(null);
  const hasReacted = (emoji) => {
    if (!currentUserId) return false;
    return currentReactions.find((r) => r.emoji === emoji)?.users.includes(currentUserId) ?? false;
  };
  const handleEmojiClick = (emojiData) => {
    onSelect(emojiData.emoji);
    setShowPicker(false);
  };
  useEffect7(() => {
    const handleOutsideClick = (e) => {
      if (!containerRef.current) return;
      const target = e.target;
      if (!containerRef.current.contains(target)) {
        setShowPicker(false);
      }
    };
    if (showPicker) {
      window.addEventListener("click", handleOutsideClick);
    }
    return () => window.removeEventListener("click", handleOutsideClick);
  }, [showPicker]);
  return /* @__PURE__ */ jsxs5(
    "div",
    {
      ref: containerRef,
      style: { position: "relative", display: "inline-block" },
      className,
      children: [
        /* @__PURE__ */ jsxs5(
          "div",
          {
            style: {
              display: "flex",
              gap: 4,
              flexWrap: "wrap",
              padding: "6px 8px",
              background: "#111",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.08)"
            },
            children: [
              emojis.map((emoji) => /* @__PURE__ */ jsx6(
                "button",
                {
                  onClick: () => onSelect(emoji),
                  style: {
                    background: hasReacted(emoji) ? "rgba(57,255,20,0.12)" : "transparent",
                    border: hasReacted(emoji) ? "1px solid rgba(57,255,20,0.35)" : "1px solid transparent",
                    borderRadius: 8,
                    padding: "4px 6px",
                    cursor: "pointer",
                    fontSize: 18,
                    lineHeight: 1,
                    transition: "transform 0.12s ease"
                  },
                  onMouseEnter: (e) => e.currentTarget.style.transform = "scale(1.2)",
                  onMouseLeave: (e) => e.currentTarget.style.transform = "scale(1)",
                  children: emoji
                },
                emoji
              )),
              /* @__PURE__ */ jsx6(
                "button",
                {
                  onClick: (e) => {
                    e.stopPropagation();
                    setShowPicker((v) => !v);
                  },
                  style: {
                    borderRadius: 8,
                    padding: "4px 6px",
                    cursor: "pointer",
                    fontSize: 18,
                    border: "1px solid transparent",
                    background: "transparent"
                  },
                  children: "\u2795"
                }
              )
            ]
          }
        ),
        showPicker && /* @__PURE__ */ jsx6(
          "div",
          {
            onMouseDown: (e) => e.stopPropagation(),
            onClick: (e) => e.stopPropagation(),
            style: {
              position: "absolute",
              bottom: "calc(100% + 6px)",
              [align === "right" ? "right" : "left"]: 0,
              zIndex: 50,
              animation: "hermes-pop 0.15s ease"
            },
            children: /* @__PURE__ */ jsx6(
              EmojiPicker2,
              {
                theme: Theme.DARK,
                onEmojiClick: handleEmojiClick,
                height: 440,
                width: 360,
                searchPlaceHolder: "Search emoji...",
                lazyLoadEmojis: true
              }
            )
          }
        ),
        /* @__PURE__ */ jsx6("style", { children: `
        @keyframes hermes-pop {
          from {
            opacity: 0;
            transform: scale(0.85);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      ` })
      ]
    }
  );
};

// src/react/components/MediaMessage.tsx
import { jsx as jsx7, jsxs as jsxs6 } from "react/jsx-runtime";
var formatFileSize2 = (bytes) => {
  if (!bytes) return "";
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${bytes} B`;
};
var MediaMessage = ({
  message,
  className = "",
  maxWidth = 300
}) => {
  if (!message.url) return null;
  return /* @__PURE__ */ jsxs6(
    "div",
    {
      className: `hermes-media-message hermes-media-message--${message.type} ${className}`,
      style: { maxWidth },
      children: [
        message.type === "image" && /* @__PURE__ */ jsx7(
          "img",
          {
            src: message.url,
            alt: message.fileName ?? "image",
            style: {
              width: "100%",
              borderRadius: 10,
              display: "block",
              cursor: "pointer"
            },
            onClick: () => window.open(message.url, "_blank")
          }
        ),
        message.type === "video" && /* @__PURE__ */ jsx7(
          "video",
          {
            src: message.url,
            poster: message.thumbnail,
            controls: true,
            style: { width: "100%", borderRadius: 10 }
          }
        ),
        message.type === "audio" && /* @__PURE__ */ jsxs6(
          "div",
          {
            style: { display: "flex", alignItems: "center", gap: 8, padding: 8 },
            children: [
              /* @__PURE__ */ jsx7("span", { style: { fontSize: 20 }, children: "\u{1F3B5}" }),
              /* @__PURE__ */ jsx7("audio", { src: message.url, controls: true, style: { flex: 1, height: 36 } })
            ]
          }
        ),
        message.type === "document" && /* @__PURE__ */ jsxs6(
          "a",
          {
            href: message.url,
            target: "_blank",
            rel: "noopener noreferrer",
            style: {
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid #e0e0e0",
              textDecoration: "none",
              color: "inherit"
            },
            children: [
              /* @__PURE__ */ jsx7("span", { style: { fontSize: 28, flexShrink: 0 }, children: "\u{1F4C4}" }),
              /* @__PURE__ */ jsxs6("div", { style: { overflow: "hidden" }, children: [
                /* @__PURE__ */ jsx7(
                  "div",
                  {
                    style: {
                      fontWeight: 600,
                      fontSize: 13,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap"
                    },
                    children: message.fileName ?? "Document"
                  }
                ),
                /* @__PURE__ */ jsxs6("div", { style: { fontSize: 11, opacity: 0.6 }, children: [
                  formatFileSize2(message.fileSize),
                  " \xB7 Click to download"
                ] })
              ] })
            ]
          }
        ),
        message.type === "link" && /* @__PURE__ */ jsxs6(
          "a",
          {
            href: message.url,
            target: "_blank",
            rel: "noopener noreferrer",
            style: {
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 12px",
              borderRadius: 10,
              border: "1px solid #e0e0e0",
              textDecoration: "none",
              color: "#0084ff",
              wordBreak: "break-all",
              fontSize: 13
            },
            children: [
              "\u{1F517} ",
              message.url
            ]
          }
        )
      ]
    }
  );
};
export {
  ChatInput,
  HermesClient,
  MediaMessage,
  MessageList,
  OnlineBadge,
  ReactionPicker,
  RoomList,
  TypingIndicator2 as TypingIndicator,
  useMessages,
  usePresence,
  useReactions,
  useReadReceipts,
  useRooms,
  useTyping,
  useUpload
};
//# sourceMappingURL=react.js.map