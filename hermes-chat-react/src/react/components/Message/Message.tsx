import React, { useState, useRef, useEffect } from "react";
import type { Message as MessageType, Reaction } from "../../../types/index";
import { Avatar } from "../Avatar/Avatar";
import { MessageStatus } from "./MessageStatus";
import { MessageActions } from "./MessageActions";

export interface MessageProps {
  message: MessageType;
  isOwn: boolean;
  /** Callbacks (optional — will fall back to context if available) */
  onEdit?: (messageId: string, text: string) => void;
  onDelete?: (messageId: string) => void;
  onReact?: (messageId: string, emoji: string) => void;
  onReply?: (message: MessageType) => void;
  onOpenThread?: (message: MessageType) => void;
  onPin?: (message: MessageType) => void;
  /** Avatar customization */
  renderAvatar?: (senderId: string) => React.ReactNode;
  /** Sender display name (for avatar fallback) */
  senderName?: string;
  /** Sender avatar URL */
  senderImage?: string;
  /** Group style for visual grouping */
  groupStyle?: "top" | "middle" | "bottom" | "single";
  /** Additional class name */
  className?: string;
  /** Whether to show the avatar */
  showAvatar?: boolean;
}

const REACTION_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🔥", "🎉", "👏"];

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const formatFileSize = (bytes?: number) => {
  if (!bytes) return "";
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${bytes} B`;
};

/**
 * A single message bubble with avatar, content, reactions, delivery status,
 * and action toolbar. This is the primary message rendering component.
 *
 * Can be used standalone or within a `<MessageList>`.
 */
export const Message: React.FC<MessageProps> = ({
  message,
  isOwn,
  onEdit,
  onDelete,
  onReact,
  onReply,
  onOpenThread,
  onPin,
  renderAvatar,
  senderName,
  senderImage,
  groupStyle = "single",
  className = "",
  showAvatar = true,
}) => {
  const [hovered, setHovered] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!pickerOpen) return;
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setPickerOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [pickerOpen]);

  if (message.isDeleted) {
    return (
      <div
        className={`hermes-message hermes-message--deleted ${className}`}
        style={{
          opacity: 0.5,
          fontStyle: "italic",
          padding: "4px 16px",
          fontSize: 13,
        }}
      >
        This message was deleted.
      </div>
    );
  }

  const showAvatarSlot = showAvatar && !isOwn && (groupStyle === "bottom" || groupStyle === "single");

  return (
    <div
      className={`hermes-message ${isOwn ? "hermes-message--own" : "hermes-message--other"} ${className}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        flexDirection: isOwn ? "row-reverse" : "row",
        alignItems: "flex-end",
        gap: 8,
        marginBottom: groupStyle === "bottom" || groupStyle === "single" ? 8 : 2,
        position: "relative",
      }}
    >
      {/* Avatar */}
      {!isOwn && (
        <div style={{ flexShrink: 0, width: 32 }}>
          {showAvatarSlot ? (
            renderAvatar ? (
              renderAvatar(message.senderId)
            ) : (
              <Avatar image={senderImage} name={senderName || message.senderId} size={32} />
            )
          ) : null}
        </div>
      )}

      {/* Content column */}
      <div
        style={{
          maxWidth: "70%",
          display: "flex",
          flexDirection: "column",
          alignItems: isOwn ? "flex-end" : "flex-start",
        }}
      >
        {/* Actions toolbar */}
        {(onEdit || onDelete || onReact || onReply || onOpenThread) && (
          <div
            style={{
              marginBottom: 4,
              opacity: hovered ? 1 : 0,
              pointerEvents: hovered ? "auto" : "none",
              transition: "opacity 0.15s ease",
              position: "relative",
            }}
          >
            <MessageActions
              isOwn={isOwn}
              isText={message.type === "text"}
              hasThread={!!message.replyCount && message.replyCount > 0}
              replyCount={message.replyCount}
              onReact={onReact ? () => setPickerOpen((p) => !p) : undefined}
              onReply={onReply ? () => onReply(message) : undefined}
              onThread={onOpenThread ? () => onOpenThread(message) : undefined}
              onEdit={
                onEdit
                  ? () => {
                      const text = window.prompt("Edit message:", message.text);
                      if (text) onEdit(message._id, text);
                    }
                  : undefined
              }
              onDelete={onDelete ? () => onDelete(message._id) : undefined}
              onPin={onPin ? () => onPin(message) : undefined}
            />

            {/* Inline reaction picker */}
            {pickerOpen && onReact && (
              <div
                ref={pickerRef}
                style={{
                  position: "absolute",
                  bottom: "calc(100% + 4px)",
                  [isOwn ? "right" : "left"]: 0,
                  zIndex: 100,
                  background: "#1a1a2e",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 14,
                  padding: "8px 10px",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                  display: "flex",
                  gap: 4,
                  animation: "hermes-pop 0.15s ease",
                }}
              >
                {REACTION_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => {
                      onReact(message._id, emoji);
                      setPickerOpen(false);
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: 20,
                      padding: "4px",
                      borderRadius: 8,
                      lineHeight: 1,
                      transition: "transform 0.1s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.transform = "scale(1.3)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.transform = "scale(1)")
                    }
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Sender name */}
        {!isOwn && (groupStyle === "top" || groupStyle === "single") && senderName && (
          <span style={{ fontSize: 11, fontWeight: 600, opacity: 0.6, marginBottom: 2, marginLeft: 4 }}>
            {senderName}
          </span>
        )}

        {/* Message bubble */}
        <div
          style={{
            padding: "8px 12px",
            borderRadius:
              isOwn
                ? groupStyle === "top" || groupStyle === "single"
                  ? "16px 16px 4px 16px"
                  : "16px 4px 4px 16px"
                : groupStyle === "top" || groupStyle === "single"
                  ? "16px 16px 16px 4px"
                  : "4px 16px 16px 4px",
            background: isOwn ? "#0084ff" : "#f0f0f0",
            color: isOwn ? "#fff" : "#000",
          }}
        >
          {/* Reply quote */}
          {message.replyTo && (
            <div
              style={{
                borderLeft: `3px solid ${isOwn ? "rgba(255,255,255,0.4)" : "rgba(0,132,255,0.4)"}`,
                paddingLeft: 8,
                marginBottom: 6,
                fontSize: 12,
                opacity: 0.75,
              }}
            >
              Replying to a message
            </div>
          )}

          {/* Text content */}
          {message.type === "text" && (
            <p style={{ margin: 0, wordBreak: "break-word" }}>
              {message.text}
              {message.editedAt && (
                <span style={{ fontSize: 10, opacity: 0.6, marginLeft: 6 }}>
                  (edited)
                </span>
              )}
            </p>
          )}

          {/* Link */}
          {message.type === "link" && (
            <div>
              {message.text && <p style={{ margin: "0 0 4px" }}>{message.text}</p>}
              <a
                href={message.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: isOwn ? "#cce4ff" : "#0084ff", wordBreak: "break-all" }}
              >
                {message.url}
              </a>
            </div>
          )}

          {/* Image */}
          {message.type === "image" && (
            <img
              src={message.url}
              alt={message.fileName || "image"}
              style={{ maxWidth: "100%", borderRadius: 8, display: "block" }}
            />
          )}

          {/* Video */}
          {message.type === "video" && (
            <video
              src={message.url}
              poster={message.thumbnail}
              controls
              style={{ maxWidth: "100%", borderRadius: 8 }}
            />
          )}

          {/* Audio */}
          {message.type === "audio" && (
            <audio src={message.url} controls style={{ width: "100%" }} />
          )}

          {/* Document */}
          {message.type === "document" && (
            <a
              href={message.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                color: isOwn ? "#fff" : "#333",
                textDecoration: "none",
              }}
            >
              <span style={{ fontSize: 24 }}>📄</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{message.fileName}</div>
                <div style={{ fontSize: 11, opacity: 0.7 }}>
                  {formatFileSize(message.fileSize)}
                </div>
              </div>
            </a>
          )}

          {/* Timestamp + delivery status */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: 4,
              fontSize: 10,
              opacity: 0.6,
              marginTop: 4,
            }}
          >
            {formatTime(message.createdAt)}
            {message.pinnedAt && <span title="Pinned">📌</span>}
            {isOwn && (
              <MessageStatus
                status={message.deliveryStatus}
                seenCount={message.seenBy?.length || 0}
                isMyMessage={isOwn}
              />
            )}
          </div>
        </div>

        {/* Thread reply count */}
        {message.replyCount && message.replyCount > 0 && onOpenThread && (
          <button
            onClick={() => onOpenThread(message)}
            style={{
              background: "none",
              border: "none",
              color: "#0084ff",
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 600,
              padding: "2px 4px",
              marginTop: 2,
            }}
          >
            {message.replyCount} {message.replyCount === 1 ? "reply" : "replies"}
          </button>
        )}

        {/* Reactions */}
        {message.reactions?.filter((r: Reaction) => r.users.length > 0).length > 0 && (
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 4 }}>
            {message.reactions
              .filter((r: Reaction) => r.users.length > 0)
              .map((r: Reaction) => (
                <span
                  key={r.emoji}
                  onClick={() => onReact?.(message._id, r.emoji)}
                  style={{
                    background: "#f0f0f0",
                    border: "1px solid rgba(0,0,0,0.08)",
                    borderRadius: 20,
                    padding: "2px 8px",
                    fontSize: 13,
                    cursor: onReact ? "pointer" : "default",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    transition: "transform 0.1s",
                    userSelect: "none",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                >
                  {r.emoji}
                  <span style={{ fontSize: 11, fontWeight: 600, color: "#555" }}>
                    {r.users.length}
                  </span>
                </span>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};
