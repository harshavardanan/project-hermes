import React from "react";

export interface EmptyStateIndicatorProps {
  /** The type of list that is empty */
  listType?: "message" | "room" | "thread" | "search";
  /** Custom text to display */
  text?: string;
  /** Additional class name */
  className?: string;
}

const DEFAULT_TEXTS: Record<string, string> = {
  message: "No messages yet. Say hello! 👋",
  room: "No conversations yet.",
  thread: "No replies yet.",
  search: "No results found.",
};

/**
 * Shown when a list (messages, rooms, threads, search results) is empty.
 *
 * @example
 * ```tsx
 * <EmptyStateIndicator listType="message" />
 * ```
 */
export const EmptyStateIndicator: React.FC<EmptyStateIndicatorProps> = ({
  listType = "message",
  text,
  className = "",
}) => (
  <div
    className={`hermes-empty-state ${className}`}
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      padding: 32,
      textAlign: "center",
      opacity: 0.5,
      flex: 1,
    }}
  >
    <span style={{ fontSize: 36 }}>
      {listType === "message"
        ? "💬"
        : listType === "room"
          ? "📭"
          : listType === "thread"
            ? "🧵"
            : "🔍"}
    </span>
    <span style={{ fontSize: 14 }}>{text || DEFAULT_TEXTS[listType]}</span>
  </div>
);
