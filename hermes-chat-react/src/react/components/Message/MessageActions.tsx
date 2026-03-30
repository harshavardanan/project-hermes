import React, { useState, useRef, useEffect } from "react";

export interface MessageActionsProps {
  /** Whether the current user owns the message */
  isOwn: boolean;
  /** Whether the message is a text message (enables edit) */
  isText: boolean;
  /** Whether the message has a thread */
  hasThread?: boolean;
  /** Reply count for threads */
  replyCount?: number;
  /** Callbacks */
  onReact?: () => void;
  onReply?: () => void;
  onThread?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onPin?: () => void;
  /** Additional class name */
  className?: string;
}

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

/**
 * Hover toolbar for message actions: React, Reply, Thread, Edit, Delete, Pin.
 */
export const MessageActions: React.FC<MessageActionsProps> = ({
  isOwn,
  isText,
  hasThread = false,
  replyCount = 0,
  onReact,
  onReply,
  onThread,
  onEdit,
  onDelete,
  onPin,
  className = "",
}) => (
  <div
    className={`hermes-message-actions ${className}`}
    style={{
      display: "flex",
      flexDirection: isOwn ? "row-reverse" : "row",
      gap: 2,
    }}
  >
    {onReact && (
      <ActionBtn onClick={onReact} title="React">
        😊
      </ActionBtn>
    )}
    {onReply && (
      <ActionBtn onClick={onReply} title="Reply">
        ↩
      </ActionBtn>
    )}
    {onThread && (
      <ActionBtn onClick={onThread} title={`Thread${replyCount > 0 ? ` (${replyCount})` : ""}`}>
        🧵
      </ActionBtn>
    )}
    {isOwn && isText && onEdit && (
      <ActionBtn onClick={onEdit} title="Edit">
        ✏️
      </ActionBtn>
    )}
    {onPin && (
      <ActionBtn onClick={onPin} title="Pin">
        📌
      </ActionBtn>
    )}
    {isOwn && onDelete && (
      <ActionBtn onClick={onDelete} title="Delete">
        🗑
      </ActionBtn>
    )}
  </div>
);
