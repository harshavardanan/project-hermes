import React from "react";
import type { Message } from "../../types/index";

interface MediaMessageProps {
  message: Message;
  className?: string;
  maxWidth?: number | string;
}

const formatFileSize = (bytes?: number) => {
  if (!bytes) return "";
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${bytes} B`;
};

export const MediaMessage: React.FC<MediaMessageProps> = ({
  message,
  className = "",
  maxWidth = 300,
}) => {
  if (!message.url) return null;

  return (
    <div
      className={`hermes-media-message hermes-media-message--${message.type} ${className}`}
      style={{ maxWidth }}
    >
      {message.type === "image" && (
        <img
          src={message.url}
          alt={message.fileName ?? "image"}
          style={{
            width: "100%",
            borderRadius: 10,
            display: "block",
            cursor: "pointer",
          }}
          onClick={() => window.open(message.url, "_blank")}
        />
      )}

      {message.type === "video" && (
        <video
          src={message.url}
          poster={message.thumbnail}
          controls
          style={{ width: "100%", borderRadius: 10 }}
        />
      )}

      {message.type === "audio" && (
        <div
          style={{ display: "flex", alignItems: "center", gap: 8, padding: 8 }}
        >
          <span style={{ fontSize: 20 }}>🎵</span>
          <audio src={message.url} controls style={{ flex: 1, height: 36 }} />
        </div>
      )}

      {message.type === "document" && (
        <a
          href={message.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 12px",
            borderRadius: 10,
            border: "1px solid #e0e0e0",
            textDecoration: "none",
            color: "inherit",
          }}
        >
          <span style={{ fontSize: 28, flexShrink: 0 }}>📄</span>
          <div style={{ overflow: "hidden" }}>
            <div
              style={{
                fontWeight: 600,
                fontSize: 13,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {message.fileName ?? "Document"}
            </div>
            <div style={{ fontSize: 11, opacity: 0.6 }}>
              {formatFileSize(message.fileSize)} · Click to download
            </div>
          </div>
        </a>
      )}

      {message.type === "link" && (
        <a
          href={message.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 12px",
            borderRadius: 10,
            border: "1px solid #e0e0e0",
            textDecoration: "none",
            color: "#0084ff",
            wordBreak: "break-all",
            fontSize: 13,
          }}
        >
          🔗 {message.url}
        </a>
      )}
    </div>
  );
};
