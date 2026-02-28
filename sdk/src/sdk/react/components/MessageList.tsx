import React, { useEffect, useRef } from "react";
import type { Message, HermesUser, Reaction } from "../../types/index";

// ── Types ─────────────────────────────────────────────────────────────────────

interface MessageListProps {
  messages: Message[];
  currentUser: HermesUser;
  loading?: boolean;
  loadingMore?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  onEdit?: (messageId: string, text: string) => void;
  onDelete?: (messageId: string) => void;
  onReact?: (messageId: string, emoji: string) => void;
  onReply?: (message: Message) => void;
  renderMessage?: (message: Message, isOwn: boolean) => React.ReactNode;
  renderAvatar?: (senderId: string) => React.ReactNode;
  renderDeleted?: () => React.ReactNode;
  className?: string;
  messageClassName?: string;
  autoScroll?: boolean;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const formatFileSize = (bytes?: number) => {
  if (!bytes) return "";
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${bytes} B`;
};

// ── Default message renderer ──────────────────────────────────────────────────

const DefaultMessage: React.FC<{
  message: Message;
  isOwn: boolean;
  onEdit?: (messageId: string, text: string) => void;
  onDelete?: (messageId: string) => void;
  onReact?: (messageId: string, emoji: string) => void;
  onReply?: (message: Message) => void;
  renderAvatar?: (senderId: string) => React.ReactNode;
}> = ({ message, isOwn, onEdit, onDelete, onReact, onReply, renderAvatar }) => {
  if (message.isDeleted) {
    return (
      <div
        className="hermes-message hermes-message--deleted"
        data-own={isOwn}
        style={{ opacity: 0.5, fontStyle: "italic" }}
      >
        This message was deleted.
      </div>
    );
  }

  return (
    <div
      className={`hermes-message ${isOwn ? "hermes-message--own" : "hermes-message--other"}`}
      data-own={isOwn}
      style={{
        display: "flex",
        flexDirection: isOwn ? "row-reverse" : "row",
        alignItems: "flex-end",
        gap: "8px",
        marginBottom: "4px",
      }}
    >
      {/* Avatar */}
      {!isOwn && (
        <div className="hermes-message__avatar" style={{ flexShrink: 0 }}>
          {renderAvatar ? (
            renderAvatar(message.senderId)
          ) : (
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "#e0e0e0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              {message.senderId.slice(-2).toUpperCase()}
            </div>
          )}
        </div>
      )}

      {/* Bubble */}
      <div
        className="hermes-message__bubble"
        style={{
          maxWidth: "70%",
          padding: "8px 12px",
          borderRadius: isOwn ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
          background: isOwn ? "#0084ff" : "#f0f0f0",
          color: isOwn ? "#fff" : "#000",
          position: "relative",
        }}
      >
        {/* Reply preview */}
        {message.replyTo && (
          <div
            className="hermes-message__reply-preview"
            style={{
              borderLeft: "3px solid rgba(255,255,255,0.4)",
              paddingLeft: 8,
              marginBottom: 6,
              fontSize: 12,
              opacity: 0.75,
            }}
          >
            Replying to a message
          </div>
        )}

        {/* Content by type */}
        {message.type === "text" && (
          <p
            className="hermes-message__text"
            style={{ margin: 0, wordBreak: "break-word" }}
          >
            {message.text}
            {message.editedAt && (
              <span style={{ fontSize: 10, opacity: 0.6, marginLeft: 6 }}>
                (edited)
              </span>
            )}
          </p>
        )}

        {message.type === "link" && (
          <div className="hermes-message__link">
            {message.text && (
              <p style={{ margin: "0 0 4px" }}>{message.text}</p>
            )}
            <a
              href={message.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: isOwn ? "#cce4ff" : "#0084ff",
                wordBreak: "break-all",
              }}
            >
              {message.url}
            </a>
          </div>
        )}

        {message.type === "image" && (
          <div className="hermes-message__image">
            <img
              src={message.url}
              alt={message.fileName || "image"}
              style={{ maxWidth: "100%", borderRadius: 8, display: "block" }}
            />
          </div>
        )}

        {message.type === "video" && (
          <div className="hermes-message__video">
            <video
              src={message.url}
              controls
              style={{ maxWidth: "100%", borderRadius: 8 }}
            />
          </div>
        )}

        {message.type === "audio" && (
          <div className="hermes-message__audio">
            <audio src={message.url} controls style={{ width: "100%" }} />
          </div>
        )}

        {message.type === "document" && (
          <a
            className="hermes-message__document"
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
              <div style={{ fontWeight: 600, fontSize: 13 }}>
                {message.fileName}
              </div>
              <div style={{ fontSize: 11, opacity: 0.7 }}>
                {formatFileSize(message.fileSize)}
              </div>
            </div>
          </a>
        )}

        {/* Timestamp */}
        <div
          className="hermes-message__time"
          style={{
            fontSize: 10,
            opacity: 0.6,
            textAlign: "right",
            marginTop: 4,
          }}
        >
          {formatTime(message.createdAt)}
        </div>

        {/* Actions */}
        {(onEdit || onDelete || onReact || onReply) && (
          <div
            className="hermes-message__actions"
            style={{
              display: "none",
              position: "absolute",
              top: -28,
              right: isOwn ? 0 : "auto",
              left: isOwn ? "auto" : 0,
              background: "#fff",
              borderRadius: 8,
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              padding: "4px 6px",
              gap: 4,
              flexDirection: "row",
            }}
          >
            {onReply && (
              <button onClick={() => onReply(message)} style={actionBtnStyle}>
                ↩
              </button>
            )}
            {onReact && (
              <button
                onClick={() => onReact(message._id, "👍")}
                style={actionBtnStyle}
              >
                👍
              </button>
            )}
            {isOwn && onEdit && message.type === "text" && (
              <button
                onClick={() => {
                  const text = window.prompt("Edit message:", message.text);
                  if (text) onEdit(message._id, text);
                }}
                style={actionBtnStyle}
              >
                ✏️
              </button>
            )}
            {isOwn && onDelete && (
              <button
                onClick={() => onDelete(message._id)}
                style={actionBtnStyle}
              >
                🗑
              </button>
            )}
          </div>
        )}
      </div>

      {/* Reactions */}
      {message.reactions?.length > 0 && (
        <div
          className="hermes-message__reactions"
          style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 4 }}
        >
          {message.reactions
            .filter((r: Reaction) => r.users.length > 0)
            .map((r: Reaction) => (
              <span
                key={r.emoji}
                onClick={() => onReact?.(message._id, r.emoji)}
                style={{
                  background: "#f0f0f0",
                  borderRadius: 12,
                  padding: "2px 6px",
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                {r.emoji} {r.users.length}
              </span>
            ))}
        </div>
      )}
    </div>
  );
};

const actionBtnStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  cursor: "pointer",
  fontSize: 14,
  padding: "2px 4px",
};

// ── MessageList ───────────────────────────────────────────────────────────────

export const MessageList: React.FC<MessageListProps> = ({
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
  renderDeleted,
  className = "",
  autoScroll = true,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom on new messages
  useEffect(() => {
    if (autoScroll && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, autoScroll]);

  // Infinite scroll trigger
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !onLoadMore) return;

    const onScroll = () => {
      if (container.scrollTop === 0 && hasMore && !loadingMore) {
        onLoadMore();
      }
    };

    container.addEventListener("scroll", onScroll);
    return () => container.removeEventListener("scroll", onScroll);
  }, [hasMore, loadingMore, onLoadMore]);

  if (loading) {
    return (
      <div
        className={`hermes-message-list hermes-message-list--loading ${className}`}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
        }}
      >
        <div className="hermes-spinner">Loading messages...</div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`hermes-message-list ${className}`}
      style={{
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        padding: "16px",
      }}
    >
      {/* Load more */}
      {hasMore && (
        <div style={{ textAlign: "center", marginBottom: 12 }}>
          {loadingMore ? (
            <span style={{ fontSize: 12, opacity: 0.5 }}>
              Loading older messages...
            </span>
          ) : (
            <button
              onClick={onLoadMore}
              className="hermes-load-more"
              style={{
                background: "none",
                border: "1px solid #ddd",
                borderRadius: 12,
                padding: "4px 12px",
                cursor: "pointer",
                fontSize: 12,
              }}
            >
              Load older messages
            </button>
          )}
        </div>
      )}

      {/* Messages */}
      {messages.length === 0 && (
        <div
          className="hermes-message-list__empty"
          style={{
            textAlign: "center",
            opacity: 0.4,
            margin: "auto",
            fontSize: 14,
          }}
        >
          No messages yet. Say hello! 👋
        </div>
      )}

      {messages.map((message) => {
        const isOwn = message.senderId === currentUser.userId;
        return (
          <div key={message._id} className="hermes-message-list__item">
            {renderMessage ? (
              renderMessage(message, isOwn)
            ) : (
              <DefaultMessage
                message={message}
                isOwn={isOwn}
                onEdit={onEdit}
                onDelete={onDelete}
                onReact={onReact}
                onReply={onReply}
                renderAvatar={renderAvatar}
              />
            )}
          </div>
        );
      })}

      <div ref={bottomRef} />
    </div>
  );
};
