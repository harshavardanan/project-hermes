"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/react.ts
var react_exports = {};
__export(react_exports, {
  ChatInput: () => ChatInput,
  HermesClient: () => HermesClient,
  MediaMessage: () => MediaMessage,
  MessageList: () => MessageList,
  OnlineBadge: () => OnlineBadge,
  ReactionPicker: () => ReactionPicker,
  RoomList: () => RoomList,
  TypingIndicator: () => TypingIndicator2,
  useMessages: () => useMessages,
  usePresence: () => usePresence,
  useReactions: () => useReactions,
  useReadReceipts: () => useReadReceipts,
  useRooms: () => useRooms,
  useTyping: () => useTyping,
  useUpload: () => useUpload
});
module.exports = __toCommonJS(react_exports);

// src/core/HermesClient.ts
var import_socket = require("socket.io-client");

// src/core/EventEmitter.ts
var EventEmitter = class {
  constructor() {
    this.listeners = {};
  }
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
    return this;
  }
  off(event, callback) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter((cb) => cb !== callback);
  }
  once(event, callback) {
    const wrapper = ((...args) => {
      callback(...args);
      this.off(event, wrapper);
    });
    return this.on(event, wrapper);
  }
  emit(event, ...args) {
    if (!this.listeners[event]) return this;
    this.listeners[event].forEach(
      (cb) => cb(...args)
    );
    return this;
  }
  removeAllListeners(event) {
    if (event) {
      delete this.listeners[event];
    } else {
      this.listeners = {};
    }
    return this;
  }
  listenerCount(event) {
    return this.listeners[event]?.length ?? 0;
  }
};

