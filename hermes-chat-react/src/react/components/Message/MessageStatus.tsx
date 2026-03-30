import React from "react";
import type { DeliveryStatus } from "../../../types/index";

export interface MessageStatusProps {
  /** The delivery status of the message */
  status: DeliveryStatus;
  /** Number of users who have seen the message */
  seenCount?: number;
  /** Whether this message was sent by the current user */
  isMyMessage?: boolean;
  /** Additional class name */
  className?: string;
}

/**
 * Renders delivery status indicators: ✓ (sent), ✓✓ (delivered), ✓✓ blue (seen).
 * Only shown for the current user's own messages.
 */
export const MessageStatus: React.FC<MessageStatusProps> = ({
  status,
  seenCount = 0,
  isMyMessage = true,
  className = "",
}) => {
  if (!isMyMessage) return null;

  const color = status === "seen" ? "#0084ff" : "rgba(128,128,128,0.6)";
  const checks = status === "sent" ? "✓" : "✓✓";

  return (
    <span
      className={`hermes-message-status ${className}`}
      title={
        status === "seen"
          ? `Seen by ${seenCount} ${seenCount === 1 ? "person" : "people"}`
          : status === "delivered"
            ? "Delivered"
            : "Sent"
      }
      style={{
        fontSize: 11,
        color,
        marginLeft: 4,
        userSelect: "none",
      }}
    >
      {checks}
    </span>
  );
};
