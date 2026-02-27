import type { HermesClient } from "../core/HermesClient.js";
import type { UploadResult, Message } from "../types/index.js";

// ── Media Module ──────────────────────────────────────────────────────────────
// Handles file uploads and sends them as messages in one step.
// Usage:
//   const media = new Media(client);
//   await media.sendFile("roomId", file);

export class Media {
  constructor(private client: HermesClient) {}

  // Upload a file and return the result (url, type, fileName etc.)
  async upload(file: File): Promise<UploadResult> {
    return this.client.uploadFile(file);
  }

  // Upload a file AND send it as a message in one call
  async sendFile(
    roomId: string,
    file: File,
    replyTo?: string,
  ): Promise<Message> {
    const uploaded = await this.client.uploadFile(file);
    return this.client.sendMessage({
      roomId,
      type: uploaded.type,
      url: uploaded.url,
      fileName: uploaded.fileName,
      fileSize: uploaded.fileSize,
      mimeType: uploaded.mimeType,
      thumbnail: uploaded.thumbnail,
      replyTo,
    });
  }

  // Check if a file is within the allowed size (50MB)
  isValidSize(file: File, maxMb = 50): boolean {
    return file.size <= maxMb * 1024 * 1024;
  }

  // Get a human-readable file size string
  formatSize(bytes: number): string {
    if (bytes >= 1024 * 1024 * 1024)
      return `${(bytes / 1024 / 1024 / 1024).toFixed(1)} GB`;
    if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
    if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${bytes} B`;
  }
}
