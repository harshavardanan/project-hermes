import React from "react";
import type { Message as MessageType } from "../../../types/index";

export interface ThreadHeaderProps {
  /** The parent message of the thread */
  thread: MessageType;
  /** Close the thread panel */
  onClose: () => void;
  /** Additional class name */
  className?: string;
}

/**
 * Header for the thread panel showing parent message preview and close button.
 */
export const ThreadHeader: React.FC<ThreadHeaderProps> = ({
  thread,
  onClose,
  className = "",
}) => (
  <div
    className={`hermes-thread-header ${className}`}
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "12px 16px",
      borderBottom: "1px solid rgba(128,128,128,0.15)",
    }}
  >
    <div style={{ flex: 1, overflow: "hidden" }}>
      <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>
        Thread
      </div>
      <div
        style={{
          fontSize: 12,
          opacity: 0.6,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {thread.type === "text"
          ? thread.text?.slice(0, 80)
          : `[${thread.type}]`}
      </div>
    </div>
    <button
      onClick={onClose}
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        fontSize: 18,
        padding: 4,
        opacity: 0.6,
        lineHeight: 1,
      }}
    >
      ✕
    </button>
  </div>
);
