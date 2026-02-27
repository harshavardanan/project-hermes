import React from "react";
import type { Reaction } from "../../types/index.js";

interface ReactionPickerProps {
  onSelect: (emoji: string) => void;
  currentReactions?: Reaction[];
  currentUserId?: string;
  emojis?: string[];
  className?: string;
}

const DEFAULT_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🔥", "🎉", "👏"];

export const ReactionPicker: React.FC<ReactionPickerProps> = ({
  onSelect,
  currentReactions = [],
  currentUserId,
  emojis = DEFAULT_EMOJIS,
  className = "",
}) => {
  const hasReacted = (emoji: string) => {
    if (!currentUserId) return false;
    return (
      currentReactions
        .find((r) => r.emoji === emoji)
        ?.users.includes(currentUserId) ?? false
    );
  };

  return (
    <div
      className={`hermes-reaction-picker ${className}`}
      style={{
        display: "flex",
        gap: 4,
        flexWrap: "wrap",
        padding: "6px 8px",
        background: "#fff",
        borderRadius: 12,
        boxShadow: "0 2px 12px rgba(0,0,0,0.12)",
      }}
    >
      {emojis.map((emoji) => (
        <button
          key={emoji}
          onClick={() => onSelect(emoji)}
          style={{
            background: hasReacted(emoji) ? "rgba(0,132,255,0.1)" : "none",
            border: hasReacted(emoji)
              ? "1px solid rgba(0,132,255,0.3)"
              : "1px solid transparent",
            borderRadius: 8,
            padding: "4px 6px",
            cursor: "pointer",
            fontSize: 18,
            lineHeight: 1,
            transition: "transform 0.1s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.2)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
};
