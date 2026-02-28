import type { HermesClient } from "../core/HermesClient";
import type {
  Message,
  SendMessageInput,
  MessageHistoryResult,
} from "../types/index";

// ── Messaging Module ──────────────────────────────────────────────────────────
// Wraps HermesClient messaging methods with extra convenience helpers.
// Use this directly in non-React environments.
//
// Usage:
//   const messaging = new Messaging(client);
//   await messaging.send({ roomId, type: "text", text: "Hello!" });

export class Messaging {
  constructor(private client: HermesClient) {}

  // Send any message type
  send(input: SendMessageInput): Promise<Message> {
    return this.client.sendMessage(input);
  }

  // Shorthand for text messages
  sendText(roomId: string, text: string): Promise<Message> {
    return this.client.sendMessage({ roomId, type: "text", text });
  }

  // Shorthand for link messages
  sendLink(roomId: string, url: string, text?: string): Promise<Message> {
    return this.client.sendMessage({ roomId, type: "link", url, text });
  }

  // Send a media/doc after uploading — pass the UploadResult directly
  sendMedia(
    roomId: string,
    upload: {
      type: "image" | "video" | "audio" | "document";
      url: string;
      fileName: string;
      fileSize: number;
      mimeType: string;
      thumbnail?: string;
    },
    replyTo?: string,
  ): Promise<Message> {
    return this.client.sendMessage({
      roomId,
      type: upload.type,
      url: upload.url,
      fileName: upload.fileName,
      fileSize: upload.fileSize,
      mimeType: upload.mimeType,
      thumbnail: upload.thumbnail,
      replyTo,
    });
  }

  // Reply to a message
  reply(roomId: string, text: string, replyTo: string): Promise<Message> {
    return this.client.sendMessage({ roomId, type: "text", text, replyTo });
  }

  // Edit a message
  edit(messageId: string, roomId: string, text: string): Promise<Message> {
    return this.client.editMessage(messageId, roomId, text);
  }

  // Soft delete a message
  delete(messageId: string, roomId: string): Promise<void> {
    return this.client.deleteMessage(messageId, roomId);
  }

  // Fetch paginated history
  history(
    roomId: string,
    before?: string,
    limit?: number,
  ): Promise<MessageHistoryResult> {
    return this.client.getHistory(roomId, before, limit);
  }

  // Listen for incoming messages
  onMessage(callback: (message: Message) => void): () => void {
    this.client.on("message:receive", callback);
    return () => this.client.off("message:receive", callback);
  }

  // Listen for deleted messages
  onDelete(
    callback: (data: { messageId: string; roomId: string }) => void,
  ): () => void {
    this.client.on("message:deleted", callback);
    return () => this.client.off("message:deleted", callback);
  }

  // Listen for edited messages
  onEdit(callback: (message: Message) => void): () => void {
    this.client.on("message:edited", callback);
    return () => this.client.off("message:edited", callback);
  }
}
