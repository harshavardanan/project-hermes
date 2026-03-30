import React from "react";

export interface AvatarProps {
  /** Image URL */
  image?: string;
  /** User's display name (used for fallback initials) */
  name?: string;
  /** Size in pixels */
  size?: number;
  /** Shape of the avatar */
  shape?: "circle" | "square" | "rounded";
  /** Additional class name */
  className?: string;
  /** Whether the user is online */
  online?: boolean;
}

const getInitials = (name?: string): string => {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase();
};

/**
 * Displays a user avatar with fallback initials and optional online indicator.
 *
 * @example
 * ```tsx
 * <Avatar image={user.avatar} name={user.displayName} size={40} online />
 * ```
 */
export const Avatar: React.FC<AvatarProps> = ({
  image,
  name,
  size = 36,
  shape = "circle",
  className = "",
  online,
}) => {
  const borderRadius =
    shape === "circle" ? "50%" : shape === "rounded" ? "8px" : "0";

  return (
    <div
      className={`hermes-avatar ${className}`}
      style={{
        position: "relative",
        width: size,
        height: size,
        flexShrink: 0,
      }}
    >
      {image ? (
        <img
          src={image}
          alt={name || "avatar"}
          style={{
            width: size,
            height: size,
            borderRadius,
            objectFit: "cover",
            display: "block",
          }}
        />
      ) : (
        <div
          style={{
            width: size,
            height: size,
            borderRadius,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontWeight: 700,
            fontSize: size * 0.38,
            userSelect: "none",
          }}
        >
          {getInitials(name)}
        </div>
      )}
      {online !== undefined && (
        <span
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            width: size * 0.3,
            height: size * 0.3,
            borderRadius: "50%",
            background: online ? "#22c55e" : "#9ca3af",
            border: "2px solid #fff",
          }}
        />
      )}
    </div>
  );
};
