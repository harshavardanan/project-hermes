import { io, Socket } from "socket.io-client";
import { EventEmitter } from "./EventEmitter";
import type {
  HermesConfig,
  HermesUser,
  ConnectionStatus,
  Message,
  Room,
  SendMessageInput,
  MessageHistoryResult,
  CreateDirectRoomInput,
  CreateGroupRoomInput,
  UploadResult,
} from "../types/index";

// ── HermesClient ──────────────────────────────────────────────────────────────
// Two ways to initialize:
//
// 1. Full credentials (Joe's backend dev testing):
//    new HermesClient({ endpoint, apiKey, secret, userId, displayName })
//
// 2. Token only (production B2B SaaS — token fetched from Joe's backend):
//    new HermesClient({ endpoint, token })

export class HermesClient extends EventEmitter {
  private config: HermesConfig;
  private socket: Socket | null = null;
  private token: string | null = null;

  public user: HermesUser | null = null;
  public status: ConnectionStatus = "idle";

  constructor(config: HermesConfig) {
    super();
    this.config = config;
    // If token is pre-provided, store it immediately
    if (config.token) {
      this.token = config.token;
    }
  }

  // ── Connect ─────────────────────────────────────────────────────────────────
  async connect(): Promise<HermesUser> {
    this.status = "connecting";

    try {
      // ── Mode 1: Token already provided (production flow) ──────────────────
      // Joe's backend already called /hermes/connect and passed us the token
      if (this.token) {
        await this._connectSocket();
        return this.user!;
      }

      // ── Mode 2: Full credentials (dev/testing flow) ────────────────────────
      // Call /hermes/connect ourselves with apiKey + secret + userId
      if (!this.config.apiKey || !this.config.secret || !this.config.userId) {
        throw new Error(
          "Either token or (apiKey + secret + userId) must be provided",
        );
      }

      const res = await fetch(`${this.config.endpoint}/hermes/connect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey: this.config.apiKey,
          secret: this.config.secret,
          userId: this.config.userId,
          displayName: this.config.displayName ?? this.config.userId,
          avatar: this.config.avatar,
          email: this.config.email,
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Auth failed");

      this.token = data.token;
      this.user = {
        userId: data.user.hermesUserId,
        displayName: data.user.displayName,
        avatar: data.user.avatar,
        email: data.user.email,
      };

      await this._connectSocket();
      return this.user!;
    } catch (err) {
      this.status = "error";
      this.emit("error", err as Error);
      throw err;
    }
  }

  // ── Connect socket with stored token ───────────────────────────────────────
  private async _connectSocket(): Promise<void> {
    this.socket = io(`${this.config.endpoint}/hermes`, {
      auth: { token: this.token },
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this._wireSocketEvents();

    await new Promise<void>((resolve, reject) => {
      this.socket!.once("connect", resolve);
      this.socket!.once("connect_error", (err) => reject(err));
    });

    this.status = "connected";
    this.emit("connected");
  }

  // ── Disconnect ──────────────────────────────────────────────────────────────
  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
    this.token = null;
    this.status = "disconnected";
    this.emit("disconnected", "manual");
  }

  // ── Wire socket → EventEmitter ─────────────────────────────────────────────
  private _wireSocketEvents(): void {
    const s = this.socket!;

    s.on("disconnect", (reason) => {
      this.status = "disconnected";
      this.emit("disconnected", reason);
    });

    s.on("connect_error", (err) => {
      this.status = "error";
      this.emit("error", err);
    });

    // Messages
    s.on("message:receive", (msg: Message) =>
      this.emit("message:receive", msg),
    );
    s.on("message:deleted", (data) => this.emit("message:deleted", data));
    s.on("message:edited", (msg: Message) => this.emit("message:edited", msg));

    // Rooms
    s.on("room:created", (room: Room) => this.emit("room:created", room));
    s.on("room:deleted", (data) => this.emit("room:deleted", data));
    s.on("room:member:joined", (data) => this.emit("room:member:joined", data));
    s.on("room:member:left", (data) => this.emit("room:member:left", data));

    // Presence
    s.on("user:online", (event) => this.emit("user:online", event));
    s.on("user:offline", (event) => this.emit("user:offline", event));

    // Typing
    s.on("typing:started", (event) => this.emit("typing:started", event));
    s.on("typing:stopped", (event) => this.emit("typing:stopped", event));

    // Receipts
    s.on("receipt:updated", (event) => this.emit("receipt:updated", event));

    // Reactions
    s.on("reaction:updated", (event) => this.emit("reaction:updated", event));
  }

  // ── Internal socket emit with ack ──────────────────────────────────────────
  _emit<T = any>(event: string, data: any): Promise<T> {
    return new Promise((resolve, reject) => {
      if (!this.socket?.connected) {
        return reject(new Error("Not connected to Hermes engine"));
      }
      this.socket.emit(event, data, (response: any) => {
        if (response?.success === false) {
          reject(new Error(response.error || "Unknown error"));
        } else {
          resolve(response);
        }
      });
    });
  }

  // ── Messaging ────────────────────────────────────────────────────────────────
  async sendMessage(input: SendMessageInput): Promise<Message> {
    const res = await this._emit<{ message: Message }>("message:send", input);
    return res.message;
  }

  async getHistory(
    roomId: string,
    before?: string,
    limit?: number,
  ): Promise<MessageHistoryResult> {
    return this._emit("message:history", { roomId, before, limit });
  }

  async deleteMessage(messageId: string, roomId: string): Promise<void> {
    await this._emit("message:delete", { messageId, roomId });
  }

  async editMessage(
    messageId: string,
    roomId: string,
    text: string,
  ): Promise<Message> {
    const res = await this._emit<{ message: Message }>("message:edit", {
      messageId,
      roomId,
      text,
    });
    return res.message;
  }

  // ── Rooms ────────────────────────────────────────────────────────────────────
  async createDirectRoom(input: CreateDirectRoomInput): Promise<Room> {
    // Server expects targetHermesUserId — the HermesUser._id of the target
    const res = await this._emit<{ room: Room }>("room:create:direct", {
      targetHermesUserId: input.targetUserId,
    });
    return res.room;
  }

  async createGroupRoom(input: CreateGroupRoomInput): Promise<Room> {
    const res = await this._emit<{ room: Room }>("room:create:group", input);
    return res.room;
  }

  async deleteRoom(roomId: string): Promise<void> {
    await this._emit("room:delete", { roomId });
  }

  async getRooms(): Promise<Room[]> {
    const res = await this._emit<{ rooms: Room[] }>("room:list", {});
    return res.rooms;
  }

  async addMember(roomId: string, newMemberId: string): Promise<void> {
    await this._emit("room:member:add", { roomId, newMemberId });
  }

  async removeMember(roomId: string, targetId: string): Promise<void> {
    await this._emit("room:member:remove", { roomId, targetId });
  }

  // ── Presence ────────────────────────────────────────────────────────────────
  pingPresence(roomId: string): void {
    this.socket?.emit("presence:ping", { roomId });
  }

  // ── Typing ──────────────────────────────────────────────────────────────────
  startTyping(roomId: string): void {
    this.socket?.emit("typing:start", { roomId });
  }

  stopTyping(roomId: string): void {
    this.socket?.emit("typing:stop", { roomId });
  }

  // ── Receipts ────────────────────────────────────────────────────────────────
  async markSeen(roomId: string, lastMessageId: string): Promise<void> {
    await this._emit("receipt:seen", { roomId, lastMessageId });
  }

  // ── Reactions ───────────────────────────────────────────────────────────────
  async addReaction(
    messageId: string,
    roomId: string,
    emoji: string,
  ): Promise<void> {
    await this._emit("reaction:add", { messageId, roomId, emoji });
  }

  // ── Upload ──────────────────────────────────────────────────────────────────
  async uploadFile(file: File): Promise<UploadResult> {
    if (!this.token) throw new Error("Not connected");
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${this.config.endpoint}/hermes/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${this.token}` },
      body: formData,
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Upload failed");
    return data as UploadResult;
  }

  // ── Getters ─────────────────────────────────────────────────────────────────
  get isConnected(): boolean {
    return this.status === "connected" && !!this.socket?.connected;
  }

  get currentUser(): HermesUser | null {
    return this.user;
  }
}
