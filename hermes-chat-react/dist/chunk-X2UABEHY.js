// src/core/HermesClient.ts
import { io } from "socket.io-client";

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
          displayName: cfg.displayName,
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
    this.socket = io(`${this.config.endpoint}/hermes`, {
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

export {
  HermesClient
};
//# sourceMappingURL=chunk-X2UABEHY.js.map