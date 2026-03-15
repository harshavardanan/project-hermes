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

export class HermesClient extends EventEmitter {
  private config: HermesConfig;
  private socket: Socket | null = null;
  private token: string | null = null;

  public user: HermesUser | null = null;
  public status: ConnectionStatus = "idle";

  constructor(config: HermesConfig) {
    super();
    this.config = config;
    if ("token" in config && config.token) {
      this.token = config.token;
    }
  }

  
  async connect(): Promise<HermesUser> {
    this.status = "connecting";

    try {
      if (this.token) {
        await this._connectSocket();
        return this.user!;
      }

      if (!this.config.apiKey || !this.config.secret || !this.config.userId) {
        throw new Error(
          "Either token or (apiKey + secret + userId) must be provided",
        );
      }

      if ("apiKey" in this.config) {
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
            email: cfg.email,
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
      }

      await this._connectSocket();
      return this.user!;
    } catch (err) {
      this.status = "error";
      this.emit("error", err as Error);
      throw err;
    }
  }

  
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

  
  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
    this.token = null;
    this.status = "disconnected";
    this.emit("disconnected", "manual");
  }

  
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
    s.on("message:receive", (msg: Message) =>
      this.emit("message:receive", msg),
    );
    s.on("message:deleted", (data) => this.emit("message:deleted", data));
    s.on("message:edited", (msg: Message) => this.emit("message:edited", msg));
    s.on("room:created", (room: Room) => this.emit("room:created", room));
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

  
  _emit<T = any>(event: string, data?: any): Promise<T> {
    return new Promise((resolve, reject) => {
      if (!this.socket?.connected) {
        return reject(new Error("Not connected to Hermes engine"));
      }

      const timer = setTimeout(() => {
        reject(new Error(`Timed out waiting for "${event}"`));
      }, 5000); 

      const callback = (response: any) => {
        clearTimeout(timer);
        if (response?.success === false) {
          reject(new Error(response.error || "Unknown error"));
        } else {
          resolve(response);
        }
      };

      
      if (data && Object.keys(data).length > 0) {
        this.socket.emit(event, data, callback);
      } else {
        this.socket.emit(event, callback);
      }
    });
  }

  
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

  
  async createDirectRoom(input: CreateDirectRoomInput): Promise<Room> {
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
    const res = await this._emit<{ rooms: Room[] }>("room:list");
    return res.rooms;
  }

  async addMember(roomId: string, newMemberId: string): Promise<void> {
    await this._emit("room:member:add", { roomId, newMemberId });
  }

  async removeMember(roomId: string, targetId: string): Promise<void> {
    await this._emit("room:member:remove", { roomId, targetId });
  }

  pingPresence(roomId: string): void {
    this.socket?.emit("presence:ping", { roomId });
  }
  startTyping(roomId: string): void {
    this.socket?.emit("typing:start", { roomId });
  }
  stopTyping(roomId: string): void {
    this.socket?.emit("typing:stop", { roomId });
  }
  async markSeen(roomId: string, lastMessageId: string): Promise<void> {
    await this._emit("receipt:seen", { roomId, lastMessageId });
  }
  async addReaction(
    messageId: string,
    roomId: string,
    emoji: string,
  ): Promise<void> {
    await this._emit("reaction:add", { messageId, roomId, emoji });
  }
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
  get isConnected(): boolean {
    return this.status === "connected" && !!this.socket?.connected;
  }
  get currentUser(): HermesUser | null {
    return this.user;
  }
}
