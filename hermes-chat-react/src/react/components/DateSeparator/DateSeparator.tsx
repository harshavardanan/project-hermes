import React from "react";

export interface DateSeparatorProps {
  /** The date to display */
  date: Date;
  /** Custom date formatter */
  formatDate?: (date: Date) => string;
  /** Additional class name */
  className?: string;
}

const defaultFormat = (date: Date): string => {
  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  if (isToday) return "Today";
  if (isYesterday) return "Yesterday";

  return date.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

/**
 * Renders a date divider between message groups from different days.
 *
 * @example
 * ```tsx
 * <DateSeparator date={new Date("2024-01-15")} />
 * ```
 */
export const DateSeparator: React.FC<DateSeparatorProps> = ({
  date,
  formatDate = defaultFormat,
  className = "",
}) => (
  <div
    className={`hermes-date-separator ${className}`}
    style={{
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "16px 0",
    }}
  >
    <div
      style={{ flex: 1, height: 1, background: "rgba(128,128,128,0.2)" }}
    />
    <span
      style={{
        fontSize: 12,
        fontWeight: 600,
        color: "rgba(128,128,128,0.7)",
        whiteSpace: "nowrap",
        userSelect: "none",
      }}
    >
      {formatDate(date)}
    </span>
    <div
      style={{ flex: 1, height: 1, background: "rgba(128,128,128,0.2)" }}
    />
  </div>
);
