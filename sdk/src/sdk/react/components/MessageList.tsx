import React, { useEffect, useRef, useState } from "react";
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
  className?: string;
  autoScroll?: boolean;
  // Typing indicator
  typingUsers?: { userId: string; displayName: string }[];
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

// ── Cool underrated emoji set ─────────────────────────────────────────────────
const REACTION_EMOJIS = [
  "🫠",
  "🥹",
  "🫡",
  "🤌",
  "🫶",
  "💀",
  "🔥",
  "✨",
  "🫣",
  "😮‍💨",
  "🪄",
  "🥲",
  "💅",
  "🫦",
  "🤯",
  "🌚",
  "👁️",
  "🫀",
  "🦋",
  "🪐",
];

// ── Emoji Picker ──────────────────────────────────────────────────────────────
const EmojiPicker: React.FC<{
  onPick: (emoji: string) => void;
  onClose: () => void;
  isOwn: boolean;
}> = ({ onPick, onClose, isOwn }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <div
      ref={ref}
      style={{
        position: "absolute",
        bottom: "calc(100% + 8px)",
        [isOwn ? "right" : "left"]: 0,
        zIndex: 100,
        background: "#1a1a2e",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 14,
        padding: "8px 10px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        display: "grid",
        gridTemplateColumns: "repeat(5, 1fr)",
        gap: 4,
        animation: "hermes-pop 0.15s ease",
      }}
    >
      {REACTION_EMOJIS.map((emoji) => (
        <button
          key={emoji}
          onClick={() => {
            onPick(emoji);
            onClose();
          }}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: 20,
            padding: "4px",
            borderRadius: 8,
            lineHeight: 1,
            transition: "transform 0.1s, background 0.1s",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform =
              "scale(1.3)";
            (e.currentTarget as HTMLButtonElement).style.background =
              "rgba(255,255,255,0.08)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
            (e.currentTarget as HTMLButtonElement).style.background = "none";
          }}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
};

// ── Typing Indicator ──────────────────────────────────────────────────────────
const TypingIndicator: React.FC<{
  typingUsers: { userId: string; displayName: string }[];
}> = ({ typingUsers }) => {
  if (!typingUsers.length) return null;

  const text =
    typingUsers.length === 1
      ? `${typingUsers[0].displayName} is typing`
      : typingUsers.length === 2
        ? `${typingUsers[0].displayName} and ${typingUsers[1].displayName} are typing`
        : `${typingUsers[0].displayName} and ${typingUsers.length - 1} others are typing`;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 16px 2px",
        minHeight: 28,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 3,
          background: "#f0f0f0",
          borderRadius: 12,
          padding: "6px 10px",
        }}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#999",
              display: "block",
              animation: `hermes-bounce 1.2s ease-in-out ${i * 0.18}s infinite`,
            }}
          />
        ))}
      </div>
      <span style={{ fontSize: 11, color: "#999" }}>{text}</span>
    </div>
  );
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
  const [hovered, setHovered] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  if (message.isDeleted) {
    return (
      <div
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

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
      }}
      style={{
        display: "flex",
        flexDirection: isOwn ? "row-reverse" : "row",
        alignItems: "flex-end",
        gap: 8,
        marginBottom: 4,
        position: "relative",
      }}
    >
      {/* Avatar */}
      {!isOwn && (
        <div style={{ flexShrink: 0 }}>
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

      {/* Bubble + actions + reactions stacked */}
      <div
        style={{
          maxWidth: "70%",
          display: "flex",
          flexDirection: "column",
          alignItems: isOwn ? "flex-end" : "flex-start",
        }}
      >
        {/* Action bar — shows on hover */}
        {(onEdit || onDelete || onReact || onReply) && (
          <div
            style={{
              display: "flex",
              flexDirection: isOwn ? "row-reverse" : "row",
              gap: 2,
              marginBottom: 4,
              opacity: hovered ? 1 : 0,
              pointerEvents: hovered ? "auto" : "none",
              transition: "opacity 0.15s ease",
              position: "relative",
            }}
          >
            {/* Emoji picker trigger */}
            {onReact && (
              <div style={{ position: "relative" }}>
                <ActionBtn
                  onClick={() => setPickerOpen((p) => !p)}
                  title="React"
                >
                  🫠
                </ActionBtn>
                {pickerOpen && (
                  <EmojiPicker
                    isOwn={isOwn}
                    onPick={(emoji) => onReact(message._id, emoji)}
                    onClose={() => setPickerOpen(false)}
                  />
                )}
              </div>
            )}
            {onReply && (
              <ActionBtn onClick={() => onReply(message)} title="Reply">
                ↩
              </ActionBtn>
            )}
            {isOwn && onEdit && message.type === "text" && (
              <ActionBtn
                onClick={() => {
                  const text = window.prompt("Edit message:", message.text);
                  if (text) onEdit(message._id, text);
                }}
                title="Edit"
              >
                ✏️
              </ActionBtn>
            )}
            {isOwn && onDelete && (
              <ActionBtn onClick={() => onDelete(message._id)} title="Delete">
                🗑
              </ActionBtn>
            )}
          </div>
        )}

        {/* Bubble */}
        <div
          style={{
            padding: "8px 12px",
            borderRadius: isOwn ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
            background: isOwn ? "#0084ff" : "#f0f0f0",
            color: isOwn ? "#fff" : "#000",
          }}
        >
          {/* Reply preview */}
          {message.replyTo && (
            <div
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
          {message.type === "link" && (
            <div>
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
            <img
              src={message.url}
              alt={message.fileName || "image"}
              style={{ maxWidth: "100%", borderRadius: 8, display: "block" }}
            />
          )}
          {message.type === "video" && (
            <video
              src={message.url}
              controls
              style={{ maxWidth: "100%", borderRadius: 8 }}
            />
          )}
          {message.type === "audio" && (
            <audio src={message.url} controls style={{ width: "100%" }} />
          )}
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
            style={{
              fontSize: 10,
              opacity: 0.6,
              textAlign: "right",
              marginTop: 4,
            }}
          >
            {formatTime(message.createdAt)}
          </div>
        </div>

        {/* Reaction pills */}
        {message.reactions?.filter((r: Reaction) => r.users.length > 0).length >
          0 && (
          <div
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
                    border: "1px solid rgba(0,0,0,0.08)",
                    borderRadius: 20,
                    padding: "2px 8px",
                    fontSize: 13,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    transition: "transform 0.1s",
                    userSelect: "none",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.transform = "scale(1.1)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.transform = "scale(1)")
                  }
                >
                  {r.emoji}
                  <span
                    style={{ fontSize: 11, fontWeight: 600, color: "#555" }}
                  >
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

// ── Small action button ───────────────────────────────────────────────────────
const ActionBtn: React.FC<{
  onClick: () => void;
  title?: string;
  children: React.ReactNode;
}> = ({ onClick, title, children }) => (
  <button
    onClick={onClick}
    title={title}
    style={{
      background: "#fff",
      border: "1px solid rgba(0,0,0,0.1)",
      borderRadius: 8,
      cursor: "pointer",
      fontSize: 14,
      padding: "3px 6px",
      lineHeight: 1,
      boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
      transition: "transform 0.1s",
    }}
    onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.15)")}
    onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
  >
    {children}
  </button>
);

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
  className = "",
  autoScroll = true,
  typingUsers = [],
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, autoScroll]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !onLoadMore) return;
    const onScroll = () => {
      if (container.scrollTop === 0 && hasMore && !loadingMore) onLoadMore();
    };
    container.addEventListener("scroll", onScroll);
    return () => container.removeEventListener("scroll", onScroll);
  }, [hasMore, loadingMore, onLoadMore]);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
        }}
      >
        Loading messages...
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes hermes-bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40%            { transform: translateY(-5px); }
        }
        @keyframes hermes-pop {
          from { opacity: 0; transform: scale(0.85); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>

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

        {messages.length === 0 && (
          <div
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
            <div key={message._id} style={{ marginBottom: 8 }}>
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

        {/* Typing indicator — lives at the bottom of the list */}
        <TypingIndicator typingUsers={typingUsers} />

        <div ref={bottomRef} />
      </div>
    </>
  );
};
