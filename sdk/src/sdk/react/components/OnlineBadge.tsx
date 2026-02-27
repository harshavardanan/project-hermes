import React from "react";

interface OnlineBadgeProps {
  isOnline: boolean;
  size?: number;
  className?: string;
}

export const OnlineBadge: React.FC<OnlineBadgeProps> = ({
  isOnline,
  size = 10,
  className = "",
}) => (
  <span
    className={`hermes-online-badge ${isOnline ? "hermes-online-badge--online" : "hermes-online-badge--offline"} ${className}`}
    data-online={isOnline}
    style={{
      display: "inline-block",
      width: size,
      height: size,
      borderRadius: "50%",
      background: isOnline ? "#22c55e" : "#d1d5db",
      boxShadow: isOnline ? "0 0 0 2px #fff" : "none",
      flexShrink: 0,
    }}
  />
);
