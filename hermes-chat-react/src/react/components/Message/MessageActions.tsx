import React from "react";

export interface MessageActionsProps {
  isOwn: boolean;
  isText: boolean;
  hasThread?: boolean;
  replyCount?: number;
  onReact?: () => void;
  onReply?: () => void;
  onThread?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onPin?: () => void;
  className?: string;
}

const Icon: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {children}
  </svg>
);

const SmileIcon = () => (
  <Icon>
    <circle cx="12" cy="12" r="10" />
    <path d="M8 14s1.5 2 4 2 4-2 4-2" />
    <line x1="9" y1="9" x2="9.01" y2="9" />
    <line x1="15" y1="9" x2="15.01" y2="9" />
  </Icon>
);

const ReplyIcon = () => (
  <Icon>
    <polyline points="9 17 4 12 9 7" />
    <path d="M20 18v-2a4 4 0 0 0-4-4H4" />
  </Icon>
);

const ThreadIcon = () => (
  <Icon>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </Icon>
);

const EditIcon = () => (
  <Icon>
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4z" />
  </Icon>
);

const PinIcon = () => (
  <Icon>
    <line x1="12" y1="17" x2="12" y2="22" />
    <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24z" />
  </Icon>
);

const TrashIcon = () => (
  <Icon>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </Icon>
);

const ActionBtn: React.FC<{
  onClick: () => void;
  title?: string;
  danger?: boolean;
  children: React.ReactNode;
}> = ({ onClick, title, danger = false, children }) => (
  <button
    onClick={onClick}
    title={title}
    style={{
      background: "transparent",
      border: "none",
      borderRadius: 6,
      cursor: "pointer",
      color: danger ? "#ef4444" : "var(--brand-muted, #71717a)",
      padding: "4px 5px",
      lineHeight: 1,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "color 0.12s, background 0.12s",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.color = danger ? "#f87171" : "var(--brand-text, #fafafa)";
      e.currentTarget.style.background = danger
        ? "rgba(239,68,68,0.12)"
        : "var(--brand-accent, rgba(255,255,255,0.08))";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.color = danger ? "#ef4444" : "var(--brand-muted, #71717a)";
      e.currentTarget.style.background = "transparent";
    }}
  >
    {children}
  </button>
);

/**
 * Hover toolbar for message actions — icon-based, glass-morphism style.
 */
export const MessageActions: React.FC<MessageActionsProps> = ({
  isOwn,
  isText,
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
      display: "inline-flex",
      flexDirection: isOwn ? "row-reverse" : "row",
      gap: 1,
      background: "var(--brand-card, rgba(17,17,19,0.96))",
      border: "1px solid var(--brand-border, rgba(255,255,255,0.08))",
      borderRadius: 10,
      padding: "2px 3px",
      backdropFilter: "blur(12px)",
      boxShadow: "0 4px 20px rgba(0,0,0,0.45), 0 1px 3px rgba(0,0,0,0.2)",
    }}
  >
    {onReact && <ActionBtn onClick={onReact} title="React"><SmileIcon /></ActionBtn>}
    {onReply && <ActionBtn onClick={onReply} title="Reply"><ReplyIcon /></ActionBtn>}
    {onThread && (
      <ActionBtn onClick={onThread} title={`Thread${replyCount > 0 ? ` (${replyCount})` : ""}`}>
        <ThreadIcon />
      </ActionBtn>
    )}
    {isOwn && isText && onEdit && <ActionBtn onClick={onEdit} title="Edit"><EditIcon /></ActionBtn>}
    {onPin && <ActionBtn onClick={onPin} title="Pin"><PinIcon /></ActionBtn>}
    {isOwn && onDelete && <ActionBtn onClick={onDelete} title="Delete" danger><TrashIcon /></ActionBtn>}
  </div>
);
