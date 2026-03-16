import { useState, useCallback } from "react";
import type { HermesClient } from "../../core/HermesClient";
import type { UploadResult, Message } from "../../types/index";

export const useUpload = (client: HermesClient) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpload, setLastUpload] = useState<UploadResult | null>(null);

  
  const upload = useCallback(
    async (file: File): Promise<UploadResult | null> => {
      setUploading(true);
      setError(null);
      try {
        const result = await client.uploadFile(file);
        setLastUpload(result);
        return result;
      } catch (err: any) {
        setError(err.message);
        return null;
      } finally {
        setUploading(false);
      }
    },
    [client],
  );

  
  const sendFile = useCallback(
    async (
      roomId: string,
      file: File,
      replyTo?: string,
    ): Promise<Message | null> => {
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
          replyTo,
        });
        return message;
      } catch (err: any) {
        setError(err.message);
        return null;
      } finally {
        setUploading(false);
      }
    },
    [client],
  );

  
  const validate = useCallback((file: File, maxMb = 50): string | null => {
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
      "text/plain",
    ];
    if (!allowed.includes(file.type)) {
      return `File type not supported: ${file.type}`;
    }
    return null;
  }, []);

  return { upload, sendFile, validate, uploading, error, lastUpload };
};
