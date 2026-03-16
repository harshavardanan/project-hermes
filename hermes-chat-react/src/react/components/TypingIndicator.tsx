import React from "react";

interface TypingIndicatorProps {
  typingText: string | null;
  className?: string;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  typingText,
  className = "",
}) => {
  if (!typingText) return null;

  return (
    <div
      className={`hermes-typing-indicator ${className}`}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "4px 16px",
        minHeight: 24,
      }}
    >
      <div style={{ display: "flex", gap: 3 }}>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#aaa",
              display: "block",
              animation: `hermes-bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>
      <span style={{ fontSize: 12, opacity: 0.6 }}>{typingText}</span>
      <style>{`
        @keyframes hermes-bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-4px); }
        }
      `}</style>
    </div>
  );
};
