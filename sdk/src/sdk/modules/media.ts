import type { HermesClient } from "../core/HermesClient";
import type { UploadResult, Message } from "../types/index";

export class Media {
  constructor(private client: HermesClient) {}

  
  async upload(file: File): Promise<UploadResult> {
    return this.client.uploadFile(file);
  }

  
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

  
  isValidSize(file: File, maxMb = 50): boolean {
    return file.size <= maxMb * 1024 * 1024;
  }

  
  formatSize(bytes: number): string {
    if (bytes >= 1024 * 1024 * 1024)
      return `${(bytes / 1024 / 1024 / 1024).toFixed(1)} GB`;
    if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
    if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${bytes} B`;
  }
}
