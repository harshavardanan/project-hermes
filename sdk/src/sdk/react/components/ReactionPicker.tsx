import React, { useState, useRef, useEffect } from "react";
import type { Reaction } from "../../types/index";
import EmojiPicker, { Theme, type EmojiClickData } from "emoji-picker-react";

interface ReactionPickerProps {
  onSelect: (emoji: string) => void;
  currentReactions?: Reaction[];
  currentUserId?: string;
  emojis?: string[];
  className?: string;
  align?: "left" | "right";
}

const DEFAULT_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🔥", "🎉", "👏"];

export const ReactionPicker: React.FC<ReactionPickerProps> = ({
  onSelect,
  currentReactions = [],
  currentUserId,
  emojis = DEFAULT_EMOJIS,
  className = "",
  align = "left",
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Check if current user reacted
  const hasReacted = (emoji: string) => {
    if (!currentUserId) return false;

    return (
      currentReactions
        .find((r) => r.emoji === emoji)
        ?.users.includes(currentUserId) ?? false
    );
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    onSelect(emojiData.emoji);
    setShowPicker(false);
  };

  // Close picker when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (!containerRef.current) return;

      const target = e.target as Node;

      if (!containerRef.current.contains(target)) {
        setShowPicker(false);
      }
    };

    if (showPicker) {
      window.addEventListener("click", handleOutsideClick);
    }

    return () => window.removeEventListener("click", handleOutsideClick);
  }, [showPicker]);

  return (
    <div
      ref={containerRef}
      style={{ position: "relative", display: "inline-block" }}
      className={className}
    >
      {/* Quick reaction bar */}
      <div
        style={{
          display: "flex",
          gap: 4,
          flexWrap: "wrap",
          padding: "6px 8px",
          background: "#111",
          borderRadius: 12,
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        {emojis.map((emoji) => (
          <button
            key={emoji}
            onClick={() => onSelect(emoji)}
            style={{
              background: hasReacted(emoji)
                ? "rgba(57,255,20,0.12)"
                : "transparent",
              border: hasReacted(emoji)
                ? "1px solid rgba(57,255,20,0.35)"
                : "1px solid transparent",
              borderRadius: 8,
              padding: "4px 6px",
              cursor: "pointer",
              fontSize: 18,
              lineHeight: 1,
              transition: "transform 0.12s ease",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "scale(1.2)")
            }
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            {emoji}
          </button>
        ))}

        {/* Open emoji picker */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowPicker((v) => !v);
          }}
          style={{
            borderRadius: 8,
            padding: "4px 6px",
            cursor: "pointer",
            fontSize: 18,
            border: "1px solid transparent",
            background: "transparent",
          }}
        >
          ➕
        </button>
      </div>

      {/* Emoji Picker Popup */}
      {showPicker && (
        <div
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "absolute",
            bottom: "calc(100% + 6px)",
            [align === "right" ? "right" : "left"]: 0,
            zIndex: 50,
            animation: "hermes-pop 0.15s ease",
          }}
        >
          <EmojiPicker
            theme={Theme.DARK}
            onEmojiClick={handleEmojiClick}
            height={440}
            width={360}
            searchPlaceHolder="Search emoji..."
            lazyLoadEmojis
          />
        </div>
      )}

      {/* Hermes popup animation */}
      <style>{`
        @keyframes hermes-pop {
          from {
            opacity: 0;
            transform: scale(0.85);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};