// src/core/HermesClient.ts
var HermesClient = class extends EventEmitter {
  constructor(config) {
    super();
    this.socket = null;
    this.token = null;
    this.user = null;
    this.status = "idle";
    this.config = config;
    if ("token" in config && typeof config.token === "string") {
      this.token = config.token;
    }
  }
  async connect() {
    this.status = "connecting";
    try {
      if (this.token) {
        await this._connectSocket();
        return this.user;
      }
      if (!("apiKey" in this.config)) {
        throw new Error("Either token or (apiKey + secret + userId) must be provided");
      }
      const cfg = this.config;
      const res = await fetch(`${cfg.endpoint}/hermes/connect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey: cfg.apiKey,
          secret: cfg.secret,
          userId: cfg.userId,
          displayName: cfg.displayName ?? cfg.userId,
          avatar: cfg.avatar,
          email: cfg.email
        })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Auth failed");
      this.token = data.token;
      this.user = {
        userId: data.user.hermesUserId,
        displayName: data.user.displayName,
        avatar: data.user.avatar,
        email: data.user.email
      };
      await this._connectSocket();
      return this.user;
    } catch (err) {
      this.status = "error";
      this.emit("error", err);
      throw err;
    }
  }
  async _connectSocket() {
    this.socket = (0, import_socket.io)(`${this.config.endpoint}/hermes`, {
      auth: { token: this.token },
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1e3
    });
    this._wireSocketEvents();
    await new Promise((resolve, reject) => {
      this.socket.once("connect", resolve);
      this.socket.once("connect_error", (err) => reject(err));
    });
    this.status = "connected";
    this.emit("connected");
  }
  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
    this.token = null;
    this.status = "disconnected";
    this.emit("disconnected", "manual");
  }
  _wireSocketEvents() {
    const s = this.socket;
    s.on("disconnect", (reason) => {
      this.status = "disconnected";
      this.emit("disconnected", reason);
    });
    s.on("connect_error", (err) => {
      this.status = "error";
      this.emit("error", err);
    });
    s.on("message:receive", (msg) => this.emit("message:receive", msg));
    s.on("message:deleted", (data) => this.emit("message:deleted", data));
    s.on("message:edited", (msg) => this.emit("message:edited", msg));
    s.on("room:created", (room) => this.emit("room:created", room));
    s.on("room:deleted", (data) => this.emit("room:deleted", data));
    s.on("room:member:joined", (data) => this.emit("room:member:joined", data));
    s.on("room:member:left", (data) => this.emit("room:member:left", data));
    s.on("user:online", (event) => this.emit("user:online", event));
    s.on("user:offline", (event) => this.emit("user:offline", event));
    s.on("typing:started", (event) => this.emit("typing:started", event));
    s.on("typing:stopped", (event) => this.emit("typing:stopped", event));
    s.on("receipt:updated", (event) => this.emit("receipt:updated", event));
    s.on("reaction:updated", (event) => this.emit("reaction:updated", event));
  }
  _emit(event, data) {
    return new Promise((resolve, reject) => {
      if (!this.socket?.connected) return reject(new Error("Not connected to Hermes engine"));
      const timer = setTimeout(() => reject(new Error(`Timed out waiting for "${event}"`)), 5e3);
      const callback = (response) => {
        clearTimeout(timer);
        if (response?.success === false) reject(new Error(response.error || "Unknown error"));
        else resolve(response);
      };
      if (data && Object.keys(data).length > 0) this.socket.emit(event, data, callback);
      else this.socket.emit(event, callback);
    });
  }
  async sendMessage(input) {
    const res = await this._emit("message:send", input);
    return res.message;
  }
  async getHistory(roomId, before, limit) {
    return this._emit("message:history", { roomId, before, limit });
  }
  async deleteMessage(messageId, roomId) {
    await this._emit("message:delete", { messageId, roomId });
  }
  async editMessage(messageId, roomId, text) {
    const res = await this._emit("message:edit", { messageId, roomId, text });
    return res.message;
  }
  async createDirectRoom(input) {
    const res = await this._emit("room:create:direct", { targetHermesUserId: input.targetUserId });
    return res.room;
  }
  async createGroupRoom(input) {
    const res = await this._emit("room:create:group", input);
    return res.room;
  }
  async deleteRoom(roomId) {
    await this._emit("room:delete", { roomId });
  }
  async getRooms() {
    const res = await this._emit("room:list");
    return res.rooms;
  }
  async addMember(roomId, newMemberId) {
    await this._emit("room:member:add", { roomId, newMemberId });
  }
  async removeMember(roomId, targetId) {
    await this._emit("room:member:remove", { roomId, targetId });
  }
  pingPresence(roomId) {
    this.socket?.emit("presence:ping", { roomId });
  }
  startTyping(roomId) {
    this.socket?.emit("typing:start", { roomId });
  }
  stopTyping(roomId) {
    this.socket?.emit("typing:stop", { roomId });
  }
  async markSeen(roomId, lastMessageId) {
    await this._emit("receipt:seen", { roomId, lastMessageId });
  }
  async addReaction(messageId, roomId, emoji) {
    await this._emit("reaction:add", { messageId, roomId, emoji });
  }
  async uploadFile(file) {
    if (!this.token) throw new Error("Not connected");
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${this.config.endpoint}/hermes/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${this.token}` },
      body: formData
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Upload failed");
    return data;
  }
  get isConnected() {
    return this.status === "connected" && !!this.socket?.connected;
  }
  get currentUser() {
    return this.user;
  }
};

// src/react/hooks/useMessages.ts
var import_react = require("react");
var useMessages = (client, roomId) => {
  const [messages, setMessages] = (0, import_react.useState)([]);
  const [loading, setLoading] = (0, import_react.useState)(false);
  const [loadingMore, setLoadingMore] = (0, import_react.useState)(false);
  const [hasMore, setHasMore] = (0, import_react.useState)(false);
  const [error, setError] = (0, import_react.useState)(null);
  const [typingUsers, setTypingUsers] = (0, import_react.useState)([]);
  const oldestMessageId = (0, import_react.useRef)(void 0);
  (0, import_react.useEffect)(() => {
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
  (0, import_react.useEffect)(() => {
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
  (0, import_react.useEffect)(() => {
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
  (0, import_react.useEffect)(() => {
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
  const loadMore = (0, import_react.useCallback)(async () => {
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
  const sendMessage = (0, import_react.useCallback)(
    async (input) => {
      if (!roomId) throw new Error("No room selected");
      return client.sendMessage({ ...input, roomId });
    },
    [roomId, client]
  );
  const editMessage = (0, import_react.useCallback)(
    async (messageId, text) => {
      if (!roomId) throw new Error("No room selected");
      return client.editMessage(messageId, roomId, text);
    },
    [roomId, client]
  );
  const deleteMessage = (0, import_react.useCallback)(
    async (messageId) => {
      if (!roomId) throw new Error("No room selected");
      return client.deleteMessage(messageId, roomId);
    },
    [roomId, client]
  );
  const addReaction = (0, import_react.useCallback)(
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
var import_react2 = require("react");
var useRooms = (client) => {
  const [rooms, setRooms] = (0, import_react2.useState)([]);
  const [loading, setLoading] = (0, import_react2.useState)(true);
  const [error, setError] = (0, import_react2.useState)(null);
  const fetchedRef = (0, import_react2.useRef)(false);
  const fetchRooms = (0, import_react2.useCallback)(async () => {
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
  (0, import_react2.useEffect)(() => {
    fetchRooms();
    const onConnected = () => {
      if (!fetchedRef.current) fetchRooms();
    };
    client.on("connected", onConnected);
    return () => {
      client.off("connected", onConnected);
    };
  }, [fetchRooms, client]);
  (0, import_react2.useEffect)(() => {
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
  const createDirect = (0, import_react2.useCallback)(
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
  const createGroup = (0, import_react2.useCallback)(
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
  const deleteRoom = (0, import_react2.useCallback)(
    async (roomId) => {
      await client.deleteRoom(roomId);
      setRooms((prev) => prev.filter((r) => r._id !== roomId));
    },
    [client]
  );
  const addMember = (0, import_react2.useCallback)(
    (roomId, userId) => client.addMember(roomId, userId),
    [client]
  );
  const removeMember = (0, import_react2.useCallback)(
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
var import_react3 = require("react");
var usePresence = (client) => {
  const [onlineMap, setOnlineMap] = (0, import_react3.useState)(/* @__PURE__ */ new Map());
  (0, import_react3.useEffect)(() => {
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
  const isOnline = (0, import_react3.useCallback)(
    (userId) => onlineMap.get(userId) ?? false,
    [onlineMap]
  );
  const onlineUsers = Array.from(onlineMap.entries()).filter(([, online]) => online).map(([userId]) => userId);
  return { isOnline, onlineUsers, onlineMap };
};

// src/react/hooks/useTyping.ts
var import_react4 = require("react");
var useTyping = (client, roomId) => {
  const [typingUsers, setTypingUsers] = (0, import_react4.useState)(
    /* @__PURE__ */ new Map()
  );
  const timeouts = (0, import_react4.useRef)(
    /* @__PURE__ */ new Map()
  );
  const typingRef = (0, import_react4.useRef)(false);
  const stopTimeout = (0, import_react4.useRef)(null);
  (0, import_react4.useEffect)(() => {
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
  const startTyping = (0, import_react4.useCallback)(() => {
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
  const stopTyping = (0, import_react4.useCallback)(() => {
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
var import_react5 = require("react");
var useReadReceipts = (client, roomId) => {
  const [receipts, setReceipts] = (0, import_react5.useState)(/* @__PURE__ */ new Map());
  (0, import_react5.useEffect)(() => {
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
  const markSeen = (0, import_react5.useCallback)(
    async (lastMessageId) => {
      if (!roomId) return;
      await client.markSeen(roomId, lastMessageId);
    },
    [roomId, client]
  );
  const seenBy = (0, import_react5.useCallback)(
    (messageId) => {
      return Array.from(receipts.get(messageId) ?? []);
    },
    [receipts]
  );
  return { markSeen, seenBy, receipts };
};

// src/react/hooks/useReactions.ts
var import_react6 = require("react");
var useReactions = (client, roomId) => {
  const react = (0, import_react6.useCallback)(
    async (messageId, emoji) => {
      if (!roomId) throw new Error("No room selected");
      await client.addReaction(messageId, roomId, emoji);
    },
    [roomId, client]
  );
  const hasReacted = (0, import_react6.useCallback)(
    (reactions, emoji) => {
      const userId = client.currentUser?.userId;
      if (!userId) return false;
      return reactions.find((r) => r.emoji === emoji)?.users.includes(userId) ?? false;
    },
    [client]
  );
  const getCount = (0, import_react6.useCallback)(
    (reactions, emoji) => {
      return reactions.find((r) => r.emoji === emoji)?.users.length ?? 0;
    },
    []
  );
  const getEmojis = (0, import_react6.useCallback)((reactions) => {
    return reactions.filter((r) => r.users.length > 0).map((r) => r.emoji);
  }, []);
  return { react, hasReacted, getCount, getEmojis };
};

// src/react/hooks/useUpload.ts
var import_react7 = require("react");
var useUpload = (client) => {
  const [uploading, setUploading] = (0, import_react7.useState)(false);
  const [error, setError] = (0, import_react7.useState)(null);
  const [lastUpload, setLastUpload] = (0, import_react7.useState)(null);
  const upload = (0, import_react7.useCallback)(
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
  const sendFile = (0, import_react7.useCallback)(
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
  const validate = (0, import_react7.useCallback)((file, maxMb = 50) => {
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
var import_react8 = require("react");
var import_jsx_runtime = require("react/jsx-runtime");
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
  const ref = (0, import_react8.useRef)(null);
  (0, import_react8.useEffect)(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
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
      children: REACTION_EMOJIS.map((emoji) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
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
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
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
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
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
            children: [0, 1, 2].map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
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
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { fontSize: 11, color: "#999" }, children: text })
      ]
    }
  );
};
var DefaultMessage = ({ message, isOwn, onEdit, onDelete, onReact, onReply, renderAvatar }) => {
  const [hovered, setHovered] = (0, import_react8.useState)(false);
  const [pickerOpen, setPickerOpen] = (0, import_react8.useState)(false);
  if (message.isDeleted) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
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
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
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
        !isOwn && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { flexShrink: 0 }, children: renderAvatar ? renderAvatar(message.senderId) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
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
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
          "div",
          {
            style: {
              maxWidth: "70%",
              display: "flex",
              flexDirection: "column",
              alignItems: isOwn ? "flex-end" : "flex-start"
            },
            children: [
              (onEdit || onDelete || onReact || onReply) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
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
                    onReact && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { position: "relative" }, children: [
                      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                        ActionBtn,
                        {
                          onClick: () => setPickerOpen((p) => !p),
                          title: "React",
                          children: "\u{1FAE0}"
                        }
                      ),
                      pickerOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                        EmojiPicker,
                        {
                          isOwn,
                          onPick: (emoji) => onReact(message._id, emoji),
                          onClose: () => setPickerOpen(false)
                        }
                      )
                    ] }),
                    onReply && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActionBtn, { onClick: () => onReply(message), title: "Reply", children: "\u21A9" }),
                    isOwn && onEdit && message.type === "text" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
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
                    isOwn && onDelete && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActionBtn, { onClick: () => onDelete(message._id), title: "Delete", children: "\u{1F5D1}" })
                  ]
                }
              ),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
                "div",
                {
                  style: {
                    padding: "8px 12px",
                    borderRadius: isOwn ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                    background: isOwn ? "#0084ff" : "#f0f0f0",
                    color: isOwn ? "#fff" : "#000"
                  },
                  children: [
                    message.replyTo && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
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
                    message.type === "text" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { style: { margin: 0, wordBreak: "break-word" }, children: [
                      message.text,
                      message.editedAt && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { fontSize: 10, opacity: 0.6, marginLeft: 6 }, children: "(edited)" })
                    ] }),
                    message.type === "link" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
                      message.text && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { style: { margin: "0 0 4px" }, children: message.text }),
                      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
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
                    message.type === "image" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                      "img",
                      {
                        src: message.url,
                        alt: message.fileName || "image",
                        style: { maxWidth: "100%", borderRadius: 8, display: "block" }
                      }
                    ),
                    message.type === "video" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                      "video",
                      {
                        src: message.url,
                        controls: true,
                        style: { maxWidth: "100%", borderRadius: 8 }
                      }
                    ),
                    message.type === "audio" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("audio", { src: message.url, controls: true, style: { width: "100%" } }),
                    message.type === "document" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
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
                          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { fontSize: 24 }, children: "\u{1F4C4}" }),
                          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
                            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { fontWeight: 600, fontSize: 13 }, children: message.fileName }),
                            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { fontSize: 11, opacity: 0.7 }, children: formatFileSize(message.fileSize) })
                          ] })
                        ]
                      }
                    ),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
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
              message.reactions?.filter((r) => r.users.length > 0).length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                "div",
                {
                  style: { display: "flex", gap: 4, flexWrap: "wrap", marginTop: 4 },
                  children: message.reactions.filter((r) => r.users.length > 0).map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
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
                        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
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
var ActionBtn = ({ onClick, title, children }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
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
  const bottomRef = (0, import_react8.useRef)(null);
  const containerRef = (0, import_react8.useRef)(null);
  (0, import_react8.useEffect)(() => {
    if (autoScroll && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, autoScroll]);
  (0, import_react8.useEffect)(() => {
    const container = containerRef.current;
    if (!container || !onLoadMore) return;
    const onScroll = () => {
      if (container.scrollTop === 0 && hasMore && !loadingMore) onLoadMore();
    };
    container.addEventListener("scroll", onScroll);
    return () => container.removeEventListener("scroll", onScroll);
  }, [hasMore, loadingMore, onLoadMore]);
  if (loading) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
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
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("style", { children: `
        @keyframes hermes-bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40%            { transform: translateY(-5px); }
        }
        @keyframes hermes-pop {
          from { opacity: 0; transform: scale(0.85); }
          to   { opacity: 1; transform: scale(1); }
        }
      ` }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
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
          hasMore && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { textAlign: "center", marginBottom: 12 }, children: loadingMore ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { fontSize: 12, opacity: 0.5 }, children: "Loading older messages..." }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
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
          messages.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
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
            return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { marginBottom: 8 }, children: renderMessage ? renderMessage(message, isOwn) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
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
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TypingIndicator, { typingUsers }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ref: bottomRef })
        ]
      }
    )
  ] });
};

// src/react/components/ChatInput.tsx
var import_react9 = require("react");
var import_jsx_runtime2 = require("react/jsx-runtime");
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
  const [text, setText] = (0, import_react9.useState)("");
  const [sending, setSending] = (0, import_react9.useState)(false);
  const fileRef = (0, import_react9.useRef)(null);
  const textareaRef = (0, import_react9.useRef)(null);
  const resizeTextarea = (0, import_react9.useCallback)(() => {
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
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
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
        replyingTo && /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
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
              /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { style: { overflow: "hidden" }, children: [
                /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { style: { fontWeight: 600, marginRight: 4 }, children: "Replying to:" }),
                /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { style: { opacity: 0.7 }, children: replyingTo.type === "text" ? replyingTo.text?.slice(0, 60) : `[${replyingTo.type}]` })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
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
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
          "div",
          {
            className: "hermes-chat-input__row",
            style: { display: "flex", alignItems: "flex-end", gap: 8 },
            children: [
              onSendFile && /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_jsx_runtime2.Fragment, { children: [
                /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
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
                    children: renderAttachIcon ? renderAttachIcon() : /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
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
                        children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: "m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" })
                      }
                    )
                  }
                ),
                /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
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
              /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
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
              /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
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
                  children: renderSendIcon ? renderSendIcon() : /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("svg", { width: "22", height: "22", viewBox: "0 0 24 24", fill: "currentColor", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: "M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" }) })
                }
              )
            ]
          }
        ),
        text.length > maxLength * 0.8 && /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
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
var import_jsx_runtime3 = require("react/jsx-runtime");
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
var DefaultRoomItem = ({ room, isActive, currentUserId, renderAvatar, itemClassName }) => /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
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
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { style: { flexShrink: 0 }, children: renderAvatar ? renderAvatar(room) : /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
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
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { style: { flex: 1, overflow: "hidden" }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
          "div",
          {
            style: {
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline"
            },
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
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
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
                "span",
                {
                  style: { fontSize: 11, opacity: 0.5, flexShrink: 0, marginLeft: 4 },
                  children: formatLastActivity(room.lastActivity)
                }
              )
            ]
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
          "div",
          {
            style: {
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 2
            },
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
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
              room.unreadCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
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
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
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
        (onCreateDirect || onCreateGroup) && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
          "div",
          {
            style: {
              display: "flex",
              gap: 8,
              padding: "10px 12px",
              borderBottom: "1px solid #e0e0e0"
            },
            children: [
              onCreateDirect && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
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
              onCreateGroup && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
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
        loading && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { style: { padding: "12px 16px", opacity: 0.5, fontSize: 13 }, children: "Loading rooms..." }),
        !loading && rooms.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
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
          return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { onClick: () => onSelectRoom(room), children: renderRoomItem ? renderRoomItem(room, isActive) : /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
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
var import_jsx_runtime4 = require("react/jsx-runtime");
var TypingIndicator2 = ({
  typingText,
  className = ""
}) => {
  if (!typingText) return null;
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(
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
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { style: { display: "flex", gap: 3 }, children: [0, 1, 2].map((i) => /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
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
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { style: { fontSize: 12, opacity: 0.6 }, children: typingText }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("style", { children: `
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
var import_jsx_runtime5 = require("react/jsx-runtime");
var OnlineBadge = ({
  isOnline,
  size = 10,
  className = ""
}) => /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
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
var import_react10 = require("react");
var import_emoji_picker_react = __toESM(require("emoji-picker-react"), 1);
var import_jsx_runtime6 = require("react/jsx-runtime");
var DEFAULT_EMOJIS = ["\u{1F44D}", "\u2764\uFE0F", "\u{1F602}", "\u{1F62E}", "\u{1F622}", "\u{1F525}", "\u{1F389}", "\u{1F44F}"];
var ReactionPicker = ({
  onSelect,
  currentReactions = [],
  currentUserId,
  emojis = DEFAULT_EMOJIS,
  className = "",
  align = "left"
}) => {
  const [showPicker, setShowPicker] = (0, import_react10.useState)(false);
  const containerRef = (0, import_react10.useRef)(null);
  const hasReacted = (emoji) => {
    if (!currentUserId) return false;
    return currentReactions.find((r) => r.emoji === emoji)?.users.includes(currentUserId) ?? false;
  };
  const handleEmojiClick = (emojiData) => {
    onSelect(emojiData.emoji);
    setShowPicker(false);
  };
  (0, import_react10.useEffect)(() => {
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
  return /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(
    "div",
    {
      ref: containerRef,
      style: { position: "relative", display: "inline-block" },
      className,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(
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
              emojis.map((emoji) => /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
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
              /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
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
        showPicker && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
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
            children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
              import_emoji_picker_react.default,
              {
                theme: import_emoji_picker_react.Theme.DARK,
                onEmojiClick: handleEmojiClick,
                height: 440,
                width: 360,
                searchPlaceHolder: "Search emoji...",
                lazyLoadEmojis: true
              }
            )
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("style", { children: `
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
var import_jsx_runtime7 = require("react/jsx-runtime");
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
  return /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)(
    "div",
    {
      className: `hermes-media-message hermes-media-message--${message.type} ${className}`,
      style: { maxWidth },
      children: [
        message.type === "image" && /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
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
        message.type === "video" && /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
          "video",
          {
            src: message.url,
            poster: message.thumbnail,
            controls: true,
            style: { width: "100%", borderRadius: 10 }
          }
        ),
        message.type === "audio" && /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)(
          "div",
          {
            style: { display: "flex", alignItems: "center", gap: 8, padding: 8 },
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { style: { fontSize: 20 }, children: "\u{1F3B5}" }),
              /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("audio", { src: message.url, controls: true, style: { flex: 1, height: 36 } })
            ]
          }
        ),
        message.type === "document" && /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)(
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
              /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { style: { fontSize: 28, flexShrink: 0 }, children: "\u{1F4C4}" }),
              /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { style: { overflow: "hidden" }, children: [
                /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
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
                /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { style: { fontSize: 11, opacity: 0.6 }, children: [
                  formatFileSize2(message.fileSize),
                  " \xB7 Click to download"
                ] })
              ] })
            ]
          }
        ),
        message.type === "link" && /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)(
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ChatInput,
  HermesClient,
  MediaMessage,
  MessageList,
  OnlineBadge,
  ReactionPicker,
  RoomList,
  TypingIndicator,
  useMessages,
  usePresence,
  useReactions,
  useReadReceipts,
  useRooms,
  useTyping,
  useUpload
});
//# sourceMappingURL=react.cjs.map